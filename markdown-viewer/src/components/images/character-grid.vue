<template>
  <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
    <div
      v-for="char in characters"
      :key="char.name"
      class="group cursor-pointer overflow-hidden rounded-lg border border-border transition-colors hover:border-foreground/30"
      @click="$emit('selectCharacter', char.name)"
    >
      <div class="relative aspect-square bg-muted">
        <img
          v-if="getThumbSrc(char)"
          :src="getThumbSrc(char)!"
          :alt="char.name"
          class="size-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div v-else class="flex h-full items-center justify-center text-muted-foreground">
          <ImageIcon class="size-8" />
        </div>
      </div>
      <div class="flex items-center justify-between gap-1 px-2 py-1.5">
        <div class="min-w-0">
          <div class="truncate text-sm font-medium">{{ char.name }}</div>
          <div class="text-xs text-muted-foreground">
            {{ char.outfits.length }} outfits / {{ countImages(char) }} images
          </div>
        </div>
        <button
          class="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          title="Copy prompt"
          @click.stop="$emit('copyPrompt', char.name)"
        >
          <ClipboardCopyIcon v-if="copiedCharacter !== char.name" class="size-4" />
          <CheckIcon v-else class="size-4 text-green-500" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon, ClipboardCopyIcon, ImageIcon } from 'lucide-vue-next'

import { getImageUrl } from '@/lib/api'

import type { ImageCharacter } from '@/lib/image-types'

defineProps<{
  characters: ImageCharacter[]
  copiedCharacter: string | null
}>()

defineEmits<{
  selectCharacter: [name: string]
  copyPrompt: [name: string]
}>()

const getThumbSrc = (char: ImageCharacter): string | null => {
  const firstOutfit = char.outfits[0]
  const firstImage = firstOutfit?.images[0]
  if (!firstOutfit || !firstImage) return null
  return getImageUrl(char.name, firstOutfit.name, firstImage)
}

const countImages = (char: ImageCharacter): number =>
  char.outfits.reduce((sum, o) => sum + o.images.length, 0)
</script>
