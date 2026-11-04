// Story auto-posting through GHL's Social Planner (2026-11-04). Used by functions/api/stories.js (the Hub, behind
// Cloudflare Access) and functions/api/track/stories.js (keyed read-only check for Claude on the laptop).
//
// Olly taps "Schedule" on a Story in the Hub (that tap = his approval) -> each image is copied from KV (img:<id>) to
// the GHL media library -> one 'story' post per image on Instagram + Facebook at the Story's slot (images 1 minute
// apart so they play in order). Stages live in their own KV key "storystatus" ({ <sid>: {...} }), NOT in the Hub
// record, so this never bumps the record's rev. GHL REPLACES a scheduled post when it publishes it (seen on Reels):
// the old one is marked deleted and a new post with parentPostId = old _id carries the real status + previewLink.
//
// API Stories are plain images: no link/poll/question stickers, music or mentions (those stay manual).
// Secret: env.GHL_TOKEN = the 'Business hub' Private Integration (socialplanner post + account, medias added 2026-11-04).

const API = "https://services.leadconnectorhq.com";
const LOC = "LRqVZmxns8f3xcJLHzBK";
const USER_ID = "bHBaRQ4MROqMcbSUeKXm";   // Olly's GHL user (same as reels\ghl_poster.py)
const PLATS = ["instagram", "facebook"];
const TZ_MS = 2 * 3600e3;                 // Cape Town / Windhoek, UTC+2, no daylight saving
const LEAD_MS = 20 * 60e3;

