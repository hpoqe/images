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

const RADIUS = 380

// 计算每张照片的3D位置
function getPhotoPosition(index: number, total: number) {
  const goldenRatio = (1 + Math.sqrt(5)) / 2
  const theta = 2 * Math.PI * index / goldenRatio
  const phi = Math.acos(1 - 2 * (index + 0.5) / total)

  const x = RADIUS * Math.sin(phi) * Math.cos(theta)
  const y = RADIUS * Math.sin(phi) * Math.sin(theta)
  const z = RADIUS * Math.cos(phi)

  return { x, y, z, theta, phi }
}

// 计算旋转后照片的z轴位置（用于判断是否在正面）
function getRotatedZ(z: number, y: number, rotX: number, rotY: number): number {
  const radX = (rotX * Math.PI) / 180
  const radY = (rotY * Math.PI) / 180
  
  // 绕Y轴旋转
  const z1 = z * Math.cos(radY)
  
  // 绕X轴旋转
  const z2 = y * Math.sin(radX) + z1 * Math.cos(radX)
  
  return z2
}

function getPhotoStyle(index: number, total: number) {
  const pos = getPhotoPosition(index, total)
  const rotatedZ = getRotatedZ(pos.z, pos.y, rotationX.value, rotationY.value)
  const depth = (rotatedZ + RADIUS) / (2 * RADIUS)
  
  // 正面照片（depth > 0.7）更大更清晰
  const isFront = depth > 0.7
  const scale = 0.5 + depth * 0.7
  const opacity = 0.2 + depth * 0.8
  
  return {
    transform: `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) scale(${scale})`,
    opacity,
    zIndex: Math.round(depth * 1000),
    '--depth': depth,
    '--is-front': isFront ? 1 : 0,
  }
}

function animate(time: number) {
  const delta = lastTime ? Math.min((time - lastTime) / 16.67, 3) : 1
  lastTime = time

  if (!isDragging) {
    if (autoRotate) {
      velocityY = 0.15
      velocityX = 0.03
    } else {
      velocityX *= 0.92
      velocityY *= 0.92
      if (Math.abs(velocityX) < 0.01 && Math.abs(velocityY) < 0.01) {
        autoRotate = true
      }
    }
  }

  rotationY.value += velocityY * delta
  rotationX.value += velocityX * delta
  rotationX.value = Math.max(-60, Math.min(60, rotationX.value))

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
  velocityY = deltaX * 0.5
  velocityX = -deltaY * 0.5
  rotationY.value += velocityY
  rotationX.value += velocityX
  rotationX.value = Math.max(-60, Math.min(60, rotationX.value))
  startX = e.clientX
  startY = e.clientY
}

function handleMouseUp() {
  isDragging = false
}

function handleWheel(e: WheelEvent) {
  e.preventDefault()
  velocityY += e.deltaY * 0.08
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
        :class="{ 'is-front': getPhotoStyle(index, photos.length)['--is-front'] === 1 }"
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
  background: radial-gradient(ellipse at center, rgba(167, 139, 250, 0.04) 0%, transparent 70%);
}

.sphere-container:active {
  cursor: grabbing;
}

.sphere-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.08) 0%, transparent 60%);
  pointer-events: none;
  animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 1; }
}

.sphere {
  width: 0;
  height: 0;
  position: relative;
  transform-style: preserve-3d;
}

.photo-item {
  position: absolute;
  width: 150px;
  height: 110px;
  left: -75px;
  top: -55px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  backface-visibility: hidden;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 默认黑白 */
  filter: grayscale(90%) brightness(0.85);
  transition: filter 0.5s ease;
}

/* 正面照片自动变彩色 */
.photo-item.is-front img {
  filter: grayscale(0%) brightness(1.1) saturate(1.2);
}

.photo-item:hover {
  box-shadow: 0 0 35px rgba(167, 139, 250, 0.5), 0 8px 40px rgba(0, 0, 0, 0.6);
  z-index: 9999 !important;
}

.photo-item:hover img {
  filter: grayscale(0%) brightness(1.2) saturate(1.3) contrast(1.1);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%);
  display: flex;
  align-items: flex-end;
  padding: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-item:hover .photo-overlay,
.photo-item.is-front .photo-overlay {
  opacity: 1;
}

.photo-title {
  font-size: 12px;
  color: #fff;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
}

.sphere-hint {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: rgba(229, 229, 229, 0.35);
  pointer-events: none;
  white-space: nowrap;
}
</style>
