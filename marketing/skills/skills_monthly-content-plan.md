# Skill: Monthly Content Planning

> Use this skill to generate the full monthly content plan for Instagram and YouTube. Plans are created by the 20th of each month for the following month. Output goes into two separate Notion databases — one per platform.

---

## Output Targets

| Platform | Volume | Format | Notion Database |
|---|---|---|---|
| Instagram | 1 Reel/day, daily (7/week, ~30/month) | Headline, hook, key points | Instagram Reels Planner |

**Note (2026-07-04):** YouTube is retired for Heart Creator — see [[project_heartcreator_fulfilmentcoaching_split]]. The YouTube row and any YouTube-specific instructions elsewhere in this file are stale and should be ignored.

---

## Notion Database Schemas

### Instagram Reels Planner

One row per Reel. Fields:

| Field | Type | Notes |
|---|---|---|
| Headline | Title | The content topic/angle in one line |
| Hook | Text | The opening line or visual hook for the Reel |
| Key Points | Text | 3–5 bullet points to cover in the video |
| Content Pillar | Select | Argument / Educational / Mission / Client Success / Engagement / Personal |
| Scheduled Date | Date | The day this Reel is planned for |
| Status | Select | Draft → Pending Approval → Approved → Posted |
| Notes | Text | Olly's feedback, revision requests, or transcript insights |

### YouTube Content Planner

One row per video. Fields:

| Field | Type | Notes |
|---|---|---|
| Video Title | Title | The YouTube video title — optimised for search and click-through |
| Hook | Text | The opening 30 seconds — what to say to keep viewers watching |
| Key Talking Points | Text | 5–8 structured points to cover in the video body |
| Content Pillar | Select | Argument / Educational / Mission / Client Success / Engagement / Personal |
| Scheduled Date | Date | The planned publish date |
| Status | Select | Draft → Pending Approval → Approved → Recorded → Posted |
| Transcript Notes | Text | Insights added after the video is recorded and transcript reviewed |
| Notes | Text | Olly's feedback or revision requests |

---

## Content Planning Rules

### Pillar Distribution

Distribute content across the 6 pillars each week. Suggested weekly ratios:

**Instagram (7 Reels/week, 1/day, confirmed 2026-07-04 now that YouTube is retired):**

Reels only use the three types in `skills/skills_instagram-reels.md`: Belief-Changing, Practical, Client Success. Engagement and Personal Update content lives on Instagram Stories instead — see `skills/skills_instagram-stories.md`. Rotate the three Reel types across the week rather than assigning a fixed pillar per day; this table is a starting distribution, not a rigid schedule:

- Most days — Belief-Changing (the core format)
- 1–2 days/week — Practical (a live technique/practice on screen)
- As available — Client Success (real proof, Isabell/Anas or future clients)

See the Weekly Cadence table in `skills/skills_content-strategy.md` for further guidance — note that table may also still reference the retired 5-day/Engagement structure and should be read with this update in mind.

**YouTube (3/week):**
- Argument: 1 per week
- Educational: 1 per week
- Mission or Client Success: 1 per week (alternate)

### Voice Rules (apply to every entry)

- British English throughout
- No banned words: game changer, deep dive, synergy, leverage (as verb), hustle, grind, low-hanging fruit, unlock, skyrocket, supercharge
- Headlines and hooks should be direct, clear, and speak to the audience's pain — not generic wellness language
- Audience: women 35–60 with chronic illness, failed by traditional healthcare, wanting a normal life
- Tone: understanding, clear, conversational — like a coach who gets it

### Hooks That Work for This Audience

Strong hook patterns for this niche:

- **The counterintuitive truth:** "The reason you're still exhausted isn't what you think."
- **Direct address of the pain:** "If you've tried everything and still feel awful, this is why."
- **Challenge the accepted approach:** "Functional medicine got one thing badly wrong."
- **The missed step:** "There's a step in recovery nobody talks about — and it's why you're stuck."
- **The reframe:** "Your symptoms aren't the problem. They're the signal."
- **The result promise:** "What living without symptoms actually looks like — and how to get there."

Vary these patterns across the month. Do not use the same pattern on consecutive days.

### YouTube Title Rules

- Lead with the benefit or the tension, not the topic
- Between 45–65 characters where possible
- No clickbait — the title must be deliverable in the video
- Include terms the audience would search: chronic illness, nervous system, fatigue, fibromyalgia, symptoms, healing, recovery

---

## Monthly Planning Process

### Step 1 — Review context files

Before generating any content, read:
- `AGENT.md` — audience, pillars, voice, offers
- `memory/memory_calendar.md` — any seasonal dates, campaigns, or launches in the target month
- `memory/memory_content-log.md` — what was created last month (avoid repeating recent topics)
- `memory/memory_audience-insights.md` — any new audience insights
- `memory/memory_performance.md` — what performed well (double down on those angles)

### Step 2 — Plan the month structure

Map out the month:
- Note the number of days and weeks
- Mark any seasonal dates or campaigns from the calendar
- Assign pillar themes to each week (so the month has a coherent arc)
- For YouTube: assign one video per publishing slot (Mon/Wed/Fri or whatever the schedule is)

### Step 3 — Generate Instagram content (in weekly batches)

Work week by week to stay within session limits. For each week, generate 5 entries (1 Reel per weekday × 5 weekdays, Mon–Fri):

For each entry, produce:
- **Headline:** one-line topic/angle
- **Hook:** the opening line or visual hook
- **Key Points:** 3–5 bullet points to cover

Vary pillar, hook pattern, and topic every day. No two consecutive days should feel the same.

### Step 4 — Generate YouTube content

For each video slot in the month, produce:
- **Video Title:** search-optimised, benefit-led
- **Hook:** what to say in the first 30 seconds to retain viewers
- **Key Talking Points:** 5–8 structured points covering the video body (intro → context → main teaching → common mistake → solution → CTA to free Skool community)

### Step 5 — Write to Notion

Create entries in the two Notion databases. Work in batches of 20–30 entries to avoid rate limits.

**Instagram Reels Planner** — one entry per Reel with all fields populated. Status = "Pending Approval".

**YouTube Content Planner** — one entry per video with all fields populated. Status = "Pending Approval".

### Step 6 — Log the plan

Add an entry to `memory/memory_content-log.md`:

```
### [Date] — Content Plan — [Month Year]
- **Type:** Monthly content plan
- **Instagram entries:** [number]
- **YouTube entries:** [number]
- **Status:** Pending Olly's approval in Notion
- **Notes:** [any themes or angles worth flagging]
```

---

## Transcript Feedback Loop

When Olly sends back a video transcript:

1. Read the transcript carefully
2. Note what worked — strong hooks, clear explanations, language that resonates
3. Note what could improve — pacing, structure, missing points
4. Update `memory/memory_audience-insights.md` with any language patterns or phrases that landed well
5. Update `memory/memory_performance.md` with the video's performance context if provided
6. Apply lessons to future content entries in Notion (update Transcript Notes field on the relevant row)
7. Carry improved hook patterns and talking point structures into the next monthly plan

---

## Quality Checklist

Before marking the plan complete:

- [ ] All 6 content pillars represented every week
- [ ] No banned words in any entry
- [ ] British English throughout
- [ ] No two consecutive days using the same hook pattern
- [ ] YouTube titles are 45–65 characters and searchable
- [ ] All Notion entries set to "Pending Approval"
- [ ] Content log updated in `memory/memory_content-log.md`
- [ ] Plan covers every day of the target month
