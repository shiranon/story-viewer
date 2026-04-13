import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

export interface FileEntry {
  type: 'file'
  name: string
  path: string
}

export interface DirEntry {
  type: 'dir'
  name: string
  children: TreeNode[]
}

export type TreeNode = FileEntry | DirEntry

const EXCLUDED_DIRS = new Set(['markdown-viewer', 'node_modules'])

const isHidden = (name: string) => name.startsWith('.')

export const naturalSort = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true })

const scanDir = async (dir: string, relativePath: string): Promise<TreeNode[]> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const entries = await readdir(dir, { withFileTypes: true })

  const directories = entries
    .filter((e) => e.isDirectory() && !isHidden(e.name) && !EXCLUDED_DIRS.has(e.name))
    .map((e) => e.name)
    .toSorted(naturalSort)

  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => e.name)
    .toSorted(naturalSort)

  const nodes: TreeNode[] = []

  for (const name of directories) {
    const childPath = relativePath ? `${relativePath}/${name}` : name
    const children = await scanDir(path.join(dir, name), childPath)
    if (children.length > 0) {
      nodes.push({ type: 'dir', name, children })
    }
  }

  if (relativePath) {
    for (const name of files) {
      nodes.push({ type: 'file', name, path: `${relativePath}/${name}` })
    }
  }

  return nodes
}

export const scanStories = async (parentDir: string): Promise<TreeNode[]> => {
  return scanDir(parentDir, '')
}

export const readMarkdownContent = async (parentDir: string, filePath: string): Promise<string> => {
  const fullPath = path.join(parentDir, filePath)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return readFile(fullPath, 'utf8')
}
