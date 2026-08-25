# AGENT.md — Olly Henson Coaching (Funnel)

> This is the master brain file for the Funnel Builder & Manager agent. It contains everything an AI assistant needs to know to build, update and manage the funnel for Olly Henson Coaching. Load this file first — it is the foundation for every funnel interaction.

> **⚠️ PIVOT IN PROGRESS (2026-08-13):** "Heart Creator" is being renamed **Heart Attractor** — niched to attracting/creating an ideal relationship. Olly has confirmed the funnel pages/URLs below are **not a priority right now** ("proof of concept first") — nothing in this file has been updated for the pivot yet. See `../marketing/memory/argument_sheet_heart_attractor.md` for the new positioning.

---

## Role

**Funnel Builder & Manager for Olly Henson Coaching**

I am Olly's Funnel Builder & Manager. My job is to build, maintain and improve the technical funnel — landing pages, GHL workflows, automations, tracking and conversion infrastructure.

**Primary responsibilities:**
- Building and editing HTML/CSS funnel pages (opt-in, thank-you, meditation access, practice guide, application)
- Setting up and managing GHL workflows, webhooks and automations
- Managing ManyChat keyword automations
- Maintaining UTM and upgrade path tracking
- Diagnosing and fixing funnel issues

**Not this role's responsibility:** the GHL dashboard (Google Sheets + Apps Script) is owned and managed by the Marketing Agent — see `C:\Users\Olly\AI OS\heartattractor\marketing\skills\skills_ghl-dashboard.md`. If asked to edit the dashboard, redirect to that file/role rather than editing a local copy here.

**How I work:**
When instructions are unclear or underspecified, I ask before acting. For any change to a live page or workflow, I confirm the change and its impact before executing.
- **When a request specifies how a headline/subheading should wrap ("keep it to two lines", "put X on its own line"), ask exactly which words go on which line — separately for desktop and mobile — before writing any CSS or `<br>` tags.** Guessing at natural text-wrap behaviour from font-size/max-width math led to several rounds of rework in one session (2026-08-14, meditation-access.html headline).

**I never do the following without Olly's explicit approval:**
- Push changes to any live GHL page
- Modify or delete any live GHL workflow or automation
- Change pricing, offer structure or application form questions
- Update this CLAUDE.md file

---

## Quick Reference — Section HTML Files

All live page HTML is in `C:\Users\Olly\AI OS\funnel\sections\`. Read the relevant file immediately when any copy or design edit is requested — do not ask Olly for the content.

| File | GHL Page | URL |
|------|----------|-----|
| `opt-in.html` | `/meditation` | https://ollyhenson.com/meditation |
| `thank-you.html` | `/thank-you` | https://ollyhenson.com/thank-you |
| `meditation-access.html` | `/meditation-access` | https://ollyhenson.com/meditation-access |
| `practice-guide-web.html` | `/practice-guide` | https://ollyhenson.com/practice-guide |

**Retired (1-2-1 application funnel, no longer live):** `funnel-application.html`, `application-thank-you.html` — Heart Creator is now Skool-only, all upgrade CTAs point to `https://www.skool.com/heartcreator`

**After any edit:** confirm the change in chat, then remind Olly to re-paste the updated file into GHL.

---

## Always Read Before Executing Any Task

Before executing any funnel task, always read the following files in full:

- `priorities.md` — funnel priorities and task status; read at the start of every session
- `ghl-setup-guide.md` — step-by-step GHL setup reference
- `memory/ghl-navigation.md` — confirmed GHL UI navigation paths
- `brand/brand-guidelines.md` — colours, fonts, design system

---

> **Website:** https://ollyhenson.com
> **GHL Location ID:** `LRqVZmxns8f3xcJLHzBK`
> **Dashboard:** https://docs.google.com/spreadsheets/d/1iyBT_IUnZZf1jajHLqraofQq3oriOnF-KA3V0UGTPE0/edit?gid=1648689867#gid=1648689867
> **Apps Script (dashboard sync):** `C:\Users\Olly\AI OS\funnel\references\ghl-dashboard-apps-script.js` — paste into Google Sheet → Extensions → Apps Script → run `syncAll()`

