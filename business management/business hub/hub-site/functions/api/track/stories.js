// Keyed READ-ONLY check of Story auto-posting (2026-11-04), for Claude on the laptop (can't pass Cloudflare Access).
// GET /api/track/stories?key=<REELS_KEY> -> { ok, accounts:{instagram,facebook}, status }   (no schedule/cancel here)

import { json, accounts, refresh } from "../../../lib/stories.js";

export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get("key") || "";
  if (!env.REELS_KEY || key !== env.REELS_KEY) return json({ ok: false }, 401);
  let accs = null, accErr = "";
  try { accs = await accounts(env); } catch (e) { accErr = e.message; }
  let status = null, stErr = "";
  try { status = await refresh(env); } catch (e) { stErr = e.message; }
  return json({ ok: true, accounts: accs, accountsError: accErr, status, statusError: stErr });
}
