import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DB_ID = "36e30e58-6a0d-8192-bda3-fbf027c8f644";
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

// Rename the database column
const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({ properties: { "Website Visits": { name: "Website Visits (Last 30 Days)" } } }),
});
const data = await res.json();
console.log(res.ok ? "✅ Database column renamed" : `❌ ${JSON.stringify(data)}`);
