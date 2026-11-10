// Cloudflare Pages Function — read back the funnel page-view counts.
//
// Route: /api/pageviews   (GET, from the Hub's "Pull from GHL" button)
// Binding: env.HUB_KV — sums the "pv:<page>:<YYYY-MM-DD>" keys written by
//          /api/track into { "YYYY-MM": { optin: n, apply: n } }, and the
//          "ps:<page>:<YYYY-MM>:<source>|<medium>|<content>" keys into
//          sources = { "YYYY-MM": { optin: { "<source>|<medium>|<content>": n } } }.
//
// Auth: behind Cloudflare Access like the rest of the zone (only /api/track
// is exempt).

async function sumPrefix(env, prefix, add) {
  let cursor;
  do {
    const list = await env.HUB_KV.list({ prefix, cursor });
    const vals = await Promise.all(list.keys.map(function (k) { return env.HUB_KV.get(k.name); }));
    list.keys.forEach(function (k, i) { add(k.name, Number(vals[i]) || 0); });
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);
}

// The Feeling Finder A/B variant B beacons as "feelingb" (2026-10-28); the Hub only reads "feeling", so it was
// dividing BOTH variants' sign-ups by variant A's visits (showed ~72% opt-in, real ~40%). Fold B into "feeling" (2026-11-10).
function pageKey(p) { return p === "feelingb" ? "feeling" : p; }

export async function onRequestGet({ env }) {
  const sources = {};
  await sumPrefix(env, "ps:", function (name, n) {
    const i = name.indexOf(":", 3), j = name.indexOf(":", i + 1);   // ps:page:YYYY-MM:src
    const page = pageKey(name.slice(3, i)), ym = name.slice(i + 1, j), src = name.slice(j + 1);
    sources[ym] = sources[ym] || {};
    sources[ym][page] = sources[ym][page] || {};
    sources[ym][page][src] = (sources[ym][page][src] || 0) + n;
  });
  // per-day views and sources (2026-10-27) for the Overview's Week view
  const days = {}, daySources = {};
  await sumPrefix(env, "psd:", function (name, n) {
    const i = name.indexOf(":", 4), j = name.indexOf(":", i + 1);   // psd:page:YYYY-MM-DD:src
    const page = pageKey(name.slice(4, i)), d = name.slice(i + 1, j), src = name.slice(j + 1);
    daySources[d] = daySources[d] || {};
    daySources[d][page] = daySources[d][page] || {};
    daySources[d][page][src] = (daySources[d][page][src] || 0) + n;
  });
  const months = {};
  let cursor;
  do {
    const list = await env.HUB_KV.list({ prefix: "pv:", cursor });
    const vals = await Promise.all(list.keys.map(function (k) { return env.HUB_KV.get(k.name); }));
    list.keys.forEach(function (k, i) {
      const parts = k.name.split(":");   // pv, page, YYYY-MM-DD
      const ym = parts[2].slice(0, 7);
      months[ym] = months[ym] || {};
      const pg = pageKey(parts[1]);
      months[ym][pg] = (months[ym][pg] || 0) + (Number(vals[i]) || 0);
      days[parts[2]] = days[parts[2]] || {};
      days[parts[2]][pg] = (days[parts[2]][pg] || 0) + (Number(vals[i]) || 0);
    });
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);
  return new Response(JSON.stringify({ ok: true, months, sources, days, daySources }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
