# GHL Dashboard — Google Sheets

## Agent ownership

This dashboard is built and managed by the **Marketing Assistant** Claude agent (this agent). When asked to help with, update, or build similar Google Sheets + Apps Script dashboards — including new data sources, new pipeline products, or entirely new dashboard scripts — this agent should handle it directly using the skills file and local script as the starting point.

## Monthly Marketing Figures

A second script — `monthly-figures-apps-script.js` — writes a side-by-side monthly comparison sheet called **Monthly Marketing Figures** into the same Google Sheet.

**How to run:** Paste `monthly-figures-apps-script.js` into Apps Script alongside the main script → run `syncMonth()` at the end of each month.

**Key behaviour:** Running `syncMonth()` writes the current month as a new row in every section. Re-running it for the same month overwrites that month's row — it never duplicates. Previous months are never touched.

**Sections tracked (months as rows, metrics as columns) — updated 2026-07-02:**
- Funnel Overview: Opt-in Visits, Leads, Lead Conv%, About Page Visits, Free Trials, About Page Conv. Rate, Free Trials Conv., MRR ($)
- Where Leads Come From (by source)
- Platform Performance — Leads / Applications / Sales
- Upgrade Paths
- Content Performance — Top 5 by Leads
- Website Pages (unique visitors)

**Retired 2026-07-02:** Pipeline Overview, Pipeline 1-2-1, Pipeline Community, Total Revenue, and LTV sections are gone. Heart Creator no longer tracks "won" opportunities as a metric — the business model moved to a Skool subscription (see Pricing note below) where GHL can no longer see revenue events directly. Do not re-add a Sales/Pipeline/LTV section unless a new trackable revenue source exists — a zeroed-out dead metric is worse than no section at all.

**Fixed platforms:** instagram, youtube, email, direct, facebook, tiktok. To add a new one, update `KNOWN_PLATFORMS` in the script and add the column to the shell header in `buildShellMonthly()`.

**Fixed upgrade paths:** thank-you-page, meditation-access, practice-guide, instagram-bio, youtube-description, youtube-community, email. Update `KNOWN_PATHS` to add new ones.

---

## Security

The local script file `ghl-dashboard-apps-script.js` contains a live GHL API token and must never be committed to git or shared publicly. It is listed in `C:\Users\Olly\AI OS\marketing\.gitignore` alongside `.env` files. If this folder is ever connected to a GitHub repo, verify `.gitignore` is in place before the first push.

---

## Pricing model (confirmed 2026-07-02)

Heart Creator Community is Skool-only: **$30/month or $300/year**, with a **7-Day Free Trial** (card required, auto-converts unless cancelled). The $5,000 1-2-1 program and $997/yr Community tier are both retired. See [[project_heart_creator_pricing]] memory for full detail. Never reference the old figures in this script or its dashboard labels.

**MRR calculation** (used in the monthly tracker, not this dashboard): `(monthly subscribers × $30) + (annual subscribers × $300 ÷ 12)`.

---

## Rules and Constraints

### Never
- Never assume the local script file exists — always verify with a directory listing before referencing it. If it's missing, ask Olly to paste the current script so it can be saved locally first.
- Never save real API tokens anywhere other than the two gitignored script files. Skills files, memory files, and CLAUDE.md must never contain live token values.
- Never commit `ghl-dashboard-apps-script.js` or `monthly-figures-apps-script.js` — both are gitignored for this reason.
- Never keep dead/parked scripts in the folder if they contain token references, even in comments. Delete them rather than letting them sit.
- Never assume a new Google Sheet or Apps Script project has the Analytics Data API enabled — always include it as an explicit setup step when giving instructions.
- Never leave a metric section showing permanent zeros after the underlying data source stops being trackable (e.g. LTV/Pipeline once "won" opportunities can no longer be synced from Skool) — remove the section and its computation entirely rather than leaving dead placeholders. This includes deleting now-unused variables/helper functions in the script, not just the dashboard-build lines that reference them.
- Never assume a script change to a section header (column names) will retroactively apply to an existing live Google Sheet — `buildDashboard()`/`buildShellMonthly()` only run their shell-building logic on a brand-new sheet. If columns change on an existing sheet, write a one-time migration function (e.g. `fixFunnelOverviewHeader()`, `removeRetiredPipelineSections()`) that Olly runs once, separate from the regular sync function.
- Never make a manual-entry field a single flat value if the equivalent automated metric is broken out by period (Today/Week/Month/Year/All Time) — Olly expects manual entries to mirror that same period structure so they read consistently against the automated rows above them.

### Always
- Always check `.gitignore` covers all token-containing files before confirming the folder is safe to push.
- When asked about security, scan all file types (`.md`, `.js`, `.mjs`, `.json`) not just the obvious ones — tokens can appear in comments.
- When a script is deleted (e.g. dashboard-worker.js), remove all references to it from skills files, memory files, and `.gitignore` in the same session.
- Always save an updated local copy of the script after any edit — the local file is the source of truth, not what's pasted in Apps Script.
- When the business model changes (e.g. retiring a pricing tier or product), sweep the whole script for stale references — hardcoded dollar figures, tag names, and section labels tied to the old model — not just the section the user explicitly flagged.

---

## Changelog

- **2026-07-02** — Business model shift: Heart Creator is now Skool-only at $30/mo or $300/yr with a 7-Day Free Trial; $5,000 1-2-1 and $997/yr Community tiers fully retired. Removed Pipeline (Overview/1-2-1/Community), Total Revenue, and LTV sections and their underlying computations entirely rather than leaving zeroed placeholders. Monthly tracker's Funnel Overview columns changed to reflect the new funnel (About Page Visits, Free Trials, conversion rates, MRR). Added one-time migration functions for existing sheets since header/section changes don't retroactively apply. Manual entries restructured to break out by period (Today/Week/Month/Year/All Time) rather than a single flat value, matching the automated rows.
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

**Updated 2026-07-02:** This dashboard now tracks the meditation lead funnel only — Opt-in Visits, Leads, and Opt-in Conv Rate. Pipeline/Sales/LTV tracking was removed entirely (see Changelog). Community-level metrics (Free Trials, About Page Visits, etc.) live on the separate Monthly Marketing Figures sheet instead — see `skills_monthly-figures.md`.

### Funnel Overview
- Opt-in page visits, Leads, Opt-in conversion rate
- All shown across: Today / This Week / This Month / This Year / All Time

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
| Staff (excluded) | contact_type custom field = "Staff" |

**Retired 2026-07-02:** Applications, Loom Sent, Offer Sent, 1-2-1 Sales, Community Sales, and Sales (won) tags/logic are no longer used by this dashboard — those belonged to the retired 1-2-1 application funnel. "Community Sales" (`heart creator community` tag) is still used by the separate Monthly Marketing Figures sheet to count Free Trials — see `skills_monthly-figures.md`.

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

