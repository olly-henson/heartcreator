import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));

const REFRESH_TOKEN = env["GA_REFRESH_TOKEN"];
const CLIENT_ID = env["GA_CLIENT_ID"];
const CLIENT_SECRET = env["GA_CLIENT_SECRET"];

// First try to refresh the token
console.log("Refreshing Google access token...");
const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: REFRESH_TOKEN, client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
});
const refreshData = await refreshRes.json();
if (!refreshRes.ok) { console.log("Token refresh failed:", JSON.stringify(refreshData)); process.exit(1); }
const freshToken = refreshData.access_token;
console.log("✅ Token refreshed\n");

// List GA4 properties this account has access to
console.log("Fetching GA4 properties...");
const res = await fetch("https://analyticsadmin.googleapis.com/v1beta/accountSummaries", {
  headers: { Authorization: `Bearer ${freshToken}` },
});
const data = await res.json();
if (!res.ok) { console.log("GA4 error:", JSON.stringify(data)); process.exit(1); }

data.accountSummaries?.forEach(account => {
  console.log(`\nAccount: ${account.displayName}`);
  account.propertySummaries?.forEach(p => console.log(`  Property: ${p.displayName} — ${p.property}`));
});
