import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DB_ID = env["NOTION_YOUTUBE_DB_ID"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({
    properties: {
      // Rename existing
      "Watch Hours":        { name: "Watch Time (Hours)" },
      "Videos Published":   { name: "Videos Published" },
      // Add new
      "New Subscribers":    { number: { format: "number" } },
      "CTR (%)":            { number: { format: "percent" } },
      "Audience Retention (%)": { number: { format: "percent" } },
      "Top Video":          { rich_text: {} },
    },
  }),
});
const data = await res.json();
console.log(res.ok ? "✅ YouTube database updated" : `❌ ${JSON.stringify(data)}`);
