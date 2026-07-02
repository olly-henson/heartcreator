import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DB_ID = env["NOTION_INSTAGRAM_DB_ID"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const patch = async (props) => {
  const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
    method: "PATCH", headers: h,
    body: JSON.stringify({ properties: props }),
  });
  return res.json();
};

// Step 1 — delete all existing non-title columns
console.log("Deleting all existing columns...");
await patch({
  "Date":                null,
  "Total Views":         null,
  "Accounts Reached":    null,
  "Profile Visits":      null,
  "External Link Taps":  null,
  "Interactions":        null,
  "Likes":               null,
  "Comments":            null,
  "Saves":               null,
  "Shares":              null,
  "New Followers":       null,
  "Content You Shared":  null,
  "Best Performing Reel":null,
  "Follower Growth (%)": null,
  "Reach Growth (%)":    null,
  "Overall Growth (%)":  null,
  "Year Growth (%)":     null,
  "Followers":           null,
});
console.log("✅ Deleted");
await sleep(3000);

// Step 2 — rename Period to Month
console.log("Renaming Period to Month...");
await patch({ "Period": { name: "Month" } });
await sleep(1000);

// Step 3 — add columns one by one in exact order
const columns = [
  ["Date",                  { date: {} }],
  ["Total views",           { number: { format: "number" } }],
  ["Accounts reached",      { number: { format: "number" } }],
  ["Profile Visits",        { number: { format: "number" } }],
  ["External link taps",    { number: { format: "number" } }],
  ["Interactions",          { number: { format: "number" } }],
  ["Likes",                 { number: { format: "number" } }],
  ["Comments",              { number: { format: "number" } }],
  ["Saves",                 { number: { format: "number" } }],
  ["Shares",                { number: { format: "number" } }],
  ["New Followers",         { number: { format: "number" } }],
  ["Content You Shared",    { number: { format: "number" } }],
  ["Best Performing Reel",  { rich_text: {} }],
  // Growth columns — hidden but used for calculations
  ["Follower Growth (%)",   { number: { format: "percent" } }],
  ["Reach Growth (%)",      { number: { format: "percent" } }],
  ["Overall Growth (%)",    { number: { format: "percent" } }],
  ["Year Growth (%)",       { number: { format: "percent" } }],
];

console.log("Adding columns in order...");
for (const [name, schema] of columns) {
  await sleep(600);
  const data = await patch({ [name]: schema });
  console.log(data.id ? `  ✅ ${name}` : `  ❌ ${name}: ${data.message}`);
}

console.log("\n✅ Instagram database rebuilt with exact names in exact order");
