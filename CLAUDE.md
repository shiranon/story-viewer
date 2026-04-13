# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Story Viewer -- Vue 3 SPA. Markdown story rendering + character image management (Cloudflare R2). Deployed to Vercel.

## Commands

Repo root の `Makefile` から実行 (package manager: **bun**, Node 24.x via `mise.toml`):

```sh
make install         # bun install
make dev             # Vite dev server
make build           # prebuild + type-check + production build
make preview         # preview production build
make lint            # prettier + eslint --cache
make format          # prettier --write
make type-check      # vue-tsc --build
make clean           # rm dist/ and public/api/
```

## Documentation

- [docs/architecture.md](markdown-viewer/docs/architecture.md) -- Dual API mode, rendering pipeline, image management, story scanner, auth, UI stack, conventions
