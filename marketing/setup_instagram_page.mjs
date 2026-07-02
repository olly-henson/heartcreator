import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const PAGE_ID = "36e30e58-6a0d-81d1-b627-d2089f296fbc"; // Instagram sub-page
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

await fetch(`https://api.notion.com/v1/blocks/${PAGE_ID}/children`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({ children: [
    { type: "divider", divider: {} },
    { type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: "📊 Column Guide" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Followers — total follower count at end of month" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "New Followers — net gain that month" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Posts Published — static posts (not Reels)" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Reels Published — Reels posted that month" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Accounts Reached — unique accounts that saw any of your content" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Avg Reach — average reach per post/Reel" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Profile Visits — how many people visited your profile" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Link Clicks — clicks on the link in your bio" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Saves — total saves across all content that month" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Top Post — best performing post by reach (auto-filled when API connected)" } }] } },
    { type: "divider", divider: {} },
    { type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: "📍 Where to Find These Numbers" } }] } },
    { type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: "Instagram app → Profile → Professional Dashboard → Account Insights → set date range to the month" } }], color: "gray" } },
    { type: "divider", divider: {} },
    { type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: "🔌 API Status" } }] } },
    { type: "callout", callout: { rich_text: [{ type: "text", text: { content: "Instagram API not yet connected. Most metrics require manual entry until IG_ACCESS_TOKEN is added to .env. Once connected, Followers, Reach, Profile Visits and Top Post will auto-populate." } }], icon: { type: "emoji", emoji: "⏳" }, color: "yellow_background" } },
  ]}),
});
console.log("✅ Instagram page updated");
