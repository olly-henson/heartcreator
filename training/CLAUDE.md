# Training Project — Claude Instructions

> **⚠️ PIVOT IN PROGRESS (2026-08-13):** "Heart Creator" is being renamed **Heart Attractor** — niched to attracting/creating an ideal relationship. Training pages below have not been updated for this pivot. See `../marketing/memory/argument_sheet_heart_attractor.md` for the new positioning.

## Role
Training builder. This folder's agent builds and maintains standalone HTML training pages for the Heart Attractor Community — used by Olly to record Loom walkthroughs, and some repurposed as Skool About Page content.

## Read First
**Before building or editing any training page, read `skills/skills_training-pages.md` in full.** It has the proven CSS/JS patterns, palette, existing-page reference table, process checklist, and a gotchas log — don't reinvent or guess at anything it already answers.

## File Structure
```
training/
  *.html                    ← each training is one self-contained HTML file, no build step
  <name> images/            ← sibling images folder per training (space in name is fine)
  images/                   ← shared images folder used by some trainings
  pdfs/
  skills/
    skills_training-pages.md
    template.html
  CLAUDE.md
```

## How It Works
- Every training is a standalone `.html` file — open directly in a browser, no framework/build step.
- Formats in use: one-step-per-screen scroll (default), single static overview slide, worksheet A4 pages, tick/cross comparison, benefits/hook slide. See the skill file for which to pick.
- Images are dropped in by Olly after the page is built — always wire up expected filenames with the `onerror` placeholder pattern (mandatory, see skill file).

## Centering Elements on a Slide (learned building about-page-video.html, 2026-08-14)

**Root cause of off-center elements: the scrollable `.steps` container's own scrollbar eats width from its content box**, shifting the visible content's center left of raw `50vw`. Any fixed-position overlay pinned to `50vw` (or a JS-measured content-box center) will then disagree with text centered via `text-align`/flex inside `.steps`.

**The fix — CSS only, no JS measurement:** add `scrollbar-gutter: stable both-edges;` to `.steps`. This reserves symmetric space on both sides of the scrollable container regardless of which side the scrollbar actually renders, so the content box's center becomes mathematically identical to the viewport's center. This replaced an earlier, more fragile approach that used JS (`stepsEl.offsetWidth - stepsEl.clientWidth`) to measure the scrollbar and compensate with manual padding/CSS variables — don't rebuild that JS version; the CSS property makes it unnecessary.

**All centered elements must be children of the same centered parent, using the same display/text-align method** — don't individually position one element with a fixed offset while another relies on inherited `text-align`. If one element (e.g. a large nowrap headline) still drifts off-center relative to siblings using the identical parent/text-align setup, don't assume it's a positioning bug before checking text-metrics: `text-align:center` centers based on the *rendered line-box width*, which can behave unpredictably for very large `white-space:nowrap` text in some fonts/weights. The more robust fix in that case is to make the element itself `display:flex; justify-content:center; width:100%;` — this centers the box directly via flex alignment rather than depending on text-line-box math, and is the current pattern for `.intro-title-line1`/`.intro-title-line2` in `about-page-video.html`.

**Never fake alignment with manually eyeballed fixed pixel offsets or `margin-left` nudges** — if an element looks off, find the structural cause (different parent, conflicting `float`/`text-align`, leftover fixed-width/position rule) rather than adding a compensating offset. A visual guide line (e.g. a fixed 1px red centerline) is useful for *spotting* a problem but is not proof of a fix — confirm any centering fix with real `getBoundingClientRect()` measurements in the browser console, e.g.:
```js
['.intro-eyebrow','.intro-title-line1','.intro-title-line2'].forEach(sel => {
  const el = document.querySelector(sel);
  const r = el.getBoundingClientRect();
  console.log(sel, '| center-x:', (r.left + r.width/2).toFixed(1), '| viewport center:', (window.innerWidth/2).toFixed(1));
});
```
Claude does not have a live browser/devtools tool in this environment to run this itself — ask Olly to paste the snippet and report the numbers back rather than fabricating or assuming measured results.
