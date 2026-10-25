# Skill: Managing the Messaging Tools

Use this whenever Olly asks to change, fix, rebuild or find any tool listed in `README.md` (Messaging Center, One-Word Transitions, Belief Bridge, Messaging Survey, Content Idea Generator, Reel Title Generator), or when the core message changes.

---

## 1. Before you start

1. Read `README.md` in this folder for the link and local file of each tool.
2. Read the Core message tab of the Messaging Center (`marketing\messaging-center.html`). It is the source of truth for all copy. `memory\argument_sheet_heart_attractor.md` (v6) is the written copy of it.
3. Olly names tools by what they do ("the risk-free tile builder", "the core messaging preview"). Match the name to the README, and confirm it in one line if you're unsure.
4. If he's lost a link, give it from the README straight away.

## 2. Process: editing a tool

> **Patching the Content Idea Generator (2026-10-25):** it's a big CRLF file. Write the patch as a `.py` file with Write (bash heredocs with mixed quotes broke), normalise `
` to `
`, assert each replacement matches exactly once, then restore CRLF. Test in headless Edge with the right localStorage injected (`cig-form` with channel stories, `cig-tsm-open` "1", `tsm-kind`, `tsm-bstyle`) before publishing. Keep the patch scripts in the scratchpad (`cig_convo.py`, `cig_scale.py` are the pattern).

0. **Messaging Center only: pull Olly's saved edits in first.** Since 2026-10-19 the page is editable in place. Its Edit button turns every card, glance point and word list into a text box, and Save publishes a new version of the page (the `artifact` capability). So the live version can be newer than the local file.
   - Before changing the page, `Artifact read` the link, then copy the `<script type="application/json" id="mc-data">` block from the live version into `marketing\messaging-center.html`.
   - All the copy lives in that JSON (`{saved, tabs}`), not in the script. Edit the JSON for copy changes.
   - The page rebuilds itself from `HEAD_HTML`, `#mc-style`, `SHELL_HTML`, the data and its own script. So changes to the header or the editbar markup go in the `SHELL_HTML` string, not just the HTML.
   - Keep `capabilities: {artifact: {}}`: omit `capabilities` on redeploys.
1. **Back up first.** Copy the HTML to the session scratchpad before a big change.
2. **Patch, don't rewrite.** Use a small Node script in the scratchpad that swaps exact text. Make it throw if the text isn't found, so nothing silently fails.
   - Use function replacements (`s.replace(a, () => b)`) so `$` in copy isn't treated as a pattern.
   - Inside the tools' JS string data, a new line is the two characters `\n`. Write the scripts with the Write tool, not bash heredocs, when they contain quotes or backslashes.
3. **Check the syntax** after every patch: pull out the `<script>` block and run `node --check` on it.
4. **Smoke-test** risky changes with jsdom in the scratchpad. Stub `scrollTo` and `fetch` so the test never posts to the real Sheet.
5. **Republish straight away** to the same file path so the link stays the same. Don't ask first. Omit `capabilities` and `icon` on a redeploy so they carry over.
6. Tell Olly in plain English what changed, and give the link.
7. **Anything that draws an image** (the meme maker, canvases): render every template or layout in headless Edge before publishing and look at the screenshot. Serve a test copy with `python -m http.server` from a scratchpad folder (canvas `toDataURL` fails on `file://`), then run `msedge --headless=new --virtual-time-budget=15000 --screenshot=...`. In a test grid, give the images `align-self:flex-start`, or flex stretches them and the text looks squashed when it isn't.
8. **Supporting files** (the meme templates) only reach the page if they're passed in `files` on the publish. Pass them again whenever one is added or changed.

### Content Idea Generator map
- Tabs: Instagram (Reels = authority headers, Stories = connection), Skool, Memes. Each is a `channel` in `CHANNELS`, with its own prompt (`buildPrompt` / `storyPrompt` / `skoolPrompt` / `memePrompt`), its own queue (`QUEUES`, `chanOf()`) and its own rejections.
- Content types and formats live in `POST_TYPES`, grouped by `group` (Authority, Connection, Skool, Meme).
- Meme images: `MEME_LAYOUTS` (template image, text boxes) → `memeEditor()` → `composeMeme()` → `downloads.save()`.
- Capabilities: `sample`, `db`, `downloads`. Omit `capabilities` on redeploys unless adding one; a non-empty object replaces the whole set.

## 3. Process: when the core message changes (the update cascade)