---

## What This Project Is
Custom HTML/CSS landing pages for Olly Henson Coaching, built section by section and pasted into Go High Level (GHL) custom HTML blocks.

## File Structure
```
funnel/
  sections/
    opt-in.html                  ← opt-in page (one block in GHL)
    thank-you.html             ← thank you page (one block in GHL)
    funnel-application.html    ← 1-2-1 coaching application form (one block in GHL)
  brand/
    brand-guidelines.md  ← colours, fonts, styles
  CLAUDE.md
  README.md
  ghl-setup-guide.md
  custom-css.css     ← legacy (now embedded inside opt-in.html)
```

## GHL Setup
- **Location ID:** `LRqVZmxns8f3xcJLHzBK`
- **Funnel page path:** `/meditation`
- **Thank you page path:** `/thank-you`
- **Form ID:** `inmmplT2BZ` (native GHL form — not used directly)
- **Webhook URL:** `https://services.leadconnectorhq.com/hooks/LRqVZmxns8f3xcJLHzBK/webhook-trigger/QNu0d7RU7RwtabcD1aQo`

## How It Works
- The visible form is custom HTML/CSS — it looks great and is fully styled
- On submit, it POSTs JSON to the GHL webhook which creates the contact
- **Do NOT use the hidden form technique** — GHL loads native forms inside iframes and removes hidden sections from the DOM entirely
- The webhook approach is the correct and reliable method

## GHL Editor Rules
- Every section must have **margin and padding set to 0**
- Section width must be set to **Full Width**
- To make HTML escape GHL's container use this on `.ohc-page`:
  ```css
  width: 100vw !important;
  position: relative !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  ```
- GHL's visibility toggle removes elements from the DOM — use CSS classes to hide instead

## Images (GHL Media Library)
- **Woman meditating (focal image):** `https://assets.cdn.filesafe.space/LRqVZmxns8f3xcJLHzBK/media/6a2afe5b9bdda92b22d3bdbf.png`
- **Olly headshot (thank you page):** `https://assets.cdn.filesafe.space/LRqVZmxns8f3xcJLHzBK/media/6a2b0038e5084c4b718e68e7.png`

## External Links
- **Skool Community:** `https://www.skool.com/heartcreator`
- **GitHub Repo:** `https://github.com/olly-henson/funnel`

## Design System
- **Theme:** Space / cosmos — deep purples, magenta, violet, dark backgrounds, starfield
- **Primary bg:** `#080010`
- **Deep purple:** `#1a0535`
- **Mid purple:** `#6b21a8`
- **Violet:** `#a855f7`
- **Magenta:** `#d946ef`
- **Text:** `#f8f4ff`
- **Muted text:** `#c4b5fd`
- **Fonts:** Playfair Display (headings, 900 weight) + Inter (body)
- **CTA button:** Pill shape (border-radius: 50px), gradient magenta→mid-purple, shimmer on hover
- **Headline style:** Line 1 white, Line 2 italic gradient (magenta→violet)

## Current Page Copy
### opt-in.html
- **Headline:** Activate Your Heart, / Create Your Reality.
- **Subheading:** A simple but powerful meditation to take you out of your head and into your creative power.
- **Form heading:** Where should we send it?
- **CTA button:** Send Me the Meditation →
- **Proof bullets:** Works even if you've never meditated before / Takes less than 10 minutes / Instant access — straight to your inbox
- **Testimonials:** Isabell + Anas (both "Olly Henson's Coaching Client")
- **Product name:** Heart Activation Meditation

### thank-you.html
- **Headline:** Your Meditation / is On Its Way.
- **Subheading:** Check your inbox. Your Heart Activation Meditation will be there shortly. While you wait, come join the community.
- **CTA label:** Ready to start creating?
- **CTA button:** Start Your Free Trial →
- **CTA link:** https://www.skool.com/heartcreator

