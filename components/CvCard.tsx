import type { Cv } from "@/lib/types";

const ICON_BG: Record<Cv["iconColor"], string> = {
  blue: "bg-icon-blue",
  green: "bg-icon-green",
};

export default function CvCard({ cv }: { cv: Cv }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left shadow-sm transition-colors active:bg-surface-muted"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${ICON_BG[cv.iconColor]}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5" />
        </svg>
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-semibold text-foreground">{cv.name}</span>
        <span className="block truncate text-sm text-muted">{cv.updatedAt}</span>
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-5 w-5 shrink-0 text-muted"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
      </svg>
    </button>
  );
}
