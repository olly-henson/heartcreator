import { readFileSync, writeFileSync } from "fs";

const envPath = "C:/Users/Olly/AI OS/marketing/.env";
const env = Object.fromEntries(readFileSync(envPath,"utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DASHBOARD_PAGE_ID = "36e30e58-6a0d-81c8-8c70-dfa1fc988004";
const DB_BLOCK_ID = "36e30e58-6a0d-8192-bda3-fbf027c8f644"; // Business Metrics — insert after this

const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };
const notion = async (method, path, body) => {
  const res = await fetch(`https://api.notion.com/v1${path}`, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  return res.json();
};

// ── 1. Delete old snapshot blocks ─────────────────────────────────────────
const OLD_BLOCKS = [
  env["NOTION_SNAPSHOT_BLOCK_ID"],       // old heading container
  "36e30e58-6a0d-818d-afc2-c3a2ae18d4d6", // old placeholder paragraph
  "36e30e58-6a0d-8102-a1fc-e38c4d45a8e6", // old divider
];
console.log("Deleting old snapshot blocks...");
for (const id of OLD_BLOCKS.filter(Boolean)) {
  const r = await notion("DELETE", `/blocks/${id}`);
  console.log(`  deleted ${id} — ${r.object === "block" ? "✅" : JSON.stringify(r)}`);
}

// ── 2. Insert snapshot blocks after the database block ────────────────────
console.log("\nInserting snapshot blocks after Business Metrics database...");
const result = await notion("PATCH", `/blocks/${DASHBOARD_PAGE_ID}/children`, {
  after: DB_BLOCK_ID,
  children: [
    { type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: "📊 Current Snapshot" } }] } },
    { type: "callout", callout: { rich_text: [{ type: "text", text: { content: "🎬  YouTube Subscribers\n—" } }], icon: { type: "emoji", emoji: "🎬" }, color: "gray_background" } },
    { type: "callout", callout: { rich_text: [{ type: "text", text: { content: "📸  Instagram Followers\n—" } }], icon: { type: "emoji", emoji: "📸" }, color: "gray_background" } },
    { type: "callout", callout: { rich_text: [{ type: "text", text: { content: "📧  Email Subscribers\n—" } }], icon: { type: "emoji", emoji: "📧" }, color: "blue_background" } },
    { type: "callout", callout: { rich_text: [{ type: "text", text: { content: "🏫  Skool Members\n—" } }], icon: { type: "emoji", emoji: "🏫" }, color: "green_background" } },
    { type: "callout", callout: { rich_text: [{ type: "text", text: { content: "🤝  Customers\n—" } }], icon: { type: "emoji", emoji: "🤝" }, color: "purple_background" } },
    { type: "callout", callout: { rich_text: [{ type: "text", text: { content: "🌐  Website Visits\n—" } }], icon: { type: "emoji", emoji: "🌐" }, color: "gray_background" } },
    { type: "callout", callout: { rich_text: [{ type: "text", text: { content: "💰  Revenue\n—" } }], icon: { type: "emoji", emoji: "💰" }, color: "yellow_background" } },
    { type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: "Last updated: —" }, annotations: { italic: true, color: "gray" } }] } },
    { type: "divider", divider: {} },
  ],
});

if (!result.results) { console.error("❌", JSON.stringify(result)); process.exit(1); }

const [headingId, youtubeId, instagramId, emailId, skoolId, customersId, websiteId, revenueId, timestampId] =
  result.results.map(b => b.id);

console.log("✅ Snapshot blocks created");

// ── 3. Save block IDs to .env ─────────────────────────────────────────────
let envContent = readFileSync(envPath, "utf8")
  .replace(/\nNOTION_SNAPSHOT_BLOCK_ID=.*\n?/, "\n");

envContent += `
# Snapshot block IDs (do not edit — used by fetch_metrics.mjs)
SNAPSHOT_HEADING_ID=${headingId}
SNAPSHOT_YOUTUBE_ID=${youtubeId}
SNAPSHOT_INSTAGRAM_ID=${instagramId}
SNAPSHOT_EMAIL_ID=${emailId}
SNAPSHOT_SKOOL_ID=${skoolId}
SNAPSHOT_CUSTOMERS_ID=${customersId}
SNAPSHOT_WEBSITE_ID=${websiteId}
SNAPSHOT_REVENUE_ID=${revenueId}
SNAPSHOT_TIMESTAMP_ID=${timestampId}
`;
writeFileSync(envPath, envContent);
console.log("✅ Block IDs saved to .env");
console.log("\nNow run: node fetch_metrics.mjs");
