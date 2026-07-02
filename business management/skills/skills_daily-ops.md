# Skill: Daily Operations

## When to use this skill
Use at the start of every session in this project. Surfaces priorities, checks delivery status, and sets the focus for the session.

---

## Step 1 — Read the priority list

Read `C:\Users\Olly\AI OS\business management\priorities.md` and surface:
- The top 3 active tasks right now
- Anything blocked
- What was recently completed

Present it cleanly in this format:

---
**Today's top priorities:**
1. [task]
2. [task]
3. [task]

**Blocked:** [anything stalled and why, or "nothing blocked"]

**Recently done:** [last completed items, or "nothing logged yet"]

---
Then ask: "What do you want to focus on?"

---

## Step 2 — Load the right context

Based on what Olly picks, load the relevant files before starting work:

| Focus | Files to load |
|---|---|
| YouTube long-form | `marketing/skills/skills_youtube-strategy.md`, `marketing/skills/skills_content-formula.md` |
| Instagram Reels | `marketing/skills/skills_instagram-strategy.md`, `marketing/skills/skills_instagram-reel-headlines.md` |
| YouTube Community Posts | `marketing/skills/skills_youtube-community.md` |
| Instagram Stories | `marketing/skills/skills_instagram-strategy.md` |
| Email autoresponder | `marketing/skills/skills_email-marketing.md` |
| Regulate & Restore delivery | `delivery/regulate-restore-delivery-system.md`, `delivery/skills/skills_regulate-restore-tracker.md` |
| Heart Creator Program | `marketing/CLAUDE.md` (for positioning and pricing) |
| Brand voice check | `marketing/skills/skills_brand-voice.md` |

Always load `marketing/CLAUDE.md` for brand voice and audience if producing any copy.

---

## Step 3 — Update priorities when done

When a task is completed in the session, move it to the Completed section in `priorities.md` with today's date. If new tasks come up, add them to Active or Backlog.

---

## Content rules (apply to all copy)

- No em-dashes or hyphens as clause separators — use full stops
- No comma before 'and' or 'or'
- No emoji unless Olly asks
- GHL merge tag for first name: `{{contact.first_name}}`
- Default codeword: HEART
- YouTube Community Posts: blank line after every single line/phrase
- Personal story posts: vary the CTA, don't pitch every time

---

## MCP / integrations

- When an MCP is added via Claude Code settings, a full session restart is required before it becomes available
- Run ToolSearch to confirm an MCP is live before telling Olly it's connected
- If ToolSearch returns nothing, prompt Olly to restart Claude Code fully (close and reopen, not just a new chat)

---

## CLAUDE.md standards (business management)

- The business management CLAUDE.md must match the depth of `C:\Users\Olly\AI OS\marketing\CLAUDE.md`
- Role is Business Manager & PA — not a content or marketing role
- Always includes: identity, offers, funnel architecture, delivery, audience summary, writing rules, daily ops routine, skills table, ethics

---

<!-- Changelog
2026-06-25 — Added MCP restart rule (Gmail MCP didn't appear after connection; session restart required). Added CLAUDE.md depth standard (Olly confirmed business management CLAUDE.md must match marketing version in detail and structure).
-->
