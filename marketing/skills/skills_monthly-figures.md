# Monthly Marketing Figures — Google Sheets

## Agent ownership

This sheet is built and managed by the **Marketing Assistant** Claude agent (this agent). When asked to help with, update, or extend the Monthly Marketing Figures sheet — including adding new columns, new sections, or fixing data issues — handle it directly using this skills file and the local script as the starting point.

---

## What this is

A standalone Google Sheet that stores a permanent month-by-month record of all key marketing metrics. Each time `syncMonth()` is run, it writes the current month's figures as a new row in every section. Previous months are never overwritten.

**Sheet name:** Monthly Marketing Figures (separate Google Sheet, not a tab in the GHL Dashboard)
**Script file (local copy):** `C:\Users\Olly\AI OS\marketing\monthly-figures-apps-script.js`
**Gitignored:** Yes — contains live API token, never commit

---

## How to run

1. Open the **Monthly Marketing Figures** Google Sheet
2. Go to **Extensions → Apps Script**
3. Paste the full contents of `monthly-figures-apps-script.js` into `Code.gs`
4. Run `syncMonth()`

**When to run:** Once at the end of each month (or start of the next). June, July, August etc. stack up as rows over time.

**Re-running in the same month:** Safe — overwrites that month's row with the latest figures. Never duplicates.

**Running in a new month:** Writes a new row for that month. June's data is untouched.

---

## First-time setup

On the very first run the script:
1. Creates a tab called **Monthly Marketing Figures** inside the active sheet
2. Builds all section headers and column headers
3. Writes the current month as the first data row

**Required:** Google Analytics Data API must be enabled in Apps Script:
- Apps Script → Services (`+`) → Google Analytics Data API → Add

---

## Sections tracked

Each section is a separate table. Months are rows, metrics are columns.

| Section | Metrics |
|---|---|
| Funnel Overview | Opt-in Visits, Leads, Lead Conv%, App Visits, Applications, App Conv% |
| Pipeline — Overview | Looms Sent, Offers Sent |
| Pipeline — 1-2-1 ($5,000) | Sales, Revenue, Conv% vs Offers |
| Pipeline — Community ($997) | Sales, Revenue, Conv% vs Offers |
| Total Revenue | Total Revenue (1-2-1 + Community) |
| LTV (cumulative) | Paying Customers, Total Revenue, Average LTV — all-time snapshot at time of sync |
| Where Leads Come From | By UTM source/medium — fixed platforms + other |
| Platform Performance — Leads | Leads by platform |
| Platform Performance — Applications | Applications by platform |
| Platform Performance — Sales | Sales by platform |
| Upgrade Paths | How people find /coaching-application — fixed paths + other |
| Content Performance — Top 5 by Leads | Top 5 content pieces that generated leads that month |
| Website — Unique Visitors by Page | Fixed tracked pages |

---

## Fixed values (columns that don't change automatically)

### Platforms (`KNOWN_PLATFORMS`)
`instagram`, `youtube`, `email`, `direct`, `facebook`, `tiktok`

Unknown sources go into an **other** column automatically.

### Upgrade paths (`KNOWN_PATHS`)
`thank-you-page`, `meditation-access`, `practice-guide`, `instagram-bio`, `youtube-description`, `youtube-community`, `email`

Unknown paths go into an **other** column automatically.

### Website pages tracked
`/meditation`, `/coaching-application`, `/thank-you`, `/meditation-access`, `/practice-guide`, `/`, `/about`, `/blog`

---

## How to update the script

1. Read the local file: `C:\Users\Olly\AI OS\marketing\monthly-figures-apps-script.js`
2. Make the required changes
3. Copy the updated script and paste into Apps Script in the Monthly Marketing Figures Google Sheet, replacing existing code
4. Run `syncMonth()` to verify
5. Save the updated version back to the local file — it is the source of truth

---

## Common updates

### Add a new platform
1. Add it to `KNOWN_PLATFORMS` array in the script
2. Add it as a new column header in `buildShellMonthly()` for all four platform sections (Where Leads Come From + the three Platform Performance sections)
3. Add it to the `writeRow()` calls in `writeMonthData()` for those sections
4. Manually add the column header in the existing sheet before next run

### Add a new upgrade path
1. Add it to `KNOWN_PATHS` array
2. Add it as a new column in the Upgrade Paths section in `buildShellMonthly()`
3. Add it to the `writeRow()` call in `writeMonthData()`
4. Manually add the column header in the existing sheet

### Add a new section entirely
1. Add a `writeSectionHeader()` + `writeTableHeader()` block in `buildShellMonthly()`
2. Add the data fetch logic in `syncMonth()`
3. Add a `writeRow()` call in `writeMonthData()`
4. The shell only needs rebuilding if the sheet is brand new — for an existing sheet, add the section manually at the bottom and the script will find it by header label

### Change tracked website pages
Update the `TRACKED_PAGES` array and the `writeRow()` call for the Website section in `writeMonthData()`, and update the column headers in `buildShellMonthly()`.

---

## Key IDs and config

Same GHL and GA4 config as the main dashboard — see `skills/skills_ghl-dashboard.md` for full field ID reference.

- GHL Token: stored in script as `GHL_TOKEN` — gitignored, never share
- GA4 Property ID: `539372524`
- Data pulled per month using `dateAdded` for contacts and `sale_date` custom field (Unix ms) for sales

---

## Security

Script contains a live GHL API token. Listed in `.gitignore` — never commit. See `skills/skills_ghl-dashboard.md` for full security notes.

---

## Rules and Constraints

### Never
- Never assume the Monthly Marketing Figures sheet lives inside the GHL Dashboard sheet — it is a **separate Google Sheet** with its own Apps Script project.
- Never describe the output as "a new tab in the existing dashboard" — it is its own standalone sheet.
- Never assume Google Analytics Data API is enabled in a new Apps Script project — always include it as an explicit setup step.
- Never suggest Olly needs to create the tab manually — the script creates it automatically on first run.
- Never suggest Olly needs to create the Google Sheet manually — they should create the sheet first themselves, then paste the script in. The script creates the tab inside whatever sheet is active, not a brand new Google Sheet from scratch.

### Always
- When giving setup instructions, make clear the sheet must be created first by Olly, then the script is pasted into that sheet's Apps Script project.
- Always clarify that previous months are permanently safe — running `syncMonth()` in July does not touch June's data. This is a common concern and must be addressed proactively.
- When asked "will I lose old data?" — reassure clearly: only the current month's row is written or overwritten. All other rows are untouched.
- Always specify that the script file type in Apps Script is **Script** (`.gs`), not HTML — Olly asked this directly.

### Layout decision (confirmed by Olly)
- Months as **rows**, metrics as **columns** — this is the confirmed layout. Do not revert to columns-for-months in future builds of similar sheets.

---

## Changelog

- **2026-06-30** — Skills file created alongside script build. Key lessons from session: sheet is standalone not a tab; Analytics Data API must be enabled manually; script creates the tab not the sheet; months-as-rows confirmed as preferred layout; data permanence (old months never overwritten) must be proactively confirmed to user. Rules and Constraints section added.
