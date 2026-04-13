<template>
  <div class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
    <div
      v-for="(filename, index) in outfit.images"
      :key="filename"
      class="cursor-pointer overflow-hidden rounded-lg border border-border transition-opacity hover:opacity-80"
      @click="openLightbox(index)"
    >
      <div class="aspect-square bg-muted">
        <img
          :src="getImageUrl(characterName, outfit.name, filename)"
          :alt="stripExtension(filename)"
          class="size-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="truncate px-1.5 py-1 text-center text-xs text-muted-foreground">
        {{ stripExtension(filename) }}
      </div>
    </div>
  </div>

  <ImageLightbox
    :open="lightboxOpen"
    :src="lightboxSrc"
    :alt="lightboxAlt"
    :has-prev="lightboxIndex > 0"
    :has-next="lightboxIndex < outfit.images.length - 1"
    @update:open="lightboxOpen = $event"
    @prev="lightboxIndex--"
    @next="lightboxIndex++"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { getImageUrl } from '@/lib/api'
import { stripExtension } from '@/lib/utils'

import ImageLightbox from './image-lightbox.vue'

import type { ImageOutfit } from '@/lib/image-types'

const props = defineProps<{
  characterName: string
  outfit: ImageOutfit
}>()

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

const lightboxSrc = computed(() => {
  const filename = props.outfit.images[lightboxIndex.value]
  return filename ? getImageUrl(props.characterName, props.outfit.name, filename) : ''
})

const lightboxAlt = computed(() => {
  const filename = props.outfit.images[lightboxIndex.value]
  return filename ? stripExtension(filename) : ''
})

const openLightbox = (index: number) => {
  lightboxIndex.value = index
  lightboxOpen.value = true
}
</script>
