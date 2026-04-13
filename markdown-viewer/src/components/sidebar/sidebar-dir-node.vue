<template>
  <div>
    <button
      class="flex w-full items-center gap-1.5 rounded-sm p-1 text-left font-medium hover:bg-sidebar-accent"
      @click="toggleExpanded(nodeKey)"
    >
      <ChevronRightIcon
        class="size-4 shrink-0 transition-transform"
        :class="{ 'rotate-90': isExpanded(nodeKey) }"
      />
      <FolderIcon class="size-4 shrink-0 text-muted-foreground" />
      <span class="truncate">{{ node.name }}</span>
    </button>

    <div
      v-if="isExpanded(nodeKey)"
      class="ml-3 flex flex-col gap-0.5 border-l border-sidebar-border pl-2"
    >
      <template
        v-for="child in node.children"
        :key="child.type === 'file' ? child.path : child.name"
      >
        <SidebarDirNode
          v-if="child.type === 'dir'"
          :node="child"
          :parent-key="nodeKey"
          :selected-path="selectedPath"
          :toggle-expanded="toggleExpanded"
          :is-expanded="isExpanded"
          @select-file="$emit('selectFile', $event)"
        />
        <SidebarFileItem
          v-else
          :file="child"
          :selected="selectedPath === child.path"
          @select="$emit('selectFile', child)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRightIcon, FolderIcon } from 'lucide-vue-next'

import SidebarFileItem from '@/components/sidebar/sidebar-file-item.vue'

import type { DirEntry, FileEntry } from '@/lib/types'

const props = defineProps<{
  node: DirEntry
  parentKey: string
  selectedPath: string | null
  toggleExpanded: (key: string) => void
  isExpanded: (key: string) => boolean
}>()

defineEmits<{
  selectFile: [file: FileEntry]
}>()

const nodeKey = `${props.parentKey}/${props.node.name}`
</script>
