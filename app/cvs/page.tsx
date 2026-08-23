import CvCard from "@/components/CvCard";
import { mockCvs } from "@/lib/mock-data";

export default function CvsPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-foreground">Mis CVs</h1>

      <div className="flex flex-col gap-3">
        {mockCvs.map((cv) => (
          <CvCard key={cv.id} cv={cv} />
        ))}
      </div>

      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-2xl border border-border py-3.5 font-medium text-foreground transition-colors active:bg-surface-muted"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4"
        >
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
        Agregar CV
      </button>
    </div>
  );
}
