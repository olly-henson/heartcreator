// Cloudflare Pages Function — the applicant-facing Plan of action link (Olly, 2026-11-08).
//
// PUBLIC (Cloudflare Access app "hub.ollyhenson.com/p" with a Bypass / Everyone policy):
//   GET  /p/<code>         -> the plan page (public/plan-view.html), read-only, with Download PDF
//   GET  /p/<code>/data    -> the plan's words as JSON (only the plan fields, nothing else from GHL)
//   POST /p/<code>/seen    -> body "open" | "pdf". Sent by the page's own script, so WhatsApp/iMessage
//                             link previews (which don't run scripts) never count as an open.
// KV: share:<code> = contactId · plan:<contactId> = the saved plan · planview:<contactId> = "" with
//     metadata { sent, opens, first, last, pdf } (read in one list call by /api/planviews).
// The code is 10 random characters, so a link can't be guessed. Nothing here is in the repo.

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
}
async function contactFor(env, code) {
  if (!/^[a-z0-9]{10}$/.test(code || "")) return "";
  return (await env.HUB_KV.get("share:" + code)) || "";
}

export async function onRequest({ request, env, params }) {
  const parts = [].concat(params.path || []);
  const code = parts[0] || "", action = parts[1] || "";
  const id = await contactFor(env, code);

  if (!action && request.method === "GET") {
    if (!id) return new Response("This link isn't valid any more. Please ask Olly for a new one.", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
    const page = await env.ASSETS.fetch(new URL("/plan-view.html", request.url));
    return new Response(page.body, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
  }

  // the support page's screenshots (2026-11-09): served from public/plan-img/ through the link, so they need no login
  if (action === "img" && request.method === "GET") {
    const f = parts[2] || "";
    if (!id || !/^[a-z0-9-]+\.jpg$/.test(f)) return new Response("", { status: 404 });
    const r = await env.ASSETS.fetch(new URL("/plan-img/" + f, request.url));
    return new Response(r.body, { status: r.status, headers: { "content-type": "image/jpeg", "cache-control": "private, max-age=86400" } });
  }

  if (action === "data" && request.method === "GET") {
    if (!id) return json({ ok: false }, 404);
    let plan = null;
    try { plan = JSON.parse((await env.HUB_KV.get("plan:" + id)) || "null"); } catch { plan = null; }
    if (!plan) return json({ ok: false }, 404);
    const out = {};
    Object.keys(plan).forEach(function (k) { if (k.charAt(0) !== "_") out[k] = plan[k]; });
    return json({ ok: true, plan: out });
  }

  if (action === "seen" && request.method === "POST") {
    if (!id) return json({ ok: false }, 404);
    // Olly's own opens never count (2026-11-08): only he can log in to the Hub, so a Cloudflare Access
    // login cookie on this request means it's him (the cookie is set for the whole hub.ollyhenson.com site).
    if (/(?:^|;\s*)CF_Authorization=/.test(request.headers.get("cookie") || "")) return json({ ok: true, owner: true });
    const what = (await request.text()).trim();
    if (what !== "open" && what !== "pdf") return json({ ok: false }, 400);
    const key = "planview:" + id;
    const cur = await env.HUB_KV.getWithMetadata(key);
    const m = Object.assign({ sent: null, opens: 0, first: null, last: null, pdf: 0 }, cur.metadata || {});
    const now = new Date().toISOString();
    if (what === "open") { m.opens = (m.opens || 0) + 1; m.first = m.first || now; m.last = now; }
    else { m.pdf = (m.pdf || 0) + 1; }
    await env.HUB_KV.put(key, "", { metadata: m });
    return json({ ok: true });
  }

  return json({ ok: false }, 405);
}
