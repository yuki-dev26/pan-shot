# PanShot

画像の見どころを指定するだけで、映えるカメラワーク動画に。

静止画を選択すると、寄り・カット・引きのシネマティック演出動画を書き出してダウンロードできます。Web とデスクトップ（Windows / Mac）で同じ UI・ロジックを共有しています。

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

本番デプロイ時は `apps/web/.env.example` を参考に `NEXT_PUBLIC_SITE_URL`（例: `https://example.com`）を設定してください。sitemap / OG / canonical に使います。

OGP 画像は `apps/web/public/og.png`（推奨 1200×630）を置けば使われます。

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
- Canvas 2D で演出レンダリング / MediaRecorder で MP4 書き出し（非対応時は WebM）

```bash
bun run icons
```
