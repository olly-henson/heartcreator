import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));

const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: env["GA_REFRESH_TOKEN"], client_id: env["GA_CLIENT_ID"], client_secret: env["GA_CLIENT_SECRET"] }),
});
const { access_token } = await tokenRes.json();

// Try impressions and CTR via the Analytics API
const res = await fetch(
  `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${env["YOUTUBE_CHANNEL_ID"]}&startDate=2026-05-01&endDate=2026-05-28&metrics=impressions,impressionsClickThroughRate`,
  { headers: { Authorization: `Bearer ${access_token}` } }
);
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
