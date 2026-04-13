<template>
  <Dialog v-model:open="open" modal>
    <DialogTrigger as-child>
      <Button variant="ghost" size="icon" class="text-muted-foreground hover:text-foreground">
        <ImageIcon class="size-5" />
      </Button>
    </DialogTrigger>
    <DialogContent
      class="flex h-[80vh] max-h-[80vh] flex-col sm:max-w-5xl"
      @interact-outside.prevent
      @escape-key-down="onEscapeKeyDown"
    >
      <DialogHeader>
        <DialogTitle>Image Manager</DialogTitle>
        <DialogDescription>Manage character images on R2</DialogDescription>
      </DialogHeader>

      <div class="flex min-h-0 flex-1 gap-4">
        <!-- Left: Character/Outfit navigation -->
        <div class="flex w-56 shrink-0 flex-col gap-2 overflow-y-auto border-r border-border pr-4">
          <div class="flex flex-col gap-1">
            <template v-for="char in imagesData.characters" :key="char.name">
              <button
                class="flex items-center gap-1.5 rounded-md px-2 py-1 text-left text-sm hover:bg-accent"
                :class="{
                  'bg-accent font-medium text-accent-foreground': selectedCharacter === char.name,
                }"
                @click="onSelectCharacter(char.name)"
              >
                <ChevronRightIcon
                  class="size-3.5 shrink-0 transition-transform"
                  :class="{ 'rotate-90': selectedCharacter === char.name }"
                />
                {{ char.name }}
              </button>
              <template v-if="selectedCharacter === char.name">
                <button
                  v-for="outfit in char.outfits"
                  :key="outfit.name"
                  class="ml-5 rounded-md px-2 py-0.5 text-left text-sm hover:bg-accent"
                  :class="{ 'bg-accent text-accent-foreground': selectedOutfit === outfit.name }"
                  @click="selectOutfit(outfit.name)"
                >
                  {{ outfit.name }}
                </button>
              </template>
            </template>
          </div>

          <div class="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            <div class="flex gap-1">
              <Input v-model="newCharacterName" placeholder="New character" class="h-7 text-xs" />
              <Button
                size="sm"
                variant="outline"
                class="h-7 shrink-0 px-2 text-xs"
                @click="onAddCharacter"
              >
                Add
              </Button>
            </div>

            <Button
              v-if="folderUpload.isSupported.value"
              size="sm"
              variant="outline"
              class="h-7 text-xs"
              :disabled="uploading || uploadQueue.progress.value.active"
              @click="onImportCharacterFolder"
            >
              <FolderOpenIcon class="mr-1 size-3.5" />
              Import Folder
            </Button>

            <Button
              v-if="folderUpload.isSupported.value"
              size="sm"
              variant="outline"
              class="h-7 text-xs"
              :disabled="uploading || uploadQueue.progress.value.active"
              @click="onBulkImport"
            >
              <FolderOpenIcon class="mr-1 size-3.5" />
              Bulk Import
            </Button>
          </div>

          <div class="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            <Button
              v-if="selectedCharacter"
              size="sm"
              variant="destructive"
              class="h-7 text-xs"
              :disabled="uploading || uploadQueue.progress.value.active"
              @click="onDeleteCharacter"
            >
              <Trash2Icon class="mr-1 size-3.5" />
              Delete {{ selectedCharacter }}
            </Button>

            <Button
              v-if="imagesData.characters.length > 0"
              size="sm"
              variant="destructive"
              class="h-7 text-xs"
              :disabled="uploading || uploadQueue.progress.value.active"
              @click="onDeleteAll"
            >
              <Trash2Icon class="mr-1 size-3.5" />
              Delete All
            </Button>
          </div>
        </div>

        <!-- Right: Image grid + upload -->
        <div class="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
          <template v-if="selectedCharacter && selectedOutfit">
            <div class="text-sm font-medium text-muted-foreground">
              {{ selectedCharacter }} &gt; {{ selectedOutfit }}
            </div>

            <div class="grid grid-cols-4 gap-3">
              <div
                v-for="filename in currentImages"
                :key="filename"
                class="group relative overflow-hidden rounded-lg border border-border"
              >
                <img
                  :src="getImageUrl(selectedCharacter, selectedOutfit, filename)"
                  :alt="filename"
                  class="aspect-square w-full object-cover"
                  loading="lazy"
                />
                <div class="truncate px-1.5 py-1 text-center text-xs text-muted-foreground">
                  {{ stripExtension(filename) }}
                </div>
                <button
                  class="text-destructive-foreground absolute top-1 right-1 rounded-full bg-destructive/80 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                  @click="onDeleteImage(filename)"
                >
                  <XIcon class="size-3.5" />
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2">
                <Button
                  size="sm"
                  :disabled="uploading || uploadQueue.progress.value.active"
                  @click="fileInputRef?.click()"
                >
                  <UploadIcon class="mr-1.5 size-4" />
                  Upload Files
                </Button>
                <Button
                  v-if="folderUpload.isSupported.value"
                  size="sm"
                  variant="outline"
                  :disabled="uploading || uploadQueue.progress.value.active"
                  @click="onImportOutfitFolder"
                >
                  <FolderOpenIcon class="mr-1.5 size-4" />
                  Import Outfit Folder
                </Button>
                <span v-if="uploading" class="text-sm text-muted-foreground">Uploading...</span>
                <span v-if="uploadError" class="text-sm text-destructive">{{ uploadError }}</span>
                <input
                  ref="fileInputRef"
                  type="file"
                  accept=".avif,.png,.jpg,.jpeg,.webp"
                  multiple
                  class="hidden"
                  @change="onFileSelected"
                />
              </div>

              <div v-if="uploadQueue.progress.value.active" class="flex flex-col gap-1">
                <Progress :model-value="uploadPercent" class="h-2" />
                <div class="flex items-center justify-between text-xs text-muted-foreground">
                  <span
                    >{{ uploadQueue.progress.value.processed }} /
                    {{ uploadQueue.progress.value.total }}</span
                  >
                  <Button
                    size="sm"
                    variant="ghost"
                    class="h-5 px-1 text-xs"
                    @click="uploadQueue.cancel()"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="selectedCharacter">
            <div class="text-sm text-muted-foreground">Select an outfit, or add a new one:</div>
            <div class="flex gap-1">
              <Input
                v-model="newOutfitName"
                placeholder="New outfit name"
                class="h-8 max-w-xs text-sm"
              />
              <Button size="sm" variant="outline" class="h-8" @click="onAddOutfit"> Add </Button>
            </div>
          </template>

          <template v-else>
            <div class="flex h-full items-center justify-center text-sm text-muted-foreground">
              Select a character to manage images
            </div>
          </template>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import {
  ChevronRightIcon,
  FolderOpenIcon,
  ImageIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from 'lucide-vue-next'

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
import { Progress } from '@/components/ui/progress'
import { useCharacterImages } from '@/composables/use-character-images'
import { useFolderUpload } from '@/composables/use-folder-upload'
import { useUploadQueue } from '@/composables/use-upload-queue'
import { getImageUrl } from '@/lib/api'
import { stripExtension } from '@/lib/utils'

const open = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const newCharacterName = ref('')
const newOutfitName = ref('')

const {
  imagesData,
  selectedCharacter,
  selectedOutfit,
  uploading,
  uploadError,
  loadImages,
  uploadImages,
  deleteImage,
  deleteCharacterImages,
  deleteAllImages,
  selectCharacter,
  selectOutfit,
} = useCharacterImages()

const folderUpload = useFolderUpload()
const uploadQueue = useUploadQueue()

const uploadPercent = computed(() => {
  const p = uploadQueue.progress.value
  if (p.total === 0) return 0
  return Math.round((p.processed / p.total) * 100)
})

const currentImages = computed(() => {
  if (!selectedCharacter.value || !selectedOutfit.value) return []
  const char = imagesData.value.characters.find((c) => c.name === selectedCharacter.value)
  const outfit = char?.outfits.find((o) => o.name === selectedOutfit.value)
  return outfit?.images ?? []
})

const onSelectCharacter = (name: string) => {
  if (selectedCharacter.value === name) {
    selectCharacter(null)
  } else {
    selectCharacter(name)
  }
}

const onAddCharacter = () => {
  const name = newCharacterName.value.trim()
  if (!name) return
  selectCharacter(name)
  newCharacterName.value = ''
}

const onAddOutfit = () => {
  const name = newOutfitName.value.trim()
  if (!name) return
  selectOutfit(name)
  newOutfitName.value = ''
}

const onFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0 || !selectedCharacter.value || !selectedOutfit.value) return

  await uploadImages(selectedCharacter.value, selectedOutfit.value, [...files])
  input.value = ''
}

