import "server-only";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getCvTextById } from "@/lib/get-cv-text";

export const dynamic = "force-dynamic";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash-lite";

const SYSTEM_PROMPT = `Sos un asistente experto en optimización de CVs para sistemas ATS (Applicant Tracking System).

Tu tarea es tomar el CV base del usuario y la descripción de una vacante, y devolver una versión REORDENADA Y REFORMULADA del mismo CV, optimizada para esa vacante puntual.

Reglas estrictas:
1. Formato ATS: texto plano, sin tablas, sin columnas, sin caracteres especiales de formato. Incorporá las palabras clave relevantes de la vacante donde correspondan naturalmente.
2. NUNCA inventes experiencia, títulos, certificaciones, habilidades o datos que no estén presentes en el CV original. Solo podés reordenar, reformular y enfatizar lo que ya existe.
3. Devolvé el CV completo, listo para copiar y pegar, en texto plano.`;

type GenerateCvBody = {
  cvId?: unknown;
  companyName?: unknown;
  jobDescriptionText?: unknown;
  jobImageBase64?: unknown;
};

export async function POST(request: Request) {
  let body: GenerateCvBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo de la solicitud no es JSON válido." }, { status: 400 });
  }

  const cvId = typeof body.cvId === "string" ? body.cvId : "";
  const companyName = typeof body.companyName === "string" ? body.companyName.trim() : "";
  const jobDescriptionText = typeof body.jobDescriptionText === "string" ? body.jobDescriptionText.trim() : "";
  const jobImageBase64 = typeof body.jobImageBase64 === "string" ? body.jobImageBase64 : "";

  if (!cvId) {
    return NextResponse.json({ error: "Falta seleccionar un CV base." }, { status: 400 });
  }
  if (!companyName) {
    return NextResponse.json({ error: "Ingresá el nombre de la empresa." }, { status: 400 });
  }
  if (!jobDescriptionText && !jobImageBase64) {
    return NextResponse.json({ error: "Pegá el texto de la vacante o adjuntá una imagen." }, { status: 400 });
  }

  const cvText = await getCvTextById(cvId);

  if (!cvText) {
    return NextResponse.json({ error: "No se pudo obtener el contenido del CV seleccionado." }, { status: 502 });
  }

  const userTextParts = [
    `CV base:\n${cvText}`,
    jobDescriptionText ? `\n\nDescripción de la vacante (texto):\n${jobDescriptionText}` : "",
    jobImageBase64 ? "\n\nTambién se adjunta una imagen con la descripción de la vacante." : "",
  ].join("");

  const userContent: Array<Record<string, unknown>> = [{ type: "text", text: userTextParts }];
  if (jobImageBase64) {
    userContent.push({ type: "image_url", image_url: { url: jobImageBase64 } });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Falta configurar la clave de OpenRouter en el servidor." }, { status: 502 });
  }

  let openRouterResponse: Response;
  try {
    openRouterResponse = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });
  } catch {
    return NextResponse.json({ error: "No se pudo conectar con el servicio de generación de CV." }, { status: 502 });
  }

  if (!openRouterResponse.ok) {
    const detail = await openRouterResponse.text().catch(() => "");
    return NextResponse.json(
      {
        error: `El servicio de generación de CV respondió con error (${openRouterResponse.status}). ${detail.slice(0, 300)}`,
      },
      { status: 502 }
    );
  }

  const completion = await openRouterResponse.json();
  const generatedText: unknown = completion?.choices?.[0]?.message?.content;

  if (typeof generatedText !== "string" || generatedText.trim().length === 0) {
    return NextResponse.json({ error: "El servicio de generación de CV no devolvió contenido." }, { status: 502 });
  }

  const { data: inserted, error: insertError } = await getSupabaseAdmin()
    .from("applications")
    .insert({
      company_name: companyName,
      job_description: jobDescriptionText || "[vacante cargada como imagen]",
      cv_id: cvId,
      generated_cv_text: generatedText,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json(
      {
        error: "El CV se generó pero no se pudo guardar la postulación. Copiá el resultado antes de salir.",
        generatedCvText: generatedText,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ applicationId: inserted.id, generatedCvText: generatedText });
}
