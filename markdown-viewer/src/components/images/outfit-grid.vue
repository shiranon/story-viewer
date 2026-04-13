<template>
  <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
    <div
      v-for="outfit in character.outfits"
      :key="outfit.name"
      class="cursor-pointer overflow-hidden rounded-lg border border-border transition-colors hover:border-foreground/30"
      @click="$emit('selectOutfit', outfit.name)"
    >
      <div class="relative aspect-square bg-muted">
        <img
          v-if="outfit.images[0]"
          :src="getImageUrl(character.name, outfit.name, outfit.images[0])"
          :alt="outfit.name"
          class="size-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div v-else class="flex h-full items-center justify-center text-muted-foreground">
          <ImageIcon class="size-8" />
        </div>
      </div>
      <div class="px-2 py-1.5">
        <div class="truncate text-sm font-medium">{{ outfit.name }}</div>
        <div class="text-xs text-muted-foreground">{{ outfit.images.length }} images</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ImageIcon } from 'lucide-vue-next'

import { getImageUrl } from '@/lib/api'

import type { ImageCharacter } from '@/lib/image-types'

defineProps<{
  character: ImageCharacter
}>()

defineEmits<{
  selectOutfit: [name: string]
}>()
</script>
