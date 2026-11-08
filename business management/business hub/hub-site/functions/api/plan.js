// Cloudflare Pages Function — saved edits for an applicant's Plan of action (Olly, 2026-11-08).
//
// Route: /api/plan?id=<GHL contact id>   GET = { ok, plan } | PUT body = { field: "text", ... }
// Binding: env.HUB_KV, key "plan:<contactId>". Holds the applicant's words, so it stays behind
// Cloudflare Access like the rest of the zone. Never written to the repo (it's public).

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
function idOf(request) {
  const id = new URL(request.url).searchParams.get("id") || "";
  return /^[A-Za-z0-9_-]{5,64}$/.test(id) ? id : "";
}

export async function onRequestGet({ request, env }) {
  const id = idOf(request);
  if (!id) return json({ ok: false, error: "Missing contact id." }, 400);
  const raw = await env.HUB_KV.get("plan:" + id);
  let plan = null;
  try { plan = raw ? JSON.parse(raw) : null; } catch { plan = null; }
  return json({ ok: true, plan });
}

export async function onRequestPut({ request, env }) {
  const id = idOf(request);
  if (!id) return json({ ok: false, error: "Missing contact id." }, 400);
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "Bad JSON." }, 400); }
  const clean = {};
  Object.keys(body || {}).slice(0, 40).forEach(function (k) {
    if (/^[a-z0-9]{1,20}$/i.test(k) && typeof body[k] === "string") clean[k] = body[k].slice(0, 2000);
  });
  let old = null;
  try { old = JSON.parse((await env.HUB_KV.get("plan:" + id)) || "null"); } catch { old = null; }
  if (old && old._code) clean._code = old._code; // keep their link working after an edit
  clean._savedAt = new Date().toISOString();
  await env.HUB_KV.put("plan:" + id, JSON.stringify(clean));
  return json({ ok: true, savedAt: clean._savedAt });
}

// POST /api/plan?id=<contactId>  -> { ok, code }: the applicant's private link code (made once, then reused).
// ?sent=1 also records the sent date, so the Sales card shows "Plan sent".
export async function onRequestPost({ request, env }) {
  const id = idOf(request);
  if (!id) return json({ ok: false, error: "Missing contact id." }, 400);
  let plan = null;
  try { plan = JSON.parse((await env.HUB_KV.get("plan:" + id)) || "null"); } catch { plan = null; }
  if (!plan) return json({ ok: false, error: "Save the plan first." }, 400);
  let code = plan._code;
  if (!code) {
    const abc = "abcdefghijkmnpqrstuvwxyz23456789", bytes = crypto.getRandomValues(new Uint8Array(10));
    code = Array.from(bytes, function (b) { return abc[b % abc.length]; }).join("");
    plan._code = code;
    await env.HUB_KV.put("share:" + code, id);
    await env.HUB_KV.put("plan:" + id, JSON.stringify(plan));
  }
  // Making the link is NOT sending it (Olly, 2026-11-08: he made an applicant's link just to look at it).
  // "sent" is only set by ?sent=1, which the page calls when he taps WhatsApp or Copy link.
  const key = "planview:" + id, cur = await env.HUB_KV.getWithMetadata(key);
  const m = Object.assign({ opens: 0, first: null, last: null, pdf: 0 }, cur.metadata || {});
  m.code = code;
  if (new URL(request.url).searchParams.get("sent") === "1") m.sent = m.sent || new Date().toISOString();
  await env.HUB_KV.put(key, "x", { metadata: m });
  return json({ ok: true, code, sent: m.sent || null });
}
