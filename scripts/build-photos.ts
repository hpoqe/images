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
  exif?: {
    camera?: string
    lens?: string
    focalLength?: string
    aperture?: string
    shutterSpeed?: string
    iso?: number
    dateTime?: string
  }
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true })
}

async function processPhotos() {
  await ensureDir(LARGE_DIR)
  await ensureDir(THUMBS_DIR)
  await ensureDir(CONTENT_DIR)

  const photos: PhotoEntry[] = []

  const entries = await readdir(ORIGINALS_DIR, { withFileTypes: true })
  const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name)
  const dirsToScan = folders.length > 0 ? folders : ['']

  console.log(`📁 找到 ${dirsToScan.length} 个分类文件夹：${dirsToScan.join(', ') || '(根目录)'}\n`)

  for (const folder of dirsToScan) {
    const folderPath = join(ORIGINALS_DIR, folder)
    const files = await readdir(folderPath)
    const imageFiles = files.filter((f) => IMAGE_EXTS.has(extname(f).toLowerCase()))

    if (imageFiles.length === 0) continue

    console.log(`📷 处理 [${folder || '根目录'}]: ${imageFiles.length} 张图片`)

    for (const file of imageFiles) {
      const name = basename(file, extname(file))
      const inputPath = join(folderPath, file)
      const largeOutput = join(LARGE_DIR, `${name}.webp`)
      const thumbOutput = join(THUMBS_DIR, `${name}.webp`)

      process.stdout.write(`   ${file}`)

      try {
        let dateStr: string
        let exifData: any = {}

        try {
          const exif = await exifr.parse(inputPath, {
            DateTimeOriginal: true,
            Make: true,
            Model: true,
            LensModel: true,
            FocalLength: true,
            FNumber: true,
            ExposureTime: true,
            ISO: true,
          })

          if (exif?.DateTimeOriginal) {
            const d = exif.DateTimeOriginal instanceof Date ? exif.DateTimeOriginal : new Date(exif.DateTimeOriginal)
            dateStr = d.toISOString()
            exifData.dateTime = d.toLocaleString('zh-CN')
          } else {
            const fileStat = await stat(inputPath)
            dateStr = fileStat.mtime.toISOString()
          }

          if (exif?.Make && exif?.Model) {
            exifData.camera = `${exif.Make} ${exif.Model}`.replace(/\s+/g, ' ').trim()
          }
          if (exif?.LensModel) {
            exifData.lens = exif.LensModel
          }
          if (exif?.FocalLength) {
            exifData.focalLength = `${Math.round(exif.FocalLength)}mm`
          }
          if (exif?.FNumber) {
            exifData.aperture = `f/${exif.FNumber}`
          }
          if (exif?.ExposureTime) {
            const exp = exif.ExposureTime
            if (exp < 1) {
              exifData.shutterSpeed = `1/${Math.round(1/exp)}s`
            } else {
              exifData.shutterSpeed = `${exp}s`
            }
          }
          if (exif?.ISO) {
            exifData.iso = exif.ISO
          }
        } catch {
          const fileStat = await stat(inputPath)
          dateStr = fileStat.mtime.toISOString()
        }

        await sharp(inputPath)
          .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(largeOutput)

        await sharp(inputPath)
          .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 70 })
          .toFile(thumbOutput)

        const date = dateStr.split('T')[0]
        const tags = folder ? [folder] : []

        const photo: PhotoEntry = {
          id: name,
          title: name,
          description: '',
          uploadedAt: dateStr,
          date,
          tags,
          src: `/photos/large/${name}.webp`,
          thumb: `/photos/thumbs/${name}.webp`,
        }

        if (Object.keys(exifData).length > 0) {
          photo.exif = exifData
        }

        photos.push(photo)
        console.log(' ✅')
      } catch (err) {
        console.log(` ❌ ${(err as Error).message}`)
      }
    }
    console.log('')
  }

  const outputPath = join(CONTENT_DIR, 'photos.json')
  await writeFile(outputPath, JSON.stringify(photos, null, 2), 'utf-8')

  console.log(`🎉 完成！共处理 ${photos.length} 张图片。`)
  console.log(`   输出：${outputPath}`)
}

processPhotos().catch((err) => {
  console.error('处理失败:', err)
  process.exit(1)
})
