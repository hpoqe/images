<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePhotos } from '@/composables/usePhotos'
import SphereGallery from '@/components/SphereGallery.vue'
import PhotoLightbox from '@/components/PhotoLightbox.vue'
import type { Photo } from '@/types/photo'

const route = useRoute()
const router = useRouter()
const { visiblePhotos } = usePhotos()

const categoryId = computed(() => route.params.category as string)

const categoryPhotos = computed(() =>
  visiblePhotos.value.filter((p) => p.tags.includes(categoryId.value))
)

const categoryNames: Record<string, string> = {
  landscape: '风景',
  portrait: '人像',
  street: '街拍',
  architecture: '建筑',
  nature: '自然',
  night: '夜景',
  other: '其他',
}

const lightboxVisible = ref(false)
const lightboxIndex = ref(-1)

const currentPhoto = computed(() =>
  lightboxIndex.value >= 0 ? categoryPhotos.value[lightboxIndex.value] : null
)
const prevPhoto = computed(() =>
  lightboxIndex.value > 0 ? categoryPhotos.value[lightboxIndex.value - 1] : null
)
const nextPhoto = computed(() =>
  lightboxIndex.value >= 0 && lightboxIndex.value < categoryPhotos.value.length - 1
    ? categoryPhotos.value[lightboxIndex.value + 1]
    : null
)

function openLightbox(photo: Photo) {
  lightboxIndex.value = categoryPhotos.value.findIndex((p) => p.id === photo.id)
  lightboxVisible.value = true
}

function closeLightbox() {
  lightboxVisible.value = false
}

function goToPrev() {
  if (lightboxIndex.value > 0) lightboxIndex.value--
}

function goToNext() {
  if (lightboxIndex.value < categoryPhotos.value.length - 1) lightboxIndex.value++
}

function goBack() {
  router.push('/gallery')
}
</script>

<template>
  <div class="min-h-screen pt-24 pb-16">
    <div class="max-w-6xl mx-auto px-6">
      <button
        @click="goBack"
        class="mb-6 text-sm text-accent/60 hover:text-accent transition-colors"
      >
        ← 返回分类列表
      </button>

      <h1 class="text-3xl font-bold text-accent mb-2">
        {{ categoryNames[categoryId] || categoryId }}
      </h1>
      <p class="text-accent/60 text-sm mb-10">
        共 {{ categoryPhotos.length }} 张照片 · 拖拽旋转地球仪 · 点击照片查看
      </p>
    </div>

    <!-- 地球仪画廊 -->
    <SphereGallery
      :photos="categoryPhotos"
      @click="openLightbox"
    />

    <!-- Lightbox -->
    <PhotoLightbox
      :photo="currentPhoto"
      :visible="lightboxVisible"
      :prev-photo="prevPhoto"
      :next-photo="nextPhoto"
      @close="closeLightbox"
      @prev="goToPrev"
      @next="goToNext"
    />
  </div>
</template>
