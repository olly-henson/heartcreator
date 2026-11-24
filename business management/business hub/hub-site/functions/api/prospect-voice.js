// Cloudflare Pages Function (behind Cloudflare Access): the Hub saves an ANONYMOUS summary of Olly's top-ranked prospects
// (Olly, 2026-11-24: "make Reels specifically for these people"). POST { voice } -> KV "prospectvoice".
// The content generator reads it through /api/track/prospect-voice (public, aggregates + short anonymous phrases only:
// never names, contact details, places or job titles). Built in the browser by lmVoiceBuild() in index.html.
export async function onRequestPost({ request, env }) {
  let b = {};
  try { b = await request.json(); } catch (e) { b = {}; }
  const v = b && b.voice;
  if (!v || typeof v !== "object" || !v.n) return new Response(JSON.stringify({ ok: false, error: "voice needed" }), { status: 400, headers: { "content-type": "application/json" } });
  v.at = Date.now();
  await env.HUB_KV.put("prospectvoice", JSON.stringify(v));
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