When Olly changes any part of the argument, update all of these in one go, unless he says otherwise:

1. **Messaging Center:** every tab that uses the line (core, content pillars, caption, classroom, feed, About page, group description, DMs, the FitPro side-by-side).
2. **Content Idea Generator:** the `CORE` constant (and `RULES` if a rule changed). Hook styles live in the `HOOKS` constant (`reels` for authority Reels; the `lifestyle` set is no longer used, because Stories come only from Olly's connection posts sheet). They're built from 2026 creator guides, which give patterns rather than hard data, so refresh them with a new web sweep every few months or when Olly asks.
3. **One-Word Transitions:** the Current focus post (`FOCUS_POSTS`). Never touch the Original FitPro post.
4. **Belief Bridge:** only if the steps or template changed (it's a generic tool for any business).
5. **Argument sheet:** `memory\argument_sheet_heart_attractor.md`, v6 section.
6. **Instagram caption:** give Olly the new text to paste into the Business Hub. Don't edit the Hub without being asked.
7. **Memory:** update `project_attract_not_force.md`.

Then re-count the Skool limits (section 5) and republish each tool you changed.

## 4. Process: building or changing the argument

- Follow the FitPro Authority Matrix post step by step: Who → Promised land → Pain → Bleeding neck pain → Old belief → Crack → Analogy → Real cause (one thing, named as missing) → Solution → New belief → Proof → What to expect → Why it's a no-brainer.
- **The one thing has to name the cause, not the result.** "Authority" works for FitPro because having it explains the clients. "Attraction" failed because it's the result ("with attraction you'd attract…" goes in a circle). "The right emotional state" is the cause, and the meditation puts you in it.
- Keep each point as short as the FitPro version. Olly compares them side by side, and he prefers the refined, easy-to-scan length.
- When Olly wants to think it through, show the whole argument in chat in one piece, one short sentence per point, **before** changing any file. Only edit the tools when he says to.
- Stress-testing is in the Belief Bridge chat. Don't push it in the middle of building, because Olly found it overcomplicated things.
- **The crack includes "they aren't flawless".** Friends and family in great relationships weren't trying, and they never fixed everything first: they still have insecurities and baggage. They just felt an emotional connection with the person they met (Olly's wording, not "felt safe and open around love"). Lean on it across every content type.

### Survey responses
- Olly pastes Messaging Survey responses into the chat. Map each answer to its question (titles are in `website\sections\messaging-survey.html`), then show what confirms the messaging, new phrases, and anything to watch, with her exact words.
- **Discuss in chat first, don't change the messaging.** Olly said the current messaging is "pretty on point". One response never changes the core; suggest small tweaks only once a pattern shows across 5–10.
- Brainstorm additions for the generator as a numbered list, give a recommendation, and add only what Olly picks. They go into the AUDIENCE VOICE block of the generator's CORE.
- Log each response and what changed in `messaging-tools\survey-responses.md`, and update its patterns table.

## 5. Rules and constraints

**Skool limits (counted the way Skool counts):**
- About page max **1000** characters (aim for 950 or under). Group description max **150**.
- Count with `t.trim().length + (t.match(/\n/g)||[]).length`. Emoji and bold characters count as 2.
- Generators must fit the limit automatically. Never hand Olly a "trim" button or copy that's over the limit.

**Name:** the community is **The Attraction Formula** (Olly, 2026-10-19). Never call it "Heart Attractor" in copy, labels or AI prompts. The product is The Attraction Formula Meditation. Folder and file names keep "heartattractor" so the paths don't break.

**Copy:**
- No em dashes, and no hyphen or dash separators in Instagram captions or Skool copy. Use colons, commas and full stops.
- UK spelling, except "program" and "visualize". "Any time" is two words. "Can fully be yourself".
- Say "practise", never "fix" or "work on how you feel".
- Say "people who match your state". Never frequency, vibration or manifesting.
- The science is emotional contagion. Heart coherence is the "how", never the headline. Never claim people sense heart rhythms.
- "The right people start showing up", never "you'll meet someone". No time-bound guarantees ("in 30 days").
- What to expect = tangible good things that start happening, not what stops happening.
- About page: lead with the promised land and positive outcomes, not a list of pains.
- The community is about shifting into the right emotional state. The meditation is one part of it, not the whole offer.

**Truth and sources:**
- Use the customer's own words (for example Catrin's DMs and survey) for the promised land, pain and steps. When asked to base something on what she said, use only what she said.
- Cracks must fit nearly every reader and tie straight back to the old belief.
- Analogies must come from the reader's own life and link to the answer they chose. Confusing or clever ones get rejected.

