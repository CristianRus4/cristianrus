#!/bin/sh
# Renders scripts/og.html to og.png (1200 by 630) with Playwright's headless Chromium.
# Install it once with: npx playwright install chromium-headless-shell
set -e
cd "$(dirname "$0")/.."
shell=$(ls -d "$HOME"/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell 2>/dev/null | tail -1)
[ -x "$shell" ] || { echo "No headless Chromium found. Run: npx playwright install chromium-headless-shell" >&2; exit 1; }
"$shell" --hide-scrollbars --window-size=1200,630 --force-device-scale-factor=1 \
  --allow-file-access-from-files --virtual-time-budget=2000 \
  --screenshot="$PWD/og.png" "file://$PWD/scripts/og.html" 2>/dev/null
echo "og.png: $(sips -g pixelWidth -g pixelHeight og.png | awk '/pixel/ {print $2}' | paste -sd x -)"
