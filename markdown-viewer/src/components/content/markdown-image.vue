<template>
  <figure class="message-image">
    <img :src="src" :alt="alt" :title="title ?? undefined" loading="lazy" decoding="async" />
  </figure>
</template>

<script setup lang="ts">
interface Props {
  src: string
  alt?: string
  caption?: string | null
  title?: string | null
}

withDefaults(defineProps<Props>(), {
  alt: '',
  caption: null,
  title: null,
})
</script>

<style scoped>
.message-image {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  overflow: hidden;
  width: min(100%, var(--message-image-width, 100%));
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-inline-start: var(--message-image-margin-inline-start, 0);
  margin-inline-end: var(--message-image-margin-inline-end, auto);
}

.message-image img {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: inherit;
}
</style>
