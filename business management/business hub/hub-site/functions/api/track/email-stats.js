// Cloudflare Pages Function: live daily-email open rates for the content generator's subject lines (2026-11-10).
//
// Route: /api/track/email-stats   (GET; under /api/track so it bypasses Cloudflare Access: the generator is a
//        claude.ai artifact and can't log in). Returns subjects + rates only: no names, no emails, no list sizes
//        beyond the delivered count.
// Secret: env.GHL_EMAIL_TOKEN, a Pages secret = the GHL Private Integration key with the read-only email scopes
//         (same key as heartattractor\marketing\.env GHL_PIT_TOKEN). Never in a file: the repo is public.
// Source: GET /emails/schedule?showStats=true (delivered / opened / clicked per campaign). The per-campaign
//         /stats endpoints are 401 for private keys.
// Rules (Olly, 2026-11-10): daily emails only (campaign name contains "daily"), last 30 days, 50+ delivered
//         each so tiny early sends don't skew it. If fewer than 6 qualify, widen to 90 days / 20+ delivered.
// Cache: KV "emailstats" for 1 hour.

const API = "https://services.leadconnectorhq.com";
const LOCATION_ID = "LRqVZmxns8f3xcJLHzBK";
const CACHE_KEY = "emailstats";
const CACHE_MS = 3600 * 1000;
const CORS = { "access-control-allow-origin": "*", "cache-control": "no-store" };

function json(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: { "content-type": "application/json; charset=utf-8", ...CORS } });
}

async function pullAll(env) {
  const all = [];
  for (let off = 0; off < 2000; off += 100) {
    const res = await fetch(`${API}/emails/schedule?locationId=${LOCATION_ID}&limit=100&offset=${off}&showStats=true`, {
      headers: { Authorization: "Bearer " + env.GHL_EMAIL_TOKEN, Version: "2021-07-28", Accept: "application/json" },
    });
    if (!res.ok) throw new Error("GHL " + res.status + ": " + (await res.text()).slice(0, 200));
    const s = (await res.json()).schedules || [];
    all.push(...s);
    if (s.length < 100) break;
  }
  return all;
}

function pick(all, days, minDelivered) {
  const since = Date.now() - days * 86400000;
  return all
    .filter(s => s.emailStatus === "complete" && /daily/i.test(s.name || "") && (s.nextProcessingOn || 0) >= since && (s.delivered || 0) >= minDelivered)
    .map(s => ({
      subject: String(s.subject || "").trim(),
      date: new Date(s.nextProcessingOn).toISOString().slice(0, 10),
      delivered: s.delivered,
      openRate: Math.round((100 * (s.opened || 0)) / s.delivered),
      clickRate: Math.round((1000 * (s.clicked || 0)) / s.delivered) / 10,
    }))
    .sort((a, b) => b.openRate - a.openRate);
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
    const all = await pullAll(env);
    let emails = pick(all, 30, 50), window = "last 30 days, 50+ delivered each";
    if (emails.length < 6) { emails = pick(all, 90, 20); window = "last 90 days, 20+ delivered each"; }
    const out = { ok: true, at: Date.now(), window, emails };
    await env.HUB_KV.put(CACHE_KEY, JSON.stringify(out));
    return json(out);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 502);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { ...CORS, "access-control-allow-methods": "GET" } });
}
