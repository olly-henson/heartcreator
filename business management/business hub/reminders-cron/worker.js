// hub-reminders-cron (2026-11-21): every 10 minutes, asks the Hub to push any reminders that are due.
// The Hub does the work in functions/api/track/reminders.js; this Worker only provides the clock
// (Cloudflare Pages Functions can't run on a schedule). Deploy: npx wrangler deploy (from this folder).
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(fetch("https://hub.ollyhenson.com/api/track/reminders", { method: "POST" }));
  },
  async fetch() { return new Response("hub-reminders-cron: runs on a schedule", { status: 200 }); },
};
