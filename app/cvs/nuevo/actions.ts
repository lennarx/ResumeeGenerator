"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export type CreateCvState = { error: string | null };

export async function createCv(
  _prevState: CreateCvState,
  formData: FormData
): Promise<CreateCvState> {
  const name = formData.get("name");
  const file = formData.get("file");

  if (typeof name !== "string" || name.trim().length === 0) {
    return { error: "Ingresá un nombre para el CV." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Seleccioná un archivo PDF." };
  }

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return { error: "El archivo debe ser un PDF." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "El archivo no puede superar los 10MB." };
  }

  const id = randomUUID();
  const filePath = `${id}.pdf`;
  const supabaseAdmin = getSupabaseAdmin();

  const { error: uploadError } = await supabaseAdmin.storage
    .from("cvs-files")
    .upload(filePath, await file.arrayBuffer(), { contentType: "application/pdf" });

  if (uploadError) {
    return { error: "No se pudo subir el archivo. Intentá de nuevo." };
  }

  const { error: insertError } = await supabaseAdmin
    .from("cvs")
    .insert({ id, name: name.trim(), file_path: filePath });

  if (insertError) {
    return { error: "No se pudo guardar el CV. Intentá de nuevo." };
  }

  revalidatePath("/cvs");
  redirect("/cvs");
}