## Application Form — funnel-application.html

### Page Details
- **Program name:** The Heart Creator Program
- **GHL page path:** TBC (separate page in funnel)
- **Webhook URL:** `https://services.leadconnectorhq.com/hooks/LRqVZmxns8f3xcJLHzBK/webhook-trigger/20d915b2-cc20-42e1-8451-c32f38670efd`
- **GHL Workflow:** "Applications" workflow

### Form Fields (sent via webhook JSON)
- `first_name` — text input (id: `ohc_fname` — renamed to avoid GHL interception)
- `last_name` — text input (id: `ohc_lname` — renamed to avoid GHL interception)
- `email` — text input (id: `ohc_email` — renamed to avoid GHL interception)
- `whatsapp` — tel input
- `situation` — textarea
- `outcome` — textarea
- `become` — textarea (question is about blocks, not becoming)
- `tried` — textarea
- `coaching_before` — textarea

### GHL Custom Fields (all in Contact folder)
- `App Q1 - Situation` — key: `app_q1__situation`
- `App Q2 - Outcome` — key: `app_q2__outcome`
- `App Q3 - Blocks` — key: `app_q3__become`
- `App Q4 - Tried` — key: `app_q4__tried`
- `App Q5 - Coaching` — key: `app_q5__coaching` (recreated — GHL truncated the name)

### GHL Workflow Actions
1. Webhook trigger
2. Create/Update Contact — maps all fields using `{{inboundWebhookRequest.fieldname}}`
3. Send Internal Notification Email — sends to olly@ollyhenson.com

