# テストドキュメント

これは `marked` がMarkdownを正しくパースできるか確認するためのサンプルファイルです。

## ブロック要素

### 見出し (Heading)
# H1
## H2
### H3
#### H4
##### H5
###### H6

### 段落 (Paragraph) & 改行 (Break)
これは1つ目の段落です。
2行目（ここは繋がるはず）。

ここは2つ目の段落です。  
末尾にスペース2つで改行（br）になります。

### 引用 (Blockquote)
> これは引用です。
> > ネストされた引用です。

### リスト (List)

**順序なしリスト (Unordered List)**
- りんご
- みかん
  - 温州みかん
  - 伊予柑
- ぶどう

**順序ありリスト (Ordered List)**
1. 第一歩
2. 第二歩
3. 第三歩

### コードブロック (Code Block)
```typescript
const greeting: string = "Hello, World!";
console.log(greeting);
```

### テーブル (Table)
| 左寄せ | 中央寄せ | 右寄せ |
| :--- | :---: | ---: |
| Apple | Banana | Cherry |
| 100 | 200 | 300 |

### 水平線 (Thematic Break)
---

### HTML要素
<div class="note">
ここは直接記述されたHTMLです。
</div>

## インライン要素

**強調 (Strong)** と *斜体 (Emphasis)* と ~~打ち消し線 (Delete)~~ と `インラインコード (Codespan)` をテストします。

エスケープ文字のテスト: \* \_ \[ \] 

### リンクと画像 (Link & Image)

通常のリンク: [Google](https://www.google.com)
タイトル付きリンク: [Example](https://example.com "Example Site")
相対・ルートリンク: [/about](/about)
ハッシュリンク: [#見出し-heading](#見出し-heading)

**画像 (Inline Image / Figure)**

画像単体の段落（Figureとしてパースされる想定）:

![サンプル画像](https://picsum.photos/400/200 "テスト画像")

段落内の画像（Inline Imageとしてパースされる想定）: これはその一部の画像 ![アイコン](https://picsum.photos/20/20) です。
