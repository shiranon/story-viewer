import { marked } from 'marked'

import type {
  MarkdownBlockNode,
  MarkdownFigureNode,
  MarkdownInlineNode,
  MarkdownTableCellNode,
  MarkdownTableRowNode,
} from '@/lib/types'
import type { Tokens } from 'marked'

type TokensList = Tokens.Generic[]

const markedOptions = {
  gfm: true,
  breaks: true,
}

export const parseMarkdown = (content: string): MarkdownBlockNode[] => {
  if (!content) {
    return []
  }

  try {
    const tokens = marked.lexer(content, markedOptions)
    return transformBlockTokens(tokens)
  } catch (error) {
    console.warn('Failed to parse markdown:', error)
    return [
      {
        type: 'paragraph',
        children: [{ type: 'text', value: content }],
      },
    ]
  }
}

const transformParagraphToken = (token: Tokens.Generic): MarkdownBlockNode | null => {
  const inlineNodes = transformInlineTokens(token.tokens)
  const figure = maybeConvertToFigure(inlineNodes)
  if (figure) return figure
  if (inlineNodes.length > 0) return { type: 'paragraph', children: inlineNodes }
  return null
}

const transformTableToken = (token: Tokens.Generic): MarkdownBlockNode => {
  const tableToken = token as Tokens.Table
  const aligns = tableToken.align

  const buildRow = (cells: Tokens.TableCell[], header: boolean): MarkdownTableRowNode => ({
    type: 'tableRow',
    cells: cells.map(
      (cell, index): MarkdownTableCellNode => ({
        type: 'tableCell',
        align: (aligns[index] as 'left' | 'center' | 'right' | undefined) ?? null,
        header,
        children: transformInlineTokens(cell.tokens),
      }),
    ),
  })

  return {
    type: 'table',
    header: buildRow(tableToken.header, true),
    rows: tableToken.rows.map((row) => buildRow(row, false)),
  }
}

const textAsParagraph = (value: string): MarkdownBlockNode | null => {
  const trimmed = value.trim()
  if (!trimmed) return null
  return { type: 'paragraph', children: [{ type: 'text', value: trimmed }] }
}

const transformBlockTextToken = (token: Tokens.Generic): MarkdownBlockNode | null => {
  const inlineTokens = 'tokens' in token ? token.tokens : undefined
  const inlineNodes = transformInlineTokens(inlineTokens)
  if (inlineNodes.length > 0) {
    return { type: 'paragraph', children: inlineNodes }
  }
  return null
}

const transformBlockTokens = (tokens: TokensList): MarkdownBlockNode[] => {
  const result: MarkdownBlockNode[] = []

  for (const token of tokens) {
    switch (token.type) {
      case 'space': {
        continue
      }
      case 'paragraph': {
        const node = transformParagraphToken(token)
        if (node) result.push(node)
        break
      }
      case 'heading': {
        result.push({
          type: 'heading',
          depth: Math.min(6, token.depth),
          children: transformInlineTokens(token.tokens),
        })
        break
      }
      case 'code': {
        result.push({
          type: 'code',
          language: token.lang ?? undefined,
          value: token.text ?? '',
        })
        break
      }
      case 'blockquote': {
        result.push({
          type: 'blockquote',
          children: transformBlockTokens(token.tokens ?? []),
        })
        break
      }
      case 'list': {
        const items = (token.items ?? []).map((item: Tokens.ListItem) => ({
          type: 'listItem' as const,
          children: transformBlockTokens(item.tokens),
        }))
        result.push({
          type: 'list',
          ordered: token.ordered,
          loose: token.loose,
          items,
        })
        break
      }
      case 'table': {
        result.push(transformTableToken(token))
        break
      }
      case 'hr': {
        result.push({ type: 'thematicBreak' })
        break
      }
      case 'html': {
        const node = textAsParagraph(token.text ?? token.raw ?? '')
        if (node) result.push(node)
        break
      }
      case 'text': {
        const node = transformBlockTextToken(token)
        if (node) result.push(node)
        break
      }
      default: {
        const node = textAsParagraph(token.raw)
        if (node) result.push(node)
      }
    }
  }

  return result
}

