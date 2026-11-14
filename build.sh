#!/bin/zsh
# Builds "Download Sorter.app" into ./build
set -e
cd "$(dirname "$0")"

APP="build/Download Sorter.app"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

[ -f Icon/AppIcon.icns ] || Icon/make-icns.sh
cp Icon/AppIcon.icns "$APP/Contents/Resources/AppIcon.icns"

swiftc -O -swift-version 5 -target arm64-apple-macos13.0 \
  -o "$APP/Contents/MacOS/DownloadSorter" Sources/*.swift 2>&1 | grep -v "^$" || true
[ -f "$APP/Contents/MacOS/DownloadSorter" ] || { echo "Build failed"; exit 1; }

cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Download Sorter</string>
  <key>CFBundleDisplayName</key><string>Download Sorter</string>
  <key>CFBundleIdentifier</key><string>com.local.DownloadSorter</string>
  <key>CFBundleExecutable</key><string>DownloadSorter</string>
  <key>CFBundleIconFile</key><string>AppIcon</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundleVersion</key><string>1</string>
  <key>LSMinimumSystemVersion</key><string>13.0</string>
  <key>LSUIElement</key><true/>
  <key>NSHighResolutionCapable</key><true/>
</dict>
</plist>
PLIST

codesign --force --deep --sign - "$APP"
echo "Built: $APP"
