# Training Pages — Skill

Standalone HTML pages used two ways: (1) Olly records Loom videos while scrolling/reading through them, and (2) some are repurposed as content for the Heart Creator Skool Community About Page. All live in `C:\Users\Olly\AI OS\heartcreator\training\` as single self-contained `.html` files (no build step, no external JS framework — open directly in a browser).

**Read this file in full before building or editing any training page.** It captures the exact CSS/JS patterns already proven across the existing trainings — don't reinvent them from scratch, and don't guess at colors/fonts/sizes that are already defined here.

---

## Existing Trainings (reference these directly, don't re-derive)

| File | Format | Content |
|------|--------|---------|
| `creation-model-training.html` | One-step-per-screen scroll | **The Creation Formula** (renamed from "The Model for Creation" 2026-07-24), 6 steps (Activate → Synchronise → Create → Feel → Attract → Experience) |
| `creation-model-overview.html` | Single static slide | All 6 Creation Formula steps in one row with connecting arrows — captions here must match the training page's body text verbatim (see Process Checklist) |
| `how-to-do-the-meditation.html` | One-step-per-screen scroll | The 7-step meditation walkthrough (Close Eyes → Give Thanks), includes a combined two-image "cycle" slide for steps 5/6 (Intention & Feel) |
| `create-your-outcome.html` | One-step-per-screen scroll + "worksheet" (A4 paper) pattern | Create Your Outcome worksheet (renamed from "Choose Your Creation" 2026-08-06, pure rename — per-step wording still Choose → Symbolize → Conditions → Feel): Choose → Symbolize → Conditions → Feel, plus 5 worked examples, each showing a progressively-filled-in paper mockup |
| `how-to-maintain-the-belief.html` | One-step-per-screen scroll | Calling up your symbol in daily life situations (Working, Gym, Walking, Reading, Restaurant, Before Bed) |
| `program-vs-alone.html` | One-step-per-screen scroll | "Trying Alone" vs "Inside Heart Creator" tick/cross comparison, followed by the 6 Creation Formula step slides |
| `energetic-centres-explained.html` | One-step-per-screen scroll | The 8 energetic centres (Root → Beyond/quantum field bridge), same standard image+text layout, no special variant |
| `before-vs-after.html` | Fixed-size screenshot canvas (see new variant below) | Before/After Heart Creator comparison, for a Skool video thumbnail — went through several rounds (6 bullets/side → 2 → 1 combined sentence → single word per side) before landing on one huge word ("Struggling"/"Creating") per side over a photo, with absolute-px positioning |
| `identity-shift.html` | One-step-per-screen scroll + worksheet variant ("back of page" single identity-line layout) | Optional extra step, recommended for people feeling heavy internal resistance to their new reality — has them turn their existing Create Your Outcome worksheet over and add ONE line at the identity level that best links to their outcome ("I am someone who…"). Deliberately scaled back 2026-08-06 from an earlier full Fred-Dodson-4-stage build (Define/Characteristics/Visualize/Act As If/Reinforce) — Olly wants to start minimal, just the one identity line, nothing else, for now. 5 worked examples (Financial Abundance, New Relationship, Healing, Purposeful Career, Successful Business). See changelog for the fuller build this was cut down from, and the `pdfs/characteristics-ideas-list-source.md` companion doc, currently unused by this training but kept in case the fuller version comes back |

When asked for "another training like the others," these are the pattern to copy — don't design from a blank page.

---

## File & Folder Conventions

- New training: `heartcreator/training/<kebab-case-name>.html`
- Every training that uses photos gets its own **sibling images folder** next to the HTML file, named descriptively, e.g.:
  - `meditation steps images/`
  - `self-regulating images/`
  - `program-vs-alone images/`
- Images are referenced with **relative paths including the space in the folder name** — this works fine in a browser, e.g. `src="meditation steps images/Step 1.png"`
- Olly drops images in himself after the page is built. Always wire up the `<img>` src to the *expected* final filename (e.g. `Step 1.png`, `Step 2.png`) even before the file exists — see the placeholder pattern below.
- **Never guess file contents** — if Olly says an image is already in a folder, use `Read` on the actual PNG to check it before assuming what it shows (learned the hard way: a photo turned out to still have a client's placeholder watermark badge on it).

### Image placeholder pattern (always use this, it's not optional)

```html
<div class="step-imgwrap">
  <img src="images/Step 1.png" alt="Activate" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
  <div class="placeholder" style="display:none;">Image: Step 1.png</div>
