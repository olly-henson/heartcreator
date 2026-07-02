import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DB_ID = env["NOTION_INSTAGRAM_DB_ID"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

// Update database with full column set
const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({
    properties: {
      // Core metrics
      "New Followers":          { number: { format: "number" } },
      "Avg Likes":              { number: { format: "number" } },
      "Avg Comments":           { number: { format: "number" } },
      "Saves":                  { number: { format: "number" } },
      "Accounts Reached":       { number: { format: "number" } },
      // Growth %
      "Follower Growth (%)":    { number: { format: "percent" } },
      "Reach Growth (%)":       { number: { format: "percent" } },
      "Overall Growth (%)":     { number: { format: "percent" } },
      "Year Growth (%)":        { number: { format: "percent" } },
      // Top content
      "Top Post":               { rich_text: {} },
    },
  }),
});
console.log(res.ok ? "✅ Instagram database updated" : `❌ ${JSON.stringify(await res.json())}`);

// Add April and May rows if not already there
const notionHeaders = h;
for (const [period, date, subs] of [["April 2026", "2026-04-01", null], ["May 2026", "2026-05-01", null]]) {
  const existing = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
    method: "POST", headers: notionHeaders,
    body: JSON.stringify({ filter: { property: "Period", title: { equals: period } } }),
  }).then(r => r.json());

  if (existing.results?.length === 0) {
    await fetch("https://api.notion.com/v1/pages", {
      method: "POST", headers: notionHeaders,
      body: JSON.stringify({ parent: { database_id: DB_ID }, properties: { "Period": { title: [{ text: { content: period } }] }, "Date": { date: { start: date } } } }),
    });
    console.log(`✅ ${period} row created`);
  } else {
    console.log(`✅ ${period} row already exists`);
  }
}
