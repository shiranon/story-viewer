# markdown-viewer (App)

Story Viewer の Vue アプリケーション本体です。

## 技術スタック

- **Vue 3** (Composition API) + **Vue Router** + **Pinia**
- **Vite** (dev server / bundler)
- **TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **shadcn-vue** (new-york style, reka-ui ベース)
- **Lucide** アイコン (`lucide-vue-next`)
- **marked** (Markdown パーサー) + **DOMPurify** (サニタイズ)
- **Prism.js** (シンタックスハイライト)

## ディレクトリ構成

```
src/              Vue コンポーネント、composables、ユーティリティ
lib/              Vite プラグインとビルドスクリプトの共有コード (story-scanner, R2 client)
vite-plugins/     開発用 API プラグイン (markdown-api, image-api)
api/              Vercel serverless functions (本番用)
scripts/          ビルドスクリプト (prebuild)
data/             gitignored -- ランタイムデータ (images.json)
public/api/       gitignored -- prebuild が生成する静的 API ファイル
docs/             アーキテクチャドキュメント
```

## Dual API Mode

`VITE_STATIC_API` 環境変数で API モードが切り替わります。

### 開発モード (`VITE_STATIC_API` 未設定)

Vite dev-server プラグインがファイルシステムと R2 から直接 API を提供します。

| プラグイン   | ルート                                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| markdown-api | `/api/stories`, `/api/content`                                                                                                          |
| image-api    | `/api/images`, `/api/images/file`, `/api/images/upload`, `/api/images/delete`, `/api/images/delete-character`, `/api/images/delete-all` |

`.md` ファイルやディレクトリの変更はファイルウォッチャーで自動検出されます。

### 本番モード (`VITE_STATIC_API=true`)

`prebuild` スクリプトが静的ファイルを生成します。

- `public/api/stories.json` -- ストーリーツリー
- `public/api/content/**/*.md` -- コピーされた Markdown ファイル
- `public/api/images.json` -- 画像メタデータ

`/api/images/file` のみ Vercel serverless function で動的に配信されます。

## Markdown Rendering Pipeline

`src/lib/markdown.ts` が `marked` でトークンを生成し、独自の型付き AST (`src/lib/types.ts`) に変換します。`src/components/content/` の Vue コンポーネントがこの AST を描画します。

- 画像のみの段落は `figure` ノードに昇格
- URL は `http:`, `https:`, 相対パス、ハッシュリンクのみ許可
- 隣接するテキストノードは自動マージ
- GFM と改行が有効

## Story Scanner

`lib/story-scanner.ts` がリポジトリルート (このディレクトリの親) を再帰スキャンし、サブディレクトリ内の `.md` ファイルを収集します。

除外対象: `markdown-viewer/`, `node_modules/`, `.` で始まるディレクトリ、ルート直下の `.md` ファイル。

## Image Management

キャラクター画像は Cloudflare R2 に `character/outfit/filename` の形式で保存されます。メタデータは `data/images.json` で管理されます。

バリデーション:
- 最大ファイルサイズ: 10MB
- 許可される拡張子: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.avif`

## Authentication

`middleware.ts` (Vercel Middleware) が全ルートに Basic Auth を適用します。環境変数 `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` で制御されます。

## 設定

### TypeScript

プロジェクト参照で分割されています。

| ファイル               | 対象                  |
| ---------------------- | --------------------- |
| `tsconfig.app.json`    | ブラウザ (Vue アプリ) |
| `tsconfig.node.json`   | Node / Vite           |
| `tsconfig.vitest.json` | テスト                |

### パスエイリアス

`@/` が `src/` にマッピングされています。

### Lint / Format

ESLint (vue, typescript, sonarjs, unicorn, security, import-x, regexp, better-tailwindcss) + Prettier。

## 環境変数

[`.env.example`](.env.example) を参照してください。

## 詳細なアーキテクチャ

[docs/architecture.md](docs/architecture.md)
