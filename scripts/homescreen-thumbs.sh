#!/bin/sh
# Make a 320px-wide thumbnail for every home screen that doesn't have one yet.
# Needs cwebp (`brew install webp` / `apt install webp`) or ImageMagick.
# The Pages deploy runs this too, so a forgotten thumbnail still ships.
set -e
cd "$(dirname "$0")/../images/homescreen"
mkdir -p thumbs
for src in *.webp; do
  out="thumbs/$src"
  [ -f "$out" ] && continue
  if command -v cwebp >/dev/null 2>&1; then
    cwebp -quiet -resize 320 0 -q 72 -m 6 "$src" -o "$out"
  elif command -v magick >/dev/null 2>&1; then
    magick "$src" -resize 320x -quality 72 "$out"
  else
    convert "$src" -resize 320x -quality 72 "$out"
  fi
  echo "thumbnail: images/homescreen/$out"
done
