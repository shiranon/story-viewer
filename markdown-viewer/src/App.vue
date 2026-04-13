<template>
  <div class="dark flex h-screen flex-col bg-background text-foreground">
    <header class="flex h-10 shrink-0 items-center justify-between border-b border-border px-4">
      <div class="flex items-center gap-2">
        <button
          class="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          @click="sidebarOpen = !sidebarOpen"
        >
          <PanelLeftIcon class="size-4" />
        </button>
        <span class="font-semibold">Story Viewer</span>
      </div>
      <div class="flex items-center gap-1">
        <ImageManagerModal />
        <SettingsModal
          :image-width="imageWidth"
          :image-align="imageAlign"
          :md-theme="mdTheme"
          :font-size="fontSize"
          :font-mode="fontMode"
          :font-preset-value="fontPresetValue"
          :system-font-name="systemFontName"
          @save-image-align="saveImageAlign"
          @save-md-theme="saveMdTheme"
          @save-width="saveImageWidth"
          @save-font-size="saveFontSize"
          @save-font-preset="saveFontPreset"
          @save-system-font="saveSystemFont"
        />
      </div>
    </header>
    <div class="flex min-h-0 flex-1">
      <aside v-show="sidebarOpen" class="flex w-64 shrink-0 flex-col border-r border-border">
        <div class="flex-1 overflow-hidden">
          <SidebarTree
            :tree="tree"
            :selected-path="selectedFile?.path ?? null"
            :toggle-expanded="toggleExpanded"
            :is-expanded="isExpanded"
            @select-file="onSelectFile"
          />
        </div>
        <div class="shrink-0 border-t border-border p-2">
          <Button
            variant="ghost"
            class="w-full justify-start gap-2"
            :class="{ 'bg-accent text-accent-foreground': viewMode === 'images' }"
            @click="toggleViewMode"
          >
            <ImageIcon class="size-4" />
            Images
          </Button>
        </div>
      </aside>
      <main class="min-w-0 flex-1">
        <ContentPanel
          v-if="viewMode === 'story'"
          :file-path="selectedFile?.path ?? null"
          :content="content"
          :loading="contentLoading"
          :md-theme="mdTheme"
        />
        <ImageViewer v-else />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { ImageIcon, PanelLeftIcon } from 'lucide-vue-next'

import ContentPanel from '@/components/content/content-panel.vue'
import ImageManagerModal from '@/components/images/image-manager-modal.vue'
import ImageViewer from '@/components/images/image-viewer.vue'
import SettingsModal from '@/components/settings/settings-modal.vue'
import SidebarTree from '@/components/sidebar/sidebar-tree.vue'
import { Button } from '@/components/ui/button'
import { useMarkdownContent } from '@/composables/use-markdown-content'
import { useStoryTree } from '@/composables/use-story-tree'
import { useViewerSettings } from '@/composables/use-viewer-settings'

const { tree, selectedFile, toggleExpanded, isExpanded, selectFile } = useStoryTree()
const { content, loading: contentLoading } = useMarkdownContent(selectedFile)
const {
  imageWidth,
  imageAlign,
  mdTheme,
  fontSize,
  fontMode,
  fontPresetValue,
  systemFontName,
  saveImageWidth,
  saveFontSize,
  saveFontPreset,
  saveSystemFont,
  saveImageAlign,
  saveMdTheme,
} = useViewerSettings()

const sidebarOpen = ref(true)
const viewMode = ref<'story' | 'images'>('story')

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'story' ? 'images' : 'story'
}

const onSelectFile = (file: { path: string; name: string }) => {
  viewMode.value = 'story'
  selectFile(file)
}
</script>
