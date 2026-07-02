/**
 * setup_daily_operations.mjs
 * Creates the standalone Daily Operations page in Notion with the
 * YouTube Long-Form Videos database as the first section.
 *
 * Run: node "C:\Users\Olly\AI OS\marketing\setup_daily_operations.mjs"
 *
 * Safe to re-run: checks if the page already exists before creating.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve("C:/Users/Olly/AI OS/marketing/.env");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => l.split("=").map(p => p.trim()))
);

const NOTION_TOKEN = env["NOTION_API_TOKEN"];

const headers = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
};

async function notion(method, path, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("Notion API error:", JSON.stringify(json, null, 2));
    throw new Error(`Notion ${method} ${path} failed: ${res.status}`);
  }
  return json;
}

async function findExistingPage(title) {
  const res = await notion("POST", "/search", {
    query: title,
    filter: { value: "page", property: "object" },
  });
  return res.results.find(p =>
    p.properties?.title?.title?.[0]?.plain_text === title ||
    p.properties?.Name?.title?.[0]?.plain_text === title
  );
}

async function run() {
  console.log("🔍 Checking if Daily Operations page already exists...");

  const existing = await findExistingPage("Daily Operations");
  if (existing) {
    console.log(`✅ Page already exists: ${existing.url}`);
    console.log("   To rebuild, delete the existing page in Notion first.");
    return;
  }

  // ── 1. Create the top-level Daily Operations page ──────────────────────────
  console.log("📄 Creating Daily Operations page...");
  const page = await notion("POST", "/pages", {
    parent: { type: "page_id", page_id: "35c30e58-6a0d-80cd-a733-cb03c1c65f27" },
    icon: { type: "emoji", emoji: "📋" },
    properties: {
      title: {
        title: [{ type: "text", text: { content: "Daily Operations" } }],
      },
    },
    children: [
      {
        object: "block",
        type: "heading_1",
        heading_1: {
          rich_text: [{ type: "text", text: { content: "Daily Operations" } }],
        },
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content:
                  "Track and manage all recurring daily tasks across every area of the business.",
              },
              annotations: { color: "gray" },
            },
          ],
        },
      },
      {
        object: "block",
        type: "divider",
        divider: {},
      },
    ],
  });

  console.log(`✅ Page created: ${page.url}`);

  // ── 2. Create the YouTube Long-Form Content tracking sub-page ──────────────
  console.log("📄 Creating YouTube Long-Form Content tracking page...");

  const trackingPage = await notion("POST", "/pages", {
    parent: { type: "page_id", page_id: page.id },
    icon: { type: "emoji", emoji: "🎬" },
    properties: {
      title: {
        title: [{ type: "text", text: { content: "YouTube Long-Form Content" } }],
      },
    },
    children: [
      {
        object: "block",
        type: "heading_1",
        heading_1: {
          rich_text: [{ type: "text", text: { content: "YouTube Long-Form Content" } }],
        },
      },
    ],
  });

  console.log(`✅ Tracking page created.`);

  // ── 3. Create the database inside the tracking page ────────────────────────
  console.log("🗄️  Creating YouTube Long-Form Videos database...");

  const db = await notion("POST", "/databases", {
    parent: { type: "page_id", page_id: trackingPage.id },
    icon: { type: "emoji", emoji: "🎬" },
    title: [
      { type: "text", text: { content: "YouTube Long-Form Videos" } },
    ],
    is_inline: false,
    properties: {
      Title: {
        title: {},
      },
      Date: {
        type: "date",
        date: {},
      },
      "Type of Post": {
        type: "select",
        select: {
          options: [
            { name: "Argument-Based",   color: "red"    },
            { name: "Educational",       color: "blue"   },
            { name: "Mission-Based",     color: "purple" },
            { name: "Client Success",    color: "green"  },
            { name: "Engagement-Based",  color: "yellow" },
            { name: "Personal",          color: "orange" },
          ],
        },
      },
      Hook: {
        type: "rich_text",
        rich_text: {},
      },
      Transcript: {
        type: "rich_text",
        rich_text: {},
      },
      "Thumbnail Idea": {
        type: "rich_text",
        rich_text: {},
      },
      Recorded: {
        type: "checkbox",
        checkbox: {},
      },
      Scheduled: {
        type: "checkbox",
        checkbox: {},
      },
    },
  });

  console.log(`✅ Database created.`);

  // ── 4. Add the callout block on the main page linking to the tracking page ──
  console.log("📌 Adding callout block to Daily Operations page...");

  await notion("PATCH", `/blocks/${page.id}/children`, {
    children: [
      {
        object: "block",
        type: "callout",
        callout: {
          icon: { type: "emoji", emoji: "🎬" },
          color: "red_background",
          rich_text: [
            {
              type: "text",
              text: {
                content: "YouTube Long-Form Content",
                link: { url: trackingPage.url },
              },
              annotations: { bold: true },
            },
          ],
        },
      },
    ],
  });

  console.log(`✅ Callout block added.`);
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Daily Operations setup complete.");
  console.log(`📋 Page:          ${page.url}`);
  console.log(`📄 Tracking page: ${trackingPage.url}`);
  console.log(`🗄️  Database ID:   ${db.id}`);
  console.log("");
  console.log("📌 Save this database ID for future scripts:");
  console.log(`   DAILY_OPS_YOUTUBE_LF_DB_ID=${db.id}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

run().catch(err => {
  console.error("❌ Setup failed:", err.message);
  process.exit(1);
});
