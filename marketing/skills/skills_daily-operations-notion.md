# Daily Operations — Notion Page Skill

---

## What this is

The Daily Operations page in Notion is the central tracking hub for all recurring content and business operations. It contains sub-pages and databases for each content channel and delivery area.

**Live Notion page:** https://app.notion.com/p/Daily-Operations-36e30e586a0d81c0b131de443f0890ef

---

## Asset

**Setup script:** `C:\Users\Olly\AI OS\marketing\assets\scripts\setup_daily_operations.mjs`

This script originally created the Daily Operations page and its first database (YouTube Long-Form Videos) via the Notion API. YouTube Long-Form is now retired (see below) — the script is kept for reference only, not for re-running.

**To run:**
```
node "C:\Users\Olly\AI OS\marketing\assets\scripts\setup_daily_operations.mjs"
```

Requires `NOTION_API_TOKEN` in `C:\Users\Olly\AI OS\marketing\.env`.

---

## Page structure (current, 2026-07-03)

```
Daily Operations (📋)
  └── Instagram Reels (📸)
        └── Instagram Reels [database]
  └── Instagram Stories (📱)
        └── Instagram Stories [database]
  └── Email Campaigns (✉️)
        └── Email Campaigns [database]
  └── Calendar Management
```

New sections follow the same pattern: a sub-page per content channel, with a database inside it, and a callout block on the main Daily Operations page linking to it.

**Removed 2026-07-03 (fully deleted, sent to Notion trash):** YouTube Long-Form Content, YouTube Community Posts, Skool Community Posts Prompts, Sales Conversations, Client Management, Financial Management. These channels/areas are no longer part of Heart Creator marketing/operations. If any of this data is needed later it will need to be restored from Notion's trash before it's permanently purged.

---

## Sections

### Instagram Reels
Tracks Instagram Reel ideas through from Idea to Published. See `skills/skills_instagram-reels.md` for the content standard.

### Instagram Stories
Tracks Instagram Story ideas through from Idea to Published. See `skills/skills_instagram-stories.md` for the content standard. No longer synced from any other database — written directly for this channel.

**Fields:** Title, Type of Post, Status, Post Content, CTA, Date, Image Idea, Rating

### Email Campaigns
Tracks the meditation nurture sequence and broadcast emails. See `skills/skills_email-creation.md` for the content standard.

---

## Scripts

| Script | What it does | Status |
|--------|-------------|--------|
| `setup_daily_operations.mjs` | Originally created the Daily Operations page and YouTube Long-Form Videos database | Retired — kept for reference only |
| `setup_instagram_stories.mjs` | Created the Instagram Stories sub-page and database inside Daily Operations | First-time setup only, already run |
| `sync_community_to_stories.mjs` | Previously copied Idea-status entries from YouTube Community Posts → Instagram Stories | Retired 2026-07-03 — YouTube Community Posts database no longer exists |

