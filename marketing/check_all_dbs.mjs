import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

const dbs = {
  "Main Dashboard":    "36e30e58-6a0d-8192-bda3-fbf027c8f644",
  "YouTube":           env["NOTION_YOUTUBE_DB_ID"],
  "Instagram":         env["NOTION_INSTAGRAM_DB_ID"],
  "Email":             env["NOTION_EMAIL_SUBSCRIBERS_DB_ID"],
  "Skool":             env["NOTION_SKOOL_MEMBERS_DB_ID"],
  "Customers/Sales":   env["NOTION_CUSTOMERS_DB_ID"],
  "Website":           env["NOTION_WEBSITE_DB_ID"],
  "Financials":        env["NOTION_FINANCIALS_DB_ID"],
};

for (const [name, id] of Object.entries(dbs)) {
  const res = await fetch(`https://api.notion.com/v1/databases/${id}`, { headers: h }).then(r => r.json());
  const cols = Object.keys(res.properties);
  const titleCol = Object.entries(res.properties).find(([,v]) => v.type === "title")?.[0];
  const hasDate = cols.includes("Date");
  const status = `title="${titleCol}" | Date=${hasDate ? "✅" : "❌ MISSING"}`;
  console.log(`${name.padEnd(18)}: ${status}`);
}
