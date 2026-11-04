// Cloudflare Pages Function: the laptop Reel editor talks to the Hub calendar (2026-11-04).
//
// Route: /api/track/reels?key=<REELS_KEY>   (under /api/track so it bypasses Cloudflare Access: the laptop can't log in)
// The key is env.REELS_KEY, a Pages secret; the laptop keeps its copy in reels\.hubkey (git-ignored, the repo is public).
//
// GET  -> { ok, reels:[{title, date, offer, recorded, stage}], captions:{video|scale|attract:{instagram,facebook,tiktok,youtube}} }
//         Calendar Reels not yet published, dated from 21 days ago to 14 days ahead.
// POST { title, stage }  stage = "edited" | "scheduled" | "posted" | ""   ("" clears it)
//
// Stages live in their own KV key "reelstatus" ({ "<title lower>": {stage, at} }), NOT in the Hub record, so the
// laptop never bumps the record's rev (that would pop "changed on another device" on Olly's phone). The Hub reads the
// map through /api/reelstatus and shows it on the calendar. Captions come from "reelcaptions", which the Hub mirrors
// from its built-in Perfect Reel caption templates (VIDEO TITLE GOES HERE = the hook).

function json(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
async function getJSON(env, key, fallback) {
  try { const raw = await env.HUB_KV.get(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
}
function iso(d) { return d.toISOString().slice(0, 10); }
export function reelKey(title) { return String(title || "").trim().toLowerCase().replace(/\s+/g, " "); }

function authed(request, env) {
  const key = new URL(request.url).searchParams.get("key") || "";
  return !!env.REELS_KEY && key === env.REELS_KEY;
}

export async function onRequestGet({ request, env }) {
  if (!authed(request, env)) return json({ ok: false }, 401);
  const rec = await getJSON(env, "record", {});
  const status = await getJSON(env, "reelstatus", {});
  const captions = await getJSON(env, "reelcaptions", null);
  const now = Date.now(), from = iso(new Date(now - 21 * 864e5)), to = iso(new Date(now + 14 * 864e5));
  const ideas = (rec.state && rec.state.content && rec.state.content.ideas) || [];
  const reels = ideas
    .filter(i => i && i.title && i.date && !i.posted && !i.skipped && i.date >= from && i.date <= to)
    .map(i => ({ title: i.title, date: i.date, offer: i.offer || "video", recorded: !!i.recorded, stage: (status[reelKey(i.title)] || {}).stage || "" }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  // per-day Reel numbers Olly sets in the day panel (unset = 4); the laptop tops up days below their number
  const targets = (rec.state && rec.state.reelDayTarget) || {};
  return json({ ok: true, reels, captions, targets, defaultTarget: 4 });
}

export async function onRequestPost({ request, env }) {
  if (!authed(request, env)) return json({ ok: false }, 401);
  let b = {};
  try { b = await request.json(); } catch (e) { b = {}; }
  const k = reelKey(b.title);
  const stage = ["edited", "scheduled", "posted", ""].includes(b.stage) ? b.stage : null;
  if (!k || stage === null) return json({ ok: false, error: "title and stage needed" }, 400);
  const status = await getJSON(env, "reelstatus", {});
  if (stage) status[k] = { stage, at: new Date().toISOString() }; else delete status[k];
  await env.HUB_KV.put("reelstatus", JSON.stringify(status));
  return json({ ok: true });
}
