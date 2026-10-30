// Cloudflare Pages Function — applicants for the Looms tab (Olly, 2026-10-28).
//
// Route: /api/applicants   (GET, from the Looms tab's Refresh button)
// Secret: env.GHL_TOKEN — the same GHL Private Integration key as ghl-sources.js
//         (View Contacts + View Custom Fields). Never put it in a file: the repo is public.
//
// Returns every contact tagged "heart attractor applicant", newest first, with their
// application answers (custom fields starting "HA ") and Feeling Finder results
// (custom fields starting "FF "), so Olly can record a Loom over a mind map of them.
// This DOES return names and answers, so it must stay behind Cloudflare Access
// like the rest of the zone (only /api/track is exempt). Nothing is stored here.

const API = "https://services.leadconnectorhq.com";
const LOCATION_ID = "LRqVZmxns8f3xcJLHzBK";
const TAG_APPLIED = "heart attractor applicant";
const TAG_LOOM = "loom video sent";
const TAG_JOINED = "joined heart attractor program";

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

function hasTag(c, tag) {
  return (c.tags || []).some(function (t) { return String(t).toLowerCase().trim() === tag; });
}

// Same approach as ghl-sources.js: search by tag, else page through everyone and filter here.
async function applicants(env) {
  const out = [];
  try {
    for (let page = 1; page <= 50; page++) {
      const data = await ghl(env, "/contacts/search", {
        method: "POST",
        body: JSON.stringify({ locationId: LOCATION_ID, page, pageLimit: 100, filters: [{ field: "tags", operator: "eq", value: TAG_APPLIED }] }),
      });
      const batch = data.contacts || [];
      out.push(...batch);
      if (batch.length < 100) break;
    }
    return out;
  } catch (e) {
    const all = [];
    let after = "";
    for (let i = 0; i < 100; i++) {
      const data = await ghl(env, "/contacts/?locationId=" + LOCATION_ID + "&limit=100" + after);
      const batch = data.contacts || [];
      all.push(...batch);
      const meta = data.meta || {};
      if (batch.length < 100 || !meta.startAfterId) break;
      after = "&startAfterId=" + encodeURIComponent(meta.startAfterId) + "&startAfter=" + encodeURIComponent(meta.startAfter);
    }
    return all.filter(function (c) { return hasTag(c, TAG_APPLIED); });
  }
}

export async function onRequestGet({ env }) {
  if (!env.GHL_TOKEN) return json({ ok: false, error: "GHL_TOKEN secret is missing in Cloudflare" }, 500);
  try {
    const cf = await ghl(env, "/locations/" + LOCATION_ID + "/customFields?model=contact");
    const names = {};
    (cf.customFields || []).forEach(function (f) {
      const n = String(f.name || "").trim();
      if (/^(HA|FF|Scale) /i.test(n)) names[f.id] = n;
    });
    const list = (await applicants(env)).map(function (c) {
      const fields = {};
      (c.customFields || c.customField || []).forEach(function (x) {
        const n = names[x.id]; if (!n) return;
        const v = x.value != null ? x.value : x.field_value;
        if (v != null && String(v).trim() !== "") fields[n] = Array.isArray(v) ? v.join(", ") : String(v).trim();
      });
      return {
        id: c.id,
        firstName: c.firstName || c.firstNameRaw || "",
        lastName: c.lastName || c.lastNameRaw || "",
        email: c.email || "",
        phone: c.phone || "",
        city: c.city || "",
        country: c.country || "",
        dateAdded: c.dateAdded || "",
        loomSent: hasTag(c, TAG_LOOM),
        joined: hasTag(c, TAG_JOINED),
        fields,
      };
    }).sort(function (a, b) { return String(b.dateAdded).localeCompare(String(a.dateAdded)); });
    return json({ ok: true, fetchedAt: new Date().toISOString(), applicants: list });
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 502);
  }
}
