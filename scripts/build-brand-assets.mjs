/**
 * Xuất ảnh thương hiệu (PNG/ICO) từ nguồn SVG trong public/brand/.
 * Chạy: node scripts/build-brand-assets.mjs
 *
 * Dùng `sharp` có sẵn trong node_modules vì Next.js cài kèm để tối ưu ảnh —
 * không khai báo thêm dependency. Nếu bản Next sau này bỏ sharp, cài tạm:
 * `npm i --no-save sharp`.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(import.meta.dirname, "..");
const BRAND = path.join(ROOT, "public", "brand");
const ICONS = path.join(ROOT, "public", "icons");
const FAVICON_SIZES = [16, 32, 48, 64, 128, 256];
const OG = { width: 1672, height: 941, mascotWidth: 900, mascotLeft: 70, mascotTop: 175 };
// Same canvas as public/brand/lingo-mascot.svg; study-loader.tsx relies on it.
const MASCOT = { width: 1367, height: 1150 };

const fromBrand = (file) => path.join(BRAND, file);

function squarePng(svg, size) {
  return sharp(fromBrand(svg), { density: 1200 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** ICO container whose entries are PNG images (supported since Windows Vista). */
function toIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = header.length + dir.length;
  images.forEach(({ size, data }, i) => {
    const e = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, e);
    dir.writeUInt8(size >= 256 ? 0 : size, e + 1);
    dir.writeUInt16LE(1, e + 4);
    dir.writeUInt16LE(32, e + 6);
    dir.writeUInt32LE(data.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...images.map((image) => image.data)]);
}

async function write(file, data) {
  fs.writeFileSync(file, data);
  console.log(`✓ ${path.relative(ROOT, file)} (${Math.round(data.length / 1024)} KB)`);
}

async function main() {
  await write(path.join(ICONS, "icon-192.png"), await squarePng("lingo.svg", 192));
  await write(path.join(ICONS, "icon-512.png"), await squarePng("lingo.svg", 512));
  // Maskable and Apple icons get an edge-to-edge background: the OS crops them.
  await write(path.join(ICONS, "icon-maskable-512.png"), await squarePng("lingo-fullbleed.svg", 512));
  await write(path.join(ICONS, "apple-touch-icon.png"), await squarePng("lingo-fullbleed.svg", 180));

  const favicons = await Promise.all(
    FAVICON_SIZES.map(async (size) => ({ size, data: await squarePng("lingo.svg", size) })),
  );
  await write(path.join(ROOT, "app", "favicon.ico"), toIco(favicons));

  await write(
    path.join(ROOT, "public", "anhloading.png"),
    await sharp(fromBrand("lingo-mascot.svg"), { density: 150 })
      .resize(MASCOT.width, MASCOT.height)
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );

  const mascot = await sharp(fromBrand("lingo-mascot.svg"), { density: 220 })
    .resize(OG.mascotWidth)
    .png()
    .toBuffer();
  await write(
    path.join(ROOT, "public", "themes.png"),
    await sharp(fromBrand("og-background.svg"), { density: 72 })
      .resize(OG.width, OG.height)
      .composite([{ input: mascot, left: OG.mascotLeft, top: OG.mascotTop }])
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
