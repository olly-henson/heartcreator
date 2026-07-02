# Business Dashboard — System Documentation

> Everything needed to understand, run, maintain and extend the Olly Henson Coaching business dashboard.

---

## Overview

A Notion-based business dashboard that tracks growth across all key business assets. Data is pulled automatically from connected APIs and written into Notion each month via a single script.

**Dashboard URL:** https://www.notion.so/Business-Dashboard-36e30e586a0d81c88c70dfa1fc988004

**All scripts live at:** `C:\Users\Olly\AI OS\marketing\`

---

## How to Run Each Month

At the end of every month (Google Calendar reminder is set), open a terminal in Claude Code and run:

```
node "C:\Users\Olly\AI OS\marketing\fetch_metrics.mjs"
```

This will:
1. Pull live data from all connected APIs
2. Update the current month's row in the main Business Metrics database
3. Update each asset sub-database with the latest figures
4. Calculate growth % vs previous month and vs April 2026 (year baseline)
5. Rewrite the snapshot cards on the dashboard page with fresh numbers and colour-coded growth indicators

---

## Dashboard Structure

### Main Page
**Business Dashboard** — `36e30e58-6a0d-81c8-8c70-dfa1fc988004`

Contains:
- **📊 Current Snapshot** — 9 callout cards showing live numbers with colour-coded growth (green = up, red = down). Each card links directly to its asset sub-database.
- **Business Metrics database** — one row per month, all metrics in one place
- **Monthly Review Checklist** — checklist of what to update each month
- **Asset sub-pages** — 7 pages (one per asset), each with its own detailed database

### Snapshot Cards
| Card | Colour | Links To |
|---|---|---|
| 🎬 YouTube Growth | Green/Red (dynamic) | YouTube DB |
| 📸 Instagram Growth | Pink | Instagram DB |
| 📧 Email Subscribers | Blue | Email Subscribers DB |
| 🏫 Skool Members | Green | Skool Members DB |
| 🤝 Customers | Purple | Customers DB |
| 🌐 Website Visits (Last 30 Days) | Orange | Website DB |
| 💰 Revenue | Yellow | Financials DB |
| 💸 Expenses | Red | Financials DB |
| 📈 Profit | Green | Financials DB |

### Asset Sub-Pages & Databases
| Asset | Page | Database ID |
|---|---|---|
| YouTube | 36e30e58-6a0d-819d-9858-cbac0325ce68 | `NOTION_YOUTUBE_DB_ID` |
| Instagram | 36e30e58-6a0d-81d1-b627-d2089f296fbc | `NOTION_INSTAGRAM_DB_ID` |
| Email Subscribers | 36e30e58-6a0d-812d-b438-e7456501e014 | `NOTION_EMAIL_SUBSCRIBERS_DB_ID` |
| Skool Members | 36e30e58-6a0d-8182-82ad-e95e3be3c6c6 | `NOTION_SKOOL_MEMBERS_DB_ID` |
| Customers | 36e30e58-6a0d-81ec-b7c3-e4ce9ce53cae | `NOTION_CUSTOMERS_DB_ID` |
| Website | 36e30e58-6a0d-81f5-bd97-f8242b7358a3 | `NOTION_WEBSITE_DB_ID` |
| Financials | 36e30e58-6a0d-8104-89b8-c25d8fc20ce7 | `NOTION_FINANCIALS_DB_ID` |

---

## Connected APIs

### ✅ GoHighLevel (GHL)
- **What it pulls:** Email Subscribers (Back to Life Prospect tag), Customers (Back to Life Customers tag), Skool Members (sum of both tags)
- **Auth:** PIT token in `.env` — `GHL_PIT_TOKEN`, `GHL_LOCATION_ID`
- **Note:** Tags are stored lowercase in GHL. Filter is done client-side by looping all contacts.

### ✅ YouTube Data API v3
- **What it pulls:** Subscriber count, videos published this month
- **Auth:** API key — `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`
- **Channel ID:** `UCAz9D3YF9Ol-1faeGRj2BEw`
- **Note:** API key is restricted to YouTube Data API v3 in Google Cloud Console (project: Olly AI OS)

### ✅ YouTube Analytics API
- **What it pulls:** Monthly views, watch time (hours), audience retention %
- **Auth:** OAuth via `GA_CLIENT_ID`, `GA_CLIENT_SECRET`, `GA_REFRESH_TOKEN`
- **Scope:** `https://www.googleapis.com/auth/yt-analytics.readonly`
- **Note:** Can pull historical data for any date range. Does NOT store historical subscriber counts.

