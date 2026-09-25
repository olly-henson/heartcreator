---
name: email-preview-artifact
description: Build the editable email-preview Artifact for any program/tool that sends emails through a Cloudflare Worker (Rewrite, Regulate, and future programs) — render the Worker's own templates, publish a viewer Olly can edit and save in, read his saved edits back, and apply them to the Worker
---

# Email Preview Artifact Skill

## Scope
Any program or tool that sends a fixed set of emails (signup confirmation, coach notification, scheduled check-ins) from a `*-checkin-worker.js` in `delivery/`. Olly reviews and rewrites the copy **in a published claude.ai Artifact**, then I copy his saved edits into the Worker. Read this before building a preview for a new program, and read `skills_cloudflare-workers.md` for the deploy side.

**Live artifacts (private, owner only):**

| Program | Artifact | Source file |
|---|---|---|
| Rewrite (30 days: check-ins day 10 + 20, completion day 30) | https://claude.ai/artifact/XE6ev4MY8whXzti4jETWpd | `../email-preview-artifact/rewrite-emails-artifact.html` |
| Regulate (7 days: check-in day 3, completion day 7) | https://claude.ai/artifact/UudKANQGDEdboN6rbNUguM | `../email-preview-artifact/regulate-emails-artifact.html` |

**Files (all in `delivery/email-preview-artifact/`):**
- `email-preview-template.html` — the generic viewer (tabs per email, editable subject + body, Save / Discard / Reset, "Links in this email" panel). Tokens: `{{PROGRAM}}`, `{{EMAIL_COUNT}}`, `{{PROGRAM_DAYS}}`, `{{START_LABEL}}`.
- `build-email-preview.mjs` — reads a Worker, renders every email with the Worker's own functions, fills the template. Usage is in its header comment.
- The two built `*-emails-artifact.html` files (what is actually published).

## Rules and Constraints

**Always render from the Worker's own template functions — never hand-copy email text into the viewer.** The builder imports the Worker's `confirmationEmailHtml`, `coachNotificationHtml`, `checkinEmailHtml`, `dateAtDaysOffset`, `formatDateLong`, so the preview can't drift from what sends. A new Worker must define those five top-level functions by those names. Subjects live inside `fetch()`, so they are passed to the builder as flags (`--confirm-subject`, `--final-subject`) — keep them in sync by hand and check them after every build.

**The preview must show the real link destinations, not just the link text.** Olly asked for this directly ("can I see the real links"). The viewer's "Links in this email" panel lists each link's text, its full address, and — where the address carries `?text=` — the message the share page will show. Never build or republish a viewer without it. The viewer can't show where a link *goes* in a real inbox, so this panel is the only place Olly can check the share/completion links before a test signup.

**Editing is saved in the Artifact `db`, one document per email (`emails/e0`…), not by republishing.** Declare `capabilities: {"db": {}}`. Publishing a fixed default from the file and letting saved documents override it means republishing never wipes his edits. **Never delete or overwrite an `emails/*` document without reading it first** — Olly's saved edits are the source of truth for the copy, not the Worker file.

**Compare HTML after normalising it through the browser, never as raw strings.** Real bug this session: the page assigned the default email HTML into a `contenteditable` element and compared `innerHTML` back against the original string. The browser rewrites HTML slightly (entities, whitespace), so every untouched email looked "edited", the "don't overwrite an unsaved draft" guard kicked in, and Olly's *saved* edits never displayed — he reported "you removed my changes I saved!?" when nothing was lost. The template's `norm()` helper (parse into a detached `div`, read `innerHTML`) fixes it. Keep it if the template is ever rewritten.

**A saved edit in the viewer overrides the default I republish — so before telling Olly a preview is up to date, list the `emails` docs.** Real miss (2026-09-24): Olly saved his own edit of the Regulate confirmation email in the viewer; afterwards he gave me further wording changes in chat ("…about attracting your person", "remove the groundwork line"). I applied those to the Worker and republished the *default*, but the viewer kept showing his older saved copy ("…confident - quickly.", groundwork line still there) — so he reported "the preview doesn't show this" three times. Fixes: (1) after ANY Worker copy change, `ArtifactData list` on `emails` before saying it's updated; (2) if a saved doc is older than his later chat instructions, chat wins — tell him what the saved copy contained, then delete the stale doc (or `set` it to the new text) so the viewer matches; (3) when a viewer edit and a later chat instruction touch the same sentence, apply both intentions and say which one you used. His own viewer wording (here "quickly") was replaced by the later explicit chat wording.

**When Olly says saved edits vanished, read the db before answering.** `ArtifactData` `list` on `emails` shows what is really stored (I confirmed his edits were intact, then found the page bug). Don't assume data loss, and don't reassure without checking.

**Give the builder the real check-in days.** `--checkins N` assumes even 10-day spacing; for any other schedule use `--checkin-days 3,7` (the last day is the completion email, labelled "Completion" in the tab). The header line ("7 days, check-ins on days 3 and 7") and email count are generated from the flags, so a wrong flag shows straight away — read it back after building. Regulate: `--days 7 --checkin-days 3,7`.

**Leave the merge fields alone when editing.** The preview shows sample values ("Olly", 24 Sep dates). Olly's saved HTML therefore contains the *sample* name and dates. When applying his edit to the Worker, turn them back into `${firstName(name)}`, `${startDateText}`, `${endDateText}` — and check the *plain-text fallback* in `fetch()` and the subject line too, not just the HTML function. The viewer's note tells him to leave them as they appear.

