<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePhotos } from '@/composables/usePhotos'
import PhotoCard from '@/components/PhotoCard.vue'
import PhotoLightbox from '@/components/PhotoLightbox.vue'
import type { Photo } from '@/types/photo'

const { visiblePhotos, hasMore, sentinelRef } = usePhotos()

const lightboxVisible = ref(false)
const lightboxIndex = ref(-1)

const currentPhoto = computed(() =>
  lightboxIndex.value >= 0 ? visiblePhotos.value[lightboxIndex.value] : null
)
const prevPhoto = computed(() =>
  lightboxIndex.value > 0 ? visiblePhotos.value[lightboxIndex.value - 1] : null
)
const nextPhoto = computed(() =>
  lightboxIndex.value >= 0 && lightboxIndex.value < visiblePhotos.value.length - 1
    ? visiblePhotos.value[lightboxIndex.value + 1]
    : null
)

function openLightbox(photo: Photo) {
  lightboxIndex.value = visiblePhotos.value.findIndex((p) => p.id === photo.id)
  lightboxVisible.value = true
}

function closeLightbox() {
  lightboxVisible.value = false
}

function goToPrev() {
  if (lightboxIndex.value > 0) lightboxIndex.value--
}

function goToNext() {
  if (lightboxIndex.value < visiblePhotos.value.length - 1) lightboxIndex.value++
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 pt-24 pb-16">
    <h1 class="text-2xl font-bold text-accent mb-2">光影集</h1>
    <p class="text-accent/60 text-sm mb-10">用镜头记录每一个值得停留的瞬间。</p>

    <div class="columns-1 sm:columns-2 lg:columns-3 gap-4">
      <div
        v-for="(photo, index) in visiblePhotos"
        :key="photo.id"
        class="break-inside-avoid mb-4"
      >
        <PhotoCard :photo="photo" @click="openLightbox" />
      </div>
    </div>

    <!-- 无限滚动哨兵 -->
    <div v-if="hasMore" ref="sentinelRef" class="py-8 text-center text-accent/40 text-sm">
      加载更多...
    </div>
    <div v-else class="py-8 text-center text-accent/40 text-sm">
      已展示全部照片
    </div>

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
