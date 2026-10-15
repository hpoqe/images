import exifr from 'exifr'
import sharp from 'sharp'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'

const CONTENT_PATH = join(import.meta.dirname, '..', 'content', 'photos.json')
const ORIGINALS_DIR = join(import.meta.dirname, '..', 'originals')

const photos = JSON.parse(readFileSync(CONTENT_PATH, 'utf-8'))

function getOriginalPath(id: string): string | null {
  for (const ext of ['.jpg', '.jpeg', '.png']) {
    const p = join(ORIGINALS_DIR, `${id}${ext}`)
    if (existsSync(p)) return p
  }
  return null
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

async function processTags() {
  for (const photo of photos) {
    const originalPath = getOriginalPath(photo.id)
    if (!originalPath) {
      photo.tags = ['unknown']
      continue
    }

    const tags: string[] = []

    // 1. EXIF 技术标签
    try {
      const exif = await exifr.parse(originalPath, {
        Make: true, Model: true, FocalLength: true, ISO: true
      })
      if (exif) {
        if (exif.Make && exif.Model) {
          const camera = `${exif.Make} ${exif.Model}`.replace(/\s+/g, ' ').trim()
          tags.push(camera)
        }
        if (exif.FocalLength) {
          tags.push(`${Math.round(exif.FocalLength)}mm`)
        } else if (exif.ISO) {
          tags.push(`ISO${exif.ISO}`)
        }
      }
    } catch {}

    // 2. 颜色标签
    try {
      const stats = await sharp(originalPath).stats()
      const [r, g, b] = stats.dominant
      const { h, s, l } = rgbToHsl(r, g, b)
      
      let colorTag = 'neutral'
      if (s < 20) colorTag = 'monochrome'
      else if (h < 15 || h >= 345) colorTag = 'red'
      else if (h < 45) colorTag = 'orange'
      else if (h < 75) colorTag = 'yellow'
      else if (h < 165) colorTag = 'green'
      else if (h < 255) colorTag = 'blue'
      else if (h < 345) colorTag = 'purple'
      
      tags.push(colorTag)
    } catch {}

    // 3. 时间标签
    const date = new Date(photo.date)
    const month = date.getMonth() + 1
    tags.push(`${month}月`)

    // 去重，保留前 3 个
    photo.tags = [...new Set(tags)].slice(0, 3)
  }

  writeFileSync(CONTENT_PATH, JSON.stringify(photos, null, 2), 'utf-8')
  console.log(`✅ 已为 ${photos.length} 张照片生成标签。`)
}

processTags().catch(console.error)
