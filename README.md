# Story Viewer

IDE 内蔵の AI エージェントと対話しながら Markdown でストーリーを執筆し、ブラウザで閲覧するためのビューアです。

## 使い方

### ストーリーの配置

リポジトリルート直下にサブディレクトリを作成し、その中に `.md` ファイルを配置します。

```
my-story/
  chapter-01.md
  chapter-02.md
another-story/
  scene-a.md
```

ルート直下の `.md` ファイルはスキャン対象外です。`example/` ディレクトリにサンプルがあります。

### AI エージェントの活用

ストーリーディレクトリに AI エージェントのルールファイルを配置すると、世界観やキャラクター設定を踏まえた執筆が可能になります。

```
my-story/
  .cursor/rules/          # Cursor の場合
  .antigravity/rules/     # Antigravity の場合
  CLAUDE.md               # Claude Code の場合
  chapter-01.md
  chapter-02.md
```

ルールファイルには舞台設定、登場人物、文体の指示などを記述します。エージェントがこれらを参照しながらストーリーを生成・加筆するため、設定の一貫性を保ちやすくなります。

### セットアップ

Node.js 24 以上と [bun](https://bun.sh/) が必要です。
[mise](https://mise.jdx.dev/) を使う場合はリポジトリの `mise.toml` で自動設定されます。

```sh
make install   # 依存関係のインストール
```

### 開発サーバーの起動

```sh
make dev
```

ファイルの追加・変更はリアルタイムで反映されます。サイドバーのディレクトリを展開すると最新のスキャン結果が取得されます。

### キャラクター画像

Cloudflare R2 に画像を保存する場合は `.env` を設定してください。

```sh
cp markdown-viewer/.env.example markdown-viewer/.env
```

| 変数                   | 用途                                    |
| ---------------------- | --------------------------------------- |
| `R2_ACCOUNT_ID`        | Cloudflare R2 アカウント ID             |
| `R2_ACCESS_KEY_ID`     | R2 API トークンのアクセスキー           |
| `R2_SECRET_ACCESS_KEY` | R2 API トークンのシークレットキー       |
| `R2_BUCKET_NAME`       | R2 バケット名 (デフォルト: `character`) |

### ビルドとプレビュー

```sh
make build     # プロダクションビルド
make preview   # ビルド結果のプレビュー
```

### その他のコマンド

```sh
make lint        # リント
make format      # フォーマット
make type-check  # 型チェック
make clean       # dist/ と public/api/ を削除
```

## デプロイ

[Vercel CLI](https://vercel.com/docs/cli) を使って手動デプロイします。

```sh
# 初回: プロジェクトのリンク (Root Directory に "markdown-viewer" を指定)
vercel link

# プレビューデプロイ
vercel deploy

# プロダクションデプロイ
vercel deploy --prod
```

環境変数は Vercel Dashboard または CLI で設定してください。

```sh
vercel env add R2_ACCOUNT_ID
vercel env add R2_ACCESS_KEY_ID
vercel env add R2_SECRET_ACCESS_KEY
vercel env add R2_BUCKET_NAME
vercel env add BASIC_AUTH_USER
vercel env add BASIC_AUTH_PASSWORD
```

## 詳細

アプリの技術的な詳細は [markdown-viewer/README.md](markdown-viewer/README.md) を参照してください。
