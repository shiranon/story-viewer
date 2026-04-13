<template>
  <div
    class="flex h-full flex-col overflow-y-auto"
    :class="mdTheme === 'dark' ? 'bg-[#1e1e1e] text-[#d4d4d4]' : `bg-white text-[#1f2937]`"
  >
    <div v-if="!filePath" class="flex h-full items-center justify-center text-muted-foreground">
      Select a file to view
    </div>
    <div v-else-if="loading" class="flex h-full items-center justify-center text-muted-foreground">
      Loading...
    </div>
    <div v-else class="content-panel-body mx-auto w-full max-w-4xl p-6 pb-[50vh]">
      <div class="content-panel-filepath mb-4 text-muted-foreground">
        {{ filePath }}
      </div>
      <MarkdownRenderer :content="content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MarkdownRenderer from '@/components/content/markdown-renderer.vue'

import type { MdTheme } from '@/composables/use-viewer-settings'

defineProps<{
  filePath: string | null
  content: string
  loading: boolean
  mdTheme: MdTheme
}>()
</script>

<style scoped>
.content-panel-body {
  font-size: var(--message-font-size, 16px);
  font-family: var(--message-font-family, system-ui, sans-serif);
}

.content-panel-filepath {
  font-size: 0.75rem;
}
</style>
