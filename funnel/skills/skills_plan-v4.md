# Plan of action v4: the personal diagnosis plan (applicants)

Built 2026-11-12 with Olly on the first applicant. **This is the plan every applicant now gets** (replaces the template pages of Plan v3.1 in `skills_applicant-looms.md`; the flow around it, Flow v3, is unchanged: message → voice note → they say yes → plan → video → join).

**Builder:** `tools/build_plan_v4.py SPEC.json OUTDIR [--upload]` (+ `tools/plan_v4_shoot.js`, `tools/export_carousel.js`).
**Private data:** the spec and the output hold the applicant's words. Keep them in `funnel/applicant-guides/<first-last>/` (git-ignored, survives between sessions: spec.json there, build output in `out/`). Never anywhere committed: the repo is public.

---

## What they get (20 pages)

| # | Page | Source |
|---|---|---|
| 1 | Cover: "**Name, Here's Your Plan Of Action To Meet Your Person**", Where you are now → Where we're going | photo template |
| 2 | **This Is What You Told Me** (5 rows, their words) | stick figure |
| 3 | **The Belief That's Holding You Back** (diagnosis: thought + feeling + repetition = belief) | stick figure |
| 4 | **How It Shows Up For You** (date scene, 2 bubbles, 4 rows "What's Happening") | stick figure |
| 5 | **The Belief You'll Build In The Program** (thought + their feeling + every day 10 min = new belief) | stick figure |
| 6 | **What It Looks Like For You** (date scene, 3 bubbles, 4 rows "What Changes") | stick figure |
| 7 | **Then Things Start To Unfold Naturally** (2 of the 3 pills personalised) | stick figure |
| 8 | **How You'll Build <Feeling>** (Emotional Resonance: their thought, feeling, belief) | stick figure |
| 9 | These Are The Exact Steps We're Going To Follow **To Help You Build <Feeling>** | photo template |
| 10-17 | Steps 1-8, same photos, text personalised. Step 6 phone shows a personalised text from their person | photo template |
| 18 | **What I Need From You** (before we agree to anything): biggest priority in your life · 10 minutes a day · reach out for help | new |
| 19 | Personal note (Claude drafts, Olly rewrites) | photo template |
| 20 | Closing | photo template |

**Cut on purpose (Olly):** "You've Tried Everything" / The Truth, "Your Friends Didn't Need Any Of This", "It's Not What You Know", the loop and "belief shapes" pages. Applicants already get that; the plan is about *them*.

---

## Writing the spec (Claude does this from their GHL answers)

Pull the contact (GHL `contacts_get-contacts` by name): HA fields (status, how long, relationship wanted, tried, not happening, feelings about love, meet right person once, priority, profession) + FF fields (FF Current Emotion, FF Resonance = the feeling they want, FF Intentions = what they want in a partner). Map field ids with `locations_get-custom-fields`.

Copy the last applicant's `funnel/applicant-guides/<first-last>/spec.json` and rewrite every value. Rules:

1. **Only their words.** Every line traces to an answer. Nothing invented (`feedback_messaging_source_order`). If an answer is missing, leave that idea out.
2. **Diagnosis is direct, not hedged** (Olly: "you're just being honest"): intro starts "Based on your answers, my understanding is that there's a belief running underneath…". Title is always "The Belief That's Holding You Back".
   - thought = what they'd think in the moment (from "not happening"), feeling = FF Current Emotion + the feeling words in "feelings about love", repetition = their pattern, belief = closest to their own words (e.g. "doubts of whether I can be loved" → "I'm not sure I can be loved as I am").
