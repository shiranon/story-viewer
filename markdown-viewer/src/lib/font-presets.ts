export interface FontPreset {
  label: string
  value: string
  stack: string
  webFont?: {
    family: string
    url: string
  }
}

export const fontPresets: FontPreset[] = [
  {
    label: 'System UI',
    value: 'system',
    stack: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  {
    label: 'Noto Sans JP',
    value: 'noto-sans-jp',
    stack: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", Meiryo, sans-serif',
    webFont: {
      family: 'Noto Sans JP',
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap',
    },
  },
  {
    label: 'Noto Serif JP',
    value: 'noto-serif-jp',
    stack: '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", serif',
    webFont: {
      family: 'Noto Serif JP',
      url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&display=swap',
    },
  },
  {
    label: 'M PLUS 1p',
    value: 'm-plus-1p',
    stack: '"M PLUS 1p", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", Meiryo, sans-serif',
    webFont: {
      family: 'M PLUS 1p',
      url: 'https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@400;500;700&display=swap',
    },
  },
  {
    label: 'BIZ UDPGothic',
    value: 'biz-udpgothic',
    stack: '"BIZ UDPGothic", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", Meiryo, sans-serif',
    webFont: {
      family: 'BIZ UDPGothic',
      url: 'https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&display=swap',
    },
  },
  {
    label: 'Zen Maru Gothic',
    value: 'zen-maru-gothic',
    stack: '"Zen Maru Gothic", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", Meiryo, sans-serif',
    webFont: {
      family: 'Zen Maru Gothic',
      url: 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap',
    },
  },
]
