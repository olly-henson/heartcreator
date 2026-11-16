// Cloudflare Pages Function — page-view counter for the public funnel pages.
//
// Route: /api/track   (POST, body = "<page>" or "<page>|<source>|<medium>|<content>",
//        sent with navigator.sendBeacon from the opt-in and application pages)
// Binding: env.HUB_KV — keys "pv:<page>:<YYYY-MM-DD>" holding a count, plus
//          (2026-10-25) "ps:<page>:<YYYY-MM>:<source>|<medium>|<content>"
//          counting where each visit came from (UTMs, else the referring site).
//
// Auth: this ONE path is exempt from Cloudflare Access (an Access
// application for hub.ollyhenson.com/api/track with a Bypass policy), so
// anonymous visitors can reach it. It only ever adds 1 to a known page's
// counter: no reads, nothing returned. The counts are read back through
// /api/pageviews, which stays behind Access.
//
// GHL has no API for its own funnel stats (2026-10-24), hence this.

import { isOwner } from "../../lib/owner.js";

const PAGES = { optin: true, apply: true, scale: true, feeling: true, feelingb: true, attract: true };   // attract = training v2 opt-in at /attract (2026-11-03)   // feelingb = The Feeling Finder A/B variant B (phone image), 2026-10-28   // scale = The Love Scale (2026-10-26), feeling = The Feeling Finder (2026-10-28)
const BOT_RE = /bot|crawl|spider|preview|facebookexternalhit|headless/i;

// Keep source labels short and safe for a KV key.
function clean(v) {
  return String(v || "").toLowerCase().replace(/[^a-z0-9_.\-() ]/g, "").trim().slice(0, 40);
}

function done() {
  return new Response(null, {
    status: 204,
    headers: { "access-control-allow-origin": "*", "cache-control": "no-store" },
  });
}

export async function onRequestPost({ request, env }) {
  const parts = (await request.text()).slice(0, 300).split("|");
  const page = parts[0].trim().toLowerCase();
  if (!PAGES[page] || BOT_RE.test(request.headers.get("user-agent") || "")) return done();
  // Olly testing his own links (2026-11-10): his addresses come from opening the Hub (lib/owner.js)
  if (await isOwner(env, request)) return done();
  // Day in South Africa time (Olly's time zone), so months line up with his.
  const day = new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 10);
  // ONE key per page per day (2026-11-15, KV write limit: was up to 3 writes per visit, now 1):
  // "pvx:<page>:<YYYY-MM-DD>" = JSON { n: visits, s: { "<source>|<medium>|<content>": visits } }, metadata { n }.
  // The old pv:/ps:/psd: keys are no longer written; /api/pageviews still reads them for the days before.
  const key = "pvx:" + page + ":" + day;
  let rec = null;
  try { rec = JSON.parse((await env.HUB_KV.get(key)) || "null"); } catch { rec = null; }
  if (!rec || typeof rec !== "object") rec = { n: 0, s: {} };
  rec.n = (Number(rec.n) || 0) + 1;
  rec.s = rec.s && typeof rec.s === "object" ? rec.s : {};
  // Where the visit came from (pages updated 2026-10-25 send this; older copies send just the page name and only count as a view).
  if (parts.length > 1) {
    const src = (clean(parts[1]) || "(direct)") + "|" + clean(parts[2]) + "|" + clean(parts[3]);
    if (rec.s[src] || Object.keys(rec.s).length < 200) rec.s[src] = (rec.s[src] || 0) + 1;
    else rec.s["(other)||"] = (rec.s["(other)||"] || 0) + 1;
  }
  await env.HUB_KV.put(key, JSON.stringify(rec), { metadata: { n: rec.n } });
  return done();
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST",
      "access-control-allow-headers": "content-type",
    },
  });
}