All scripts live in: `C:\Users\Olly\AI OS\marketing\assets\scripts\`

---

## Adding a new section

When Olly asks to add a new content channel or operations area to Daily Operations:

1. Create a new sub-page inside the Daily Operations page via the Notion API
2. Create the relevant database inside that sub-page
3. Add a callout block to the main Daily Operations page **positioned immediately after the most relevant existing section** — not appended to the bottom
4. The callout must link directly to the **database**, not the sub-page
5. Write a setup script for it and save to `assets/scripts/`
6. Update this skills file with the new section

---

## Known database IDs

| Database | ID | Env var |
|----------|----|---------|
| Instagram Reels | `36e30e58-6a0d-81e7-8c2a-e6c4f729915a` | — |
| Instagram Stories | `38430e58-6a0d-813a-91fa-cf0a9dcb8bf6` | `DAILY_OPS_INSTAGRAM_STORIES_DB_ID` |
| Email Campaigns | `36e30e58-6a0d-811c-b455-ce8fe3da15be` | — |

When any setup script runs successfully it prints the database ID. Save it to `.env` immediately.

---

## Rules

- Never delete or recreate the Daily Operations page without explicit instruction from Olly
- Always check the page exists before running setup (the script does this automatically)
- Save any new database IDs to `.env` as soon as they are created
- New databases must follow the same sub-page pattern — database inside sub-page, callout on main page
- All scripts must be saved to `C:\Users\Olly\AI OS\marketing\assets\scripts\` — never the marketing root folder or any other location
- Callout blocks must link to the **database URL** directly, not the sub-page URL — check the existing callouts (e.g. YouTube Community Posts) to confirm the correct URL format
- When adding a callout to Daily Operations, always use the `after` parameter to position it in the right place — never rely on append order
- When syncing fields between databases, only map the fields Olly has explicitly specified — do not carry across additional fields as a convenience
- Field names do not always match between databases — always confirm the target field name before mapping (e.g. "Pinned Comment" in YouTube Community Posts → "CTA" in Instagram Stories)
- When retiring a section from Daily Operations, still ask whether to fully delete or just unlink before acting — but default the recommended option to **full deletion**, not unlinking. Olly chose full deletion twice in the same session (the 5-section batch, then the Financial Management follow-up) even after unlinking was offered as the safer-sounding default. Once a business area is genuinely retired, he wants it gone, not orphaned

---

## Never

- Never append a new callout block to the bottom of Daily Operations and assume it's in the right place — always position it explicitly using `after`
- Never link a callout to the sub-page URL — always link to the database directly
- Never copy all fields when syncing between databases — only sync the fields Olly has specified
- Never assume field names match between source and target databases
- Never save scripts to the marketing root folder — always use `assets/scripts/`

---

## Changelog

**2026-07-03 — Self-review: default to full deletion when retiring sections**

Reviewed the two deletion decisions made earlier this session (5-section batch, then Financial Management). Both times Olly was offered "unlink vs fully delete" as a genuine open choice, and both times he chose full deletion. Lesson: this isn't a coin flip — once a business area is confirmed retired, the expected answer is full deletion. Added as a rule so the question is still asked (destructive action, always confirm) but framed with full deletion as the default recommendation rather than a neutral toss-up.

**2026-07-03 — YouTube/Skool/Sales/Client sections removed**

Olly confirmed Heart Creator marketing now runs on Instagram Reels, Instagram Stories and Email only, with no repurposing between channels. Removed from the live Daily Operations page (fully deleted, sent to Notion trash, not just unlinked):
- YouTube Long-Form Content (sub-page + database + callout)
- YouTube Community Posts (sub-page + database + callout)
- Skool Community Posts Prompts (sub-page + database + callout)
- Sales Conversations (sub-page + database + callout)
- Client Management (sub-page + callout — linked to a Google Sheet, sheet itself untouched)

Page structure, sections, scripts table and known database IDs all updated to reflect the current 4-section page: Instagram Reels, Instagram Stories, Email Campaigns, Calendar Management. The `sync_community_to_stories.mjs` script is retired since its source database no longer exists.

**2026-07-03 — Financial Management removed (follow-up)**
Olly confirmed Financial Management should also be fully deleted (not just unlinked), same treatment as the other 5 sections. Sub-page, database and callout sent to Notion trash. Page structure updated to 4 sections.

**2026-06-19 — Post-build review**

Rules and process updated based on corrections made during the Instagram Stories build:

- Added rule: callout blocks must link to the database URL, not the sub-page URL (corrected after initial setup linked to sub-page)
- Added rule: callout positioning must use the `after` parameter — the setup script appended to the bottom and required manual repositioning
- Added rule: only sync explicitly specified fields — initial sync script copied all fields; Olly specified only Title, Type of Post, Post Content, and Pinned Comment → CTA
- Added rule: field names do not always match between databases — "Pinned Comment" maps to "CTA" in Instagram Stories
- Added rule: all scripts must live in `assets/scripts/` (lowercase) — clarified after initial path confusion
- Updated Instagram Stories field list to reflect actual fields including CTA (renamed from Pinned Comment)
- Added field mapping table to Instagram Stories section
- Added sync trigger note — all new YouTube Community Posts default to Idea, so sync should run after every content creation session
- Updated Known database IDs table — Instagram Stories ID now hardcoded, not just an env var reference
