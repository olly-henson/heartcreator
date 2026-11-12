#!/usr/bin/env bash
# Check and deploy the Business Hub in one go: syntax-check index.html, then wrangler deploy.
# Usage: bash deploy-hub.sh
set -e
HUB="/c/Users/Olly/AI OS/heartattractor/business management/business hub/hub-site"
# 2026-11-12: a script crashed mid-write, left index.html EMPTY, and jscheck passed it (0 scripts) so a blank Hub went live.
# Never deploy a page that's suspiciously small. Restore from the last good deploy URL (curl it) if this fires.
for f in index.html plan.html; do
  n=$(wc -c < "$HUB/public/$f"); if [ "$n" -lt 50000 ]; then echo "STOP: $f is only $n bytes. Not deploying."; exit 1; fi
done
node "$(dirname "$0")/jscheck.js" "$HUB/public/index.html"
# the generated plan pages too (a broken plan.html went live on 2026-11-08 because only index.html was checked)
node "$(dirname "$0")/jscheck.js" "$HUB/public/plan.html"
node "$(dirname "$0")/jscheck.js" "$HUB/public/plan-view.html"
cd "$HUB"
# npx can fail with EBUSY when its cache is locked (2026-11-10): fall back to any cached wrangler copy
W=$(ls /c/Users/Olly/AppData/Local/npm-cache/_npx/*/node_modules/wrangler/bin/wrangler.js 2>/dev/null | tail -1)
if [ -n "$W" ]; then node "$W" pages deploy public --project-name hub-ollyhenson --branch main --commit-dirty=true 2>&1 | tail -1
else npx wrangler pages deploy public --project-name hub-ollyhenson --branch main --commit-dirty=true 2>&1 | tail -1; fi