**Tool design:**
- Simple beats complete. Build the control Olly asks for, one at a time. Don't add extras in advance.
- Answers in surveys never auto-advance. Only the Next button moves on.
- The Messaging Survey is for prospects only. No membership or relationship-status questions.
- A microphone can't run inside an artifact. Point to the device's dictation instead (Windows: Win+H).
- Queues and labels say "content idea", not "Reels", unless the tool is only for Reels.
- Tools for outside people (prospects) can't be artifacts that need a Claude login. Build them as GHL pages that post to a Sheet.
- **Build the finished thing, not instructions for another app.** When Olly wants an asset (a meme image), make it inside the tool, ready to save. Pointing him to Imgflip or Canva wasn't what he needed ("help with building the actual meme (image), that's what I need help with").
- **Every piece of generated text Olly might reword is click-to-edit** on the card (titles, meme panels, "How to post it"), and edits are saved and flow into the queue and the image.
- **One queue per content type** (Reels, Stories, Skool posts, Memes). Only that type's queued titles are fed back as the standard.
- **Story images (Story Image Maker):**
  - Every fixed label on an image is editable (the "Most of us were told" line was hard-coded in v77; Olly asked for it on every style in v78). Default it, never lock it.
  - Ship every new layout with position sliders from the start: one to move everything and one per element (Olly asked for them on Belief breaking, then again on Aspiration).
  - Preview-only guides (the dashed sticker box) need an on/off and a plain note that they're never in the saved image. Olly read the guide as part of the design and wanted Stories without a poll.
  - When a layout holds a list (a DM conversation), build it as a list Olly can add to, not a fixed pair. He asked for "more boxes, back and forth" the day the pair shipped.
  - Olly's profile picture on any "post from Olly" layout = the black-and-white wedding photo (his Instagram profile picture), not a talking-head still.
  - Lead gen: "FREE VIDEO TRAINING" big enough to read at a glance, titles as an inverted pyramid with the (bracketed) part in italic.
  - Tab order and names follow Olly's list (Lead gen, Lifestyle, Aspiration, Belief breaking, Emotional scale, Engagement, Meme, Results share), with an overview line at the top.
- **Keep outputs light.** Stories give one simple idea (hook, what to film, optional sticker and CTA), not a frame-by-frame plan ("too overloaded with info").

**Content sources:**
- Stories come ONLY from Olly's connection posts sheet (Personal story, Lifestyle, Questions / entertainment and their formats). No borrowed trending hook patterns.
- Every idea must tie back to the right emotional state around love and never undercut the promised land (a calm, safe, genuine relationship).
- Memes: the joke is on the old approach (learn and fix everything first), never on the person. Use "me", "we" or "most of us", never "you". Never knock therapy or healing work.

### Never

- Never invent statistics, research findings, proof or testimonials. The "68% of relationships start as friendships" claim was wrong and had to be removed. Check research claims and say how sure you are.
- Never add a detail and present it as if it came from source material. If something isn't in what Olly gave you, flag it. ("Being hurt before" and "brushes off compliments" weren't in Catrin's messages.)
- Never use cracks that only fit some readers (for example "you let them pay for dinner").
- Never bring back a line Olly removed (for example the fear-based opener on the About page).
- Never just agree. Olly says "don't BS me". Push back with a reason when something is weak, then go with his call.
- Never use superseded positioning: Regulate/Rewrite/Rehearse, "lack of belief in themselves", "natural attraction", magnetism as the one thing, the cat analogy, the Hawkins/Dotson consciousness levels in the content tool.
- Never course-style steps for the meditation. Use Olly's exact Drop In / Open Up / Feel It definitions.
- Never edit the Original FitPro post, CLAUDE.md or the Business Hub unless asked.
- Never feed generic creator-guide hook patterns into Story ideas. "Nobody's calm relationship looks like this. Including ours..." came from one, didn't tie to the messaging and contradicted the promised land. When Olly asks where something came from, trace it and say plainly.
- Never make a meme that mocks being single, someone's looks or age, or the reader.
- Never leave a choice that needs variety (meme template, hook style) to Claude alone; it drifts to the most famous option (Drake every time). Let the page choose and rotate, then tell Claude what to use.
- Never sound like "Think positive. Just change your thoughts. It's easy." It's the advice the audience finds most annoying (survey, 2026-10-22). Never call the change easy.
- Never write "free trial" / "try it free for 7 days" calls to action any more (trial closed 2026-10-23). Reels point to the free training (comment RESONANCE).
- Never change the core messaging off one survey response.
- Never draw a guide (sticker box, safe-area line) on the canvas: it must stay an HTML overlay so it can't end up in the saved PNG.
- Never put invented DMs, results or screenshots on a Story image. DM and Results share use real messages with names hidden.
- Never present the Aspiration stock images as Olly's family: the words stay about the vision, not "my Sunday". Olly said it's "pretty on point"; discuss in chat and wait for a pattern.

