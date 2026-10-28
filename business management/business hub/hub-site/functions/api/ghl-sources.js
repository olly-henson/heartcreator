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
// Medium / Campaign / Content custom fields (applications: the HA UTM fields)
// and returns COUNTS ONLY, grouped by month added + source. No names or emails leave this function.
//
// Auth: behind Cloudflare Access like the rest of the zone.

const API = "https://services.leadconnectorhq.com";
const LOCATION_ID = "LRqVZmxns8f3xcJLHzBK";
const TAG_OPTIN = "emotional resonance training";
const TAG_SCALE = "emotional scale check";
const TAG_FEELING = "feeling finder";   // The Feeling Finder (2026-10-28)
const TAG_LOOM = "loom video sent";
const TAG_CANCELLED = "cancelled heart attractor program";   // added by Olly when a member leaves (2026-10-27)   // added by Olly when he sends an applicant a Loom (2026-10-27)   // The Love Scale sign-ups (2026-10-26)
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
// Two sets (Olly, 2026-10-26): the plain UTM fields hold where someone OPTED IN from; the "HA UTM" fields
// (written only by the applications workflow) hold what made them APPLY, so an application from an email
// no longer overwrites the Instagram opt-in.
async function utmFieldIds(env) {
  const data = await ghl(env, "/locations/" + LOCATION_ID + "/customFields?model=contact");
  const ids = {}, ha = {};
  (data.customFields || []).forEach(function (f) {
    const name = String(f.name || "").toLowerCase().trim();
    const key = String(f.fieldKey || "").toLowerCase();
    const isHa = name.indexOf("ha utm ") === 0 || key.indexOf("ha_utm_") !== -1;
    ["source", "medium", "campaign", "content"].forEach(function (k) {
      if (isHa) { if (name === "ha utm " + k || key.endsWith("ha_utm_" + k)) ha[k] = ha[k] || f.id; }
      else if (name === "utm " + k || key.endsWith("utm_" + k)) ids[k] = ids[k] || f.id;
    });
  });
  // the two date fields the "Loom sent date" / "Joined date" workflows fill in
  const dates = {};
  (data.customFields || []).forEach(function (f) {
    const name = String(f.name || "").toLowerCase().trim();
    if (name === "loom sent date") dates.loom = f.id;
    if (name === "joined date") dates.joined = f.id;
    if (name === "cancelled date") dates.cancelled = f.id;
    if (name === "ha plan") dates.plan = f.id;
  });
  return { ids, ha, dates };
}

// a date custom field can come back as epoch ms or as text; returns YYYY-MM-DD or ""
function dateValue(c, id) {
  if (!id) return "";
  const f = (c.customFields || c.customField || []).find(function (x) { return x.id === id; });
  const v = f ? (f.value != null ? f.value : f.field_value) : null;
  if (v == null || v === "") return "";
  if (/^[0-9]{10,13}$/.test(String(v))) return new Date(Number(v) < 1e12 ? Number(v) * 1000 : Number(v)).toISOString().slice(0, 10);
  const d = new Date(v);
  return isNaN(d) ? String(v).slice(0, 10) : d.toISOString().slice(0, 10);
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
    const { ids, ha, dates } = await utmFieldIds(env);
    const [optins, applied, scale, feeling, loom, joined] = await Promise.all([contactsWithTag(env, TAG_OPTIN), contactsWithTag(env, TAG_APPLIED), contactsWithTag(env, TAG_SCALE), contactsWithTag(env, TAG_FEELING), contactsWithTag(env, TAG_LOOM), contactsWithTag(env, TAG_JOINED)]);

    const byId = {};
    optins.concat(applied, scale, feeling, loom, joined).forEach(function (c) { byId[c.id] = c; });

    const groups = {};
    function bump(c, set, what, when) {
      const d = when || String(c.dateAdded || "").slice(0, 10);
      const row = {
        month: d.slice(0, 7),
        day: d,
        source: fieldValue(c, set.source),
        medium: fieldValue(c, set.medium),
        campaign: fieldValue(c, set.campaign),
        content: fieldValue(c, set.content),
      };
      const k = [row.day, row.source, row.medium, row.campaign, row.content].join("|");
      if (!groups[k]) groups[k] = Object.assign(row, { optins: 0, applied: 0, joined: 0, scale: 0, feeling: 0, loom: 0 });
      groups[k][what]++;
    }
    Object.values(byId).forEach(function (c) {
      if (hasTag(c, TAG_OPTIN)) bump(c, ids, "optins");
      if (hasTag(c, TAG_SCALE)) bump(c, ids, "scale");
      if (hasTag(c, TAG_FEELING)) bump(c, ids, "feeling");
      if (hasTag(c, TAG_APPLIED)) {
        // applications count where the application came from; older applicants (before the HA fields) fall back to the opt-in UTMs
        const appliedSet = (ha.source && fieldValue(c, ha.source)) ? ha : ids;
        bump(c, appliedSet, "applied");
      }
      // Loom videos and sales: credited to where they applied from (HA fields), else where they opted in;
      // dated by the Loom Sent Date / Joined Date fields when the workflows have filled them in
      const saleSet = (ha.source && fieldValue(c, ha.source)) ? ha : ids;
      if (hasTag(c, TAG_LOOM)) bump(c, saleSet, "loom", dateValue(c, dates.loom));
      // free clients (HA Plan "Free (testimonial)", 2026-10-27) aren't sales
      const isFree = fieldValue(c, dates.plan).indexOf("free") !== -1;
      if (hasTag(c, TAG_JOINED) && !isFree) bump(c, saleSet, "joined", dateValue(c, dates.joined));
    });

    // Members, anonymised: plan + dates + where they applied from. The Hub works out cash, MRR and churn from these.
    const members = joined.map(function (c) {
      const set = (ha.source && fieldValue(c, ha.source)) ? ha : ids;
      const plan = fieldValue(c, dates.plan);
      return {
        plan: plan.indexOf("free") !== -1 ? "free" : plan.indexOf("annual") !== -1 ? "annual" : plan.indexOf("monthly") !== -1 ? "monthly" : "",
        joined: dateValue(c, dates.joined) || String(c.dateAdded || "").slice(0, 10),
        cancelled: hasTag(c, TAG_CANCELLED) ? (dateValue(c, dates.cancelled) || new Date().toISOString().slice(0, 10)) : "",
        source: fieldValue(c, set.source), medium: fieldValue(c, set.medium), content: fieldValue(c, set.content),
      };
    });

    // Email list size: everyone on the daily list who hasn't unsubscribed.
    const lists = await Promise.all(TAGS_EMAIL.map(function (t) { return contactsWithTag(env, t); }));
    const subs = {};
    lists.forEach(function (l) { l.forEach(function (c) { if (subscribed(c)) subs[c.id] = c; }); });

    return json({
      ok: true,
      fetchedAt: new Date().toISOString(),
      utmFieldsFound: Object.keys(ids),
      haUtmFieldsFound: Object.keys(ha),
      dateFieldsFound: Object.keys(dates),
      rows: Object.values(groups),
      members: members,
      emailList: Object.keys(subs).length,
    });
  } catch (e) {
    return json({ ok: false, error: String(e && e.message || e) }, 502);
  }
}
