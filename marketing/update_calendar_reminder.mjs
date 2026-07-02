import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));

const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: env["GA_REFRESH_TOKEN"], client_id: env["GA_CLIENT_ID"], client_secret: env["GA_CLIENT_SECRET"] }),
});
const { access_token } = await tokenRes.json();
const calHeaders = { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" };

// ── Delete old monthly reminder ────────────────────────────────────────────
console.log("Finding old monthly reminder...");
const listRes = await fetch(
  `https://www.googleapis.com/calendar/v3/calendars/primary/events?q=Run+Business+Dashboard+Script&maxResults=10`,
  { headers: calHeaders }
);
const listData = await listRes.json();
for (const event of listData.items ?? []) {
  await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.id}`, {
    method: "DELETE", headers: calHeaders,
  });
  console.log(`  Deleted: ${event.summary}`);
}

// ── Create new weekly Monday 9AM event ────────────────────────────────────
const description = `🚨 URGENT — Weekly Business Dashboard Review

Run the metrics script first:
node "C:\\Users\\Olly\\AI OS\\marketing\\fetch_metrics.mjs"

──────────────────────────────
✅ AUTO-POPULATED (script handles these)
──────────────────────────────
• Email Subscribers (Back to Life Prospects)
• Customers (Back to Life Customers)
• Skool Members
• YouTube Subscribers + New Subscribers
• YouTube Views, Watch Time, Audience Retention
• YouTube Videos Published This Month
• YouTube Top Video
• Website Visits (last 30 days via GA4)

──────────────────────────────
✍️ MANUAL ENTRIES NEEDED
──────────────────────────────
• YouTube CTR (%)
  → YouTube Studio → Analytics → Content tab → Impressions CTR

• Instagram (all manual — 2 mins)
  → Open Instagram app → Profile → Professional Dashboard → Account Insights
  → Set date range to last 7 days
  → Record: Accounts Reached, Profile Visits, Link Clicks, Followers, New Followers
  → Tap "Content You Shared" → sort by Reach → note your Top Post
  → Count Reels and Posts published this week
  → Open Notion → Business Dashboard → Instagram Growth → add/update row

• Skool Members (if not matching GHL)
  → Check Skool dashboard directly

• Revenue, Expenses (end of month only)
  → Enter in Financials page in Notion

──────────────────────────────
📊 DASHBOARD
──────────────────────────────
https://www.notion.so/Business-Dashboard-36e30e586a0d81c88c70dfa1fc988004`;

const event = {
  summary: "🚨 Weekly Business Dashboard Review — Olly Henson Coaching",
  description,
  start: {
    dateTime: "2026-06-01T09:00:00",
    timeZone: "Africa/Johannesburg",
  },
  end: {
    dateTime: "2026-06-01T09:30:00",
    timeZone: "Africa/Johannesburg",
  },
  recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO"],
  colorId: "11", // Tomato red
  reminders: {
    useDefault: false,
    overrides: [
      { method: "popup", minutes: 10 },
      { method: "email", minutes: 60 },
    ],
  },
};

const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
  method: "POST", headers: calHeaders,
  body: JSON.stringify(event),
});
const data = await res.json();
console.log(res.ok ? `✅ Weekly reminder created: ${data.htmlLink}` : `❌ ${JSON.stringify(data)}`);
