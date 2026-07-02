import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve("C:/Users/Olly/AI OS/marketing/.env");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => l.split("=").map(p => p.trim()))
);

const NOTION_TOKEN = env["NOTION_API_TOKEN"];
const YOUTUBE_API_KEY = env["YOUTUBE_API_KEY"];
const YOUTUBE_CHANNEL_ID = env["YOUTUBE_CHANNEL_ID"];
const NOTION_YOUTUBE_DB_ID = env["NOTION_YOUTUBE_DB_ID"];

const notionHeaders = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
};

// Refresh OAuth token
const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: env["GA_REFRESH_TOKEN"],
    client_id: env["GA_CLIENT_ID"],
    client_secret: env["GA_CLIENT_SECRET"],
  }),
});
const { access_token } = await tokenRes.json();

// Fetch May 2026 analytics
const analyticsRes = await fetch(
  `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${YOUTUBE_CHANNEL_ID}&startDate=2026-05-01&endDate=2026-05-31&metrics=views,estimatedMinutesWatched,averageViewPercentage,averageViewDuration,subscribersGained,subscribersLost`,
  { headers: { Authorization: `Bearer ${access_token}` } }
);
const analyticsData = await analyticsRes.json();
const row = analyticsData?.rows?.[0];

if (!row) {
  console.error("No analytics data returned:", JSON.stringify(analyticsData));
  process.exit(1);
}

const views        = row[0];
const watchTimeMins = row[1];
const retention    = row[2]; // averageViewPercentage (0–100)
const newSubs      = row[4];

console.log(`May 2026 YouTube Analytics:`);
console.log(`  Views:             ${views}`);
console.log(`  Watch Time (hrs):  ${Math.round(watchTimeMins / 60 * 10) / 10}`);
console.log(`  Avg Retention:     ${retention.toFixed(2)}%`);
console.log(`  New Subscribers:   ${newSubs}`);

// Find May row in Notion
const searchRes = await fetch(`https://api.notion.com/v1/databases/${NOTION_YOUTUBE_DB_ID}/query`, {
  method: "POST",
  headers: notionHeaders,
  body: JSON.stringify({ filter: { property: "Period", title: { equals: "May 2026" } } }),
}).then(r => r.json());

const mayPage = searchRes.results?.[0];
if (!mayPage) {
  console.error("Could not find May 2026 row in Notion YouTube DB.");
  process.exit(1);
}

// Update Notion with fresh figures
const props = {
  "Monthly Views":          { number: views },
  "Watch Time (Hours)":     { number: Math.round(watchTimeMins / 60 * 10) / 10 },
  "Audience Retention (%)": { number: retention / 100 },
  "New Subscribers":        { number: newSubs },
};

await fetch(`https://api.notion.com/v1/pages/${mayPage.id}`, {
  method: "PATCH",
  headers: notionHeaders,
  body: JSON.stringify({ properties: props }),
});

console.log(`\n✅ May 2026 row updated in Notion.`);