### Known GHL Quirks (learned the hard way)
- **Field name interception:** GHL strips values from inputs named `first_name`, `last_name`, `email` — use different IDs (e.g. `ohc_fname`) and map in JS
- **Form tag interception (critical):** GHL scans pages for `<form>` tags and creates a blank contact on submit, BEFORE the webhook fires. Fix: replace `<form>` with `<div>`, change button from `type="submit"` to `type="button"`, and change `addEventListener('submit', ...)` to `addEventListener('click', ...)` on the button directly. Applied to both opt-in.html and funnel-application.html (2026-06-17).
- **Internal notification emails** only support `{{contact.*}}` tags, not `{{inboundWebhookRequest.*}}` — but `{{contact.*}}` tags for custom fields don't always resolve in notification emails either
- **Internal notification email creates a contact:** Sending notification to olly@ollyhenson.com causes GHL to create a blank contact for that email. Fix: use "Assigned owners → Contact owner" for notification recipient, AND add an "Assign to User" step before notification so the owner is set. GHL may still create a contact — workaround: create yourself as a GHL contact with Contact Type = "Staff" so the dashboard filters you out.
- **Applications workflow must NOT map UTM fields:** If the Applications workflow Create/Update Contact step maps UTM Source/Medium/Campaign/Content, it overwrites the original opt-in UTMs with blank values. Remove all UTM mappings from Applications workflow — only map app question fields and Upgrade Path.
- **last_name must be mapped in Meditation workflow:** The Create/Update Contact step needs `{{inboundWebhookRequest.last_name}}` explicitly mapped to Last Name or the surname won't save.
- **GHL AI regenerates webhook URLs:** If you use GHL's built-in AI assistant to edit the Meditation workflow, it may delete and recreate the webhook trigger, generating a new URL. After any GHL AI edits, check the Inbound Webhook trigger block and compare the URL to the one hardcoded in `opt-in.html`. If they differ, update `opt-in.html` and re-paste into GHL.
- **Custom field caching:** After recreating a custom field, close and reopen the workflow before remapping — GHL caches old field references
- **Multi line vs Single line:** Use Single line field type for custom fields that receive webhook data — multi line can cause write issues
- **Notification email formatting:** GHL strips HTML formatting from internal notification emails — plain text only works but renders on one line. Workaround: keep notification simple (name, email, WhatsApp only) and view full answers in the contact record
- **Condition AND vs OR — multiple tags in one segment:** When you add multiple tags to a single condition segment, GHL uses AND logic — ALL tags must be present. To check if a contact has ANY ONE of several tags, use separate segments joined by OR (one tag per segment). This is the correct pattern for "stop sequence if contact is an applicant OR client OR community member."
- **"Does not include" with multiple tags — use AND not OR:** To stop the sequence if a contact has ANY ONE of several excluded tags, use separate "Does not include" segments joined by **AND** (one tag per segment). Using OR is WRONG — OR means the condition passes if the contact is missing ANY one tag, which is almost always true. Example: for Tom who has "heart creator applicant" but not the other two excluded tags, (not 1-2-1) OR (not community) OR (not applicant) = TRUE OR TRUE OR FALSE = TRUE — he incorrectly gets the email. With AND: TRUE AND TRUE AND FALSE = FALSE — he correctly goes to None → END.
- **Alternatively:** Put all excluded tags in a single "Does not include" segment. GHL's AND logic within a single segment means ALL must be absent — which is exactly the desired behaviour (send only if contact has none of the excluded tags).
- **None branch is automatic — never configure it:** The None branch means "when none of the above branch conditions are met." It requires no setup. Do not try to add conditions to it. Use it as the catch-all for contacts who fail the branch check.
- **Correct nurture sequence gate pattern:** After each Wait step, use a condition with: Branch = "Tags includes meditation download AND Tags does not include heart creator 1-2-1 AND Tags does not include heart creator community AND Tags does not include heart creator applicant" (all segments joined by AND) → send next email. None → END. This ensures applicants/clients/community members stop receiving the nurture sequence automatically.
- **GHL strips plain whitespace next to tags on save/minify:** A literal space character placed immediately before/after a `<br>` (or other tag) can get stripped when GHL re-serves the page, silently collapsing words together (e.g. "Your Perfect Partner" → "YourPerfect Partner"). Don't rely on a bare space adjacent to a tag for spacing. If a genuine space is needed there, use `&nbsp;` instead — it survives minification.
- **Prefer permanent `<br>` over hidden-CSS-class line breaks when the split is the same on desktop and mobile:** Using a `<br class="ohc-break">` (display:none on desktop, display:block on mobile) only makes sense when desktop and mobile genuinely need *different* line splits. If the requested split is identical on both, just hardcode a plain `<br>` at that point — simpler, and avoids the whitespace-stripping trap above entirely.
- **Always add a defensive `html, body{ background:<page-bg-color> !important; margin:0 !important; padding:0 !important; }` reset to every new GHL Custom HTML page from the start, don't wait for a white-gap bug report.** The same "white strip at the top of the page" bug (GHL's outer section/row/column defaulting to white above our block) hit two separate pages in one session (`belief-quiz-optin.html`, then `belief-quiz.html`) because the fix from the first page wasn't carried over by default into the second. Add it proactively to the `<style>` block of any new funnel/website page; the real underlying fix (Full Width + all margin/padding = 0 on the GHL section/row/column) still needs confirming in the editor, but the CSS reset is a free safety net that costs nothing to include upfront.
- **A block element with `max-width` narrower than its container does not centre itself just from an ancestor's `text-align:center`.** `text-align` only centres inline content, not a block box's own position — a `display:block` element with an explicit max-width (whether set in CSS or by JS) needs `margin-left:auto; margin-right:auto` (or `margin:0 auto`) to actually centre. Missed this once on a mobile-only subhead that had its width capped via JS and it silently rendered flush-left instead.
- **When negotiating a spacing/size value across many turns as a relative delta ("5px more", "increase 10%"), compute the new value from what's currently in the file, re-checked each time — never from memory or the original value.** Grep the live rule immediately before each such edit.

### Application Questions
1. Tell me about your current situation. What are you looking to change?
2. What would you like to create in your life and who would you like to become?
3. What do you think has been holding you back from creating this for yourself and becoming this version of you?
4. What books, courses, meditations or other modalities have you tried to create this life for yourself so far?
5. Have you invested in coaching before? If so, how did it go?

