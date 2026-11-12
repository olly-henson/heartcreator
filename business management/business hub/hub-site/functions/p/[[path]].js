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

import { pushAll } from "../../lib/webpush.js";
import { isOwner } from "../../lib/owner.js";
// Olly's own opens never count (2026-11-10): the Hub login cookie, OR his internet address (saved each time he opens
// the Hub, lib/owner.js), which also catches links he taps inside WhatsApp's own browser (no Hub cookie there).
async function ownerView(env, request) {
  return /(?:^|;\s*)CF_Authorization=/.test(request.headers.get("cookie") || "") || (await isOwner(env, request).catch(function () { return false; }));
}
function device(request) {
  const ua = request.headers.get("user-agent") || "";
  return /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Android/.test(ua) ? "Android" : /Macintosh/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "other";
}

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
  // Step-by-step guide PDF (Olly, 2026-11-12): one public link for every applicant, sent as a follow-up when they go quiet
  if (code === "guide" && !action && request.method === "GET") {
    const r = await env.ASSETS.fetch(new URL("/guide/step-by-step-guide.pdf", request.url));
    return new Response(r.body, { status: r.status, headers: { "content-type": "application/pdf", "content-disposition": 'inline; filename="Step-By-Step Guide - Olly Henson.pdf"', "cache-control": "public, max-age=600", "x-robots-tag": "noindex" } });
  }
  // the guide's page images (public, same for everyone): /p/guide/01.jpg ... 15.jpg
  if (code === "guide" && /^\d\d\.jpg$/.test(action) && request.method === "GET") {
    const r = await env.ASSETS.fetch(new URL("/guide/" + action, request.url));
    if (!/image/i.test(r.headers.get("content-type") || "")) return new Response("", { status: 404, headers: { "cache-control": "no-store" } });
    return new Response(r.body, { status: 200, headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=3600" } });
  }
  const id = await contactFor(env, code);

  // ---- Step-by-step guide, personal tracked link (2026-11-12) ------------------------------------
  //   GET  /p/<code>/guide  -> public/guide-view.html (the 15 pages stacked, Download PDF)
  //   POST /p/<code>/gseen  -> JSON { ev:"open"|"tick"|"pdf", secs:[seconds per page since last tick], far, n, dev }
  // KV guideview:<contactId>: value = { secs:[per page], visits:[{t,dev}] },
  //   metadata = { code, sent, opens, first, last, far, pages, read, pdf, dev } (read by /api/guideviews).
  if (action === "guide" && request.method === "GET") {
    if (!id) return new Response("This link isn't valid any more. Please ask Olly for a new one.", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
    const page = await env.ASSETS.fetch(new URL("/guide-view.html", request.url));
    return new Response(page.body, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
  }
  if (action === "gseen" && request.method === "POST") {
    if (!id) return json({ ok: false }, 404);
    if (await ownerView(env, request)) return json({ ok: true, owner: true });
    let b = {};
    try { b = JSON.parse((await request.text()).slice(0, 4000)); } catch { return json({ ok: false }, 400); }
    if (!/^(open|tick|pdf)$/.test(b.ev || "")) return json({ ok: false }, 400);
    const key = "guideview:" + id, cur = await env.HUB_KV.getWithMetadata(key);
    let v = {}; try { v = JSON.parse(cur.value || "{}") || {}; } catch { v = {}; }
    const m = Object.assign({ opens: 0, first: null, last: null, far: 0, pages: 0, read: 0, pdf: 0, dev: "" }, cur.metadata || {});
    const n = Math.max(1, Math.min(40, b.n | 0)), now = new Date().toISOString();
    v.secs = Array.isArray(v.secs) && v.secs.length === n ? v.secs : new Array(n).fill(0);
    v.visits = v.visits || [];
    (Array.isArray(b.secs) ? b.secs : []).slice(0, n).forEach(function (s, i) { v.secs[i] = Math.round((v.secs[i] + Math.max(0, Math.min(120, +s || 0))) * 10) / 10; });
    m.pages = n; m.far = Math.max(m.far || 0, Math.min(n, b.far | 0)); m.read = Math.round(v.secs.reduce(function (a, s) { return a + s; }, 0)); m.last = now;
    let note = null;
    if (b.ev === "open") {
      m.opens++; m.first = m.first || now; m.dev = device(request);
      v.visits.push({ t: now, dev: m.dev }); v.visits = v.visits.slice(-30);
      if (m.opens === 1) note = { title: "Guide opened", body: "Someone just opened their step-by-step guide. Tap to see who.", url: "/#looms", tag: "guide-" + id };
    }
    if (b.ev === "pdf") m.pdf = (m.pdf || 0) + 1;
    await env.HUB_KV.put(key, JSON.stringify(v), { metadata: m });
    if (note) { try { await pushAll(env, note); } catch (e) {} }
    return json({ ok: true });
  }

  // ---- Plan v4, image version (2026-11-12): a plan built per person as page images (stick-figure diagnosis + photo steps).
  //   KV planimgs:<contactId> = page count, planimg:<contactId>:NN = jpg. When it exists, /p/<code> shows the images instead.
  //   GET /p/<code>/pages -> { n }   GET /p/<code>/page/NN.jpg -> the page image
  if (action === "pages" && request.method === "GET") {
    if (!id) return json({ ok: false }, 404);
    return json({ ok: true, n: parseInt((await env.HUB_KV.get("planimgs:" + id)) || "0", 10) || 0 });
  }
  if (action === "page" && request.method === "GET") {
    const f = parts[2] || "";
    if (!id || !/^\d\d\.jpg$/.test(f)) return new Response("", { status: 404, headers: { "cache-control": "no-store" } });
    const buf = await env.HUB_KV.get("planimg:" + id + ":" + f.slice(0, 2), "arrayBuffer");
    if (!buf) return new Response("", { status: 404, headers: { "cache-control": "no-store" } });
    return new Response(buf, { status: 200, headers: { "content-type": "image/jpeg", "cache-control": "private, max-age=600", "x-robots-tag": "noindex" } });
  }

  if (!action && request.method === "GET") {
    if (!id) return new Response("This link isn't valid any more. Please ask Olly for a new one.", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
    const imgPlan = parseInt((await env.HUB_KV.get("planimgs:" + id)) || "0", 10) > 0;
    const page = await env.ASSETS.fetch(new URL(imgPlan ? "/plan-img-view.html" : "/plan-view.html", request.url));
    return new Response(page.body, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
  }

  // the support page's screenshots (2026-11-09): served from public/plan-img/ through the link, so they need no login
  if (action === "img" && request.method === "GET") {
    const f = parts[2] || "";
    if (!id || !/^[a-z0-9-]+\.jpg$/.test(f)) return new Response("", { status: 404 });
    const r = await env.ASSETS.fetch(new URL("/plan-img/" + f, request.url));
    return new Response(r.body, { status: r.status, headers: { "content-type": "image/jpeg", "cache-control": "private, max-age=600" } });
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
    if (await ownerView(env, request)) return json({ ok: true, owner: true });
    const what = (await request.text()).trim();
    if (what !== "open" && what !== "pdf") return json({ ok: false }, 400);
    const key = "planview:" + id;
    const cur = await env.HUB_KV.getWithMetadata(key);
    const m = Object.assign({ sent: null, opens: 0, first: null, last: null, pdf: 0 }, cur.metadata || {});
    const now = new Date().toISOString();
    let val = {}; try { val = JSON.parse(cur.value || "{}") || {}; } catch { val = {}; }
    if (what === "open") {
      m.opens = (m.opens || 0) + 1; m.first = m.first || now; m.last = now; m.dev = device(request);
      val.visits = (val.visits || []).concat([{ t: now, dev: m.dev }]).slice(-30);
    }
    else { m.pdf = (m.pdf || 0) + 1; }
    await env.HUB_KV.put(key, JSON.stringify(val), { metadata: m });
    return json({ ok: true });
  }

  // Reading heat map (2026-11-10): POST /p/<code>/pseen {secs:[per page], far, n}. Totals in plantime:<id>,
  // furthest page + total read time on planview:<id> metadata (so the Hub's one list call shows them).
  if (action === "pseen" && request.method === "POST") {
    if (!id) return json({ ok: false }, 404);
    if (await ownerView(env, request)) return json({ ok: true, owner: true });
    let b = {};
    try { b = JSON.parse((await request.text()).slice(0, 4000)); } catch { return json({ ok: false }, 400); }
    const n = Math.max(1, Math.min(40, b.n | 0)), add = (Array.isArray(b.secs) ? b.secs : []).slice(0, n).map(function (s) { return Math.max(0, Math.min(120, +s || 0)); });
    const tk = "plantime:" + id;
    let t = {}; try { t = JSON.parse((await env.HUB_KV.get(tk)) || "{}") || {}; } catch { t = {}; }
    t.secs = Array.isArray(t.secs) && t.secs.length === n ? t.secs : new Array(n).fill(0);
    add.forEach(function (s, i) { t.secs[i] = Math.round((t.secs[i] + s) * 10) / 10; });
    t.far = Math.max(t.far || 0, Math.min(n, b.far | 0)); t.n = n;
    await env.HUB_KV.put(tk, JSON.stringify(t));
    const key = "planview:" + id, cur = await env.HUB_KV.getWithMetadata(key);
    const m = Object.assign({}, cur.metadata || {});
    m.far = t.far; m.pages = n; m.read = Math.round(t.secs.reduce(function (a, s) { return a + s; }, 0));
    await env.HUB_KV.put(key, cur.value || "", { metadata: m });
    return json({ ok: true });
  }

  // ---- The sales video (VSL), 2026-11-10 -------------------------------------------------------
  //   GET  /p/<code>/video    -> public/vsl-view.html (player + Join button + full screen)
  //   GET  /p/<code>/vsl.mp4  -> the men's or women's video (plan "gender"), Range requests passed through
  //   POST /p/<code>/vseen    -> JSON { ev:"open"|"tick"|"end"|"join", bins:[0-99], pos, dur, dev }
  // KV vslview:<contactId>: value = { bins:[100 counts], visits:[{t,dev}], joins:[{t,at}] },
  //   metadata = { opens, first, last, pct, far, done, join, joinAt, dev } (read by /api/vslviews).
  if (action === "video" && request.method === "GET") {
    if (!id) return new Response("This link isn't valid any more. Please ask Olly for a new one.", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
    const page = await env.ASSETS.fetch(new URL("/vsl-view.html", request.url));
    return new Response(page.body, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
  }

  // the file name carries a version (vsl-<n>.mp4) so a new upload never meets an old copy in Cloudflare's cache (2026-11-10:
  // a "not found" from before the men's video existed was cached for 4 hours). Not-found answers are never cached.
  if (/^vsl(-[a-z0-9]+)?\.mp4$/.test(action) && request.method === "GET") {
    if (!id) return new Response("", { status: 404, headers: { "cache-control": "no-store" } });
    let g = "female";
    try { const p = JSON.parse((await env.HUB_KV.get("plan:" + id)) || "{}"); if (/^m/i.test(p.gender || "")) g = "male"; } catch {}
    const file = "/vsl/vsl-" + (g === "male" ? "men" : "women") + ".mp4";
    const r = await env.ASSETS.fetch(new Request(new URL(file, request.url), { headers: request.headers }));
    // a missing file makes Pages fall back to index.html: never send that (it's the Hub's own page) as the "video"
    if (!/video|octet-stream/i.test(r.headers.get("content-type") || "")) return new Response("", { status: 404, headers: { "cache-control": "no-store" } });
    const h = new Headers(r.headers);
    h.set("content-type", "video/mp4"); h.set("cache-control", "private, max-age=3600"); h.set("x-robots-tag", "noindex"); h.set("accept-ranges", "bytes");
    // iPhones only play video when byte ranges work (206). Pages' asset server ignores Range here, so slice it ourselves.
    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") || "");
    if (range && r.status === 200) {
      const buf = await r.arrayBuffer(), size = buf.byteLength;
      let start = range[1] === "" ? Math.max(0, size - (+range[2] || 0)) : +range[1];
      let end = range[1] === "" || range[2] === "" ? size - 1 : Math.min(+range[2], size - 1);
      if (start >= size || start > end) return new Response("", { status: 416, headers: { "content-range": "bytes */" + size } });
      h.set("content-range", "bytes " + start + "-" + end + "/" + size); h.set("content-length", String(end - start + 1));
      return new Response(buf.slice(start, end + 1), { status: 206, headers: h });
    }
    return new Response(r.body, { status: r.status, headers: h });
  }

  // the still shown before they press play (iPhones show black otherwise): /p/<code>/poster-<n>.jpg
  if (/^poster(-[a-z0-9]+)?\.jpg$/.test(action) && request.method === "GET") {
    if (!id) return new Response("", { status: 404, headers: { "cache-control": "no-store" } });
    let g = "female";
    try { const p = JSON.parse((await env.HUB_KV.get("plan:" + id)) || "{}"); if (/^m/i.test(p.gender || "")) g = "male"; } catch {}
    const r = await env.ASSETS.fetch(new URL("/vsl/poster-" + (g === "male" ? "men" : "women") + ".jpg", request.url));
    if (!/image/i.test(r.headers.get("content-type") || "")) return new Response("", { status: 404, headers: { "cache-control": "no-store" } });
    return new Response(r.body, { status: 200, headers: { "content-type": "image/jpeg", "cache-control": "private, max-age=3600" } });
  }

  if (action === "vseen" && request.method === "POST") {
    if (!id) return json({ ok: false }, 404);
    if (await ownerView(env, request)) return json({ ok: true, owner: true });
    let b = {};
    try { b = JSON.parse(await request.text()); } catch { return json({ ok: false }, 400); }
    if (!/^(open|tick|end|join)$/.test(b.ev || "")) return json({ ok: false }, 400);
    const key = "vslview:" + id, cur = await env.HUB_KV.getWithMetadata(key);
    let v = {}; try { v = JSON.parse(cur.value || "{}") || {}; } catch { v = {}; }
    const m = Object.assign({ opens: 0, first: null, last: null, pct: 0, far: 0, done: false, join: 0, joinAt: null, dev: "" }, cur.metadata || {});
    v.bins = Array.isArray(v.bins) && v.bins.length === 100 ? v.bins : new Array(100).fill(0);
    v.visits = v.visits || []; v.joins = v.joins || [];
    const now = new Date().toISOString(), dur = Math.max(0, +b.dur || 0), pos = Math.max(0, +b.pos || 0);
    (Array.isArray(b.bins) ? b.bins : []).slice(0, 100).forEach(function (i) { i = i | 0; if (i >= 0 && i < 100) v.bins[i]++; });
    m.pct = v.bins.filter(function (n) { return n > 0; }).length;
    if (dur) m.far = Math.max(m.far || 0, Math.min(100, Math.round(pos / dur * 100)));
    m.last = now;
    let note = null;
    if (b.ev === "open") {
      m.opens++; m.first = m.first || now; m.dev = String(b.dev || "").slice(0, 10);
      v.visits.push({ t: now, dev: m.dev }); v.visits = v.visits.slice(-30);
      if (m.opens === 1) note = { title: "Video opened", body: "Someone just opened their sales video. Tap to see who.", url: "/#looms", tag: "vsl-" + id };
    }
    if ((b.ev === "end" || m.pct >= 90) && !m.done) { m.done = true; note = { title: "Video watched to the end", body: "An applicant just finished their sales video (" + m.pct + "% watched). Tap to see who.", url: "/#looms", tag: "vsl-" + id }; }
    if (b.ev === "join") {
      m.join++; m.joinAt = m.joinAt || now; v.joins.push({ t: now, at: Math.round(pos) }); v.joins = v.joins.slice(-20);
      note = { title: "Someone clicked Join 🎉", body: "An applicant just clicked Join on their sales video. Tap to see who.", url: "/#looms", tag: "vsl-join-" + id };
    }
    await env.HUB_KV.put(key, JSON.stringify(v), { metadata: m });
    if (note) { try { await pushAll(env, note); } catch (e) {} }
    return json({ ok: true });
  }

  return json({ ok: false }, 405);
}
