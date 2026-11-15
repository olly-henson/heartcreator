# Plan of action: applicants (v5 = short plan first, full plan as follow-up)

> **CURRENT FORMAT (Olly, 2026-11-15). Read this section first. The v4 builder notes further down are kept for reference and for DM plan requests (part 1 / part 2), not for applicants.**

## The flow
1. Applicant applies (tag `heart attractor applicant`), Olly rates them good.
2. **Claude builds their short plan (5 pages) AND full plan (16 pages) BEFORE Olly messages them.**
3. Olly sends the first message from Hub > Sales card **1a** (WhatsApp tap marks Messaged + Plan sent):
   "Hey <Name>, so I’ve looked through your application and all looks good.\n\nHere’s exactly what you need to do to attract this relationship that you want:\n\n<short plan link>\n\nLet me know if you’d like the next steps"
   The email (1c) is unchanged. The old 1b voice note ("would you like a plan?") is gone.
4. If they want more detail, or as a follow-up: Sales card **section 2** sends the full plan link.
5. "Next steps" = the sales video (funnel/sales-video-women-transcript.md is what it says).

## What each version holds
**Short (5 pages, send first):** cover ("<Name>, Here's Your Path To The Relationship You Want", Olly's photo, Where you are now → Where we're going) · You're Stuck In Your Head (overthinking, catastrophizing, feeling you have to fix yourself, "Believing comes from feeling", <their emotion> → <their feeling>) · Feel <Feeling> Before He Arrives (photo = the text from their person, partner-text.jpg; "From overthinking it to feeling it.") · How We'll Do It Together (5 steps with timings + daily DM support "me, not AI") · What I Need From You (3 conditions) + "If you'd like me to send over the details for the program, let me know." + Olly sign-off.
**Full (16 pages, follow-up):** cover · The Man You Want (their 4 intentions) · Where You Are Right Now (their words, their sticking point, what they tried) · You're Stuck In Your Head · Emotional Resonance · The Shift · Your 3 Steps (1-2 Done, 3 Together) · The Exact Steps We'll Follow Together · Steps 1-5 with photos (access + trainings / meditation / anchoring / meeting people or keep dating / support) · When You Feel <Feeling> · What I Need From You · Here's What We're Going To Do + the same closing line.

