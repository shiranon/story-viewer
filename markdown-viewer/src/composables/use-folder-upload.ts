import { ref } from 'vue'

import { ALLOWED_IMAGE_EXTENSIONS } from '@/lib/image-types'
import { getExtension } from '@/lib/utils'

interface FileSystemDirectoryHandle {
  name: string
  kind: 'directory'
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>
}

interface FileSystemFileHandle {
  name: string
  kind: 'file'
  getFile(): Promise<File>
}

type FileSystemHandle = FileSystemDirectoryHandle | FileSystemFileHandle

interface FileSystemAccessAPI {
  showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>
}

export interface OutfitStructure {
  outfitName: string
  images: File[]
}

export interface FolderStructure {
  characterName: string
  outfits: OutfitStructure[]
}

export interface BulkFolderStructure {
  characters: FolderStructure[]
}

const isImageFile = (name: string): boolean => {
  const extension = getExtension(name)
  if (!extension) return false
  return ALLOWED_IMAGE_EXTENSIONS.has(extension.toLowerCase())
}

const collectImages = async (handle: FileSystemDirectoryHandle): Promise<File[]> => {
  const images: File[] = []
  for await (const [name, entry] of handle.entries()) {
    if (entry.kind === 'file' && isImageFile(name)) {
      try {
        const file = await entry.getFile()
        images.push(file)
      } catch {
        console.warn(`Failed to read file: ${name}`)
      }
    }
  }
  return images
}

const openDirectoryPicker = async (): Promise<FileSystemDirectoryHandle | null> => {
  try {
    return await (globalThis as unknown as FileSystemAccessAPI).showDirectoryPicker({
      mode: 'read',
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return null
    }
    throw error
  }
}

const collectOutfits = async (dirHandle: FileSystemDirectoryHandle): Promise<OutfitStructure[]> => {
  const outfits: OutfitStructure[] = []
  for await (const [, handle] of dirHandle.entries()) {
    if (handle.kind !== 'directory') continue
    const images = await collectImages(handle)
    if (images.length > 0) {
      outfits.push({ outfitName: handle.name, images })
    }
  }
  return outfits
}

export const useFolderUpload = () => {
  const isSupported = ref('showDirectoryPicker' in globalThis)

  const selectCharacterFolder = async (): Promise<FolderStructure | null> => {
    if (!isSupported.value) {
      throw new Error('File System Access API is not supported in this browser')
    }

    const dirHandle = await openDirectoryPicker()
    if (!dirHandle) return null

    const outfits = await collectOutfits(dirHandle)

    if (outfits.length === 0) {
      throw new Error('No outfit folders with images found')
    }

    return { characterName: dirHandle.name, outfits }
  }

  const selectOutfitFolder = async (): Promise<OutfitStructure | null> => {
    if (!isSupported.value) {
      throw new Error('File System Access API is not supported in this browser')
    }

    const dirHandle = await openDirectoryPicker()
    if (!dirHandle) return null

    const images = await collectImages(dirHandle)
    if (images.length === 0) {
      throw new Error('No image files found in the selected folder')
    }

    return { outfitName: dirHandle.name, images }
  }

  const selectBulkFolder = async (): Promise<BulkFolderStructure | null> => {
    if (!isSupported.value) {
      throw new Error('File System Access API is not supported in this browser')
    }

    const dirHandle = await openDirectoryPicker()
    if (!dirHandle) return null

    const characters: FolderStructure[] = []

    for await (const [, charHandle] of dirHandle.entries()) {
      if (charHandle.kind !== 'directory') continue

      const outfits = await collectOutfits(charHandle)

      if (outfits.length > 0) {
        characters.push({ characterName: charHandle.name, outfits })
      }
    }

    if (characters.length === 0) {
      throw new Error('No character folders with images found')
    }

    return { characters }
  }

  return {
    isSupported,
    selectCharacterFolder,
    selectOutfitFolder,
    selectBulkFolder,
  }
}
