# 光影笔记 - 个人摄影集网站

一个基于 Vue 3 的个人摄影集网站，支持照片分类浏览、3D 地球仪旋转展示、EXIF 拍摄参数显示、Lightbox 全屏查看等功能。

**在线预览：** https://images-4bg.pages.dev

## 项目概述

本项目是一个完整的个人摄影作品展示平台，从照片处理到网站部署提供了一站式解决方案。主要特点：

- 使用 Ollama 本地 AI 模型自动分类照片
- 自动提取 EXIF 拍摄参数（相机、焦距、光圈、快门、ISO）
- 3D 球体旋转画廊，照片均匀分布在球面上
- 深色主题设计，照片默认黑白，悬停变彩色
- 响应式布局，支持桌面和移动端
- 部署于 Cloudflare Pages，全球 CDN 加速

## 项目结构

```
photo-gallery/
├── content/                  # 数据文件
│   ├── photos.json           # 照片元数据（ID、标题、EXIF、标签等）
│   ├── modules.json          # 网站模块配置
│   └── site.json             # 站点基本信息
├── originals/                # 原始照片文件夹（按分类存放）
│   ├── landscape/            # 风景
│   ├── portrait/             # 人像
│   ├── street/               # 街拍
│   ├── architecture/         # 建筑
│   ├── nature/               # 自然
│   ├── night/                # 夜景
│   └── other/                # 其他
├── public/photos/            # 处理后的 WebP 照片
│   ├── large/                # 大图（最长边 1600px）
│   └── thumbs/               # 缩略图（最长边 400px）
├── scripts/                  # 工具脚本
│   ├── build-photos.ts       # 照片处理脚本（压缩、生成缩略图、提取 EXIF）
│   ├── auto-classify.ts      # AI 自动分类脚本（使用 Ollama qwen3-vl）
│   └── generate-tags.ts      # 标签生成脚本
├── src/
│   ├── components/           # 可复用组件
│   │   ├── PhotoCard.vue     # 照片卡片（3D 倾斜、悬停效果）
│   │   ├── PhotoLightbox.vue # 全屏照片查看器
│   │   ├── PhotoGrid.vue     # 瀑布流照片网格
│   │   ├── SphereGallery.vue # 3D 球体旋转画廊
│   │   └── ModuleCard.vue    # 模块入口卡片
│   ├── composables/          # 可复用逻辑
│   │   └── usePhotos.ts      # 照片数据管理（分页、无限滚动）
│   ├── router/               # 路由配置
│   │   ── index.ts
│   ├── stores/               # Pinia 状态管理
│   │   └── site.ts
│   ├── types/                # TypeScript 类型定义
│   │   └── photo.ts
│   ├── views/                # 页面组件
│   │   ├── HomeView.vue      # 首页（个人介绍、分类入口、精选照片）
│   │   ├── GalleryView.vue   # 光影集（分类列表）
│   │   ├── CategoryView.vue  # 分类详情页（3D 球体画廊）
│   │   └── AboutView.vue     # 关于页面
│   ├── App.vue               # 根组件（导航栏、路由过渡）
│   └── main.ts               # 入口文件
├── .github/workflows/        # GitHub Actions 部署配置
│   └── deploy.yml            # 自动部署到 GitHub Pages
├── package.json
├── vite.config.ts
── tailwind.config.js
└── tsconfig.json
```

## 子模块说明

### 首页 (HomeView)
- Hero 区域：背景照片墙 + 个人介绍
- 分类统计：展示 7 个分类及照片数量
- 精选瞬间：前 6 张照片网格展示
- 关于网站：简短介绍和技术栈

### 光影集 (GalleryView)
- 分类卡片列表，点击进入对应分类
- 显示每个分类的照片数量

### 分类详情 (CategoryView)
- 3D 球体旋转画廊展示该分类所有照片
- 拖拽旋转、滚轮加速、自动旋转
- 点击照片打开 Lightbox 全屏查看

### 照片卡片 (PhotoCard)
- 3D 透视倾斜效果（跟随鼠标）
- 默认黑白，悬停变彩色并增强
- 显示 EXIF 拍摄参数

### 球体画廊 (SphereGallery)
- 斐波那契球体算法均匀分布照片
- 惯性拖拽旋转
- 深度感知：近处照片大且清晰，远处小且透明
- 悬停发光效果

### Lightbox (PhotoLightbox)
- 全屏黑色背景展示
- 键盘左右键切换、ESC 关闭
- 淡入淡出过渡动画

## 使用流程

### 1. 准备照片
将原始照片（JPG/JPEG/PNG）放入 `originals/` 文件夹，可以按分类创建子文件夹：
```
originals/
├── landscape/    # 风景照
├── portrait/     # 人像照
└── ...
```

### 2. 自动分类（可选）
如果照片没有分类，使用 AI 自动分类：
```bash
npm run classify
```
脚本会使用本地 Ollama 的 `qwen3-vl:4b` 模型分析照片内容，自动移动到对应分类文件夹。

### 3. 处理照片
```bash
npm run process
```
脚本会：
- 为每张照片生成 WebP 大图（1600px）和缩略图（400px）
- 提取 EXIF 拍摄参数（相机、焦距、光圈、快门、ISO、拍摄时间）
- 生成 `content/photos.json` 元数据文件

### 4. 本地开发
```bash
npm install
npm run dev
```
访问 http://localhost:5173 预览。

### 5. 部署
```bash
npm run build
npx wrangler pages deploy dist --project-name=images --branch=main --commit-dirty=true
```

## 技术说明

### 技术栈
- **前端框架：** Vue 3 + TypeScript
- **构建工具：** Vite 8
- **样式：** Tailwind CSS 3
- **路由：** Vue Router 4（懒加载）
- **状态管理：** Pinia
- **平滑滚动：** Lenis
- **图片处理：** Sharp
- **EXIF 读取：** Exifr
- **AI 分类：** Ollama (qwen3-vl:4b)
- **部署：** Cloudflare Pages

### 核心特性
- **3D 球体画廊：** 使用 CSS `transform-style: preserve-3d` 和斐波那契球体算法，照片均匀分布在球面上，支持拖拽旋转和惯性滑动
- **照片美化：** CSS filter 实现黑白→彩色过渡，悬停时增强对比度和饱和度
- **无限滚动：** IntersectionObserver 实现滚动到底部自动加载
- **EXIF 提取：** 使用 Exifr 库读取相机型号、焦距、光圈、快门速度、ISO 等参数

### 性能优化
- WebP 格式压缩，大图 1600px / 缩略图 400px
- 图片懒加载（loading="lazy"）
- 路由懒加载（动态 import）
- Cloudflare CDN 全球加速

## 许可证

MIT
