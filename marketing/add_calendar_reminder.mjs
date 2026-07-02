import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));

const GOOGLE_CLIENT_ID = env["GA_CLIENT_ID"];
const GOOGLE_CLIENT_SECRET = env["GA_CLIENT_SECRET"];
const GOOGLE_REFRESH_TOKEN = env["GA_REFRESH_TOKEN"];

// Refresh token
const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: GOOGLE_REFRESH_TOKEN, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET }),
});
const { access_token } = await tokenRes.json();

// Create recurring event on the last day of each month
const event = {
  summary: "🚨 Run Business Dashboard Script",
  description: `Monthly reminder to run your business metrics script.\n\nOpen terminal and run:\nnode "C:\\Users\\Olly\\AI OS\\marketing\\fetch_metrics.mjs"\n\nThis updates your Notion Business Dashboard with the latest numbers for the month.`,
  start: { date: "2026-05-31" },
  end:   { date: "2026-05-31" },
  recurrence: ["RRULE:FREQ=MONTHLY;BYMONTHDAY=-1"],
  reminders: {
    useDefault: false,
    overrides: [
      { method: "popup",  minutes: 60 },
      { method: "email",  minutes: 60 },
    ],
  },
  colorId: "11", // Tomato red — high visibility
};

const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
  method: "POST",
  headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
  body: JSON.stringify(event),
});
const data = await res.json();
console.log(res.ok ? `✅ Recurring reminder created: ${data.htmlLink}` : `❌ ${JSON.stringify(data)}`);
