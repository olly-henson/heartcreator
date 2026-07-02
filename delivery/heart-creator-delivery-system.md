# Heart Creator Program — Delivery System

> This document captures the full program structure, client journey, pricing model, and delivery logic for the Heart Creator Program. Read this at the start of every delivery session alongside `priorities.md`.

---

## What the Program Is

The Heart Creator Program is Olly's signature coaching program. It comes in two tiers — 1-2-1 and DIY — both taking clients through a 90-day intensive followed by 9 months of community support, all included in a single annual payment. The only difference between tiers is access to calls with Olly.

**The transformation:** Clients come in stuck at the implementation gap — they understand manifestation and reality creation intellectually but cannot make it work in practice. They leave as consistent creators: able to regulate their nervous system, access elevated emotional states on command, and tie intention to feeling to reprogram their subconscious.

**The core argument:** It's not the technique — it's the state. You cannot reprogram the subconscious from the head. Heart Coherence gets clients out of survival mode and into the heart, where real change actually happens.

**Primary avatar:** Rachel — high-paid professional, deeply invested in reality creation (Dispenza, Neville Goddard, Abraham Hicks), understands the theory completely, cannot make it work in practice. Full profile in `marketing/memory/avatar-rachel.md`.

---

## Pricing

| Tier | Year 1 | After year 1 |
|------|--------|--------------|
| 1-2-1 | $2,500/year | $97/month |
| DIY | $997/year | $97/month |

Both tiers include the same program materials, community access, and 30-Day Creative Sprints. The 1-2-1 tier additionally includes onboarding and review calls with Olly at the start and end of each month. After year 1, both tiers continue at $97/month.

---

## The Client Journey

### Stage 1 — Acquisition

Clients enter via three routes:

| Entry point | Path |
|-------------|------|
| YouTube | Watches content → downloads free Heart Activation Meditation → enters 10-email nurture sequence |
| Instagram Reels | Comments HEART → ManyChat delivers meditation link → enters 10-email sequence |
| Skool cold discovery | Finds community organically → sees program description → applies |

The 10-email nurture sequence ends with a pitch for the Heart Creator Program. Application link: `https://ollyhenson.com/coaching-application`

Upgrade path tags (stored in GHL contact field "Upgrade Path") track where each applicant came from. See `marketing/memory/upgrade-path-reference.md`.

### Stage 2 — Onboarding

On acceptance and payment:

1. **1-2-1 tier:** Onboarding call (30–60 min) — orientation: where to find everything, what they're doing first, how the program works
2. **DIY tier:** No call — client receives access details and self-onboards
3. Client begins Month 1

### Stage 3 — 90-Day Intensive (Months 1–3)

One stage per month. Each month follows the same rhythm:
- **Start of month:** Onboarding call (30–60 min) — 1-2-1 tier only. Brief the client on the stage, set expectations. DIY clients self-onboard from materials.
- **Through the month:** Client works through the program material, submits check-ins, receives progress reports (both tiers)
- **End of month:** Review call (30–60 min) — 1-2-1 tier only. Review check-ins and progress, prep client for next stage.

#### Month 1 — REGULATE

**Focus:** Breathwork and calming the nervous system.

**Why first:** The client cannot access elevated emotional states or reprogram their subconscious while locked in survival mode. Regulation is the foundation everything else is built on.

#### Month 2 — FEEL

**Focus:** Learning to access elevated emotional states on command.

**Why second:** Once regulated, the client can begin to genuinely feel — not just think about — their future self. This is the bridge between regulation and creation.

#### Month 3 — CREATE

**Focus:** Tying a clear intention to an elevated emotional state. Becoming the creator.

**Why last:** With regulation and feeling in place, the client can now do the actual subconscious reprogramming work — merging who they want to become with the felt experience of already being them.

### Stage 4 — Community Phase (Months 4–12)

After the 90-day intensive, the client moves into the Heart Creator Community. The 1-2-1 element ends here. What continues:

- Access to all program materials (all three stages)
- Ongoing community support
- Additional content added by Olly over time
- 30-Day Creative Sprints (see below)

### Stage 5 — Renewal (Month 12+)

At 12 months, clients can continue on a subscription:
- $97/month
- $997/year

**Tracker note:** Build a notification that alerts Olly 30 days before each client's 12-month rollover date so he can review and prompt renewal manually. This has not been built yet — add to priorities when ready.

**Rollover logic:** To be determined. May auto-rollover or may require manual renewal. Decide when first clients approach the 12-month mark.

---

## 30-Day Creative Sprint

A repeatable, time-based accountability program that lives inside the community. Clients can drop in at any time and retake it as many times as they like.

**Duration:** 30 days

**What it tracks (check-in metrics):**
- Meditations performed
- Synchronicities noticed
- Results showing up
- Confidence / how they're feeling

**Automated outputs:** Progress reports sent to client (mirrors the Regulate & Restore tracker logic — build this when the sprint is ready to launch).

---

## How the Skool Community Fits

The Heart Creator Community (Skool) serves two audiences:

| Audience | How they arrive |
|----------|----------------|
| Heart Creator Program clients | Included in $2,500 — community access from month 4 onwards |
| Cold discovery / DIY audience | Find the Skool page organically or are offered it as a downsell after the nurture sequence |

The DIY (cold/downsell) pricing: $97/month or $997/year with a 7-day free trial.

The Skool page must work as a standalone for cold traffic — never assume prior context. See `marketing/memory/heart-creator-about-page-description.md` for current page copy.

---

## The Three-Stage Framework (Program Naming)

The stages are named Regulate, Feel, Create. These replaced the older "Back to Life" program naming (Regulate for Relief / Recharge for Radiance / Reclaim for Reconnection). Do not use the old names when referring to Heart Creator Program stages.

The broader three-stage model still exists in the argument sheet as a conceptual framework but the program stages for Heart Creator use the new names.

---

## What Still Needs to Be Built

- [ ] Onboarding materials for each of the three stages (what does the client actually do in each month?)
- [ ] Check-in form or system for the 90-day intensive
- [ ] 30-Day Creative Sprint — structure, check-in system, automated progress reports
- [ ] 12-month rollover tracker / notification system
- [ ] Renewal offboarding — what happens at month 12 (TBD once first clients approach this point)
- [ ] GHL onboarding workflow — triggered on payment, delivers access details and books onboarding call
- [ ] Skool auto-add on purchase (GHL → Skool integration)

---

## Decisions Made & Reasons

| Decision | Reason |
|----------|--------|
| Two tiers: 1-2-1 ($2,500) and DIY ($997) | Same materials and community for both — price difference reflects access to Olly's time via calls. Allows clients to self-select based on budget and support needs. Both continue at $97/month after year 1. |
| 90-day intensive + 9-month community in both tiers | Clients get the full program either way — the intensive foundation plus long-term community to embed and maintain the work |
| One stage per month (Regulate → Feel → Create) | Each stage unlocks the next — you can't access elevated emotions while in survival mode, you can't create from a place you can't feel |
| Named Regulate, Feel, Create | Clear, client-facing language. Previous names (Regulate for Relief / Recharge for Radiance / Reclaim for Reconnection) were from the old Back to Life program — replaced |
| Sprint is floating and repeatable | Clients can re-enter at any depth, any time — keeps the community active and valuable long after the intensive ends |
| Renewal TBD | Not enough information to decide yet — will determine based on first client experience at month 12 |

---

## Changelog

### 2026-06-22 — Initial creation
- Built from scratch in session with Olly
- Captured: program structure, pricing, client journey, 90-day intensive breakdown, community phase, sprint model, Skool integration, what still needs to be built
