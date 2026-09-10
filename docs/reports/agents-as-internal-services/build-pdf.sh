#!/usr/bin/env bash
# Builds docs/report.pdf from docs/report.md.
# Requires: pandoc, Google Chrome (headless) and network access for the Mermaid renderer.
set -euo pipefail
cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
pandoc report.md -s --css report.css --embed-resources --include-in-header mermaid-head.html \
  --metadata pagetitle="Agents as internal services, technical report" -o report.html
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=10000 \
  --run-all-compositor-stages-before-draw --print-to-pdf="$PWD/report.pdf" "file://$PWD/report.html"
rm -f report.html
echo "wrote $PWD/report.pdf"
