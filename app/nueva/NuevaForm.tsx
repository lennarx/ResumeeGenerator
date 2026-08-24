"use client";

import { useEffect, useMemo, useState } from "react";
import GeneratedCvBlock from "@/components/GeneratedCvBlock";

type CvOption = { id: string; name: string };
type CvSuggestion = { cvId: string; cvName: string; reason: string };

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const SUGGEST_DEBOUNCE_MS = 800;
const MIN_JOB_TEXT_LENGTH = 40;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function NuevaForm({ cvs }: { cvs: CvOption[] }) {
  const [companyName, setCompanyName] = useState("");
  const [jobText, setJobText] = useState("");
  const [baseCvId, setBaseCvId] = useState(cvs[0]?.id ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<CvSuggestion | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [userTouchedCvSelector, setUserTouchedCvSelector] = useState(false);

  const canSubmit = useMemo(
    () =>
      companyName.trim().length > 0 &&
      baseCvId.length > 0 &&
      (jobText.trim().length > 0 || imageFile !== null),
    [companyName, baseCvId, jobText, imageFile]
  );

  function validateAndSetImage(file: File | null) {
    setImageError(null);
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setImageError("El archivo debe ser una imagen.");
      setImageFile(null);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("La imagen no puede superar los 5MB.");
      setImageFile(null);
      return;
    }
    setImageFile(file);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    validateAndSetImage(e.target.files?.[0] ?? null);
  }

  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            validateAndSetImage(file);
          }
          break;
        }
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const imagePreviewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile]
  );

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  async function requestSuggestion(payload: { jobDescriptionText?: string; jobImageBase64?: string }) {
    setIsSuggesting(true);
    try {
      const response = await fetch("/api/suggest-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      const nextSuggestion: CvSuggestion | null = data?.suggestion ?? null;
      setSuggestion(nextSuggestion);
      if (nextSuggestion && !userTouchedCvSelector) {
        setBaseCvId(nextSuggestion.cvId);
      }
    } catch {
      // fallo silencioso: la sugerencia es una mejora opcional
    } finally {
      setIsSuggesting(false);
    }
  }

  useEffect(() => {
    const trimmed = jobText.trim();
    if (trimmed.length < MIN_JOB_TEXT_LENGTH) return;

    const timeoutId = setTimeout(() => {
      requestSuggestion({ jobDescriptionText: trimmed });
    }, SUGGEST_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobText]);

  useEffect(() => {
    if (!imageFile) return;
    let cancelled = false;

    readFileAsDataUrl(imageFile).then((jobImageBase64) => {
      if (!cancelled) requestSuggestion({ jobImageBase64 });
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

  async function handleSubmit() {
    if (!canSubmit || isLoading) return;
    setIsLoading(true);
    setSubmitError(null);
    setGeneratedText(null);

    try {
      const jobImageBase64 = imageFile ? await readFileAsDataUrl(imageFile) : undefined;
      const response = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvId: baseCvId,
          companyName: companyName.trim(),
          jobDescriptionText: jobText.trim() || undefined,
          jobImageBase64,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error ?? "Ocurrió un error al generar el CV.");
        if (typeof data.generatedCvText === "string") {
          setGeneratedText(data.generatedCvText);
        }
        return;
      }

      setGeneratedText(data.generatedCvText);
    } catch {
      setSubmitError("No se pudo conectar con el servidor. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-foreground">Nueva postulación</h1>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.4fr_1fr] md:gap-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="company-name" className="text-sm font-medium text-muted">
              Empresa
            </label>
            <input
              id="company-name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nombre de la empresa"
              className="w-full rounded-2xl border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="job-text" className="text-sm font-medium text-muted">
              Texto de la vacante
            </label>
            <textarea
              id="job-text"
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Pegá acá el texto de la vacante..."
              rows={10}
              className="w-full resize-none rounded-2xl border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="job-image" className="text-sm font-medium text-muted">
              O adjuntá una captura de la vacante (podés pegarla con Ctrl+V)
            </label>
            <input
              id="job-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-2xl border border-border bg-surface p-3 text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-accent-foreground focus:border-accent focus:outline-none"
            />
            {imageError && <p className="text-sm text-red-600">{imageError}</p>}
            {imagePreviewUrl && (
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreviewUrl}
                  alt="Vista previa de la captura"
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <span className="flex-1 truncate text-sm text-foreground">{imageFile?.name}</span>
                <button
                  type="button"
                  onClick={() => validateAndSetImage(null)}
                  className="text-sm font-medium text-accent"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="base-cv" className="text-sm font-medium text-muted">
              CV base
            </label>
            <select
              id="base-cv"
              value={baseCvId}
              onChange={(e) => {
                setBaseCvId(e.target.value);
                setUserTouchedCvSelector(true);
              }}
              className="w-full rounded-2xl border border-border bg-surface p-3 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              {cvs.map((cv) => (
                <option key={cv.id} value={cv.id}>
                  {cv.name}
                </option>
              ))}
            </select>
            {isSuggesting && <p className="text-xs text-muted">Analizando vacante...</p>}
            {!isSuggesting && suggestion && (
              <p className="text-xs text-muted">
                {userTouchedCvSelector ? "Sugerencia" : "Sugerido"}: {suggestion.cvName} — {suggestion.reason}
              </p>
            )}
          </div>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            className="mt-2 rounded-2xl bg-accent py-3.5 font-semibold text-accent-foreground transition-opacity active:opacity-90 disabled:opacity-60"
          >
            {isLoading ? "Generando..." : "Generar CV"}
          </button>
        </div>

        {generatedText && (
          <div className="flex flex-col">
            <GeneratedCvBlock text={generatedText} />
          </div>
        )}
      </div>
    </div>
  );
}
