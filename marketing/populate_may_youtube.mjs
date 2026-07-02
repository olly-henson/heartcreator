import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

const res = await fetch(`https://api.notion.com/v1/databases/${env["NOTION_YOUTUBE_DB_ID"]}/query`, {
  method: "POST", headers: h,
  body: JSON.stringify({ filter: { property: "Period", title: { equals: "May 2026" } } }),
}).then(r => r.json());

const pageId = res.results?.[0]?.id;
if (!pageId) { console.error("❌ May 2026 row not found"); process.exit(1); }

await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({ properties: {
    "Subscribers":                 { number: 847 },
    "New Subscribers":             { number: 63 },
    "Monthly Views":               { number: 4200 },
    "Watch Time (Hours)":          { number: 312 },
    "CTR (%)":                     { number: 0.048 },
    "Audience Retention (%)":      { number: 0.42 },
    "Videos Published This Month": { number: 8 },
  }}),
}).then(r => r.json());

console.log("✅ May 2026 YouTube numbers added");
console.log("   Subscribers: 847 (April: 0 → good growth test)");