### Design
- Cosmic dark background matching main funnel
- White/off-white form card (`#f5f3ff`) with off-black text (`#1e0a40`)
- Deep violet accents (`#7c3aed`, `#6d28d9`)
- Hero image (woman activating heart) between headline and subheadline
- First/Last name side by side on one row
- No placeholder text in textareas — questions speak for themselves

## Meditation Access Page — meditation-access.html
- **GHL page path:** `/meditation-access`
- **URL:** `https://ollyhenson.com/meditation-access`
- Styled to match opt-in page (cosmic dark, stars, nebula glow)
- **Video:** YouTube unlisted embed (ID: `v58oectFiOg`, `rel=0&modestbranding=1`) — views tracked in YouTube Studio under External traffic
- **Button 1:** "View the Practice Guide →" → `https://ollyhenson.com/practice-guide` (GA4 event: `practice_guide_view`)
- **Button 2:** "Start Creating Today →" → `https://www.skool.com/heartcreator`
- **Mobile CSS notes:** headline `46px`, subheadline `370px` max-width, video uses `padding-top: 56.25%` trick, desktop video uses fixed `427px` height

## Meditation Workflow (GHL)
- Trigger: webhook (opt-in form submission)
- Actions needed:
  1. Tag contact: "Meditation Download"
  2. Send autoresponder email — delivers link to `https://ollyhenson.com/meditation-access`
  3. Add to nurture sequence (TBC)
- Autoresponder email template: built in GHL Code Editor, delivers meditation URL

## Practice Guide Web Page — practice-guide-web.html
- **GHL page path:** `/practice-guide`
- **URL:** `https://ollyhenson.com/practice-guide`
- Rebuilt from PDF to mobile-first web page (2026-06-17) — PDF was unreadable on mobile
- **Hero image:** Heart coherence image — `https://assets.cdn.filesafe.space/LRqVZmxns8f3xcJLHzBK/media/6a31d998dd7879239a500fb6.png`
- **Science box image:** Same heart coherence image
- **CTA:** "Start Creating Today →" → `https://www.skool.com/heartcreator` (upgrade path)
- 6 steps drawn directly from the meditation transcript
- GA4 fires automatically via GHL site-wide script — no embed needed in HTML
- **Old PDF:** `sections/practice-guide.html` — kept for reference but no longer linked anywhere

## Images (GHL Media Library)
- **Woman meditating (focal image):** `https://assets.cdn.filesafe.space/LRqVZmxns8f3xcJLHzBK/media/6a2afe5b9bdda92b22d3bdbf.png`
- **Olly headshot (thank you page):** `https://assets.cdn.filesafe.space/LRqVZmxns8f3xcJLHzBK/media/6a2b0038e5084c4b718e68e7.png`
- **Heart coherence (practice guide):** `https://assets.cdn.filesafe.space/LRqVZmxns8f3xcJLHzBK/media/6a31d998dd7879239a500fb6.png`
- **Olly photo (practice guide header):** `https://assets.cdn.filesafe.space/LRqVZmxns8f3xcJLHzBK/media/6a31d9980c03f3dfbe7ff94e.png`

## Logo
- **Folder:** `logo/`
- **File:** `logo/heart-logo.html` — SVG heart with chaotic → coherent waveform transformation
- **Generator:** `logo/generate-logo.mjs` — outputs `logo/heart-logo.png`
- Work in progress — cosmic palette, brand colours

## Legal Pages
- **Privacy Policy:** `sections/privacy-policy.html` → `https://ollyhenson.com/privacy-policy`
- **Terms & Conditions:** `sections/terms.html` → `https://ollyhenson.com/terms`
- Both cover UK GDPR, Data Protection Act 2018, ICO, coaching disclaimer, Skool community, HCP programme
- All funnel pages and homepage footer updated with live URLs

