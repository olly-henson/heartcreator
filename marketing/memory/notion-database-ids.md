---
name: notion-database-ids
description: Master reference for all Notion database IDs and page URLs — read this before any Notion task
metadata:
  type: reference
---

# Notion Database IDs — Master Reference

> Read this file before any Notion task. Never ask Olly for a database ID or page URL — it is here.

---

## Content Databases

| Database | Notion Database ID | Used In |
|----------|--------------------|---------|
| YouTube Long-Form Videos | `36e30e58-6a0d-81d4-98d3-e68d37478fc1` | `skills_youtube-longform.md` |
| YouTube Community Posts | `36e30e58-6a0d-81d1-8d13-e38b0136d61e` | `skills_repurposing-content.md`, `skills_youtube-community.md` |
| Instagram Reels | `36e30e58-6a0d-81e7-8c2a-e6c4f729915a` | `skills_instagram-reels-db.md` |
| Instagram Stories | `38430e58-6a0d-813a-91fa-cf0a9dcb8bf6` | `skills_repurposing-content.md` |
| Email Broadcast Campaigns | `36e30e58-6a0d-811c-b455-ce8fe3da15be` | `skills_repurposing-content.md`, `skills_email-marketing.md` |

---

## Key Pages

| Page | URL |
|------|-----|
| Daily Operations | https://app.notion.com/p/Daily-Operations-36e30e586a0d81c0b131de443f0890ef |

---

## How to Use These IDs

- **Querying a database:** use `mcp__notion__API-query-data-source` with the database ID above
- **Retrieving database structure:** use `mcp__notion__API-retrieve-a-database`
- **Finding a specific entry:** use `mcp__notion__API-post-search` with the title text
- **Updating a page property:** use `mcp__notion__API-patch-page` with the page ID returned from search

---

## Notes

- The Email Broadcast Campaigns DB and the YouTube Community Posts DB share a similar ID prefix — double-check before writing
- When Olly shares a Notion URL in the format `https://app.notion.com/p/[slug]-[ID]`, the ID is the last 32 characters of the URL (no dashes). Format as UUID: 8-4-4-4-12
- Database IDs for new databases created via script are also saved to `C:\Users\Olly\AI OS\marketing\.env`
