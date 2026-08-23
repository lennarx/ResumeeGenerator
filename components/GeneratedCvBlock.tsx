"use client";

import { useState } from "react";

export default function GeneratedCvBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API no disponible; el texto sigue siendo seleccionable.
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <pre className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-border bg-surface p-3 text-sm text-foreground select-text">
        {text}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-2xl bg-accent py-3.5 font-semibold text-accent-foreground transition-opacity active:opacity-90"
      >
        {copied ? "¡Copiado!" : "Copiar"}
      </button>
    </div>
  );
}
