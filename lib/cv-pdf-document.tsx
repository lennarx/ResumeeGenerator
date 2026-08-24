import "server-only";
import path from "node:path";
import { Document, Font, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ParsedCv } from "@/lib/parse-cv-text";

let fontsRegistered = false;

function fontFilePath(fileName: string): string {
  return path.join(process.cwd(), "node_modules", "@fontsource", "noto-sans", "files", fileName);
}

function registerFonts() {
  if (fontsRegistered) return;

  Font.register({
    family: "NotoSans",
    fonts: [
      { src: fontFilePath("noto-sans-latin-400-normal.woff"), fontWeight: "normal" },
      { src: fontFilePath("noto-sans-latin-700-normal.woff"), fontWeight: "bold" },
    ],
  });

  fontsRegistered = true;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 48,
    fontFamily: "NotoSans",
    fontSize: 10.5,
    lineHeight: 1.4,
    color: "#111114",
  },
  contactBlock: { marginBottom: 16 },
  contactName: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  contactLine: { fontSize: 9.5, color: "#333333" },
  section: { marginBottom: 12 },
  heading: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 6,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
  },
  paragraph: { marginBottom: 3 },
  bulletRow: { flexDirection: "row", marginBottom: 3 },
  bulletMarker: { width: 10 },
  bulletText: { flex: 1 },
});

function CvPdfDocument({ parsed }: { parsed: ParsedCv }) {
  const [name, ...restContact] = parsed.contactLines;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {parsed.contactLines.length > 0 && (
          <View style={styles.contactBlock}>
            {name && <Text style={styles.contactName}>{name}</Text>}
            {restContact.map((line, i) => (
              <Text key={i} style={styles.contactLine}>
                {line}
              </Text>
            ))}
          </View>
        )}
        {parsed.sections.map((section, si) => (
          <View key={si} style={styles.section} wrap>
            <Text style={styles.heading}>{section.heading}</Text>
            {section.lines.map((line, li) =>
              line.isBullet ? (
                <View key={li} style={styles.bulletRow}>
                  <Text style={styles.bulletMarker}>-</Text>
                  <Text style={styles.bulletText}>{line.text}</Text>
                </View>
              ) : (
                <Text key={li} style={styles.paragraph}>
                  {line.text}
                </Text>
              )
            )}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function renderCvPdf(parsed: ParsedCv): Promise<Buffer> {
  registerFonts();
  return renderToBuffer(<CvPdfDocument parsed={parsed} />);
}
