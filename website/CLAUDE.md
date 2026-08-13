# Website Project — Claude Instructions

> **⚠️ PIVOT IN PROGRESS (2026-08-13):** "Heart Creator" is being renamed **Heart Attractor** — niched to attracting/creating an ideal relationship, willful-with-some-intellectual audience. See `../marketing/memory/argument_sheet_heart_attractor.md`. Homepage copy below has not yet been updated for this pivot.

## Role
**Website Builder** for Olly Henson Coaching / Heart Creator. This folder's agent builds and maintains the custom-coded ollyhenson.com website — the homepage and any other standalone HTML sections/pages — built as Custom HTML blocks inside GHL Website Builder.

## What This Project Is
Custom HTML/CSS homepage for ollyhenson.com, built as one Custom HTML block in GHL Website Builder.

## File Structure
```
website/
  sections/
    homepage.html                          ← entire homepage (one GHL Custom HTML block)
    links.html                             ← standalone links page
    meditation-explained-standalone.html   ← standalone meditation explainer page
    state-shifting-ladder.html             ← interactive tool, embedded in Skool Community (see project_state_shifting_ladder memory — styling locked, don't restyle unasked)
  CLAUDE.md
  README.md
  ghl-setup-guide.md
```

## GHL Setup
- **Platform:** GHL Website Builder (not funnel builder)
- **URL:** ollyhenson.com
- **Location ID:** LRqVZmxns8f3xcJLHzBK
- **Same full-width CSS fix applies as funnel**

## How It Works
- One single Custom HTML block for the entire homepage
- No lead capture form — page is purely navigational/brand
- Video is a self-hosted `.mov` file (native `<video>` tag, not a YouTube embed)
- All social links open in new tab

## Social Links (as actually live — updated 2026-07-30)
- **Instagram:** https://www.instagram.com/theollyhenson
- **Skool:** https://www.skool.com/heartcreator (with UTM: `?utm_source=website&utm_medium=homepage&utm_campaign=coaching`)
- **Facebook:** https://www.facebook.com/theollyhenson (added 2026-07-30, ahead of Reels cross-posting starting)
- **YouTube:** https://www.youtube.com/@theollyhenson (updated 2026-07-30 to new handle)

Note: the standalone Free Meditation CTA card is still **not** on the homepage — removed 2026-07-09 (see `project_heartcreator_website` memory), not re-added. CTA grid is now Instagram, Skool, Facebook, YouTube (4 cards).

## Images
- **Hero avatar:** `https://assets.cdn.filesafe.space/LRqVZmxns8f3xcJLHzBK/media/6a2ff592e5b9322bddd1e8d7.png`
- **Video:** `https://assets.cdn.filesafe.space/LRqVZmxns8f3xcJLHzBK/media/6a368bcb6a6dd1b69a4dd0f2.mov`

## Design System
Identical to funnel — see `C:\Users\Olly\AI OS\heartattractor\funnel\brand\brand-guidelines.md` (corrected 2026-07-30 — path previously pointed outside the consolidated repo)
- **Theme:** Space / cosmos
- **Primary bg:** #080010
- **Magenta:** #d946ef
- **Violet:** #a855f7
- **Text:** #f8f4ff
- **Muted:** #c4b5fd
- **Fonts:** Playfair Display (headings) + Inter (body)

## Page Structure (updated 2026-08-13)
1. Hero — `<h1>` "Olly Henson" + tagline "Helping People Consciously Change Their Life" (line break before "Change Their Life") + avatar image
2. Video — **temporarily removed**, replaced with a "Video Coming Soon" placeholder box (`.ohc-video-placeholder`); the video title/label and the real `.mov` video markup were deleted, not just hidden — restore from git history if the video comes back
3. CTAs section — **removed entirely** (Skool/Instagram/Facebook/YouTube link grid is gone from the homepage; the CSS for `.ohc-cta-*` classes is still in the `<style>` block but unused)
4. Testimonials — 5 real client testimonials with photos, laid out as full-width horizontal cards (photo/name/role on the left, quote on the right), one per row, stacking to centered/vertical below 700px:
   - Mushtaq Osmani — Director of Organisational Effectiveness, Macmillan Cancer Support
   - Jess Flack FHEA — Next Path Device Consortium Member | European Commission Member
   - Sam Stephens — CPO @ Sourceability, Independent Distribution Specialist
   - Tom Henry — Operations Transformation Leader (Consultant Practitioner), Accelerate Opex
   - Donal Treacy — Enterprise Account Executive, Sprout Social, Inc
   - All 5 photos hosted on GHL media library (`assets.cdn.filesafe.space/LRqVZmxns8f3xcJLHzBK/media/...`)
   - Old Isabell + Anas testimonials fully replaced, not kept
5. Footer — real Privacy Policy + Terms links (`ollyhenson.com/privacy-policy`, `/terms`) — not placeholders

## Still To Complete
- Real video needs to replace the "Video Coming Soon" placeholder once ready
- Decide whether the social-links CTA section comes back, and in what form, now that it's been removed
- Note: the Heart Attractor pivot (see top-of-file warning) has still not been actioned on this page — homepage still says "Olly Henson" branding, no relationship-attraction copy yet

## GHL Editor Rules (same as funnel)
- Section width: Full Width
- Section + column margin/padding: all 0
- Full-width CSS breakout on .ohc-page wrapper
