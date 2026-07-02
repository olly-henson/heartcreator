# API Status — Dashboard Manager

> Current connection status for all APIs feeding the business dashboard. Update whenever a connection changes, breaks, or is newly added.

**Last updated:** 2026-06-22

---

## Connected APIs

### ✅ Notion
- **Key:** `NOTION_API_TOKEN` in `.env`
- **Integration name:** Marketing OS
- **Note:** Every sub-database page must have the Marketing OS integration connected. If a page returns 404, go to that page → ⋯ → Connections → Connect to → Marketing OS.

### ✅ GoHighLevel (GHL)
- **Keys:** `GHL_PIT_TOKEN`, `GHL_LOCATION_ID` in `.env`
- **What it pulls:** Email Subscribers (back to life prospect tag), Customers (back to life customers tag), Skool Members (sum of both tags)
- **Note:** Tags are stored lowercase in GHL. Filtering done client-side by looping all contacts.

### ✅ YouTube Data API v3
- **Keys:** `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID` in `.env`
- **Channel ID:** `UCAz9D3YF9Ol-1faeGRj2BEw`
- **What it pulls:** Subscriber count, videos published this month
- **Note:** API key is restricted to YouTube Data API v3 in Google Cloud Console (project: Olly AI OS).

### ✅ YouTube Analytics API
- **Keys:** `GA_CLIENT_ID`, `GA_CLIENT_SECRET`, `GA_REFRESH_TOKEN` in `.env`
- **Scope:** `https://www.googleapis.com/auth/yt-analytics.readonly`
- **What it pulls:** Monthly views, watch time (hours), audience retention %
- **Note:** Can pull historical data for any date range. Does NOT store historical subscriber counts.

### ✅ Google Analytics 4 (GA4)
- **Keys:** `GA_CLIENT_ID`, `GA_CLIENT_SECRET`, `GA_REFRESH_TOKEN`, `GA_PROPERTY_ID` in `.env`
- **Property ID:** `539372524`
- **Measurement ID:** `G-1VR8T0WKYZ` (installed on GHL website)
- **What it pulls:** Website sessions (last 30 days)
- **Note:** Only tracking from 28 May 2026. No historical data before that date.

### ✅ Google Sheets (Regulate for Relief tracker)
- **Key:** `REGULATE_SHEET_ID` in `.env`
- **What it pulls:** Avg % Improvement across all 9 metrics for completed clients

---

## Not Yet Connected

### ⏳ Instagram
- **Key needed:** `IG_ACCESS_TOKEN` — not yet added to `.env`
- **What to pull:** Followers, reach, profile visits, link clicks, posts/reels published
- **Current workaround:** Manual entry in Notion → Instagram sub-database after each month

### ⏳ Skool
- **Status:** No public API available
- **Current workaround:** Manual entry in Notion → Skool Members sub-database

---

## OAuth Token Maintenance

Google OAuth (YouTube Analytics + GA4 + Calendar) uses a shared refresh token (`GA_REFRESH_TOKEN`). If API calls start failing with auth errors, run:

```
node "C:\Users\Olly\AI OS\marketing\reauth_google.mjs"
```

This refreshes the token and updates `.env` automatically.
