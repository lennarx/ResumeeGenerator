import Link from "next/link";
import CvCard from "@/components/CvCard";
import { formatDate } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Cv } from "@/lib/types";

export const dynamic = "force-dynamic";

const ICON_COLORS: Cv["iconColor"][] = ["blue", "green"];

type CvRow = { id: string; name: string; updated_at: string };

export default async function CvsPage() {
  const { data, error } = await getSupabaseAdmin()
    .from("cvs")
    .select("id, name, updated_at")
    .order("updated_at", { ascending: false })
    .returns<CvRow[]>();

  if (error) throw error;

  const cvs: Cv[] = (data ?? []).map((row, index) => ({
    id: row.id,
    name: row.name,
    updatedAt: `Actualizado el ${formatDate(row.updated_at)}`,
    iconColor: ICON_COLORS[index % ICON_COLORS.length],
  }));

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
      <h1 className="text-2xl font-bold text-foreground md:col-span-full">Mis CVs</h1>

      {cvs.length === 0 ? (
        <p className="text-sm text-muted md:col-span-full">Todavía no cargaste ningún CV.</p>
      ) : (
        <div className="flex flex-col gap-3 md:contents">
          {cvs.map((cv) => (
            <CvCard key={cv.id} cv={cv} />
          ))}
        </div>
      )}

      <Link
        href="/cvs/nuevo"
        className="flex items-center justify-center gap-2 rounded-2xl border border-border py-3.5 font-medium text-foreground transition-colors active:bg-surface-muted md:aspect-square md:flex-col md:justify-center md:gap-2 md:border-dashed md:py-0"
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
      </Link>
    </div>
  );
}
