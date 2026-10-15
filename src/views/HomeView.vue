<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePhotos } from '@/composables/usePhotos'
import { useSiteStore } from '@/stores/site'

const router = useRouter()
const { allPhotos } = usePhotos()
const siteStore = useSiteStore()

const featuredPhotos = computed(() => allPhotos.slice(0, 6))

const stats = computed(() => {
  const catMap = new Map<string, number>()
  for (const photo of allPhotos) {
    for (const tag of photo.tags) {
      catMap.set(tag, (catMap.get(tag) || 0) + 1)
    }
  }
  return Array.from(catMap.entries()).map(([id, count]) => ({ id, count }))
})

const categoryNames: Record<string, string> = {
  landscape: '风景',
  portrait: '人像',
  street: '街拍',
  architecture: '建筑',
  nature: '自然',
  night: '夜景',
  other: '其他',
}

function goToCategory(categoryId: string) {
  router.push(`/gallery/${categoryId}`)
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero 区域 -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- 背景照片墙 -->
      <div class="absolute inset-0 grid grid-cols-4 gap-1 opacity-20">
        <div
          v-for="photo in featuredPhotos"
          :key="photo.id"
          class="overflow-hidden"
        >
          <img
            :src="photo.thumb"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-base/60 via-base/80 to-base" />

      <!-- 内容 -->
      <div class="relative z-10 text-center px-6 max-w-3xl">
        <img
          :src="siteStore.site.avatar"
          :alt="siteStore.site.author"
          class="w-28 h-28 rounded-full object-cover border-2 border-accent/30 mx-auto mb-6 shadow-lg shadow-accent/10"
        />
        <h1 class="text-4xl font-bold text-accent mb-3 tracking-tight">
          {{ siteStore.site.title }}
        </h1>
        <p class="text-lg text-accent/70 mb-2">
          {{ siteStore.site.author }}
        </p>
        <p class="text-base text-accent/50 max-w-md mx-auto leading-relaxed mb-8">
          {{ siteStore.site.bio }}
        </p>
        <div class="flex gap-4 justify-center">
          <button
            @click="router.push('/gallery')"
            class="px-6 py-3 rounded-full bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all duration-300"
          >
            浏览光影集
          </button>
          <button
            @click="router.push('/about')"
            class="px-6 py-3 rounded-full border border-white/10 text-accent/70 hover:text-accent hover:border-accent/30 transition-all duration-300"
          >
            关于我
          </button>
        </div>
      </div>
    </section>

    <!-- 统计数据 -->
    <section class="py-16 px-6 border-t border-white/5">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-2xl font-bold text-accent mb-8 text-center">探索分类</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <button
            v-for="cat in stats"
            :key="cat.id"
            @click="goToCategory(cat.id)"
            class="group relative overflow-hidden rounded-xl border border-white/10 bg-surface/50 hover:border-accent/40 transition-all duration-300 text-left backdrop-blur"
          >
            <div class="p-5">
              <h3 class="text-lg font-medium text-accent mb-1">
                {{ categoryNames[cat.id] || cat.id }}
              </h3>
              <p class="text-sm text-accent/50">{{ cat.count }} 张照片</p>
            </div>
            <div class="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </section>

    <!-- 精选照片 -->
    <section class="py-16 px-6 border-t border-white/5">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-2xl font-bold text-accent mb-8 text-center">精选瞬间</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div
            v-for="photo in featuredPhotos"
            :key="photo.id"
            class="group relative overflow-hidden rounded-xl border border-white/10 aspect-[4/3] cursor-pointer"
            @click="router.push(`/gallery/${photo.tags[0] || 'other'}`)"
          >
            <img
              :src="photo.thumb"
              :alt="photo.title"
              class="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:[filter:brightness(1.1)_saturate(1.2)]"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <div>
                <h3 class="text-sm font-medium text-accent">{{ photo.title }}</h3>
                <p class="text-xs text-accent/60 mt-0.5">{{ photo.tags.join(' · ') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 关于 -->
    <section class="py-16 px-6 border-t border-white/5">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-2xl font-bold text-accent mb-6">关于这个网站</h2>
        <p class="text-accent/60 leading-relaxed mb-4">
          这是一个个人摄影集，用来记录生活中那些值得定格的光影瞬间。
          每一张照片都承载着某个时刻的温度与故事。
        </p>
        <p class="text-accent/40 text-sm">
          使用 Vue 3 + TypeScript + Tailwind CSS 构建 · 部署于 Cloudflare Pages
        </p>
      </div>
    </section>
  </div>
</template>
