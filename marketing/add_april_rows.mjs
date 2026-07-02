import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

const post = (body) => fetch("https://api.notion.com/v1/pages", { method: "POST", headers: h, body: JSON.stringify(body) }).then(r => r.json());

const period = { title: [{ text: { content: "April 2026" } }] };
const date   = { date: { start: "2026-04-01" } };
const type   = { select: { name: "Monthly" } };

const rows = [
  // Main Business Metrics
  { parent: { database_id: "36e30e58-6a0d-8192-bda3-fbf027c8f644" }, properties: { "Period": period, "Date": date, "Period Type": type } },
  // YouTube
  { parent: { database_id: env["NOTION_YOUTUBE_DB_ID"] }, properties: { "Period": period, "Date": date } },
  // Instagram
  { parent: { database_id: env["NOTION_INSTAGRAM_DB_ID"] }, properties: { "Period": period, "Date": date } },
  // Email Subscribers
  { parent: { database_id: env["NOTION_EMAIL_SUBSCRIBERS_DB_ID"] }, properties: { "Period": period, "Date": date } },
  // Skool Members
  { parent: { database_id: env["NOTION_SKOOL_MEMBERS_DB_ID"] }, properties: { "Period": period, "Date": date } },
  // Customers
  { parent: { database_id: env["NOTION_CUSTOMERS_DB_ID"] }, properties: { "Period": period, "Date": date } },
  // Website
  { parent: { database_id: env["NOTION_WEBSITE_DB_ID"] }, properties: { "Period": period, "Date": date } },
  // Financials
  { parent: { database_id: env["NOTION_FINANCIALS_DB_ID"] }, properties: { "Period": period, "Date": date } },
];

const names = ["Main Dashboard", "YouTube", "Instagram", "Email Subscribers", "Skool Members", "Customers", "Website", "Financials"];

for (let i = 0; i < rows.length; i++) {
  const res = await post(rows[i]);
  console.log(res.id ? `✅ ${names[i]}` : `❌ ${names[i]}: ${JSON.stringify(res)}`);
}
