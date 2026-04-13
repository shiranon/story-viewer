import { URL, fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

import imageApi from './vite-plugins/image-api'
import markdownApi from './vite-plugins/markdown-api'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    tailwindcss(),
    markdownApi(),
    imageApi(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
  },
  server: {
    watch: {
      ignored: ['**/data/**'],
    },
  },
})
