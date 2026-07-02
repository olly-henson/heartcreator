import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));

const YOUTUBE_API_KEY = env["YOUTUBE_API_KEY"];
const YOUTUBE_CHANNEL_ID = env["YOUTUBE_CHANNEL_ID"];
const notionHeaders = { Authorization: `Bearer ${env["NOTION_API_TOKEN"]}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

// Refresh token
const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: env["GA_REFRESH_TOKEN"], client_id: env["GA_CLIENT_ID"], client_secret: env["GA_CLIENT_SECRET"] }),
});
const { access_token } = await tokenRes.json();

// Pull April analytics
const analyticsRes = await fetch(
  `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${YOUTUBE_CHANNEL_ID}&startDate=2026-04-01&endDate=2026-04-30&metrics=views,estimatedMinutesWatched,averageViewPercentage`,
  { headers: { Authorization: `Bearer ${access_token}` } }
);
const analyticsData = await analyticsRes.json();
console.log("April Analytics:", JSON.stringify(analyticsData, null, 2));
const row = analyticsData?.rows?.[0];

// Count videos published in April
const uploadsRes = await fetch(
  `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${YOUTUBE_CHANNEL_ID}&type=video&publishedAfter=2026-04-01T00:00:00Z&publishedBefore=2026-04-30T23:59:59Z&maxResults=50&key=${YOUTUBE_API_KEY}`
);
const uploadsData = await uploadsRes.json();
const videosInApril = uploadsData?.pageInfo?.totalResults ?? 0;

if (!row) { console.log("No April data available from YouTube Analytics yet."); process.exit(0); }

const aprilProps = {
  "Monthly Views":               { number: row[0] },
  "Watch Time (Hours)":          { number: Math.round(row[1] / 60) },
  "Audience Retention (%)":      { number: row[2] / 100 },
  "Videos Published This Month": { number: videosInApril },
};
console.log("\nApril data:", aprilProps);

// Find April row in YouTube DB
const searchRes = await fetch(`https://api.notion.com/v1/databases/${env["NOTION_YOUTUBE_DB_ID"]}/query`, {
  method: "POST", headers: notionHeaders,
  body: JSON.stringify({ filter: { property: "Period", title: { equals: "April 2026" } } }),
}).then(r => r.json());

const aprilPageId = searchRes.results?.[0]?.id;
if (!aprilPageId) { console.log("April row not found in Notion"); process.exit(1); }

await fetch(`https://api.notion.com/v1/pages/${aprilPageId}`, {
  method: "PATCH", headers: notionHeaders,
  body: JSON.stringify({ properties: aprilProps }),
});
console.log("✅ April YouTube data updated in Notion");
