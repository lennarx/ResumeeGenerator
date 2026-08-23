import Link from "next/link";
import type { Application } from "@/lib/types";

const TAG_STYLES: Record<string, string> = {
  QA: "bg-icon-blue/15 text-icon-blue",
  Salud: "bg-icon-green/15 text-icon-green",
};

export default function ApplicationCard({ application }: { application: Application }) {
  const tagStyle = TAG_STYLES[application.cvUsed] ?? "bg-surface-muted text-muted";

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{application.company}</p>
          <p className="text-sm text-muted">{application.date}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${tagStyle}`}>
          {application.cvUsed}
        </span>
      </div>
      {application.hasGeneratedCv && (
        <Link
          href={`/historial/${application.id}`}
          className="mt-3 inline-block text-sm font-medium text-accent"
        >
          Ver CV generado
        </Link>
      )}
    </div>
  );
}
