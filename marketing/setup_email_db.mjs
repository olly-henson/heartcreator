import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DB_ID = env["NOTION_EMAIL_SUBSCRIBERS_DB_ID"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Step 1 — check existing columns
const existing = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, { headers: h }).then(r => r.json());
const currentCols = Object.keys(existing.properties);
console.log("Current columns:", currentCols);

// Step 2 — remove old columns
console.log("\nRemoving old columns...");
const toDelete = currentCols.filter(c => !["Period", "Date"].includes(c));
const delProps = {};
toDelete.forEach(c => delProps[c] = null);
await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({ properties: delProps }),
});
console.log("✅ Old columns removed");
await sleep(2000);

// Step 3 — rename Period to Month
await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({ properties: { "Period": { name: "Month" } } }),
});
console.log("✅ Period renamed to Month");
await sleep(1000);

// Step 4 — add all columns in one call
console.log("Adding columns...");
const columns = [
  ["Total Subscribers",  { number: { format: "number" } }],
  ["New Subscribers",    { number: { format: "number" } }],
  ["Unsubscribes",       { number: { format: "number" } }],
  ["Emails Sent",        { number: { format: "number" } }],
  ["Open Rate (%)",      { number: { format: "percent" } }],
  ["Click Rate (%)",     { number: { format: "percent" } }],
  ["Replies",            { number: { format: "number" } }],
  ["Overall Growth (%)", { number: { format: "percent" } }],
  ["Year Growth (%)",    { number: { format: "percent" } }],
];

for (const [name, schema] of columns) {
  await sleep(500);
  const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
    method: "PATCH", headers: h,
    body: JSON.stringify({ properties: { [name]: schema } }),
  });
  console.log(res.ok ? `  ✅ ${name}` : `  ❌ ${name}`);
}

// Step 5 — seed April and May rows if missing
for (const [period, date] of [["April 2026", "2026-04-01"], ["May 2026", "2026-05-01"]]) {
  await sleep(300);
  const search = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
    method: "POST", headers: h,
    body: JSON.stringify({ filter: { property: "Month", title: { equals: period } } }),
  }).then(r => r.json());
  if (!search.results?.length) {
    await fetch("https://api.notion.com/v1/pages", {
      method: "POST", headers: h,
      body: JSON.stringify({ parent: { database_id: DB_ID }, properties: { "Month": { title: [{ text: { content: period } }] }, "Date": { date: { start: date } } } }),
    });
    console.log(`✅ ${period} row added`);
  } else {
    console.log(`✅ ${period} row already exists`);
  }
}

console.log("\n✅ Email List Growth database ready");
