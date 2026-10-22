# Reel Titles From The Content Survey — Skill

> **Trigger:** Olly says "give me Reel titles", "Reel titles", "I need some Reel ideas" or similar.
> Built 2026-10-14. Turns the latest Content Survey answers into Reel titles he can film straight away.

---

## What this is

Members fill in the Content Survey (`website/sections/content-survey.html`, live at ollyhenson.com/content-survey). Answers land in the "Content Survey Responses" Google Sheet. The Apps Script (`website/sections/content-survey.gs`) has a private read link. `marketing/fetch_survey.mjs` pulls every response through it and prints an aggregated summary.

Olly freestyles talking-head Reels from a topic (no scripts). A "title" is the topic plus the opening line he says on camera, so it must work spoken out loud in the first 2 seconds.

---

## Steps

1. **Pull the data:** `cd "C:\Users\Olly\AI OS\heartattractor\marketing"` then `node fetch_survey.mjs`. Use `--json` for raw answers if you need to look at one person.
   - If it errors with "not allowed", READ_KEY in Apps Script → Project Settings → Script Properties doesn't match `SURVEY_READ_KEY` in `marketing/.env`, or the latest script version isn't deployed.
2. **Read the audience files:** `memory/avatar-catrin.md` (primary avatar, her exact words). The messaging direction: science-led, not manifestation; "soulmate" wording wins.
3. **Read the data like this:**
   - **Content types:** rank by net score (loves minus not-for-me). Write most titles for the top 2–3. Write none for types with a clearly negative net score.
   - **Titles by pick rate:** the winners show which *angle* works. Write fresh variations of the winning angles. Don't just repeat them.
   - **Hook styles by pick rate:** use the top 1–2 styles for most titles. Use the weakest style least.
   - **Biggest struggles:** the gold. Turn their exact words into opening lines (e.g. "Consistent men feel boring" → "Why the good ones feel boring (and how to change it)").
   - **Turn-offs:** check every title against them. "Takes too long to get to the point" means the title must land the point in the first line. "Overcomplicates" means one idea per Reel.
   - **Favourite Reels:** the format and angle to remake.
   - **Fewer than 10 responses:** say it's an early signal. Lean on proven winners ("The scientific way to attract your soulmate") as much as on the survey.
4. **Write the titles:** 10 by default, or however many Olly asks for.

---

## Output format

Start with a 2–3 line summary of what the data says (sample size, top types, top hook style, the strongest struggle phrase). Then the titles, grouped by content type:

| # | Title (what he says first) | Hook style | Why (the data behind it) |
|---|---|---|---|

End with which 2–3 to film first and why. Keep it short. Olly wants titles, not an essay.

---

## Title rules

- Spoken, not written: short, natural, says the point immediately.
- Specific topic in every title (see the Hook Specificity rule). It must make sense with zero context.
- Use "soulmate" or "someone you can build a life with". Avoid manifestation, LOA and tarot language unless the data says the audience loves it.
- No em dashes, and no comma before "and" or "or". American spelling for "program" and "visualize".
- Never fabricate results or claims. Only use Olly's story where it's true (7-year relationship ended in 2019, struggled with dating, met his now-wife).
- Don't repeat a title from a previous batch in the same session.

---

## Changelog

**2026-10-14:** Skill created alongside the survey's read link (`doGet` in content-survey.gs) and `fetch_survey.mjs`.
