// Cloudflare Pages Function — who has watched their sales video (VSL) and how (Olly, 2026-11-10).
// Route: /api/vslviews (GET, behind Cloudflare Access).
//   GET            -> { ok, views: { contactId: { opens, first, last, pct, far, done, join, joinAt, dev } } }  (one KV list call)
//   GET ?id=<cid>  -> { ok, meta, bins:[100], visits, joins }  (the watch map for one applicant)
// Written by POST /p/<code>/vseen (functions/p/[[path]].js).

function json(body) {
  return new Response(JSON.stringify(body), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

export async function onRequestGet({ env, request }) {
  const id = new URL(request.url).searchParams.get("id");
  if (id) {
    const cur = await env.HUB_KV.getWithMetadata("vslview:" + id);
    let v = {}; try { v = JSON.parse(cur.value || "{}") || {}; } catch { v = {}; }
    return json({ ok: true, meta: cur.metadata || null, bins: v.bins || [], visits: v.visits || [], joins: v.joins || [] });
  }
  const views = {};
  let cursor;
  for (let i = 0; i < 20; i++) {
    const page = await env.HUB_KV.list({ prefix: "vslview:", cursor });
    page.keys.forEach(function (k) { views[k.name.slice(8)] = k.metadata || {}; });
    if (page.list_complete) break;
    cursor = page.cursor;
  }
  return json({ ok: true, views });
}
