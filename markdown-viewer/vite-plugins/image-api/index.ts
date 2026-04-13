import path from 'node:path'

import { loadR2Env } from './env'
import {
  handleDelete,
  handleDeleteAll,
  handleDeleteCharacter,
  handleGetImageFile,
  handleGetImages,
  handleUpload,
} from './handlers'

import type { Plugin } from 'vite'

export default function imageApi(): Plugin {
  const imagesJsonPath = path.resolve(import.meta.dirname, '../../data/images.json')
  const projectRoot = path.resolve(import.meta.dirname, '../..')

  return {
    name: 'image-api',
    configureServer(server) {
      loadR2Env(projectRoot)

      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0] ?? ''

        if (pathname === '/api/images' && req.method === 'GET') {
          void handleGetImages(imagesJsonPath, res)
          return
        }

        if (pathname === '/api/images/file' && req.method === 'GET') {
          void handleGetImageFile(req, res)
          return
        }

        if (pathname === '/api/images/upload' && req.method === 'POST') {
          void handleUpload(req, res, imagesJsonPath)
          return
        }

        if (pathname === '/api/images/delete' && req.method === 'DELETE') {
          void handleDelete(req, res, imagesJsonPath)
          return
        }

        if (pathname === '/api/images/delete-character' && req.method === 'DELETE') {
          void handleDeleteCharacter(req, res, imagesJsonPath)
          return
        }

        if (pathname === '/api/images/delete-all' && req.method === 'DELETE') {
          void handleDeleteAll(res, imagesJsonPath)
          return
        }

        next()
      })
    },
  }
}
