import { computed, ref } from 'vue'

import { stripExtension } from '@/lib/utils'

import { useSharedImagesData } from './use-shared-images-data'

type ViewerLevel = 'characters' | 'outfits' | 'expressions'

interface Breadcrumb {
  label: string
  action?: () => void
}

export const useImageViewer = () => {
  const level = ref<ViewerLevel>('characters')
  const selectedCharacter = ref<string | null>(null)
  const selectedOutfit = ref<string | null>(null)
  const { imagesData, loading, loadImages } = useSharedImagesData()
  const copiedCharacter = ref<string | null>(null)

  const navigateToCharacter = (name: string) => {
    selectedCharacter.value = name
    selectedOutfit.value = null
    level.value = 'outfits'
  }

  const navigateToOutfit = (name: string) => {
    selectedOutfit.value = name
    level.value = 'expressions'
  }

  const navigateBack = () => {
    if (level.value === 'expressions') {
      selectedOutfit.value = null
      level.value = 'outfits'
    } else if (level.value === 'outfits') {
      selectedCharacter.value = null
      level.value = 'characters'
    }
  }

  const navigateToRoot = () => {
    selectedCharacter.value = null
    selectedOutfit.value = null
    level.value = 'characters'
  }

  const breadcrumbs = computed<Breadcrumb[]>(() => {
    const crumbs: Breadcrumb[] = [{ label: 'All Characters', action: navigateToRoot }]

    if (selectedCharacter.value) {
      if (level.value === 'outfits') {
        crumbs.push({ label: selectedCharacter.value })
      } else {
        crumbs.push({
          label: selectedCharacter.value,
          action: () => {
            if (selectedCharacter.value) {
              navigateToCharacter(selectedCharacter.value)
            }
          },
        })
      }
    }

    if (selectedOutfit.value) {
      crumbs.push({ label: selectedOutfit.value })
    }

    return crumbs
  })

  const currentCharacter = computed(
    () => imagesData.value.characters.find((c) => c.name === selectedCharacter.value) ?? null,
  )

  const currentOutfit = computed(
    () => currentCharacter.value?.outfits.find((o) => o.name === selectedOutfit.value) ?? null,
  )

  const generatePrompt = (characterName: string): string => {
    const char = imagesData.value.characters.find((c) => c.name === characterName)
    if (!char) return ''

    const outfitNames = char.outfits.map((o) => o.name)
    const allExpressions = [
      ...new Set(char.outfits.flatMap((o) => o.images.map((x) => stripExtension(x)))),
    ]

    return [
      '【画像URL】',
      `![C](${characterName}/{現在の服装}/{表情}.avif "画像")`,
      '',
      '【マークダウンの対象となるキャラクタ】',
      characterName,
      '【対象服装一覧】',
      ...outfitNames,
      '【対象表情一覧】',
      ...allExpressions,
    ].join('\n')
  }

  const copyPrompt = async (characterName: string) => {
    const text = generatePrompt(characterName)
    await navigator.clipboard.writeText(text)
    copiedCharacter.value = characterName
    setTimeout(() => {
      copiedCharacter.value = null
    }, 1500)
  }

  return {
    level,
    selectedCharacter,
    selectedOutfit,
    imagesData,
    loading,
    copiedCharacter,
    loadImages,
    navigateToCharacter,
    navigateToOutfit,
    navigateBack,
    navigateToRoot,
    breadcrumbs,
    currentCharacter,
    currentOutfit,
    generatePrompt,
    copyPrompt,
  }
}
