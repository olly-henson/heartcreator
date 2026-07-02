/**
 * setup_instagram_stories.mjs
 * Creates the Instagram Stories section inside the Daily Operations Notion page.
 * Mirrors the YouTube Community Posts database structure exactly.
 *
 * Run: node "C:\Users\Olly\AI OS\marketing\assets\scripts\setup_instagram_stories.mjs"
 *
 * Safe to re-run: checks if the sub-page already exists before creating.
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
const DAILY_OPS_PAGE_ID = "36e30e58-6a0d-81c0-b131-de443f0890ef";

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
    p.properties?.title?.title?.[0]?.plain_text === title
  );
}

async function run() {
  console.log("🔍 Checking if Instagram Stories sub-page already exists...");

  const existing = await findExistingPage("Instagram Stories");
  if (existing) {
    console.log(`✅ Page already exists: ${existing.url}`);
    console.log("   To rebuild, delete the existing page in Notion first.");
    return;
  }

  // ── 1. Create the Instagram Stories sub-page inside Daily Operations ─────────
  console.log("📄 Creating Instagram Stories sub-page...");
  const subPage = await notion("POST", "/pages", {
    parent: { type: "page_id", page_id: DAILY_OPS_PAGE_ID },
    icon: { type: "emoji", emoji: "📱" },
    properties: {
      title: {
        title: [{ type: "text", text: { content: "Instagram Stories" } }],
      },
    },
    children: [
      {
        object: "block",
        type: "heading_1",
        heading_1: {
          rich_text: [{ type: "text", text: { content: "Instagram Stories" } }],
        },
      },
    ],
  });

  console.log(`✅ Sub-page created: ${subPage.url}`);

  // ── 2. Create the Instagram Stories database inside the sub-page ─────────────
  console.log("🗄️  Creating Instagram Stories database...");

  const db = await notion("POST", "/databases", {
    parent: { type: "page_id", page_id: subPage.id },
    icon: { type: "emoji", emoji: "📱" },
    title: [
      { type: "text", text: { content: "Instagram Stories" } },
    ],
    is_inline: false,
    properties: {
      Title: { title: {} },
      Date: { type: "date", date: {} },
      "Type of Post": {
        type: "select",
        select: {
          options: [
            { name: "Personal Story",   color: "blue"   },
            { name: "Personal Update",  color: "orange" },
            { name: "Engagement",       color: "yellow" },
            { name: "Personal Mission", color: "purple" },
            { name: "Case Study",       color: "green"  },
            { name: "Belief-Changing",  color: "brown"  },
          ],
        },
      },
      Status: {
        type: "select",
        select: {
          options: [
            { name: "Idea",      color: "gray"   },
            { name: "Written",   color: "yellow" },
            { name: "Scheduled", color: "blue"   },
            { name: "Published", color: "green"  },
          ],
        },
      },
      "Post Content": { type: "rich_text", rich_text: {} },
      Summary:        { type: "rich_text", rich_text: {} },
      "Image Idea":   { type: "rich_text", rich_text: {} },
      "Pinned Comment": { type: "rich_text", rich_text: {} },
      Rating: {
        type: "select",
        select: {
          options: [
            { name: "Made Changes", color: "orange" },
            { name: "Good",         color: "green"  },
            { name: "Don't Like",   color: "red"    },
          ],
        },
      },
    },
  });

  console.log(`✅ Database created: ${db.id}`);

  // ── 3. Add a callout on the Daily Operations main page ───────────────────────
  console.log("📌 Adding callout to Daily Operations page...");

  await notion("PATCH", `/blocks/${DAILY_OPS_PAGE_ID}/children`, {
    children: [
      {
        object: "block",
        type: "callout",
        callout: {
          icon: { type: "emoji", emoji: "📱" },
          color: "purple_background",
          rich_text: [
            {
              type: "text",
              text: {
                content: "Instagram Stories",
                link: { url: subPage.url },
              },
              annotations: { bold: true },
            },
          ],
        },
      },
    ],
  });

  console.log(`✅ Callout added.`);
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Instagram Stories setup complete.");
  console.log(`📱 Sub-page:  ${subPage.url}`);
  console.log(`🗄️  Database ID: ${db.id}`);
  console.log("");
  console.log("📌 Save this to .env:");
  console.log(`   DAILY_OPS_INSTAGRAM_STORIES_DB_ID=${db.id}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

run().catch(err => {
  console.error("❌ Setup failed:", err.message);
  process.exit(1);
});
