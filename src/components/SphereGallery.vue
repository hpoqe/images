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
let velocityX = 0
let velocityY = 0
let autoRotate = true
let animationId: number
let lastTime = 0

const RADIUS = 400

function getPhotoStyle(index: number, total: number) {
  const goldenRatio = (1 + Math.sqrt(5)) / 2
  const theta = 2 * Math.PI * index / goldenRatio
  const phi = Math.acos(1 - 2 * (index + 0.5) / total)

  const x = RADIUS * Math.sin(phi) * Math.cos(theta)
  const y = RADIUS * Math.sin(phi) * Math.sin(theta)
  const z = RADIUS * Math.cos(phi)

  const depth = (z + RADIUS) / (2 * RADIUS)
  const scale = 0.4 + depth * 0.8
  const opacity = 0.15 + depth * 0.85

  return {
    transform: `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`,
    opacity,
    zIndex: Math.round(depth * 1000),
  }
}

function animate(time: number) {
  const delta = lastTime ? (time - lastTime) / 16.67 : 1
  lastTime = time

  if (!isDragging) {
    if (autoRotate) {
      velocityY = 0.12
      velocityX = 0.02
    } else {
      velocityX *= 0.95
      velocityY *= 0.95
      if (Math.abs(velocityX) < 0.01 && Math.abs(velocityY) < 0.01) {
        autoRotate = true
      }
    }
  }

  rotationY.value += velocityY * delta
  rotationX.value += velocityX * delta
  rotationX.value = Math.max(-70, Math.min(70, rotationX.value))

  animationId = requestAnimationFrame(animate)
}

function handleMouseDown(e: MouseEvent) {
  isDragging = true
  autoRotate = false
  velocityX = 0
  velocityY = 0
  startX = e.clientX
  startY = e.clientY
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging) return
  const deltaX = e.clientX - startX
  const deltaY = e.clientY - startY
  velocityY = deltaX * 0.4
  velocityX = -deltaY * 0.4
  rotationY.value += velocityY
  rotationX.value += velocityX
  rotationX.value = Math.max(-70, Math.min(70, rotationX.value))
  startX = e.clientX
  startY = e.clientY
}

function handleMouseUp() {
  isDragging = false
}

function handleWheel(e: WheelEvent) {
  e.preventDefault()
  velocityY += e.deltaY * 0.05
  autoRotate = false
}

onMounted(() => {
  animationId = requestAnimationFrame(animate)
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
    @wheel="handleWheel"
  >
    <div class="sphere-glow" />
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
        <div class="photo-overlay">
          <span class="photo-title">{{ photo.title }}</span>
        </div>
      </div>
    </div>
    <div class="sphere-hint">
      <span>拖拽旋转</span>
      <span class="mx-2">·</span>
      <span>滚轮加速</span>
      <span class="mx-2">·</span>
      <span>点击放大</span>
    </div>
  </div>
</template>

<style scoped>
.sphere-container {
  width: 100%;
  height: 750px;
  perspective: 900px;
  cursor: grab;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, rgba(167, 139, 250, 0.03) 0%, transparent 70%);
}

.sphere-container:active {
  cursor: grabbing;
}

.sphere-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.06) 0%, transparent 60%);
  pointer-events: none;
  animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 1; }
}

.sphere {
  width: 0;
  height: 0;
  position: relative;
  transform-style: preserve-3d;
}

.photo-item {
  position: absolute;
  width: 140px;
  height: 100px;
  left: -70px;
  top: -50px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  backface-visibility: hidden;
  transition: box-shadow 0.3s ease;
}

.photo-item:hover {
  box-shadow: 0 0 30px rgba(167, 139, 250, 0.4), 0 8px 40px rgba(0, 0, 0, 0.5);
  z-index: 9999 !important;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(80%) brightness(0.9);
  transition: filter 0.4s ease;
}

.photo-item:hover img {
  filter: grayscale(0%) brightness(1.1) saturate(1.3);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%);
  display: flex;
  align-items: flex-end;
  padding: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-item:hover .photo-overlay {
  opacity: 1;
}

.photo-title {
  font-size: 11px;
  color: #e5e5e5;
  font-weight: 500;
}

.sphere-hint {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: rgba(229, 229, 229, 0.3);
  pointer-events: none;
  white-space: nowrap;
}
</style>
