# Skill: Add a new lead magnet (entry point into the email list)

Use this whenever Olly wants a new way for people to join the list: a quiz/tool, cheat sheet, guide, video, challenge, etc.
Built from the "How Close Are You To Love?" scale check (2026-10-26), which went from idea to live in one session.
Goal: Olly approves the idea and the preview, then pastes 2-3 things into GHL. Everything else is done here.

---

## 0. The ecosystem rules (never break these)

| Rule | Why |
|---|---|
| Every way in adds its **own source tag** (e.g. `emotional resonance training`, `emotional scale check`). Tags are only ever added, never swapped or removed (except `daily email list` on joining). | One contact can come in through several lead magnets; the tags just build up and show the history. |
| The daily email tag is **`daily email list`** (NOT `daily email`). Daily broadcasts go to it. | A wrong tag silently splits the list. Confirmed by Olly 2026-10-26. |
| **New people get their welcome emails first; `daily email list` is only added after them (day 2).** | Nobody gets two emails a day. |
| People **already on `daily email list`** get only the thing they asked for, then the workflow ends. | No duplicate emails; they've already had the other lead magnets. |
| **Members** (`joined heart attractor program`) never get `daily email list` back. | Joining removes it; a lead magnet must not re-add it. |
| Each new lead magnet's welcome sequence cross-promotes the **other** lead magnets (day 1), and the other workflows get a branch that offers the new one. | The "ecosystem": whichever lead magnet people find first, they're offered the rest. |
| Olly started a fresh list (2026-10): everyone on `daily email list` has been through a current lead magnet. | So "already on list" = "has already been offered the others". |

Current lead magnets (keep this table updated):

| Lead magnet | Page | Source tag | Webhook (GHL workflow) | Next step on the page |
|---|---|---|---|---|
| Free video training (Emotional Resonance) | ollyhenson.com/training (`sections/emotional-resonance-optin.html`) | `emotional resonance training` | `.../webhook-trigger/aaa6a82e-9714-4f85-9e07-e1ddb13f77a2` ("Emotional Resonance Training Opt-in") | Redirects to the YouTube video |
| **The Love Scale** ("How close are you to love?", Emotional Scale check) | ollyhenson.com/scale (`sections/emotional-scale-check.html`) | `emotional scale check` | `.../webhook-trigger/d2d567ec-81e9-4b28-9e5a-151273a0c42a` ("Emotional Scale Check") | Result page → Apply button |

Webhook base: `https://services.leadconnectorhq.com/hooks/LRqVZmxns8f3xcJLHzBK/webhook-trigger/`

---

## 1. Decide (ask Olly only what's genuinely open)

- **What it is** and the one-line promise. Research-backed default: short, specific and *usable* beats long (quizzes/assessments, checklists, cheat sheets, templates >> ebooks/PDF summaries). PDFs are unreadable on phones: build a mobile web page instead (offer a download only if asked).
- **Who it's for / where traffic comes from** (YouTube viewers have usually seen the training; Instagram people often haven't). This decides the page's next step (apply vs watch the training).
- **Page path** (short, sayable out loud: `/scale`, `/guide`). Confirm before making UTM links.
- **Source tag** name (lowercase, words: `emotional scale check`).
- **Any data to save** on the contact (e.g. a quiz result) → GHL custom fields.

## 2. Build the page (preview first, always)

- File: `funnel/sections/<name>.html`. Copy the look of `emotional-scale-check.html` / the live opt-in: dark purple, Poppins 400-800, lilac→pink gradient, `ohc_` ids.
- **GHL rules** (from `funnel/CLAUDE.md` Known Quirks, all mandatory):
  - one Custom HTML block; no `<form>` tag (use a div + `type="button"` + click handler); inputs not named `first_name`/`email` (use `ohc_first`, `ohc_last`, `ohc_mail`)
  - `html, body{ background:#0A0510 !important; margin:0; padding:0 }`; also paint GHL wrappers dark (`.hl_page-preview--content .c-section/.c-row/.c-column`) and `min-height:100vh` on `.ohc-page`, or a white strip shows under short screens
  - full-width escape on `.ohc-page` (`width:100vw; left:50%; transform:translateX(-50%)`)
  - always collect **first name, last name and email**