const onDeleteImage = async (filename: string) => {
  if (!selectedCharacter.value || !selectedOutfit.value) return
  if (!globalThis.confirm(`Delete "${stripExtension(filename)}"?`)) return

  await deleteImage(selectedCharacter.value, selectedOutfit.value, filename)
}

const onDeleteCharacter = async () => {
  if (!selectedCharacter.value) return
  if (!globalThis.confirm(`Delete all images for "${selectedCharacter.value}"?`)) return

  await deleteCharacterImages(selectedCharacter.value)
}

const onDeleteAll = async () => {
  if (!globalThis.confirm('Delete ALL images? This cannot be undone.')) return
  if (!globalThis.confirm('Are you sure? Type OK to confirm.')) return

  await deleteAllImages()
}

const onBulkImport = async () => {
  try {
    const structure = await folderUpload.selectBulkFolder()
    if (!structure) return

    const totalFiles = structure.characters.reduce(
      (sum, c) => sum + c.outfits.reduce((s, o) => s + o.images.length, 0),
      0,
    )

    const confirmed = globalThis.confirm(
      `Bulk Import\n${String(structure.characters.length)} characters, ${String(totalFiles)} images\n\nProceed?`,
    )
    if (!confirmed) return

    const tasks = structure.characters.flatMap((char) =>
      char.outfits.map((outfit) => ({
        character: char.characterName,
        outfit: outfit.outfitName,
        files: outfit.images,
      })),
    )

    await uploadQueue.start(tasks, loadImages)
  } catch {
    // User-visible errors are shown via uploadQueue.progress
  }
}

