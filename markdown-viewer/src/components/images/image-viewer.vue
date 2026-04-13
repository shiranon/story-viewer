<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Breadcrumb -->
    <div class="flex shrink-0 items-center gap-1 border-b border-border px-4 py-2">
      <button
        v-if="level !== 'characters'"
        class="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        @click="navigateBack"
      >
        <ChevronLeftIcon class="size-4" />
      </button>
      <template v-for="(crumb, i) in breadcrumbs" :key="i">
        <ChevronRightIcon v-if="i > 0" class="size-3 text-muted-foreground" />
        <button
          v-if="crumb.action && i < breadcrumbs.length - 1"
          class="text-sm text-muted-foreground hover:text-foreground"
          @click="crumb.action"
        >
          {{ crumb.label }}
        </button>
        <span v-else class="text-sm font-medium">{{ crumb.label }}</span>
      </template>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <div
        v-if="loading"
        class="flex h-full items-center justify-center text-sm text-muted-foreground"
      >
        Loading...
      </div>

      <template v-else-if="imagesData.characters.length === 0">
        <div class="flex h-full items-center justify-center text-sm text-muted-foreground">
          No images registered
        </div>
      </template>

      <template v-else>
        <CharacterGrid
          v-if="level === 'characters'"
          :characters="imagesData.characters"
          :copied-character="copiedCharacter"
          @select-character="navigateToCharacter"
          @copy-prompt="copyPrompt"
        />

        <OutfitGrid
          v-else-if="level === 'outfits' && currentCharacter"
          :character="currentCharacter"
          @select-outfit="navigateToOutfit"
        />

        <ExpressionGrid
          v-else-if="level === 'expressions' && currentCharacter && currentOutfit"
          :character-name="currentCharacter.name"
          :outfit="currentOutfit"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'

import CharacterGrid from '@/components/images/character-grid.vue'
import ExpressionGrid from '@/components/images/expression-grid.vue'
import OutfitGrid from '@/components/images/outfit-grid.vue'
import { useImageViewer } from '@/composables/use-image-viewer'

const {
  level,
  imagesData,
  loading,
  copiedCharacter,
  breadcrumbs,
  currentCharacter,
  currentOutfit,
  loadImages,
  navigateToCharacter,
  navigateToOutfit,
  navigateBack,
  copyPrompt,
} = useImageViewer()

onMounted(() => {
  void loadImages()
})
</script>
