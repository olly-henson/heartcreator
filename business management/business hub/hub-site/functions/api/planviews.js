// Cloudflare Pages Function — who has opened their Plan of action link (Olly, 2026-11-08).
// Route: /api/planviews (GET, behind Cloudflare Access). One KV list call over "planview:" keys,
// whose metadata holds { sent, opens, first, last, pdf, code }. Returns { ok, views: { contactId: metadata } }.

export async function onRequestGet({ env, request }) {
  const one = new URL(request.url).searchParams.get("id");
  if (one) { // reading heat map for one applicant (2026-11-10)
    let t = {}; try { t = JSON.parse((await env.HUB_KV.get("plantime:" + one)) || "{}") || {}; } catch { t = {}; }
    return new Response(JSON.stringify({ ok: true, secs: t.secs || [], far: t.far || 0, n: t.n || 0 }), {
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
  }
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
