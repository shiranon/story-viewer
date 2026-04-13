<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="ghost" size="icon" class="text-muted-foreground hover:text-foreground">
        <SettingsIcon class="size-5" />
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>Viewer display settings</DialogDescription>
      </DialogHeader>

      <div class="flex max-h-[70vh] flex-col gap-6 overflow-y-auto py-4">
        <div class="flex flex-col gap-2">
          <Label>Font Size</Label>
          <div class="flex items-center gap-2">
            <Input v-model="fontSizeInput" type="number" min="8" max="48" class="w-24" />
            <span class="text-sm text-muted-foreground">px</span>
            <Button size="sm" @click="onSaveFontSize">Save</Button>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <Label>Font</Label>
          <RadioGroup v-model="fontModeValue" class="flex flex-col gap-2">
            <div class="flex items-center gap-1.5">
              <RadioGroupItem id="font-mode-preset" value="preset" />
              <Label for="font-mode-preset" class="font-normal">Preset</Label>
            </div>
            <div v-if="fontModeValue === 'preset'" class="ml-6 flex flex-col gap-1.5">
              <button
                v-for="preset in fontPresets"
                :key="preset.value"
                class="rounded-md px-3 py-1.5 text-left text-sm hover:bg-accent"
                :class="{ 'bg-accent text-accent-foreground': fontPresetValue === preset.value }"
                @click="onSelectPreset(preset.value)"
              >
                {{ preset.label }}
              </button>
            </div>
            <div class="flex items-center gap-1.5">
              <RadioGroupItem id="font-mode-system" value="system" />
              <Label for="font-mode-system" class="font-normal">System Font</Label>
            </div>
            <div v-if="fontModeValue === 'system'" class="ml-6 flex items-center gap-2">
              <Input v-model="systemFontInput" placeholder="e.g. Yu Gothic" class="flex-1" />
              <Button size="sm" @click="onSaveSystemFont">Apply</Button>
            </div>
          </RadioGroup>
        </div>

        <div class="flex flex-col gap-2">
          <Label>Image Width</Label>
          <div class="flex items-center gap-2">
            <Input v-model="widthInput" type="number" min="10" max="100" class="w-24" />
            <span class="text-sm text-muted-foreground">%</span>
            <Button size="sm" @click="onSaveWidth">Save</Button>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <Label>Image Align</Label>
          <RadioGroup v-model="imageAlign" class="flex gap-4">
            <div class="flex items-center gap-1.5">
              <RadioGroupItem id="align-left" value="start" />
              <Label for="align-left" class="font-normal">Left</Label>
            </div>
            <div class="flex items-center gap-1.5">
              <RadioGroupItem id="align-center" value="center" />
              <Label for="align-center" class="font-normal">Center</Label>
            </div>
            <div class="flex items-center gap-1.5">
              <RadioGroupItem id="align-right" value="end" />
              <Label for="align-right" class="font-normal">Right</Label>
            </div>
          </RadioGroup>
        </div>

        <div class="flex flex-col gap-2">
          <Label>Markdown Theme</Label>
          <RadioGroup v-model="mdTheme" class="flex gap-4">
            <div class="flex items-center gap-1.5">
              <RadioGroupItem id="theme-dark" value="dark" />
              <Label for="theme-dark" class="font-normal">Dark</Label>
            </div>
            <div class="flex items-center gap-1.5">
              <RadioGroupItem id="theme-light" value="light" />
              <Label for="theme-light" class="font-normal">Light</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { SettingsIcon } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { fontPresets } from '@/lib/font-presets'

import type { FontMode, ImageAlign, MdTheme } from '@/composables/use-viewer-settings'

const props = defineProps<{
  imageWidth: number
  imageAlign: ImageAlign
  mdTheme: MdTheme
  fontSize: number
  fontMode: FontMode
  fontPresetValue: string
  systemFontName: string
}>()

const emit = defineEmits<{
  saveImageAlign: [value: ImageAlign]
  saveMdTheme: [value: MdTheme]
  saveWidth: [value: number]
  saveFontSize: [value: number]
  saveFontPreset: [value: string]
  saveSystemFont: [value: string]
}>()

const open = ref(false)
const widthInput = ref(String(props.imageWidth))
const fontSizeInput = ref(String(props.fontSize))
const systemFontInput = ref(props.systemFontName)

const fontModeValue = ref<FontMode>(props.fontMode)
const fontPresetValue = ref(props.fontPresetValue)

const imageAlign = computed({
  get: () => props.imageAlign,
  set: (value: ImageAlign) => {
    emit('saveImageAlign', value)
  },
})

const mdTheme = computed({
  get: () => props.mdTheme,
  set: (value: MdTheme) => {
    emit('saveMdTheme', value)
  },
})

const onSaveWidth = () => {
  const value = Number(widthInput.value)
  if (!Number.isNaN(value)) {
    emit('saveWidth', value)
  }
}

const onSaveFontSize = () => {
  const value = Number(fontSizeInput.value)
  if (!Number.isNaN(value)) {
    emit('saveFontSize', value)
  }
}

const onSelectPreset = (value: string) => {
  fontPresetValue.value = value
  fontModeValue.value = 'preset'
  emit('saveFontPreset', value)
}

const onSaveSystemFont = () => {
  fontModeValue.value = 'system'
  emit('saveSystemFont', systemFontInput.value)
}
</script>
