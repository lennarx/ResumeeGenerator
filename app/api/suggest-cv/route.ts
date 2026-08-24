import "server-only";
import { NextResponse } from "next/server";
import { getAllCvsWithText } from "@/lib/get-cv-text";

export const dynamic = "force-dynamic";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash-lite";

const SYSTEM_PROMPT = `Sos un asistente que ayuda a elegir cuál de varios CVs base es el más adecuado para postularse a una vacante puntual.

Se te va a dar una lista de CVs disponibles (con un id y su contenido) y la descripción de una vacante. Tenés que elegir el CV que mejor encaje con esa vacante.

Respondé ÚNICAMENTE con un JSON de este formato exacto, sin texto adicional ni markdown ni backticks:
{"cvId": "<uno de los ids de los CVs dados>", "reason": "<razón de por qué ese CV, en español, máximo 50 palabras>"}`;

type SuggestCvBody = {
  jobDescriptionText?: unknown;
  jobImageBase64?: unknown;
};

function parseSuggestion(raw: string): { cvId: string; reason: string } | null {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.cvId === "string" &&
      typeof parsed.reason === "string"
    ) {
      return { cvId: parsed.cvId, reason: parsed.reason };
    }
  } catch {
    return null;
  }
  return null;
}

export async function POST(request: Request) {
  let body: SuggestCvBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo de la solicitud no es JSON válido." }, { status: 400 });
  }

  const jobDescriptionText = typeof body.jobDescriptionText === "string" ? body.jobDescriptionText.trim() : "";
  const jobImageBase64 = typeof body.jobImageBase64 === "string" ? body.jobImageBase64 : "";

  if (!jobDescriptionText && !jobImageBase64) {
    return NextResponse.json({ error: "Falta el texto o la imagen de la vacante." }, { status: 400 });
  }

  try {
    const cvs = await getAllCvsWithText();

    if (cvs.length < 2) {
      return NextResponse.json({ suggestion: null });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ suggestion: null });
    }

    const cvsListText = cvs
      .map((cv) => `- id: ${cv.id}\n  nombre: ${cv.name}\n  contenido:\n${cv.text}`)
      .join("\n\n");

    const userTextParts = [
      `CVs disponibles:\n${cvsListText}`,
      jobDescriptionText ? `\n\nDescripción de la vacante (texto):\n${jobDescriptionText}` : "",
      jobImageBase64 ? "\n\nTambién se adjunta una imagen con la descripción de la vacante." : "",
    ].join("");

    const userContent: Array<Record<string, unknown>> = [{ type: "text", text: userTextParts }];
    if (jobImageBase64) {
      userContent.push({ type: "image_url", image_url: { url: jobImageBase64 } });
    }

    const openRouterResponse = await fetch(OPENROUTER_URL, {
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

    if (!openRouterResponse.ok) {
      return NextResponse.json({ suggestion: null });
    }

    const completion = await openRouterResponse.json();
    const rawContent: unknown = completion?.choices?.[0]?.message?.content;

    if (typeof rawContent !== "string" || rawContent.trim().length === 0) {
      return NextResponse.json({ suggestion: null });
    }

    const parsed = parseSuggestion(rawContent);
    if (!parsed) {
      return NextResponse.json({ suggestion: null });
    }

    const matchedCv = cvs.find((cv) => cv.id === parsed.cvId);
    if (!matchedCv) {
      return NextResponse.json({ suggestion: null });
    }

    return NextResponse.json({
      suggestion: { cvId: matchedCv.id, cvName: matchedCv.name, reason: parsed.reason },
    });
  } catch {
    return NextResponse.json({ suggestion: null });
  }
}
