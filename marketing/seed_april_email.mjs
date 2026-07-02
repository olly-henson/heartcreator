import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DB_ID = env["NOTION_EMAIL_SUBSCRIBERS_DB_ID"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
  method: "POST", headers: h,
  body: JSON.stringify({ filter: { property: "Month", title: { equals: "April 2026" } } }),
}).then(r => r.json());

const pageId = res.results?.[0]?.id;
await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({ properties: { "Total Subscribers": { number: 0 } } }),
});
console.log("✅ April email baseline set to 0 — update with real number if you know it");
