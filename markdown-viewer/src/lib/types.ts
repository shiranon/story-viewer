// --- Story Tree (API response) ---

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

export interface StoryTree {
  stories: TreeNode[]
}

// --- Markdown AST ---

export interface MarkdownTextNode {
  type: 'text'
  value: string
}

export interface MarkdownBreakNode {
  type: 'break'
}

export interface MarkdownInlineCodeNode {
  type: 'inlineCode'
  value: string
}

export interface MarkdownStrongNode {
  type: 'strong'
  children: MarkdownInlineNode[]
}

export interface MarkdownEmphasisNode {
  type: 'emphasis'
  children: MarkdownInlineNode[]
}

export interface MarkdownDeleteNode {
  type: 'delete'
  children: MarkdownInlineNode[]
}

export interface MarkdownLinkNode {
  type: 'link'
  href: string
  title?: string | null
  children: MarkdownInlineNode[]
}

export interface MarkdownImageNode {
  type: 'image'
  src: string
  alt?: string
  title?: string | null
}

export type MarkdownInlineNode =
  | MarkdownTextNode
  | MarkdownBreakNode
  | MarkdownInlineCodeNode
  | MarkdownStrongNode
  | MarkdownEmphasisNode
  | MarkdownDeleteNode
  | MarkdownLinkNode
  | MarkdownImageNode

export interface MarkdownParagraphNode {
  type: 'paragraph'
  children: MarkdownInlineNode[]
}

export interface MarkdownHeadingNode {
  type: 'heading'
  depth: number
  children: MarkdownInlineNode[]
}

export interface MarkdownCodeBlockNode {
  type: 'code'
  language?: string
  value: string
}

export interface MarkdownBlockquoteNode {
  type: 'blockquote'
  children: MarkdownBlockNode[]
}

export interface MarkdownListItemNode {
  type: 'listItem'
  children: MarkdownBlockNode[]
}

export interface MarkdownListNode {
  type: 'list'
  ordered: boolean
  loose: boolean
  items: MarkdownListItemNode[]
}

export interface MarkdownFigureNode {
  type: 'figure'
  src: string
  alt?: string
  title?: string | null
}

export interface MarkdownTableCellNode {
  type: 'tableCell'
  align: 'left' | 'center' | 'right' | null
  header: boolean
  children: MarkdownInlineNode[]
}

export interface MarkdownTableRowNode {
  type: 'tableRow'
  cells: MarkdownTableCellNode[]
}

export interface MarkdownTableNode {
  type: 'table'
  header: MarkdownTableRowNode
  rows: MarkdownTableRowNode[]
}

export interface MarkdownThematicBreakNode {
  type: 'thematicBreak'
}

export type MarkdownBlockNode =
  | MarkdownParagraphNode
  | MarkdownHeadingNode
  | MarkdownCodeBlockNode
  | MarkdownBlockquoteNode
  | MarkdownListNode
  | MarkdownFigureNode
  | MarkdownTableNode
  | MarkdownThematicBreakNode
