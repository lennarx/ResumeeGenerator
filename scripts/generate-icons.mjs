import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// pixels: function(x, y) -> [r,g,b,a]
function buildPng(size, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk("IHDR", ihdrData);

  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixels(x, y);
      const off = rowStart + 1 + x * 4;
      raw[off] = r;
      raw[off + 1] = g;
      raw[off + 2] = b;
      raw[off + 3] = a;
    }
  }
  const idat = chunk("IDAT", deflateSync(raw));
  const iend = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Simple "document" glyph on a solid rounded-square background.
function makeIcon(size, { bg, fg, padding = 0, radius }) {
  const r = radius ?? size * 0.22;
  return buildPng(size, (x, y) => {
    const inRounded = isInsideRoundedSquare(x, y, size, r);
    if (!inRounded) return [0, 0, 0, 0];

    const px = x - padding;
    const py = y - padding;
    const w = size - padding * 2;
    const h = size - padding * 2;

    if (isDocumentGlyph(px, py, w, h)) {
      return [...fg, 255];
    }
    return [...bg, 255];
  });
}

function isInsideRoundedSquare(x, y, size, r) {
  const cx = Math.min(Math.max(x, r), size - r);
  const cy = Math.min(Math.max(y, r), size - r);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r + 1;
}

// Draws a simple page-with-folded-corner shape centered in a w x h box.
function isDocumentGlyph(x, y, w, h) {
  const pageW = w * 0.42;
  const pageH = h * 0.54;
  const left = (w - pageW) / 2;
  const top = (h - pageH) / 2;
  const fold = pageW * 0.3;

  if (x < left || x > left + pageW || y < top || y > top + pageH) return false;

  // cut the top-right fold corner
  const rx = x - (left + pageW - fold);
  const ry = y - top;
  if (rx > 0 && ry < fold && ry < fold - rx) return false;

  // a couple of "text lines"
  const lineH = pageH * 0.09;
  const lineGap = pageH * 0.16;
  const lineLeft = left + pageW * 0.18;
  const lineRightShort = left + pageW * 0.7;
  const lineRightLong = left + pageW * 0.85;
  for (let i = 0; i < 3; i++) {
    const lineTop = top + pageH * 0.32 + i * lineGap;
    const lineRight = i === 2 ? lineRightShort : lineRightLong;
    if (y >= lineTop && y <= lineTop + lineH && x >= lineLeft && x <= lineRight) {
      return false; // punch out as background color -> renders as a line
    }
  }

  return true;
}

mkdirSync("public/icons", { recursive: true });

const bg = [37, 99, 235]; // blue-600, matches the app accent
const fg = [255, 255, 255];

for (const size of [192, 512]) {
  const png = makeIcon(size, { bg, fg, padding: size * 0.16 });
  writeFileSync(`public/icons/icon-${size}.png`, png);
}

// maskable icon: keep the glyph inside the safe zone (extra padding, no transparency)
const maskable = buildPng(512, (x, y) => {
  const padding = 512 * 0.28;
  const px = x - padding;
  const py = y - padding;
  const w = 512 - padding * 2;
  const h = 512 - padding * 2;
  if (px >= 0 && px < w && py >= 0 && py < h && isDocumentGlyph(px, py, w, h)) {
    return [...fg, 255];
  }
  return [...bg, 255];
});
writeFileSync("public/icons/icon-maskable-512.png", maskable);

// favicon-ish small apple touch icon
const appleTouch = makeIcon(180, { bg, fg, padding: 180 * 0.16, radius: 180 * 0.22 });
writeFileSync("public/icons/apple-touch-icon.png", appleTouch);

console.log("Icons generated in public/icons/");