### ✅ Google Analytics 4 (GA4)
- **What it pulls:** Website sessions (last 30 days)
- **Auth:** OAuth via `GA_CLIENT_ID`, `GA_CLIENT_SECRET`, `GA_REFRESH_TOKEN`
- **Property ID:** `539372524` — stored as `GA_PROPERTY_ID`
- **Measurement ID:** `G-1VR8T0WKYZ` — installed on GHL website
- **Note:** Only started tracking from 28 May 2026. No historical data before that date.

### ⏳ Instagram
- **Status:** Not connected
- **Needs:** `IG_ACCESS_TOKEN` added to `.env`
- **What to pull:** Followers, reach, profile visits, link clicks, posts/reels published

### ⏳ Skool
- **Status:** No public API — manual entry only

---

## Growth Calculations (YouTube)

Calculated and written to the YouTube sub-database each month by `fetch_metrics.mjs`.

**Metrics included in Overall Growth:**
1. Subscriber Growth %
2. View Growth %
3. Watch Time Growth %
4. CTR Growth %
5. Audience Retention Growth %

**Formula:** Simple average of all 5 metrics.

**Two growth figures shown on dashboard:**
- **Growth this month** — vs previous month's row
- **Growth this year** — vs April 2026 (the baseline/first entry)

**Colour logic:**
- Positive growth → green background, ↑ green text
- Negative growth → red background, ↓ red text

**April 2026 baseline (real data):**
- Subscribers: 27
- Views: 23
- Watch Time: 1 hour
- Audience Retention: 25.9%
- Videos Published: 3

---

## Scripts Reference

| Script | Purpose |
|---|---|
| `fetch_metrics.mjs` | **Main script — run this monthly.** Pulls all API data, updates Notion. |
| `reauth_google.mjs` | Re-authenticates Google OAuth (run if tokens expire) |
| `backfill_april_youtube.mjs` | Pulls real April YouTube analytics into Notion |
| `check_ga4.mjs` | Tests GA4 connection and lists properties |
| `add_calendar_reminder.mjs` | Created the monthly Google Calendar reminder (already done) |

---

## Environment Variables (`.env`)

All credentials live at: `C:\Users\Olly\AI OS\marketing\.env`

**Never commit this file to GitHub — it is gitignored.**

Key variables:
```
NOTION_API_TOKEN          — Notion integration token
GHL_PIT_TOKEN             — GoHighLevel private integration token
GHL_LOCATION_ID           — GHL location ID
GA_CLIENT_ID              — Google OAuth client ID (Olly AI OS project)
GA_CLIENT_SECRET          — Google OAuth client secret
GA_REFRESH_TOKEN          — Google OAuth refresh token (Calendar + Analytics + YouTube)
GA_PROPERTY_ID            — GA4 property ID (539372524)
GA_MEASUREMENT_ID         — GA4 measurement ID (G-1VR8T0WKYZ)
YOUTUBE_API_KEY           — YouTube Data API v3 key
YOUTUBE_CHANNEL_ID        — UCAz9D3YF9Ol-1faeGRj2BEw
```

---

## Adding a New Month

The `fetch_metrics.mjs` script handles this automatically — it checks if the current month's row exists and creates it if not. Just run the script at month end.

To add a row manually for a past month, follow the pattern in `add_april_rows.mjs`.

---

## What's Still To Build

- [ ] Instagram API connection (`IG_ACCESS_TOKEN`)
- [ ] CTR pulled from YouTube Analytics API (currently manual)
- [ ] Apply same growth % logic to Instagram, Email, Skool, Customers
- [ ] Revenue / Expenses / Profit — manual entry (no API source)
