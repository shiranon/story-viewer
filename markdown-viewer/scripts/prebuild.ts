import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { scanStories } from '../lib/story-scanner'

import type { TreeNode } from '../lib/story-scanner'

const projectRoot = path.resolve(import.meta.dirname, '..')
const parentDir = path.resolve(projectRoot, '..')
const outputDir = path.resolve(projectRoot, 'public/api')

const collectPaths = (nodes: TreeNode[]): string[] => {
  const paths: string[] = []

  const walk = (items: TreeNode[]) => {
    for (const item of items) {
      if (item.type === 'file') {
        paths.push(item.path)
      } else {
        walk(item.children)
      }
    }
  }

  walk(nodes)
  return paths
}

const main = async () => {
  // Clean previous output
  await rm(outputDir, { recursive: true, force: true })
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await mkdir(outputDir, { recursive: true })

  // Generate stories.json
  const tree = await scanStories(parentDir)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await writeFile(path.join(outputDir, 'stories.json'), JSON.stringify({ stories: tree }, null, 2))
  console.log(`Generated stories.json (${String(tree.length)} top-level entries)`)

  // Copy individual markdown files
  const paths = collectPaths(tree)
  await Promise.all(
    paths.map(async (filePath) => {
      const source = path.join(parentDir, filePath)
      const destination = path.join(outputDir, 'content', filePath)
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await mkdir(path.dirname(destination), { recursive: true })
      await copyFile(source, destination)
    }),
  )
  console.log(`Copied ${String(paths.length)} markdown files`)

  // Copy images.json
  const imagesJsonSource = path.join(projectRoot, 'data/images.json')
  try {
    await copyFile(imagesJsonSource, path.join(outputDir, 'images.json'))
    console.log('Copied images.json')
  } catch {
    // images.json may not exist, create empty
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await writeFile(path.join(outputDir, 'images.json'), JSON.stringify({ characters: [] }))
    console.log('Created empty images.json')
  }

  console.log('Prebuild complete')
}

await main().catch((error: unknown) => {
  console.error('Prebuild failed:', error)
  throw error
})
