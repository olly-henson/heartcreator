import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const GHL_TOKEN = env["GHL_PIT_TOKEN"];
const GHL_LOCATION = env["GHL_LOCATION_ID"];
const headers = { Authorization: `Bearer ${GHL_TOKEN}`, Version: "2021-07-28" };

// Try the search endpoint with tag filter
console.log("Trying search endpoint with tag...");
const res = await fetch(`https://services.leadconnectorhq.com/contacts/search/duplicate?locationId=${GHL_LOCATION}`, { headers });
console.log("search status:", res.status);

// Try contacts endpoint and log first contact's tags to see the format
console.log("\nFetching first few contacts to check tag format...");
const res2 = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION}&limit=3`, { headers });
const data2 = await res2.json();
data2?.contacts?.forEach(c => console.log(`  ${c.firstName} ${c.lastName} — tags:`, JSON.stringify(c.tags)));

// Try with tag as array param
console.log("\nTrying tags[] param...");
const res3 = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION}&limit=100&tags[]=Back+to+Life+Prospect`, { headers });
const data3 = await res3.json();
console.log("tags[] result count:", data3?.contacts?.length, "| meta:", JSON.stringify(data3?.meta));