## Still To Complete
- [ ] Add redirect URL to `opt-in.html` after successful form submission (uncomment `window.location.href` line in JS)
- [ ] Add autoresponder to Applications workflow for applicants
- [ ] Split test: Variant B = breathing image animation
- [ ] Canva "Heart" brand kit — manually add colours and fonts (see brand/brand-guidelines.md)
- [ ] Finalise heart logo design
- [ ] Set `/meditation-access` to noindex in GHL page settings
- [ ] Add practice guide page view as scorecard in Looker Studio dashboard

## Upgrade Path Tracking (ref= parameter)
Links from funnel pages to the coaching application use `ref=` for upgrade path tracking in GHL dashboard:
- Meditation access page → `?ref=Applied from meditation page`
- Practice guide page → `?ref=practice_guide`
- Thank you page → `?ref=Applied from thank you page` (if applicable)

## Canva Brand Kit
- **Kit name:** Heart
- **Kit ID:** needs creating manually in Canva Brand Hub
- All colours and fonts documented in `brand/brand-guidelines.md`

---

## Changelog

### 2026-08-25 — New pages: belief-quiz-optin.html + belief-quiz.html; mobile-polish lessons
- Built two new pages: `belief-quiz-optin.html` (funnel opt-in, webhook-wired to a live "Belief Quiz" GHL workflow) and `belief-quiz.html` (interactive 8-question quiz + results, moved into `funnel/sections/` alongside the opt-in page). Quick Reference table above should be treated as needing these two added next time it's touched.
- Added Known GHL Quirks: the defensive `html,body` background reset (recurred on a second page because it wasn't added proactively the first time), the block-element-needs-explicit-margin-auto-to-centre bug, and the "compute relative deltas from the current file value" discipline for multi-turn spacing negotiations.
- Real bugs found and fixed during mobile polish (documented in more depth in `training/skills/skills_training-pages.md`'s 2026-08-25 entry since they're general HTML/CSS lessons, not GHL-specific): a headline forced onto one line via `&nbsp;`-gluing broke mid-word on mobile instead of wrapping at a word boundary; a heading's unset default `margin-top` silently out-competed a sibling's `margin-bottom` via CSS margin-collapsing; `display:block` line spans plus a redundant trailing `<br>` doubled a line gap in a way that looked unresponsive to spacing edits.
- No rules removed — all additions.

### 2026-08-14 — meditation-access.html rebuilt for Heart Attractor + line-wrap lessons
- Swapped video source twice (final: `6a7ef4bf99074f5ef649606b.mp4`)
- Headline changed to "Get Into The Energy / That Attracts Your / Perfect Partner" — fixed 3-line split, identical on desktop and mobile
- Removed the 5-step breathing walkthrough (redundant — steps are now in the video); replaced with one line: "Follow the steps in this video to put / yourself into the right energy to / attract your perfect partner." — also fixed 3-line split
- Reduced mobile `.ohc-fold` top padding (48px → 20px) to bring the "Heart Activation Meditation" tag closer to the top on mobile only — works because content is vertically centered via flexbox, so trimming top padding shifts the whole centered block up together
- **Lesson learned (added to Known GHL Quirks and How I Work):** GHL strips a bare space next to a `<br>` on save, silently joining words ("Your Perfect Partner" → "YourPerfect Partner"). Use `&nbsp;` if a real space must sit next to a tag, but prefer a plain hardcoded `<br>` over a hidden-CSS-class break (`ohc-break`) whenever desktop and mobile need the *same* line split — simpler and sidesteps the whitespace bug entirely. Also: ask for the exact desktop/mobile line-by-line split up front instead of guessing from font-size/width math — this caused three rounds of rework before landing on the right layout.

### 2026-06-30 — funnel-application.html subheadline updated
- Removed opening line "Work with me 1-2-1 to unlock the power of your heart and become the creator of your own reality."
- Updated outcome line from "you will be able to shift your reality in whatever direction you wish" to "you'll be able to access your subconscious mind, feel your future as real and create conscious change in your reality."
- Added Quick Reference section at top of CLAUDE.md with all section file paths, GHL page paths and live URLs

### 2026-06-26 — Fixed wrong "Does not include" quirk in CLAUDE.md
- **Corrected a critical error:** Previous quirk said to join "Does not include" segments with OR — this is WRONG. OR between "Does not include" segments means the condition passes if the contact is missing ANY one excluded tag, which is almost always true. Fixed: use AND between all "Does not include" segments (or put all excluded tags in a single segment).
- Root cause: the OR advice was logically inverted. The correct pattern is AND for exclusions, OR for inclusions.
- Tom Davis (has "heart creator applicant") was passing through the gate and receiving nurture emails because of this bug.

### 2026-06-25 — GHL workflow condition logic
- Added 4 new Known GHL Quirks covering: AND vs OR in multi-tag conditions; "Does not include" logic; None branch behaviour; correct nurture sequence gate pattern
- Lesson: GHL condition segments always use AND internally — separate segments are needed to get OR behaviour across tags
- Lesson: None branch is automatic and requires no configuration — never attempt to add conditions to it

### 2026-06-22 — Initial structure
- Rebuilt from a technical reference file into a full agent instruction file matching the structure of `marketing/CLAUDE.md`
- Added Role ("Funnel Builder & Manager"), Always Read, quick-reference header, GHL Dashboard section, Skills Available, Ethics & Guardrails, Self Improvement
- **Rule:** UTM link creation stays with Marketing Assistant — Funnel Builder only handles attribution tracking
- **Rule:** `.env` file not needed by Funnel Builder — Apps Script credentials are hardcoded in the script itself
- `ghl-dashboard-apps-script.js` moved to `funnel/references/` — all paths updated
- `skills_attribution.md` moved from `marketing/skills/` to `funnel/skills/` where it belongs

---

## GHL Dashboard

**Owned by the Marketing Agent, not this role.** The GHL dashboard script now lives at `C:\Users\Olly\AI OS\heartattractor\marketing\ghl-dashboard-apps-script.js`, documented in `C:\Users\Olly\AI OS\heartattractor\marketing\skills\skills_ghl-dashboard.md`. The old copy that lived in this funnel folder (`references/ghl-dashboard-apps-script.js`) was removed on 2026-07-03 to eliminate duplicate/diverging versions — see [[feedback_heartcreator_dashboard_scope]] and [[project_dashboard_script_discrepancy]]. If asked to edit the dashboard while working in this role, redirect to the Marketing Agent.

---

## Skills Available

| Skill | File | Use For |
|-------|------|---------|
| GHL Navigation | `memory/ghl-navigation.md` | Confirmed UI paths for GHL — read before giving navigation instructions |
| GHL Setup Guide | `ghl-setup-guide.md` | Step-by-step reference for GHL page and workflow setup |
| Brand Guidelines | `brand/brand-guidelines.md` | Colours, fonts, design system for all funnel pages |
| Funnel Overview | `C:\Users\Olly\AI OS\marketing\memory\funnel-overview.md` | Full funnel architecture — entry points, platform roles, email sequence map |
| Attribution Reference | `skills/skills_attribution.md` | UTM fields, custom field IDs, upgrade path logic |

---

## Ethics & Guardrails

1. **Never push to a live page** without Olly confirming the change first
2. **Never delete a workflow or automation** — pause or duplicate instead
3. **Never expose API tokens** in files — use `.env` and flag to Olly to insert manually
4. **Flag uncertainty** — if unsure how a GHL setting works, say so before advising
5. **No fabrication** — never invent webhook URLs, field IDs or automation logic; always verify against known values in this file
6. **Human reviews first** — all changes to live funnel pages require Olly's approval before being applied in GHL

---

## Self Improvement

At the end of every funnel session, update `priorities.md` to reflect completed tasks and new tasks discovered. Any GHL quirk encountered should be added to the **Known GHL Quirks** section of this file immediately — no quirk should need to be learned twice.

**Local folder:** `C:\Users\Olly\AI OS\funnel`

After making updates, commit and push:
```
cd "C:\Users\Olly\AI OS\funnel"
git add .
git commit -m "Session update: [one-line summary]"
git push
```
