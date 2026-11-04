# Skill: Reel Auto-Editor

Turns Olly's raw iPhone Reel recordings into finished Reels in his exact on-screen style, ready to post from the Edits app.
Tool: `reels\reel_editor.py`. Usage: `py reels\reel_editor.py "<raw video>" ["<output.mp4>"]`.
Reference pair (the style to match): `reels\sample\Raw.MOV` (raw) and `reels\sample\Final.mp4` (Olly's own edit). Both stay local and are never committed.

## Goal
Olly only records. Editing and distribution happen without him. His part should be: record a batch, upload from his phone, approve, then post Instagram himself.

## Process / Steps
1. **Study the reference first.** Before changing the look, pull frames from `Final.mp4` at the same timestamps as the test render and compare them side by side (crop the caption band, y 240 to 560 on 1080x1920). Match measurements, don't guess them.
2. **Transcribe** with faster-whisper `small.en` on the CPU. Feed the audio as a numpy array (the PyAV loader breaks on this PC). The transcript is cached as `<raw>.words.json`, so re-renders skip this step (~5 min for a 3-min clip).
3. **Trim the start and end only.** Start = the real voice onset near the first word, minus 0.06s (this matched Olly's own cut, 1.23s, exactly). End = the last word plus 0.35s.
4. **Hook** = the first spoken sentence, shown while he says it. Two-line white box with a red heart (❤️) at the end, curly apostrophes. Fill line 1 greedily, like Instagram does (up to ~760px of text). Don't balance the two lines.
5. **Captions:** a white rounded box with bold black text, 2 to 4 words (22 characters max). Start a new caption at a sentence end or at a pause of 0.35s or more. Hide the caption during pauses of 0.6s or more. Strip full stops at the end and keep commas inside.
6. **Green highlights (#10D05D):**
   - "intellectualization" and "emotional resonance": on their own caption, in green, when he names the term ("called X") or says it as its own sentence. Other mentions stay black inside the normal caption.
   - "feeling": green only right after "DM" or "comment" (the CTA). Remove the comma Whisper puts between them ("DM feeling", not "DM, feeling"). Leave "the feeling finder" black.
7. **Render:** draw the captions as PIL PNGs of the caption strip only, then do a single ffmpeg overlay at y=240. Output 1080x1920, 30fps, H.264 with Intel Quick Sync (falls back to x264), AAC audio.
8. **Check before showing Olly:** compare frames of the hook, a normal caption, a green term and the CTA against `Final.mp4`. Then give Olly both file paths to watch on his phone.

## Rules and Constraints
- Style spec: Figtree (`reels\fonts\Figtree.ttf`) weight 850 at 66px. Box top y=289, box height 120, 24px side padding, corner radius 18. Text black; highlight #10D05D.
- Keep it human: the middle of the video is untouched. Olly edits only the start and the end himself, so the tool does the same.
- Match Olly's finished Reel, not a generic caption style. He has approved the current look ("absolutely perfect", 2026-11-04), so treat it as locked unless he asks for a change.
- Speed matters on this laptop (i5-10310U, Intel UHD graphics, no NVIDIA card). Overlay only the caption strip (full-frame overlay took ~6 min, the strip takes ~1m40) and use Quick Sync.
- Getting videos from the phone to the laptop goes over home Wi-Fi through an upload page on the laptop. The same page lists finished Reels with Save (to Photos) and Copy caption. Olly's iCloud is full, so iCloud is not used.
- Olly posts Instagram himself from the Edits app (split test: Edits vs normal posting). Later, GHL's social planner will post Shorts, Facebook and TikTok.
- Raw and finished videos, transcripts (`*.words.json`) and plans (`*.plan.json`) are kept out of git (the repo is public).

### Never
- Never cut silences, pauses, misspeaks or retakes from the middle of a Reel.
- Never state video specs without checking with ffprobe. The raw clip is 1080p 60fps HEVC recorded sideways (rotation flag), not 4K.
- Never use ffmpeg `drawtext` or `subtitles`/ASS on this PC: fontconfig is broken and drawtext crashes. Draw text with PIL.
- Never highlight every "feeling", only the CTA one after DM/comment.
- Never add a pass that needs a Claude call for each video. Per-video editing costs zero tokens.

## Examples
Olly's finished Reel, matched by the tool:
- Hook (0 to ~2.2s): "You don’t need a plan to / find your person ❤️"
- Captions: "Here's what you need" → "instead" → "If it's a massive" → …
- Named term: "...something called **intellectualization**." → caption is just "intellectualization" in green
- Later mention: "...struggling with intellectualization" → "with intellectualization" in black
- CTA: "or DM **feeling**" (feeling in green)

<!-- Changelog
2026-11-04: Created from the first build session. Lessons from Olly's feedback:
- He doesn't want silences or misspeaks removed ("keep it human"), so trimming is start/end only and that's in Never.
- He named the 3 highlight terms, so the highlight rules were added, and the comma before "feeling" is removed after the first test.
- First test: the hook dropped "You", so words before the trim point are clamped, not deleted. Text was smaller and lighter than his, so the font is now 66px weight 850. The hook line break differed from his, so line 1 is filled greedily like Instagram.
- He asked whether the clip was really 4K, which corrected a wrong claim. Now: check specs with ffprobe before stating them.
- His iCloud is full, so phone transfer goes over a home Wi-Fi page and finished Reels are saved to Photos from it.
- Speed: render went from 10m45 to ~1m40 (cached transcript, strip overlay, Quick Sync).
-->
