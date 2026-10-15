import sharp from 'sharp'
import exifr from 'exifr'
import { readdir, stat, mkdir, writeFile } from 'node:fs/promises'
import { join, extname, basename } from 'node:path'

const ORIGINALS_DIR = join(import.meta.dirname, '..', 'originals')
const LARGE_DIR = join(import.meta.dirname, '..', 'public', 'photos', 'large')
const THUMBS_DIR = join(import.meta.dirname, '..', 'public', 'photos', 'thumbs')
const CONTENT_DIR = join(import.meta.dirname, '..', 'content')

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png'])

interface PhotoEntry {
  id: string
  title: string
  description: string
  uploadedAt: string
  date: string
  tags: string[]
  src: string
  thumb: string
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true })
}

async function processPhotos() {
  await ensureDir(LARGE_DIR)
  await ensureDir(THUMBS_DIR)
  await ensureDir(CONTENT_DIR)

  const files = await readdir(ORIGINALS_DIR)
  const imageFiles = files.filter((f) => IMAGE_EXTS.has(extname(f).toLowerCase()))

  if (imageFiles.length === 0) {
    console.log('️  originals/ 文件夹中没有找到图片文件。')
    console.log('   请将原图放入 originals/ 文件夹后重新运行。')
    return
  }

  console.log(`📷 找到 ${imageFiles.length} 张图片，开始处理...\n`)

  const photos: PhotoEntry[] = []

  for (const file of imageFiles) {
    const name = basename(file, extname(file))
    const inputPath = join(ORIGINALS_DIR, file)
    const largeOutput = join(LARGE_DIR, `${name}.webp`)
    const thumbOutput = join(THUMBS_DIR, `${name}.webp`)

    process.stdout.write(`  处理: ${file}`)

    try {
      // 读取 EXIF 拍摄时间
      let dateStr: string
      try {
        const exif = await exifr.parse(inputPath, { DateTimeOriginal: true })
        if (exif?.DateTimeOriginal) {
          const d = exif.DateTimeOriginal instanceof Date ? exif.DateTimeOriginal : new Date(exif.DateTimeOriginal)
          dateStr = d.toISOString()
        } else {
          const fileStat = await stat(inputPath)
          dateStr = fileStat.mtime.toISOString()
        }
      } catch {
        const fileStat = await stat(inputPath)
        dateStr = fileStat.mtime.toISOString()
      }

      // 生成大图 WebP
      await sharp(inputPath)
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(largeOutput)

      // 生成缩略图 WebP
      await sharp(inputPath)
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 70 })
        .toFile(thumbOutput)

      const date = dateStr.split('T')[0]

      photos.push({
        id: name,
        title: name,
        description: '',
        uploadedAt: dateStr,
        date,
        tags: [],
        src: `/photos/large/${name}.webp`,
        thumb: `/photos/thumbs/${name}.webp`,
      })

      console.log(' ✅')
    } catch (err) {
      console.log(` ❌ ${(err as Error).message}`)
    }
  }

  // 写入 photos.json
  const outputPath = join(CONTENT_DIR, 'photos.json')
  await writeFile(outputPath, JSON.stringify(photos, null, 2), 'utf-8')

  console.log(`\n🎉 完成！共处理 ${photos.length} 张图片。`)
  console.log(`   输出: ${outputPath}`)
}

processPhotos().catch((err) => {
  console.error('处理失败:', err)
  process.exit(1)
})
