<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Photo } from '@/types/photo'

const props = defineProps<{
  photos: Photo[]
}>()

defineEmits<{
  click: [photo: Photo]
}>()

const containerRef = ref<HTMLElement | null>(null)
let rotationX = 0
let rotationY = 0
let isDragging = false
let startX = 0
let startY = 0
let autoRotate = true
let animationId: number

// 使用斐波那契球体算法均匀分布照片
function getSpherePositions(count: number, radius: number) {
  const positions: { x: number; y: number; z: number; phi: number; theta: number }[] = []
  const goldenRatio = (1 + Math.sqrt(5)) / 2
  
  for (let i = 0; i < count; i++) {
    const theta = 2 * Math.PI * i / goldenRatio
    const phi = Math.acos(1 - 2 * (i + 0.5) / count)
    
    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.sin(phi) * Math.sin(theta)
    const z = radius * Math.cos(phi)
    
    positions.push({ x, y, z, phi, theta })
  }
  
  return positions
}

function animate() {
  if (!containerRef.value || !autoRotate) return
  
  rotationY += 0.2
  updateRotation()
  animationId = requestAnimationFrame(animate)
}

function updateRotation() {
  if (!containerRef.value) return
  const sphere = containerRef.value.querySelector('.sphere') as HTMLElement
  if (sphere) {
    sphere.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`
  }
}

function handleMouseDown(e: MouseEvent) {
  isDragging = true
  autoRotate = false
  startX = e.clientX
  startY = e.clientY
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging) return
  
  const deltaX = e.clientX - startX
  const deltaY = e.clientY - startY
  
  rotationY += deltaX * 0.5
  rotationX -= deltaY * 0.5
  
  // 限制垂直旋转角度
  rotationX = Math.max(-90, Math.min(90, rotationX))
  
  startX = e.clientX
  startY = e.clientY
  
  updateRotation()
}

function handleMouseUp() {
  isDragging = false
  setTimeout(() => {
    autoRotate = true
    animate()
  }, 2000)
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
    ref="containerRef"
    class="sphere-container"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <div class="sphere">
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
  height: 600px;
  perspective: 1000px;
  cursor: grab;
  overflow: hidden;
  position: relative;
}

.sphere-container:active {
  cursor: grabbing;
}

.sphere {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
}

.photo-item {
  position: absolute;
  width: 120px;
  height: 90px;
  left: 50%;
  top: 50%;
  margin-left: -60px;
  margin-top: -45px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  backface-visibility: visible;
}

.photo-item:hover {
  transform: scale(1.2);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  z-index: 100;
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

/* 根据距离调整透明度 */
.photo-item[data-distance="far"] {
  opacity: 0.3;
}

.photo-item[data-distance="medium"] {
  opacity: 0.6;
}

.photo-item[data-distance="near"] {
  opacity: 1;
}
</style>
