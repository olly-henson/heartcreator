// Cloudflare Pages Function (behind Cloudflare Access): Story auto-posting via GHL (2026-11-04). Logic in lib/stories.js.
//
// GET  /api/stories                                   -> { ok, status: { <sid>: {stage, slot, posts, error, ...} } }
//      (checks GHL for any scheduled Story whose time has passed first)
// POST /api/stories { action:"schedule", sid, title, images:[ids], date, dayCount }  -> { ok, story }
// POST /api/stories { action:"cancel", sid }                                         -> { ok, story }

import { json, refresh, schedule, cancel } from "../../lib/stories.js";

export async function onRequestGet({ env }) {
  if (!env.GHL_TOKEN) return json({ ok: false, error: "GHL_TOKEN secret is missing in Cloudflare" }, 500);
  try { return json({ ok: true, status: await refresh(env) }); }
  catch (e) { return json({ ok: false, error: e.message }, 502); }
}

export async function onRequestPost({ request, env }) {
  if (!env.GHL_TOKEN) return json({ ok: false, error: "GHL_TOKEN secret is missing in Cloudflare" }, 500);
  let b = {};
  try { b = await request.json(); } catch (e) { b = {}; }
  try {
    if (b.action === "schedule") return json({ ok: true, story: await schedule(env, b) });
    if (b.action === "cancel") return json({ ok: true, story: await cancel(env, String(b.sid || "")) });
    return json({ ok: false, error: "unknown action" }, 400);
  } catch (e) { return json({ ok: false, error: e.message }, 502); }
}
