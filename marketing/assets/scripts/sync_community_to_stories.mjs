/**
 * sync_community_to_stories.mjs
 * Copies all Idea-status entries from the YouTube Community Posts database
 * into both the Instagram Stories database and the Email Broadcast Campaigns database.
 *
 * - Only copies entries with Status = "Idea"
 * - Skips entries that already exist in each target (matched by Title / Subject Line)
 * - Safe to re-run at any time
 *
 * Run: node "C:\Users\Olly\AI OS\marketing\assets\scripts\sync_community_to_stories.mjs"
 *
 * Requires in .env:
 *   NOTION_API_TOKEN
 *   DAILY_OPS_INSTAGRAM_STORIES_DB_ID
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
const SOURCE_DB_ID   = "36e30e58-6a0d-81d1-8d13-e38b0136d61e"; // YouTube Community Posts
const STORIES_DB_ID  = env["DAILY_OPS_INSTAGRAM_STORIES_DB_ID"];
const EMAIL_DB_ID    = "36e30e58-6a0d-811c-b455-ce8fe3da15be";  // Email Broadcast Campaigns

if (!STORIES_DB_ID) {
  console.error("❌ DAILY_OPS_INSTAGRAM_STORIES_DB_ID not set in .env");
  console.error("   Run setup_instagram_stories.mjs first and save the database ID.");
  process.exit(1);
}

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

async function queryAll(databaseId, filter) {
  const results = [];
  let cursor = undefined;
  do {
    const body = { page_size: 100, ...(filter && { filter }), ...(cursor && { start_cursor: cursor }) };
    const res = await notion("POST", `/databases/${databaseId}/query`, body);
    results.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

function getTitle(page) {
  return page.properties?.Title?.title?.[0]?.plain_text || "";
}

function getSubjectLine(page) {
  return page.properties?.["Subject Line"]?.title?.[0]?.plain_text || "";
}

function getRichText(page, field) {
  return page.properties?.[field]?.rich_text?.[0]?.plain_text || "";
}

function getSelect(page, field) {
  return page.properties?.[field]?.select?.name || null;
}

function getDate(page, field) {
  return page.properties?.[field]?.date?.start || null;
}

async function syncToStories(sourceEntries, existingTitles) {
  let created = 0;
  let skipped = 0;

  for (const entry of sourceEntries) {
    const title = getTitle(entry);

    if (existingTitles.has(title)) {
      console.log(`   ⏭  Stories — skipping (already exists): ${title}`);
      skipped++;
      continue;
    }

    const typeOfPost    = getSelect(entry, "Type of Post");
    const summary       = getRichText(entry, "Summary");
    const postContent   = getRichText(entry, "Post Content");
    const pinnedComment = getRichText(entry, "Pinned Comment");
    const date          = getDate(entry, "Date");

    const properties = {
      Title:  { title: [{ type: "text", text: { content: title } }] },
      Status: { select: { name: "Idea" } },
      ...(typeOfPost    && { "Type of Post":  { select: { name: typeOfPost } } }),
      ...(summary       && { Summary:         { rich_text: [{ type: "text", text: { content: summary } }] } }),
      ...(postContent   && { "Story Content": { rich_text: [{ type: "text", text: { content: postContent } }] } }),
      ...(pinnedComment && { CTA:             { rich_text: [{ type: "text", text: { content: pinnedComment } }] } }),
      ...(date          && { Date:            { date: { start: date } } }),
    };

    await notion("POST", "/pages", {
      parent: { type: "database_id", database_id: STORIES_DB_ID },
      properties,
    });

    console.log(`   ✅ Stories — created: ${title}`);
    created++;
  }

  return { created, skipped };
}

// Swap community UTM params for email-specific ones in any CTA/link text
function toEmailUtm(text) {
  return text
    .replace(/utm_source=youtube/g, "utm_source=email")
    .replace(/utm_medium=community/g, "utm_medium=broadcast");
}

// Strip lines referencing "comments below" — these are YouTube Community CTAs
// that don't make sense in an email context
function stripCommunityCtaLines(text) {
  return text
    .split("\n")
    .filter(line => !line.toLowerCase().includes("comments below"))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n") // collapse any double-blank lines left behind
    .trim();
}

async function syncToEmail(sourceEntries, existingSubjectLines) {
  let created = 0;
  let skipped = 0;

  for (const entry of sourceEntries) {
    const title = getTitle(entry);

    if (existingSubjectLines.has(title)) {
      console.log(`   ⏭  Email — skipping (already exists): ${title}`);
      skipped++;
      continue;
    }

    const postContent    = getRichText(entry, "Post Content");
    const pinnedComment  = getRichText(entry, "Pinned Comment");
    const emailCta       = pinnedComment ? toEmailUtm(pinnedComment) : "";
    const emailContent   = postContent ? stripCommunityCtaLines(postContent) : "";
    const date          = getDate(entry, "Date");

    // Build the inline CTA: "You can download the free Heart Activation Meditation ===> HERE"
    // with "HERE" hyperlinked to the email UTM meditation URL
    const meditationUrl = emailCta.match(/https?:\/\/\S+/)?.[0] || "";
    const inlineCta = meditationUrl
      ? [
          { type: "text", text: { content: "You can download the free Heart Activation Meditation ===> " } },
          { type: "text", text: { content: "HERE", link: { url: meditationUrl } } },
        ]
      : [{ type: "text", text: { content: "You can download the free Heart Activation Meditation ===> HERE" } }];

    const properties = {
      "Subject Line": { title: [{ type: "text", text: { content: title } }] },
      Status:         { select: { name: "Draft" } },
      ...(emailContent && { "Email Content": { rich_text: [{ type: "text", text: { content: emailContent } }] } }),
      CTA: { rich_text: inlineCta },
      ...(date        && { Date:            { date: { start: date } } }),
    };

    await notion("POST", "/pages", {
      parent: { type: "database_id", database_id: EMAIL_DB_ID },
      properties,
    });

    console.log(`   ✅ Email — created: ${title}`);
    created++;
  }

  return { created, skipped };
}

async function run() {
  console.log("🔍 Fetching Idea-status entries from YouTube Community Posts...");

  const sourceEntries = await queryAll(SOURCE_DB_ID, {
    property: "Status",
    select: { equals: "Idea" },
  });

  console.log(`   Found ${sourceEntries.length} Idea entries.\n`);

  if (sourceEntries.length === 0) {
    console.log("✅ Nothing to sync.");
    return;
  }

  // --- Instagram Stories ---
  console.log("🔍 Fetching existing entries from Instagram Stories...");
  const existingStories = await queryAll(STORIES_DB_ID);
  const existingStoryTitles = new Set(existingStories.map(getTitle).filter(Boolean));
  console.log(`   Found ${existingStories.length} existing entries.\n`);

  const storiesResult = await syncToStories(sourceEntries, existingStoryTitles);

  // --- Email Campaigns ---
  console.log("\n🔍 Fetching existing entries from Email Broadcast Campaigns...");
  const existingEmails = await queryAll(EMAIL_DB_ID);
  const existingEmailSubjects = new Set(existingEmails.map(getSubjectLine).filter(Boolean));
  console.log(`   Found ${existingEmails.length} existing entries.\n`);

  const emailResult = await syncToEmail(sourceEntries, existingEmailSubjects);

  // --- Summary ---
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Sync complete.`);
  console.log(`   Instagram Stories  — Created: ${storiesResult.created} | Skipped: ${storiesResult.skipped}`);
  console.log(`   Email Campaigns    — Created: ${emailResult.created} | Skipped: ${emailResult.skipped}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

run().catch(err => {
  console.error("❌ Sync failed:", err.message);
  process.exit(1);
});
