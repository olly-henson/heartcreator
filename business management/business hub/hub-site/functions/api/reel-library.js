// Cloudflare Pages Function: published Reels for the Sales card "Helpful Reel" follow-up (Olly, 2026-11-24).
//
// Route: GET /api/reel-library   (behind Cloudflare Access like the rest of the Hub; ?fresh=1 skips the cache)
//        -> { ok, at, reels: [{ hook, url, date, score }] }   best first
// Secret: env.GHL_EMAIL_TOKEN (the GHL Private Integration key = marketing\.env GHL_PIT_TOKEN, which can read the
//         Social Planner). Never in a file: the repo is public.
// Source: POST /social-media-posting/<loc>/posts/list (published, last 120 days). One Reel goes to Instagram, Facebook,
//         TikTok and YouTube as separate posts: grouped back into one by the video file (same as tools/top-reels.mjs).
//         Hook = first caption line that isn't the standard "💜 Attract…" Instagram opener. Link = Instagram first.
// Cache: KV "reellibrary" for 6 hours.

const API = "https://services.leadconnectorhq.com";
const LOCATION_ID = "LRqVZmxns8f3xcJLHzBK";
const CACHE_KEY = "reellibrary";
const CACHE_MS = 6 * 3600 * 1000;

function json(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

async function pull(env) {
  const to = new Date(), from = new Date(Date.now() - 120 * 864e5), posts = [];
  for (let skip = 0; skip < 3000; skip += 50) {
    const r = await fetch(`${API}/social-media-posting/${LOCATION_ID}/posts/list`, {
      method: "POST",
      headers: { Authorization: "Bearer " + env.GHL_EMAIL_TOKEN, Version: "2021-07-28", "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ type: "published", skip: String(skip), limit: "50", fromDate: from.toISOString(), toDate: to.toISOString(), includeUsers: "false" }),
    });
    if (!r.ok) throw new Error("GHL " + r.status + ": " + (await r.text()).slice(0, 200));
    const page = ((await r.json()).results || {}).posts || [];
    posts.push(...page);
    if (page.length < 50) break;
  }
  const firstLine = (t) => String(t || "").split(/\r?\n/).map((s) => s.trim()).find(Boolean) || "";
  const by = {};
  for (const p of posts) {
    if (p.deleted) continue;
    const k = (p.media && p.media[0] && p.media[0].url) || p.parentPostId || p._id;
    const g = by[k] || (by[k] = { date: p.publishedAt || p.displayDate, hook: "", links: {}, score: 0 });
    const i = p.insights || {};
    g.score += (+i.like || 0) + 3 * (+i.comment || 0) + 3 * (+i.share || 0);
    if (p.previewLink) g.links[p.platform] = p.previewLink;
    const first = firstLine(p.summary);
    if (first && !first.startsWith("💜") && !g.hook) g.hook = first;
  }
  return Object.values(by)
    .map((g) => ({ hook: g.hook, url: g.links.instagram || g.links.facebook || g.links.tiktok || g.links.youtube || "", date: String(g.date || "").slice(0, 10), score: g.score }))
    .filter((r) => r.hook && r.url)
    .sort((a, b) => b.score - a.score);
}

export async function onRequestGet({ request, env }) {
  const fresh = new URL(request.url).searchParams.has("fresh");
  if (!fresh) {
    try {
      const c = JSON.parse((await env.HUB_KV.get(CACHE_KEY)) || "null");
      if (c && Date.now() - c.at < CACHE_MS) return json(c);
    } catch (e) {}
  }
  try {
    const out = { ok: true, at: Date.now(), reels: await pull(env) };
    await env.HUB_KV.put(CACHE_KEY, JSON.stringify(out));
    return json(out);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 502);
  }
}
