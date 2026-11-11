// Cloudflare Pages Function — put a Hub calendar email into GHL as a template (Olly, 2026-11-09).
//
// Route: /api/email-template (POST, behind Cloudflare Access)
// Body: { subject, body, date: "YYYY-MM-DD", kind: "daily"|"pitch"|"pitchday", templateId? }
// Makes (or updates) an HTML template named e.g. "Daily email for 9th of November 2026" in Olly's Daily email look.
// He then picks it from GHL's templates when he schedules the email, so his smart lists stay in charge of who gets it.
// The subject isn't part of a GHL template, so he still types it when scheduling (the Hub shows it with a Copy button).
// Secret: env.GHL_WRITE_TOKEN (the Claude agent key: emails/builder read + write). Never in a file: the repo is public.

import { EMAIL_SHELL } from "../../lib/email-shell.js";

const API = "https://services.leadconnectorhq.com";
const LOCATION_ID = "LRqVZmxns8f3xcJLHzBK";
const OLLY_USER_ID = "bHBaRQ4MROqMcbSUeKXm";
const KIND = { daily: "Daily email", pitch: "Pitch email", pitchday: "Daily email (pitch day)" };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
  if (!res.ok) throw new Error("GHL " + res.status + ": " + text.slice(0, 200));
  try { return JSON.parse(text); } catch { return {}; }
}
function ordinal(n) { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
export function templateName(kind, iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return (KIND[kind] || KIND.daily) + " for " + ordinal(d) + " of " + MONTHS[m - 1] + " " + y;
}
function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
// [text](url) and bare https links become links; {{contact.first_name}} and other merge tags are left as they are.
function inline(t) {
  let out = "", last = 0;
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g;
  let m;
  while ((m = re.exec(t))) {
    out += esc(t.slice(last, m.index));
    const url = m[2] || m[3], label = m[1] || m[3];
    out += '<a href="' + esc(url) + '" style="color:#0b57d0;">' + esc(label) + "</a>";
    last = re.lastIndex;
  }
  return out + esc(t.slice(last));
}
// **bold** and *italic* from the Hub email box (2026-11-11). Runs on escaped HTML.
function fmt(h) {
  return h.replace(/\*\*(?=\S)([^*\n]+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*(?=[^\s*])([^*\n]+?)\*(?!\*)/g, "$1<em>$2</em>");
}
export function bodyHtml(text) {
  return String(text).replace(/\r/g, "").trim().split(/\n\s*\n/).filter(Boolean).map(function (par) {
    return '<p style="line-height: 1.5;"><span style="font-size: 18px">' + par.trim().split("\n").map(function (l) { return fmt(inline(l)); }).join("<br>") + "</span></p>";
  }).join("");
}

export async function onRequestPost({ request, env }) {
  if (!env.GHL_WRITE_TOKEN) return json({ ok: false, error: "The GHL key isn't set up in Cloudflare." }, 500);
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "Bad request." }, 400); }
  const date = String(b.date || ""), body = String(b.body || "").trim(), kind = KIND[b.kind] ? b.kind : "daily";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ ok: false, error: "The email needs a date." }, 400);
  if (!body) return json({ ok: false, error: "The email has no text yet." }, 400);
  const name = templateName(kind, date);
  const html = EMAIL_SHELL.replace("%%BODY%%", bodyHtml(body));
  try {
    let id = /^[a-f0-9]{24}$/.test(String(b.templateId || "")) ? b.templateId : "";
    // the template's name carries the date: if the email moved day (or changed list), make a new one and remove the old
    if (id && b.templateName && b.templateName !== name) {
      await ghl(env, "DELETE", "/emails/builder/" + LOCATION_ID + "/" + id).catch(function () {});
      id = "";
    }
    if (!id) {
      const made = await ghl(env, "POST", "/emails/builder", { locationId: LOCATION_ID, type: "html", name, title: name, updatedBy: OLLY_USER_ID, builderVersion: "2" });
      id = made.id || made.redirect;
      if (!id) throw new Error("GHL didn't return a template id.");
    }
    await ghl(env, "POST", "/emails/builder/data", {
      locationId: LOCATION_ID, templateId: id, updatedBy: OLLY_USER_ID,
      dnd: { elements: [], attrs: {}, templateSettings: {} }, html, editorType: "html",
    });
    return json({ ok: true, templateId: id, name, at: new Date().toISOString() });
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 502);
  }
}
