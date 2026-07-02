import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

const res = await fetch(`https://api.notion.com/v1/databases/${env["NOTION_YOUTUBE_DB_ID"]}/query`, {
  method: "POST", headers: h,
  body: JSON.stringify({ filter: { property: "Period", title: { equals: "April 2026" } } }),
}).then(r => r.json());

const pageId = res.results?.[0]?.id;
await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({ properties: {
    "Subscribers":                 { number: 784 },
    "New Subscribers":             { number: 41 },
    "Monthly Views":               { number: 3500 },
    "Watch Time (Hours)":          { number: 265 },
    "CTR (%)":                     { number: 0.038 },
    "Audience Retention (%)":      { number: 0.38 },
    "Videos Published This Month": { number: 6 },
  }}),
});
console.log("✅ April baseline set — now May will show real % growth vs April");