## Process (about 10 minutes per applicant)
1. Pull them from GHL (`contacts_get-contacts` by name). Fields: FF Current Emotion (Trbe…), FF Resonance = the feeling (RArd…), FF Intentions = their 4 wants in a partner (2V06…), feelings about love (RcZw…), relationship wanted (az4f…), what's not happening (Ysl9…), tried (bCuu…), status (BlwA…), how long (X9Lz…), priority (OtktG…).
2. **Check for an existing plan first**: `wrangler kv key list --prefix planview:<contactId>`. If it has `sent` or opens, the new plans go on `<id>-short` and `<id>-full` (never overwrite a plan they've read). The Sales card prefers `<id>-short` for 1a.
3. Copy `pages.html, short.html, og.html, upload.py, make_text.py` from the most recent applicant with the same feeling (or the closest), into `funnel/applicant-guides/<first-last>/pages/` (git-ignored, never committed).
4. Write `personalise.py` (copy the last one): a list of exact old → new replacements with `assert` on every one, so a missed line stops the build. Every new line traces to their answers.
5. Run it, then grep for the previous person's words (name, feeling, emotion, partner traits, contact id). Must be 0 everywhere.
6. `python make_text.py` (their phone text), then render: `node tools/plan_v5_shoot.js <folder>` (full), `... short.html short-out`, `... og.html og-out .og` and save og-out/01.jpg as og.jpg.
7. Look at a contact sheet of the short pages + the personal full pages (2, 3, 4, 12, 14). Gap 0 on a cover usually means the footer was pushed off: trim their longest answer on the cover.
8. Preview artifact (short first, then full) for Olly. Upload: `python upload.py short-out 5 [-short]` and `python upload.py out 16 -full`. Check both: `curl /p/<code>/pages` (n = 5 / 16) and `/p/<code>/og.jpg` 200.
9. If their card already had `waSent` from the OLD first message, set `state.looms[id].planSent = false` in the record (rev+1), or the new rule marks them Plan sent before Olly sends anything.
10. Log their links in NEXT.md (local only, never committed: it holds names and private links).

## Rules (from Olly's corrections, 2026-11-15)
- The title is the outcome: "Path To The Relationship You Want", never the feeling ("Path To Peace"). Why: the outcome is what they want; the feeling is the method.
- "What psychiatrists call intellectualization" inside the sentence. Never a standalone "It's the psychiatrist's term." Why: Olly: it needs to blend into the sentence.
- Brainwaves: at most "we move up into our head". No alpha/theta/high beta detail. Simplify everything as far as it goes. Why: "too wordy around the brainwave pattern stuff".
- Closing line is always "If you'd like me to send over the details for the program, let me know." Never "Next, I'll send you a video". Why: they ask for the next step, Olly doesn't push it.
- The plan must set up everything the sales video assumes (it opens "you've got your plan now"): intellectualization (overthinking, catastrophizing, always fixing yourself), emotional resonance ("from overthinking it to feeling it"), the 3 conditions, the 5 steps, daily DM support (text + video, "me, not AI"), the 2 weeks / 12 weeks / rest of the year timeline. Why: Olly: the applicant must know the problem, the fix, the steps, what's inside the program and the support.
- Photos are the POV plan photos from `hub-site/public/plan-img/`, shown with `object-fit: cover`. Faces fully in frame (`pov-female.jpg` needs `object-position: 50% 12%`). Why: the restaurant man's head was cut off.
- Short page 3 shows their personalised text from their person (partner-text.jpg). Why: Olly wanted them to see the exact message they'd want from their person.
- Their person's text: ordinary plans that show what they want without saying it (picks you up, pays, family wants to meet you, asks about your week). Keep it short enough for the bubble (4-5 lines).
- Already dating → step 4 = "Keep Dating, As Yourself". Not dating → "Take Early Steps And Start Meeting People".
- Priority line uses their answer: "main focus" → "You told me it's your main focus in life right now, so I know it is."; "one of my top priorities" → "...For this to work, it needs to be the one."
- Crude or explicit words in their answers get a respectful paraphrase ("🔥 in the bed" → "real chemistry"), and Olly is told what was changed.
- Every link gets the dedicated 1200x630 thumbnail (og.html: name + title + Olly's photo, byline "With Olly Henson"), not a crop of the cover. Why: the cover is too tall to crop without losing the photo or the title.

## Never
- Never use `plan-img/join.jpg`: the screenshot inside it is stretched. Use `step1-classroom.jpg` for the classroom. Why: Olly: "the last image looks extremely stretched", then "it still doesn't look good".
- Never overwrite a plan someone has already been sent or has read: use `<id>-short` / `<id>-full`.
- Never put applicant names, words or plan links in a committed file (skills, code comments, NEXT.md): the repo is public.
- Never tap Copy / WhatsApp on the old 📄 plan page (plan.html) to "just look": it stamps the plan as sent. Use 👀 Preview on the card.
- Never write a Python edit with unicode escapes in a bash heredoc (bash mangles them): write a .py file with the Write tool.

## Examples (approved 2026-11-15)
- Cover: "<Name>, Here's Your Path To The Relationship You Want" · Where you are now: "You've been single for more than 5 years. When you think about love, you feel worried and sad." · Where we're going: "Someone to settle down with and build a life together. Marriage."
- Head page: "You're stuck in what psychiatrists call intellectualization. When we worry about love, we move up into our head. The overthinking and catastrophizing get loud."
- Partner texts: "Hey, I've booked us a table for Saturday at 7. I'll pick you up. Dinner's on me." (wants a man who plans, calls, pays) · "...Want me to bring something for the boys?" (protect and provide for her and her kids) · "Hey, my sister just asked if you're coming to her birthday next month. I told her yes, hope that's ok!" (commitment).

---

# Plan v4 builder (reference; DM plan requests still use it)

> **Overridden 2026-11-15 for applicants:** the "simple plan" and "simple + program (20 pages)" defaults and the old flow (message → voice note → they say yes → plan) are replaced by the v5 short + full plans above. Applicants who already got a v4 plan keep it; new plans for them go on `<id>-short` / `<id>-full`.

> **Link preview thumbnail (Olly, 2026-11-14):** every plan link shows a picture when sent (WhatsApp, email, iMessage): the top of their cover (their name + title + Olly's photo) at 1200x630, title "<Name>, here's your plan of action". `--upload` makes it automatically (KV `planog:<id>`, served public at /p/<code>/og.jpg; tags added in functions/p/[[path]].js). Nothing to do by hand.

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

**Step 0: pick the plan type from their tags BEFORE writing anything** (Olly 2026-11-13: "it's a plan request, not an application request, but you built the plan with all the steps"). Tag `plan request` (DM, free plan form) = `"kind": "request"` (part 1 sent first, part 2 only if they say they're interested). Tag `heart attractor applicant` = the applicant defaults at the top of this file. Say which one you're building in your first line to Olly.

**Step 0b: check whether they did the Feeling Finder** (FF fields filled, tag `feeling finder`) and tell Olly if not: without it the feeling and current emotion come from the plan form / application words only.

Pull the contact (GHL `contacts_get-contacts` by name): HA fields (status, how long, relationship wanted, tried, not happening, feelings about love, meet right person once, priority, profession) + FF fields (FF Current Emotion, FF Resonance = the feeling they want, FF Intentions = what they want in a partner). Map field ids with `locations_get-custom-fields`.

Copy the last applicant's `funnel/applicant-guides/<first-last>/spec.json` and rewrite every value. Rules:

1. **Only their words.** Every line traces to an answer. Nothing invented (`feedback_messaging_source_order`). If an answer is missing, leave that idea out.
2. **Diagnosis is direct, not hedged** (Olly: "you're just being honest"): intro starts "Based on your answers, my understanding is that there's a belief running underneath…". Title is always "The Belief That's Holding You Back".
   - thought = what they'd think in the moment (from "not happening"), feeling = FF Current Emotion + the feeling words in "feelings about love", repetition = the thought + feeling repeated, NEVER an action or outcome (Olly 2026-11-13: "it's not the action, it's just the repeated thought"; e.g. "You think and feel this, again and again"), belief = closest to their own words (e.g. "doubts of whether I can be loved" → "I'm not sure I can be loved as I am").
3. **The new belief** comes from what they want ("loves me because of me" → "I'm loved for who I am"); the thought adds their "once I…" answer ("I'm with my person and I can be myself").
4. **The feeling** = FF Resonance (e.g. Belonging). It's the word used on pages 5, 8, 9 and the steps.
5. **Every training step (2-5) names BOTH**: the feeling they're building AND keeping THEIR negative emotion at bay (anxiety and doubt / loneliness / frustration…), not generic "intellectualizing" (Olly 2026-11-12).
6. **Step 7 = we guide them through the process**, never a skill they must manage (Olly 2026-11-13: not "you'll know how much to share", "they're not overthinking what to share"). **Steps 6-7 fit where they are**: dating already → "keep dating as yourself"; not dating → small steps within your comfort zone. Step 7 names their sticking point (e.g. "the 2 to 3 month point"). Give step 7 a title if the default doesn't fit.
7. **Never promise an outcome** ("things have room to keep growing", not "you'll get past 3 months"). v6 rules: "the right people start showing up", never frequency/manifesting.
8. **The text message (Step 6 phone)**: what their person would actually send, about real plans, showing what they want *without saying it*. Keep it universal (family, dinner, everyday plans), never a specific hobby or activity they didn't name (Olly 2026-11-13: a hike "might not strike a chord"). Ordinary, short, never a line or a therapy word. Commitment example Olly approved: "Hey, my sister just asked if you're coming to her birthday next month. I told her yes, hope that's ok! Still on for dinner Saturday?" (rejected: "I feel like I can just be myself with you", too on the nose). No emoji (the font can't draw them). Images: `gender` female = male partner photos, male = female.
9. **commit_priority_line** ties to their priority answer ("You told me it's your main focus, so I know it is."). If they said "it matters, but other things come first", write it honestly ("You told me other things come first right now, so this is the one thing to be sure about.").
10. **Note**: draft in Olly's voice from their answers, 3 short paragraphs (`\n` = new paragraph); Olly rewrites it.
11. **When Olly changes the thought or the belief, rebuild everything that hangs off it** in the same pass (feeling words, repetition, new belief, new thought, how-it-shows-up bubbles, steps), without being asked twice. Why: Olly changed a plan request's thought, then had to ask "adjust the feelings and reverse beliefs accordingly".
12. **Write the cover lines in second person with a capital at every sentence start** ("You've been looking…"). Why: the builder swaps I→you, and a lowercase "you've" slipped onto a cover.
13. **Keep the core page short** (intro 1 to 2 sentences, each point 1 to 2 short sentences, their resonance intro under ~25 words). Why: long text makes the page auto-shrink (an applicant's first build).
14. Copy rules: no comma before and/or, "program", "practice", no dashes as separators, plain English. `<b>` allowed in step text. Straight quotes in the spec become curly on the stick pages.

## Run it

```
python tools/build_plan_v4.py funnel/applicant-guides/<first-last>/spec.json funnel/applicant-guides/<first-last>/out
```
→ `out/preview.html`. Publish it as a private artifact for Olly (it embeds their words, so it stays private). Check every page image yourself first (overflow warnings in the output are usually false alarms on the head; look anyway). Look specifically at: every speech bubble sits inside its scene and never crosses both heads (long bubbles wrap automatically above ~32 characters; shorten the line if it still looks crowded), and the 3 pills on Things Start To Unfold hold their text (they widen together up to 900px automatically). Why: Olly caught both on a plan request (2026-11-13).

**Presenting a plan request preview:** say plainly "pages 1 to 10 = part 1, the only part you send now; pages 11 to 23 = part 2, sent only if they say they're interested". Why: the preview shows both parts stacked and Olly thought it was all going out at once.

**After upload, say where it is and how to send it:** "on their Sales card > 📄 Plan of action, Send on WhatsApp or Copy link" (Copy link for email-only people). Why: Olly: "just make sure it's in her card"; sending from the card marks it sent and tracks opens.

When Olly approves:
```
python tools/build_plan_v4.py <spec> <out> --upload
```
→ stores the 20 pages in the Hub (KV `planimg:<contactId>:NN`, `planimgs:<contactId>` = 20) and prints `https://hub.ollyhenson.com/p/<code>` (reuses their existing code if they have one). Their Hub card's 📄 Plan of action shows these pages and the usual Send on WhatsApp / Copy link buttons (those mark "Plan sent"). Opens, pages reached and time per page track exactly like v3.

A change after upload = edit the spec, rerun with `--upload` (same link). The template boxes in the Hub editor do NOT change a v4 plan.

---

## Next (agreed, not built yet)

- ~~Plan requests~~ BUILT 2026-11-13: put `"kind": "request"` in the spec (or `--request`). Part 1 = cover + 7 diagnosis pages (page 5 'The Belief You'll Build', page 8 eyebrow 'How It Works', no 'In The Program') + 'What I'd Do If I Were You' (Olly's first-person summary, 5 steps: build a new belief (their new belief) / practice it every day (their thought + feeling, 'as part of a daily meditation practice': never '10-minute' in part 1's steps, Olly 2026-11-13: part 2 takes them through the meditation specifics) / anchor it when the doubt comes up (their negative emotion + old thought) / act from that place / meet someone from a good place; NO program, NO screenshots; spec `request_summary` [[title, text]x5] overrides with their own words) + 'Name, Does This Sound Like Your Situation?': 'This is what I'd do, and these are the steps. Let me know your thoughts.' + 'If you'd like some help with this, I have a program that takes you through it step by step, and I can send you more information about it. Just let me know if that's something you're interested in.' (10 pages). Part 2 opens with 'Part 2 of your plan / Name, Here's How We'd Do This Together' ('You've seen your plan and the steps I'd take in your shoes...') then the 12 program pages (13 total). Olly's aim: they read it and think 'this person knows me better than I do'. Part 2 = junction + 8 steps + What I Need From You + note + closing (12 pages, own link, KV id `<contactId>-program`). Preview shows both; `--upload` prints both links. The Sales card shows part 2's link + opens at step 4. Applicants (tag `heart attractor applicant`) never get the split: see the defaults at the top.
- Hub button to build v4 from the card (today Claude builds it from the spec).

---

## Never (from Olly's corrections, 2026-11-12 to 2026-11-14)
- Never hedge the diagnosis ("might be", "if this belief is running"). Say "Based on your answers, my understanding is…". Why: Olly: "You're just being honest."
- Never say "the belief we'll build for you". It's "The Belief You'll Build In The Program" and "the feeling you'll build". Why: they do the work inside the program; the plan sells the program.
- Never keep generic argument pages an applicant already accepts (tried everything / The Truth, friends, not what you know). Why: "she probably already understands that. It needs to be more tailored to her."
- Never write a phone text that names the coaching outcome ("I can just be myself with you", "you make me feel I belong"). Why: Olly: "I don't think that's what she'd want… it needs to be subtle. Not robotic." Show it through ordinary plans instead.
- Never leave a step on generic wording ("keep the intellectualizing at bay"). Name their own emotion.
- Never title page 4 after the emotion ("When The Impatience Is Running"). It's **"When This Belief / Is Running"** (`shows_up.title_a` = "When This Belief", `title_b` = "Is Running"). Why: Olly 2026-11-13: "Wouldn't it be when the negative belief is running?" The page shows how the belief plays out.
- Never write "10-minute" in a plan request's part 1 steps. Say "as part of a daily meditation practice". Why: Olly 2026-11-13: part 2 takes them through the meditation specifics.
- Never build an applicant's plan as a plan request or the other way round. Check the tag first (Step 0).
- Never send Olly to the old template editor for a v4 person: the card now shows the image pages (he hard-refreshed, saw the old template and thought the plan hadn't changed).

## Examples (approved for the first applicant)
- Diagnosis: thought "Will this one last?" + feeling "Anxiety and doubt" + repetition "Each time it ends around 2 to 3 months" = belief "I'm not sure I can be loved as I am".
- New belief: thought "I'm with my person and I can be myself" + feeling Belonging + every day for 10 minutes = "I'm loved for who I am".
- Step 5: "In this final training you'll learn how to anchor belonging at any point in your day. This keeps the anxiety and doubt at bay, so when they show up, on a date or a few months in, you can come back to feeling like yourself."
- Phone text (commitment, shown not said): "Hey, my sister just asked if you're coming to her birthday next month. I told her yes, hope that's ok! Still on for dinner Saturday?"
- Cover: "Name, Here's Your Plan Of Action To Meet Your Person" (Olly's exact wording).
- Belief in their own words (Olly's correction, plan request 2026-11-13): thought "Why can't I find someone who has everything that I want?" = belief "Maybe I'm not enough to have what I want". The belief names doubt about themselves, not about the dating pool.
- Core page (approved simple plan, 2026-11-14): "To create the relationship you want, you need to feel <feeling> every day. Not just think about it. Actually feel it." Then: feel it every day · there's less room for <negative emotion> · a thought and a feeling repeated every day become a belief.

<!-- 2026-11-12 skill review: added Never list + approved examples from the first applicant's build (direct diagnosis,
"you'll build in the program", cut generic pages, subtle phone text, personalised steps, cover wording, Hub editor
shows image pages). Removed the first applicant's name from the spec path (public repo). -->

<!-- 2026-11-15 skill review (session: one plan request, two applicants):
- Added Step 0 (pick request vs applicant from the tag) after a plan request was first built as a full applicant plan.
- Added Step 0b (check Feeling Finder) after Olly asked whether a plan request had done it.
- Spec rules 11-13: rebuild everything when Olly changes the thought/belief; second-person capitalised cover lines; keep the core page short.
- Run it: visual checks for bubbles and pills, how to present a part 1 / part 2 preview, where the uploaded plan lives and how to send it.
- Never: no "10-minute" in part 1; never mix up request vs applicant.
- Examples: a plan request's corrected belief; the approved core page wording.
- Removed the "DEFAULT = SIMPLE (10 pages)" block (overridden the same day by the simple + program rule) and the old "applicants always get the full 20-page plan" line in the request note.
- Link preview thumbnail note added at the top (built this session). -->

<!-- 2026-11-15 skill review (v5 short + full plans, built with Olly on six applicants): added the v5 section on top (flow,
what each version holds, 10-step process, rules, Never, examples). Rules from Olly's edits: outcome title not the feeling,
"what psychiatrists call intellectualization" blended in, brainwave detail cut, closing line "If you'd like me to send over
the details for the program, let me know.", plan synced to the sales video transcript, partner text on short page 3, faces
in frame, dedicated og thumbnail, keep-dating step for daters, paraphrase crude answers and say so. Never: join.jpg (stretched),
overwriting a read plan, names/links in committed files, test taps on plan.html. Removed as overridden: the simple-plan and
simple+program applicant defaults and the voice-note-first flow. New tool: tools/plan_v5_shoot.js. -->
