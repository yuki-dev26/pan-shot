import sharp from "sharp";
import fs from "node:fs";

async function onWhite(size, { maskable = false, paddingRatio = 0.12 } = {}) {
  const pad = maskable ? Math.round(size * 0.18) : Math.round(size * paddingRatio);
  const inner = size - pad * 2;

  const resized = await sharp("public/icon.png")
    .ensureAlpha()
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: resized, gravity: "centre" }])
    .png()
    .toBuffer();
}

function pngsToIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  const totalSize = headerSize + pngBuffers.reduce((sum, png) => sum + png.length, 0);
  const buf = Buffer.alloc(totalSize);

  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(count, 4);

  let dataOffset = headerSize;
  for (let i = 0; i < count; i++) {
    const png = pngBuffers[i];
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    const entry = 6 + i * 16;
    buf.writeUInt8(width >= 256 ? 0 : width, entry);
    buf.writeUInt8(height >= 256 ? 0 : height, entry + 1);
    buf.writeUInt8(0, entry + 2);
    buf.writeUInt8(0, entry + 3);
    buf.writeUInt16LE(1, entry + 4);
    buf.writeUInt16LE(32, entry + 6);
    buf.writeUInt32LE(png.length, entry + 8);
    buf.writeUInt32LE(dataOffset, entry + 12);
    png.copy(buf, dataOffset);
    dataOffset += png.length;
  }

  return buf;
}

async function faviconIco() {
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map(async (size) => {
      return sharp("public/icon.png")
        .ensureAlpha()
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toBuffer();
    }),
  );
  return pngsToIco(pngs);
}

async function main() {
  fs.mkdirSync("public/icons", { recursive: true });

  const files = [
    ["public/favicon.ico", await faviconIco()],
    ["public/icons/icon-48.png", await onWhite(48, { paddingRatio: 0.08 })],
    ["public/icons/icon-192.png", await onWhite(192)],
    ["public/icons/icon-512.png", await onWhite(512)],
    ["public/icons/icon-512-maskable.png", await onWhite(512, { maskable: true })],
    ["public/apple-icon.png", await onWhite(180, { paddingRatio: 0.14 })],
  ];

  for (const [file, buf] of files) {
    fs.writeFileSync(file, buf);
    console.log("wrote", file);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
