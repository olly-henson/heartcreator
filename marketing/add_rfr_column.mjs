import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DB_ID = env["NOTION_CUSTOMERS_DB_ID"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

// Check current columns
const existing = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, { headers: h }).then(r => r.json());
console.log("Current columns:", Object.keys(existing.properties));

// Add the new column
const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({
    properties: {
      "Regulate for Relief % Improvement": { number: { format: "percent" } },
    },
  }),
});
console.log(res.ok ? "✅ Column added" : `❌ ${JSON.stringify(await res.json())}`);
