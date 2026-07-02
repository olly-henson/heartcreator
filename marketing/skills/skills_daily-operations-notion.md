# Daily Operations — Notion Page Skill

---

## What this is

The Daily Operations page in Notion is the central tracking hub for all recurring content and business operations. It contains sub-pages and databases for each content channel and delivery area.

**Live Notion page:** https://app.notion.com/p/Daily-Operations-36e30e586a0d81c0b131de443f0890ef

---

## Asset

**Setup script:** `C:\Users\Olly\AI OS\marketing\assets\scripts\setup_daily_operations.mjs`

This script creates the Daily Operations page and its first database (YouTube Long-Form Videos) via the Notion API. It is safe to re-run — it checks whether the page already exists before creating anything.

**To run:**
```
node "C:\Users\Olly\AI OS\marketing\assets\scripts\setup_daily_operations.mjs"
```

Requires `NOTION_API_TOKEN` in `C:\Users\Olly\AI OS\marketing\.env`.

---

## What the script builds

| What | Details |
|------|---------|
| Daily Operations page | Top-level page with heading, description, divider, and callout links to sub-pages |
| YouTube Long-Form Content sub-page | Tracking page nested inside Daily Operations |
| YouTube Long-Form Videos database | Full database with Title, Date, Type of Post, Hook, Transcript, Thumbnail Idea, Recorded, Scheduled fields |

---

## Page structure

```
Daily Operations (📋)
  └── YouTube Long-Form Content (🎬)
        └── YouTube Long-Form Videos [database]
  └── Instagram Stories (📱)
        └── Instagram Stories [database]
```

New sections follow the same pattern: a sub-page per content channel, with a database inside it, and a callout block on the main Daily Operations page linking to it.

---

## Sections

### YouTube Long-Form Content
Tracks all YouTube long-form video ideas through from Idea to Published.

**Fields:** Title, Date, Type of Post, Hook, Transcript, Thumbnail Idea, Recorded, Scheduled

### Instagram Stories
Tracks Instagram Story ideas. Entries are either created directly or synced from the YouTube Community Posts database (Idea-status entries only). Same content angle — repurposed for the Stories format.

**Fields:** Title, Type of Post, Status, Post Content, CTA, Date, Image Idea, Rating

**Field mapping from YouTube Community Posts → Instagram Stories:**
| YouTube Community Posts | Instagram Stories |
|------------------------|-------------------|
| Title | Title |
| Type of Post | Type of Post |
| Post Content | Post Content |
| Pinned Comment | CTA |

Only these 4 fields are synced. All other fields are ignored.

**Sync:** Run `sync_community_to_stories.mjs` to pull all Idea-status entries from YouTube Community Posts into this database. Safe to re-run — skips entries that already exist (matched by Title).

**Trigger:** All new YouTube Community Posts entries default to Idea status. This means every new entry should be synced immediately. Run the sync command or ask the agent to "sync stories" at the start of any session.

---

## Scripts

| Script | What it does | Run when |
|--------|-------------|----------|
| `setup_daily_operations.mjs` | Creates the Daily Operations page and YouTube Long-Form Videos database | First-time setup only |
| `setup_instagram_stories.mjs` | Creates the Instagram Stories sub-page and database inside Daily Operations | First-time setup only |
| `sync_community_to_stories.mjs` | Copies Idea-status entries from YouTube Community Posts → Instagram Stories | Any time new ideas are added to YouTube Community Posts |

All scripts live in: `C:\Users\Olly\AI OS\marketing\assets\scripts\`

**To run the sync:**
```
node "C:\Users\Olly\AI OS\marketing\assets\scripts\sync_community_to_stories.mjs"
```

Requires `DAILY_OPS_INSTAGRAM_STORIES_DB_ID` in `.env` (printed when setup script runs).

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
| YouTube Long-Form Videos | Check `.env` | `DAILY_OPS_YOUTUBE_LF_DB_ID` |
| YouTube Community Posts | `36e30e58-6a0d-81d1-8d13-e38b0136d61e` | — |
| Instagram Stories | `38430e58-6a0d-813a-91fa-cf0a9dcb8bf6` | `DAILY_OPS_INSTAGRAM_STORIES_DB_ID` |

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

---

## Never

- Never append a new callout block to the bottom of Daily Operations and assume it's in the right place — always position it explicitly using `after`
- Never link a callout to the sub-page URL — always link to the database directly
- Never copy all fields when syncing between databases — only sync the fields Olly has specified
- Never assume field names match between source and target databases
- Never save scripts to the marketing root folder — always use `assets/scripts/`

---

## Changelog

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
