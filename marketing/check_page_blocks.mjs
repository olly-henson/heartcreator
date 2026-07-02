import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DASHBOARD_PAGE_ID = "36e30e58-6a0d-81c8-8c70-dfa1fc988004";

const res = await fetch(`https://api.notion.com/v1/blocks/${DASHBOARD_PAGE_ID}/children`, {
  headers: { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28" },
});
const data = await res.json();
data.results.forEach((b, i) => {
  const text = b[b.type]?.rich_text?.[0]?.plain_text ?? b[b.type]?.title ?? "";
  console.log(`${i}: [${b.type}] ${text.slice(0,60)}  — ${b.id}`);
});
