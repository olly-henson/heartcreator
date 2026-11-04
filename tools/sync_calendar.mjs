// Sync the Hub content calendar into the content generator (Olly, 2026-11-03).
// Reads the Hub's KV record (Reels, Stories, Email, YouTube community) and writes a compact
// list of the last 60 days + anything scheduled ahead to OUT (a JSON file). Then Claude writes
// it to the generator's db as doc calendar/recent (ArtifactData set, artifact WsnecJvYahvCKVDevtrUqc).
// The generator reads that doc and tells every prompt what's already been posted.
// Usage: node tools/sync_calendar.mjs OUT.json
import { execSync } from "child_process";
import { writeFileSync } from "fs";

const HUB = "C:/Users/Olly/AI OS/heartattractor/business management/business hub/hub-site";
const raw = execSync("npx wrangler kv key get record --namespace-id f6ae5047d04c492d9409f74cdb3bb920 --remote", { cwd: HUB, encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] });
const r = JSON.parse(raw); const s = r.state || r;

const from = new Date(Date.now() - 60 * 864e5).toISOString().slice(0, 10);
const today = new Date().toISOString().slice(0, 10);
const clip = (t, n) => String(t || "").replace(/\{\{[^}]+\}\}/g, "").replace(/\s+/g, " ").trim().slice(0, n);
const arr = v => Array.isArray(v) ? v : Object.values(v || {});
const keep = x => x && x.date && x.date >= from;
const sort = a => a.sort((x, y) => (x.d < y.d ? 1 : -1));

const reels = sort((s.content?.ideas || []).filter(keep).map(x => ({ d: x.date, t: clip(x.title, 140), st: x.posted ? "published" : x.recorded ? "recorded" : "planned" })));
const stories = sort((s.stories?.ideas || []).filter(keep).map(x => ({ d: x.date, t: clip(x.title, 120), ty: x.type || "", st: x.posted ? "published" : "planned" })));
const email = sort(arr(s.emailCal).filter(keep).map(x => ({ d: x.date, t: clip(x.subject, 100), ty: x.type || "", st: x.status === "sent" ? "published" : x.status || "draft", b: clip(x.body, 260) })));
const yt = sort(arr(s.ytPosts).filter(keep).map(x => ({ d: x.date, t: clip(x.title || x.post, 120), ty: x.type || "", st: x.status === "sent" ? "published" : x.status || "draft" })));

const out = { syncedAt: new Date().toISOString(), today, from, reels, stories, email, yt };
writeFileSync(process.argv[2] || "calendar.json", JSON.stringify(out));
console.log(`synced: ${reels.length} reels, ${stories.length} stories, ${email.length} emails, ${yt.length} yt posts (${JSON.stringify(out).length} bytes)`);
