#!/usr/bin/env bash
# Check and deploy the Business Hub in one go: syntax-check index.html, then wrangler deploy.
# Usage: bash deploy-hub.sh
set -e
HUB="/c/Users/Olly/AI OS/heartattractor/business management/business hub/hub-site"
node "$(dirname "$0")/jscheck.js" "$HUB/public/index.html"
cd "$HUB"
npx wrangler pages deploy public --project-name hub-ollyhenson --commit-dirty=true 2>&1 | tail -1
