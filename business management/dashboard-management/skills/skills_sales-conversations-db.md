# Sales Conversations Database — Management Skill

> Load this skill when reviewing, updating or analysing sales conversations. It contains the database structure, field definitions, and prompts for follow-up and objection handling.

---

## Database Reference

| Item | Value |
|------|-------|
| Database ID | `36e30e58-6a0d-817f-85e4-deceb5642cf8` |
| Notion Page | https://www.notion.so/36e30e586a0d817f85e4deceb5642cf8 |
| Updated by | Olly — manually, after each conversation |
| One row per conversation | Yes — two conversations in one day = two rows |

---

## Database Fields

| Field | Type | Notes |
|-------|------|-------|
| Prospect Name | Title | First name or full name |
| Date | Date | Date of the conversation |
| Joined Skool Community | Checkbox | Have they joined the free Skool community? |
| DM Conversation | Checkbox | Has a DM conversation taken place? |
| Sent Training | Checkbox | Has the Heart Coherence training link been sent? |
| Watched Training & Responded | Checkbox | Have they watched it and replied? |
| Joined Back to Life | Checkbox | Have they joined the Back to Life email sequence? |
| Objections | Text | Any objections raised — exact words where possible |
| Conversation Notes | Text | Context, tone, next steps, anything relevant |

---

## How to Use

After each sales conversation, create a new row and fill in:
1. Prospect Name and Date
2. Tick any checkboxes that apply at this point
3. Add a brief DM Conversation summary — key points, their words where possible
4. Log any objections in the Objections field — exact quotes are best
5. Add any context or next steps to Conversation Notes

Update the row as the conversation progresses — tick checkboxes as each milestone is reached.

---

## The Conversion Path

Each prospect moves through these stages in order:

| Stage | Checkbox | What happens |
|-------|----------|-------------|
| Joins Skool Community | Joined Skool Community | Olly sends DM with training link |
| Training sent | Sent Training | Prospect receives the Heart Coherence training |
| Training watched | Watched Training & Responded | Prospect replies — opens the sales conversation |
| Joins sequence | Joined Back to Life | Prospect added to the Back to Life email sequence |

---

## Before Using the Prompts

Always read:
1. `C:\Users\Olly\AI OS\marketing\prospect_intel.md` — real prospect language and objections
2. `C:\Users\Olly\AI OS\marketing\argument_sheet.md` — the argument stages to match follow-up to
3. `C:\Users\Olly\AI OS\marketing\CLAUDE.md` — brand voice and tone rules

---

## Reviewing Open Conversations

Run when you want to identify who needs a follow-up and what to say.

**Prompt:**
```
Load the dashboard management skill from C:\Users\Olly\AI OS\dashboard-management\skills\skills_sales-conversations-db.md and the marketing skills from C:\Users\Olly\AI OS\marketing. Review the Sales Conversations database (ID: 36e30e58-6a0d-817f-85e4-deceb5642cf8) and identify any prospects who: (1) joined the Skool community but haven't been sent the training yet, (2) were sent the training but haven't responded, or (3) have open objections with no follow-up. For each one, suggest a specific next action or follow-up message based on where they are in the conversation. Read prospect_intel.md first for relevant language and objection handling angles.
```

---

## Syncing New Prospects from GHL

Run whenever you've added new contacts in GHL and want to pull them into the database. Only adds new rows — never removes or overwrites existing ones.

**Prompt:**
```
Load the dashboard management skill from C:\Users\Olly\AI OS\dashboard-management\skills\skills_sales-conversations-db.md. Fetch all contacts tagged "Back to Life Prospect" from GoHighLevel. Compare against the existing rows in the Sales Conversations database (ID: 36e30e58-6a0d-817f-85e4-deceb5642cf8). Add any contacts not already in the database as new rows with their name and today's date. Do not remove, edit or overwrite any existing rows.
```

---

## Analysing Objections

Run when you want to understand patterns across conversations and prepare responses.

**Prompt:**
```
Load the dashboard management skill from C:\Users\Olly\AI OS\dashboard-management\skills\skills_sales-conversations-db.md and the marketing skills from C:\Users\Olly\AI OS\marketing. Read the Objections field across all rows in the Sales Conversations database (ID: 36e30e58-6a0d-817f-85e4-deceb5642cf8). Identify the most common objections and suggest responses for each one, drawing on prospect_intel.md and argument_sheet.md. Write responses in Olly's voice — warm, honest, peer-level, never pushy.
```

---

## Notion Views

| View | Filter | Sort |
|------|--------|------|
| Active | Joined Back to Life is unchecked | Date descending |
| All Conversations | None | Date descending |
| Converted | Joined Back to Life is checked | Date descending |

---

## Rules

1. One row per conversation — not per prospect. Two conversations with the same person = two rows.
2. Log objections in the prospect's own words wherever possible — exact language is valuable for content and follow-up
3. Never fabricate conversation details — only log what actually happened
4. Use Conversation Notes for anything that doesn't fit the other fields — tone, energy, context, next steps
5. Review open conversations weekly at minimum — prospects go cold quickly
