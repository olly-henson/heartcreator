import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DB_ID = env["NOTION_INSTAGRAM_DB_ID"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Delete all wrong-cased duplicates
console.log("Removing duplicates...");
const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({ properties: {
    "Total Views":        null,
    "External Link Taps": null,
    "Follower Growth (%)":null,
    "Reach Growth (%)":   null,
    "Overall Growth (%)": null,
    "Year Growth (%)":    null,
  }}),
});
console.log(res.ok ? "✅ Duplicates removed" : `❌ ${JSON.stringify(await res.json())}`);
await sleep(2000);

// Re-add growth columns with correct names
console.log("Re-adding growth columns...");
for (const name of ["Follower Growth (%)", "Reach Growth (%)", "Overall Growth (%)", "Year Growth (%)"]) {
  await sleep(600);
  await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
    method: "PATCH", headers: h,
    body: JSON.stringify({ properties: { [name]: { number: { format: "percent" } } } }),
  });
  console.log(`  ✅ ${name}`);
}

// Final check
await sleep(1000);
const check = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, { headers: h }).then(r => r.json());
console.log("\nFinal columns:");
Object.keys(check.properties).forEach(name => console.log(`  - "${name}"`));
