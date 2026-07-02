import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DB_ID = env["NOTION_INSTAGRAM_DB_ID"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({
    properties: {
      // Rename existing to match new naming
      "Avg Reach":       { name: "Accounts Reached" },
      "Avg Likes":       { name: "Likes" },
      "Avg Comments":    { name: "Comments" },
      "Link Clicks":     { name: "External Link Taps" },
      "Posts Published": { name: "Content You Shared" },
      "Top Post":        { name: "Best Performing Reel" },
      // Add new columns
      "Total Views":     { number: { format: "number" } },
      "Interactions":    { number: { format: "number" } },
      "Shares":          { number: { format: "number" } },
    },
  }),
});
const data = await res.json();
console.log(res.ok ? "✅ Instagram columns updated" : `❌ ${JSON.stringify(data)}`);
