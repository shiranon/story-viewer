import { ref } from 'vue'

import { fetchImagesData } from '@/lib/api'

import type { ImagesData } from '@/lib/image-types'

const imagesData = ref<ImagesData>({ characters: [] })
const loading = ref(false)
let pending: Promise<void> | null = null

const loadImages = async () => {
  if (pending) return pending
  loading.value = true
  pending = (async () => {
    try {
      imagesData.value = await fetchImagesData()
    } catch (error: unknown) {
      console.warn('Failed to load images data:', error)
    } finally {
      loading.value = false
      pending = null
    }
  })()
  return pending
}

export const useSharedImagesData = () => ({
  imagesData,
  loading,
  loadImages,
})
