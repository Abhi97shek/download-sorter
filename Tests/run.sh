#!/bin/zsh
# Builds and runs the small checks for folder naming, duplicate names and the rules file.
set -e
cd "$(dirname "$0")/.."
OUT=$(mktemp -d)
swiftc -swift-version 5 Sources/Naming.swift Sources/RuleStore.swift Tests/main.swift -o "$OUT/check"
"$OUT/check"
rm -rf "$OUT"
