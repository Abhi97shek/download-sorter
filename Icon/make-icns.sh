#!/bin/zsh
# Renders the icon and packs every size macOS needs into Icon/AppIcon.icns
set -e
cd "$(dirname "$0")"
swift make-icon.swift icon_1024.png >/dev/null
rm -rf AppIcon.iconset && mkdir AppIcon.iconset
for s in 16 32 128 256 512; do
  sips -z $s $s icon_1024.png --out AppIcon.iconset/icon_${s}x${s}.png >/dev/null
  d=$((s*2)); sips -z $d $d icon_1024.png --out AppIcon.iconset/icon_${s}x${s}@2x.png >/dev/null
done
iconutil -c icns AppIcon.iconset -o AppIcon.icns
rm -rf AppIcon.iconset
echo "Built: Icon/AppIcon.icns"
