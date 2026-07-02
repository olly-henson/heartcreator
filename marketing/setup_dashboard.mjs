import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve("C:/Users/Olly/AI OS/marketing/.env");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => l.split("=").map(p => p.trim()))
);

const token = env["NOTION_API_TOKEN"];
const DASHBOARD_PAGE_ID = "36e30e58-6a0d-81c8-8c70-dfa1fc988004";
const DB_ID = "36e30e58-6a0d-8187-ac85-d3b16d11e297";

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
};

async function notion(method, path, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${path}: ${JSON.stringify(data)}`);
  return data;
}

// ── 1. Enhance the database with extra properties ──────────────────────────
console.log("1. Enhancing database properties...");
await notion("PATCH", `/databases/${DB_ID}`, {
  properties: {
    "Period Type": {
      select: {
        options: [
          { name: "Weekly", color: "blue" },
          { name: "Monthly", color: "green" },
          { name: "Quarterly", color: "purple" },
        ],
      },
    },
    "Notes": { rich_text: {} },
  },
});
console.log("   ✅ Added Period Type + Notes");

// ── 2. Add first row — May 2026 ────────────────────────────────────────────
console.log("2. Adding May 2026 entry...");
await notion("POST", "/pages", {
  parent: { database_id: DB_ID },
  properties: {
    "Period":               { title: [{ text: { content: "May 2026" } }] },
    "Date":                 { date: { start: "2026-05-01" } },
    "Period Type":          { select: { name: "Monthly" } },
    "YouTube Subscribers":  { number: 0 },
    "Instagram Followers":  { number: 0 },
    "Email Subscribers":    { number: 0 },
    "Skool Members":        { number: 0 },
    "Customers":            { number: 0 },
    "Website Visits":       { number: 0 },
    "Revenue ($)":          { number: 0 },
    "Expenses ($)":         { number: 0 },
    "Notes":                { rich_text: [{ text: { content: "First entry — update with real numbers." } }] },
  },
});
console.log("   ✅ May 2026 row created");

// ── 3. Build the dashboard page structure ──────────────────────────────────
console.log("3. Building dashboard page layout...");
await notion("PATCH", `/blocks/${DASHBOARD_PAGE_ID}/children`, {
  children: [
    {
      type: "callout",
      callout: {
        rich_text: [{ type: "text", text: { content: "Update this dashboard at the end of each month. Fill in the numbers, then the Profit column calculates automatically." } }],
        icon: { type: "emoji", emoji: "📌" },
        color: "blue_background",
      },
    },
    { type: "divider", divider: {} },
    {
      type: "heading_2",
      heading_2: { rich_text: [{ type: "text", text: { content: "📈 Growth Metrics" } }] },
    },
    {
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: "Track follower and subscriber counts across all platforms each month to see which channels are growing fastest." } }],
        color: "gray",
      },
    },
    {
      type: "heading_2",
      heading_2: { rich_text: [{ type: "text", text: { content: "💰 Financial Metrics" } }] },
    },
    {
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: "Revenue = all income received. Expenses = tools, ads, contractors. Profit is calculated automatically." } }],
        color: "gray",
      },
    },
    { type: "divider", divider: {} },
    {
      type: "heading_2",
      heading_2: { rich_text: [{ type: "text", text: { content: "🗓️ Monthly Review Checklist" } }] },
    },
    { type: "to_do", to_do: { rich_text: [{ type: "text", text: { content: "Add a new row for the month" } }], checked: false } },
    { type: "to_do", to_do: { rich_text: [{ type: "text", text: { content: "Update YouTube Subscribers" } }], checked: false } },
    { type: "to_do", to_do: { rich_text: [{ type: "text", text: { content: "Update Instagram Followers" } }], checked: false } },
    { type: "to_do", to_do: { rich_text: [{ type: "text", text: { content: "Update Email Subscribers (GHL)" } }], checked: false } },
    { type: "to_do", to_do: { rich_text: [{ type: "text", text: { content: "Update Skool Members" } }], checked: false } },
    { type: "to_do", to_do: { rich_text: [{ type: "text", text: { content: "Update active Customers" } }], checked: false } },
    { type: "to_do", to_do: { rich_text: [{ type: "text", text: { content: "Update Website Visits (Google Analytics)" } }], checked: false } },
    { type: "to_do", to_do: { rich_text: [{ type: "text", text: { content: "Enter Revenue and Expenses" } }], checked: false } },
    { type: "to_do", to_do: { rich_text: [{ type: "text", text: { content: "Add Notes — what worked, what didn't" } }], checked: false } },
  ],
});
console.log("   ✅ Page layout built");

console.log("\n🎉 Dashboard fully set up!");
console.log(`   → https://www.notion.so/Business-Dashboard-36e30e586a0d81c88c70dfa1fc988004`);
