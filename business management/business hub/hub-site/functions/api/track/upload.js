// Cloudflare Pages Function: one fixed link to the laptop's Reel upload page (Olly 2026-11-08: "less glitchy with
// this constant wifi needing to be updated as in the ip").
//
// Route: /api/track/upload   (under /api/track so it bypasses Cloudflare Access, like the other laptop routes)
// GET                      -> 302 to http://<laptop's current Wi-Fi address>:8800 (Olly's phone bookmark)
// POST ?key=<REELS_KEY> {ip} -> the laptop's upload server reports its address on start and whenever it changes
// Stored in KV "uploadip" as { ip, at }. Only private addresses are accepted, so the link can never send anyone
// to an outside site; a private address is useless to anyone not on the same Wi-Fi.

const PRIVATE = /^(10\.\d{1,3}|172\.(1[6-9]|2\d|3[01])|192\.168)\.\d{1,3}\.\d{1,3}$/;

function page(msg, status) {
  return new Response(
    '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reel Upload</title>' +
      '<body style="font-family:system-ui;padding:24px;line-height:1.5;background:#fff;color:#222"><h2>Reel Upload</h2><p>' + msg + "</p></body>",
    { status: status || 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } }
  );
}

// 2026-11-08: now forwards to the Cloudflare Tunnel address, which works anywhere (not just home Wi-Fi) and sits behind
// the Hub's Cloudflare Access login. The laptop still reports its Wi-Fi address (POST below); /api/track/upload?lan=1
// keeps the old home-Wi-Fi jump as a fallback.
export async function onRequestGet({ request, env }) {
  if (!new URL(request.url).searchParams.has("lan")) {
    return new Response(null, { status: 302, headers: { location: "https://upload.ollyhenson.com/", "cache-control": "no-store" } });
  }
  let rec = null;
  try { rec = JSON.parse((await env.HUB_KV.get("uploadip")) || "null"); } catch (e) { rec = null; }
  if (!rec || !PRIVATE.test(rec.ip || "")) {
    return page("The laptop hasn't reported its address yet. Turn the laptop on and run <b>Start Reel Upload</b>, then try again.", 503);
  }
  return new Response(null, { status: 302, headers: { location: "http://" + rec.ip + ":8800/", "cache-control": "no-store" } });
}

export async function onRequestPost({ request, env }) {
  const key = new URL(request.url).searchParams.get("key") || "";
  if (!env.REELS_KEY || key !== env.REELS_KEY) return new Response("no", { status: 401 });
  let b = {};
  try { b = await request.json(); } catch (e) { b = {}; }
  const ip = String(b.ip || "");
  if (!PRIVATE.test(ip)) return new Response("private IPv4 only", { status: 400 });
  await env.HUB_KV.put("uploadip", JSON.stringify({ ip, at: new Date().toISOString() }));
  return new Response("ok");
}
