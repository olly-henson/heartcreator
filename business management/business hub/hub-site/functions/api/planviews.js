// Cloudflare Pages Function — who has opened their Plan of action link (Olly, 2026-11-08).
// Route: /api/planviews (GET, behind Cloudflare Access). One KV list call over "planview:" keys,
// whose metadata holds { sent, opens, first, last, pdf, code }. Returns { ok, views: { contactId: metadata } }.

export async function onRequestGet({ env }) {
  const views = {};
  let cursor;
  for (let i = 0; i < 20; i++) {
    const page = await env.HUB_KV.list({ prefix: "planview:", cursor });
    page.keys.forEach(function (k) { views[k.name.slice(9)] = k.metadata || {}; });
    if (page.list_complete) break;
    cursor = page.cursor;
  }
  return new Response(JSON.stringify({ ok: true, views }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
