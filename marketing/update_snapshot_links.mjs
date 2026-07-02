import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

const pageUrl = id => `https://www.notion.so/${id.replace(/-/g, "")}`;

// [callout block ID, label, sub-page ID, number value]
const cards = [
  [env["SNAPSHOT_YOUTUBE_ID"],   "🎬  YouTube Growth",              "36e30e58-6a0d-819d-9858-cbac0325ce68", "—"],
  [env["SNAPSHOT_INSTAGRAM_ID"], "📸  Instagram Growth",            "36e30e58-6a0d-81d1-b627-d2089f296fbc", "—"],
  [env["SNAPSHOT_EMAIL_ID"],     "📧  Email Subscribers",           "36e30e58-6a0d-812d-b438-e7456501e014", "13"],
  [env["SNAPSHOT_SKOOL_ID"],     "🏫  Skool Members",               "36e30e58-6a0d-8182-82ad-e95e3be3c6c6", "14"],
  [env["SNAPSHOT_CUSTOMERS_ID"], "🤝  Customers",                   "36e30e58-6a0d-81ec-b7c3-e4ce9ce53cae", "1"],
  [env["SNAPSHOT_WEBSITE_ID"],   "🌐  Website Visits (Last 30 Days)","36e30e58-6a0d-81f5-bd97-f8242b7358a3", "0"],
  [env["SNAPSHOT_REVENUE_ID"],   "💰  Revenue",                     "36e30e58-6a0d-8104-89b8-c25d8fc20ce7", "—"],
];

for (const [blockId, label, pageId, value] of cards) {
  await fetch(`https://api.notion.com/v1/blocks/${blockId}`, {
    method: "PATCH",
    headers: h,
    body: JSON.stringify({
      callout: {
        rich_text: [
          { type: "text", text: { content: label, link: { url: pageUrl(pageId) } }, annotations: { bold: false } },
          { type: "text", text: { content: `\n${value}` }, annotations: { bold: true } },
        ],
      },
    }),
  });
  console.log(`✅ ${label}`);
}
