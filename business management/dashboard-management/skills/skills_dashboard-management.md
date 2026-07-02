# Dashboard Management — Monthly Business Review

> This skill gives Claude complete context to run, troubleshoot, and maintain Olly's Notion Business Dashboard. Run once a month. Load this file when Olly asks you to run the dashboard script or make any adjustments to the dashboard.

---

## What This Skill Covers

- Running the monthly metrics script
- Interpreting the output and flagging anything that needs attention
- Troubleshooting common script failures
- Making adjustments to the dashboard or databases

---

## The Monthly Script

**Trigger phrase:** "Run the dashboard script"

**Command to run:**
```
node "C:\Users\Olly\AI OS\marketing\fetch_metrics.mjs"
```

**Location:** `C:\Users\Olly\AI OS\marketing\fetch_metrics.mjs`

**When:** Once a month at the start of each new month.

---

## What the Script Does

### Auto-populated (no action needed from Olly)
| Metric | Source |
|--------|--------|
| Email Subscribers | GHL — contacts tagged "back to life prospect" |
| Customers | GHL — contacts tagged "back to life customers" |
| Skool Members | Calculated: Email Subscribers + Customers |
| YouTube Subscribers | YouTube Data API |
| YouTube New Subscribers | YouTube Analytics API |
| YouTube Views, Watch Time, Audience Retention | YouTube Analytics API |
| YouTube Videos Published This Month | YouTube Data API |
| YouTube Top Video | YouTube Analytics API |
| Website Visits (last 30 days) | Google Analytics 4 (GA4) |
| Avg % Improvement | Google Sheets — Summary Dashboard tab, column E (rows 4–12), averaged across all 9 metrics. Only populates once a client completes the full 6-week Regulate for Relief programme. |
| All growth % figures | Calculated from previous month's row in each sub-database |

### Manual entries (Olly does these after running the script)
| Metric | Where to find it |
|--------|-----------------|
| YouTube CTR (%) | YouTube Studio → Analytics → Content tab → Impressions CTR |
| Instagram — all metrics | Instagram app → Profile → Professional Dashboard → Account Insights → last 7 days. Record: Accounts Reached, Profile Visits, Link Clicks, Followers, New Followers, Views, Comments, Saves, Shares. Top post: Content You Shared → sort by Reach. Enter into Notion → Business Dashboard → Instagram. |
| Skool — About Page Visitors + Conversion Rate | Skool dashboard → About page analytics. Enter into Notion → Business Dashboard → Skool Members. |
| Revenue & Expenses | Enter in Notion → Financial Management → Monthly Financials. Run "sync the financials" after adding expenses. |
| Avg % Improvement | Auto from script once clients complete programme — otherwise enter manually from Google Sheets Summary Dashboard |

---

## Dashboard Summary Blocks — What Each Shows

Each block is auto-updated by the script on every run. Here's what each now displays:

### 📊 Marketing block (`36e30e58-6a0d-81a5-be52-efb489ccc899`)
*"Marketing Figures to beat this month:"*
- 🎬 YouTube: Views | CTR | Audience Retention (from most recent Notion row with data)
- 📸 Instagram: Views | Comments | Saves | Shares (from most recent Notion row with data)
- 📧 Email: Open Rate | Reply Rate (from most recent Notion row with data)
- 🏫 Skool: About Page Visitors | Conversion Rate (from most recent Notion row with data)
- 🌐 Website: Total Visits | Unique Visitors (from most recent Notion row with data)

### 💵 Sales block (`36e30e58-6a0d-81af-b991-dc61d4f12e95`)
*"Sales figures to beat this month:"*
- 💰 Sales Growth: Skool DM Conversations | New Customers | MRR (from most recent Customers DB row with data)

### 🚀 Delivery block (`36e30e58-6a0d-81f9-9823-c019527b2ac4`)
*"Delivery metrics to beat this month:"*
- 🤝 Customer Satisfaction: Avg % Improvement (from Customer Satisfaction DB — populates once clients complete programme)

### 📋 Financial Management block (`36e30e58-6a0d-817f-8b54-db801a31fb3e`)
*"Financial numbers to beat this month:"*
- 📈 Finances: MRR | Expenses | Profit (from Monthly Financials DB — most recent row with data)

