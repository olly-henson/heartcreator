# Heart Creator Program — Skills File

> This file tells Claude how to work on the Heart Creator Program — what decisions have been made, what names to use, what questions to ask before documenting anything, and what never to do. Read alongside `heart-creator-delivery-system.md` before any Heart Creator work.

---

## Key File Paths

| File | Path |
|------|------|
| Delivery system doc | `C:\Users\Olly\AI OS\Delivery\heart-creator-delivery-system.md` |
| Audience / avatar | `C:\Users\Olly\AI OS\marketing\memory\avatar-rachel.md` |
| Argument sheet | `C:\Users\Olly\AI OS\marketing\memory\argument_sheet.md` |
| Funnel overview | `C:\Users\Olly\AI OS\marketing\memory\funnel-overview.md` |
| Upgrade path reference | `C:\Users\Olly\AI OS\marketing\memory\upgrade-path-reference.md` |
| Skool about page | `C:\Users\Olly\AI OS\marketing\memory\heart-creator-about-page-description.md` |

---

## Program Structure (confirmed)

**90-day intensive → 9-month community → $97/month renewal**

| Stage | Duration | Focus |
|-------|----------|-------|
| Regulate | Month 1 | Breathwork, calm the nervous system |
| Feel | Month 2 | Access elevated emotional states on command |
| Create | Month 3 | Tie intention to feeling — become the creator |
| Community | Months 4–12 | Materials, community, 30-Day Creative Sprints |

**Two tiers:**

| Tier | Year 1 | After year 1 | Calls included? |
|------|--------|--------------|-----------------|
| 1-2-1 | $2,500 | $97/month | Yes — onboarding + review call each month |
| DIY | $997 | $97/month | No — self-onboarded from materials |

---

## Rules and Constraints

### Never list

1. **Never use the old Back to Life program names.** Regulate for Relief, Recharge for Radiance, and Reclaim for Reconnection are deprecated. The Heart Creator Program stages are named Regulate, Feel, and Create.
2. **Never document pricing without confirming tiers first.** Always ask: "Is there more than one pricing tier?" before writing any pricing section. The Heart Creator Program has two tiers with different prices and different call inclusions.
3. **Never assume a program is 1-2-1 only.** Olly's programs may have a DIY counterpart. Confirm both tiers exist (or don't) before documenting.
4. **Never bulk-ask program design questions.** If the program structure is not fully defined, ask one question at a time. Olly finds multiple questions at once overwhelming — see Process below.
5. **Never skip reading the marketing memory files** before Heart Creator work. The audience context (avatar-rachel.md, argument_sheet.md, funnel-overview.md) is essential and cannot be assumed from delivery docs alone.

---

## Process / Steps

### When mapping or designing program structure

1. Read `heart-creator-delivery-system.md` first — know what's already decided before asking anything
2. Read the marketing memory files (avatar-rachel.md, argument_sheet.md, funnel-overview.md) — understand who the client is and what the program is trying to achieve
3. Ask one question at a time. Wait for the answer. Then ask the next. Never front-load multiple questions.
4. Confirm decisions out loud before moving on: "So the structure is X — does that feel right?" This catches corrections early.
5. Once structure is confirmed, update `heart-creator-delivery-system.md` and `priorities.md` before closing the session

### At the end of every Heart Creator session

1. Update `heart-creator-delivery-system.md` with any new decisions, structure, or pricing changes
2. Update `priorities.md` — mark completed tasks, add new ones discovered in session
3. Update this file if new process lessons or corrections emerged
4. Commit and push: `cd "C:\Users\Olly\AI OS\delivery" && git add . && git commit -m "Session update: [summary]" && git push`

### When pricing comes up

Always ask:
- How many tiers?
- What does each tier include / not include?
- What's the renewal / continuation price?

Document all tiers in a table before moving on.

---

## Examples

### Good: confirming structure before documenting

> "So we have 90 days, three stages — Regulate, Feel, Create — one month each. And two tiers: 1-2-1 at $2,500 which includes calls, and DIY at $997 which doesn't. After year 1, both continue at $97/month. Does that match what you have in mind?"

This confirms the full picture before writing anything.

### Bad: assuming a single tier

> "The Heart Creator Program costs $2,500/year and includes onboarding and review calls each month."

This missed the DIY tier entirely. Don't document pricing until tiers are confirmed.

### Good: one question at a time

> "How long does the program run?"
> [wait for answer]
> "And how many calls do they get with you?"
> [wait for answer]

### Bad: front-loading multiple questions

> "How long does it run, how many calls, what's in each stage, and what does the community look like after the intensive ends?"

This overwhelms and causes Olly to ask to slow down.

---

## Changelog

### 2026-06-22 — Initial creation
- Created from lessons learned in first Heart Creator program design session
- Key corrections captured: old program names deprecated, DIY tier missed in first draft, step-by-step question approach needed, always ask about tiers before documenting pricing
