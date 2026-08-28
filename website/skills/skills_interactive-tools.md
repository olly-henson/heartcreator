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

## Process / Steps

**Canvas-based reverse-pyramid text packing (headline or body copy, mobile or desktop) — the reliable pattern, and its two recurring bugs:**
1. Cache the original text once via `el.dataset.originalText` on first run, and always pack *from that cached string*, never from `el.textContent` directly on a second pass. Symptom if skipped: words silently merge together ("helpyou", "programsblocking") — caused by the script re-running (once immediately, once on `window.load`) and the second run reading text that already has `<br>` tags in place of spaces from the first run's mutation.
2. Measure the packing container's width with `el.offsetWidth`, never `getBoundingClientRect().width`, whenever the element sits inside anything using `transform:scale()` (e.g. `about-page-tiles.html`'s `.apt-wrap`, or any other scaled preview wrapper). `getBoundingClientRect()` returns the post-transform visual size and silently breaks the packing math; `offsetWidth` reflects the untransformed CSS layout box.
3. To avoid an orphaned single word stranded alone on the final line, don't greedily fill the first line to 100% of the container width — search downward from 100% to ~55% of the container width in ~1% steps for the narrowest starting budget that still produces the *same total line count* as the full-width baseline, then pack from that budget. This redistributes words more evenly and was the fix for a lone "love" sitting alone on line 3.
4. Re-run on both `load` and `resize`, and if the element lives inside a page that also gets shown/hidden dynamically (e.g. a quiz's results screen), re-trigger packing explicitly when that screen becomes visible — don't rely solely on the load/resize listeners, which won't fire again for a screen that was `display:none` at load time.

**Mandatory-field gating on a wizard step:** build a `checkFieldsFilled()`-style function that the "Next" button's enabled state depends on, re-run on every relevant `input` event, not just checked once on step entry — this is what made the "can't move past the email step without details" requirement actually hold up when Olly tested it with a real (repeated) email.

## Examples

**Non-blocking fetch pattern (the correct shape for a step that fires a background side-effect and must never get stuck):**
```js
fetch(MEDITATION_SUMMARY_WORKER_URL, { method: 'POST', body: JSON.stringify(payload) })
  .then(() => goToScreen('form'))
  .catch(() => goToScreen('form')); // failure still advances — never blocks
```

---

## Changelog

**2026-08-28 — Initial skill file, post-session review (build-your-meditation.html, belief-quiz.html)**
- Created this file — no dedicated skill previously existed for `website/sections/`- or `funnel/sections/`-style interactive tools, distinct from `training/`'s scroll-page skill.
- Documented the two reverse-pyramid canvas-packing bugs found this session: the double-run `textContent`-mutation word-merge bug (fix: cache `el.dataset.originalText`), and the `getBoundingClientRect()`-under-`transform:scale()` measurement bug (fix: use `el.offsetWidth`) — both cost multiple rounds of correction before being isolated, and both will recur in `about-page-tiles.html` or any other scaled-preview context if not checked first.
- Documented the downward-search-for-narrowest-budget refinement (fixes an orphaned last-word line) and the need to re-trigger packing when a hidden screen becomes visible, not just on load/resize.
- Documented two real bugs from `build-your-meditation.html`: the non-blocking-fetch pattern (a failed send must still advance the step, not just claim it will), and the shared-input-class transparent-text bug (Name/Email inputs went invisible from a class built for the date picker's visual hack).
- Documented the explicit removal of a free-text override on the Choose Your New Belief step as a "don't add an escape hatch to a structured choice" rule.
