import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Delete the 4 individual blocks we're consolidating
const toDelete = [
  env["SNAPSHOT_INSTAGRAM_ID"],
  env["SNAPSHOT_EMAIL_ID"],
  env["SNAPSHOT_SKOOL_ID"],
  env["SNAPSHOT_WEBSITE_ID"],
];

console.log("Deleting individual marketing blocks...");
for (const id of toDelete) {
  await sleep(400);
  const res = await fetch(`https://api.notion.com/v1/blocks/${id}`, { method: "DELETE", headers: h });
  console.log(res.ok ? `  ✅ Deleted ${id}` : `  ❌ ${id}`);
}

// Update the YouTube block to become the combined Marketing block
console.log("\nUpdating YouTube block to Marketing block...");
await fetch(`https://api.notion.com/v1/blocks/${env["SNAPSHOT_YOUTUBE_ID"]}`, {
  method: "PATCH", headers: h,
  body: JSON.stringify({
    callout: {
      color: "gray_background",
      icon: { type: "emoji", emoji: "📊" },
      rich_text: [
        { type: "text", text: { content: "📊  Marketing" }, annotations: { bold: true, color: "default" } },
        { type: "text", text: { content: "\n🎬  YouTube:    " }, annotations: { bold: false, color: "default" } },
        { type: "text", text: { content: "—" }, annotations: { bold: true, color: "gray" } },
        { type: "text", text: { content: "\n📸  Instagram:  " }, annotations: { bold: false, color: "default" } },
        { type: "text", text: { content: "—" }, annotations: { bold: true, color: "gray" } },
        { type: "text", text: { content: "\n📧  Email:      " }, annotations: { bold: false, color: "default" } },
        { type: "text", text: { content: "—" }, annotations: { bold: true, color: "gray" } },
        { type: "text", text: { content: "\n🏫  Skool:      " }, annotations: { bold: false, color: "default" } },
        { type: "text", text: { content: "—" }, annotations: { bold: true, color: "gray" } },
        { type: "text", text: { content: "\n🌐  Website:    " }, annotations: { bold: false, color: "default" } },
        { type: "text", text: { content: "—" }, annotations: { bold: true, color: "gray" } },
      ],
    },
  }),
});
console.log("✅ Marketing block created");
