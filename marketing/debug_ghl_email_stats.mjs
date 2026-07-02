import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const GHL_TOKEN = env["GHL_PIT_TOKEN"];
const GHL_LOCATION = env["GHL_LOCATION_ID"];
const h = { Authorization: `Bearer ${GHL_TOKEN}`, Version: "2021-07-28" };

// Check email campaigns/stats endpoint
console.log("Checking email campaigns...");
const r1 = await fetch(`https://services.leadconnectorhq.com/emails/campaigns?locationId=${GHL_LOCATION}`, { headers: h });
console.log(`  Status: ${r1.status}`, JSON.stringify((await r1.json()))?.slice?.(0, 300));

// Check email stats
console.log("\nChecking email stats...");
const r2 = await fetch(`https://services.leadconnectorhq.com/emails/stats?locationId=${GHL_LOCATION}`, { headers: h });
console.log(`  Status: ${r2.status}`, JSON.stringify((await r2.json()))?.slice?.(0, 300));

// Check bulk actions / broadcasts
console.log("\nChecking broadcasts...");
const r3 = await fetch(`https://services.leadconnectorhq.com/bulk-actions/?locationId=${GHL_LOCATION}`, { headers: h });
console.log(`  Status: ${r3.status}`, JSON.stringify((await r3.json()))?.slice?.(0, 300));
