"use client";

import { useMemo, useState } from "react";
import GeneratedCvBlock from "@/components/GeneratedCvBlock";

type CvOption = { id: string; name: string };

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

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

  const canSubmit = useMemo(
    () =>
      companyName.trim().length > 0 &&
      baseCvId.length > 0 &&
      (jobText.trim().length > 0 || imageFile !== null),
    [companyName, baseCvId, jobText, imageFile]
  );

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
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
          O adjuntá una captura de la vacante
        </label>
        <input
          id="job-image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full rounded-2xl border border-border bg-surface p-3 text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-accent-foreground focus:border-accent focus:outline-none"
        />
        {imageError && <p className="text-sm text-red-600">{imageError}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="base-cv" className="text-sm font-medium text-muted">
          CV base
        </label>
        <select
          id="base-cv"
          value={baseCvId}
          onChange={(e) => setBaseCvId(e.target.value)}
          className="w-full rounded-2xl border border-border bg-surface p-3 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          {cvs.map((cv) => (
            <option key={cv.id} value={cv.id}>
              {cv.name}
            </option>
          ))}
        </select>
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

      {generatedText && <GeneratedCvBlock text={generatedText} />}
    </div>
  );
}
