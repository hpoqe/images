<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePhotos } from '@/composables/usePhotos'

const router = useRouter()
const { allPhotos } = usePhotos()

const categories = computed(() => {
  const catMap = new Map<string, number>()
  for (const photo of allPhotos) {
    for (const tag of photo.tags) {
      catMap.set(tag, (catMap.get(tag) || 0) + 1)
    }
  }
  return Array.from(catMap.entries())
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
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
  <div class="max-w-6xl mx-auto px-6 pt-24 pb-16">
    <h1 class="text-2xl font-bold text-accent mb-2">光影集</h1>
    <p class="text-accent/60 text-sm mb-10">用镜头记录每一个值得停留的瞬间。</p>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="goToCategory(cat.id)"
        class="group relative overflow-hidden rounded-xl border border-white/10 bg-surface hover:border-accent/40 transition-all duration-300 text-left"
      >
        <div class="p-6">
          <h3 class="text-lg font-medium text-accent mb-1">
            {{ categoryNames[cat.id] || cat.id }}
          </h3>
          <p class="text-sm text-accent/60">
            {{ cat.count }} 张照片
          </p>
        </div>
        <div class="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  </div>
</template>
