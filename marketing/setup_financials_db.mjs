import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DB_ID = env["NOTION_FINANCIALS_DB_ID"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Check existing
const existing = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, { headers: h }).then(r => r.json());
console.log("Current columns:", Object.keys(existing.properties));

// Remove old columns
const toDelete = Object.keys(existing.properties).filter(c => !["Period", "Month", "Date"].includes(c));
const delProps = {};
toDelete.forEach(c => delProps[c] = null);
if (Object.keys(delProps).length > 0) {
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
  console.log("✅ Period renamed to Month");
  await sleep(1000);
}

// Add columns in order
const columns = [
  ["Sales",              { number: { format: "number" } }],
  ["Revenue ($)",        { number: { format: "dollar" } }],
  ["Cash ($)",           { number: { format: "dollar" } }],
  ["MRR ($)",            { number: { format: "dollar" } }],
  ["LTV ($)",            { number: { format: "dollar" } }],
  ["Expenses ($)",       { number: { format: "dollar" } }],
  ["Profit ($)",         { number: { format: "dollar" } }],
  ["Sales Growth (%)",   { number: { format: "percent" } }],
  ["Revenue Growth (%)", { number: { format: "percent" } }],
  ["MRR Growth (%)",     { number: { format: "percent" } }],
  ["Overall Growth (%)", { number: { format: "percent" } }],
  ["Year Growth (%)",    { number: { format: "percent" } }],
];

console.log("Adding columns...");
for (const [name, schema] of columns) {
  await sleep(500);
  const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
    method: "PATCH", headers: h,
    body: JSON.stringify({ properties: { [name]: schema } }),
  });
  console.log(res.ok ? `  ✅ ${name}` : `  ❌ ${name}`);
}

// Ensure April and May rows exist
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
    console.log(`✅ ${period} row exists`);
  }
}

console.log("\n✅ Financials database ready");
