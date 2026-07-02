import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

const res = await fetch(`https://api.notion.com/v1/databases/${env["NOTION_INSTAGRAM_DB_ID"]}/query`, {
  method: "POST", headers: h, body: "{}",
}).then(r => r.json());

res.results?.forEach(row => {
  const p = row.properties;
  console.log(`\n${p?.Month?.title?.[0]?.plain_text ?? "unnamed"}:`);
  console.log(`  Followers:       ${p?.["Followers"]?.number}`);
  console.log(`  Accounts reached:${p?.["Accounts reached"]?.number}`);
  console.log(`  Total views:     ${p?.["Total views"]?.number}`);
});
