<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import type { Photo } from '@/types/photo'

const props = defineProps<{
  photo: Photo | null
  visible: boolean
  prevPhoto: Photo | null
  nextPhoto: Photo | null
}>()

const emit = defineEmits<{
  close: []
  prev: []
  next: []
}>()

function close() {
  emit('close')
}

function goToPrev() {
  if (props.prevPhoto) emit('prev')
}

function goToNext() {
  if (props.nextPhoto) emit('next')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowLeft') goToPrev()
  else if (e.key === 'ArrowRight') goToNext()
}

watch(
  () => props.visible,
  (open) => {
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeydown)
    } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeydown)
    }
  }
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="visible && photo"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
        @click.self="close"
      >
        <!-- 关闭按钮 -->
        <button
          class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-accent transition-colors"
          @click="close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <!-- 上一张 -->
        <button
          v-if="prevPhoto"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-accent transition-colors"
          @click.stop="goToPrev"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <!-- 下一张 -->
        <button
          v-if="nextPhoto"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-accent transition-colors"
          @click.stop="goToNext"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <!-- 照片内容 -->
        <div class="max-w-5xl max-h-[85vh] px-16 flex flex-col items-center">
          <img
            :src="photo.src"
            :alt="photo.title"
            class="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
          />

          <div class="mt-4 text-center">
            <h3 class="text-lg font-medium text-accent mb-1">{{ photo.title }}</h3>
            <p v-if="photo.description" class="text-sm text-accent/60 mb-2">{{ photo.description }}</p>
            <div v-if="photo.tags.length" class="flex gap-2 justify-center flex-wrap">
              <span
                v-for="tag in photo.tags"
                :key="tag"
                class="text-xs px-3 py-1 rounded-full bg-white/10 text-accent/80"
              >{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-active img {
  transition: transform 0.3s ease;
}

.lightbox-enter-from img {
  transform: scale(0.95);
}
</style>