---

## Notion Business Dashboard

**URL:** https://www.notion.so/Business-Dashboard-36e30e586a0d81c88c70dfa1fc988004

### Sub-databases (each is a child page of the dashboard)
| Page | Database ID | Key columns |
|------|-------------|-------------|
| YouTube | `36e30e58-6a0d-814f-939e-c49fab4e411f` | Subscribers, Views, Watch Time, CTR, Retention, Top Video, growth % |
| Instagram | `36e30e58-6a0d-81d9-a0d5-f5a2a944845d` | Followers, Reached, Views, Comments, Saves, Shares, Best Reel, growth % |
| Email Subscribers | `36e30e58-6a0d-8106-a888-e0caa729eb12` | Total Subscribers, Open Rate, Reply Rate, growth % |
| Skool Members | `36e30e58-6a0d-8116-817a-ee4a94d0f3ba` | Total Members, About Page Visitors, Conversion Rate, growth % |
| Customers (Sales Growth) | `36e30e58-6a0d-817e-ad03-fb879a1323d8` | New Customers, Skool DM Conversations, MRR, growth % |
| Website | `36e30e58-6a0d-81d2-8d43-e1c4f2da396f` | Total Visits, Unique Visitors, growth % |
| Customer Satisfaction | `36e30e58-6a0d-81b2-9f0c-fb3ba412015d` | Avg % Improvement, Active Clients, Notes |
| Finances | `36e30e58-6a0d-81e2-817b-fceff7538eef` | Month, Revenue ($), MRR ($), Expenses ($), Profit |

### Main Business Metrics Database
**ID:** `36e30e58-6a0d-8187-ac85-d3b16d11e297`
Stores the top-level monthly snapshot: all key numbers in one row per month.

---

## API Connections

| Service | Credential key in .env | Status |
|---------|----------------------|--------|
| Notion | `NOTION_API_TOKEN` | ✅ Connected |
| GoHighLevel | `GHL_PIT_TOKEN`, `GHL_LOCATION_ID` | ✅ Connected |
| YouTube Data API | `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID` | ✅ Connected |
| YouTube Analytics API | `GA_CLIENT_ID`, `GA_CLIENT_SECRET`, `GA_REFRESH_TOKEN` | ✅ Connected (shared OAuth with GA) |
| Google Analytics 4 | `GA_CLIENT_ID`, `GA_CLIENT_SECRET`, `GA_REFRESH_TOKEN`, `GA_PROPERTY_ID` | ✅ Connected |
| Google Sheets (Regulate tracker) | `REGULATE_SHEET_ID` | ✅ Connected |
| Google Calendar | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | ✅ Connected |
| Instagram | `IG_ACCESS_TOKEN` | ⏳ Not yet connected — Instagram data is entered manually |

**Note:** All credentials are stored in `C:\Users\Olly\AI OS\marketing\.env` — never hardcode them in scripts.

---

## Interpreting the Output — What to Flag

After running the script, review each metric against the previous month and flag anything that needs attention:

### YouTube
| Signal | What it means | Suggested action |
|--------|--------------|-----------------|
| CTR (%) dropping | Thumbnails or titles not compelling enough | Review top-performing titles; test new thumbnail styles |
| Views dropping | Content not resonating or posting frequency dropped | Check posting schedule; review hook quality |
| Retention dropping | Viewers dropping off early | Review video structure; hook and first 30 seconds |
| Subscribers stalled | Growth plateauing | Analyse top video and replicate angle |

### Instagram
| Signal | What it means | Suggested action |
|--------|--------------|-----------------|
| Views dropping | Reels not being pushed by algorithm | Review hooks; check posting consistency |
| Comments/Saves/Shares low | Content not resonating deeply | Review content against argument sheet |
| Followers not growing | Profile not converting reach | Review bio and pinned posts |

### Email
| Signal | What it means | Suggested action |
|--------|--------------|-----------------|
| Open Rate dropping | Subject lines not compelling | Test new subject line styles |
| Reply Rate low | Emails not prompting engagement | Add more direct questions or personal stories |

### Skool
| Signal | What it means | Suggested action |
|--------|--------------|-----------------|
| About Page Visitors low | Not enough traffic to Skool page | Check CTA in content — codeword HEART |
| Conversion Rate dropping | Visitors not joining | Review About page copy |

