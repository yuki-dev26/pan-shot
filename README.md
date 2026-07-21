# PanShot

イラストの見どころを指定するだけで、映えるカメラワーク動画に。

静止画をアップロードすると、寄り・カット・引きのシネマティック演出動画をブラウザ内で書き出してダウンロードできます。

## セットアップ

```bash
bun install
bun run dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。

## 使い方

1. 画像をドロップ（またはクリック選択）
2. ズームしたい 2 箇所をクリックで指定（初期位置は自動推定）
3. 「動画を書き出してDL」を押す

構成は「1箇所目寄り → フェードで2箇所目 → フェードで中央の全体へ切り替えつつゆっくり少し引き」です。処理はすべてクライアント側で完結します。

## 技術

- Bun + Next.js (App Router) + TypeScript + Tailwind CSS v4
- Canvas 2D で演出レンダリング
- MediaRecorder で WebM / MP4 書き出し
- PWA 対応（ホーム画面追加可。本番ビルドで Service Worker 有効）

アイコンを差し替えたときは `public/icon.png`（512・透過）を更新してから:

```bash
bun run icons
```
