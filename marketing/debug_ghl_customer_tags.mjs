import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const GHL_TOKEN = env["GHL_PIT_TOKEN"];
const GHL_LOCATION = env["GHL_LOCATION_ID"];
const headers = { Authorization: `Bearer ${GHL_TOKEN}`, Version: "2021-07-28" };

// Fetch all contacts and list every unique tag
let allTags = new Set();
let after = null;
do {
  const url = new URL(`https://services.leadconnectorhq.com/contacts/`);
  url.searchParams.set("locationId", GHL_LOCATION);
  url.searchParams.set("limit", "100");
  if (after) url.searchParams.set("startAfter", after);
  const res = await fetch(url.toString(), { headers });
  const data = await res.json();
  const contacts = data?.contacts ?? [];
  contacts.forEach(c => c.tags?.forEach(t => allTags.add(t)));
  after = contacts.length === 100 ? contacts[contacts.length - 1].id : null;
} while (after);

console.log("All tags in GHL:");
[...allTags].sort().forEach(t => console.log(" ", t));
