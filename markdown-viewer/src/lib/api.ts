import type { ImagesData } from '@/lib/image-types'
import type { StoryTree } from '@/lib/types'

const isStaticApi = import.meta.env.VITE_STATIC_API === 'true'

const apiFetch = async (url: string, init?: RequestInit): Promise<Response> => {
  const res = await fetch(url, init)
  if (!res.ok) {
    throw new Error(`API request failed: ${String(res.status)} (${url})`)
  }
  return res
}

export const fetchStoryTree = async (fresh = false): Promise<StoryTree> => {
  const base = isStaticApi ? '/api/stories.json' : '/api/stories'
  const url = fresh && !isStaticApi ? `${base}?fresh=1` : base
  const res = await apiFetch(url)
  return res.json() as Promise<StoryTree>
}

export const fetchMarkdownContent = async (path: string): Promise<string> => {
  const url = isStaticApi ? `/api/content/${path}` : `/api/content?path=${encodeURIComponent(path)}`
  const res = await apiFetch(url)
  return res.text()
}

export const fetchImagesData = async (): Promise<ImagesData> => {
  const url = isStaticApi ? '/api/images.json' : '/api/images'
  const res = await apiFetch(url)
  return res.json() as Promise<ImagesData>
}

export const uploadImages = async (
  character: string,
  outfit: string,
  files: File[],
): Promise<{ success: boolean; uploaded: string[]; errors: string[] }> => {
  const formData = new FormData()
  formData.append('character', character)
  formData.append('outfit', outfit)
  for (const file of files) {
    formData.append('files', file)
  }
  const res = await apiFetch('/api/images/upload', {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(120_000),
  })
  return res.json() as Promise<{ success: boolean; uploaded: string[]; errors: string[] }>
}

export const deleteImage = async (
  character: string,
  outfit: string,
  filename: string,
): Promise<void> => {
  await apiFetch('/api/images/delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ character, outfit, filename }),
  })
}

export const deleteCharacter = async (character: string): Promise<{ deleted: number }> => {
  const res = await apiFetch('/api/images/delete-character', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ character }),
  })
  return res.json() as Promise<{ deleted: number }>
}

export const deleteAll = async (): Promise<{ deleted: number }> => {
  const res = await apiFetch('/api/images/delete-all', { method: 'DELETE' })
  return res.json() as Promise<{ deleted: number }>
}

export const getImageUrl = (character: string, outfit: string, filename: string): string => {
  const path = `${character}/${outfit}/${filename}`
  return `/api/images/file?path=${encodeURIComponent(path)}`
}
