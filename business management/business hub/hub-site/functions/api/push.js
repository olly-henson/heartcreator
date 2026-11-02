// Cloudflare Pages Function: this device's new-application notifications (Olly, 2026-11-02).
//
// Route: /api/push   (behind Cloudflare Access, like the rest of the Hub)
//   GET                              -> { ok, publicKey, devices }  (the VAPID key the browser subscribes with)
//   POST { sub, ua }                 -> saves this device's push subscription (deduped by endpoint)
//   POST { action:"test" }           -> sends a test notification to every saved device
//   POST { action:"off", endpoint }  -> removes one device
// The notification itself is sent by /api/track/new-application when GHL reports a new application.

import { pushAll, vapidPublic } from "../../lib/webpush.js";

function json(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

export async function onRequestGet({ env }) {
  const jwk = JSON.parse(env.VAPID_JWK || "null");
  const subs = (await env.HUB_KV.get("push:subs", "json")) || [];
  return json({ ok: !!jwk, publicKey: jwk ? vapidPublic(jwk) : "", devices: subs.length });
}

export async function onRequestPost({ request, env, waitUntil }) {
  let b = {};
  try { b = await request.json(); } catch (e) { return json({ ok: false, error: "Bad request" }, 400); }
  const subs = (await env.HUB_KV.get("push:subs", "json")) || [];
  if (b.action === "test") {
    // sent 10 seconds later, so Olly can lock the phone or leave the Hub and see a real one arrive
    if (!env.VAPID_JWK) return json({ ok: false, error: "VAPID_JWK secret is not set" });
    waitUntil(new Promise((r) => setTimeout(r, 10000)).then(() => pushAll(env, { title: "New application: Test Person", body: "This is a test. Tap to open the Looms tab.", url: "/#looms", tag: "hub-test" })));
    return json({ ok: true, devices: subs.length });
  }
  if (b.action === "off") {
    const keep = subs.filter((s) => s.endpoint !== b.endpoint);
    await env.HUB_KV.put("push:subs", JSON.stringify(keep));
    return json({ ok: true, devices: keep.length });
  }
  const s = b.sub;
  if (!s || !/^https:\/\//.test(s.endpoint || "") || !s.keys || !s.keys.p256dh || !s.keys.auth) return json({ ok: false, error: "No subscription" }, 400);
  const keep = subs.filter((x) => x.endpoint !== s.endpoint);
  keep.push({ endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth }, ua: String(b.ua || "").slice(0, 160), added: new Date().toISOString() });
  await env.HUB_KV.put("push:subs", JSON.stringify(keep.slice(-10)));
  return json({ ok: true, devices: keep.length });
}
