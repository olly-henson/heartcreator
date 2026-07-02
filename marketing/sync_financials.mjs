/**
 * sync_financials.mjs
 * Syncs Expenses → Monthly Financials relation so the Total Expenses rollup updates.
 * Run when Olly says "sync the financials".
 *
 * Usage: node "C:\Users\Olly\AI OS\marketing\sync_financials.mjs"
 */

import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const EXPENSES_DB   = "37230e58-6a0d-819c-83da-f68e6167e521";
const FINANCIALS_DB = "37230e58-6a0d-81f4-9e9d-e1932a881e5a";
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

const finRows = await fetch(`https://api.notion.com/v1/databases/${FINANCIALS_DB}/query`, {
  method: "POST", headers, body: JSON.stringify({ page_size: 100 })
}).then(r => r.json());

const expRows = await fetch(`https://api.notion.com/v1/databases/${EXPENSES_DB}/query`, {
  method: "POST", headers, body: JSON.stringify({ page_size: 100 })
}).then(r => r.json());

for (const finRow of finRows.results) {
  const finRowId = finRow.id;
  const month = finRow.properties.Month?.title?.[0]?.plain_text ?? "unknown";

  const linkedExpenses = expRows.results.filter(e =>
    e.properties.Month?.relation?.some(r => r.id === finRowId)
  );

  if (linkedExpenses.length === 0) { console.log(`${month}: no linked expenses — skipping`); continue; }

  const res = await fetch(`https://api.notion.com/v1/pages/${finRowId}`, {
    method: "PATCH", headers,
    body: JSON.stringify({
      properties: {
        "Related to Expenses (Month)": { relation: linkedExpenses.map(e => ({ id: e.id })) }
      }
    })
  });
  const data = await res.json();
  if (data.object === "error") { console.error(`${month} error:`, data.message); continue; }
  console.log(`✅ ${month}: synced ${linkedExpenses.length} expense(s)`);
}

console.log("\nDone. Total Expenses and Profit should now be up to date in Monthly Financials.");
