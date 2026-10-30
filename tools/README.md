# tools: reusable helpers (built 2026-10-28 to save tokens)

Use these instead of writing one-off scripts. All run from Git Bash.

| Tool | What it does | Command |
|---|---|---|
| `patch.py` | Safe find-and-replace (all or nothing, keeps CRLF/LF, never half-writes) | `python tools/patch.py FILE edits.json` (edits = `[["old","new"],...]`, write edits.json in the scratchpad with the Write tool) |
| `jscheck.js` | Syntax-check every inline script in an HTML file | `node tools/jscheck.js FILE.html` |
| `deploy-hub.sh` | Check + deploy the Business Hub (hub.ollyhenson.com) | `bash tools/deploy-hub.sh` |
| `preview_wrap.py` | Desktop + phone preview page for any funnel page (webhooks blanked, thumbnails embedded) | `python tools/preview_wrap.py PAGE.html OUT.html "Title"`, then publish OUT.html as an Artifact |
| `shot.js` | Screenshot a page at several widths, report overflow and errors (outside requests blocked) | `node tools/shot.js PAGE OUTPREFIX 1280,390` |

Paths: `tools/` = `C:\Users\Olly\AI OS\heartattractor\tools\`.

Content generator testing: its images live in `marketing/cig-assets/`, so open it over http, not file://
(`python -m http.server 8765` in `marketing/`, run in the background), then `node tools/shot.js http://127.0.0.1:8765/consciousness-level-checker.html ...`.
Publish it with `root` = marketing folder and `files` = every `cig-assets/*` file.

Gotcha (2026-10-28): backslashes in heredoc/JSON edit files can get eaten on the way in (a backslash-n became a real line break, a regex backslash-slash lost its backslash). For edits containing backslashes, use the Edit tool or Artifact `edits`, then run jscheck.

Generator gotcha (2026-10-28): code near the top of the main script that runs at load must not use a const/let declared further down (it throws and stops the whole page). hubUrl() is a function for that reason. Local http.server serves without a charset, so non-ASCII looks mangled in tests only.

Gotcha (2026-10-29): a heredoc Python edit with \u escapes failed mid-write (surrogates) and EMPTIED the generator file. For in-place Python edits, write the script with the Write tool, use raw strings, and save to a .tmp file then os.replace(). Restore source if it happens: Artifact read of the live version, then drop line 1 and the last 2 lines.
