---
name: interactive-tools
description: Building interactive multi-step tools and long-form pages (build-your-meditation.html, belief-quiz.html) — wizard/step-gating patterns, canvas text-packing bugs, non-blocking API calls
---

# Interactive Tools & Long-Form Page Skill

## Scope
Custom-built interactive HTML tools and quiz/wizard-style pages that live in `website/sections/` or `funnel/sections/` — distinct from `training/`'s scroll-through training pages. Covers `build-your-meditation.html` (7-step wizard), `belief-quiz.html`/`belief-quiz-optin.html` (quiz + results page). Read this before building or editing any multi-step interactive tool in either folder.

## Rules and Constraints

**Never gate progress past a mandatory field on a promise that isn't true.** `build-your-meditation.html`'s email step originally showed "you can still continue" after a failed send, but the code didn't actually let them continue. Fixed by making the `.catch()` handler on the `fetch()` call itself also advance the screen (`goToScreen('form')`) — a failed background send must never block navigation once required fields are valid; only the *field validation*, not the network call, should gate the "Next" button.

**A shared input class must not silently break a different field's usability.** The date-picker's `color:transparent` fix (needed to hide the native picker's own rendering while a custom overlay shows the formatted date) was applied to a shared `.bym-date-input` class also used by the Name/Email text inputs, making typed text invisible. Fixed by splitting into a base class (normal visible text) plus a `--picker` modifier applied only to the actual date input. Never share a class between a field using a visual-hack (transparent text, custom overlay) and a field the user types real content into — split into base + modifier.

**Never** free-text-override a structured choice once a dedicated set of options exists for it — an "edit it your own way" toggle on the Choose Your New Belief step was explicitly built then explicitly removed; a step designed around a fixed belief/emotion set should stay closed, not gain an escape hatch, unless asked.

**The 8 belief/counter-belief pairs are shared canonical content between `build-your-meditation.html`'s `BELIEFS` array and `belief-quiz.html`'s `BELIEFS` array — a wording change in one is not "done" until checked against the other.** Found 2026-08-30: `belief-quiz.html`'s counter-belief ("becomes") wording had drifted out of sync on 7 of 8 entries (e.g. "I am loved unconditionally" vs the builder's current "I am loved for who I am"), and the quiz had no "what this looks like" content at all even though the builder had added it earlier in the same pivot. When asked to "update the quiz's beliefs," treat `build-your-meditation.html` as the source of truth and copy its `quote`/`becomes`/`looksLike` fields verbatim rather than re-deriving similar-sounding wording — near-identical phrasing that isn't identical is exactly what caused the drift.

**When porting a UI pattern (e.g. an expandable "what this looks like" panel) from one file to another, copy the actual CSS treatment, not just the interaction behaviour.** The first pass at `belief-quiz.html`'s panel got the toggle/expand JS right but boxed the text in a bordered card capped at `max-width:26ch` — which reads as a cramped vertical column of text, not the source pattern. The builder's actual panel (`.bym-belief-looks-panel` in `build-your-meditation.html`) has no box at all: no background, no border, no tight width cap — it's plain text flowing at a wide `max-width` (`52ch` worked well). When asked to "make it look like the other one," check the source file's CSS for that exact class rather than assuming a reasonable-looking box treatment is equivalent. Olly's follow-up ask — make the panel's body text the same pink accent color as its own toggle button (`color:var(--accent-2)` on both) — is now the standing default for this component: the toggle label and the revealed description should read as one connected pink unit, not label-pink/body-white.

## Process / Steps

