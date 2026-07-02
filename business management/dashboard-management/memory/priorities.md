# Priorities — Dashboard Manager

> Read this at the start of every dashboard session. Update as tasks are completed or added.

**Last updated:** 2026-06-22

---

## Current focus

Dashboard is live and running monthly. Instagram API not yet connected — data entered manually.

---

## TO BUILD

- [ ] Instagram API connection — add `IG_ACCESS_TOKEN` to `.env` and wire into `fetch_metrics.mjs`
- [ ] CTR pulled from YouTube Analytics API (currently entered manually from YouTube Studio)
- [ ] Apply growth % logic to Instagram, Email, Skool, and Customers sub-databases (currently YouTube only)
- [ ] Revenue / Expenses / Profit API source (currently manual entry — no API available)

---

## BACKLOG

- [ ] Stage 2 upsell tracking — add Membership ($150/mo) as a separate revenue line once it launches
- [ ] Recharge for Radiance delivery metric — add once programme is live

---

## COMPLETED

- [x] Monthly `fetch_metrics.mjs` script live and pulling YouTube, GHL, GA4 data
- [x] Notion Business Dashboard live with 4 summary callout blocks
- [x] YouTube growth % logic live (month-on-month + vs April 2026 baseline)
- [x] Google Calendar monthly reminder set
- [x] Financial management sync script (`sync_financials.mjs`) live
- [x] Customer Satisfaction DB wired to Delivery block on dashboard