// Story times by how many Stories the day has (Cape Town time), US emphasis like the Reels: Cape Town = US Eastern +7h
// in November, so 13:00-16:00 = East morning, 19:00 = East lunch, 22:00 = East afternoon / West lunch.
const SPREAD = {
  1: ["15:00"],
  2: ["15:00", "20:00"],
  3: ["14:00", "17:00", "20:00"],
  4: ["13:00", "15:30", "18:00", "21:00"],
  5: ["12:00", "14:30", "17:00", "19:30", "22:00"],
  6: ["10:00", "12:30", "15:00", "17:30", "20:00", "22:30"],
};
function spread(n) {
  n = Math.max(1, Math.min(12, n | 0));
  if (SPREAD[n]) return SPREAD[n];
  const out = [], step = Math.floor((15 * 60) / (n - 1));   // 08:00 -> 23:00 evenly
  for (let i = 0; i < n; i++) { const m = 8 * 60 + i * step; out.push(String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0")); }
  return out;
}
function isoAt(day, hhmm) {   // day "YYYY-MM-DD" + "HH:MM" Cape Town -> UTC ISO
  const [h, m] = hhmm.split(":").map(Number);
  const [y, mo, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, m) - TZ_MS).toISOString().replace(/\.\d{3}Z$/, ".000Z");
}
function localDay(ms) { return new Date(ms + TZ_MS).toISOString().slice(0, 10); }
function addDays(day, n) { const t = Date.parse(day + "T00:00:00Z") + n * 864e5; return new Date(t).toISOString().slice(0, 10); }
function plusMin(iso, n) { return new Date(Date.parse(iso) + n * 60e3).toISOString().replace(/\.\d{3}Z$/, ".000Z"); }

export function json(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
export async function getStatus(env) {
  try { return JSON.parse((await env.HUB_KV.get("storystatus")) || "{}"); } catch (e) { return {}; }
}
async function putStatus(env, s) { await env.HUB_KV.put("storystatus", JSON.stringify(s)); }

async function ghl(env, method, path, body, raw) {
  const headers = { Authorization: "Bearer " + env.GHL_TOKEN, Version: "2021-07-28", Accept: "application/json" };
  let payload = raw;
  if (body !== undefined) { headers["Content-Type"] = "application/json"; payload = JSON.stringify(body); }
  const res = await fetch(API + path.replace("{loc}", LOC), { method, headers, body: payload });
  const text = await res.text();
  if (!res.ok) throw new Error("GHL " + res.status + " on " + method + " " + path.split("?")[0].replace("{loc}", "") + ": " + text.slice(0, 250));
  return text ? JSON.parse(text) : {};
}

export async function accounts(env) {
  const d = await ghl(env, "GET", "/social-media-posting/{loc}/accounts");
  const out = {};
  ((d.results && d.results.accounts) || []).forEach(a => {
    if (PLATS.includes(a.platform) && !a.isExpired && !out[a.platform]) out[a.platform] = { id: a.id, name: a.name || "", type: a.type || "" };
  });
  return out;
}

// The next free Story slot: the Story's own calendar day (or today if that's passed), spread for that day's Story count.
function nextSlot(status, date, dayCount, nowMs) {
  const taken = new Set(Object.values(status).filter(s => s && s.slot && s.stage !== "cancelled").map(s => s.slot));
  const perDay = {};
  taken.forEach(t => { const d = localDay(Date.parse(t)); perDay[d] = (perDay[d] || 0) + 1; });
  const today = localDay(nowMs);
  let day = date && date >= today ? date : today;
  for (let i = 0; i < 60; i++, day = addDays(day, 1)) {
    const n = Math.max(day === date ? dayCount || 1 : 1, (perDay[day] || 0) + 1);
    for (const t of spread(n)) {
      const iso = isoAt(day, t);
      if (Date.parse(iso) > nowMs + LEAD_MS && !taken.has(iso)) return iso;
    }
  }
  throw new Error("no free Story slot in the next 60 days");
}

async function uploadImage(env, imgId) {
  const { value, metadata } = await env.HUB_KV.getWithMetadata("img:" + imgId, { type: "arrayBuffer" });
  if (!value) throw new Error("image " + imgId + " not found in the Hub");
  const type = (metadata && metadata.type) || "image/jpeg";
  const fd = new FormData();
  fd.append("name", "story-" + imgId);
  fd.append("file", new Blob([value], { type }), "story-" + imgId + (type === "image/png" ? ".png" : ".jpg"));
  const d = await ghl(env, "POST", "/medias/upload-file", undefined, fd);
  if (!d.url) throw new Error("GHL upload gave no url");
  return { url: d.url, type };
}

// Schedules (or finishes a half-done schedule of) one Story. Keeps its slot and any uploads/posts already made.
export async function schedule(env, b) {
  const sid = String(b.sid || "");
  const images = (Array.isArray(b.images) ? b.images : []).filter(x => /^[a-z0-9-]{8,64}$/.test(x)).slice(0, 10);
  if (!/^[a-z0-9-]{6,64}$/.test(sid) || !images.length) throw new Error("sid and images needed");
  const status = await getStatus(env);
  const prev = status[sid] && status[sid].stage !== "cancelled" ? status[sid] : null;
  if (prev && prev.stage === "published") return prev;
  const s = prev ? JSON.parse(JSON.stringify(prev)) : { title: String(b.title || "").slice(0, 200), posts: [], media: {} };
  s.images = images;
  s.slot = s.slot || nextSlot(status, String(b.date || ""), Number(b.dayCount) || 1, Date.now());
  s.media = s.media || {};
  s.posts = (s.posts || []).filter(p => images.includes(p.img));
  const accs = await accounts(env);
  const errs = [];
  for (let k = 0; k < images.length; k++) {
    const img = images[k];
    try { if (!s.media[img]) s.media[img] = await uploadImage(env, img); }
    catch (e) { errs.push("image " + (k + 1) + ": " + e.message); continue; }
    for (const pl of PLATS) {
      if (!accs[pl]) { if (k === 0) errs.push(pl + ": not connected in GHL Social Planner"); continue; }
      if (s.posts.some(p => p.img === img && p.pl === pl)) continue;
      try {
        const d = await ghl(env, "POST", "/social-media-posting/{loc}/posts", {
          accountIds: [accs[pl].id], summary: "", type: "story", status: "scheduled", userId: USER_ID,
          scheduleDate: plusMin(s.slot, k), media: [{ url: s.media[img].url, type: s.media[img].type }],
        });
        s.posts.push({ pl, img, pid: d.results.post._id, status: "scheduled" });
      } catch (e) { errs.push(pl + " image " + (k + 1) + ": " + e.message); }
    }
  }
  s.stage = s.posts.length ? "scheduled" : "failed";
  s.error = errs.join("; ");
  s.at = new Date().toISOString();
  status[sid] = s;
  await putStatus(env, status);
  return s;
}

// Removes the Story's GHL posts that haven't gone out. Anything already published stays (and the stage says so).
export async function cancel(env, sid) {
  const status = await getStatus(env);
  const s = status[sid];
  if (!s) return { stage: "" };
  const left = [];
  for (const p of s.posts || []) {
    if (p.status === "published") { left.push(p); continue; }
    try { await ghl(env, "DELETE", "/social-media-posting/{loc}/posts/" + p.pid); }
    catch (e) { if (!/404/.test(e.message)) left.push(p); }
  }
  if (left.length) { s.posts = left; s.error = "some frames had already posted or couldn't be removed"; status[sid] = s; }
  else delete status[sid];
  await putStatus(env, status);
  return status[sid] || { stage: "" };
}

// Checks every scheduled Story whose slot has passed and moves it to published / failed (follows GHL's parentPostId swap).
export async function refresh(env) {
  const status = await getStatus(env);
  const due = Object.entries(status).filter(([, s]) => s && s.stage === "scheduled" && Date.parse(s.slot) < Date.now() - 60e3);
  if (!due.length) return status;
  let kids = null;
  const from = new Date(Math.min(...due.map(([, s]) => Date.parse(s.slot))) - 864e5).toISOString();
  for (const [, s] of due) {
    for (const p of s.posts) {
      if (p.status === "published" || p.status === "failed") continue;
      try {
        const post = ((await ghl(env, "GET", "/social-media-posting/{loc}/posts/" + p.pid)).results || {}).post || {};
        if (!post.deleted) { p.status = post.status || p.status; p.error = post.error || ""; continue; }
        if (!kids) {
          kids = [];
          for (const type of ["published", "failed"]) {
            const d = await ghl(env, "POST", "/social-media-posting/{loc}/posts/list", {
              type, fromDate: from, toDate: new Date(Date.now() + 864e5).toISOString(), limit: "100", skip: "0", includeUsers: "false",
            });
            kids = kids.concat((d.results && d.results.posts) || []);
          }
        }
        const kid = kids.find(k => k.parentPostId === p.pid);
        if (kid) { p.status = kid.status || ""; p.error = kid.error || ""; if (kid.previewLink) p.link = kid.previewLink; }
        else if (Date.now() - Date.parse(s.slot) > 6 * 3600e3) { p.status = "deleted"; p.error = "removed in GHL before it posted"; }
      } catch (e) { p.error = e.message.slice(0, 200); }
    }
    const sts = s.posts.map(p => p.status);
    if (sts.length && sts.every(x => x === "published")) { s.stage = "published"; s.error = ""; }
    else if (sts.some(x => x === "failed" || x === "deleted" || x === "notification_sent")) {
      s.stage = sts.some(x => x === "published") ? "partial" : "failed";
      s.error = s.posts.filter(p => p.status !== "published").map(p => p.pl + ": " + (p.status === "notification_sent" ? "GHL sent a phone reminder instead of posting" : p.error || p.status)).join("; ");
    }
    s.at = new Date().toISOString();
  }
  await putStatus(env, status);
  return status;
}
