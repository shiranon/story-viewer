<template>
  <div class="markdown-body">
    <RenderBlock v-for="(block, index) in nodes" :key="index" :node="block" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import type { PropType, VNode, VNodeChild } from 'vue'

import DOMPurify from 'dompurify'
import Prism from 'prismjs'

import 'prismjs/components/prism-json'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-markdown'

import MarkdownImage from '@/components/content/markdown-image.vue'
import { parseMarkdown } from '@/lib/markdown'

import type {
  MarkdownBlockNode,
  MarkdownInlineNode,
  MarkdownListItemNode,
  MarkdownTableRowNode,
} from '@/lib/types'

const props = defineProps<{
  content: string
}>()

const nodes = computed(() => parseMarkdown(props.content))

const resolveImageSource = (source: string, alt: string): string => {
  if (source.startsWith('http://') || source.startsWith('https://')) return source
  // alt="C" はキャラ画像 → R2プロキシ経由で取得
  if (alt === 'C') {
    const path = decodeURIComponent(source.startsWith('/') ? source.slice(1) : source)
    return `/api/images/file?path=${encodeURIComponent(path)}`
  }
  return source
}

const renderInlineNode = (node: MarkdownInlineNode, index: number): VNode => {
  switch (node.type) {
    case 'text': {
      return h('span', { key: index }, node.value)
    }
    case 'break': {
      return h('br', { key: index })
    }
    case 'inlineCode': {
      return h('code', { key: index }, node.value)
    }
    case 'strong': {
      return h('strong', { key: index }, renderInlineNodes(node.children))
    }
    case 'emphasis': {
      return h('em', { key: index }, renderInlineNodes(node.children))
    }
    case 'delete': {
      return h('del', { key: index }, renderInlineNodes(node.children))
    }
    case 'link': {
      return h(
        'a',
        {
          key: index,
          href: node.href,
          title: node.title ?? undefined,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        renderInlineNodes(node.children),
      )
    }
    case 'image': {
      return h('img', {
        key: index,
        class: 'markdown-inline-image',
        src: resolveImageSource(node.src, node.alt ?? ''),
        alt: node.alt ?? '',
        title: node.title ?? undefined,
        loading: 'lazy',
        decoding: 'async',
      })
    }
    default: {
      return h('span', { key: index })
    }
  }
}

const renderInlineNodes = (inlineNodes: MarkdownInlineNode[]): VNode[] => {
  return inlineNodes.map((node, index) => renderInlineNode(node, index))
}

const renderListItems = (items: MarkdownListItemNode[]): VNodeChild[] => {
  return items.map((item, index) =>
    h(
      'li',
      { key: index },
      item.children.map((child, childIndex) =>
        renderBlockNode(child, `${String(index)}-${String(childIndex)}`),
      ),
    ),
  )
}

const highlightCode = (code: string, language = 'plaintext'): string => {
  const lang = language
  const grammar = Prism.languages[lang]
  if (grammar) {
    return Prism.highlight(code, grammar, lang)
  }
  return Prism.util.encode(code) as string
}

const renderBlockNode = (node: MarkdownBlockNode, key?: string | number): VNode => {
  switch (node.type) {
    case 'paragraph': {
      return h('p', { key }, renderInlineNodes(node.children))
    }
    case 'heading': {
      const tag = `h${String(Math.min(6, Math.max(1, node.depth)))}`
      return h(tag, { key }, renderInlineNodes(node.children))
    }
    case 'code': {
      const highlighted = highlightCode(node.value, node.language)
      const sanitized = DOMPurify.sanitize(highlighted, {
        ALLOWED_TAGS: ['span'],
        ALLOWED_ATTR: ['class'],
      })
      return h('pre', { key, class: 'prism-code' }, [h('code', { innerHTML: sanitized })])
    }
    case 'blockquote': {
      return h(
        'blockquote',
        { key },
        node.children.map((child, index) => renderBlockNode(child, index)),
      )
    }
    case 'list': {
      const tag = node.ordered ? 'ol' : 'ul'
      const className = node.loose ? 'markdown-list markdown-list--loose' : `markdown-list`
      return h(tag, { key, class: className }, renderListItems(node.items))
    }
    case 'figure': {
      return h(MarkdownImage, {
        key,
        src: resolveImageSource(node.src, node.alt ?? ''),
        alt: node.alt ?? '',
        caption: node.title ?? null,
        title: node.title ?? null,
      })
    }
    case 'table': {
      const renderRow = (row: MarkdownTableRowNode, rowKey: string | number) => {
        const tag = row.cells[0]?.header ? 'th' : 'td'
        return h(
          'tr',
          { key: rowKey },
          row.cells.map((cell, ci) =>
            h(
              tag,
              {
                key: ci,
                style: cell.align ? { textAlign: cell.align } : undefined,
              },
              renderInlineNodes(cell.children),
            ),
          ),
        )
      }
      return h('table', { key, class: 'markdown-table' }, [
        h('thead', {}, [renderRow(node.header, 'header')]),
        h(
          'tbody',
          {},
          node.rows.map((row, ri) => renderRow(row, ri)),
        ),
      ])
    }
    case 'thematicBreak': {
      return h('hr', { key, class: 'markdown-hr' })
    }
    default: {
      return h('div', { key })
    }
  }
}

const RenderBlock = defineComponent({
  name: 'RenderBlock',
  props: {
    node: {
      type: Object as PropType<MarkdownBlockNode>,
      required: true,
    },
  },
  setup(componentProps) {
    return () => renderBlockNode(componentProps.node)
  },
})
</script>

<style scoped>
.markdown-inline-image {
  display: inline-block;
  width: var(--message-image-width, 100%);
  max-width: 100%;
  height: auto;
  vertical-align: middle;
  border-radius: 0.375rem;
}

.markdown-list {
  list-style-type: disc;
}

ol.markdown-list {
  list-style-type: decimal;
}

.markdown-list--loose {
  gap: 0.5rem;
}

.markdown-hr {
  border-color: var(--border);
}
</style>
