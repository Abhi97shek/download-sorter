#!/bin/zsh
# Packages the built app into dist/DownloadSorter.dmg:
# drag-to-Applications layout, and the app icon as the disk's icon once opened.
set -e
cd "$(dirname "$0")"

APP="build/Hopper.app"
[ -d "$APP" ] || ./build.sh

STAGE=$(mktemp -d); RW=$(mktemp -u).dmg; MNT=$(mktemp -d)
# If any step fails, unmount the disk image and remove the temp files instead of leaving them behind
trap 'hdiutil detach -quiet "$MNT" 2>/dev/null; rm -rf "$STAGE" "$RW" "$MNT"' EXIT
mkdir -p dist
rm -f dist/DownloadSorter.dmg

ditto "$APP" "$STAGE/Hopper.app"
ln -s /Applications "$STAGE/Applications"
cp Icon/AppIcon.icns "$STAGE/.VolumeIcon.icns"

# Writable image first, so the "use custom icon" flag can be set on the volume
hdiutil create -quiet -volname "Hopper" -srcfolder "$STAGE" -format UDRW -ov "$RW"
hdiutil attach -quiet -nobrowse -noautoopen -mountpoint "$MNT" "$RW"
SetFile -a C "$MNT"
SetFile -a V "$MNT/.VolumeIcon.icns"
hdiutil detach -quiet "$MNT"
hdiutil convert -quiet "$RW" -format UDZO -o dist/DownloadSorter.dmg

echo "Built: dist/DownloadSorter.dmg"
