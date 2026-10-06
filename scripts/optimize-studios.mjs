/**
 * Разовая оптимизация фото интерьеров салонов (studios).
 *   node scripts/optimize-studios.mjs ["путь к папке"]
 *
 * HEIC → heic-convert → JPEG → sharp → WebP. JPG/PNG сразу через sharp.
 * Результат: public/images/studios/studio-NN.webp (+ лог размеров для подбора).
 */
import { readdir, readFile, writeFile, rm, mkdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'
import heicConvert from 'heic-convert'

const SRC = process.argv[2] || 'C:/Users/sitl/Downloads/Архив/Премьер Студии'
const ROOT = path.resolve(process.cwd())
const OUT_DIR = path.join(ROOT, 'public', 'images', 'studios')
const OUT_URL = '/images/studios'
const MAX = 1600
const QUALITY = 80

const pad = (n) => String(n).padStart(2, '0')

async function main() {
  const all = await readdir(SRC)
  const files = all
    .filter((f) => /\.(heic|heif|jpe?g|png)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  console.log(`Найдено файлов: ${files.length}`)
  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })

  for (let i = 0; i < files.length; i++) {
    const name = files[i]
    process.stdout.write(`  [${i + 1}/${files.length}] ${name} … `)
    let input = await readFile(path.join(SRC, name))

    if (/\.(heic|heif)$/i.test(name)) {
      const jpg = await heicConvert({ buffer: input, format: 'JPEG', quality: 0.92 })
      input = Buffer.from(jpg)
    }

    const out = await sharp(input)
      .rotate()
      .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer({ resolveWithObject: true })

    const fileName = `studio-${pad(i + 1)}.webp`
    await writeFile(path.join(OUT_DIR, fileName), out.data)
    const orient = out.info.width >= out.info.height ? 'landscape' : 'portrait'
    console.log(
      `ok ${fileName} ${out.info.width}x${out.info.height} ${orient} (${Math.round(out.data.length / 1024)} KB)`
    )
  }

  console.log(`\n✔ Готово: ${files.length} фото → ${path.relative(ROOT, OUT_DIR)} (${OUT_URL})`)
}

main().catch((e) => {
  console.error('\n✖', e.stack || String(e))
  process.exit(1)
})
