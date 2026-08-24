import "server-only";
import { NextResponse } from "next/server";
import { parseCvText } from "@/lib/parse-cv-text";
import { renderCvPdf } from "@/lib/cv-pdf-document";

export const dynamic = "force-dynamic";

type CvPdfBody = { text?: unknown; fileName?: unknown };

function sanitizeFileName(input: unknown): string {
  const raw = typeof input === "string" ? input.trim() : "";
  const base = raw.length > 0 ? raw : "CV.pdf";
  const withExt = /\.pdf$/i.test(base) ? base : `${base}.pdf`;
  const cleaned = withExt
    .replace(/[\\/:*?"<>|\x00-\x1f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 0 ? cleaned : "CV.pdf";
}

export async function POST(request: Request) {
  let body: CvPdfBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo de la solicitud no es JSON válido." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Falta el texto del CV a exportar." }, { status: 400 });
  }

  const fileName = sanitizeFileName(body.fileName);
  const asciiFileName = fileName.replace(/[^\x20-\x7E]/g, "_") || "CV.pdf";

  let buffer: Buffer;
  try {
    buffer = await renderCvPdf(parseCvText(text));
  } catch {
    return NextResponse.json({ error: "No se pudo generar el PDF. Intentá de nuevo." }, { status: 500 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Content-Length": String(buffer.length),
    },
  });
}
