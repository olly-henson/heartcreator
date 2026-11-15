// Short edge cache for the Hub's read-only stats endpoints (2026-11-15, KV free-plan budget).
// The Workers free plan allows 1,000 KV list operations a day. /api/pageviews, /api/planviews, /api/vslviews and
// /api/guideviews each list a whole prefix, and the Hub called them on every open, tab tap and app resume, so a busy
// day neared the cap. This keeps each answer in Cloudflare's own cache (free, no KV operations) for `secs` seconds.
// The Hub's Refresh buttons add ?fresh=1 to skip the cache. Per-applicant ?id= calls are never cached.

export async function cached(request, secs, build) {
  const url = new URL(request.url);
  const fresh = url.searchParams.get("fresh") === "1";
  url.searchParams.delete("fresh");
  url.searchParams.delete("_");
  const key = new Request(url.toString(), { method: "GET" });
  let cache = null;
  try { cache = caches.default; } catch (e) { cache = null; }
  if (cache && !fresh) {
    try { const hit = await cache.match(key); if (hit) return hit; } catch (e) {}
  }
  const res = await build();
  if (cache && res.status === 200) {
    const body = await res.text();
    const out = new Response(body, { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
    const store = new Response(body, { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "max-age=" + secs } });
    try { await cache.put(key, store); } catch (e) {}
    return out;
  }
  return res;
}
