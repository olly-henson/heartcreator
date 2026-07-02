# GHL Dashboard — Google Sheets

## Agent ownership

This dashboard is built and managed by the **Marketing Assistant** Claude agent (this agent). When asked to help with, update, or build similar Google Sheets + Apps Script dashboards — including new data sources, new pipeline products, or entirely new dashboard scripts — this agent should handle it directly using the skills file and local script as the starting point.

## Monthly Marketing Figures

A second script — `monthly-figures-apps-script.js` — writes a side-by-side monthly comparison sheet called **Monthly Marketing Figures** into the same Google Sheet.

**How to run:** Paste `monthly-figures-apps-script.js` into Apps Script alongside the main script → run `syncMonth()` at the end of each month.

**Key behaviour:** Running `syncMonth()` writes the current month as a new row in every section. Re-running it for the same month overwrites that month's row — it never duplicates. Previous months are never touched.

**Sections tracked (months as rows, metrics as columns):**
- Funnel Overview
- Pipeline Overview (Looms, Offers)
- Pipeline 1-2-1 (Sales, Revenue, Conv%)
- Pipeline Community (Sales, Revenue, Conv%)
- Total Revenue
- LTV (cumulative all-time snapshot at time of sync)
- Where Leads Come From (by source)
- Platform Performance — Leads / Applications / Sales
- Upgrade Paths
- Content Performance — Top 5 by Leads
- Website Pages (unique visitors)

**Fixed platforms:** instagram, youtube, email, direct, facebook, tiktok. To add a new one, update `KNOWN_PLATFORMS` in the script and add the column to the shell header in `buildShellMonthly()`.

**Fixed upgrade paths:** thank-you-page, meditation-access, practice-guide, instagram-bio, youtube-description, youtube-community, email. Update `KNOWN_PATHS` to add new ones.

---

## Security

The local script file `ghl-dashboard-apps-script.js` contains a live GHL API token and must never be committed to git or shared publicly. It is listed in `C:\Users\Olly\AI OS\marketing\.gitignore` alongside `.env` files. If this folder is ever connected to a GitHub repo, verify `.gitignore` is in place before the first push.

---

## Rules and Constraints

### Never
- Never assume the local script file exists — always verify with a directory listing before referencing it. If it's missing, ask Olly to paste the current script so it can be saved locally first.
- Never save real API tokens anywhere other than the two gitignored script files. Skills files, memory files, and CLAUDE.md must never contain live token values.
- Never commit `ghl-dashboard-apps-script.js` or `monthly-figures-apps-script.js` — both are gitignored for this reason.
- Never keep dead/parked scripts in the folder if they contain token references, even in comments. Delete them rather than letting them sit.
- Never assume a new Google Sheet or Apps Script project has the Analytics Data API enabled — always include it as an explicit setup step when giving instructions.

### Always
- Always check `.gitignore` covers all token-containing files before confirming the folder is safe to push.
- When asked about security, scan all file types (`.md`, `.js`, `.mjs`, `.json`) not just the obvious ones — tokens can appear in comments.
- When a script is deleted (e.g. dashboard-worker.js), remove all references to it from skills files, memory files, and `.gitignore` in the same session.
- Always save an updated local copy of the script after any edit — the local file is the source of truth, not what's pasted in Apps Script.

---

## Changelog

- **2026-06-30** — Skills file created. Local script saved for first time (`ghl-dashboard-apps-script.js`). `dashboard-worker.js` deleted (parked, contained token in comment). `.gitignore` updated. Monthly Marketing Figures script and skills file added. Rules and Constraints section added based on session feedback: security scanning, gitignore verification, dead script cleanup, Analytics Data API setup step.

---

## What this is

A Google Apps Script that pulls live data from GHL and GA4 and writes a dark-themed dashboard into a Google Sheet. Run it whenever you want fresh metrics.

**Script file (local copy):** `C:\Users\Olly\AI OS\marketing\ghl-dashboard-apps-script.js`
**Sheet name:** Olly Henson Coaching — GHL Dashboard
**How to run:** Google Sheet → Extensions → Apps Script → paste full script → run `syncAll()`

---

## How to update the script

1. Read the local file: `C:\Users\Olly\AI OS\marketing\ghl-dashboard-apps-script.js`
2. Make the required changes in that file
3. Copy the updated script and paste it into Apps Script in the Google Sheet, replacing the existing code
4. Run `syncAll()` to verify it works
5. Always save the updated version back to the local file — it is the source of truth

