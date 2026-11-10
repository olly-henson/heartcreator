// Best performing Reels from GHL's Social Planner (Olly, 2026-11-10: "find the best performing hooks in the last week").
// Usage: node tools/top-reels.mjs [days=7] [count=15]   (reads marketing/.env: GHL_PIT_TOKEN, GHL_LOCATION_ID)
// GHL only gives likes, comments and shares per post (no views/reach). One Reel goes out to Instagram, Facebook and
// TikTok as separate posts, grouped back into one row by the video file. Hook = the caption's first line (the cover
// header Olly reads out) from whichever platform's caption has it (the Instagram caption opens with the standard
// "💜 Attract a genuine ..." line instead). LINKS=1 prints each Reel's link.
// Score = likes + 3 x comments + 3 x shares (comments are mostly keyword replies = leads; shares spread the Reel).
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(readFileSync(path.join(root, "marketing/.env"), "utf8").split("\n")
  .map((l) => l.trim()).filter((l) => l && !l.startsWith("#") && l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^["']|["']$/g, "")]));
const days = Number(process.argv[2]) || 7, count = Number(process.argv[3]) || 15;
const to = new Date(), from = new Date(Date.now() - days * 864e5);
const posts = [];
for (let skip = 0; skip < 2000; skip += 50) {
  const r = await fetch(`https://services.leadconnectorhq.com/social-media-posting/${env.GHL_LOCATION_ID}/posts/list`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.GHL_PIT_TOKEN}`, Version: "2021-07-28", "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ type: "published", skip: String(skip), limit: "50", fromDate: from.toISOString(), toDate: to.toISOString(), includeUsers: "false" }),
  });
  if (!r.ok) { console.error("GHL " + r.status + ": " + (await r.text()).slice(0, 300)); process.exit(1); }
  const page = ((await r.json()).results || {}).posts || [];
  posts.push(...page);
  if (page.length < 50) break;
}
const firstLine = (t) => String(t || "").split(/\r?\n/).map((s) => s.trim()).find(Boolean) || "";
const by = {};
for (const p of posts) {
  if (p.deleted) continue;
  const k = (p.media && p.media[0] && p.media[0].url) || p.parentPostId || p._id; // same video file = same Reel
  const g = by[k] || (by[k] = { date: p.publishedAt || p.displayDate, hook: "", plat: {}, links: {} });
  const i = p.insights || {};
  g.plat[p.platform] = { like: +i.like || 0, comment: +i.comment || 0, share: +i.share || 0 };
  g.links[p.platform] = p.previewLink || "";
  const first = firstLine(p.summary);
  if (first && !first.startsWith("💜") && !g.hook) g.hook = first;
}
const rows = Object.values(by).map((g) => {
  const t = { like: 0, comment: 0, share: 0 };
  for (const v of Object.values(g.plat)) { t.like += v.like; t.comment += v.comment; t.share += v.share; }
  return { ...g, hook: g.hook || "(no hook line in the caption)", t, score: t.like + 3 * t.comment + 3 * t.share };
}).sort((a, b) => b.score - a.score);
const ig = (g) => g.plat.instagram ? `${g.plat.instagram.like}/${g.plat.instagram.comment}/${g.plat.instagram.share}` : "-";
console.log(`${rows.length} Reels published in the last ${days} days (${posts.length} posts across platforms). Likes/comments/shares:\n`);
rows.slice(0, count).forEach((g, n) => {
  console.log(`${String(n + 1).padStart(2)}. score ${g.score}  all ${g.t.like}/${g.t.comment}/${g.t.share}  IG ${ig(g)}  ${String(g.date).slice(0, 10)}  ${g.hook}`);
});
if (process.env.LINKS) rows.slice(0, count).forEach((g, n) => console.log(n + 1, g.links.instagram || g.links.facebook || g.links.tiktok));
