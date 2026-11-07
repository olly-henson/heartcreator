// Last sent + next scheduled GHL email campaigns, in Cape Town time.
// Usage: node tools/ghl-email-schedule.mjs [count]   (reads marketing/.env: GHL_PIT_TOKEN, GHL_LOCATION_ID)
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const env = Object.fromEntries(readFileSync(path.join(root, "marketing/.env"), "utf8").split("\n")
  .filter(l => l.includes("=") && !l.startsWith("#")).map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const r = await fetch(`https://services.leadconnectorhq.com/emails/schedule?locationId=${env.GHL_LOCATION_ID}&limit=50`,
  { headers: { Authorization: `Bearer ${env.GHL_PIT_TOKEN}`, Version: "2021-07-28" } });
if (!r.ok) { console.error("GHL", r.status, await r.text()); process.exit(1); }
const f = t => new Date(t).toLocaleString("en-GB", { timeZone: "Africa/Johannesburg", weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const n = +(process.argv[2] || 8);
for (const s of (await r.json()).schedules.filter(s => !s.deleted).slice(0, n))
  console.log(`${s.emailStatus.padEnd(9)} ${f(s.dateScheduled || s.nextProcessingOn)}  ${s.subject}${s.processed ? `  (sent to ${s.processed})` : ""}`);
