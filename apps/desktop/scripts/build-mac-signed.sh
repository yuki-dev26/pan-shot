#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.signing"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE が見つかりません。"
  echo "  cp apps/desktop/.env.signing.example apps/desktop/.env.signing"
  echo "  を実行し、APPLE_ID と APPLE_APP_SPECIFIC_PASSWORD を設定してください。"
  exit 1
fi

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%%$'\r'}"
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
    key="${BASH_REMATCH[1]}"
    value="${BASH_REMATCH[2]}"
    if [[ "$value" =~ ^\"(.*)\"$ ]]; then
      value="${BASH_REMATCH[1]}"
    elif [[ "$value" =~ ^\'(.*)\'$ ]]; then
      value="${BASH_REMATCH[1]}"
    fi
    printf -v "$key" '%s' "$value"
    export "$key"
  fi
done < "$ENV_FILE"

if [[ -z "${APPLE_ID:-}" || -z "${APPLE_APP_SPECIFIC_PASSWORD:-}" ]]; then
  echo "Error: .env.signing に APPLE_ID と APPLE_APP_SPECIFIC_PASSWORD が必要です（公証用）。"
  exit 1
fi

cd "$ROOT"
electron-vite build
electron-builder --mac
