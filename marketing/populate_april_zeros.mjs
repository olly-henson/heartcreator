import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

const notion = (method, path, body) => fetch(`https://api.notion.com/v1${path}`, { method, headers: h, body: body ? JSON.stringify(body) : undefined }).then(r => r.json());

// Find April 2026 row in a database
async function findAprilRow(dbId) {
  const res = await notion("POST", `/databases/${dbId}/query`, {
    filter: { property: "Period", title: { equals: "April 2026" } },
  });
  return res.results?.[0]?.id;
}

// Main Business Metrics
const mainId = await findAprilRow("36e30e58-6a0d-8192-bda3-fbf027c8f644");
await notion("PATCH", `/pages/${mainId}`, { properties: {
  "YouTube Subscribers": { number: 0 },
  "Instagram Followers": { number: 0 },
  "Email Subscribers":   { number: 0 },
  "Skool Members":       { number: 0 },
  "Customers":           { number: 0 },
  "Website Visits (Last 30 Days)": { number: 0 },
  "Revenue ($)":         { number: 0 },
  "Expenses ($)":        { number: 0 },
}});
console.log("✅ Main Dashboard");

// YouTube
const ytId = await findAprilRow(env["NOTION_YOUTUBE_DB_ID"]);
await notion("PATCH", `/pages/${ytId}`, { properties: {
  "Subscribers":              { number: 0 },
  "New Subscribers":          { number: 0 },
  "Monthly Views":            { number: 0 },
  "Watch Time (Hours)":       { number: 0 },
  "CTR (%)":                  { number: 0 },
  "Audience Retention (%)":   { number: 0 },
  "Videos Published This Month": { number: 0 },
}});
console.log("✅ YouTube");

// Instagram
const igId = await findAprilRow(env["NOTION_INSTAGRAM_DB_ID"]);
await notion("PATCH", `/pages/${igId}`, { properties: {
  "Followers":       { number: 0 },
  "Posts Published": { number: 0 },
  "Reels Published": { number: 0 },
  "Avg Reach":       { number: 0 },
  "Profile Visits":  { number: 0 },
  "Link Clicks":     { number: 0 },
}});
console.log("✅ Instagram");

// Email Subscribers
const emailId = await findAprilRow(env["NOTION_EMAIL_SUBSCRIBERS_DB_ID"]);
await notion("PATCH", `/pages/${emailId}`, { properties: {
  "Subscribers":    { number: 0 },
  "New This Month": { number: 0 },
  "Unsubscribes":   { number: 0 },
  "Emails Sent":    { number: 0 },
  "Avg Open Rate":  { number: 0 },
}});
console.log("✅ Email Subscribers");

// Skool Members
const skoolId = await findAprilRow(env["NOTION_SKOOL_MEMBERS_DB_ID"]);
await notion("PATCH", `/pages/${skoolId}`, { properties: {
  "Total Members":  { number: 0 },
  "New This Month": { number: 0 },
  "Active Members": { number: 0 },
}});
console.log("✅ Skool Members");

// Customers
const custId = await findAprilRow(env["NOTION_CUSTOMERS_DB_ID"]);
await notion("PATCH", `/pages/${custId}`, { properties: {
  "Active Customers": { number: 0 },
  "New This Month":   { number: 0 },
  "Churned":          { number: 0 },
  "Applications":     { number: 0 },
  "Conversion Rate":  { number: 0 },
}});
console.log("✅ Customers");

// Website
const webId = await findAprilRow(env["NOTION_WEBSITE_DB_ID"]);
await notion("PATCH", `/pages/${webId}`, { properties: {
  "Total Visits":    { number: 0 },
  "Unique Visitors": { number: 0 },
}});
console.log("✅ Website");

// Financials
const finId = await findAprilRow(env["NOTION_FINANCIALS_DB_ID"]);
await notion("PATCH", `/pages/${finId}`, { properties: {
  "Revenue ($)":  { number: 0 },
  "Expenses ($)": { number: 0 },
}});
console.log("✅ Financials");