3. **The new belief** comes from what they want ("loves me because of me" → "I'm loved for who I am"); the thought adds their "once I…" answer ("I'm with my person and I can be myself").
4. **The feeling** = FF Resonance (e.g. Belonging). It's the word used on pages 5, 8, 9 and the steps.
5. **Every training step (2-5) names BOTH**: the feeling they're building AND keeping THEIR negative emotion at bay (anxiety and doubt / loneliness / frustration…), not generic "intellectualizing" (Olly 2026-11-12).
6. **Steps 6-7 fit where they are**: dating already → "keep dating as yourself"; not dating → small steps within your comfort zone. Step 7 names their sticking point (e.g. "the 2 to 3 month point"). Give step 7 a title if the default doesn't fit.
7. **Never promise an outcome** ("things have room to keep growing", not "you'll get past 3 months"). v6 rules: "the right people start showing up", never frequency/manifesting.
8. **The text message (Step 6 phone)**: what their person would actually send, about real plans, showing what they want *without saying it*. Ordinary, short, never a line or a therapy word. Commitment example Olly approved: "Hey, my sister just asked if you're coming to her birthday next month. I told her yes, hope that's ok! Still on for dinner Saturday?" (rejected: "I feel like I can just be myself with you", too on the nose). No emoji (the font can't draw them). Images: `gender` female = male partner photos, male = female.
9. **commit_priority_line** ties to their priority answer ("You told me it's your main focus, so I know it is."). If they said "it matters, but other things come first", write it honestly ("You told me other things come first right now, so this is the one thing to be sure about.").
10. **Note**: draft in Olly's voice from their answers, 3 short paragraphs (`\n` = new paragraph); Olly rewrites it.
11. Copy rules: no comma before and/or, "program", "practice", no dashes as separators, plain English. `<b>` allowed in step text. Straight quotes in the spec become curly on the stick pages.

## Run it

```
python tools/build_plan_v4.py funnel/applicant-guides/<first-last>/spec.json funnel/applicant-guides/<first-last>/out
```
→ `out/preview.html`. Publish it as a private artifact for Olly (it embeds their words, so it stays private). Check every page image yourself first (overflow warnings in the output are usually false alarms on the head; look anyway).

When Olly approves:
```
python tools/build_plan_v4.py <spec> <out> --upload
```
→ stores the 20 pages in the Hub (KV `planimg:<contactId>:NN`, `planimgs:<contactId>` = 20) and prints `https://hub.ollyhenson.com/p/<code>` (reuses their existing code if they have one). Their Hub card's 📄 Plan of action shows these pages and the usual Send on WhatsApp / Copy link buttons (those mark "Plan sent"). Opens, pages reached and time per page track exactly like v3.

A change after upload = edit the spec, rerun with `--upload` (same link). The template boxes in the Hub editor do NOT change a v4 plan.

---

## Next (agreed, not built yet)

- **Plan requests** (people from the DM form, `skills_dm-plan-setting.md`): a shorter personal plan that sells the plan, not the program. Then: "would you like to see how the program does this?" → if yes, a second plan = the program (steps + commitment) → any questions → their video. One extra step before the pitch.
- Hub button to build v4 from the card (today Claude builds it from the spec).

---

## Never (from Olly's corrections, 2026-11-12)
- Never hedge the diagnosis ("might be", "if this belief is running"). Say "Based on your answers, my understanding is…". Why: Olly: "You're just being honest."
- Never say "the belief we'll build for you". It's "The Belief You'll Build In The Program" and "the feeling you'll build". Why: they do the work inside the program; the plan sells the program.
- Never keep generic argument pages an applicant already accepts (tried everything / The Truth, friends, not what you know). Why: "she probably already understands that. It needs to be more tailored to her."
- Never write a phone text that names the coaching outcome ("I can just be myself with you", "you make me feel I belong"). Why: Olly: "I don't think that's what she'd want… it needs to be subtle. Not robotic." Show it through ordinary plans instead.
- Never leave a step on generic wording ("keep the intellectualizing at bay"). Name their own emotion.
- Never send Olly to the old template editor for a v4 person: the card now shows the image pages (he hard-refreshed, saw the old template and thought the plan hadn't changed).

## Examples (approved for the first applicant)
- Diagnosis: thought "Will this one last?" + feeling "Anxiety and doubt" + repetition "Each time it ends around 2 to 3 months" = belief "I'm not sure I can be loved as I am".
- New belief: thought "I'm with my person and I can be myself" + feeling Belonging + every day for 10 minutes = "I'm loved for who I am".
- Step 5: "In this final training you'll learn how to anchor belonging at any point in your day. This keeps the anxiety and doubt at bay, so when they show up, on a date or a few months in, you can come back to feeling like yourself."
- Phone text (commitment, shown not said): "Hey, my sister just asked if you're coming to her birthday next month. I told her yes, hope that's ok! Still on for dinner Saturday?"
- Cover: "Name, Here's Your Plan Of Action To Meet Your Person" (Olly's exact wording).

<!-- 2026-11-12 skill review: added Never list + approved examples from the first applicant's build (direct diagnosis,
"you'll build in the program", cut generic pages, subtle phone text, personalised steps, cover wording, Hub editor
shows image pages). Removed the first applicant's name from the spec path (public repo). -->