**Canvas-based reverse-pyramid text packing (headline or body copy, mobile or desktop) — the reliable pattern, and its two recurring bugs:**
1. Cache the original text once via `el.dataset.originalText` on first run, and always pack *from that cached string*, never from `el.textContent` directly on a second pass. Symptom if skipped: words silently merge together ("helpyou", "programsblocking") — caused by the script re-running (once immediately, once on `window.load`) and the second run reading text that already has `<br>` tags in place of spaces from the first run's mutation.
2. Measure the packing container's width with `el.offsetWidth`, never `getBoundingClientRect().width`, whenever the element sits inside anything using `transform:scale()` (e.g. `about-page-tiles.html`'s `.apt-wrap`, or any other scaled preview wrapper). `getBoundingClientRect()` returns the post-transform visual size and silently breaks the packing math; `offsetWidth` reflects the untransformed CSS layout box.
3. To avoid an orphaned single word stranded alone on the final line, don't greedily fill the first line to 100% of the container width — search downward from 100% to ~55% of the container width in ~1% steps for the narrowest starting budget that still produces the *same total line count* as the full-width baseline, then pack from that budget. This redistributes words more evenly and was the fix for a lone "love" sitting alone on line 3.
4. Re-run on both `load` and `resize`, and if the element lives inside a page that also gets shown/hidden dynamically (e.g. a quiz's results screen), re-trigger packing explicitly when that screen becomes visible — don't rely solely on the load/resize listeners, which won't fire again for a screen that was `display:none` at load time.

**Mandatory-field gating on a wizard step:** build a `checkFieldsFilled()`-style function that the "Next" button's enabled state depends on, re-run on every relevant `input` event, not just checked once on step entry — this is what made the "can't move past the email step without details" requirement actually hold up when Olly tested it with a real (repeated) email.

**When Olly says a swapped video/image "isn't in there," check whether the live page was actually re-pasted before assuming the edit failed.** These are standalone HTML files pasted into a GHL Custom HTML block — editing the local file never touches the live page until Olly copies it in and republishes. Confirm the file's actual current content first (grep the line), and if it's already correct, the likely explanation is a stale local preview or the live paste step not having happened yet, not a failed edit.

**Extracting a poster frame for a new video: check whether the source is a talking-head recording or a full-page screen recording before deciding how to crop it.** A video for `build-your-meditation.html`'s Activate step turned out to be a screen recording (UI + webcam overlay), not a plain webcam feed — cropping down to just the face would have made the poster misrepresent what the video actually shows. Extract via `ffmpeg -ss 00:00:01 -frames:v 1 -q:v 2 out.jpg`, open the frame, and only crop further if the raw frame doesn't already match the player's `aspect-ratio` (check the CSS, e.g. `.bym-video-wrap{ aspect-ratio:16/9; }`) — if it matches, ship the raw frame as-is. Since there's no direct upload capability to the GHL media library, hand the extracted frame back via the right-click-save-image Artifact pattern (see `skills_training-pages.md`) and wait for Olly to paste back the hosted URL before wiring it into the `poster` attribute.

## Examples

**Non-blocking fetch pattern (the correct shape for a step that fires a background side-effect and must never get stuck):**
```js
fetch(MEDITATION_SUMMARY_WORKER_URL, { method: 'POST', body: JSON.stringify(payload) })
  .then(() => goToScreen('form'))
  .catch(() => goToScreen('form')); // failure still advances — never blocks
```

---

## Changelog

**2026-08-30 (2) — Post-session feedback review (belief-quiz.html "what this looks like" panel styling)**
- Rules and Constraints: added the "copy the actual CSS, not just the behaviour" lesson — porting the expandable panel pattern from `build-your-meditation.html` to `belief-quiz.html` got the JS right first try but boxed the text into a bordered, narrow (`26ch`) card instead of the source's plain wide-flowing text, requiring a follow-up correction. Also documented the now-standing default of matching the toggle label and panel body to the same pink accent color as one connected unit.
- No rules removed — this sharpens the prior entry's "copy fields verbatim" guidance to also cover CSS/visual treatment, not just text content.

**2026-08-30 (1) — Post-session feedback review (video/poster swap on build-your-meditation.html; belief sync on belief-quiz.html)**
- Rules and Constraints: added the shared-canonical-content rule for the two files' `BELIEFS` arrays — a real drift was found and fixed this session (7 of 8 counter-belief strings had diverged, and the quiz was missing the "what this looks like" content entirely). Treat `build-your-meditation.html` as the source of truth for this content going forward.
- Process/Steps: added the "check whether the live page was actually re-pasted" step — Olly reported a video/poster swap "wasn't in there" when the file was in fact already correct, because GHL Custom HTML blocks don't update until re-pasted.
- Process/Steps: added the poster-frame-extraction workflow, including the talking-head-vs-screen-recording distinction (cropping a screen-recording frame down to just the face would misrepresent the video) and the right-click-save-image handoff pattern for getting an extracted frame back to Olly to upload, since there's no direct GHL media library upload capability.
- No rules removed — all additions this round.

**2026-08-28 — Initial skill file, post-session review (build-your-meditation.html, belief-quiz.html)**
- Created this file — no dedicated skill previously existed for `website/sections/`- or `funnel/sections/`-style interactive tools, distinct from `training/`'s scroll-page skill.
- Documented the two reverse-pyramid canvas-packing bugs found this session: the double-run `textContent`-mutation word-merge bug (fix: cache `el.dataset.originalText`), and the `getBoundingClientRect()`-under-`transform:scale()` measurement bug (fix: use `el.offsetWidth`) — both cost multiple rounds of correction before being isolated, and both will recur in `about-page-tiles.html` or any other scaled-preview context if not checked first.
- Documented the downward-search-for-narrowest-budget refinement (fixes an orphaned last-word line) and the need to re-trigger packing when a hidden screen becomes visible, not just on load/resize.
- Documented two real bugs from `build-your-meditation.html`: the non-blocking-fetch pattern (a failed send must still advance the step, not just claim it will), and the shared-input-class transparent-text bug (Name/Email inputs went invisible from a class built for the date picker's visual hack).
- Documented the explicit removal of a free-text override on the Choose Your New Belief step as a "don't add an escape hatch to a structured choice" rule.
