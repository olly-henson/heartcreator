import { readFileSync, writeFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DASHBOARD_PAGE_ID = "36e30e58-6a0d-81c8-8c70-dfa1fc988004";
const OLD_PAGE_ID = "36e30e58-6a0d-81d1-b627-d2089f296fbc";
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

// Step 1 — delete old Instagram page
console.log("Deleting old Instagram page...");
const delRes = await fetch(`https://api.notion.com/v1/blocks/${OLD_PAGE_ID}`, { method: "DELETE", headers: h });
console.log(delRes.ok ? "✅ Deleted" : `❌ ${JSON.stringify(await delRes.json())}`);

// Step 2 — create new Instagram sub-page
console.log("\nCreating new Instagram page...");
const pageRes = await fetch("https://api.notion.com/v1/pages", {
  method: "POST", headers: h,
  body: JSON.stringify({
    parent: { page_id: DASHBOARD_PAGE_ID },
    icon: { type: "emoji", emoji: "📸" },
    properties: { title: [{ type: "text", text: { content: "Instagram" } }] },
  }),
}).then(r => r.json());
const NEW_PAGE_ID = pageRes.id;
console.log(`✅ Page created: ${NEW_PAGE_ID}`);

// Step 3 — create database with ALL columns in one call
console.log("\nCreating database with columns in correct order...");
const dbRes = await fetch("https://api.notion.com/v1/databases", {
  method: "POST", headers: h,
  body: JSON.stringify({
    parent: { page_id: NEW_PAGE_ID },
    title: [{ type: "text", text: { content: "Instagram — Monthly Metrics" } }],
    properties: {
      "Month":                { title: {} },
      "Date":                 { date: {} },
      "Total views":          { number: { format: "number" } },
      "Accounts reached":     { number: { format: "number" } },
      "Profile Visits":       { number: { format: "number" } },
      "External link taps":   { number: { format: "number" } },
      "Interactions":         { number: { format: "number" } },
      "Likes":                { number: { format: "number" } },
      "Comments":             { number: { format: "number" } },
      "Saves":                { number: { format: "number" } },
      "Shares":               { number: { format: "number" } },
      "New Followers":        { number: { format: "number" } },
      "Followers":            { number: { format: "number" } },
      "Content You Shared":   { number: { format: "number" } },
      "Best Performing Reel": { rich_text: {} },
      "Follower Growth (%)":  { number: { format: "percent" } },
      "Reach Growth (%)":     { number: { format: "percent" } },
      "Overall Growth (%)":   { number: { format: "percent" } },
      "Year Growth (%)":      { number: { format: "percent" } },
    },
  }),
}).then(r => r.json());
const NEW_DB_ID = dbRes.id;
console.log(`✅ Database created: ${NEW_DB_ID}`);

// Step 4 — add April and May rows
for (const [period, date] of [["April 2026", "2026-04-01"], ["May 2026", "2026-05-01"]]) {
  await fetch("https://api.notion.com/v1/pages", {
    method: "POST", headers: h,
    body: JSON.stringify({
      parent: { database_id: NEW_DB_ID },
      properties: {
        "Month": { title: [{ text: { content: period } }] },
        "Date":  { date: { start: date } },
      },
    }),
  });
  console.log(`✅ ${period} row added`);
}

// Step 5 — update .env with new IDs
let envContent = readFileSync("C:/Users/Olly/AI OS/marketing/.env", "utf8");
envContent = envContent.replace(/NOTION_INSTAGRAM_DB_ID=.*/, `NOTION_INSTAGRAM_DB_ID=${NEW_DB_ID}`);
writeFileSync("C:/Users/Olly/AI OS/marketing/.env", envContent);
console.log(`\n✅ .env updated with new DB ID: ${NEW_DB_ID}`);
console.log(`   Page ID: ${NEW_PAGE_ID}`);
console.log("\nUpdate SNAPSHOT_INSTAGRAM_ID link in fetch_metrics.mjs to point to new DB ID");