const transformLinkToken = (token: Tokens.Generic): MarkdownInlineNode[] => {
  const href = sanitizeUrl(token.href)
  if (href) {
    return [
      {
        type: 'link',
        href,
        title: token.title ?? null,
        children: transformInlineTokens(token.tokens),
      },
    ]
  }
  return transformInlineTokens(token.tokens)
}

const transformImageToken = (token: Tokens.Generic): MarkdownInlineNode[] => {
  const source = sanitizeUrl(token.href ?? '')
  if (source) {
    return [
      {
        type: 'image',
        src: source,
        alt: token.text ?? '',
        title: token.title ?? null,
      },
    ]
  }
  return []
}

const transformTextToken = (token: Tokens.Generic): MarkdownInlineNode[] => {
  if ('tokens' in token && token.tokens) {
    return transformInlineTokens(token.tokens)
  }
  if (token.text) {
    return [{ type: 'text', value: token.text }]
  }
  return []
}

const transformInlineTokens = (tokens?: TokensList): MarkdownInlineNode[] => {
  if (!tokens || tokens.length === 0) {
    return []
  }

  const result: MarkdownInlineNode[] = []

  for (const token of tokens) {
    switch (token.type) {
      case 'text': {
        result.push(...transformTextToken(token))
        break
      }
      case 'escape': {
        if (token.text) {
          result.push({ type: 'text', value: token.text })
        }
        break
      }
      case 'strong': {
        result.push({ type: 'strong', children: transformInlineTokens(token.tokens) })
        break
      }
      case 'em': {
        result.push({ type: 'emphasis', children: transformInlineTokens(token.tokens) })
        break
      }
      case 'codespan': {
        result.push({ type: 'inlineCode', value: token.text ?? '' })
        break
      }
      case 'del': {
        result.push({ type: 'delete', children: transformInlineTokens(token.tokens) })
        break
      }
      case 'br': {
        result.push({ type: 'break' })
        break
      }
      case 'link': {
        result.push(...transformLinkToken(token))
        break
      }
      case 'image': {
        result.push(...transformImageToken(token))
        break
      }
      default: {
        const fallback = token.raw
        if (fallback) {
          result.push({ type: 'text', value: fallback })
        }
      }
    }
  }

  return mergeAdjacentTextNodes(result)
}

const PLACEHOLDER_ORIGIN = 'http://example.com'

const sanitizeUrl = (url?: string): string | null => {
  if (!url) return null
  if (url.startsWith('#')) return url

  try {
    const parsed = new URL(url, PLACEHOLDER_ORIGIN)

    if (parsed.origin === PLACEHOLDER_ORIGIN) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`
    }

    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href
    }

    return null
  } catch {
    return null
  }
}

const maybeConvertToFigure = (nodes: MarkdownInlineNode[]): MarkdownFigureNode | null => {
  let candidate: MarkdownInlineNode | null = null
  for (const node of nodes) {
    if (node.type === 'break') continue
    if (node.type === 'text' && node.value.trim().length === 0) continue
    if (candidate !== null) return null
    candidate = node
  }
  if (!candidate || candidate.type !== 'image') return null
  return { type: 'figure', src: candidate.src, alt: candidate.alt, title: candidate.title ?? null }
}

const mergeAdjacentTextNodes = (nodes: MarkdownInlineNode[]): MarkdownInlineNode[] => {
  if (nodes.length < 2) return nodes

  const merged: MarkdownInlineNode[] = []
  for (const node of nodes) {
    const last = merged.at(-1)
    if (last?.type === 'text' && node.type === 'text') {
      merged[merged.length - 1] = { type: 'text', value: last.value + node.value }
    } else {
      merged.push(node)
    }
  }
  return merged
}
