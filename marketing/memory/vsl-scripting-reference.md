# VSL Scripting Reference — Heart Attractor

> Reference point for scripting the Skool About Page VSL. The VSL is built as a standalone HTML page in the `training/` folder, but the argument, avatar and voice must come from `marketing/`. This file documents how the two connect.

---

## Where things live

| What | File |
|------|------|
| Core argument (Promised Land, Pain, Bleeding Neck Pain, Actual Cause, New Mechanism, New Belief, Ideology) | `marketing/memory/argument_sheet_heart_attractor.md` |
| Primary avatar — "Analytical Amy" (demographics, psychographics, lifestyle, who she follows) | `marketing/memory/avatar-amy.md` |
| Supporting prospect avatars (Chaser, Detacher, Repeat Pattern, Self-Doubter, Frustrated Manifestor) | `marketing/memory/prospect_avatars.md` |
| Brand voice / writing rules | `marketing/CLAUDE.md` (note: body still carries old Heart Creator positioning per its pivot banner — use with care) |
| Training page build patterns (CSS/JS, palette, format choices, existing-page reference, gotchas) | `training/skills/skills_training-pages.md` |
| Existing About Page video draft/reference | `training/about-page-video.html` |
| Training project instructions | `training/CLAUDE.md` |

---

## How to script the VSL

1. **Pull the argument from `argument_sheet_heart_attractor.md`.** The VSL should walk the same spine as any other piece of content: Pain → Bleeding Neck Pain → Current (false) Belief → Actual Cause (Internal Working Models) → New Mechanism (The Attraction Formula) → New Belief → Promised Land. The "Core Argument In One Line" ("You don't force this. You don't detach from it. You rewrite the beliefs running underneath it.") is a strong structural spine or closing line.

2. **Write to Amy specifically.** Use `avatar-amy.md` for tone-check: she's attachment-theory literate, wants the mechanism and the "why" before trusting the "how," is turned off by hype/urgency/scarcity, and holds the live objection "I've already tried manifestation and it didn't work for me." The VSL needs to address that objection head-on rather than just repeat a promise she's heard before.

3. **Use her actual media diet as a benchmark.** Per `avatar-amy.md`'s "Who Amy Actually Follows" section, she's used to credentialed-therapist-style content (Julie Menanno, Gottman Institute) alongside softer manifestation creators she's growing skeptical of. The VSL's job is to sit between those two worlds — mechanism-anchored like the therapist accounts, applied to the attraction/manifestation space the softer creators can't fully back up.

4. **Build the actual page in `training/`.** Once the script/argument is locked, hand off to the training format: read `skills_training-pages.md` first for the proven CSS/JS patterns and format choices (one-step-per-screen scroll is the default and most VSL-appropriate). Check `about-page-video.html` for prior work before starting fresh.

5. **Cross-folder note:** `marketing/` and `training/` are separate CLAUDE.md-scoped areas with no automatic link — always read both explicitly when scripting a VSL, don't rely on one folder's context carrying into the other.

---

## Open items

- `training/about-page-video.html` exists — confirm with Olly whether it's a live draft to continue or reference-only before starting new VSL work.
- `training/CLAUDE.md` flags that training pages have not yet been updated for the Heart Attractor pivot — any VSL script must be written fresh against the current argument sheet, not copied from old page content.

## Exact design/layout spec (confirmed 2026-08-19)

Full colour palette, typography, layout grid rules, and the hard-won layout-debugging lessons now live in `memory/brand-guidelines-heart-attractor.md` — read that file before building or editing any VSL slide. It also has the locked final headline slide copy and the built visual asset list (wave graphic, belief rewrite graphic, "What's Inside" composite, cover thumbnail).
