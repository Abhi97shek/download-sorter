#!/bin/zsh
# Packages the built app into dist/DownloadSorter.dmg (drag-to-Applications layout)
set -e
cd "$(dirname "$0")"

APP="build/Download Sorter.app"
[ -d "$APP" ] || ./build.sh

STAGE=$(mktemp -d)
mkdir -p dist
rm -f dist/DownloadSorter.dmg

ditto "$APP" "$STAGE/Download Sorter.app"
ln -s /Applications "$STAGE/Applications"

hdiutil create -volname "Download Sorter" -srcfolder "$STAGE" -ov -format UDZO dist/DownloadSorter.dmg
rm -rf "$STAGE"
echo "Built: dist/DownloadSorter.dmg"
