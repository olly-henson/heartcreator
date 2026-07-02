import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const h = { Authorization: `Bearer ${env["NOTION_API_TOKEN"]}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

const res = await fetch(`https://api.notion.com/v1/databases/${env["NOTION_YOUTUBE_DB_ID"]}/query`, {
  method: "POST", headers: h,
  body: JSON.stringify({ filter: { property: "Period", title: { equals: "April 2026" } } }),
}).then(r => r.json());

const pageId = res.results?.[0]?.id;
await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({ properties: { "Subscribers": { number: 27 } } }),
});
console.log("✅ April subscribers set to 27");
