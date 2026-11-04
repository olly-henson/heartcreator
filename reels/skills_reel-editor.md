# Skill: Reel Auto-Editor

Turns Olly's raw iPhone Reel recordings into finished Reels in his exact on-screen style. He uploads them from his phone over home Wi-Fi, and the laptop edits them and lists them ready to post.
Tool: `reels\reel_editor.py`. Usage: `py reels\reel_editor.py "<raw video>" ["<output.mp4>"]`. Upload page: `reels\upload_server.py` (see "Upload page" below).
Reference pair (the style to match): `reels\sample\Raw.MOV` (raw) and `reels\sample\Final.mp4` (Olly's own edit). Both stay local and are never committed.

## Goal
Olly only records. Editing and distribution happen without him. His part: record a batch, upload from his phone and wait for "Sent", then carry on with his day. Next build (agreed 2026-11-04, plan in NEXT.md): the upload page matches each video to its Hub calendar Reel, statuses flow back to the Hub (Recorded > Edited > Scheduled > Posted), and GHL posts to Instagram, TikTok, YouTube Shorts and Facebook every 2 hours, with a Scheduled list he can check.

## Process / Steps
1. **Study the reference first.** Before changing the look, pull frames from `Final.mp4` at the same timestamps as the test render and compare them side by side (crop the caption band, y 240 to 560 on 1080x1920). Match measurements, don't guess them.
2. **Transcribe** with faster-whisper `small.en` on the CPU. Feed the audio as a numpy array (the PyAV loader breaks on this PC). The transcript is cached as `<raw>.words.json`, so re-renders skip this step (~5 min for a 3-min clip). If the result has almost no punctuation, transcribe() retries once with a punctuated `initial_prompt` (small.en sometimes returns lowercase run-on text).
3. **Trim the start and end only.** Start = the real voice onset near the first word, minus 0.06s (this matched Olly's own cut, 1.23s, exactly). End = the last word plus 0.35s.
4. **Hook** = the first spoken sentence, shown while he says it. Two-line white box, curly apostrophes, first word capitalised, no trailing comma, full stop or colon. End emoji: 🧪 if the hook says "scientifically"/"science", otherwise ❤️. Fill line 1 greedily, like Instagram does (up to ~760px of text). Don't balance the two lines. If no sentence end comes within 14 words, cut at the longest pause in words 4 to 14 (his natural pause after the hook).
5. **Captions:** a white rounded box with bold black text, 2 to 4 words (22 characters max). Start a new caption at a sentence end or at a pause of 0.35s or more. Hide the caption during pauses of 0.6s or more. Strip full stops at the end and keep commas inside.
6. **Green highlights (#10D05D):**
   - "intellectualization" and "emotional resonance": on their own caption, in green, when he names the term ("called X") or says it as its own sentence. Other mentions stay black inside the normal caption.
   - "feeling": green only right after "DM" or "comment" (the CTA). Remove the comma Whisper puts between them ("DM feeling", not "DM, feeling"). Leave "the feeling finder" black.
7. **Render:** draw the captions as PIL PNGs of the caption strip only, then do a single ffmpeg overlay at y=240. Output 1080x1920, 30fps, H.264 with Intel Quick Sync (falls back to x264), AAC audio.
8. **Check before showing Olly:** compare frames of the hook, a normal caption, a green term and the CTA against `Final.mp4`. Read the hook word by word: a misheard first word ("While" for "Why") is the most visible mistake.
9. **Fixing a misheard word** (until the calendar match is built): edit the word in `reels\inbox\<id>.words.json`, then POST `/retry/<id>` (or Olly taps Try again). The cached transcript makes the re-edit ~2 min. Grab the hook frame and look at it before telling him it's fixed.

## Rules and Constraints
- Style spec: Figtree (`reels\fonts\Figtree.ttf`) weight 850 at 66px. Box top y=289, box height 120, 24px side padding, corner radius 18. Text black; highlight #10D05D.
- Keep it human: the middle of the video is untouched. Olly edits only the start and the end himself, so the tool does the same.
- Match Olly's finished Reel, not a generic caption style. He has approved the current look ("absolutely perfect", 2026-11-04), so treat it as locked unless he asks for a change.
- Speed matters on this laptop (i5-10310U, Intel UHD graphics, no NVIDIA card). Overlay only the caption strip (full-frame overlay took ~6 min, the strip takes ~1m40) and use Quick Sync.
- Getting videos from the phone to the laptop goes over home Wi-Fi through the upload page on the laptop. Olly's iCloud is full, so iCloud is not used.
- Posting: for now Olly posts from the page (Save to Photos + Copy caption). Planned: GHL Social Planner posts all four channels, Instagram included. Olly asked whether schedulers cut reach: research found no evidence either way that holds up (Mosseri reportedly says no; small vendor tests show no difference). Agreed check: compare GHL-posted Reels with his previous 2 weeks of Edits posts in the Hub, and switch Instagram back to manual if it's clearly lower. The GHL key currently lacks Social Planner scope (401 on get-account), so that's the first setup step.
- Raw and finished videos, transcripts (`*.words.json`), plans (`*.plan.json`), `reels\reference\` and `reels\ready\reels.json` are kept out of git (the repo is public).
- **Explaining it to Olly:** say plainly where things live. The page runs on his laptop: not in the Hub, not online. Nothing is sent to his phone by itself; he taps Save to Photos when he's home. His phone only needs the page open while a video is sending, until "Sent". After that he can leave, and the laptop edits regardless. Settings walkthroughs: one click per message, wait for "done", and check the result yourself where you can (powercfg, Test-Path).

### Continuity rule (Olly, 2026-11-04): every Reel matches his recent posted Reels
Checked against the covers of his last 10 posted Reels (instagram.com/attractwitholly, 30 Oct to 4 Nov 2026; logged-out view shows 10 Reels + 2 carousels, no view counts):
- Hook: one white rounded box, bold black text, 2 lines (3 only if it won't fit), centred, sitting just above his head (box top y=289 on 1080x1920, about 15% down). Same look across the whole series.
- End emoji: 🧪 for "scientifically"/"science", otherwise ❤️. He used 😍 once; not a rule.
- Hook wording = the outcome-led header he reads out, 4-7 words (see memory feedback_reel_header_is_hook).
- Captions: same white box, same y, as in his approved "You don't need a plan" Reel (sample\Final.mp4). The covers don't show captions, so Final.mp4 is the caption reference.
- To re-check the style: WebFetch https://www.instagram.com/attractwitholly asking for the full thumbnail URLs (with query string), curl them, tile them with PIL and compare. Plain curl of the profile gets an empty shell. Or use his uploads in `reels\reference\` (the page's "Upload a reference Reel" button).

### Never
- Never cut silences, pauses, misspeaks or retakes from the middle of a Reel.
- Never state video specs without checking with ffprobe. The raw clip is 1080p 60fps HEVC recorded sideways (rotation flag), not 4K.
- Never use ffmpeg `drawtext` or `subtitles`/ASS on this PC: fontconfig is broken and drawtext crashes. Draw text with PIL.
- Never highlight every "feeling", only the CTA one after DM/comment.
- Never add a pass that needs a Claude call for each video. Per-video editing costs zero tokens.
- Never let a hook end in a comma or start lowercase.
- Never say you can't see his Instagram before trying it. The profile is public and WebFetch reads it (Olly: "it's public though my profile").
- Never run the upload server as a Claude background task. TaskStop kills the shell, not python, and leftover copies answer at random. Use Stop/Start Reel Upload.bat through PowerShell Start-Process.
- Never write Python containing Windows paths or `\u` escapes through a bash heredoc. Backslashes get mangled (it failed twice this session). Use the Write/Edit tools or raw strings in a .py file.
- Never add a Startup shortcut or other auto-run item yourself. The permission system blocks it as persistence. Walk Olly through `shell:startup` > New > Shortcut instead.

## Examples
Olly's finished Reel, matched by the tool:
- Hook (0 to ~2.2s): "You don’t need a plan to / find your person ❤️"
- Captions: "Here's what you need" → "instead" → "If it's a massive" → …
- Named term: "...something called **intellectualization**." → caption is just "intellectualization" in green
- Later mention: "...struggling with intellectualization" → "with intellectualization" in black
- CTA: "or DM **feeling**" (feeling in green)

First real upload (2026-11-04), corrected by Olly:
- Whisper heard "While your friends have found love and you haven't," → shipped hook "Why your friends have / found love and you haven’t ❤️" (word fixed, trailing comma dropped).
- Science hook: "How to attract your / person, scientifically 🧪".
- Copy caption: "Why your friends have found love and you haven’t" + blank line + "Just comment FEELING or DM FEELING."

## Upload page (built 2026-11-04)
Tool: `reels\upload_server.py` (standard library only), port 8800. Phone on home Wi-Fi opens `http://192.168.0.12:8800` (saved to his Home Screen).
- **Runs hidden:** `reels\Start Reel Upload.bat` starts it with pyw (no window to keep open; log in `reels\ready\server.log`; editor and ffmpeg run with CREATE_NO_WINDOW). `reels\Stop Reel Upload.bat` turns it off. It starts at login from a shortcut in his Startup folder, which Olly made. The server binds the port exclusively, so a second copy exits with "already running".
- **Laptop power (set 2026-11-04):** plugged in = never sleeps, and closing the lid does nothing. On battery it sleeps as normal. Locked screen is fine. Warn him: no closed laptop in a bag while plugged in.
- Flow: upload (several at once, progress bar) → `reels\inbox\` → edited one at a time → `reels\ready\<id>.mp4`. State in `reels\ready\reels.json`; a restart re-queues anything mid-edit. Each finished Reel: preview, editable caption, Save to Photos (share sheet → Save Video), Copy caption, Mark posted. Failed edits show the error + Try again. "Upload a reference Reel" saves style examples to `reels\reference\` without editing.
- Caption = hook (line 1) + the closing CTA sentence from the full transcript ("Just comment FEELING or DM FEELING."), FEELING in caps, no comma before FEELING / and / or. No Claude call.
- iPhone: the file input is visually hidden, not display:none (a Home Screen web app can stop opening the picker otherwise). The page shows "Opening Photos..." / "Sending..." / "Sent" because iOS takes a while to prepare a video after Add.
- Gotchas: Windows Firewall asks the first time (Private networks, Allow). NordVPN on either device can block home-network access.

<!-- Changelog
2026-11-04: Created from the first build session. Lessons from Olly's feedback:
- He doesn't want silences or misspeaks removed ("keep it human"), so trimming is start/end only and that's in Never.
- He named the 3 highlight terms, so the highlight rules were added, and the comma before "feeling" is removed after the first test.
- First test: the hook dropped "You", so words before the trim point are clamped, not deleted. Text was smaller and lighter than his, so the font is now 66px weight 850. The hook line break differed from his, so line 1 is filled greedily like Instagram.
- He asked whether the clip was really 4K, which corrected a wrong claim. Now: check specs with ffprobe before stating them.
- His iCloud is full, so phone transfer goes over a home Wi-Fi page and finished Reels are saved to Photos from it.
- Speed: render went from 10m45 to ~1m40 (cached transcript, strip overlay, Quick Sync).
2026-11-04 (review 2, upload page session):
- First real Reel: "While" for "Why" in the hook and a trailing comma. Added the word-by-word hook check (step 8), the fix-and-retry path (step 9), no trailing punctuation, a capitalised first word and an Example. Root fix planned: hook wording from the Hub calendar.
- A 20s test came back with no punctuation, so the whole clip became the hook. Added the punctuation retry (step 2) and the longest-pause fallback (step 4).
- "Is this in the Hub? I'm confused" / "do I have to keep the window open?" / "does the laptop send them to my phone?": added the "Explaining it to Olly" rule. The server now runs hidden, starts at login, and the laptop stays awake when plugged in.
- The upload button died after the first try because 3 server copies were running. Added the exclusive bind and the Never on Claude background tasks.
- "It's public though my profile": added a Never on claiming no access without trying, plus the WebFetch method. His 10 latest covers gave the continuity rule and the 🧪 emoji.
- Overridden: "Olly posts Instagram himself from the Edits app (split test)" is replaced by the planned GHL posting for all four channels, with a 2-week reach comparison.
- Process lessons: heredoc backslash failures (Never), Startup shortcut blocked as persistence (Never; Olly does it).
-->
