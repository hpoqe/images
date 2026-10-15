<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Photo } from '@/types/photo'

const props = defineProps<{
  photo: Photo
}>()

defineEmits<{
  click: [photo: Photo]
}>()

const cardRef = ref<HTMLElement | null>(null)
const tiltStyle = ref({ transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)' })

function handleMouseMove(e: MouseEvent) {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const rotateX = ((y - centerY) / centerY) * -2
  const rotateY = ((x - centerX) / centerX) * 2
  tiltStyle.value = {
    transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
  }
}

function handleMouseLeave() {
  tiltStyle.value = { transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)' }
}
</script>

<template>
  <figure
    ref="cardRef"
    class="photo-card group relative overflow-hidden rounded-xl border border-white/10 bg-surface cursor-pointer"
    :style="tiltStyle"
    @click="$emit('click', photo)"
    @mousemove="handleMouseMove"
0
  >
    <div class="overflow-hidden">
      <img
        :src="photo.thumb"
        :alt="photo
      />
    </div>

    <figcaption
      class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
      <h3 class="text-sm font-medium text-accent mb-2">{{ photo.title }}</h3>
      
      <!-- EXIF 信息 -->
      <div v-if="photo.exif" class="space-y-1 text-xs text-accent/70">
        <div v-if="photo.exif.dateTime" class="flex items-center gap-1.5">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ photo.exif.dateTime }}</span>
        </div>
        <div v-if="photo.exif.camera" class="flex items-center gap-1.5">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          </svg>
          <span>{{ photo.exif.camera }}</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <span v-if="photo.exif.focalLength" class="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">
            {{ photo.exif.focalLength }}
          </span>
          <span v-if="photo.exif.aperture" class="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">
            {{ photo.exif.aperture }}
          </span>
          <span v-if="photo.exif.shutterSpeed" class="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">
            {{ photo.exif.shutterSpeed }}
          </span>
          <span v-if="photo.exif.iso" class="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">
            ISO{{ photo.exif.iso }}
          </span>
        </div>
      </div>

      <div v-if="photo.tags.length" class="flex gap-1.5 mt-2 flex-wrap">
        <span
          v-for="tag in photo.tags"
          :key="tag"
          class="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-accent/80"
        >{{ tag }}</span>
      </div>
    </figcaption>
  </figure>
</template>

<style scoped>
.photo-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  will-change: transform;
}

.photo-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

/* 默认灰色，悬停时恢复彩色并增强 */
.photo-grayscale {
  filter: grayscale(100%);
}
</style>
