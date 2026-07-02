import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DB_ID = env["NOTION_WEBSITE_DB_ID"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Add growth columns and rename Period to Month
const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({
    properties: {
      "Period":              { name: "Month" },
      "Total Visits":        { number: { format: "number" } },
      "Overall Growth (%)":  { number: { format: "percent" } },
      "Year Growth (%)":     { number: { format: "percent" } },
    },
  }),
});
console.log(res.ok ? "✅ Website database updated" : `❌ ${JSON.stringify(await res.json())}`);

// Seed April baseline with 0
await sleep(1000);
const search = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
  method: "POST", headers: h,
  body: JSON.stringify({ filter: { property: "Month", title: { equals: "April 2026" } } }),
}).then(r => r.json());

if (search.results?.[0]) {
  await fetch(`https://api.notion.com/v1/pages/${search.results[0].id}`, {
    method: "PATCH", headers: h,
    body: JSON.stringify({ properties: { "Total Visits": { number: 0 } } }),
  });
  console.log("✅ April baseline set to 0");
}
