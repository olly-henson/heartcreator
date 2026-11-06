# Skill: Reel Auto-Editor + Poster

Turns Olly's raw iPhone Reel recordings into finished Reels in his exact on-screen style, matches each to its Hub calendar hook, and (after his one approval) schedules it on Instagram, Facebook, TikTok and YouTube Shorts through GHL.
Tools: `reels\reel_editor.py` (the edit), `reels\upload_server.py` (phone upload + review page, port 8800, plus the GHL poster thread), `reels\ghl_poster.py` (slots, GHL upload, posts, posted check).
Reference pair (the style to match): `reels\sample\Raw.MOV` (raw) and `reels\sample\Final.mp4` (Olly's own edit). Both stay local and are never committed.

## Goal
Olly only records. His day: push hooks from the content generator to the Hub calendar → set each day's Reel number in the day panel (0-10, default 4) → record from the Hub **Record** tab (hook + CTA keyword, nothing else) → bulk upload every raw video in any order on the upload page → review each under **To approve** and tap **✓ Approve and schedule** once. Everything else is automatic: matching, editing, captions per platform, scheduling, and the statuses Draft → Recorded → Scheduled → Published on the Hub calendar.

## Process / Steps
1. **Study the reference first** when changing the look: pull frames from `Final.mp4` at the same timestamps as the test render (caption band y 240-560 on 1080x1920). Match measurements, don't guess them.
2. **Transcribe** with faster-whisper `small.en` on the CPU (numpy audio; PyAV breaks on this PC). Cached as `<raw>.words.json` (~5 min for a 3-min clip, re-edits skip it). Punctuation retry with an `initial_prompt` if the result is a run-on.
3. **Match to the calendar:** `reel_editor.py RAW OUT --words-only` prints `FIRSTWORDS "<first 30 words>"`; `match_score()` = share of the hook's words said in order at the start; 0.5+ = match (tested 1.0 right vs 0.17 wrong). Candidates = unpublished calendar Reels (Hub GET, -21..+14 days, skipped ones excluded) not already taken. Olly can pick/change the hook from the card's dropdown (re-edit ~2 min).
4. **Trim the start and end only.** Start = `speech_onset()`: first 60ms run above THIS clip's own noise floor (3x the 20th-percentile level, or 25% of the way to the peak) near whisper's first word, minus 0.05s. The hook must be heard in the very first moment. End = last word + 0.35s.
5. **Fit the length:** every Reel ≤ 179s (YouTube Shorts + Instagram Reels limit is 3:00). `fit_length()` shortens the longest pauses down to 0.25s, longest first, only until it fits; never words, never the first 4s (hook) or last 8s (CTA). Still over: an even speed-up (≤ a few %). `remap()` moves word times so captions stay in sync. Result length is saved in the plan (`length`, `speed`).
6. **Hook text** = the words he actually SAID (`merge_hook()`): misheard words take the calendar's spelling ("While" → "Why"), words he skipped or added follow his speech, the calendar's end emoji is kept, trailing punctuation dropped, first word capitalised.
7. **Hook layout** (`hook_fit()` / `hook_lines()`, rewritten 2026-11-06): ALWAYS an inverted pyramid: each line at least as wide as the one below it, the bottom line counting its end emoji, every line within HOOK_MAX 780px (phones crop ~100px off each side). Order of tries: (1) two lines at 66px, the most balanced pyramid wins; (2) two lines shrinking 2px at a time, but only down to PYRAMID_MIN_PX 48 (slightly smaller is fine, 40px was "too small"); (3) a hook too long for that (about 10+ words) goes to THREE lines, still a pyramid, at the biggest size that fits.
8. **Captions:** white rounded box, bold black, 2-4 words (22 chars max); new caption at a sentence end or a 0.35s pause; hidden during 0.6s+ pauses; final full stops stripped.
9. **Green (#10D05D):**
   - Every mention of "intellectualization" and "emotional resonance" (s/z spellings both match, always shown as Olly's US "intellectualization"). Own caption box when he names it ("called X") or says it as its own sentence; green in line otherwise.
   - CTA keywords (feeling, emotion, video, attract, scale) when "comment" / "DM" / "message" came up to 5 words before, across caption boxes; comma after them removed. Green both times (after "comment" and after "DM").
10. **Render:** PIL PNGs of the caption strip only, one ffmpeg overlay at y=240 (keep-segments trimmed + concatenated when pauses were shortened). 1080x1920, 30fps, H.264 Quick Sync, AAC.
11. **Captions per platform:** the Hub's built-in Perfect Reel captions (mirrored to KV `reelcaptions`), exactly as laid out per platform. Only the set changes: it follows the keyword he SAYS at the end (`spoken_offer()`: ATTRACT → attract, FEELING/EMOTION → scale, VIDEO → video), else the calendar's CTA. `VIDEO TITLE GOES HERE` (Facebook line 1) = the on-screen hook.
12. **Check before telling Olly it's ready:** read the hook word by word, grab frame 0 (hook + emoji), a frame at each green word, and the first 1s of audio (voice from ~0.0s). Confirm length ≤ 179s.
13. **Schedule on approval** (`gp.schedule()`): book the slot, upload the mp4 to GHL `/medias/upload-file`, create one `scheduled` post per platform (IG reel, FB reel, TikTok post PUBLIC_TO_EVERYONE, YouTube `youtubePostDetails {title: hook ≤100, privacyLevel public, type short}`), Hub stage → scheduled. Unschedule deletes the unpublished posts and keeps the upload.
14. **Slots** (`SPREAD` in ghl_poster.py, Windhoek UTC+2, posting day 06:00 → 06:00, US emphasis: Windhoek = ET+7): a timetable per day count, e.g. 4 = 15:00, 19:00, 23:00, 02:00. Count = max(the day's Hub number, Reels on that calendar day). A matched Reel books its own calendar day, earliest free slot ≥ 20 min ahead; a late or unmatched Reel tops up the first day below its number (rest days skipped).
15. **Posted check** every 10 min after the slot (`gp.check()`): GHL replaces a scheduled post when it publishes: the old one goes `deleted: true` (status still "scheduled") and a new post appears with `parentPostId` = old `_id`, its own status and the live link in `previewLink`. Follow the child; save links; Hub stage → posted (the Hub then sets Published + Video stats by itself).

## Rules and Constraints
- Style spec: Figtree (`reels\fonts\Figtree.ttf`) weight 850 at 66px. Box top y=289, box height 120, 24px side padding, corner radius 18. Text black; highlight #10D05D. Approved by Olly ("absolutely perfect"): treat as locked unless he asks.
- Keep it human: never cut words, misspeaks or retakes. The only middle edit allowed is shortening pauses, and only when a Reel is over 2:59.
- One approval only, on the upload page (one card per Reel: video + all four captions). Never move approval into GHL (4 posts per Reel to tick).
- Instagram is posted by GHL too (Olly: "otherwise what's the point? I'm still stuck on my phone all day").
- Laptop is needed for receiving, editing, scheduling and status updates; NOT for posting (GHL posts from its own servers). Statuses catch up when it's back on.
- Upload page on the phone: iOS stops a web page's upload when he leaves it or the phone locks. The page keeps the screen awake while sending, tells him to pick **Options → Current** in the photo picker (skips the HEVC conversion), and a 20s no-progress watchdog marks a dead upload "stopped, pick it again". He must stay on the page until the bars finish; review can happen any time later (home Wi-Fi only).
- GHL key = `marketing\.env` 'Claude agent' Private Integration (socialplanner post+account, medias). userId = `bHBaRQ4MROqMcbSUeKXm` (the key can't list users; it's the createdBy on files he uploads).
- Hub link: `https://hub.ollyhenson.com/api/track/reels?key=<reels\.hubkey>` (Pages secret REELS_KEY; `.hubkey` is git-ignored). Send `User-Agent: ReelUpload/1.0` (Cloudflare 403s Python's default). Stages live in KV `reelstatus`, never in the Hub record (would cause "changed on another device" popups).
- After changing upload_server.py or ghl_poster.py: restart via PowerShell (Stop-Process the pyw upload_server, Start-Process pyw). Check no upload is mid-transfer first (`inbox\*.part`). reel_editor.py changes apply to the next edit without a restart.
- Raw and finished videos, transcripts, plans, `reels\reference\`, `reels\ready\` and `.hubkey` stay out of git (the repo is public).
- **Explaining it to Olly:** say plainly where things live (the page runs on his laptop, not in the Hub). Walkthroughs: one click per message, wait for "done", and check the result yourself where you can.

- **Recycling (Olly decided 2026-11-04, build after Meta Ads + auto Reel stats):** now and then repost a TOP Reel unchanged after 90+ days, new caption + different time, on top of new Reels (not instead). Source = `reels\ready\` or the GHL media url; same GHL schedule path. Keep finished files for winners.

- **Getting videos to the laptop (2026-11-05):** Safari's file picker fails on big videos (spinning circles, bounces back) and leaves GBs of hidden copies in Safari "Documents & Data" (cleared with Settings > Safari > Clear History and Website Data > **Today**, which keeps older logins). Use the iPhone Shortcut **Send to Reel Upload** (Select Photos, multiple > Repeat with each > Get Contents of URL `http://<laptop IP>:8800/upload`, POST, header `X-Name: video.mov`, body File = Repeat Item). It sends originals, but only in the foreground: Do Not Disturb on (calls set to No One), screen on, plugged in.
- **Laptop address moves** (192.168.0.12 -> .7 on 2026-11-05, back to .12 on 2026-11-06: Shortcut said "Could not connect to the server", fixed by editing the URL; offer Olly a router DHCP reservation). `Start Reel Upload.bat` prints the live IP. On the laptop itself bookmark `http://localhost:8800`.
- **The upload page shows** "Uploaded up to <day> ✓" and "Next on the calendar" (next 6 open hooks, 14 days ahead), a Delete button on waiting Reels, and "Duplicate: you've already uploaded this video… Delete this copy?" (same first 25 spoken words as an earlier upload) instead of "Not matched".
- **Posting time goes back to the Hub:** upload_server sends the GHL slot with the "scheduled" stage; the Hub moves the Reel to the posting day (06:00-06:00 Windhoek) and shows "posts <day time>". Times in chat are Windhoek/Cape Town (UTC+2); Git Bash `date` with TZ prints UTC, so check with Python or PowerShell.
- **Days ahead:** next_slot never books a passed slot (20 min lead); overflow takes the next day's first slots. Olly's day numbers are respected.

- **Misheard words (2026-11-06):** `WORD_FIXES` in reel_editor.py ("feeding" -> "feeling") is applied to every transcript and saved into the .words.json, so captions read right and the FEELING CTA goes green. Add new mishearings there; re-make a Reel with POST /retry/<id> on the upload server.

- **Hook = inverted pyramid, ALWAYS (Olly 2026-11-06):** the top line is wider than the bottom one (the bottom counts its end emoji). hook_fit shrinks the text only slightly for it (66px down to PYRAMID_MIN_PX 48). A hook too long for a pyramid at 48px (10+ words, e.g. "You don't need another plan to attract a committed relationship") goes to THREE lines, still a pyramid, at the biggest size that fits (58px for that one). Olly chose 3 lines over 40px text, a non-pyramid split or going past the safe width (2026-11-06).

### Never
- Never put a new hook over old footage or splice a new opener on to "freshen" a Reel. Olly: "I tie my content into the hook itself throughout": the hook and the whole video are one piece. Recycle = the same video unchanged.
- Never cut silences, pauses, misspeaks or retakes from the middle, except shortening pauses to fit 2:59.
- Never let a lower hook line be wider than the line above it, and never shrink the hook below 48px to force a pyramid (Olly: "too small"). Three lines are only for hooks too long for a two-line pyramid at 48px+; short hooks stay on two lines (three covers his head).
- Never leave a Reel waiting for approval on an old rule: when a caption/hook rule changes, re-make the affected waiting Reels (POST /retry/<id>) and check each finished before Olly approved it (finished < approved in reels.json).
- Never add a hook line or anything else to the platform captions; never change their layout.
- Never green a keyword that isn't a CTA (comment/DM/message within 5 words before it); never leave a mention of a TERM black.
- The CTA keyword is green BOTH times: after "comment" and after "DM" (Olly 2026-11-05: "send me a DM with the word feeling" has DM 4 words back and was missed when the window was 3).
- Never state video specs without ffprobe (raw = 1080p 60fps HEVC, rotated).
- Never use ffmpeg `drawtext` / ASS on this PC (fontconfig broken). Draw text with PIL.
- Never print emoji to a cp1252 console: reel_editor reconfigures stdout to UTF-8; test scripts use `PYTHONIOENCODING=utf-8`. Windows `json.load(sys.stdin)` shows UTF-8 as mojibake: check raw bytes before believing GHL garbled an emoji.
- Never send cover settings to GHL: `media.thumbnail` is dropped; `instagramPostDetails.coverUrl/thumbOffset` and `youtubePostDetails.thumbnail` are REJECTED (422) on scheduled posts even though drafts accept them. Test API shapes on a `scheduled` post far in the future, not only on drafts.
- Never trust a scheduled post's own status after its slot: follow `parentPostId` (step 15).
- Never assume a passed check means Olly saw it: his phone caches the video; the page busts it with `?v=<finished>` + no-store.
- Never add a pass that needs a Claude call per video.
- Never run the upload server as a Claude background task; never add Startup/auto-run items yourself.
- Never write Python containing backslashes, `\n` or `\u` through a bash heredoc patch: it mangled strings four times this session. Use the Edit/Write tools, or a .py patch file written with Write.
- Never say you can't see his Instagram before trying (it's public; WebFetch reads it).
- Never read a GHL post that is `deleted` with no child yet as "removed": GHL swaps the scheduled post for its child only when Instagram/TikTok finish processing (minutes for a 3-min Reel). Under 6 hours old = in progress.
- Never ship upload-page JS with a bare apostrophe inside a single-quoted string (`won't` broke the whole page on 2026-11-05). The page is a raw Python string: extract the `<script>` and `node --check` it after every change.
- Never restart the upload server while a `.part` file is in `inbox\` or a Reel is editing/scheduling: check `ready\reels.json` + `inbox\*.part` first.
- Never record Reels in the browser: tried 2026-11-05 (zoom, glitchy frame rate, quiet raw mic, boosted audio broke Save to Photos) and Olly scrapped it ("not raw and natural enough"). He films in the camera app; the Hub Record tab is the hook prompt only. The editor stays without loudnorm.

## Examples
- Hook from speech + calendar: heard "While your friends have found love and you haven't" + calendar "Why your friends found love and you haven't 💔" → on screen "Why your friends have found / love and you haven't 💔".
- Two-line pyramid: "You don't need a plan / to find your person ❤️"; "How to attract your person, / scientifically 🧪". Slight shrink: "How to attract your life partner / without more effort ❤️" (52px). Too long for two lines: "You don't need another plan / to attract a committed / relationship ❤️" (three-line pyramid, 58px; Olly: "that did the trick").
- Green: "...something called **intellectualization**." (own box); "...struggling with **intellectualization**" (green in line); "Just comment **feeling** / or DM me **feeling**".
- Length: forced test 179.4s → 170.0s by shortening 35 pauses + x1.013; captions stayed within ~0.25s.
- First live post (2026-11-04, 19:30 slot): YouTube 19:31 (a /shorts/ link), Instagram + Facebook 19:34, TikTok 19:37.

<!-- Changelog
2026-11-04: Created from the first build session (style matched to Final.mp4, start/end trim only, highlight terms, upload page).
2026-11-04 (review 2): hook word check, punctuation retry, explaining-it rule, exclusive bind, continuity rule from his 10 latest covers.
2026-11-04 (review 3, calendar link + GHL poster session). Lessons from Olly's feedback:
- "What I need really is the hook title": talking points removed; Record tab = hook + CTA only.
- "Keep the captions exactly as they are ... it just needs to match up with the keyword": captions = Hub templates untouched, set chosen by the spoken keyword. Overridden: "hook as caption line 1".
- "The hook always needs to default to what's said ... sometimes I miss a word": on-screen hook = speech with calendar spelling. Overridden: "calendar wording on screen".
- "Make sure it's got the correct emoji": calendar hooks carry the emoji; editor uses it.
- "Keywords weren't highlighted" (x3): look-back across caption boxes; British "intellectualisation"; then "always highlighted even if mentioned more than once". Overridden: "other mentions stay black", "feeling only".
- "The intro hook needs to be as soon as the video starts": noise-floor onset (outdoor wind fooled the fixed level).
- "Always make sure it's cut within the time limit ... even a tiny cut": fit_length. Overridden: "the middle is never touched" (now: only pauses, only when over).
- "Inverted pyramid", then "can just be two lines ... starts to cover my head": always two lines. Overridden: greedy line fill and 3-line hooks.
- "Space out the reels ... emphasis on US time zones": SPREAD timetables. Overridden: the fixed 10-slot list.
- "Some days 4, other days 8-10": per-day Reel number in the Hub. "Keep posting using GHL": Instagram via GHL; split test dropped.
- "It keeps crashing" (playback): the page redrew lists every 8s; now only on change. "Keywords still not highlighted": phone played a cached copy; cache-busting added.
- Closing the app stopped the upload; picking again did nothing: wake lock + Options→Current tip + 20s watchdog.
- Process lessons: GHL rejects cover fields on scheduled posts (test with real scheduled posts); GHL swaps posts on publish (parentPostId); Cloudflare 403s Python's UA; emoji crashed the cp1252 print; heredoc backslashes.
- "A tad wide ... right tight on the edge of the screen": HOOK_MAX 940 -> 780 (phones crop the sides) + shrink-to-fit. Overridden: 940px.
- Dropped by Olly: mid-blink first frame is fine (the hook matters more); no YouTube cover work.
-->
<!-- 2026-11-04 (review 4, recycling talk): "I tie my content into the hook itself throughout" -> Never rule: no new hooks / spliced openers on old footage. Overridden: my suggestions "new hook text", "record a 5-second new opener", "start from a later sentence". Olly's call: occasional unchanged repost after 90+ days. -->

- 2026-11-05: Skill review. Added the Shortcut upload route and Safari storage fix (the browser picker failed on 0.5 GB videos and hid 5.5 GB in Safari), the moving laptop IP + localhost bookmark, the upload page's up-to/next/duplicate/delete features Olly asked for, the GHL slot -> Hub calendar hand-off, and Nevers from today's bugs (false "removed" posts, the apostrophe that broke the page, restarting mid-upload) plus the scrapped in-browser recorder so it isn't rebuilt. CTA keyword now green after both "comment" and "DM" (5-word window).

<!-- 2026-11-06 skill review: (1) "feeding" for FEELING: WORD_FIXES in reel_editor.py, saved into .words.json so the CTA goes green and the offer check sees it. (2) Hook pyramid: Olly wants the top line ALWAYS wider ("even if text has to be made larger or smaller slightly"); 40px was "too small", a wider bottom line at 48px was rejected ("now the top line is narrower"), and he picked three lines over going past the safe width. Overridden: "always two lines / never three lines" and the old "no pyramid fits" fallback example. (3) Laptop IP moved back to .12: the Shortcut's "Could not connect to the server" = wrong IP; fix the URL in the Shortcut. (4) New Never: re-make waiting Reels when a rule changes. -->
