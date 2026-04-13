<template>
  <button
    class="flex w-full items-center gap-1.5 rounded-sm px-2 py-0.5 text-left hover:bg-sidebar-accent"
    :class="selected ? `bg-sidebar-primary/20 font-medium text-sidebar-accent-foreground` : ''"
    @click="$emit('select')"
  >
    <FileTextIcon class="size-4 shrink-0 text-muted-foreground" />
    <span class="truncate">{{ file.name }}</span>
  </button>
</template>

<script setup lang="ts">
import { FileTextIcon } from 'lucide-vue-next'

import type { FileEntry } from '@/lib/types'

defineProps<{
  file: FileEntry
  selected: boolean
}>()

defineEmits<{
  select: []
}>()
</script>
