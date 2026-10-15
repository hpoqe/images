<script setup lang="ts">
import { ref } from 'vue'
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
    @mouseleave="handleMouseLeave"
  >
    <div class="overflow-hidden">
      <img
        :src="photo.thumb"
        :alt="photo.title"
        class="w-full h-auto object-cover transition-all duration-500 ease-out group-hover:[filter:contrast(1.1)_brightness(1.1)]"
        loading="lazy"
      />
    </div>

    <figcaption
      class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
      <h3 class="text-sm font-medium text-accent">{{ photo.title }}</h3>
      <p v-if="photo.description" class="text-xs text-accent/60 mt-1 line-clamp-2">
        {{ photo.description }}
      </p>
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
</style>
