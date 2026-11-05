// Cloudflare Pages Function: "Remove from GHL" for a Not a fit applicant (Olly, 2026-11-05).
//
// Route: POST /api/remove-applicant  { id }   (behind Cloudflare Access like the rest of the Hub)
// Secret: env.GHL_WRITE_TOKEN = the 'Claude agent' Private Integration key (contacts.write). The Hub's GHL_TOKEN is
//         view-only. Never put either in a file: the repo is public.
//
// For really bad fits / rude applicants, so they stop skewing list quality and the numbers:
//   1. Do Not Disturb on every channel FIRST, so nothing can send while the tags change.
//   2. Remove every tag except "heart attractor applicant" (keeps their card in the Hub's Not a fit column),
//      "daily email list" first, so losing "engaged recently" can't start the Weekly email (dormant) workflow.
//   3. Add "removed - not a fit": every data pull, summary and Hub stat leaves these contacts out.
// The contact isn't deleted: their record and application stay, but nothing can reach them.
// Tested 2026-11-05 on a dummy contact (created and deleted again).

const API = "https://services.leadconnectorhq.com";
const KEEP = ["heart attractor applicant"];
const MARK = "removed - not a fit";

function json(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
async function ghl(env, method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: "Bearer " + env.GHL_WRITE_TOKEN, Version: "2021-07-28", Accept: "application/json", "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error("GHL " + res.status + " on " + method + " " + path.split("?")[0] + ": " + text.slice(0, 200));
  return text ? JSON.parse(text) : {};
}

export async function onRequestPost({ request, env }) {
  if (!env.GHL_WRITE_TOKEN) return json({ ok: false, error: "The GHL_WRITE_TOKEN secret isn't set in Cloudflare yet." }, 500);
  let b = {};
  try { b = await request.json(); } catch (e) { b = {}; }
  const id = String(b.id || "");
  if (!/^[A-Za-z0-9]{10,40}$/.test(id)) return json({ ok: false, error: "contact id needed" }, 400);
  try {
    const c = (await ghl(env, "GET", "/contacts/" + id)).contact || {};
    const on = { status: "active" };
    await ghl(env, "PUT", "/contacts/" + id, { dnd: true, dndSettings: { Email: on, SMS: on, Call: on, WhatsApp: on, GMB: on, FB: on } });
    const rm = (c.tags || []).filter(function (t) { return KEEP.indexOf(String(t).toLowerCase().trim()) === -1 && String(t).toLowerCase().trim() !== MARK; })
      .sort(function (x, y) { return (String(x).toLowerCase() === "daily email list" ? 0 : 1) - (String(y).toLowerCase() === "daily email list" ? 0 : 1); });
    for (const t of rm) await ghl(env, "DELETE", "/contacts/" + id + "/tags", { tags: [t] });
    await ghl(env, "POST", "/contacts/" + id + "/tags", { tags: [MARK] });
    return json({ ok: true, removedTags: rm, at: new Date().toISOString() });
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 502);
  }
}
