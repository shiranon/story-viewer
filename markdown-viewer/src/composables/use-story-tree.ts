import { onMounted, onUnmounted, reactive, ref } from 'vue'

import { fetchStoryTree } from '@/lib/api'

import type { StoryTree } from '@/lib/types'

const POLL_INTERVAL = 30_000

export const useStoryTree = () => {
  const tree = ref<StoryTree>({ stories: [] })
  const loading = ref(false)
  const selectedFile = ref<{ name: string; path: string } | null>(null)
  const expandedKeys = reactive(new Set<string>())

  let pollTimer: ReturnType<typeof setInterval> | null = null

  const loadTree = async (fresh = false) => {
    if (loading.value) return
    loading.value = true
    try {
      tree.value = await fetchStoryTree(fresh)
    } catch (error) {
      console.warn('Failed to load story tree:', error)
    } finally {
      loading.value = false
    }
  }

  const isDevelopment = import.meta.env.DEV

  const toggleExpanded = (key: string) => {
    if (expandedKeys.has(key)) {
      expandedKeys.delete(key)
    } else {
      expandedKeys.add(key)
      if (isDevelopment) {
        void loadTree(true)
      }
    }
  }

  const isExpanded = (key: string) => expandedKeys.has(key)

  const selectFile = (file: { name: string; path: string }) => {
    selectedFile.value = file
  }

  onMounted(() => {
    void loadTree()
    pollTimer = setInterval(loadTree, POLL_INTERVAL)
  })

  onUnmounted(() => {
    if (pollTimer) {
      clearInterval(pollTimer)
    }
  })

  return {
    tree,
    loading,
    selectedFile,
    toggleExpanded,
    isExpanded,
    selectFile,
  }
}
