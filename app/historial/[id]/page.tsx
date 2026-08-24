import { notFound } from "next/navigation";
import GeneratedCvBlock from "@/components/GeneratedCvBlock";
import { formatDate } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type ApplicationDetailRow = {
  id: string;
  company_name: string;
  created_at: string;
  generated_cv_text: string | null;
  cvs: { name: string } | null;
};

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await getSupabaseAdmin()
    .from("applications")
    .select("id, company_name, created_at, generated_cv_text, cvs(name)")
    .eq("id", id)
    .maybeSingle<ApplicationDetailRow>();

  if (error) throw error;
  if (!data || !data.generated_cv_text) notFound();

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{data.company_name}</h1>
        <p className="text-sm text-muted">
          {formatDate(data.created_at)} · CV base: {data.cvs?.name ?? "Sin CV asociado"}
        </p>
      </div>
      <GeneratedCvBlock
        text={data.generated_cv_text}
        fileName={`CV - ${data.company_name}.pdf`}
      />
    </div>
  );
}