- **Olly's layout preferences:**
  - Landing/start screens centred, **inverted pyramid**: headline lines each narrower than the one above, the headline's first line wider than the subheading's first line; subheading hand-set into lines (desktop and phone versions), widths measured in Poppins with a canvas, phone font tied to `100vw` so the shape holds.
  - Quiz/step screens: one question per screen, **never auto-advance**, small "← Back" text bottom-left next to Next (from screen 2) and on the email step.
  - Short copy. Olly cuts anything that feels like "too much text". No em dashes, no comma before and/or, "program" not "programme".
  - **Result pages stay lean.** Olly removed the practice paragraphs and the "biggest gap" section from The Love Scale result: group, headline, the visual, what it means, next step up (chips), ONE call to action. Don't pad results with advice.
  - **One next step, matched to where the traffic comes from.** YouTube viewers have seen the training, so The Love Scale result goes straight to Apply (no training button).
  - **Every line must say what to do, plainly.** "So it's the best place to practise first" confused Olly; spell out the action ("In your 10 minutes a day, picture it going differently: …").
  - **Buttons use the product's name** ("Use The Love Scale", not "Start The Check"); the subheading leads with it too ("Use The Love Scale to find out how close you are to attracting your perfect partner").
  - **Name the tool** with a short, catchy name that matches the keyword (The Love Scale / SCALE). Rename everything people see; keep tags, workflow names and UTM campaigns unchanged so nothing breaks.
  - **Give SEO copy every time a page is published or retitled**: page title (`<Name>: <hook> | Olly Henson`), meta description under 155 characters, keywords.
- **Webhook payload:** `first_name, last_name, email`, any result fields, and `utm_source/medium/campaign/content` read from the page URL.
- **Preview:** publish a scratchpad copy with `WEBHOOK_URL = ""` as an Artifact. Never republish the real file (it has the live webhook) and never let Olly paste the preview into GHL. Republish the preview after every change (Olly expects it), and note it resets the page for anyone viewing it.
- **Show the preview before Olly copies anything**, and after any copy change. He asks "show me the preview first"; republish the preview copy (webhook blank) each time.
- Check phone fit with puppeteer (`funnel/node_modules/puppeteer`, Edge), 375/390/430 wide; a screenshot catches layout bugs the numbers miss.

## 3. GHL setup, one step at a time (Olly works through these in order)

Olly prefers to paste prompts into **GHL's workflow AI** rather than click through. Always tell it what NOT to touch, and afterwards **check the webhook URL didn't change** (the AI has regenerated triggers before).

1. **Workflow + trigger:** Automation → Workflows → Create → name it → trigger **Inbound Webhook** → Olly sends the URL. Put it in the page, then send one test POST with curl (all payload fields, `email: scaletest@example.com`). If GHL shows no sample: "Fetch Sample Requests" / refresh, pick it as Mapping Reference, Save Trigger.
2. **Custom fields** (only if saving data): Settings → Custom Fields → Single line, Contact folder. Keys become `{{contact.<snake_case_name>}}`.
3. **Create/Update Contact:** map each field by *typing* `{{inboundWebhookRequest.<key>}}` (picked chips sometimes save blank). Map First Name, Last Name, Email, custom fields, and the plain UTM Source/Medium/Campaign/Content fields. "All selected fields must have a value" = an empty row.
4. **Tag:** Add Contact Tag `<source tag>`.
5. **Delivery / result email** (day 0, everyone).
6. **If/Else routing** (paste to the AI; adapt names):

```
In the "<WORKFLOW NAME>" workflow, do NOT change, delete or recreate the Inbound Webhook trigger, the Create/Update Contact step, the "<source tag>" tag step or the "<delivery email>" step.

After the "<delivery email>" step, add an If/Else with branches in this order:
1. "Member": Contact Tags includes "joined heart attractor program" → no actions (end).
2. "Already on list": Contact Tags includes "daily email list" → no actions (end).
3. "None" (new people):
   a. Wait: 1 day
   b. Send Email "<cross-promo email name>" (details below)
   c. Wait: 1 day
   d. Add Contact Tag "daily email list" (existing tag, don't create a new one)

Email "<cross-promo email name>":
Subject: <short lowercase subject>
Preview text: <preview>
Body (each line its own short paragraph, blank line between):
<body>
Make the word "here" a link to: <tracked link>
```

   If someone may have taken another lead magnet in the last day or two (not yet on the list), add a branch before "None": Contact Tags includes "<other source tag>" → Wait 1 day → Add Contact Tag "daily email list".
