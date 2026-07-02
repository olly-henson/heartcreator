import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync("C:/Users/Olly/AI OS/marketing/.env", "utf8")
    .split("\n").filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => l.split("=").map(p => p.trim()))
);

const token = env["NOTION_API_TOKEN"];
const DASHBOARD_PAGE_ID = "36e30e58-6a0d-81c8-8c70-dfa1fc988004";

const h = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
};

async function notion(method, path, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method, headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${path}: ${JSON.stringify(data)}`);
  return data;
}

// Asset page definitions
const assets = [
  {
    emoji: "🎬",
    title: "YouTube",
    description: "Track your YouTube channel growth month by month.",
    properties: {
      "Period":        { title: {} },
      "Date":          { date: {} },
      "Subscribers":   { number: { format: "number" } },
      "Monthly Views": { number: { format: "number" } },
      "Watch Hours":   { number: { format: "number" } },
      "Videos Published": { number: { format: "number" } },
      "Notes":         { rich_text: {} },
    },
  },
  {
    emoji: "📸",
    title: "Instagram",
    description: "Track your Instagram growth and engagement month by month.",
    properties: {
      "Period":          { title: {} },
      "Date":            { date: {} },
      "Followers":       { number: { format: "number" } },
      "Posts Published": { number: { format: "number" } },
      "Reels Published": { number: { format: "number" } },
      "Avg Reach":       { number: { format: "number" } },
      "Profile Visits":  { number: { format: "number" } },
      "Link Clicks":     { number: { format: "number" } },
      "Notes":           { rich_text: {} },
    },
  },
  {
    emoji: "📧",
    title: "Email Subscribers",
    description: "Track your email list growth via GHL month by month.",
    properties: {
      "Period":       { title: {} },
      "Date":         { date: {} },
      "Subscribers":  { number: { format: "number" } },
      "New This Month": { number: { format: "number" } },
      "Unsubscribes": { number: { format: "number" } },
      "Emails Sent":  { number: { format: "number" } },
      "Avg Open Rate": { number: { format: "percent" } },
      "Notes":        { rich_text: {} },
    },
  },
  {
    emoji: "🏫",
    title: "Skool Members",
    description: "Track your free Skool community growth month by month.",
    properties: {
      "Period":          { title: {} },
      "Date":            { date: {} },
      "Total Members":   { number: { format: "number" } },
      "New This Month":  { number: { format: "number" } },
      "Active Members":  { number: { format: "number" } },
      "Notes":           { rich_text: {} },
    },
  },
  {
    emoji: "🤝",
    title: "Customers",
    description: "Track paying customers and programme enrolments month by month.",
    properties: {
      "Period":          { title: {} },
      "Date":            { date: {} },
      "Active Customers": { number: { format: "number" } },
      "New This Month":  { number: { format: "number" } },
      "Churned":         { number: { format: "number" } },
      "Applications":    { number: { format: "number" } },
      "Conversion Rate": { number: { format: "percent" } },
      "Notes":           { rich_text: {} },
    },
  },
  {
    emoji: "🌐",
    title: "Website",
    description: "Track website traffic and conversions month by month.",
    properties: {
      "Period":          { title: {} },
      "Date":            { date: {} },
      "Total Visits":    { number: { format: "number" } },
      "Unique Visitors": { number: { format: "number" } },
      "Top Page":        { rich_text: {} },
      "Notes":           { rich_text: {} },
    },
  },
  {
    emoji: "💰",
    title: "Financials",
    description: "Track revenue, expenses and profit month by month.",
    properties: {
      "Period":       { title: {} },
      "Date":         { date: {} },
      "Revenue ($)":  { number: { format: "dollar" } },
      "Expenses ($)": { number: { format: "dollar" } },
      "Profit ($)":   { formula: { expression: 'prop("Revenue ($)") - prop("Expenses ($)")' } },
      "Source":       { rich_text: {} },
      "Notes":        { rich_text: {} },
    },
  },
];

const dbIds = {};

for (const asset of assets) {
  process.stdout.write(`Creating ${asset.emoji} ${asset.title}...`);

  // Create the sub-page
  const page = await notion("POST", "/pages", {
    parent: { page_id: DASHBOARD_PAGE_ID },
    icon: { type: "emoji", emoji: asset.emoji },
    properties: { title: [{ type: "text", text: { content: asset.title } }] },
  });

  // Add description + divider to the page
  await notion("PATCH", `/blocks/${page.id}/children`, {
    children: [
      {
        type: "callout",
        callout: {
          rich_text: [{ type: "text", text: { content: asset.description } }],
          icon: { type: "emoji", emoji: asset.emoji },
          color: "gray_background",
        },
      },
      { type: "divider", divider: {} },
    ],
  });

  // Create the database inside the sub-page
  const db = await notion("POST", "/databases", {
    parent: { page_id: page.id },
    title: [{ type: "text", text: { content: `${asset.title} — Monthly Metrics` } }],
    properties: asset.properties,
  });

  // Seed a May 2026 row
  await notion("POST", "/pages", {
    parent: { database_id: db.id },
    properties: {
      "Period": { title: [{ text: { content: "May 2026" } }] },
      "Date":   { date: { start: "2026-05-01" } },
    },
  });

  dbIds[asset.title] = db.id;
  console.log(` ✅  (DB: ${db.id})`);
}

// Print IDs for .env
console.log("\n── Database IDs (add to .env) ─────────────────────────");
for (const [name, id] of Object.entries(dbIds)) {
  const key = "NOTION_" + name.toUpperCase().replace(/[^A-Z]/g, "_") + "_DB_ID";
  console.log(`${key}=${id}`);
}
