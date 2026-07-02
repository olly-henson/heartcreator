import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));

const YOUTUBE_API_KEY = env["YOUTUBE_API_KEY"];
const YOUTUBE_CHANNEL_ID = env["YOUTUBE_CHANNEL_ID"];
const notionHeaders = { Authorization: `Bearer ${env["NOTION_API_TOKEN"]}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

// Refresh OAuth token
const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: env["GA_REFRESH_TOKEN"], client_id: env["GA_CLIENT_ID"], client_secret: env["GA_CLIENT_SECRET"] }),
});
const { access_token } = await tokenRes.json();

async function fetchTopVideo(startDate, endDate) {
  const res = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${YOUTUBE_CHANNEL_ID}&startDate=${startDate}&endDate=${endDate}&metrics=views&dimensions=video&sort=-views&maxResults=1`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  );
  const data = await res.json();
  if (data?.error) { console.log("  Top video error:", data.error.message); return null; }
  const videoId = data?.rows?.[0]?.[0];
  if (!videoId) { console.log("  Top video: no data"); return null; }

  const videoRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
  );
  const videoData = await videoRes.json();
  const title = videoData?.items?.[0]?.snippet?.title ?? "Unknown";
  const views = data.rows[0][1];
  console.log(`  Top video: "${title}" (${views} views)`);
  return `${title} — https://www.youtube.com/watch?v=${videoId}`;
}

async function fetchAnalytics(startDate, endDate) {
  const res = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${YOUTUBE_CHANNEL_ID}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,averageViewPercentage,averageViewDuration,subscribersGained,subscribersLost`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  );
  const data = await res.json();
  const row = data?.rows?.[0];
  if (!row) { console.log(`No data for ${startDate} → ${endDate}`); return null; }
  console.log(`Analytics ${startDate} → ${endDate}: views=${row[0]}, watchMins=${row[1]}, retention=${row[2].toFixed(1)}%, newSubs=${row[4]}`);
  return {
    views:          row[0],
    watchTimeHours: Math.round(row[1] / 60),
    retention:      row[2] / 100,
    newSubscribers: row[4],
    lostSubs:       row[5],
  };
}

async function countVideos(after, before) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${YOUTUBE_CHANNEL_ID}&type=video&publishedAfter=${after}&publishedBefore=${before}&maxResults=50&key=${YOUTUBE_API_KEY}`
  );
  const data = await res.json();
  return data?.pageInfo?.totalResults ?? 0;
}

async function updateNotionRow(period, props) {
  const searchRes = await fetch(`https://api.notion.com/v1/databases/${env["NOTION_YOUTUBE_DB_ID"]}/query`, {
    method: "POST", headers: notionHeaders,
    body: JSON.stringify({ filter: { property: "Period", title: { equals: period } } }),
  }).then(r => r.json());
  const pageId = searchRes.results?.[0]?.id;
  if (!pageId) { console.log(`❌ ${period} row not found`); return; }
  await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH", headers: notionHeaders,
    body: JSON.stringify({ properties: props }),
  });
  console.log(`✅ ${period} updated`);
}

// ── April ─────────────────────────────────────────────────────────────────
console.log("\n--- APRIL 2026 ---");
const april = await fetchAnalytics("2026-04-01", "2026-04-30");
const aprilVideos = await countVideos("2026-04-01T00:00:00Z", "2026-04-30T23:59:59Z");
const aprilTopVideo = await fetchTopVideo("2026-04-01", "2026-04-30");

if (april) {
  await updateNotionRow("April 2026", {
    "Subscribers":                 { number: 27 },
    "New Subscribers":             { number: april.newSubscribers },
    "Monthly Views":               { number: april.views },
    "Watch Time (Hours)":          { number: april.watchTimeHours },
    "Audience Retention (%)":      { number: april.retention },
    "Videos Published This Month": { number: aprilVideos },
    ...(aprilTopVideo ? { "Top Video": { rich_text: [{ text: { content: aprilTopVideo } }] } } : {}),
  });
}

// ── May ───────────────────────────────────────────────────────────────────
console.log("\n--- MAY 2026 ---");
const may = await fetchAnalytics("2026-05-01", "2026-05-28");
const mayVideos = await countVideos("2026-05-01T00:00:00Z", "2026-05-28T23:59:59Z");
const mayTopVideo = await fetchTopVideo("2026-05-01", "2026-05-28");

if (may) {
  await updateNotionRow("May 2026", {
    "Subscribers":                 { number: 30 },
    "New Subscribers":             { number: may.newSubscribers },
    "Monthly Views":               { number: may.views },
    "Watch Time (Hours)":          { number: may.watchTimeHours },
    "Audience Retention (%)":      { number: may.retention },
    "Videos Published This Month": { number: mayVideos },
    ...(mayTopVideo ? { "Top Video": { rich_text: [{ text: { content: mayTopVideo } }] } } : {}),
  });
}

console.log("\nDone. Run fetch_metrics.mjs to recalculate growth %.");
