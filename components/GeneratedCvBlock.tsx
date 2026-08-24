"use client";

import { useState } from "react";

export default function GeneratedCvBlock({
  text,
  fileName = "CV.pdf",
}: {
  text: string;
  fileName?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API no disponible; el texto sigue siendo seleccionable.
    }
  }

  async function handleDownloadPdf() {
    if (downloading) return;
    setDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch("/api/cv-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, fileName }),
      });

      if (!response.ok) {
        let message = "No se pudo generar el PDF. Intentá de nuevo.";
        try {
          const data = await response.json();
          if (typeof data?.error === "string") message = data.error;
        } catch {
          // la respuesta de error no era JSON; usamos el mensaje genérico
        }
        setDownloadError(message);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("No se pudo conectar con el servidor. Intentá de nuevo.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <pre className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-border bg-surface p-3 text-sm text-foreground select-text">
        {text}
      </pre>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 rounded-2xl bg-accent py-3.5 font-semibold text-accent-foreground transition-opacity active:opacity-90"
        >
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="flex-1 rounded-2xl bg-accent py-3.5 font-semibold text-accent-foreground transition-opacity active:opacity-90 disabled:opacity-60"
        >
          {downloading ? "Generando PDF..." : "Descargar PDF"}
        </button>
      </div>
      {downloadError && <p className="text-sm text-red-600">{downloadError}</p>}
    </div>
  );
}