### Sales
| Signal | What it means | Suggested action |
|--------|--------------|-----------------|
| DM Conversations low | Not enough prospects engaging | Review DM follow-up process |
| New Customers not growing | Conversion from community to paid not working | Review application flow |

### Website
| Signal | What it means | Suggested action |
|--------|--------------|-----------------|
| Visits very low | Little organic search traffic yet | Note: site is early stage; expected for now |

---

## Known Issues & Fixes

### Notion integration permissions
Each sub-database page must have the **Marketing OS** integration connected, otherwise the script gets a 404. If a database returns "not found":
- Go to that page in Notion → ⋯ → Connections → Connect to → Marketing OS

### Script writes to wrong database
If the main Business Metrics database is ever deleted and recreated, update `DB_ID` on line ~28 of `fetch_metrics.mjs` with the new database ID.

### YouTube Growth showing "—"
Caused by missing previous month row in the YouTube sub-database. Will resolve automatically once two months of data exist.

### Financial Management callout showing "—"
Expected until MRR is entered in Monthly Financials and expenses are synced. Run "sync the financials" first, then enter MRR.

### Customer Satisfaction link pointing to wrong page
Must link to the Customer Satisfaction database block ID `36e30e586a0d81b29f0cfb3ba412015d` — NOT to `NOTION_CUSTOMERS_DB_ID` which points to the Sales Growth database.

---

## Making Adjustments

When Olly asks to change the dashboard:
1. Always check current block/database state via Notion API before editing
2. Use the block IDs above to target the right elements
3. Remember the Notion API cannot change a block's type — delete and recreate if needed
4. After any script changes, run it once to confirm output is clean
5. Never hardcode API keys — always read from `.env`

---

## Backfilling a Previous Month

If Olly asks to **"run the backfill script for [month] [year]"**, update `fetch_may_retention.mjs` with the correct start/end dates for that month, then run it:

```
node "C:\Users\Olly\AI OS\marketing\fetch_may_retention.mjs"
```

This pulls YouTube Analytics data for the specified month from the API and updates the correct row in the Notion YouTube sub-database. Use it whenever Olly wants the final confirmed figures for a past month (the main monthly script only ever fetches the current month).

**To change the month:** edit lines with `startDate` and `endDate` (set to `YYYY-MM-01` / `YYYY-MM-DD`) and update the Notion filter (`"May 2026"` → the target month label).

---

## Financial Management

**Notion page:** Financial Management (inside Daily Operations)
**Expenses DB ID:** `37230e58-6a0d-819c-83da-f68e6167e521`
**Monthly Financials DB ID:** `37230e58-6a0d-81f4-9e9d-e1932a881e5a`

### How it works
- **Expenses DB** — log individual expenses as they happen: Description, Date, Category, Amount ($), Notes. Link each expense to the correct month via the **Month** field.
- **Monthly Financials DB** — one row per month. Enter MRR manually. Total Expenses is a rollup (auto-sums linked expenses). Profit is a formula (MRR − Total Expenses).

### Syncing expenses
Notion's relation sync is unreliable. When Olly says **"sync the financials"**, run this script:

```
node "C:\Users\Olly\AI OS\marketing\sync_financials.mjs"
```

This reads all expense rows, groups them by linked month, and patches the Monthly Financials rows directly so the rollup updates correctly.

### End of month routine
1. Add all expenses to Expenses DB, linking each to the month
2. Run "sync the financials"
3. Enter MRR in Monthly Financials
4. Profit auto-calculates

---

## Files Reference

| File | Purpose |
|------|---------|
| `fetch_metrics.mjs` | Main monthly script — pulls all data and updates Notion |
| `fetch_may_retention.mjs` | Backfill script — pulls YouTube Analytics for a specific past month and updates Notion |
| `sync_financials.mjs` | Syncs Expenses → Monthly Financials relation (run when Olly says "sync the financials") |
| `create_dashboard_db.mjs` | One-time script — creates Business Metrics database |
| `setup_dashboard.mjs` | One-time script — builds dashboard page layout |
| `add_calendar_reminder.mjs` | One-time script — created the Google Calendar recurring event |
| `.env` | All credentials — never commit to GitHub |
