import ApplicationCard from "@/components/ApplicationCard";
import { formatDate } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Application } from "@/lib/types";

export const dynamic = "force-dynamic";

type ApplicationRow = {
  id: string;
  company_name: string;
  created_at: string;
  generated_cv_text: string | null;
  cvs: { name: string } | null;
};

export default async function HistorialPage() {
  const { data, error } = await getSupabaseAdmin()
    .from("applications")
    .select("id, company_name, created_at, generated_cv_text, cvs(name)")
    .order("created_at", { ascending: false })
    .returns<ApplicationRow[]>();

  if (error) throw error;

  const applications: Application[] = (data ?? []).map((row) => ({
    id: row.id,
    company: row.company_name,
    date: formatDate(row.created_at),
    cvUsed: row.cvs?.name ?? "Sin CV asociado",
    hasGeneratedCv: Boolean(row.generated_cv_text),
  }));

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-foreground">Historial</h1>

      {applications.length === 0 ? (
        <p className="text-sm text-muted">
          Todavía no registraste ninguna postulación.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}
    </div>
  );
}
