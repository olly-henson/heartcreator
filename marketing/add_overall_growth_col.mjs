import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

const res = await fetch(`https://api.notion.com/v1/databases/${env["NOTION_YOUTUBE_DB_ID"]}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({
    properties: {
      "Overall Growth (%)": { number: { format: "percent" } },
    },
  }),
});
console.log(res.ok ? "✅ Overall Growth (%) column added" : `❌ ${JSON.stringify(await res.json())}`);
