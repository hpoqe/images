import { ref, computed, onMounted, onBeforeUnmount, type Ref } from 'vue'
import type { Photo } from '@/types/photo'
import photosData from '../../content/photos.json'

const PAGE_SIZE = 12

export function usePhotos() {
  const allPhotos: Photo[] = photosData as Photo[]
  const visibleCount = ref(allPhotos.length)
  const sentinelRef: Ref<HTMLElement | null> = ref(null)

  const visiblePhotos = computed(() => allPhotos.slice(0, visibleCount.value))
  const hasMore = computed(() => visibleCount.value < allPhotos.length)

  let observer: IntersectionObserver | null = null

  function loadMore() {
    if (hasMore.value) {
      visibleCount.value += PAGE_SIZE
    }
  }

  function setupObserver() {
    if (observer) observer.disconnect()

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore.value) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )

    if (sentinelRef.value) {
      observer.observe(sentinelRef.value)
    }
  }

  onMounted(() => {
    setupObserver()
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return {
    allPhotos,
    visiblePhotos,
    hasMore,
    sentinelRef,
    loadMore,
  }
}
