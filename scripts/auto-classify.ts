import { readdir, rename, mkdir, copyFile, unlink } from 'node:fs/promises'
import { join, extname, basename } from 'node:path'
import { existsSync } from 'node:fs'

const ORIGINALS_DIR = join(import.meta.dirname, '..', 'originals')
const OLLAMA_URL = 'http://localhost:11434/api/generate'
const MODEL = 'qwen3-vl:4b'

const CATEGORIES = [
  'landscape',
  'portrait',
  'street',
  'architecture',
  'nature',
  'night',
  'other',
]

const CATEGORY_DESC: Record<string, string> = {
  landscape: '风景（山川、湖泊、海洋、田野、天空等自然风光）',
  portrait: '人像（人物特写、半身照、全身照）',
  street: '街拍（城市街道、行人、市井生活）',
  architecture: '建筑（建筑物、桥梁、室内空间）',
  nature: '自然（动植物、花卉、昆虫、鸟类）',
  night: '夜景（夜晚的城市灯光、星空、月光）',
  other: '其他无法归类的照片',
}

async function classifyImage(imagePath: string): Promise<string> {
  const imageBuffer = await import('node:fs').then(fs => fs.promises.readFile(imagePath))
  const base64 = imageBuffer.toString('base64')

  const prompt = `请分析这张照片，并从以下类别中选择一个最合适的：
${CATEGORIES.map(c => `- ${c}: ${CATEGORY_DESC[c]}`).join('\n')}

只回复类别名称（如 landscape），不要加任何解释。`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30 秒超时

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        images: [base64],
        stream: false,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const data = await response.json()
    const result = data.response?.trim().toLowerCase() || ''
    
    for (const cat of CATEGORIES) {
      if (result.includes(cat)) return cat
    }
    
    return 'other'
  } catch (err) {
    console.error(`    API 错误：${(err as Error).message}`)
    return 'other'
  }
}

async function main() {
  // 创建分类文件夹
  for (const cat of CATEGORIES) {
    const dir = join(ORIGINALS_DIR, cat)
    if (!existsSync(dir)) {
      await mkdir(dir)
      console.log(` 创建文件夹：${cat}`)
    }
  }

  // 扫描根目录下的图片（跳过子文件夹）
  const entries = await readdir(ORIGINALS_DIR, { withFileTypes: true })
  const imageFiles = entries
    .filter((e) => e.isFile())
    .filter((f) => ['.jpg', '.jpeg', '.png'].includes(extname(f.name).toLowerCase()))

  if (imageFiles.length === 0) {
    console.log('✅ 根目录下没有需要分类的图片。')
    return
  }

  console.log(`\n📷 找到 ${imageFiles.length} 张待分类图片\n`)

  let classified = 0
  let errors = 0

  for (const file of imageFiles) {
    const filePath = join(ORIGINALS_DIR, file.name)
    const name = basename(file.name, extname(file.name))
    
    process.stdout.write(`  分类：${name.substring(0, 20)}... `)
    
    const category = await classifyImage(filePath)
    
    // 使用 copy + delete 代替 rename，更可靠
    const destDir = join(ORIGINALS_DIR, category)
    const destPath = join(destDir, file.name)
    
    try {
      await copyFile(filePath, destPath)
      await unlink(filePath)
      console.log(`→ ${category} ✅`)
      classified++
    } catch (err) {
      console.log(`❌ 移动失败：${(err as Error).message}`)
      errors++
    }
  }

  console.log(`\n 完成！分类 ${classified} 张，失败 ${errors} 张。`)
  console.log('\n现在运行 npm run process 生成缩略图和标签。')
}

main().catch((err) => {
  console.error('分类失败:', err)
  process.exit(1)
})