---

## What it tracks

### Funnel Overview
- Opt-in page visits, Leads, Opt-in conversion rate
- App page visits, Applications, App conversion rate
- All shown across: Today / This Week / This Month / This Year / All Time

### Pipeline — Overview
- Loom Videos Sent, Offers Sent (by period)

### Pipeline — 1-2-1 ($5,000)
- Sales count, Revenue, Conversion rate (vs Offers Sent)

### Pipeline — Community ($997)
- Sales count, Revenue, Conversion rate (vs Offers Sent)

### Lifetime Customer Value
- Paying Customers, Total Revenue, Average LTV (all time only)

### Where Leads Come From
- By UTM source / medium, across all time periods

### Platform Performance
- Leads, Applications, Sales broken down by platform (utm_source)

### Upgrade Paths
- How people find the coaching application page (via `upgrade_path` custom field, set by `?ref=` param)

### Content Performance
- Leads, Applications, Sales by content piece + platform

### Email Performance
- Filtered subset of Content Performance where source = email

### Website — Unique Visitors by Page
- Top pages from GA4, excluding preview/legacy pages

---

## Key IDs and config

### GHL
- Location ID: `LRqVZmxns8f3xcJLHzBK`
- API token: stored in script as `GHL_TOKEN` — do not save to any file other than the script

### GA4
- Property ID: `539372524`
- Baseline date: `2026-06-17` (funnel go-live) — used as the start date for Month/Year/All Time GA4 calls
- Connected via: Apps Script → Resources → Advanced Google Services → Analytics Data API

### GHL Custom Field IDs
| Field | ID |
|---|---|
| utm_source | `O468O9YO86rNRlzVDFvn` |
| utm_medium | `0zyrJerhiHpiUOBriIny` |
| utm_campaign | `qcflgCMJt4hmosuySJa0` |
| utm_content | `zFmOgHptnUj3uxT7l1cL` |
| upgrade_path | `WF9bTjccdEhBYkkFOeTZ` |
| sale_date | `2w5Aow7Fv2H1NLXReiC1` (Unix ms timestamp) |
| contact_type | `XkL6qkNeZExcLbKJj7cx` |

---

## Segmentation logic

| Segment | How it's identified |
|---|---|
| Leads | tag contains "meditation download" |
| Applications | tag contains "heart creator applicant" |
| Loom Sent | tag contains "loom sent" |
| Offer Sent | tag contains "offer sent" |
| 1-2-1 Sales | tag contains "heart creator 1-2-1" |
| Community Sales | tag contains "heart creator community" |
| Sales (won) | opportunity status = "won" |
| Staff (excluded) | contact_type custom field = "Staff" |

- Olly's own contact (`olly@ollyhenson.com`) is tagged as Staff and excluded from all metrics
- Sale date is set manually on the opportunity contact as a Unix ms timestamp when a sale closes

---

## Tabs in the sheet

| Tab | Contents |
|---|---|
| 📊 Dashboard | Main dark-themed dashboard — rebuilt on every sync |
| 📈 Charts | 6 charts auto-generated from the data |
| Leads | Raw lead data with UTM fields |
| Applications | Raw applicant data with UTM fields |
| Sales | Raw opportunity data with pipeline stage and sale date |

---

## Common updates

### Add a new excluded page
Find `EXCLUDED_PAGES` near the top of the script and add the path to the array.

### Change the GA4 baseline date
Search for `"2026-06-17"` in the script — there are multiple occurrences in the GA4 fetch calls. Update all of them. Also update `yearStart` in `getPeriodStarts()` if needed.

### Add a new pipeline product
1. Add a new tag filter (e.g. `contacts.filter(c => tags includes "new-product-tag")`)
2. Add `countByPeriods` and `revenueByPeriod` calls for it
3. Pass the new counts into `buildDashboard()`
4. Add the new section inside `buildDashboard()` following the same pattern as the 1-2-1 or Community sections

### Add a new section to the dashboard
Follow the pattern in `buildDashboard()`: `sectionHeader` → `periodHeaders` → `metricRowMulti` rows. Each `metricRowMulti` call advances `row` by 3.

### Add a new chart
Follow the pattern in `buildCharts()`: `writeTable()` to write data, then `makeChart()` to render it. Charts are positioned by row/col anchor in the Charts tab.

---

