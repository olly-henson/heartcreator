// Cloudflare Pages Function: GHL tells the Hub someone applied, the Hub notifies Olly's phone (2026-11-02).
//
// Route: /api/track/new-application?key=<NOTIFY_KEY>   (POST, from a Webhook action in GHL's application workflow)
// It sits under /api/track because that path is the one exempt from Cloudflare Access (GHL can't log in).
// The key stops anyone else triggering it: env.NOTIFY_KEY, a Pages secret, never in a file (the repo is public).
// Body: GHL's standard webhook JSON (contact_id, first_name, last_name, ...) or { id, first, last }.
// Returns nothing about the contact: only how many devices were notified.

import { pushAll } from "../../../lib/webpush.js";

function json(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

export async function onRequestPost({ request, env }) {
  const key = new URL(request.url).searchParams.get("key") || "";
  if (!env.NOTIFY_KEY || key !== env.NOTIFY_KEY) return json({ ok: false }, 401);
  let b = {};
  try { b = await request.json(); } catch (e) { b = {}; }
  const c = b.contact || {};
  const id = String(b.contact_id || b.contactId || b.id || c.id || "").replace(/[^A-Za-z0-9_-]/g, "");
  const first = String(b.first_name || b.firstName || b.first || c.first_name || c.firstName || "").trim();
  const last = String(b.last_name || b.lastName || b.last || c.last_name || c.lastName || "").trim();
  const name = (first + " " + last).trim() || String(b.full_name || b.name || c.name || "").trim() || "someone new";
  const r = await pushAll(env, {
    title: "New application: " + name,
    body: "Tap to open their Looms screen and review it.",
    url: "/#looms" + (id ? "=" + id : ""),
    tag: "app-" + (id || Date.now()),
  });
  return json({ ok: r.ok, devices: r.devices || 0 });
}
