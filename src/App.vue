<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, onBeforeUnmount } from 'vue'
import Lenis from 'lenis'

let lenis: InstanceType<typeof Lenis> | null = null

onMounted(() => {
  lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
  })

  function raf(time: number) {
    lenis?.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
})

onBeforeUnmount(() => {
  lenis?.destroy()
  lenis = null
})
</script>

<template>
  <div class="min-h-screen bg-base text-accent">
    <nav class="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur border-b border-white/10">
      <div class="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <router-link to="/" class="font-medium text-accent">Photo Gallery</router-link>
        <div class="flex gap-6 text-sm text-accent/70">
          <router-link to="/gallery" class="hover:text-accent transition-colors">Gallery</router-link>
          <router-link to="/about" class="hover:text-accent transition-colors">About</router-link>
        </div>
      </div>
    </nav>

    <main class="pt-14">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
