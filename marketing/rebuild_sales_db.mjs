import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const CUSTOMERS_PAGE_ID = "36e30e58-6a0d-81ec-b7c3-e4ce9ce53cae"; // Customers sub-page
const DB_ID = env["NOTION_CUSTOMERS_DB_ID"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Step 1 — remove all existing columns
console.log("Removing old columns...");
const existing = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, { headers: h }).then(r => r.json());
console.log("Current:", Object.keys(existing.properties));
const toDelete = Object.keys(existing.properties).filter(c => !["Period", "Month", "Date"].includes(c));
const delProps = {};
toDelete.forEach(c => delProps[c] = null);
if (Object.keys(delProps).length) {
  await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
    method: "PATCH", headers: h,
    body: JSON.stringify({ properties: delProps }),
  });
  console.log("✅ Old columns removed");
  await sleep(2000);
}

// Rename Period to Month if needed
if (existing.properties["Period"]) {
  await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
    method: "PATCH", headers: h,
    body: JSON.stringify({ properties: { "Period": { name: "Month" } } }),
  });
  await sleep(500);
}

// Step 2 — add columns in order
const columns = [
  ["New Skool Members",      { number: { format: "number" } }],
  ["New Customers",          { number: { format: "number" } }],
  ["Conversion Rate (%)",    { formula: { expression: 'if(prop("New Skool Members") > 0, prop("New Customers") / prop("New Skool Members"), 0)' } }],
  ["DM Conversations",       { number: { format: "number" } }],
  ["Applications Received",  { number: { format: "number" } }],
  ["Churn",                  { number: { format: "number" } }],
  ["Regulate for Relief % Improvement", { number: { format: "percent" } }],
  ["Sales Growth (%)",       { number: { format: "percent" } }],
  ["Conversion Growth (%)",  { number: { format: "percent" } }],
  ["Revenue Growth (%)",     { number: { format: "percent" } }],
  ["Overall Growth (%)",     { number: { format: "percent" } }],
  ["Year Growth (%)",        { number: { format: "percent" } }],
];

console.log("Adding columns...");
for (const [name, schema] of columns) {
  await sleep(600);
  const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
    method: "PATCH", headers: h,
    body: JSON.stringify({ properties: { [name]: schema } }),
  });
  console.log(res.ok ? `  ✅ ${name}` : `  ❌ ${name}: ${(await res.json()).message}`);
}

// Step 3 — update page with instructions
await sleep(1000);
await fetch(`https://api.notion.com/v1/blocks/${CUSTOMERS_PAGE_ID}/children`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({ children: [
    { type: "divider", divider: {} },
    { type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: "📖 Column Guide" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "New Skool Members — auto-pulled from GHL (Back to Life Prospect + Customer tags)" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "New Customers — auto-pulled from GHL (Back to Life Customers tag)" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Conversion Rate — auto-calculated (New Customers ÷ New Skool Members)" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "DM Conversations — manual: count of meaningful DM threads that month" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Applications Received — manual: number of people who applied to join the programme" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Churn — manual: number of cancellations that month" } }] } },
    { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Regulate for Relief % Improvement — manual: overall avg % from Google Sheets Summary Dashboard" } }] } },
  ]}),
});
console.log("✅ Page instructions added");

// Step 4 — seed April and May rows
for (const [period, date] of [["April 2026", "2026-04-01"], ["May 2026", "2026-05-01"]]) {
  await sleep(400);
  const search = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
    method: "POST", headers: h,
    body: JSON.stringify({ filter: { property: "Month", title: { equals: period } } }),
  }).then(r => r.json());
  if (!search.results?.length) {
    await fetch("https://api.notion.com/v1/pages", {
      method: "POST", headers: h,
      body: JSON.stringify({ parent: { database_id: DB_ID }, properties: {
        "Month": { title: [{ text: { content: period } }] },
        "Date":  { date: { start: date } },
      }}),
    });
    console.log(`✅ ${period} row added`);
  } else {
    console.log(`✅ ${period} row exists`);
  }
}

console.log("\n✅ Sales tracking database ready");
