import "server-only";

export type CvLine = { text: string; isBullet: boolean };
export type CvSection = { heading: string; lines: CvLine[] };
export type ParsedCv = { contactLines: string[]; sections: CvSection[] };

const MAX_HEADING_LENGTH = 40;
const HEADING_CHARS_RE = /^[\p{Lu}\p{M}\s.,()/&-]+$/u;

function isHeadingLine(trimmed: string): boolean {
  if (!trimmed || trimmed.startsWith("- ")) return false;
  if (trimmed.length > MAX_HEADING_LENGTH) return false;
  if (/\p{Ll}/u.test(trimmed)) return false;
  if (!/\p{Lu}/u.test(trimmed)) return false;
  return HEADING_CHARS_RE.test(trimmed);
}

export function parseCvText(rawText: string): ParsedCv {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const firstHeadingIndex = lines.findIndex(isHeadingLine);
  if (firstHeadingIndex === -1) {
    return { contactLines: lines, sections: [] };
  }

  const contactLines = lines.slice(0, firstHeadingIndex);
  const sections: CvSection[] = [];
  let current: CvSection | null = null;

  for (const line of lines.slice(firstHeadingIndex)) {
    if (isHeadingLine(line)) {
      current = { heading: line, lines: [] };
      sections.push(current);
      continue;
    }
    if (!current) continue;
    if (line.startsWith("- ")) {
      current.lines.push({ text: line.slice(2).trim(), isBullet: true });
    } else {
      current.lines.push({ text: line, isBullet: false });
    }
  }

  return { contactLines, sections };
}
