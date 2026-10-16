/**
 * Open Graph image generator.
 *
 * Writes `public/og-image.png` (1200x630, PNG, RGBA).
 *
 * Why hand-rolled: no rasteriser (rsvg, sharp, canvas) is available, and social
 * platforms do not reliably render SVG for `og:image` — they simply show
 * nothing. Shipping a broken reference would be worse than shipping none, so
 * this produces a genuine PNG using only Node's built-in zlib.
 *
 * The design is deliberately text-free: rendering type would require a font
 * rasteriser. It is a branded card — the site gradient, ambient glow, and the
 * brand glyph at large scale — which is honest about being a brand mark rather
 * than pretending to be a screenshot.
 *
 * Run with: node scripts/generate-og-image.mjs
 */

import { deflateSync } from 'node:zlib';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WIDTH = 1200;
const HEIGHT = 630;

/* ---------------------------- PNG encoding ---------------------------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // colour type: RGBA
  ihdr.writeUInt8(0, 10); // deflate
  ihdr.writeUInt8(0, 11); // adaptive filtering
  ihdr.writeUInt8(0, 12); // no interlace

  // Each scanline is prefixed with filter type 0 (None).
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ------------------------------ drawing ------------------------------ */

const clamp01 = (value) => Math.min(1, Math.max(0, value));

function mix(a, b, t) {
  return a + (b - a) * t;
}

/** Signed distance to a rounded rectangle. Negative inside. */
function sdfRoundedRect(x, y, cx, cy, halfWidth, halfHeight, radius) {
  const dx = Math.abs(x - cx) - (halfWidth - radius);
  const dy = Math.abs(y - cy) - (halfHeight - radius);
  const ax = Math.max(dx, 0);
  const ay = Math.max(dy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(dx, dy), 0) - radius;
}

/** Distance to a line segment. */
function distanceToSegment(x, y, ax, ay, bx, by) {
  const pax = x - ax;
  const pay = y - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const denominator = bax * bax + bay * bay;
  const h = denominator === 0 ? 0 : clamp01((pax * bax + pay * bay) / denominator);
  return Math.hypot(pax - bax * h, pay - bay * h);
}

/** Analytic anti-aliased coverage from a signed distance. */
const coverage = (sdf) => clamp01(0.5 - sdf);

const palette = {
  nightTop: [0x04, 0x07, 0x0e],
  nightBottom: [0x0d, 0x17, 0x29],
  cyan: [0x22, 0xd3, 0xee],
  blue: [0x3b, 0x82, 0xf6],
  glyphInk: [0x04, 0x07, 0x0e],
};

/** Composite `source` over `destination` with the given alpha. */
function over(destination, source, alpha) {
  if (alpha <= 0) return destination;
  const a = Math.min(1, alpha);
  return [
    mix(destination[0], source[0], a),
    mix(destination[1], source[1], a),
    mix(destination[2], source[2], a),
  ];
}

function render() {
  const rgba = Buffer.alloc(WIDTH * HEIGHT * 4);

  // Glyph geometry: the brand mark scaled up, centred slightly above middle.
  const glyphSize = 300;
  const glyphHalf = glyphSize / 2;
  const glyphCx = WIDTH / 2;
  const glyphCy = HEIGHT / 2 - 24;
  const glyphRadius = glyphSize * 0.28;
  const unit = glyphSize / 32; // brand glyph is authored on a 32x32 grid
  const strokeHalf = unit * 1.0;

  const glyphScale = (creators) => creators.map(([gx, gy]) => [glyphCx + (gx - 16) * unit, glyphCy + (gy - 16) * unit]);
  const [[c1x, c1y], [c2x, c2y], [c3x, c3y], [c4x, c4y]] = glyphScale([
    [9, 21.5],
    [9, 12],
    [16, 17.5],
    [23, 12],
  ]);
  const [[c5x, c5y], [c6x, c6y]] = glyphScale([
    [23, 21.5],
    [16, 17.5],
  ]);
  const [dotAx, dotAy] = glyphScale([[9, 10.5]])[0];
  const [dotBx, dotBy] = glyphScale([[23, 10.5]])[0];
  const dotRadius = unit * 1.6;

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const t = (x / WIDTH) * 0.45 + (y / HEIGHT) * 0.55;
      let colour = [
        mix(palette.nightTop[0], palette.nightBottom[0], t),
        mix(palette.nightTop[1], palette.nightBottom[1], t),
        mix(palette.nightTop[2], palette.nightBottom[2], t),
      ];

      // Ambient glows, matching the site's `.ambient` background.
      const glowA = Math.hypot(x - 260, y - 90) / 620;
      if (glowA < 1) colour = over(colour, palette.cyan, 0.16 * (1 - glowA) ** 2);
      const glowB = Math.hypot(x - 990, y - 560) / 560;
      if (glowB < 1) colour = over(colour, palette.blue, 0.14 * (1 - glowB) ** 2);

      // Brand glyph badge.
      const badge = sdfRoundedRect(x, y, glyphCx, glyphCy, glyphHalf, glyphHalf, glyphRadius);
      const badgeAlpha = coverage(badge);
      if (badgeAlpha > 0) {
        const gradientT = clamp01(
          ((x - (glyphCx - glyphHalf)) / glyphSize) * 0.4 +
            ((y - (glyphCy - glyphHalf)) / glyphSize) * 0.6,
        );
        const badgeColour = [
          mix(palette.cyan[0], palette.blue[0], gradientT),
          mix(palette.cyan[1], palette.blue[1], gradientT),
          mix(palette.cyan[2], palette.blue[2], gradientT),
        ];
        colour = over(colour, badgeColour, badgeAlpha);
      }

      // Chevron and dots, drawn in the ink colour on top of the badge.
      let ink = 0;
      ink = Math.max(ink, coverage(distanceToSegment(x, y, c1x, c1y, c2x, c2y) - strokeHalf));
      ink = Math.max(ink, coverage(distanceToSegment(x, y, c2x, c2y, c3x, c3y) - strokeHalf));
      ink = Math.max(ink, coverage(distanceToSegment(x, y, c3x, c3y, c4x, c4y) - strokeHalf));
      ink = Math.max(ink, coverage(distanceToSegment(x, y, c4x, c4y, c5x, c5y) - strokeHalf));
      ink = Math.max(ink, coverage(distanceToSegment(x, y, c5x, c5y, c6x, c6y) - strokeHalf));
      ink = Math.max(ink, coverage(Math.hypot(x - dotAx, y - dotAy) - dotRadius));
      ink = Math.max(ink, coverage(Math.hypot(x - dotBx, y - dotBy) - dotRadius));
      if (ink > 0) colour = over(colour, palette.glyphInk, ink);

      const offset = (y * WIDTH + x) * 4;
      rgba[offset] = Math.round(clamp01(colour[0] / 255) * 255);
      rgba[offset + 1] = Math.round(clamp01(colour[1] / 255) * 255);
      rgba[offset + 2] = Math.round(clamp01(colour[2] / 255) * 255);
      rgba[offset + 3] = 255;
    }
  }

  return rgba;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = join(root, 'public');
await mkdir(outputDir, { recursive: true });

const png = encodePng(WIDTH, HEIGHT, render());
await writeFile(join(outputDir, 'og-image.png'), png);

console.log(`generate-og-image: wrote public/og-image.png (${WIDTH}x${HEIGHT}, ${png.length} bytes)`);
