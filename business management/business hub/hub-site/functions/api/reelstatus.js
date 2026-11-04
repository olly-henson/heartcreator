// Cloudflare Pages Function (behind Cloudflare Access): the Hub's side of the laptop Reel pipeline (2026-11-04).
//
// GET  /api/reelstatus  -> { ok, status: { "<title lower>": {stage, at} } }   stages the laptop set (edited / scheduled / posted)
// POST /api/reelstatus  { captions: {video|scale|attract: {instagram,facebook,tiktok,youtube}} }
//      The Hub mirrors its built-in Reel caption templates here so the laptop (via /api/track/reels) can fill them.
// See functions/api/track/reels.js for the laptop's keyed side.

function json(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

export async function onRequestGet({ env }) {
  let status = {};
  try { status = JSON.parse((await env.HUB_KV.get("reelstatus")) || "{}"); } catch (e) { status = {}; }
  return json({ ok: true, status });
}

export async function onRequestPost({ request, env }) {
  let b = {};
  try { b = await request.json(); } catch (e) { b = {}; }
  // { clear: "<title>" }: Olly moved a Reel back by hand in the day panel, so drop the laptop's stage for it (2026-11-04)
  if (typeof b.clear === "string") {
    let status = {};
    try { status = JSON.parse((await env.HUB_KV.get("reelstatus")) || "{}"); } catch (e) { status = {}; }
    delete status[b.clear.trim().toLowerCase().replace(/\s+/g, " ")];
    await env.HUB_KV.put("reelstatus", JSON.stringify(status));
    return json({ ok: true });
  }
  const c = b.captions;
  if (!c || typeof c !== "object" || !c.video) return json({ ok: false, error: "captions needed" }, 400);
  await env.HUB_KV.put("reelcaptions", JSON.stringify(c));
  return json({ ok: true });
}
