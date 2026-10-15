<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Photo } from '@/types/photo'

defineProps<{
  photos: Photo[]
}>()

defineEmits<{
  click: [photo: Photo]
}>()

const rotationX = ref(0)
const rotationY = ref(0)
let isDragging = false
let startX = 0
let startY = 0
let autoRotate = true
let animationId: number

const RADIUS = 350

function getPhotoStyle(index: number, total: number) {
  const goldenRatio = (1 + Math.sqrt(5)) / 2
  const theta = 2 * Math.PI * index / goldenRatio
  const phi = Math.acos(1 - 2 * (index + 0.5) / total)

  const x = RADIUS * Math.sin(phi) * Math.cos(theta)
  const y = RADIUS * Math.sin(phi) * Math.sin(theta)
  const z = RADIUS * Math.cos(phi)

  const scale = Math.max(0.3, (z + RADIUS) / (2 * RADIUS))
  const opacity = Math.max(0.2, (z + RADIUS) / (2 * RADIUS))

  return {
    transform: `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`,
    opacity,
    zIndex: Math.round(z + RADIUS),
  }
}

function animate() {
  if (!autoRotate) return
  rotationY.value += 0.15
  animationId = requestAnimationFrame(animate)
}

function handleMouseDown(e: MouseEvent) {
  isDragging = true
  autoRotate = false
  cancelAnimationFrame(animationId)
  startX = e.clientX
  startY = e.clientY
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging) return
  const deltaX = e.clientX - startX
  const deltaY = e.clientY - startY
  rotationY.value += deltaX * 0.3
  rotationX.value -= deltaY * 0.3
  rotationX.value = Math.max(-60, Math.min(60, rotationX.value))
  startX = e.clientX
  startY = e.clientY
}

function handleMouseUp() {
  isDragging = false
  setTimeout(() => {
    autoRotate = true
    animate()
  }, 3000)
}

onMounted(() => {
  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})
</script>

<template>
  <div
    class="sphere-container"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <div
      class="sphere"
      :style="{ transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)` }"
    >
      <div
        v-for="(photo, index) in photos"
        :key="photo.id"
        class="photo-item"
        :style="getPhotoStyle(index, photos.length)"
        @click="$emit('click', photo)"
      >
        <img :src="photo.thumb" :alt="photo.title" loading="lazy" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.sphere-container {
  width: 100%;
  height: 700px;
  perspective: 800px;
  cursor: grab;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sphere-container:active {
  cursor: grabbing;
}

.sphere {
  width: 0;
  height: 0;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.05s linear;
}

.photo-item {
  position: absolute;
  width: 120px;
  height: 90px;
  left: -60px;
  top: -45px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  backface-visibility: hidden;
}

.photo-item:hover {
  box-shadow: 0 8px 30px rgba(167, 139, 250, 0.3);
  z-index: 999 !important;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}

.photo-item:hover img {
  filter: grayscale(0) contrast(1.2) brightness(1.15) saturate(1.25);
}
</style>