const onImportCharacterFolder = async () => {
  try {
    const structure = await folderUpload.selectCharacterFolder()
    if (!structure) return

    const totalFiles = structure.outfits.reduce((sum, o) => sum + o.images.length, 0)
    const confirmed = globalThis.confirm(
      `Import "${structure.characterName}"\n${String(structure.outfits.length)} outfits, ${String(totalFiles)} images\n\nProceed?`,
    )
    if (!confirmed) return

    const tasks = structure.outfits.map((outfit) => ({
      character: structure.characterName,
      outfit: outfit.outfitName,
      files: outfit.images,
    }))

    await uploadQueue.start(tasks, loadImages)
    selectCharacter(structure.characterName)
  } catch {
    // User-visible errors are shown via uploadQueue.progress
  }
}

const onImportOutfitFolder = async () => {
  if (!selectedCharacter.value) return

  try {
    const outfit = await folderUpload.selectOutfitFolder()
    if (!outfit) return

    await uploadImages(selectedCharacter.value, outfit.outfitName, outfit.images)
    selectOutfit(outfit.outfitName)
  } catch {
    // User-visible errors are shown via upload error state
  }
}

const onEscapeKeyDown = (event: Event) => {
  if (uploadQueue.progress.value.active) {
    event.preventDefault()
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    void loadImages()
  }
})
</script>