6b. **The bonus email mirrors the other lead magnet's bonus.** Training people get "a bonus for you: The Love Scale"; Love Scale people get "a bonus for you: the full training". Olly rejected a plain invite ("this is for people who've watched the training and the bonus is the scale").
7. **Templates:** picking Olly's email template in GHL can REPLACE the body (once it pasted the results email into the bonus step). Pick the template first, then paste the body, then check it.
8. **Cross-promote from the existing workflows:** in each other lead magnet's workflow, the "None" branch's day-1 email should offer the new lead magnet (or add a second offer on a later day). Give the AI the same do-not-touch preamble.
9. **Publish**, then **test end to end on Olly's phone** with `?utm_source=test&utm_medium=test` and a real inbox: contact fields, both tags (source + no `daily email list` until day 2 for a new contact), UTM Source = test, the email arrives with merge fields filled. Then delete the test contact.

## 4. Emails

- Olly's broadcast style: short lowercase subjects (1-4 words), one line per paragraph, blank lines between, "===> here" linked, sign-off "Speak soon, / Olly". ➡️ for bullet lists. No em dashes.
- Olly pastes emails into GHL formatted as **Arial, 18px, 1.5 line spacing**. Give him a copy page (Artifact) with a "Copy email" button that writes `text/html` (inline styles, linked "here") plus subject/preview copy buttons. Example: `marketing/email-sequences/scale-check-emails-copy.html`.
- Never claim results that aren't known ("most people are surprised…").

## 5. Tracking

- **Links on the page:** apply buttons use `https://ollyhenson.com/apply?utm_source=<lead magnet slug>&utm_medium=result&utm_campaign=heart_attractor` (applications record it in the HA UTM fields).
- **Email links:** `utm_source=email&utm_medium=<email name slug>&utm_campaign=<lead magnet campaign>`.
- **Traffic links to the new page**, one per placement: `https://ollyhenson.com/<path>?utm_source=<youtube|instagram|tiktok|facebook>&utm_medium=<description|shorts|bio|story|dm>&utm_campaign=<lead magnet campaign>`. Log every link in `marketing/memory/utm-link-log.md` (newest at top).
- **Manual DMs:** Olly makes short GHL redirects (Sites → Settings → URL Redirects, e.g. `/scale-tt` → the long UTM link). Once he confirms they work (UTMs survive the redirect), put copy buttons for them in the Hub Overview ("Application links to send" box pattern).
- **Short links for anything typed or sent by hand** ("if I send someone a massive long UTM link, they'll be confused and won't click"). One redirect = one tracked link: check a path isn't already used for another medium (/lovescale = description, so Shorts got /love).
- Hub page-view beacon (not optional any more, 2026-10-26: every lead magnet page sends it, page name added to `PAGES` in `functions/api/track.js` and the tag counted in `functions/api/ghl-sources.js`, so the Overview shows its visits and sign-ups): `navigator.sendBeacon('https://hub.ollyhenson.com/api/track', '<page>|<source>|<medium>|<content>')` on the live domain only, like the opt-in and application pages.

## 6. After it's live

- Add a row to the lead magnet table at the top of this file.
- Add a changelog entry to `funnel/CLAUDE.md` (page, webhook, payload, workflow steps, preview link).
- Add the CTA to the content tools (Content Idea Generator / Story generator) per platform: Instagram = ManyChat keyword ("Reply <WORD>"), TikTok = "DM me <WORD>" and Olly sends the short link by hand, YouTube = description line 2 + Shorts say the short address.
- YouTube description line 2 format: `💜 <hook question>? Take the free 2-minute check: <tracked link>`.

## Changelog
- **2026-10-26 skill review:** Added page rules from The Love Scale build (lean result pages, one next step per traffic source, plain instructions, product-name buttons, catchy tool name with internal names kept, SEO copy), preview-before-copy, mirrored bonus emails, short links with one-redirect-per-medium, and made the Hub beacon + track/ghl-sources update a required step. Why: each came from a correction or request from Olly while building The Love Scale.
