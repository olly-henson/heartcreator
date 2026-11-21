// Cloudflare Pages Function: send Olly's due reminders to his phone and his inbox (2026-11-21).
//
// Route: /api/track/reminders   (GET or POST; under /api/track so the cron Worker gets past Cloudflare Access)
// Called every 10 minutes by the `hub-reminders-cron` Worker (business hub/reminders-cron/).
// Reminders live in the Hub record: state.reminders = [{ id, cid, name, tab, at (ISO), text, done }],
// added on a Sales or Delivery card. A reminder goes out once, when its time has come (and it isn't done):
//   1. a push notification to every device he turned notifications on for, and
//   2. an email to olly@ollyhenson.com, sent through GHL to his own contact (Olly: "send an email to my Gmail").
//      Needs env.GHL_WRITE_TOKEN with the conversations/message.write scope.
// Which ones already went out is kept in its own KV key `remind:sent`, so the record is never written from here.
// Anyone calling this can only make Olly's own due reminders arrive once each; it returns counts only.

import { pushAll } from "../../../lib/webpush.js";

const OLLY_CONTACT = "zhqYccezHlN50cCBBezk";   // Olly's own GHL contact (an id, not personal data)
const HUB = "https://hub.ollyhenson.com";

function json(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

async function emailOlly(env, r, link) {
  if (!env.GHL_WRITE_TOKEN) return "no GHL_WRITE_TOKEN";
  const when = new Date(r.at).toLocaleString("en-GB", { timeZone: "Africa/Johannesburg", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const html = '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#1d1527">' +
    "<p><b>" + esc(r.name || "Reminder") + "</b></p><p>" + esc(r.text) + '</p><p style="color:#6b5f7d;font-size:14px">Set for ' + esc(when) + "</p>" +
    '<p><a href="' + link + '" style="display:inline-block;background:#6b21a8;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 18px;border-radius:8px">Open their card in the Hub</a></p></div>';
  const res = await fetch("https://services.leadconnectorhq.com/conversations/messages", {
    method: "POST",
    headers: { Authorization: "Bearer " + env.GHL_WRITE_TOKEN, Version: "2021-07-28", Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ type: "Email", contactId: OLLY_CONTACT, subject: "🔔 Reminder: " + (r.name || "Hub") + " · " + String(r.text || "").slice(0, 60), html, emailFrom: "Olly Henson <olly@ollyhenson.com>" }),
  });
  return res.ok ? "" : "GHL " + res.status + " " + (await res.text()).slice(0, 120);
}

async function run(env) {
  const rec = (await env.HUB_KV.get("record", "json")) || {};
  const list = ((rec.state && rec.state.reminders) || []).filter((r) => r && r.id && r.at && !r.done);
  const sent = (await env.HUB_KV.get("remind:sent", "json")) || {};
  const now = Date.now(), WEEK = 7 * 864e5;
  const due = list.filter((r) => {
    const t = Date.parse(r.at);
    return t <= now && t > now - 3 * 864e5 && !sent[r.id];   // older than 3 days = missed, it stays on the Hub banner only
  });
  let devices = 0, emailed = 0;
  const emailErrors = [];
  for (const r of due) {
    const tab = r.tab === "delivery" ? "delivery" : "looms";
    const hash = "#" + tab + (r.cid ? "=" + String(r.cid).replace(/[^A-Za-z0-9_-]/g, "") : "");
    const res = await pushAll(env, { title: "🔔 " + (r.name ? r.name : "Reminder"), body: String(r.text || "Reminder").slice(0, 180), url: "/" + hash, tag: "rm-" + r.id });
    devices = res.devices || devices;
    let err = "";
    try { err = await emailOlly(env, r, HUB + "/" + hash); } catch (e) { err = String(e.message || e); }
    if (err) emailErrors.push(err); else emailed++;
    sent[r.id] = now;
  }
  let pruned = false;
  Object.keys(sent).forEach((k) => { if (sent[k] < now - 5 * WEEK) { delete sent[k]; pruned = true; } });
  if (due.length || pruned) await env.HUB_KV.put("remind:sent", JSON.stringify(sent));
  return json({ ok: true, sent: due.length, devices, emailed, emailErrors });
}

export async function onRequestGet({ env }) { return run(env); }
export async function onRequestPost({ env }) { return run(env); }
