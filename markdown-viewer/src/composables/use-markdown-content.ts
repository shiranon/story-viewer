import { ref, watch } from 'vue'
import type { Ref } from 'vue'

import { fetchMarkdownContent } from '@/lib/api'

export const useMarkdownContent = (selectedFile: Ref<{ path: string } | null>) => {
  const content = ref('')
  const loading = ref(false)

  watch(
    () => selectedFile.value?.path,
    async (path) => {
      if (!path) {
        content.value = ''
        return
      }

      loading.value = true
      try {
        content.value = await fetchMarkdownContent(path)
      } catch (error) {
        console.warn('Failed to load markdown:', error)
        content.value = `Failed to load: ${path}`
      } finally {
        loading.value = false
      }
    },
  )

  return { content, loading }
}
