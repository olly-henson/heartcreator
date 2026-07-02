import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DB_ID = env["NOTION_INSTAGRAM_DB_ID"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Step 1 — remove all existing non-title columns
console.log("Removing old columns...");
await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({ properties: {
    "Profile Visits":      null,
    "Comments":            null,
    "External Link Taps":  null,
    "Saves":               null,
    "Reach Growth (%)":    null,
    "Content You Shared":  null,
    "Year Growth (%)":     null,
    "Interactions":        null,
    "Likes":               null,
    "Follower Growth (%)": null,
    "Shares":              null,
    "Overall Growth (%)":  null,
    "Followers":           null,
    "Accounts Reached":    null,
    "New Followers":       null,
    "Best Performing Reel":null,
    "Date":                null,
    "Total Views":         null,
  }}),
});
console.log("✅ Old columns removed");
await sleep(3000);

// Step 2 — add columns in exact order
console.log("Adding columns in order...");
const columns = [
  ["Date",                  { date: {} }],
  ["Total Views",           { number: { format: "number" } }],
  ["Accounts Reached",      { number: { format: "number" } }],
  ["Profile Visits",        { number: { format: "number" } }],
  ["External Link Taps",    { number: { format: "number" } }],
  ["Interactions",          { number: { format: "number" } }],
  ["Likes",                 { number: { format: "number" } }],
  ["Comments",              { number: { format: "number" } }],
  ["Saves",                 { number: { format: "number" } }],
  ["Shares",                { number: { format: "number" } }],
  ["New Followers",         { number: { format: "number" } }],
  ["Content You Shared",    { number: { format: "number" } }],
  ["Best Performing Reel",  { rich_text: {} }],
  ["Follower Growth (%)",   { number: { format: "percent" } }],
  ["Reach Growth (%)",      { number: { format: "percent" } }],
  ["Overall Growth (%)",    { number: { format: "percent" } }],
  ["Year Growth (%)",       { number: { format: "percent" } }],
];

for (const [name, schema] of columns) {
  await sleep(500);
  const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
    method: "PATCH", headers: h,
    body: JSON.stringify({ properties: { [name]: schema } }),
  });
  const data = await res.json();
  console.log(res.ok ? `  ✅ ${name}` : `  ❌ ${name}: ${data.message}`);
}

console.log("\n✅ Instagram database rebuilt in correct order");
