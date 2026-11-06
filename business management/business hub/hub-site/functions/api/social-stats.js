// Cloudflare Pages Function: Social Planner stats for the Overview (Olly, 2026-11-06).
//
// Route: GET /api/social-stats   (behind Cloudflare Access like the rest of the Hub)
// Secret: env.GHL_WRITE_TOKEN = the 'Claude agent' Private Integration key. Needs the Social Planner accounts +
//         statistics scopes (statistics added by Olly 2026-11-06). Never put it in a file: the repo is public.
//
// GHL only gives the LAST 7 DAYS vs the 7 before, and "followers" there means NEW followers gained in those days,
// not the total follower count. YouTube isn't in GHL's stats at all (Facebook, Instagram, TikTok only).
// Each pull also saves that day's snapshot in KV (socialstats:YYYY-MM-DD) so a history builds up over time.

const API = "https://services.leadconnectorhq.com";
const LOCATION_ID = "LRqVZmxns8f3xcJLHzBK";

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
  if (!res.ok) throw new Error("GHL " + res.status + " on " + path.split("?")[0] + ": " + text.slice(0, 200));
  return text ? JSON.parse(text) : {};
}
const num = (v) => Number(v) || 0;

export async function onRequestGet({ env }) {
  if (!env.GHL_WRITE_TOKEN) return json({ ok: false, error: "The GHL_WRITE_TOKEN secret isn't set in Cloudflare." }, 500);
  try {
    const acc = await ghl(env, "GET", "/social-media-posting/" + LOCATION_ID + "/accounts");
    const ids = ((acc.results && acc.results.accounts) || []).filter((a) => !a.deleted && !a.isExpired).map((a) => a.profileId).filter(Boolean);
    if (!ids.length) return json({ ok: false, error: "No connected Social Planner accounts." }, 500);
    const r = (await ghl(env, "POST", "/social-media-posting/statistics?locationId=" + LOCATION_ID, { profileIds: ids })).results || {};
    const b = r.breakdowns || {}, pt = r.platformTotals || {};
    const plats = ["instagram", "tiktok", "facebook"];
    const per = {};
    plats.forEach((p) => {
      const e = (b.engagement && b.engagement[p]) || {};
      per[p] = {
        newFollowers: num(pt.followers && pt.followers[p] && pt.followers[p].total),
        posts: num(b.posts && b.posts.platforms && b.posts.platforms[p] && b.posts.platforms[p].value),
        reach: num(b.reach && b.reach.platforms && b.reach.platforms[p] && b.reach.platforms[p].value),
        impressions: num(b.impressions && b.impressions.platforms && b.impressions.platforms[p] && b.impressions.platforms[p].value),
        engagement: num(e.likes) + num(e.comments) + num(e.shares),
        engagementChange: num(e.change),
      };
    });
    const g = (r.demographics && r.demographics.gender && r.demographics.gender.totals) || {};
    const ages = (r.demographics && r.demographics.age && r.demographics.age.totals) || {};
    const ageTotal = Object.values(ages).reduce((s, v) => s + num(v), 0);
    const topAge = Object.keys(ages).sort((a, c) => num(ages[c]) - num(ages[a]))[0] || "";
    const out = {
      ok: true,
      fetchedAt: new Date().toISOString(),
      newFollowers: plats.reduce((s, p) => s + per[p].newFollowers, 0),
      posts: { total: num(b.posts && b.posts.total), change: num(b.posts && b.posts.totalChange) },
      reach: { total: num(b.reach && b.reach.total), change: num(b.reach && b.reach.totalChange) },
      impressions: { total: num(b.impressions && b.impressions.total), change: num(b.impressions && b.impressions.totalChange) },
      engagement: plats.reduce((s, p) => s + per[p].engagement, 0),
      platforms: per,
      women: num(g.female && g.female.percentage),
      topAge: topAge, topAgeShare: ageTotal ? num(ages[topAge]) / ageTotal * 100 : 0,
    };
    if (env.HUB_KV) {
      try { await env.HUB_KV.put("socialstats:" + out.fetchedAt.slice(0, 10), JSON.stringify(out)); } catch (e) {}
    }
    return json(out);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 502);
  }
}
