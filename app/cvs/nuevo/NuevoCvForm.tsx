"use client";

import { useActionState } from "react";
import { createCv, type CreateCvState } from "./actions";

const initialState: CreateCvState = { error: null };

export default function NuevoCvForm() {
  const [state, formAction, pending] = useActionState(createCv, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-muted">
          Nombre del CV
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Ej: QA, Salud"
          required
          className="w-full rounded-2xl border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="file" className="text-sm font-medium text-muted">
          Archivo (PDF, máx. 10MB)
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept="application/pdf"
          required
          className="w-full rounded-2xl border border-border bg-surface p-3 text-sm text-foreground focus:border-accent focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-2xl bg-accent py-3.5 font-semibold text-accent-foreground transition-opacity active:opacity-90 disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar CV"}
      </button>
    </form>
  );
}
