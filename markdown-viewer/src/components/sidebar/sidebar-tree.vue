<template>
  <div class="flex h-full flex-col overflow-y-auto bg-sidebar text-sidebar-foreground">
    <div class="px-3 py-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
      Stories
    </div>
    <nav class="flex flex-col gap-0.5 px-2 pb-4">
      <template v-for="node in tree.stories" :key="node.type === 'file' ? node.path : node.name">
        <SidebarDirNode
          v-if="node.type === 'dir'"
          :node="node"
          parent-key="root"
          :selected-path="selectedPath"
          :toggle-expanded="toggleExpanded"
          :is-expanded="isExpanded"
          @select-file="$emit('selectFile', $event)"
        />
        <SidebarFileItem
          v-else
          :file="node"
          :selected="selectedPath === node.path"
          @select="$emit('selectFile', node)"
        />
      </template>
    </nav>
  </div>
</template>

<script setup lang="ts">
import SidebarDirNode from '@/components/sidebar/sidebar-dir-node.vue'
import SidebarFileItem from '@/components/sidebar/sidebar-file-item.vue'

import type { FileEntry, StoryTree } from '@/lib/types'

defineProps<{
  tree: StoryTree
  selectedPath: string | null
  toggleExpanded: (key: string) => void
  isExpanded: (key: string) => boolean
}>()

defineEmits<{
  selectFile: [file: FileEntry]
}>()
</script>
