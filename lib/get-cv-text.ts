import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { extractPdfText } from "@/lib/extract-pdf-text";

type CvRow = { id: string; name: string; file_path: string | null; extracted_text: string | null };

async function extractAndStore(cv: CvRow): Promise<string | null> {
  if (!cv.file_path) return null;

  const supabaseAdmin = getSupabaseAdmin();
  const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
    .from("cvs-files")
    .download(cv.file_path);

  if (downloadError || !fileBlob) return null;

  let text: string;
  try {
    const arrayBuffer = await fileBlob.arrayBuffer();
    text = await extractPdfText(Buffer.from(arrayBuffer));
    if (!text) return null;
  } catch {
    return null;
  }

  await supabaseAdmin.from("cvs").update({ extracted_text: text }).eq("id", cv.id);
  return text;
}

export async function getCvTextById(cvId: string): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: cv, error } = await supabaseAdmin
    .from("cvs")
    .select("id, name, file_path, extracted_text")
    .eq("id", cvId)
    .maybeSingle<CvRow>();

  if (error || !cv) return null;
  if (cv.extracted_text) return cv.extracted_text;

  return extractAndStore(cv);
}

export async function getAllCvsWithText(): Promise<Array<{ id: string; name: string; text: string }>> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: cvs, error } = await supabaseAdmin
    .from("cvs")
    .select("id, name, file_path, extracted_text")
    .returns<CvRow[]>();

  if (error || !cvs) return [];

  const results = await Promise.all(
    cvs.map(async (cv) => {
      const text = cv.extracted_text ?? (await extractAndStore(cv));
      if (!text) return null;
      return { id: cv.id, name: cv.name, text };
    })
  );

  return results.filter((r): r is { id: string; name: string; text: string } => r !== null);
}