</div>
```

The `onerror` swap means the page never shows a broken-image icon — it shows a clean text label until the real file is dropped in with that exact name.

---

## Palette & Fonts

Two font pairings are in use depending on the page's visual register:

**1. Standard training pages** (step-by-step, comparisons, self-regulation) — Poppins:
```css
:root{
  --navy:#6B1E4D;
  --navy-deep:#3D0F2C;
  --ink:#2A1420;
  --orange:#E8672C;
  --cream:#FBF3F0;
  --paper:#FFFFFF;
  --line:#E9DCE3;
}
```
```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&display=swap" rel="stylesheet">
```
Background per slide: `radial-gradient(120% 100% at 20% 0%, #58193F 0%, var(--navy-deep) 55%, #240A19 100%)`, alternating with a mirrored gradient on odd/even slides for subtle variation (see Slide Background Alternation below).

**2. "Worksheet" / handwritten paper pages** (create-your-outcome.html) — adds EB Garamond italic for anything meant to look hand-written on the paper itself:
```html
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@1,500;1,600;1,700&display=swap" rel="stylesheet">
```
Handwritten text on the paper is always **black** (`#000`), never navy/orange — that distinction was deliberately corrected during build (see Gotchas).

Struggle/create comparison colors (used in `program-vs-alone.html` and originally sourced from `meditation-explained-standalone.html`):
```css
--struggle:#B33F3F;
--create:#3E7A5D;
```

---

## Core Pattern: One-Step-Per-Screen Scroll

This is the default format for any "walk through N steps" training. Full-height sections, scroll-snap, side dot nav, progress label, keyboard arrows.

```css
*{box-sizing:border-box; margin:0; padding:0;}
html{scroll-behavior:smooth;}
body{ font-family:'Poppins', sans-serif; overflow-x:hidden; }

.steps{ height:100vh; overflow-y:scroll; scroll-snap-type:y mandatory; }
.step{
  height:100vh;
  scroll-snap-align:start;
  display:flex; align-items:center; justify-content:center;
  position:relative;
  padding:40px 32px;
  background:radial-gradient(120% 100% at 20% 0%, #58193F 0%, var(--navy-deep) 55%, #240A19 100%);
}
.step:nth-child(odd){
  background:radial-gradient(120% 100% at 80% 100%, #3D0F2C 0%, var(--navy-deep) 55%, #240A19 100%);
}

.dots{ position:fixed; right:26px; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:14px; z-index:10; }
.dot{ width:11px; height:11px; border-radius:50%; background:rgba(255,255,255,.25); cursor:pointer; border:none; transition:background .2s; }
.dot.active{ background:var(--orange); }

.progress-label{ position:fixed; top:24px; left:32px; color:rgba(255,255,255,.55); font-size:13px; letter-spacing:.1em; text-transform:uppercase; font-weight:600; z-index:10; }
```

```html
<div class="progress-label" id="progressLabel">Step 1 / N</div>
<div class="dots" id="dots"></div>
<div class="steps" id="steps">
  <section class="step" data-title="...">...</section>
  <!-- one section per step -->
</div>
```

```js
const stepsEl = document.getElementById('steps');
const steps = document.querySelectorAll('.step');
const dotsEl = document.getElementById('dots');
const progressLabel = document.getElementById('progressLabel');

steps.forEach((s, i) => {
  const dot = document.createElement('button');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => steps[i].scrollIntoView({behavior:'smooth'}));
  dotsEl.appendChild(dot);
});
const dots = document.querySelectorAll('.dot');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = Array.from(steps).indexOf(entry.target);
      dots.forEach(d => d.classList.remove('active'));
      dots[idx].classList.add('active');
      progressLabel.textContent = `Step ${idx + 1} / ${steps.length}`;
    }
  });
}, { root: stepsEl, threshold: 0.6 });
steps.forEach(s => observer.observe(s));

document.addEventListener('keydown', (e) => {
  const active = document.querySelector('.dot.active');
  const idx = Array.from(dots).indexOf(active);
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { if (steps[idx + 1]) steps[idx + 1].scrollIntoView({behavior:'smooth'}); }
  else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { if (steps[idx - 1]) steps[idx - 1].scrollIntoView({behavior:'smooth'}); }
});
```

**This dots/progress JS counts `.step` elements dynamically (`steps.length`)** — adding or removing a slide never requires updating the progress label logic, only the hardcoded initial text `Step 1 / N` in the HTML (cosmetic only, corrects itself on first scroll observer fire).

### Standard image+text step layout (used inside each `.step`)

```html
<div class="step-inner">
  <div class="step-imgwrap">
    <img src="images/Step 1.png" alt="..." onerror="...">
    <div class="placeholder" style="display:none;">Image: Step 1.png</div>
  </div>
  <div class="step-text">
    <div class="step-number-row">
      <div class="step-number">1</div>
      <div class="step-word">Activate</div>
    </div>
    <div class="step-title">...</div>
    <div class="step-body">...</div>
  </div>
</div>
```

```css
.step-inner{
  max-width:1100px; width:100%; color:#fff;
  display:grid;
  grid-template-columns:minmax(220px, 380px) 1fr;
  align-items:center; gap:60px; text-align:left;
}
.step-number-row{ display:flex; align-items:center; gap:18px; margin-bottom:14px; }
.step-number{ font-size:clamp(50px,6vw,80px); font-weight:800; color:var(--orange); line-height:1; }
.step-word{ font-size:clamp(24px,2.6vw,36px); font-weight:800; color:#fff; letter-spacing:.02em; line-height:1; white-space:nowrap; }
.step-imgwrap{ width:100%; aspect-ratio:1/1; border-radius:24px; overflow:hidden; border:3px solid rgba(255,255,255,.15); box-shadow:0 20px 50px rgba(0,0,0,.45); background:rgba(255,255,255,.06); display:flex; align-items:center; justify-content:center; }
.step-imgwrap img{ width:100%; height:100%; object-fit:cover; display:block; }
.step-title{ font-size:clamp(22px,2.6vw,30px); font-weight:700; margin-bottom:18px; color:#fff; }
.step-body{ font-size:clamp(16px,1.6vw,19px); line-height:1.6; color:#EBD9E2; text-wrap:balance; }

@media (max-width:820px){
  .step-inner{ grid-template-columns:1fr; text-align:center; gap:28px; }
  .step-imgwrap{ max-width:280px; margin:0 auto; }
}
```

`white-space:nowrap` on `.step-word` is deliberate — it's what let a long label like "Heart-Focused Breathing" or "Relax & Ground Your Body" render on one line without wrapping. Always keep it.

---

## Variant: Two-photo "cycle" slide (steps that repeat back and forth)

Used in `how-to-do-the-meditation.html` for the Intention/Feel steps that the user cycles between. Two `.mini-step` blocks side by side inside one `.step-inner--double`, connected by hand-drawn-style arcing arrows that are **measured and drawn by JavaScript from the real rendered image positions** — never hand-guess SVG coordinates for this, it took several iterations to get right and JS measurement is the only approach that reliably lands the arrowhead exactly on the image border without overlapping it.

```js
function drawCycleArrowsForTrack(track){
  const svg = track.querySelector('.cycle-arrows');
  const imgs = track.querySelectorAll('.step-imgwrap--mini');
  const img1 = imgs[0], img2 = imgs[1];
  const trackRect = track.getBoundingClientRect();
  const r1 = img1.getBoundingClientRect();
  const r2 = img2.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${trackRect.width} ${trackRect.height}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  // x/y computed relative to trackRect, with a small edgeGap (~6px) so the
  // arrowhead stops just outside the border, not on top of / inside it
}
document.querySelectorAll('.cycle-track').forEach(drawCycleArrowsForTrack);
window.addEventListener('resize', () => document.querySelectorAll('.cycle-track').forEach(drawCycleArrowsForTrack));
```

See full working version in `how-to-do-the-meditation.html` (search `drawCycleArrowsForTrack`) — copy it verbatim rather than re-deriving, including the `setTimeout(..., 300)` re-measure call for web-font settle time.

**Critical gotcha:** the SVG must have `z-index` **higher** than the image elements, or the arrowhead tip renders invisibly underneath the opaque image card. This cost several rounds of debugging — always set `.cycle-arrows{ z-index:2; }` above `.mini-step{ z-index:1; }`.

---

## Variant: Single static overview slide (row of N steps + arrows)

Used in `creation-model-overview.html` — no scrolling, all N steps visible in one row with simple connecting arrows (`→` character, hidden on smaller screens where it wraps to a grid).

```css
.model-row{ display:grid; grid-template-columns:repeat(6, 1fr); align-items:start; column-gap:8px; }
.model-step{ position:relative; }
.model-step:not(:first-child)::before{
  content:'\2192'; position:absolute; left:-12px; top:52px; color:rgba(255,255,255,.3); font-size:22px;
}
@media (max-width:1100px){
  .model-row{ grid-template-columns:repeat(3, 1fr); row-gap:36px; }
  .model-step:not(:first-child)::before{ display:none; }
}
```

Reuse this exact pattern (renamed classes are fine, e.g. `.formula-row`/`.formula-step` in `program-vs-alone.html`) whenever a training needs a compact "whole model at a glance" slide.

---

## Variant: "Worksheet" A4 paper pattern

Used throughout `create-your-outcome.html`. Represents a physical piece of paper the user is meant to write on, shown progressively filling in across slides.

```css
.worksheet{
  width:300px;
  background:var(--cream);
  border-radius:6px;
  padding:22px 16px;
  box-shadow:0 30px 70px rgba(0,0,0,.45);
  transform:rotate(-1deg);
  color:#000;
  font-family:'EB Garamond', serif;
  aspect-ratio:210/297;         /* true A4 portrait ratio */
  display:flex; flex-direction:column; justify-content:flex-start; /* content pins to top, not centered */
}
```

Key structure inside the worksheet:
- `.ws-intention-line` — small italic line at the very top ("Outcome: **Financial Abundance**")
- `.ws-diagram` — 3-column grid (`1fr auto 1fr`): left list column / center symbol circle / right list column
- `.ws-list` — numbered list using CSS counters, not `<ol>` markers, so number styling is controllable:
  ```css
  .ws-list{ list-style:none; counter-reset:ws-counter; }
  .ws-list li{ counter-increment:ws-counter; position:relative; padding-left:22px; }
  .ws-list li::before{ content:counter(ws-counter) "."; position:absolute; left:0; font-weight:700; }
  ```
- The center symbol: a capital letter inside **two concentric wavy (squiggly) rings**, not a dashed circle — a true sine-wave path, not `stroke-dasharray`. Generate it once with this approach and reuse the exact path coordinates already in the file (don't regenerate per training unless the size changes):
  ```python
  import math
  cx, cy, R, amp, freq, N = 100, 100, 58, 4, 22, 120
  pts = []
  for i in range(N):
      theta = 2*math.pi*i/N
      r = R + amp*math.sin(freq*theta)
      pts.append((cx + r*math.cos(theta), cy + r*math.sin(theta)))
  # then Catmull-Rom → cubic bezier through pts, closed loop
  ```
  Two rings at R=58 and R=50 (slightly different radius/amplitude) give the double-wavy-line look from the reference Joe Dispenza worksheet image. Copy the exact `<path d="...">` strings already in `create-your-outcome.html` rather than regenerating — they're proven to render correctly.

**All progressive builds (worksheet fills in more across slides) are done by literally duplicating the whole `.worksheet` block per slide with more content added** — not by JS/CSS reveal animation. Simpler, and matches how every other training in this folder works (nothing here uses reveal-on-scroll animation).

**Gotchas specific to this pattern:**
- Handwritten content = **black**, never colored — was explicitly corrected mid-build.
- The worksheet card must `justify-content:flex-start` (not `center`) or content floats in the vertical middle of the tall A4 card instead of pinning to the top like a real page.
- Numbered list columns: number goes on the **left** for both columns (not mirrored/right-aligned on the second column) — was explicitly corrected.

---

## Variant: Tick/Cross comparison page

Used in `program-vs-alone.html`. Two columns side by side, each with a label, an image, and a list of tick or cross points.

```css
.compare-row{ display:grid; grid-template-columns:1fr auto 1fr; align-items:start; gap:40px; }
.compare-mark{ width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#fff; }
.mark-cross{ background:var(--struggle); }  /* #B33F3F */
.mark-tick{ background:var(--create); }     /* #3E7A5D */
```

- Cross mark: `&#10005;` (✕) — Tick mark: `&#10003;` (✓)
- A center "V" (versus) badge sits between the two columns:
  ```css
  .versus{ width:64px; height:64px; border-radius:50%; background:rgba(255,255,255,.08); border:2px solid rgba(255,255,255,.25); color:var(--orange); font-size:26px; font-weight:800; display:flex; align-items:center; justify-content:center; }
  ```
- Give the label (`.compare-label`) a fixed `min-height` and use `align-items:start` (not `center`) on the row's grid — otherwise columns with different text lengths cause the images to sit at different heights instead of lining up. This was corrected explicitly during build.
- **Don't** try to force tick/cross rows into a shared grid so they align row-by-row unless specifically asked — it was tried, then explicitly reverted back to two independent flex-column lists per side. Independent lists is the default; only build the paired-row grid version if asked again.

---

## Variant: Benefits / hook slide ("If you join X you will...")

Added to `creation-model-training.html` as a lead-in slide, placed above the intro. Image on one side, a full-width centered headline above the whole block, and a benefits list of icon + short description rows (no titles, no long sentences) on the other — modelled directly on a real landing-page reference (Calm app's "What do you get?" section) rather than a generic checklist.

```css
.pros-slide{ max-width:900px; width:100%; margin:0 auto; }
.pros-label{
  font-size:clamp(16px,2.4vw,28px); font-weight:700; color:#fff;
  line-height:1.2; text-align:center; white-space:nowrap; margin:0 auto 40px;
}
.pros-slide .step-inner{ grid-template-columns:minmax(240px, 340px) 1fr; }
.pros-list{ display:flex; flex-direction:column; gap:22px; max-width:56ch; }
.pros-point{ display:flex; align-items:flex-start; gap:16px; }
.pros-desc{ font-size:16.5px; line-height:1.5; color:#EBD9E2; }
.pros-mark{
  flex:0 0 39px; width:39px; height:39px; border-radius:50%;
  background:var(--create); display:flex; align-items:center; justify-content:center;
  font-size:16px; font-weight:700; color:#fff;
}
```

```html
<div class="pros-slide">
  <div class="pros-label">If You Join The Heart Creator Community You Will</div>
  <div class="step-inner">
    <div class="step-imgwrap">...</div>
    <div class="step-text">
      <div class="pros-list">
        <div class="pros-point">
          <span class="pros-mark">&#10003;</span>
          <div class="pros-desc">Know exactly how to create what you want.</div>
        </div>
        <!-- one .pros-point per benefit -->
      </div>
    </div>
  </div>
</div>
```

**How this design was reached (read before rebuilding one from scratch):**
- The headline (`.pros-label`) goes **above the entire image+list block, centered, full width** — not nested inside the text column next to the list. It was built inside the text column first and had to be moved out.
- The headline is a hook-in sentence, not a short label — force it onto **one line** with `white-space:nowrap` and a conservative `clamp()` max size (don't guess a big display-title size and assume it'll fit; it won't, and centering + `text-wrap:balance` were both tried and rejected in favour of a plain single line).
- Each benefit is **icon + one short description line only** — an earlier version added a bold title above each description ("Clarity", "Visualization", etc.); Olly explicitly asked for the titles to be removed, keeping just the tick + sentence. Don't add a title layer to a benefits list unless asked.
- **When asked to resize this slide ("make it bigger", "too big", "keep the ratio"), scale every related dimension together in one pass** — the outer `.pros-slide` max-width, the image column's `minmax()`, the description font-size, and the tick-circle size all moved in the same proportion at the same time. Adjusting only one of these (e.g. just the image) throws off the balance and produces another round of correction.

---

## Variant: Fixed-size Screenshot Canvas (video-thumbnail slide)

Used in `before-vs-after.html`. Unlike every other training in this folder, this isn't a scrolling multi-slide page — it's a **single fixed-size box** (e.g. 1400×790px, matching a specific external crop like a Skool video thumbnail) meant to be screenshotted, not scrolled through in a browser.

```css
.canvas{
  width:1400px;
  height:790px;
  position:relative;
  overflow:hidden;   /* clips anything that runs past the edge instead of silently reflowing the page */
  border-radius:12px;
}
```
No `.steps`/`.dots`/`.progress-label` scroll-snap machinery — those are irrelevant for a single static export and were removed entirely rather than left inert.

**Screenshot instructions belong in a CSS comment at the top of the file**, not just told to Olly in chat — e.g. "capture the `.canvas` node at exactly 1400×790, not the grey page background around it." Future edits (or a future session) need this context without re-deriving it.

**Safe zones for an embedded video player overlay**: if the exported image becomes a video thumbnail, the player chrome (a centred play button, a corner "⋯" menu) will sit on top of it and must not obscure key text/content.
- The play button sits at the **true centre** of the canvas — on mobile it renders noticeably bigger than on desktop, so build more clearance than looks necessary when only checking a desktop preview.
- The "⋯" menu sits in the **top-right corner** — keep headline text away from that corner specifically, not just "near the top."
- **Only shift the specific element that collides, not its whole parent group.** An early attempt shifted an entire title+image+text column outward to clear the centre play button — which also dragged the title further into the top-right ellipsis corner. The fix was decoupling: wrap just the colliding sub-block and shift only that, leaving titles/headers in their original safe position.

**For pixel-critical alignment ("centre this exactly between the divider and the left edge"), don't trust nested flex/grid centering — compute and use absolute px coordinates instead.** This session hit a real bug where a single-row CSS Grid auto-sized its row to content height instead of stretching to fill its flex parent (`align-items:stretch` has nothing to stretch into without `grid-template-rows:1fr` on the container), and even after fixing that, nested flex-within-flex-within-grid centering kept landing a few pixels off from what the arithmetic said it should be. After repeated "no, it's still not centred" feedback, the reliable fix was abandoning nested layout centering for the co-ordinate-critical elements and positioning them with `position:absolute; left:<computed-midpoint>px; transform:translateX(-50%)` directly against the canvas, with the midpoint arithmetic spelled out in a comment (e.g. `(0 + 700) / 2 = 350`). When a request names two exact reference points ("the middle of the dividing line and the left border"), take it completely literally and compute from those two points — a 20px gap was the actual, valid complaint, not user pickiness.

**Two labels of different lengths that must "look the same size"**: scale font-size proportionally to character count (e.g. an 8-letter word at the same font-size as a 10-letter word will render ~20% narrower — shrink the shorter side's font-size by that ratio to equalise visual width), then **align them on a shared vertical centre-line, not a shared top**. Different font-sizes with `line-height:1` don't top-align their glyphs at the same pixel even with an identical `top` value — use `top:<shared-y>px; transform:translate(-50%,-50%)` on both so they share a true centreline regardless of size difference.

**Preview workflow when the canvas uses local sibling images**: Claude's Artifact preview can't reach a local `C:\...` file path, so a straight `Artifact` publish of the real training file shows broken image placeholders even though the file is correctly wired. Fix: build a **throwaway copy** in the scratchpad directory with the images inlined as base64 `data:` URIs (`base64 -w 0 image.png`, `sed` the `src=` paths), publish *that* for preview purposes, and re-generate/republish it after every edit. **Never change the real training file's own `<img src>` away from the standard relative-path convention** — that file is what Olly actually opens locally, and inlining it would break the "Olly drops images in himself" workflow this whole skill is built around.

## Process Checklist for a New Training

1. Confirm the **content** first (steps, wording, images available) — don't start building blind. If images aren't ready yet, use the placeholder pattern and tell Olly the expected filenames/folder.
2. Pick the **format**: one-step-per-screen scroll (default for "walk through N things"), single static slide (for an "at a glance" summary or About Page section), worksheet A4 pages (for anything representing a physical page to write on), or tick/cross comparison (for "this vs that").
3. Copy the relevant CSS/JS blocks from this file or directly from the nearest existing `.html` file — don't hand-roll new scroll-snap or arrow-drawing logic from scratch.
4. Create the sibling images folder (`<name> images/`) even before photos exist, and wire up `<img src>` to the expected final filenames with the placeholder fallback.
5. Build all slides, then do a pass for wording/casing consistency (see Gotchas — mixed casing and inconsistent phrasing between slides has come up repeatedly and should be checked proactively, not just when flagged).
6. Tell Olly the exact file path so he can open/refresh it, and the exact image folder + expected filenames so he knows what to drop in.
7. **If the content being edited is shared across multiple files, propagate the change to all of them, not just the one Olly is looking at.** The Creation Formula's step titles/body copy live in three places — `creation-model-training.html` (detailed per-step slides), `creation-model-overview.html` (one-row summary), and `program-vs-alone.html` (embeds the same 6 step slides) — plus the training's own name ("The Model for Creation" → "The Creation Formula", 2026-07-24). When wording or naming changes in one, check the other two before calling the edit done, rather than waiting to be asked separately for each file.
8. **A summary/overview slide's captions must match the detailed training page's body text verbatim, not a shorter paraphrase.** Corrected 2026-07-24: `creation-model-overview.html`'s captions had drifted into their own shorter wording; Olly asked for them to "better match the points from" the training page, and the fix was copying the exact body-copy sentences across rather than re-summarizing them.
9. **When Olly renames a training ("this file is now called X"), do all three of these, not just the visible text:** (a) rename the actual `.html` file, (b) update the `<title>` tag and any `<h1>`/intro heading text, (c) grep the whole `training/` folder for the old filename and update every cross-reference (this skill file has needed it three times so far — `choose-your-intention.html` → `choose-your-creation.html`, `meditation-steps.html` → `how-to-do-the-meditation.html`, `self-regulation.html` → `how-to-maintain-the-belief.html`). Renaming only the title and leaving the filename stale breaks the file link you give Olly.
10. **Before acting on any "move/delete/swap step N" instruction, re-grep the current `step-number` values first — never rely on numbering from earlier in the conversation.** Steps get inserted, deleted, and swapped constantly in a single editing session, so "step 3" can refer to a different section than it did two edits ago. Pattern that worked reliably throughout this session: `grep -n 'data-title\|step-number">' file.html` immediately before every renumber/reorder/delete request, then edit off what's actually in the file, then renumber everything after the change point and fix the `progress-label` count.
11. **Before enlarging any font size, compute the height/width budget by hand first — don't enlarge and wait to be told it overflowed.** This was the single most repeated correction across the `before-vs-after.html` build (six-plus rounds of "too small" → enlarge → "now it's overflowing" → shrink). The reliable pattern: total up (label height + margins) + (image height + margins) + (line-height × line-count for the text) + (any trailing element), compare against the actual available canvas/section height, and only then pick a font-size — leave a visible buffer (~15–20% spare), not an exact fit.
12. **When a request is for mobile/thumbnail legibility, default to fewer and bigger, not more and smaller.** This session moved from a 6-bullet list per side → 2 bullets → 1 combined sentence → a single word, and each cut made the page more legible, not less informative in the ways that mattered for a video thumbnail. If Olly says text is "too small to read on mobile," the fix is usually to cut content, not just shrink-to-fit the existing content.
13. **A JS "auto-fit" script that measures text and computes a font-size at runtime feels safer than it is — prefer a fixed, hand-computed size with the arithmetic left in a comment.** An auto-fit pass (canvas `measureText`) was built and used successfully once, then abandoned a few edits later in favour of plain fixed px values, because every subsequent wording change silently changed the computed size in ways that were hard to predict or debug. Fixed sizes with a documented budget are easier to reason about and re-verify by hand.
14. **For "make X the same visual size as Y" between two different-length labels, scale font-size by character-count ratio, then align on a shared centre-line (`transform:translate(-50%,-50%)`), not a shared `top`.** See the new Fixed-size Screenshot Canvas variant above for the full worked example.

---

## Gotchas Log (read before repeating any of these)

- **Arrow/SVG z-index**: any arrow or connector SVG drawn over photos must have a higher `z-index` than the photo card, or its tip renders invisibly underneath. Always check this first if an arrowhead "disappears."
- **Don't hand-guess curve/arrow coordinates** — measure real element positions with `getBoundingClientRect()` in JS instead. Every hand-guessed attempt needed multiple rounds of correction; the JS-measured version worked first time.
- **Worksheet content is black**, not brand colors — colored handwriting looked wrong once actually rendered.
- **`justify-content:flex-start` on tall aspect-ratio cards** — anything using `aspect-ratio` to force a fixed shape (like the A4 worksheet) will vertically center its content by default if you leave `justify-content:center`; pin to `flex-start` for anything meant to read top-down like a page.
- **Casing/phrasing consistency across slides** — check title casing (sentence case vs Title Case) and phrasing patterns (e.g. "At the Gym" vs "Gym") are consistent across all slides in one training before considering it done, don't wait to be asked.
- **`onerror` placeholder swap is mandatory** on every `<img>` in these pages — never ship an `<img>` tag without it, since images are routinely added after the page is built.
- **Read the actual image file before trusting its content** — a photo Olly said was "the right one" for a slide still had an unrelated watermark badge baked in from a previous asset; always `Read` the PNG directly if there's any doubt.
- **Ragged/unbalanced line wraps in body copy** — a two-line sentence that breaks into one long line + one short trailing line reads as visually unbalanced. Fix with `text-wrap:balance` on `.step-body` (now the default in the Standard image+text step layout above) rather than manually inserting `<br>` tags or fiddling with `max-width`.
- **Shared content lives in more than one file** — the Creation Formula's wording exists in `creation-model-training.html`, `creation-model-overview.html`, and embedded again in `program-vs-alone.html`. A rename or wording correction made in one place is not "done" until checked against the other two — see Process Checklist step 7.
- **Images arrive with arbitrary filenames, not the `Step N.png` convention** — Olly has dropped in files named things like `New Step.png`, `Top Slide Image.png`, and `Meditation Steps Images (8).png`. Don't rename his files to fit the convention; just point the `<img src>` at whatever the actual filename is. Always confirm the exact name (`ls`/`Read` the folder) rather than assuming it matches the pattern used elsewhere in the same page.
- **Renumbering after an insert/delete/reorder has three parts, not one** — (1) the individual `step-number` div values for every section after the change point, (2) the total slide count text in `progress-label` (e.g. `Step 1 / 7`), (3) any `step-word`/label that referenced a since-removed sibling slide (e.g. "Intention 1" needed to revert to plain "Intention" once "Intention 2" was deleted). Missing any one of the three leaves the page in a half-updated state that looks fine until Olly scrolls further.
- **A single-row CSS Grid does not stretch to fill its container by default** — `align-items:stretch` (the default) has nothing to stretch *into* unless the grid's row track is sized to fill the space, e.g. `grid-template-rows:1fr`. Without it, the row silently auto-sizes to content height, and anything relying on the row being "full height" (vertical centering, `flex:1` children) quietly does nothing. Check this first if vertical centering "isn't working" inside a grid.
- **Shifting a whole title+content group to dodge one hazard zone can create a collision in a different zone** — moving an entire column outward to clear the centre play button also pushed its title further into the top-right corner menu. Only shift the specific colliding sub-element, never the whole parent.
- **Mobile embed overlays (play button, "⋯" menu) render bigger than their desktop preview equivalents** — build extra safe-zone clearance beyond what looks necessary when only checking on a desktop browser; confirm on an actual mobile screenshot before calling clearance "done."
- **Pure/neon primary colors (`#FF0000`, `#00FF00`) read as alarm/highlighter colors, not "vivid brand color"** — when asked for a color that "pops," land on a softened-but-saturated version (e.g. `#F03A47`, `#2ECC71`) as the default, and only push toward the pure primary if explicitly asked for "the reddest/most alarm-style red there is."
- **Artifact previews can't load local `C:\...` image paths** — a training page with local sibling images will show broken placeholders when published as-is for preview. Build a throwaway base64-inlined copy in the scratchpad folder for previewing, and never inline images into the real training file itself (breaks the "Olly drops images in later" workflow).

---

## Changelog

**2026-08-06 — identity-shift.html scaled back to a single identity line ("for now")**
- Olly's own words: "for now, I want to go with just getting them to add the line at the identity level that best links to their outcome." Confirmed via clarifying question that this meant dropping Characteristics entirely and the Visualize/Act As If/Reinforce steps too, not just trimming the worksheet content — the whole training is now 4 slides: intro, one instruction slide (write "I am someone who…" on the back of the worksheet, tied back to the front-page outcome), and 2 worked examples showing just that one line.
- Removed from the HTML: `.ws-characteristics-heading`, `.ws-word-tags`, `.download-card`/`.download-icon`/`.download-text`, and `.example-tags` CSS (all now-dead, no longer referenced in markup) — don't re-add speculatively; re-add only if Olly asks to bring Characteristics back.
- `.worksheet--back` changed from `justify-content:flex-start` to `center`, and `.ws-identity-statement` lost its dashed bottom-border (that border existed to separate it from the Characteristics section below, which no longer exists) and got a bigger font-size (12.5px → 15px) since it's now the only thing on the card.
- **This is explicitly a "for now" scope cut, not a rejection of the fuller model** — the Fred Dodson research (his 4-stage Identity Shift Method: Define → Visualize → Act As If → Reinforce) and the fuller build are preserved in the changelog entries directly below this one, and `pdfs/characteristics-ideas-list-source.md` is left in place unused. If Olly asks to "add the rest back" or "bring back Characteristics," that's what he means — restore from the entries below rather than rebuilding from scratch.

**2026-08-06 — New training: identity-shift.html**
- Existing Trainings table: added `identity-shift.html`.
- New optional/extra-step training, additional to the core Classroom path (Create Your Outcome → How To Do The Meditation → How To Maintain The Belief) — recommended for people finding a lot of internal resistance to their new reality. Built from the "benefits/hook slide" pattern (intro explaining who this is for) plus a new worksheet variant: `.worksheet--back` represents the **physical back of the same Create Your Outcome page** (Olly's explicit direction — "add it to the back of the worksheet," not a new page), so it's a full separate `.worksheet` card with no intention/emotion diagram at all, just a small "(Creation) — back of page" label, a centered "Characteristics" heading, and a word-tag list filling the card. Don't reuse the earlier footer-strip approach (`.ws-characteristics` as a bottom addition to the existing front-of-page card) — that was tried first and explicitly replaced.
- **Characteristics = single words/short labels, not sentences.** Corrected 2026-08-06 after the first build used full descriptive sentences per item (e.g. "Makes decisions from confidence, not fear") — Olly's actual model is short identity-trait words/labels (Confident, Wealthy, Entrepreneur, Good With People). These break into three flavors that all count: **trait adjectives** (Confident, Calm, Magnetic), **skill/capability labels** (Good With People, Great With Money), and **identity/role or state labels** (Entrepreneur, Wealthy, Financially Free) — don't over-narrow "characteristics" to personality traits only. Implemented with a new `.ws-word-tags` pill-tag layout (reusing the `.example-tags` pill pattern already used elsewhere for hint chips) instead of the numbered `.ws-list` sentence format. 2 worked examples included (Financial Abundance, New Relationship), both using this word/label style.
- **Restructured around one Identity Statement, not just a characteristics list.** Olly flagged that a flat list of trait words without an anchor felt confusing — likely to confuse clients too. Researched Fred Dodson's Identity Shift Method (WebSearch, not prior knowledge — see sources cited in-conversation) for a second opinion: Dodson's actual model is a single identity sentence ("I am a runner," not a long adjective list) reinforced by Act As If behavior, not a big characteristics worksheet. Landed on a middle ground: worksheet back-of-page now leads with one **Identity Statement** sentence ("I am someone who…", new `.ws-identity-statement` element, dashed-border-bottom above the Characteristics heading) with the word-tag Characteristics list underneath it as supporting evidence for that sentence, not the main event.
- **Embodiment sequence reordered: visualize before you act, not the other way round.** Explicit correction from Olly — the original single "Embody It Daily" slide only covered meditation. Split into two slides in this order: (2) **Visualize** — feel the identity during the daily meditation, before trying to change any daytime behavior; (3) **Act As If** — carry it into small daytime moments/decisions only after the meditation step. Don't collapse these back into one slide or reverse the order — the sequencing itself was the correction, not just the content.
- **Full rebuild to explicitly follow Fred Dodson's 4-stage Identity Shift Method, numbered 1–4.** Olly asked for "the full step by step approach following Fred Dodson's approach... taking into account what they have now in terms of their creation." Final structure: **Step 1 Define** (identity statement + characteristics, now explicitly framed as continuing from the front-of-page Create Your Outcome worksheet — added an eyebrow badge "Continuing From Create Your Outcome" and a step-body line referencing the front page directly, so the training doesn't read as a disconnected new exercise), **Step 2 Visualize**, **Step 3 Act As If**, **Step 4 Reinforce** (new slide — the 4th Dodson pillar was missing before this pass; explains that repeated aligned action is what closes the resistance gap, and frames the whole thing as a repeating loop, not a one-off exercise). 7 slides total now (intro + 4 numbered steps + 2 examples).
- New companion asset: `pdfs/characteristics-ideas-list-source.md` — categorized prompt list (Mindset & Self-Talk, How They Carry Themselves, How They Speak, How They Treat Others, Daily Habits, Emotional Patterns, Identity Statements fill-in-the-blank) for Olly to design into a downloadable PDF referenced by the training's download-callout card. Follows the same "source content written by Claude, final design/export done by Olly" pattern as other PDF assets in this folder.
- No existing files' content changed — this was a net-new training, not a rename/rework.

**2026-08-06 — choose-your-creation.html renamed to create-your-outcome.html**
- Pure rename per rule 9: file renamed, `<title>` tag and intro `h1`/eyebrow slide updated to "Create Your Outcome". Per-step wording (Choose → Symbolize → Conditions → Feel, worked examples) deliberately left unchanged — Olly confirmed rename-only, no content rework.
- Cross-references fixed: this skill file's Existing Trainings table, the two prose mentions in the Worksheet variant section, and the copied-CSS comment in `how-to-do-the-meditation.html`. Historical changelog entries below that still say `choose-your-creation.html` were left as-is (they're a point-in-time record, same convention as prior renames).

**2026-08-01 — Post-session feedback review (before-vs-after.html build)**
- Existing Trainings table: added `before-vs-after.html`.
- New Variant added: **Fixed-size Screenshot Canvas (video-thumbnail slide)** — the first training page in this folder built as a single static export rather than a scrolling multi-slide page. Documents: fixed-px canvas with `overflow:hidden` instead of the scroll-snap machinery; screenshot instructions living in a CSS comment; safe zones for an embedded video player's play button (centre) and "⋯" menu (top-right corner), including the specific bug where shifting a whole title+content group to dodge the centre collision caused a new corner collision; the decision to abandon nested flex/grid centering for pixel-critical alignment requests in favour of absolute `position:absolute` + computed midpoint coordinates, after repeated "no, still not centred" corrections; the character-count-ratio + shared-centreline technique for making two different-length labels "look the same size"; and the base64-inlined-preview-copy workflow for local sibling images that Artifact can't reach.
- Process Checklist: added rules 11–14 — compute the font-size height/width budget by hand before enlarging (this was corrected 6+ times in one session before the rule was written down); default to fewer/bigger content over more/smaller when the goal is mobile legibility (list went from 6 bullets/side to a single word/side over the course of the build); prefer fixed hand-computed sizes over a JS auto-fit script once one was tried and found unpredictable across edits; the character-count-ratio + centreline technique cross-referenced from the new variant.
- Gotchas Log: added five entries — the single-row CSS Grid `align-items:stretch`-has-nothing-to-stretch-into bug; shifting a whole group to dodge one hazard zone creating a new collision elsewhere; mobile embed overlays rendering bigger than their desktop preview equivalent; pure/neon primary colors reading as alarm colors rather than "vivid brand color" (landed on `#F03A47`/`#2ECC71` as the tasteful-but-vivid default, reserving pure `#FF0000`/`#00FF00` for an explicit "give me the most alarm-style version" ask); and the Artifact-can't-reach-local-image-paths preview limitation.
- No rules removed — this session's corrections were all additions to patterns not previously covered (the fixed-canvas/screenshot format, mobile-overlay safe zones, and absolute-positioning-for-precision-alignment didn't exist in this file before), not overrides of prior scrolling-slide guidance.

**2026-07-26 — Post-session feedback review**
- Existing Trainings table: added `energetic-centres-explained.html` (built this session, standard image+text layout, no new variant needed).
- Existing Trainings table: three filenames corrected to their renamed versions — `meditation-steps.html` → `how-to-do-the-meditation.html`, `choose-your-intention.html` → `choose-your-creation.html`, `self-regulation.html` → `how-to-maintain-the-belief.html`. These were stale after Olly renamed the files and their on-page titles mid-session; this update also fixed the cross-references inside this skill file's own prose (previously still pointing at the old names in several places).
- Process Checklist: added rule 9 (renaming a training = rename the file + update title/heading + grep this skill file for stale cross-references, all three, not just the visible text) and rule 10 (re-grep current `step-number` values before acting on any "move/delete/swap step N" instruction — numbering shifted multiple times per training this session and edits were only reliable when grepped fresh each time rather than trusted from memory).
- New Variant added: **Benefits/hook slide** ("If you join X you will..."), built for `creation-model-training.html`. Documented the final proven CSS plus the three corrections it took to get there (headline must sit above the whole block, not in the text column; force it to one line rather than assuming a big display size fits; benefits are icon+description only, no title layer — a title layer was added then explicitly removed). Also captured the "scale every dimension together" resizing rule from this build.
- Gotchas Log: added two entries — images arriving with arbitrary filenames (`New Step.png`, `Top Slide Image.png`) rather than the `Step N.png` convention, and the three-part renumbering checklist (step-number values, progress-label count, and any label text that referenced a since-deleted sibling slide like "Intention 1"/"Intention 2").
- No rules removed — all additions/corrections this round, no prior guidance was overridden.

**2026-07-24 — Post-session feedback review**
- Training rename: "The Model for Creation" → "The Creation Formula" across `creation-model-training.html` and `creation-model-overview.html`. Existing Trainings table updated to match, with a note that the same step content is also embedded in `program-vs-alone.html`.
- Process Checklist: added rule 7 (propagate shared-content changes to every file that embeds that content, not just the one being looked at) and rule 8 (overview/summary captions must match the detailed page's body text verbatim, not a paraphrase) — both written after Olly had to separately ask for the overview page's captions to be brought back in line with the training page's wording, which should have been done proactively as part of the same edit.
- Standard image+text step layout CSS: added `text-wrap:balance` to `.step-body` by default, after a ragged one-long-line/one-short-line wrap was flagged as poorly aligned on `choose-your-creation.html`. Added to the Gotchas Log as the default fix for this instead of manual `<br>`/`max-width` tweaks.
- No rules removed — these are additions/sharpenings of the existing Process Checklist and Gotchas Log, not overrides of prior guidance.
