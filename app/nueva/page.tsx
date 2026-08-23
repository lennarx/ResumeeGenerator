"use client";

import { useState } from "react";
import { mockCvs } from "@/lib/mock-data";

export default function NuevaPostulacionPage() {
  const [jobText, setJobText] = useState("");
  const [baseCvId, setBaseCvId] = useState(mockCvs[0]?.id ?? "");

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-foreground">Nueva postulación</h1>

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
        <label htmlFor="base-cv" className="text-sm font-medium text-muted">
          CV base
        </label>
        <select
          id="base-cv"
          value={baseCvId}
          onChange={(e) => setBaseCvId(e.target.value)}
          className="w-full rounded-2xl border border-border bg-surface p-3 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          {mockCvs.map((cv) => (
            <option key={cv.id} value={cv.id}>
              {cv.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="mt-2 rounded-2xl bg-accent py-3.5 font-semibold text-accent-foreground transition-opacity active:opacity-90"
      >
        Generar CV
      </button>
    </div>
  );
}
