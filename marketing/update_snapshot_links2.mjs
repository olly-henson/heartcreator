import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

const dbUrl = id => `https://app.notion.com/p/${id.replace(/-/g, "")}`;

const cards = [
  [env["SNAPSHOT_YOUTUBE_ID"],   "🎬  YouTube Growth",               dbUrl(env["NOTION_YOUTUBE_DB_ID"]),             "—",  "brown_background"],
  [env["SNAPSHOT_INSTAGRAM_ID"], "📸  Instagram Growth",             dbUrl(env["NOTION_INSTAGRAM_DB_ID"]),           "—",  "pink_background"],
  [env["SNAPSHOT_EMAIL_ID"],     "📧  Email Subscribers",            dbUrl(env["NOTION_EMAIL_SUBSCRIBERS_DB_ID"]),   "13", "blue_background"],
  [env["SNAPSHOT_SKOOL_ID"],     "🏫  Skool Members",                dbUrl(env["NOTION_SKOOL_MEMBERS_DB_ID"]),       "14", "green_background"],
  [env["SNAPSHOT_CUSTOMERS_ID"], "🤝  Customers",                    dbUrl(env["NOTION_CUSTOMERS_DB_ID"]),           "1",  "purple_background"],
  [env["SNAPSHOT_WEBSITE_ID"],   "🌐  Website Visits (Last 30 Days)",dbUrl(env["NOTION_WEBSITE_DB_ID"]),             "0",  "orange_background"],
  [env["SNAPSHOT_REVENUE_ID"],   "💰  Revenue",                      dbUrl(env["NOTION_FINANCIALS_DB_ID"]),          "—",  "yellow_background"],
];

for (const [blockId, label, url, value, color] of cards) {
  const res = await fetch(`https://api.notion.com/v1/blocks/${blockId}`, {
    method: "PATCH",
    headers: h,
    body: JSON.stringify({
      callout: {
        color,
        rich_text: [
          { type: "text", text: { content: label, link: { url } }, annotations: { bold: true, color: "default" } },
          { type: "text", text: { content: `\n${value}` }, annotations: { bold: true, color: "default" } },
        ],
      },
    }),
  });
  console.log(res.ok ? `✅ ${label}` : `❌ ${label}`);
}
