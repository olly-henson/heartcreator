// Cloudflare Pages Function — where opt-ins and applicants came from, pulled
// live from GHL.
//
// Route: /api/ghl-sources   (GET, from the "Pull from GHL" button on the Sales tab)
// Secret: env.GHL_TOKEN — a GHL Private Integration key ("Business Hub",
//         View Contacts + View Custom Fields). Set in the Pages project's
//         Settings → Variables and Secrets. Never put it in a file: the repo
//         is public.
//
// Reads every contact tagged "emotional resonance training" (opt-ins) or
// "heart attractor applicant" (applications), reads their UTM Source /
// Medium / Campaign / Content custom fields and returns COUNTS ONLY, grouped
// by month added + source. No names or emails leave this function.
//
// Auth: behind Cloudflare Access like the rest of the zone.

const API = "https://services.leadconnectorhq.com";
const LOCATION_ID = "LRqVZmxns8f3xcJLHzBK";
const TAG_OPTIN = "emotional resonance training";
const TAG_APPLIED = "heart attractor applicant";
const TAG_JOINED = "joined heart attractor program";
// The daily email list. Olly's plan called it "daily email"; the opt-in
// workflow actually applies "daily email list" — count either.
const TAGS_EMAIL = ["daily email list", "daily email"];

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

async function ghl(env, path, init) {
  const res = await fetch(API + path, {
    ...init,
    headers: {
      Authorization: "Bearer " + env.GHL_TOKEN,
      Version: "2021-07-28",
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error("GHL " + res.status + " on " + path.split("?")[0] + ": " + text.slice(0, 200));
  return JSON.parse(text);
}

// UTM custom field ids, matched by name ("UTM Source") or key ("contact.utm_source").
async function utmFieldIds(env) {
  const data = await ghl(env, "/locations/" + LOCATION_ID + "/customFields?model=contact");
  const ids = {};
  (data.customFields || []).forEach(function (f) {
    const name = String(f.name || "").toLowerCase().trim();
    const key = String(f.fieldKey || "").toLowerCase();
    ["source", "medium", "campaign", "content"].forEach(function (k) {
      if (name === "utm " + k || key.endsWith("utm_" + k)) ids[k] = ids[k] || f.id;
    });
  });
  return ids;
}

// All contacts carrying one tag. Uses the search endpoint; if GHL rejects
// the tag filter, falls back to paging through every contact and filtering here.
async function contactsWithTag(env, tag) {
  const out = [];
  try {
    for (let page = 1; page <= 100; page++) {
      const data = await ghl(env, "/contacts/search", {
        method: "POST",
        body: JSON.stringify({
          locationId: LOCATION_ID,
          page,
          pageLimit: 100,
          filters: [{ field: "tags", operator: "eq", value: tag }],
        }),
      });
      const batch = data.contacts || [];
      out.push(...batch);
      if (batch.length < 100) break;
    }
    return out;
  } catch (e) {
    return (await allContacts(env)).filter(function (c) { return hasTag(c, tag); });
  }
}

let allCache = null;
async function allContacts(env) {
  if (allCache) return allCache;
  const out = [];
  let after = "";
  for (let i = 0; i < 100; i++) {
    const data = await ghl(env, "/contacts/?locationId=" + LOCATION_ID + "&limit=100" + after);
    const batch = data.contacts || [];
    out.push(...batch);
    const meta = data.meta || {};
    if (batch.length < 100 || !meta.startAfterId) break;
    after = "&startAfterId=" + encodeURIComponent(meta.startAfterId) + "&startAfter=" + encodeURIComponent(meta.startAfter);
  }
  allCache = out;
  return out;
}

function hasTag(c, tag) {
  return (c.tags || []).some(function (t) { return String(t).toLowerCase().trim() === tag; });
}

function subscribed(c) {
  if (c.dnd === true || hasTag(c, "unsubscribed")) return false;
  const e = c.dndSettings && c.dndSettings.Email;
  return !(e && e.status === "active");
}

function fieldValue(c, id) {
  if (!id) return "";
  const f = (c.customFields || c.customField || []).find(function (x) { return x.id === id; });
  if (!f) return "";
  const v = f.value != null ? f.value : f.field_value;
  return String(v == null ? "" : v).trim().toLowerCase();
}

export async function onRequestGet({ env }) {
  if (!env.GHL_TOKEN) return json({ ok: false, error: "GHL_TOKEN secret is missing in Cloudflare" }, 500);
  allCache = null;
  try {
    const ids = await utmFieldIds(env);
    const [optins, applied] = await Promise.all([contactsWithTag(env, TAG_OPTIN), contactsWithTag(env, TAG_APPLIED)]);

    const byId = {};
    optins.concat(applied).forEach(function (c) { byId[c.id] = c; });

    const groups = {};
    Object.values(byId).forEach(function (c) {
      const month = String(c.dateAdded || "").slice(0, 7);
      const row = {
        month,
        source: fieldValue(c, ids.source),
        medium: fieldValue(c, ids.medium),
        campaign: fieldValue(c, ids.campaign),
        content: fieldValue(c, ids.content),
      };
      const k = [row.month, row.source, row.medium, row.campaign, row.content].join("|");
      if (!groups[k]) groups[k] = Object.assign(row, { optins: 0, applied: 0, joined: 0 });
      if (hasTag(c, TAG_OPTIN)) groups[k].optins++;
      if (hasTag(c, TAG_APPLIED)) groups[k].applied++;
      if (hasTag(c, TAG_JOINED)) groups[k].joined++;
    });

    // Email list size: everyone on the daily list who hasn't unsubscribed.
    const lists = await Promise.all(TAGS_EMAIL.map(function (t) { return contactsWithTag(env, t); }));
    const subs = {};
    lists.forEach(function (l) { l.forEach(function (c) { if (subscribed(c)) subs[c.id] = c; }); });

    return json({
      ok: true,
      fetchedAt: new Date().toISOString(),
      utmFieldsFound: Object.keys(ids),
      rows: Object.values(groups),
      emailList: Object.keys(subs).length,
    });
  } catch (e) {
    return json({ ok: false, error: String(e && e.message || e) }, 502);
  }
}
