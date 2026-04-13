import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { scanStories } from '../lib/story-scanner'

import type { Plugin } from 'vite'

export default function markdownApi(): Plugin {
  const parentDir = path.resolve(__dirname, '../..')
  let cachedTree: Awaited<ReturnType<typeof scanStories>> | null = null

  return {
    name: 'markdown-api',
    configureServer(server) {
      server.watcher.add(parentDir)

      server.watcher.on('all', (event, filePath) => {
        if (
          filePath.startsWith(parentDir) &&
          (filePath.endsWith('.md') || event === 'addDir' || event === 'unlinkDir')
        ) {
          cachedTree = null
        }
      })

      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/stories' || req.url === '/api/stories?fresh=1') {
          try {
            if (req.url.includes('fresh')) {
              cachedTree = null
            }
            cachedTree ??= await scanStories(parentDir)
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ stories: cachedTree }))
          } catch {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Failed to scan stories' }))
          }
          return
        }

        if (req.url?.startsWith('/api/content')) {
          const url = new URL(req.url, 'http://localhost')
          const filePath = url.searchParams.get('path')

          if (!filePath || filePath.includes('..') || !filePath.endsWith('.md')) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid path' }))
            return
          }

          try {
            const fullPath = path.join(parentDir, filePath)
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            const content = await readFile(fullPath, 'utf8')
            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
            res.end(content)
          } catch {
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'File not found' }))
          }
          return
        }

        next()
      })
    },
  }
}
