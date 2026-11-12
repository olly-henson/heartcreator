// Cloudflare Pages Function — the step-by-step guide follow-up (Olly, 2026-11-12). Behind Cloudflare Access.
//   GET  /api/guideviews            -> { ok, views: { contactId: metadata } }  (one KV list over "guideview:")
//   GET  /api/guideviews?id=<id>    -> { ok, secs:[seconds per page], far, n }  (reading heat map for one person)
//   POST /api/guideviews?id=<id>    -> { ok, code }: their private link code (reuses the plan's code if they have one).
//        &sent=1 also records the sent date (called when Olly taps WhatsApp / Email / Copy link on the card).
// Metadata = { code, sent, opens, first, last, far, pages, read, pdf, dev }. The applicant-facing side is functions/p/[[path]].js.

function json(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function idOf(request) {
  const id = new URL(request.url).searchParams.get("id") || "";
  return /^[A-Za-z0-9_-]{5,64}$/.test(id) ? id : "";
}

export async function onRequestGet({ env, request }) {
  const one = idOf(request);
  if (one) {
    let v = {}; try { v = JSON.parse((await env.HUB_KV.get("guideview:" + one)) || "{}") || {}; } catch { v = {}; }
    return json({ ok: true, secs: v.secs || [], n: (v.secs || []).length });
  }
  const views = {};
  let cursor;
  for (let i = 0; i < 20; i++) {
    const page = await env.HUB_KV.list({ prefix: "guideview:", cursor });
    page.keys.forEach(function (k) { views[k.name.slice(10)] = k.metadata || {}; });
    if (page.list_complete) break;
    cursor = page.cursor;
  }
  return json({ ok: true, views });
}

export async function onRequestPost({ env, request }) {
  const id = idOf(request);
  if (!id) return json({ ok: false, error: "Missing contact id." }, 400);
  const key = "guideview:" + id, cur = await env.HUB_KV.getWithMetadata(key);
  const m = Object.assign({ opens: 0, first: null, last: null, far: 0, pages: 0, read: 0, pdf: 0 }, cur.metadata || {});
  if (!m.code) {
    let plan = null;
    try { plan = JSON.parse((await env.HUB_KV.get("plan:" + id)) || "null"); } catch { plan = null; }
    let code = plan && plan._code;
    if (!code) {
      const abc = "abcdefghijkmnpqrstuvwxyz23456789", bytes = crypto.getRandomValues(new Uint8Array(10));
      code = Array.from(bytes, function (b) { return abc[b % abc.length]; }).join("");
      await env.HUB_KV.put("share:" + code, id);
    }
    m.code = code;
  }
  if (new URL(request.url).searchParams.get("sent") === "1") m.sent = m.sent || new Date().toISOString();
  await env.HUB_KV.put(key, cur.value || "{}", { metadata: m });
  return json({ ok: true, code: m.code, sent: m.sent || null });
}
