import { getSupabaseAdmin } from "@/lib/supabase-admin";
import NuevaForm from "./NuevaForm";

export const dynamic = "force-dynamic";

type CvRow = { id: string; name: string };

export default async function NuevaPostulacionPage() {
  const { data, error } = await getSupabaseAdmin()
    .from("cvs")
    .select("id, name")
    .order("name", { ascending: true })
    .returns<CvRow[]>();

  if (error) throw error;

  return <NuevaForm cvs={data ?? []} />;
}
