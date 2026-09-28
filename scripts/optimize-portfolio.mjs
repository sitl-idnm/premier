/**
 * Разовая оптимизация фото для галереи «Красота — это вы» (portfolio).
 *   node scripts/optimize-portfolio.mjs ["путь к папке"]
 *
 * HEIC декодируется через heic-convert → JPEG, затем sharp → WebP (resize).
 * JPG/PNG идут сразу через sharp. Результат: public/images/portfolio/photo-NN.webp
 * + сгенерированный список src/views/home/sections/portfolio/photos.generated.ts
 */
import { readdir, readFile, writeFile, rm, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import heicConvert from "heic-convert";

const SRC = process.argv[2] || "C:/Users/sitl/Downloads/Telegram Desktop/премьер фото";
const ROOT = path.resolve(process.cwd());
const OUT_DIR = path.join(ROOT, "public", "images", "portfolio");
const OUT_URL = "/images/portfolio";
const GEN = path.join(ROOT, "src", "views", "home", "sections", "portfolio", "photos.generated.ts");
const MAX = 1200;
const QUALITY = 78;

const pad = (n) => String(n).padStart(2, "0");

async function main() {
  const all = await readdir(SRC);
  const files = all
    .filter((f) => /\.(heic|heif|jpe?g|png)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  console.log(`Найдено файлов: ${files.length}`);
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const photos = [];
  for (let i = 0; i < files.length; i++) {
    const name = files[i];
    process.stdout.write(`  [${i + 1}/${files.length}] ${name} … `);
    let input = await readFile(path.join(SRC, name));

    if (/\.(heic|heif)$/i.test(name)) {
      const jpg = await heicConvert({ buffer: input, format: "JPEG", quality: 0.92 });
      input = Buffer.from(jpg);
    }

    const out = await sharp(input)
      .rotate()
      .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer({ resolveWithObject: true });

    const fileName = `photo-${pad(i + 1)}.webp`;
    await writeFile(path.join(OUT_DIR, fileName), out.data);
    photos.push({ src: `${OUT_URL}/${fileName}`, w: out.info.width, h: out.info.height });
    console.log(`ok ${out.info.width}x${out.info.height} (${Math.round(out.data.length / 1024)} KB)`);
  }

  const body = `// АВТОГЕНЕРАЦИЯ (scripts/optimize-portfolio.mjs). Не редактировать вручную.
export type PortfolioPhoto = { src: string; w: number; h: number };

export const portfolioPhotos: PortfolioPhoto[] = ${JSON.stringify(photos, null, 2)};
`;
  await writeFile(GEN, body, "utf8");

  const totalKb = Math.round(
    photos.reduce((s) => s, 0) || 0,
  );
  console.log(`\n✔ Готово: ${photos.length} фото → ${path.relative(ROOT, OUT_DIR)}`);
  console.log(`  Список: ${path.relative(ROOT, GEN)}`);
  void totalKb;
}

main().catch((e) => {
  console.error("\n✖", e.stack || String(e));
  process.exit(1);
});
