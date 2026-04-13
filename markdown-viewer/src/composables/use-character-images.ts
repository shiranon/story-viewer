import { ref } from 'vue'

import {
  deleteAll as apiDeleteAll,
  deleteCharacter as apiDeleteCharacter,
  deleteImage as apiDeleteImage,
  uploadImages as apiUploadImages,
} from '@/lib/api'

import { useSharedImagesData } from './use-shared-images-data'

export const useCharacterImages = () => {
  const { imagesData, loading, loadImages } = useSharedImagesData()
  const selectedCharacter = ref<string | null>(null)
  const selectedOutfit = ref<string | null>(null)
  const uploading = ref(false)
  const uploadError = ref<string | null>(null)

  const uploadImages = async (character: string, outfit: string, files: File[]) => {
    uploading.value = true
    uploadError.value = null
    try {
      const result = await apiUploadImages(character, outfit, files)
      if (result.errors.length > 0) {
        uploadError.value = result.errors.join(', ')
      }
      await loadImages()
      return result
    } catch (error) {
      uploadError.value = String(error)
      throw error
    } finally {
      uploading.value = false
    }
  }

  const deleteImage = async (character: string, outfit: string, filename: string) => {
    await apiDeleteImage(character, outfit, filename)
    await loadImages()
  }

  const deleteCharacterImages = async (character: string) => {
    await apiDeleteCharacter(character)
    if (selectedCharacter.value === character) {
      selectedCharacter.value = null
      selectedOutfit.value = null
    }
    await loadImages()
  }

  const deleteAllImages = async () => {
    await apiDeleteAll()
    selectedCharacter.value = null
    selectedOutfit.value = null
    await loadImages()
  }

  const selectCharacter = (name: string | null) => {
    selectedCharacter.value = name
    selectedOutfit.value = null
  }

  const selectOutfit = (name: string | null) => {
    selectedOutfit.value = name
  }

  return {
    imagesData,
    selectedCharacter,
    selectedOutfit,
    loading,
    uploading,
    uploadError,
    loadImages,
    uploadImages,
    deleteImage,
    deleteCharacterImages,
    deleteAllImages,
    selectCharacter,
    selectOutfit,
  }
}
