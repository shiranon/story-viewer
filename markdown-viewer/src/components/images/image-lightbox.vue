<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent
      class="max-h-[95vh] max-w-[95vw] border-none bg-transparent p-0 shadow-none sm:max-w-[95vw]"
      :show-close-button="false"
      @pointer-down-outside="$emit('update:open', false)"
    >
      <DialogTitle class="sr-only">{{ alt }}</DialogTitle>

      <div
        class="relative flex items-center justify-center"
        @click.self="$emit('update:open', false)"
      >
        <button
          v-if="hasPrev"
          class="absolute left-2 z-10 flex size-10 items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70"
          @click="$emit('prev')"
        >
          <ChevronLeft class="size-6" />
        </button>

        <img :src="src" :alt="alt" class="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" />

        <button
          v-if="hasNext"
          class="absolute right-2 z-10 flex size-10 items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70"
          @click="$emit('next')"
        >
          <ChevronRight class="size-6" />
        </button>

        <button
          class="absolute top-2 right-2 z-10 flex size-10 items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70"
          @click="$emit('update:open', false)"
        >
          <X class="size-5" />
        </button>
      </div>

      <div v-if="alt" class="mt-2 text-center text-sm text-white">
        {{ alt }}
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

const props = defineProps<{
  open: boolean
  src: string
  alt: string
  hasPrev: boolean
  hasNext: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  prev: []
  next: []
}>()

const handleKeydown = (e: KeyboardEvent) => {
  if (!props.open) return
  if (e.key === 'ArrowLeft' && props.hasPrev) emit('prev')
  if (e.key === 'ArrowRight' && props.hasNext) emit('next')
}

onMounted(() => {
  globalThis.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  globalThis.removeEventListener('keydown', handleKeydown)
})
</script>