## 6. Examples (current strong versions)

- **One line:** "Who you attract isn't about what you know. It's about your emotional state around love."
- **Real cause (FitPro-style "No authority" equivalent):** "The wrong emotional state around love. You might feel free at work and joyful with friends, but every time you think about being with someone, you feel frustration, anxiety or worry…"
- **Crack, strong:** "Your friends who settled down weren't even trying." (Everyone has these friends, and it breaks "fix yourself first".)
- **Crack, strong (2026-10-22 addition):** "The friends and family in great relationships aren't flawless. They never fixed everything first. They just felt an emotional connection with the person they met." (Olly's wording. My first version, "they just felt safe and open around love", was replaced.)
- **Crack, weak (rejected):** "You let them pay for dinner." (It only fits some people and was invented.)
- **Group description (135/150):** "Attract a genuine, committed relationship without more books, courses or dating rules. Just the right emotional state, 10 mins a day ❤️"
- **The offer, in one line (2026-10-20, used in the Reel pitch, caption, ManyChat and About page):** "The Attraction Formula: a 6-minute training to find your emotional resonance and a 10-minute daily meditation to embody it, so you attract your perfect partner." Short form: "6 minutes to find it. 10 minutes a day to feel it." Keep the name as just "The Attraction Formula" (no Method/Blueprint), because that's also the community name.
- **Meme, strong (Drake):** No: "Reading a fifth attachment styles book" / Yes: "Practising feeling safe about love, daily". (Specific, names a real habit, laughs at the old way, lands on the new state.)
- **Audience language (survey, keep verbatim):** "Dating apps make people feel disposable", "time wasters", "I catastrophise", "found faults early on". Use when they fit, never forced.
- **Belief breaking, Emotional scale (strong, 2026-10-25):** top line "Most of us are dating from the bottom half", the scale's bottom half, "Frustration" circled with "Most of us date from here", bottom line "We attract people who match how we feel." (Uses the training's own image, one point, ties straight back to the core.)
- **Proof:** "I met my wife when I focused on how I was feeling every day, improving it and shifting my state, rather than learning more about what I should be doing."

---

## Changelog

- **2026-10-24 (v70): Outliers per tab**, at Olly's request ("give this tool the best performing outliers so it can generate more ideas around those core concepts"). Side panel, above the queue: title/hook + **post type dropdown** (that tab's `POST_TYPES`, e.g. Free value / Personal philosophy / Results share for Reels; Olly asked for the type so it's "tighter") + optional note (numbers / why it worked). Saved in db collection `outliers` `{channel, title, type, note, savedAt}` (local fallback `cig-outliers`). `outlierBrief()` adds the tab's latest 25 to every prompt (before rejections and queue), told to build on their core concepts without copying, leaning on outliers of the type being generated. "More like this" on each outlier sets the type, puts the outlier in Topic and generates. Note: the file has Windows line endings; patch scripts must split on CR+LF (build the characters with `String.fromCharCode`, not escapes passed through bash).

- **2026-10-24 (Training Story Maker v1):** New standalone artifact for Olly's daily training Story (`marketing\story-maker\`). Three canvas layouts (video preview, Notes app, myth-buster), `HOOKS` and `MYTHS` banks the page rotates itself, editable text, photo swap, `downloads` save. Text kept inside Instagram's safe area (top ~250px, reply box from ~1720px). Edit the `.src.html` and rebuild by swapping `__PHOTO__` for the base64 couple photo.

