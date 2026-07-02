import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve("C:/Users/Olly/AI OS/marketing/.env");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => l.split("=").map(p => p.trim()))
);

const token = env["NOTION_API_TOKEN"];
const DASHBOARD_PAGE_ID = "36e30e58-6a0d-81c8-8c70-dfa1fc988004";

const payload = {
  parent: { type: "page_id", page_id: DASHBOARD_PAGE_ID },
  title: [{ type: "text", text: { content: "Business Metrics" } }],
  properties: {
    "Period":                { title: {} },
    "Date":                  { date: {} },
    "YouTube Subscribers":   { number: { format: "number" } },
    "Instagram Followers":   { number: { format: "number" } },
    "Email Subscribers":     { number: { format: "number" } },
    "Skool Members":         { number: { format: "number" } },
    "Customers":             { number: { format: "number" } },
    "Website Visits":        { number: { format: "number" } },
    "Revenue ($)":           { number: { format: "dollar" } },
    "Expenses ($)":          { number: { format: "dollar" } },
    "Profit ($)":            { formula: { expression: 'prop("Revenue ($)") - prop("Expenses ($)")' } },
  },
};

const res = await fetch("https://api.notion.com/v1/databases", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
  },
  body: JSON.stringify(payload),
});

const data = await res.json();
if (res.ok) {
  console.log(`✅ Database created: ${data.url}`);
  console.log(`   ID: ${data.id}`);
} else {
  console.log(`❌ Error ${res.status}:`, JSON.stringify(data, null, 2));
}
