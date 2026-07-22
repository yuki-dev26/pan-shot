# PanShot

イラストの見どころを指定するだけで、映えるカメラワーク動画に。

静止画をアップロードすると、寄り・カット・引きのシネマティック演出動画を書き出してダウンロードできます。Web とデスクトップ（Windows / Mac）で同じ UI・ロジックを共有しています。

## 構成

```text
apps/web        Next.js サイト（PWA）
apps/desktop    Electron デスクトップアプリ
packages/shared UI・Canvas ロジック・i18n・スタイル
```

## セットアップ

```bash
bun install
```

## Web

```bash
bun dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。

本番ビルド:

```bash
bun run build
bun run start
```

## Desktop（Electron）

開発起動:

```bash
bun run dev:desktop
```

成果物はいずれも `apps/desktop/release/` に出力されます。

### Windows（`.exe`）

```bash
bun run build:desktop:win
```

### macOS（署名・公証付き `.dmg`）

事前に署名用の環境変数ファイルを用意します。

```bash
cp apps/desktop/.env.signing.example apps/desktop/.env.signing
```

`apps/desktop/.env.signing` に `CSC_NAME` / `APPLE_TEAM_ID` / `APPLE_ID` / `APPLE_APP_SPECIFIC_PASSWORD` を設定したうえで:

```bash
bun run build:desktop:mac:signed
```

署名なしのローカル確認用:

```bash
bun run build:desktop:mac
```

## 使い方

1. 画像をドロップ（またはクリック選択）
2. ズームしたい 2 箇所をクリックで指定（初期位置は自動推定）
3. 「動画を書き出してDL」を押す

構成は「1箇所目寄り → フェードで2箇所目 → フェードで中央の全体へ切り替えつつゆっくり少し引き」です。処理はすべてクライアント側で完結します。

## 技術

- Bun workspaces モノレポ
- React + TypeScript + Tailwind CSS v4
- Web: Next.js (App Router) + PWA
- Desktop: Electron + Vite + electron-builder
- Canvas 2D で演出レンダリング / MediaRecorder で WebM / MP4 書き出し

アイコンを差し替えたときは `apps/web/public/icon.png`（512・透過）を更新してから:

```bash
bun run icons
```
