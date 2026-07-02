import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DB_ID = env["NOTION_INSTAGRAM_DB_ID"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({ properties: {
    "#Likes": null,        // remove wrong duplicate
    "Date":   { date: {} }, // add back missing Date
  }}),
});
console.log(res.ok ? "✅ Fixed — #Likes removed, Date added back" : `❌ ${JSON.stringify(await res.json())}`);
