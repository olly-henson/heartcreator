import { readFileSync, writeFileSync } from "fs";
const envPath = "C:/Users/Olly/AI OS/marketing/.env";
const env = Object.fromEntries(readFileSync(envPath,"utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const DASHBOARD_PAGE_ID = "36e30e58-6a0d-81c8-8c70-dfa1fc988004";
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };

const dbUrl = id => `https://app.notion.com/p/${id.replace(/-/g, "")}`;
const financialsUrl = dbUrl(env["NOTION_FINANCIALS_DB_ID"]);

const result = await fetch(`https://api.notion.com/v1/blocks/${DASHBOARD_PAGE_ID}/children`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({
    after: env["SNAPSHOT_REVENUE_ID"],
    children: [
      {
        type: "callout",
        callout: {
          color: "red_background",
          rich_text: [
            { type: "text", text: { content: "💸  Expenses", link: { url: financialsUrl } }, annotations: { bold: true, color: "default" } },
            { type: "text", text: { content: "\n—" }, annotations: { bold: true, color: "default" } },
          ],
        },
      },
      {
        type: "callout",
        callout: {
          color: "green_background",
          rich_text: [
            { type: "text", text: { content: "📈  Profit", link: { url: financialsUrl } }, annotations: { bold: true, color: "default" } },
            { type: "text", text: { content: "\n—" }, annotations: { bold: true, color: "default" } },
          ],
        },
      },
    ],
  }),
}).then(r => r.json());

if (!result.results) { console.error("❌", JSON.stringify(result)); process.exit(1); }

const [expensesId, profitId] = result.results.map(b => b.id);
console.log(`✅ Expenses block: ${expensesId}`);
console.log(`✅ Profit block:   ${profitId}`);

// Save to .env
let envContent = readFileSync(envPath, "utf8");
envContent += `SNAPSHOT_EXPENSES_ID=${expensesId}\nSNAPSHOT_PROFIT_ID=${profitId}\n`;
writeFileSync(envPath, envContent);
console.log("✅ IDs saved to .env");
