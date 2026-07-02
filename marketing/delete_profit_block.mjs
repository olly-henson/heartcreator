import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const h = { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28" };
const res = await fetch(`https://api.notion.com/v1/blocks/${env["SNAPSHOT_PROFIT_ID"]}`, { method: "DELETE", headers: h });
console.log(res.ok ? "✅ Profit block deleted" : `❌ ${JSON.stringify(await res.json())}`);
