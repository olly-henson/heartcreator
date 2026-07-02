import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync("C:/Users/Olly/AI OS/marketing/.env", "utf8")
    .split("\n").filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => l.split("=").map(p => p.trim()))
);

const token = env["NOTION_API_TOKEN"];
const DASHBOARD_PAGE_ID = "36e30e58-6a0d-81c8-8c70-dfa1fc988004";

const h = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
};

async function notion(method, path, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method, headers: h, body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(data)}`);
  return data;
}

// Add the snapshot heading at the top of the page — we'll store its ID
const result = await notion("PATCH", `/blocks/${DASHBOARD_PAGE_ID}/children`, {
  children: [
    {
      type: "heading_1",
      heading_1: {
        rich_text: [{ type: "text", text: { content: "📊 Current Snapshot" } }],
        color: "default",
      },
    },
    // Placeholder blocks — fetch_metrics.mjs will replace these
    { type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: "Run fetch_metrics.mjs to populate the snapshot." } }], color: "gray" } },
    { type: "divider", divider: {} },
  ],
});

const headingBlockId = result.results[0].id;
console.log(`✅ Snapshot heading created`);
console.log(`   NOTION_SNAPSHOT_BLOCK_ID=${headingBlockId}`);

// Append to .env
import { appendFileSync } from "fs";
appendFileSync("C:/Users/Olly/AI OS/marketing/.env", `\nNOTION_SNAPSHOT_BLOCK_ID=${headingBlockId}\n`);
console.log("   Saved to .env");
