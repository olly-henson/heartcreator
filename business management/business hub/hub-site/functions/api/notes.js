// Cloudflare Pages Function: the Latest activity list on the Sales tab (Olly, 2026-11-28). Behind Cloudflare Access.
//   GET  /api/notes                     -> { ok, items: [...] }  (lib/feed.js has the shape)
//   POST /api/notes { seen: "<id>" }    -> ticks one Seen      { seen: "all" } -> ticks them all
//   POST /api/notes { unseen: "<id>" }  -> undo a Seen
import { FEED_KEY } from "../../lib/feed.js";

function json(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

export async function onRequestGet({ env }) {
  return json({ ok: true, items: (await env.HUB_KV.get(FEED_KEY, "json")) || [] });
}

export async function onRequestPost({ request, env }) {
  let b = {};
  try { b = await request.json(); } catch (e) { return json({ ok: false }, 400); }
  const list = (await env.HUB_KV.get(FEED_KEY, "json")) || [];
  const now = new Date().toISOString();
  let changed = 0;
  list.forEach((n) => {
    if (b.seen && !n.seen && (b.seen === "all" || n.id === b.seen)) { n.seen = now; changed++; }
    if (b.unseen && n.id === b.unseen && n.seen) { n.seen = null; changed++; }
  });
  if (changed) await env.HUB_KV.put(FEED_KEY, JSON.stringify(list));
  return json({ ok: true, items: list });
}
