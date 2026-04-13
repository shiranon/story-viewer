import { ref } from 'vue'

import { fontPresets } from '@/lib/font-presets'

import type { FontPreset } from '@/lib/font-presets'

export type ImageAlign = 'start' | 'center' | 'end'
export type MdTheme = 'dark' | 'light'
export type FontMode = 'preset' | 'system'

const loadedFonts = new Set<string>()

const loadWebFont = (preset: FontPreset) => {
  if (!preset.webFont || loadedFonts.has(preset.value)) return
  loadedFonts.add(preset.value)

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = preset.webFont.url
  link.crossOrigin = 'anonymous'
  document.head.append(link)
}

const getImageMargins = (align: ImageAlign) => {
  switch (align) {
    case 'center': {
      return { start: 'auto', end: 'auto' }
    }
    case 'end': {
      return { start: 'auto', end: '0' }
    }
    default: {
      return { start: '0', end: 'auto' }
    }
  }
}

const applyCssVariables = (settings: {
  imageWidth: number
  imageAlign: ImageAlign
  fontSize: number
  fontStack: string
}) => {
  const root = document.documentElement
  root.style.setProperty('--message-image-width', `${String(settings.imageWidth)}%`)
  const { start, end } = getImageMargins(settings.imageAlign)
  root.style.setProperty('--message-image-margin-inline-start', start)
  root.style.setProperty('--message-image-margin-inline-end', end)
  root.style.setProperty('--message-font-size', `${String(settings.fontSize)}px`)
  root.style.setProperty('--message-font-family', settings.fontStack)
}

const resolveFontStack = (mode: FontMode, presetValue: string, systemFontName: string): string => {
  if (mode === 'system' && systemFontName.trim()) {
    return `"${systemFontName}", system-ui, sans-serif`
  }
  const preset = fontPresets.find((p) => p.value === presetValue)
  if (preset) {
    loadWebFont(preset)
    return preset.stack
  }
  const fallback = fontPresets[0]
  return fallback ? fallback.stack : 'system-ui, sans-serif'
}

const STORAGE_KEYS = {
  imageWidth: 'viewer-image-width',
  imageAlign: 'viewer-image-align',
  mdTheme: 'viewer-md-theme',
  fontSize: 'viewer-font-size',
  fontMode: 'viewer-font-mode',
  fontPreset: 'viewer-font-preset',
  systemFont: 'viewer-system-font',
} as const

export const useViewerSettings = () => {
  const imageWidth = ref(Number(localStorage.getItem(STORAGE_KEYS.imageWidth)) || 100)
  const imageAlign = ref<ImageAlign>(
    (localStorage.getItem(STORAGE_KEYS.imageAlign) as ImageAlign | null) ?? 'start',
  )
  const mdTheme = ref<MdTheme>(
    (localStorage.getItem(STORAGE_KEYS.mdTheme) as MdTheme | null) ?? 'dark',
  )
  const fontSize = ref(Number(localStorage.getItem(STORAGE_KEYS.fontSize)) || 16)
  const fontMode = ref<FontMode>(
    (localStorage.getItem(STORAGE_KEYS.fontMode) as FontMode | null) ?? 'preset',
  )
  const fontPresetValue = ref(localStorage.getItem(STORAGE_KEYS.fontPreset) ?? 'system')
  const systemFontName = ref(localStorage.getItem(STORAGE_KEYS.systemFont) ?? '')

  const currentFontStack = () =>
    resolveFontStack(fontMode.value, fontPresetValue.value, systemFontName.value)

  const applyAll = () => {
    applyCssVariables({
      imageWidth: imageWidth.value,
      imageAlign: imageAlign.value,
      fontSize: fontSize.value,
      fontStack: currentFontStack(),
    })
  }

  const saveImageWidth = (width: number) => {
    const clamped = Math.min(100, Math.max(10, width))
    imageWidth.value = clamped
    localStorage.setItem(STORAGE_KEYS.imageWidth, String(clamped))
    applyAll()
  }

  const saveFontSize = (size: number) => {
    const clamped = Math.min(48, Math.max(8, size))
    fontSize.value = clamped
    localStorage.setItem(STORAGE_KEYS.fontSize, String(clamped))
    applyAll()
  }

  const saveFontPreset = (value: string) => {
    fontPresetValue.value = value
    fontMode.value = 'preset'
    localStorage.setItem(STORAGE_KEYS.fontPreset, value)
    localStorage.setItem(STORAGE_KEYS.fontMode, 'preset')
    applyAll()
  }

  const saveSystemFont = (name: string) => {
    systemFontName.value = name
    fontMode.value = 'system'
    localStorage.setItem(STORAGE_KEYS.systemFont, name)
    localStorage.setItem(STORAGE_KEYS.fontMode, 'system')
    applyAll()
  }

  const saveImageAlign = (align: ImageAlign) => {
    imageAlign.value = align
    localStorage.setItem(STORAGE_KEYS.imageAlign, align)
    applyAll()
  }

  const saveMdTheme = (theme: MdTheme) => {
    mdTheme.value = theme
    localStorage.setItem(STORAGE_KEYS.mdTheme, theme)
  }

  applyAll()

  return {
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
  }
}
