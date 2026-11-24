// Public (under /api/track so the content generator artifact can read it): the anonymous top-prospect summary the Hub
// saved (see functions/api/prospect-voice.js). Aggregates and short anonymous phrases only.
const CORS = { "access-control-allow-origin": "*", "cache-control": "no-store", "content-type": "application/json; charset=utf-8" };
export async function onRequestGet({ env }) {
  let v = null;
  try { v = JSON.parse((await env.HUB_KV.get("prospectvoice")) || "null"); } catch (e) { v = null; }
  return new Response(JSON.stringify(v ? { ok: true, voice: v } : { ok: false, error: "not saved yet: open the Hub's Sales tab" }), { headers: CORS });
}
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { ...CORS, "access-control-allow-methods": "GET" } });
}
