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

async function main() {
  fs.mkdirSync("public/icons", { recursive: true });

  const files = [
    ["public/icons/icon-192.png", await onWhite(192)],
    ["public/icons/icon-512.png", await onWhite(512)],
    ["public/icons/icon-512-maskable.png", await onWhite(512, { maskable: true })],
    ["src/app/apple-icon.png", await onWhite(180, { paddingRatio: 0.14 })],
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
