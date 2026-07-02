import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const GHL_TOKEN = env["GHL_PIT_TOKEN"];
const GHL_LOCATION = env["GHL_LOCATION_ID"];
const h = { Authorization: `Bearer ${GHL_TOKEN}`, Version: "2021-07-28" };

// Check funnels endpoint
console.log("Checking funnels...");
const f = await fetch(`https://services.leadconnectorhq.com/funnels/?locationId=${GHL_LOCATION}`, { headers: h });
console.log(`  funnels: ${f.status}`, JSON.stringify((await f.json()))?.slice?.(0, 200));

// Check sites/blogs
console.log("\nChecking sites...");
const s = await fetch(`https://services.leadconnectorhq.com/sites/?locationId=${GHL_LOCATION}`, { headers: h });
console.log(`  sites: ${s.status}`, JSON.stringify((await s.json()))?.slice?.(0, 200));

// Check reporting/stats
console.log("\nChecking reporting...");
const r = await fetch(`https://services.leadconnectorhq.com/reporting/stats?locationId=${GHL_LOCATION}`, { headers: h });
console.log(`  reporting: ${r.status}`, JSON.stringify((await r.json()))?.slice?.(0, 200));
