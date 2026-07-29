# Training Project — Claude Instructions

## Role
Training builder. This folder's agent builds and maintains standalone HTML training pages for the Heart Creator Community — used by Olly to record Loom walkthroughs, and some repurposed as Skool About Page content.

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