- **2026-10-23 (offer change, not yet in the tools):** The business moved to the high-ticket **The Heart Attractor Program** ($497/month or $2,500/year, community + daily access to Olly, no 1-to-1, 14-day feel-the-difference guarantee). Funnel: Reel → comment RESONANCE → opt-in → free YouTube training → DM follow-up → application/call. Source of truth: `marketing\memory\offer_heart_attractor_program.md` and the Claude Doc "The Heart Attractor Program: Offer". The 7-day free trial is OFF. **Still to do:** update the Messaging Center, Content Idea Generator CTAs (ATTRACTION/free trial → RESONANCE/free training) and Reel caption in the next session; don't write free-trial CTAs meanwhile.
- **2026-10-23 (v69):** Memes tab: "Any template (tool picks)" kept coming back as Drake, because Claude was choosing. The page now picks the templates (`pickMemeTemplates()`): one per meme, least-used recently first (last 24 picks in `cig-meme-recent`), ties random, and tells Claude exactly which template each meme uses. Tested: 8 batches of 3 used all 12 templates twice each.
- **2026-10-23 (backup):** Exported the generator's database (queues `ideaqueue`, rejections `rejected`) to `messaging-tools\content-idea-generator-backup\` (`database.json` + readable `README.md`). To restore into a new artifact, write `database.json` back with ArtifactData batch. Re-export after big queue changes.
- **2026-10-23 (v68):** Reel header cards have a "Where does this connect?" button (`connectButton` / `connectPrompt`). It asks Claude, using CORE, which part of the message the header draws on, how it connects, what the Reel should land on, and any drift ("Watch out"). The answer is saved on the idea (`i.link`, keyed to the header text) so reopening is instant; editing the header asks again.
- **2026-10-22 (skill review 2):** Never list: never sound like "think positive, it's easy"; never change the core off one response. Examples: the "aren't flawless" crack in Olly's wording (replacing my "felt safe and open around love") and verbatim survey phrases. Nothing overridden beyond that wording.
- **2026-10-22 (session save):** Added the survey-responses process (discuss first, one response changes nothing, picked ideas go to AUDIENCE VOICE, log in `survey-responses.md`) and the "they aren't flawless" crack rule with Olly's wording.
- **2026-10-22 (v67):** From the first messaging survey response, added an AUDIENCE VOICE block to the generator's CORE (all tabs): angles on catastrophising, dating apps feeling disposable, the ordinary Sunday, self-worth not being the missing piece (friends and family never finished it either), being attracted to the wrong people, and never sounding like "think positive, it's easy"; a phrase bank in the audience's words. Added the "don't want to force things" objection, told it to lead with time wasters in What to expect, and added a "What the audience told us" option to the Parts dropdown. Add new survey findings to this block.
- **2026-10-22 (v65):** Content Idea Generator CORE crack now adds: friends and family in great relationships aren't flawless either (still have insecurities and baggage, never fixed everything first, just felt an emotional connection with the person they met; v66 wording). Told to lean on it across every content type. Crack label in the Parts dropdown updated to match.
- **2026-10-22 (skill review):** Added from this session: build the finished asset rather than pointing to another app; editable generated text; one queue per type; light Story outputs; Story ideas only from the connection posts sheet; meme rules (joke on the old way, never the person); Never-list items for borrowed hook patterns and mocking memes; headless Edge render check and `files` steps; a Content Idea Generator map; a strong Drake example. Fixed the mangled templates path in the v63 entry.
- **2026-10-22 (v64):** Meme card panel text and "How to post it" are click-to-edit (`editableText()`); edits save into `cig-ideas` (`saveMemeEdit()`), update the queue outline and redraw an open image; typing in the image boxes writes back to the card when the template is unchanged. Why: Olly wanted to reword the Drake panels.
- **2026-10-22 (later):** Content Idea Generator (v63), at Olly's request ("help with building the actual meme image"): in-page meme maker. `MEME_LAYOUTS` holds each template's image, size, optional white `padTop` band and text boxes (template pixels; `dark` = bold black Public Sans on white, `light` = white outlined Anton); `layoutFor()` matches the AI's template name; `composeMeme()` draws Story/Feed/Meme-only canvases; saving uses the `downloads` capability (declared with sample + db). Template images in `marketing\memes\templates\` must be passed in `files` as `memes/templates/<name>` on every publish that adds or changes one. To add a template: download it, add a `MEME_LAYOUTS` entry and a `POST_TYPES` Meme entry, check the render in headless Edge.
- **2026-10-22:** Content Idea Generator (v62), at Olly's request: new **Memes** tab (channel `memes`). Meme templates are `POST_TYPES` with group "Meme" (format = where it goes, `MEME_PLACES`); `memePrompt()` returns `{template, place, hook, panels:[{label,text}], use, stage}`; own Meme queue. Rule: the joke is on the old approach, never the person; never knock therapy. Why: Olly wants memes that show the belief change, usable in Stories, Reels and Skool.
- **2026-10-21 (later):** Content Idea Generator (v61): Stories now work only from Olly's connection posts sheet (the Connection types and formats in `POST_TYPES`); the borrowed lifestyle hook styles are switched off (`hookSet()` returns null) and each idea names the sheet format it used. Why: a Story hook "Nobody's calm relationship looks like this. Including ours..." came from a generic creator-guide pattern, didn't tie to the messaging and cut against the promised land.
- **2026-10-21:** Content Idea Generator (v60), at Olly's request: separate queues for Reels, Stories and Skool posts (`channel` on each item, `chanOf()` reads older items from their label; `queueBrief()` only feeds back the same type), and Stories simplified to one idea per generation (`{hook, idea, sticker, cta}`, no frame-by-frame plan, "How many ideas" hidden). Why: "too overloaded with info". Old frame-style Story cards still render.
- **2026-10-20 (later):** ManyChat is live with Message 1 as written, Message 2 shortened to "Awesome, here it is!" and the link button set to "Start Free Trial" (Messaging Center v63).
- **2026-10-20:** Messaging Center v62: About page (Olly's final), Reel caption, Reel pitch line, ManyChat messages (DMs tab), classroom structure (5 lessons) and Solution row now all describe The Attraction Formula as the 6-minute training plus the 10-minute daily meditation.
- **2026-10-19:** Content Idea Generator (v55 to v59), at Olly's request:
  - **Not this one** button with an optional reason; the latest 25 rejections per format go into every prompt (db collection `rejected`)
  - Reels give the **header only**, no next line, talking points or CTA ("I'll handle that")
  - Add to queue removes the card; when the list is empty a new batch generates; queued titles go into the prompt as the standard to match (`queueBrief()`)
  - titles are editable; queue items keep `orig` when edited, and rewrites go into the prompt as "X became Y"
  - visible save status: "✓ Saved to your account · N titles" under the queue, "✓ Saved to your queue", "✓ Edit saved"
- **2026-10-19:** The Messaging Center is now editable and saveable in place, at Olly's request. Added step 0 (pull live edits before changing the page).
- **2026-10-19:** Community renamed from Heart Attractor to The Attraction Formula, at Olly's request. Updated the Messaging Center, Content Idea Generator and Reel Title Generator labels and prompts, and added a Name rule.
- **2026-10-19:** Created. Lessons came from the 2026-10-15 to 10-18 sessions:
  - the made-up 68% stat → Never invent stats
  - invented Catrin details → Flag anything not from source
  - the dinner and compliments cracks → Cracks must be universal
  - the confusing analogies → Analogies come from the reader's life
  - About page over the limit while the tool kept generating 1232 characters → generators fit the limit automatically
  - auto-advancing survey → no auto-advance
  - "attraction" naming the result → name the cause
  - course-style steps and the stress test "overcomplicating it" → simple beats complete
  - "show me here first" → argument in chat before editing files
  - "What to expect" as things that stop → tangible positives
  - positive About page instead of pains
  - community, not just the meditation
  - Regulate/Rewrite/Rehearse, natural attraction, magnetism and the cat analogy superseded by v6, "the right emotional state"

- **2026-10-25 · Content Idea Generator v71:** Training Story Maker built into Stories · Connection as a fold-out card ("Training Story image", `#tsmBox`, shown only on Stories, open state remembered in localStorage `cig-tsm-open`). The maker's script is copied from the BUILT `story-maker\training-story-maker.html` (photos included) into a second `<script>` at the end, with every id prefixed `tsm-` (the generator already has `#hook`). Poppins added to the font link for the canvas. Pitfall: the generator has no global `[hidden]{display:none}`, so any class that sets `display` needs its own `[hidden]` rule (`.tsmg[hidden]`); the same thing makes the existing `label.f` "How many ideas" and the empty Hook style box still show on Stories.

- **2026-10-25 · Content Idea Generator v72:** the Story card is now the **Story Image Maker** with an overview line and tabs (`#tsm-kinds`): Lead gen (the old Training Story Maker: Video/Notes/Myth layouts, Reply VIDEO), Lifestyle (photo + white highlight boxes, no CTA), Belief breaking (purple; "MOST OF US WERE TOLD" + old belief, "BUT…" + the crack), Engagement (photo + question) and Results share (headline + an uploaded real screenshot, with permission and names covered). Belief breaking and Engagement leave the space at y 1180–1560 empty and show a dashed "add the sticker here" guide over the preview only (HTML overlay `#tsm-stk`, never drawn on the canvas, so it isn't in the saved PNG). Each tab keeps its own text (`st.life/q/oldB/crack/res`); banks LIFESTYLE/QUESTIONS/BELIEFS/RESULTS rotate least-recently-used. New Story content type **Belief breaking** (Connection group): names the old belief, shows the crack, returns extra JSON `old` + `crack`. Every Story idea card has **Make image**, which calls `window.tsmLoad({kind,text,old,crack})` (Belief breaking → belief, Questions / entertainment → engagement, else lifestyle). The generator copy is now the main Story maker; the standalone Training Story Maker artifact is Lead gen only and isn't kept in sync.

- **2026-10-25 · Content Idea Generator v73:** Olly's pain point is moving images between computer and phone, so the Story Image Maker is meant to be used on the phone (artifact link added to the home screen). On touch screens it shows a **Share** button (`#tsm-share`, `navigator.share` with a PNG file) that opens the phone's share sheet (Save Image to Photos, or Instagram), plus a press-and-hold hint. The PNG `File` is made after every render (`shareFile`), because Safari only allows `share()` straight from the tap. Not yet confirmed that the claude.ai artifact frame allows Web Share on iPhone; if it doesn't, the fallback is press and hold the preview.

- **2026-10-25 · Content Idea Generator v74:** two more Story Image Maker tabs. **Aspiration** (Olly: "create the aspiration, the excitement, the vision, and keep reaffirming it"): the training's everyday-life images from `training\how to use emotional resonance images\` (Settled Family Life, Family get together, Couple having breakfast, Couple at coffee shop), resized to max 1080 wide, JPEG q82, embedded as `ASPIRE_PHOTOS`; line in white boxes on the lower third (ends y 1620); its own photo pick and slider (`asp`), separate from Olly's photos. These are stock-style images, not Olly's family, so the words stay about the vision. New Story content type **Aspiration** (Connection) whose Make image opens that tab. **Meme**: mounts the Memes tab's `memeEditor(null)` (Story size by default) in `#tsm-memeHost` and hides `#tsm-main`; `render()` returns early on meme. Tab order: Lead gen, Lifestyle, Aspiration, Belief breaking, Engagement, Meme, Results share.

- **2026-10-25 · Content Idea Generator v75:** Lead gen has a new **Video player** layout (`DRAW.player`): blurred, darkened thumbnail background (shrink to 27×48 and stretch back, because canvas `filter` isn't reliable in Safari), FREE TRAINING badge and title in white boxes from y 336, a 960×540 player (y clamped 740–840) with a progress bar and a big play button, then the Reply "VIDEO" pill and a sub-line. The thumbnail is the YouTube one for youtu.be/IneemXUd7Nw, saved at `marketing\story-maker\emotional-resonance-thumbnail.jpg` and embedded as `THUMB`. "Use a different thumbnail" swaps it for a new training, and "Back to the training's" resets it.

- **2026-10-25 · Content Idea Generator v76:** Lead gen badge is now big ("FREE VIDEO TRAINING", Poppins 800 50px, 92px pill, `badge()`) on all four layouts (Notes: left-aligned under the date; Myth: top). The Video preview frame and Video player shrink if a long title pushes them down. **Lead gen titles = inverted pyramid** (Olly: the eye path should run straight down) with the (bracketed) part **italic** (`titleBoxes()` / `pyramid()`): it tries every line break at every size 64→44 and scores increases ×40, uneven taper, short top line, stranded last word, and +1000 for a line mixing normal and italic words; a smaller size costs 12 per px. The bracketed part is its own pyramid underneath (the line where it starts may be wider). Result for the full title: 3 tapering lines + 2 italic tapering lines at ~48px. If Olly wants it bigger, the trade-off is a less clean taper. Poppins italic 800 added to the font link and to the font loading.

- **2026-10-25 · Content Idea Generator v77:** Belief breaking tab has a **Style** row (`#tsm-bstyles`, `st.bstyle`, remembered): Most of us were told (`DRAW.belief`), Myth / Truth (`b_mythtruth`: dark top, cream bottom, MYTH and TRUTH pills), Crossed out (`b_crossed`: cream, old belief struck through in pink), Text post (`b_post`: a white post card from "Olly Henson @attractwitholly", avatar cropped from the Talking 1 still), Photo (`b_photo`: Olly's photo, old belief struck through, crack in white boxes; uses the photo picks). Helpers `pill()` and `struck()`. Every style keeps y 1180–1560 clear for a sticker. BELIEFS bank grew from 5 to 20 pairs, all from the core message, the survey angles and the objections (no invented specifics).

- **2026-10-25 · Content Idea Generator v78:** Belief breaking additions. (1) **Line at the top** is editable per style (`#tsm-lead`, `st.lead[bstyle]`, defaults in `LEADS`, remembered as `tsm-leads`); Myth / Truth keeps its MYTH and TRUTH pills. (2) New **DM reply** style (`b_dm`): their message in a grey bubble with a plain avatar (no name), Olly's reply in a purple bubble with "Seen"; the top line defaults to "A question I get asked a lot". Fields relabel to "Their message (a real one, name hidden)" / "Your reply": use real questions, never invented DMs. (3) **Text post** profile picture is the black-and-white wedding photo (`PHOTOS[1]`, cropped to the couple), as on Olly's Instagram. (4) **"Leave space for a poll or question sticker"** checkbox (`st.stk`, remembered): the dashed box was always preview-only, never saved; unticked, each style moves its text down to fill the space. (5) **Position sliders** per style (`st.mvs[bstyle]`, not saved between visits): Move everything, Top line, Old belief / Their message / Myth, The crack / Your reply / Truth, plus Reset positions. Text post only has Move everything (the card moves as one).

- **2026-10-25 · Content Idea Generator v79:** DM reply is now a **conversation builder** (`st.convo = [{who:"them"|"me", t}]`, remembered as `tsm-convo`; editor `#tsm-convoGroup` with a Them/Me dropdown, auto-growing textarea and ✕ per message, "+ Their message", "+ Your reply", "New example" = a fresh pair from BELIEFS). `b_dm` lays out every message, shrinks text 46→28px until the conversation fits (to y 1150 with sticker space, 1700 without), gaps 14px within a run and 40px (+ "Space between messages" slider) when the sender changes, plain avatar on the last of each run of their messages, "Seen" after a final reply. For DM the per-element sliders become Top line + Space between messages. Patch script: scratchpad `cig_convo.py` (writing it as a file avoided bash heredoc quoting trouble).

- **2026-10-25 · Content Idea Generator v80:** new Story type **Emotional scale** (`kind:"scale"`, `DRAW.scale`), built on the training image `training\how to attract a committed relationship images\Emotional Scale.jpg` (768×1376, embedded as `SCALE_IMG`, JPEG q90): elevated emotions / high-quality partners up top, survival emotions / low-quality partners below. Layouts Full scale / Top half (src y 0–690) / Bottom half (src y 686–1376), top line in white boxes (bank `SCALE_HOOKS`), optional bottom line (`SCALE_BOTTOM`, "New line"). **Circle an emotion**: glowing ring (pink up top, orange below) round any word, positions in `SCALE_UP` / `SCALE_DOWN` (source pixels, measured off the image), with an optional label pill that defaults to "Most of us date from here" (bottom half) or "The state that attracts the right person" (top half) until Olly types his own. Patch script: scratchpad `cig_scale.py`.

- **2026-10-25 · Content Idea Generator v81:** Aspiration has a **Move text up or down** slider (`#tsm-aspUp`, `st.aspUp` 0–1400px up from the lower-third default, remembered; the range is `direction:rtl` so left = top of the image). The text block never goes above y 260. When the text sits in the top half, the dark fade moves to the top (`topFade`) instead of the bottom.

- **2026-10-25 (skill review 3):** From the Story Image Maker work (v71 to v81). Rules: editable labels, sliders on every layout from the start, preview guides optional and clearly not saved, list-style builders, the wedding photo as Olly's avatar, Lead gen badge and pyramid titles, Olly's tab order. Never list: guides on the canvas, invented DMs or results, stock images as Olly's family. Process: the `.py` patch pattern and headless Edge test setup. Example: the Emotional scale Story. Nothing overridden (the standalone Training Story Maker was already marked Lead gen only in v72).