**Apply saved edits with exact string edits, then rebuild.** Read the saved docs (`ArtifactData` `list`, optionally with `out_dir` to a scratchpad folder), edit the Worker with the Edit tool, re-run the builder, republish the same artifact URL. Republish automatically after edits once a preview URL exists (Olly's standing preference) — but a Worker edit is still **not live until he redeploys it**; say so every time.

**Building for a new program:** copy the pattern — (1) the Worker exists and defines the five functions; (2) run the builder with the program's flags; (3) publish once **without** `url` and with `capabilities {"db":{}}` and `icon` ("email"); (4) add the new row to the table above. Never publish a second program's viewer over the first one's URL.

## Never

- **Never** hand-write or paste email HTML into the viewer — build it from the Worker.
- **Never** republish a viewer that drops the "Links in this email" panel.
- **Never** clear, reset or overwrite a saved `emails/*` document without reading it and telling Olly.
- **Never** compare `contenteditable` HTML to a raw string without normalising both sides.
- **Never** write temp files to the general Windows temp folder or anywhere outside `AI OS/` — use the session scratchpad, or (as the builder does) a `data:` URL import so no temp file exists. This session I dropped helper `.mjs` files in `%TEMP%` (outside `AI OS/`), then had to tell Olly and delete them.
- **Never** run shell heredocs that contain backslashes or escapes to write files (`’`, `\\`, regexes) — this shell mangled them twice. Use the Write/Edit tools for file content.
- **Never** treat the preview as proof the live emails are right — it renders the local file. A real test signup after redeploying is the check.

## Process / Steps

1. Confirm the Worker file defines the five template functions. If not, refactor minimally (extract functions) before building.
2. `cd delivery` and run `node email-preview-artifact/build-email-preview.mjs …` (flags in the script header). Confirm the output line reports the expected email count.
3. Publish: first time = new artifact with `capabilities {"db":{}}` + `icon`; afterwards republish to the stored URL. Give Olly the link.
4. Olly edits and saves in the viewer. When he says he's done, `ArtifactData` `list` `emails` for the artifact URL and read every doc.
5. Apply his edits to the Worker (HTML function, plain-text fallback, subject), restoring merge fields. `node --check` the Worker.
6. Rebuild + republish the viewer. State the Worker file path, and that it is **not live until redeployed**.
7. After Olly redeploys, `curl` the Worker (see `skills_cloudflare-workers.md`), then do one real test signup and check the links from the inbox.

## Examples

**The Rewrite check-in set (30 days since 2026-09-25; build with `--days 30 --checkin-days 10,20,30`):** 2 signup emails + 3 check-ins = 5 tabs. Day 10 and 20 check-ins link "here" to `share.ollyhenson.com/?type=checkin&text=Rewrite Meditation, Day N Update: ` (an editable box, pre-filled); the day 30 completion links "here" to `?type=checkin&text=Just completed the Rewrite Meditation and ready to start the Rehearse Meditation!`. When the length changed, Olly's saved docs for the removed emails were deleted after reading (slot e4 would otherwise have overridden the new completion email — saved docs are keyed by position, not by day). The panel shows each of these.

**Bare share messages beat clever ones.** Olly deleted two drafted additions ("🎉 60 days of rewriting the core beliefs that were holding me back in love." and "Ready for The Rehearse Meditation next.") leaving just "I've just completed The Rewrite Meditation!". Model any pre-written share text on that: a plain first-person fact.

---

## Changelog

**2026-09-25 — Rewrite viewer rebuilt for 30 days**
- Rebuilt with `--days 30 --checkin-days 10,20,30` (5 tabs). Olly's 3 saved docs were read, then deleted: e0 was already in the Worker; e4 ("halfway 30 in") would have **overridden the new Day 30 completion tab** because saved docs are keyed by position, not by day; e6 (day 50) no longer exists. His e6 line "just 10 days left" was reused for the new day-20 email. **Rule: after any change to the number/order of emails, list the db and clear or remap every saved doc whose index now points at a different email.**
- The Artifact publish was refused once (live version not yet viewed). The live page held no one's edits (edits live in the db), so read it, then republish.

**2026-09-24 (later still) — Preview kept showing old wording**
- Olly: "Can you update the preview artifact to show this please" / "preview of the emails not the html" — the viewer showed his own older saved edit of email 1, which overrode my republished default. Cleared the stale saved doc after reading it; added the "list the db before claiming it's updated" rule above.
- Also: I misread "update the preview artifact" as the start-page HTML and built a start-page preview instead. When he says "preview" during email work he means the email viewer — check the db and republish that first.

**2026-09-24 (later) — Regulate moved to 7 days**
- Builder generalised: `--checkin-days` for irregular schedules; the viewer header said "a check-in every 10 days" for a 7-day program until I caught it in the built file — the template now takes `{{CHECKIN_LIST}}`. **Lesson: read the generated header/tab list back after every build**, don't trust that a flag change flowed through.
- Regulate viewer is now 4 emails; the final tab is labelled "Completion" (the Rewrite viewer's last tab changed from "Check-in 6" to "Completion" too).
- The old static `regulate-email-preview.html` is stale and superseded by the viewer.

**2026-09-24 — Created (Rewrite + Regulate check-in previews)**
- Built the editable preview viewer, generic template and builder from a session that produced the Rewrite 60-day check-in system and mirrored it to Regulate.
- Lessons captured from Olly's corrections: show real link addresses (his request); saved edits "disappearing" was a page bug from un-normalised HTML comparison (his report, verified against the db); share text should be a bare fact (he cut two additions); email body copy must come from Olly, not from me (he rewrote the confirmation body wholesale).
- Self-caught: temp files written outside `AI OS/` (deleted), and shell-escape mangling → Write tool for file content.
