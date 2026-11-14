#!/bin/zsh
# Builds "Sortly.app" into ./build
set -e
cd "$(dirname "$0")"

APP="build/Sortly.app"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

[ -f Icon/AppIcon.icns ] || Icon/make-icns.sh
cp Icon/AppIcon.icns "$APP/Contents/Resources/AppIcon.icns"

Tests/run.sh   # stops the build if a check fails

swiftc -O -swift-version 5 -target arm64-apple-macos13.0 \
  -o "$APP/Contents/MacOS/Sortly" Sources/*.swift 2>&1 | grep -v "^$" || true
[ -f "$APP/Contents/MacOS/Sortly" ] || { echo "Build failed"; exit 1; }

cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Sortly</string>
  <key>CFBundleDisplayName</key><string>Sortly</string>
  <key>CFBundleIdentifier</key><string>com.local.DownloadSorter</string>
  <key>CFBundleExecutable</key><string>Sortly</string>
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
