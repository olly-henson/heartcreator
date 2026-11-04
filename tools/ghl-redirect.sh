#!/usr/bin/env bash
# Create a GHL URL redirect on ollyhenson.com, then test it.
# Usage: bash tools/ghl-redirect.sh /short-path "https://full/target?utm..."
# Needs GHL_PIT_TOKEN + GHL_LOCATION_ID in marketing/.env (scopes funnels/redirect.readonly + .write, added 2026-11-03).
# Skips a path that already redirects. Olly asked for this so he never makes redirects by hand.
set -e
cd "$(dirname "$0")/../marketing"; set -a; . ./.env; set +a
P="$1"; T="$2"
code=$(curl -s -o /dev/null -w '%{http_code}' --max-redirs 0 "https://ollyhenson.com$P")
if [ "$code" = "301" ] || [ "$code" = "302" ]; then echo "$P already exists ($code)"; exit 0; fi
curl -s -X POST -H "Authorization: Bearer $GHL_PIT_TOKEN" -H "Version: 2021-07-28" -H "Content-Type: application/json" \
  -d "{\"locationId\":\"$GHL_LOCATION_ID\",\"domain\":\"ollyhenson.com\",\"path\":\"$P\",\"target\":\"$T\",\"action\":\"url\"}" \
  https://services.leadconnectorhq.com/funnels/lookup/redirect > /dev/null
echo "$P -> $(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' --max-redirs 0 "https://ollyhenson.com$P")"
