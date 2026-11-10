// Pulls every GHL email campaign WITH stats (delivered/opened/clicked/revenue). Usage: node tools/ghl-email-stats.mjs out.json
// Key: /emails/schedule?showStats=true (email scopes added to the PIT 2026-11-10). Per-campaign /stats endpoints still 401.
import { readFileSync, writeFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/heartattractor/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()]}));
const h = { Authorization: `Bearer ${env.GHL_PIT_TOKEN}`, Version: "2021-07-28", Accept:"application/json" };
const L = env.GHL_LOCATION_ID; let all=[];
for (let off=0; off<1000; off+=100){
  const r = await fetch(`https://services.leadconnectorhq.com/emails/schedule?locationId=${L}&limit=100&offset=${off}&showStats=true`,{headers:h});
  const j = await r.json(); const s=j.schedules||[]; all.push(...s); if(s.length<100) break;
}
writeFileSync(process.argv[2], JSON.stringify(all));
console.log(all.length, Object.keys(all[0]).join(","));
