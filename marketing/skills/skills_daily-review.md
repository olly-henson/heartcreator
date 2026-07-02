# Skill: Daily Review & System Improvement

> Load this skill whenever you are asked to run a daily review, end-of-session review, or system improvement pass. It covers both the local Claude Code session review (run by you at the end of each working session) and the nightly remote agent review (run automatically at 5pm Cape Town time).

---

## Purpose

This system improves through use. Every session surfaces new knowledge — about the audience, about what content works, about voice and tone, about gaps in the instructions. This skill captures that knowledge and writes it back into the system so it accumulates over time.

**The rule:** No feedback should be given twice. If Olly corrects something, it gets written into the system immediately.

---

## When to Run This

- **End of every local session** — before closing, run the Local Session Review below
- **Automatically at 5pm Cape Town** — the remote agent runs the Full Audit below
- **On demand** — if Olly asks for a review or system update at any point

---

## Local Session Review (Claude Code — End of Session)

Run this at the end of every working session in `C:\Users\Olly\AI OS\marketing`.

### Step 1 — Extract lessons from the session

Look back through the conversation just completed. Identify:

- **Corrections** — did Olly push back on something, ask for a change, or say "no, not like that"? That's a rule to add.
- **Approvals** — did Olly say "yes, exactly" or accept something without pushback that might surprise a future AI? That's worth keeping.
- **New information** — did Olly mention something about the audience, the business, the offer, or the brand that isn't in the files?
- **Content created** — was any content drafted, planned, or published in this session?
- **Patterns** — did anything come up more than once that suggests a gap in the current instructions?

### Step 2 — Update the relevant files

All files live at `C:\Users\Olly\AI OS\marketing`.

| What changed | File to update |
|---|---|
| Voice, tone, writing style feedback | `skills/skills_brand-voice.md` |
| New banned word or phrase | `AGENT.md` (Banned Words section) + `skills/skills_brand-voice.md` |
| New hallmark phrase identified | `AGENT.md` (Hallmark Phrases section) |
| Content structure or format feedback | `skills/skills_content-formula.md` |
| Audience insight or pain point added | `AGENT.md` (Target Audience section) + `memory/memory_audience-insights.md` |
| Instagram-specific feedback | `skills/skills_instagram-strategy.md` |
| YouTube-specific feedback | `skills/skills_youtube-strategy.md` |
| Email feedback | `skills/skills_email-marketing.md` |
| Blog/SEO feedback | `skills/skills_blog-seo-guide.md` |
| Content planning or calendar feedback | `skills/skills_content-strategy.md` |
| Content created in this session | `memory/memory_content-log.md` |
| New campaign or key date | `memory/memory_calendar.md` |
| Performance data mentioned | `memory/memory_performance.md` |
| What the AI may/may not do automatically | `governance.md` |
| Business info, offer, or funnel update | `AGENT.md` |

**Rules when updating files:**
- Never delete existing content — add to it or refine it
- Never fabricate data, results, or testimonials
- If uncertain whether something is a permanent rule or one-off preference, add it with a note: `<!-- Added [date] — review if still relevant -->`
- Keep language consistent with British English throughout
- No marketing jargon, no banned words

### Step 3 — Log content created

If any content was drafted or planned in this session, add an entry to `memory/memory_content-log.md`:

```
### [Date] — [Platform] — [Format]
- **Title/Hook:** [First line or title]
- **Pillar:** [Content pillar number and name]
- **Status:** Draft / Scheduled / Published
- **Link:** [URL if published]
- **Notes:** [Any context]
```

### Step 4 — Commit and push to GitHub

After all updates are complete, push the changes so the nightly agent sees them:

```
cd "C:\Users\Olly\AI OS\marketing"
git add .
git commit -m "Session review: [one-line summary of what changed]"
git push
```

---

## Full Audit (Remote Agent — 5pm Cape Town Daily)

The remote agent clones `https://github.com/olly-henson/marketing-os` and runs this audit automatically each day.

### Step 1 — Check git log for today's activity

```bash
git log --since='24 hours ago' --pretty=format:'%h %ai %s' --stat
```

If changes were pushed today, read the changed files closely — they contain the day's lessons and content. If no changes, proceed with the quality audit regardless.

### Step 2 — Read all files

Read every file in full. Flag:
- Template placeholders still empty (fill where possible using context from other files)
- Inconsistencies across files (e.g. a brand rule in `AGENT.md` not reflected in a skill file)
- Skill files that don't reference the banned words list
- Memory files with gaps that can be inferred from other files
- Seasonal dates in the next 30 days not yet in `memory/memory_calendar.md`

### Step 3 — Improve and update

Apply improvements directly. The same rules apply as the local session review:
- Never fabricate
- Never delete existing entries from memory files
- Sync rules across files for consistency
- Flag uncertainty with `<!-- AI NOTE: [note] -->` rather than guessing
- British English throughout
- No banned words

### Step 4 — Commit and push

```bash
git config user.email "ai-agent@ollyhenson.com"
git config user.name "Marketing OS Agent"
git add -A
git commit -m "Daily review: [brief summary of improvements made]"
git push origin main
```

If nothing needed improvement, log a review entry in `memory/memory_content-log.md` and push that.

---

## Quality Checklist

Before marking any review complete, confirm:

- [ ] All feedback from the session is captured in a file
- [ ] No banned words introduced in any updates
- [ ] British English used throughout
- [ ] Content log updated if anything was created
- [ ] No fabricated data, results, or claims added
- [ ] Changes pushed to GitHub
