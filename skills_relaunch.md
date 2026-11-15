# Skill: Relaunch Everything

**Trigger:** Olly says "relaunch", "rebuild everything", "something's been wiped", or an outage has knocked tools offline and data is missing.
**Made:** 2026-11-13. **Backups made by:** `tools/backup_everything.py` → `backups/<date>/` (git-ignored, private).

Work like a PA in an emergency: calm, one step at a time, one click per message when Olly is in a UI ([[feedback_one_action_per_step]]). Fix the money path first, check each thing is live before moving on, and keep a running list in `NEXT.md` of what's restored and what's left.

---

## Step 0: Find out what's actually gone (do this before touching anything)

Never rebuild something that's still there. Run these checks and give Olly a short table: ✅ fine / ❌ gone / ⚠ partly.

| Check | How |
|---|---|
| Local folder | `C:\Users\Olly\AI OS\heartattractor` exists, `git log -1` works |
| GitHub | `git fetch` (repo `olly-henson/heartcreator`) |
| Latest backup | newest folder in `backups/` with a `DONE.txt`. Say its date: anything after it is lost unless it's still in a tool. |
| Website pages | `curl -s -o /dev/null -w "%{http_code}"` on ollyhenson.com/feeling, /attract, /training, /apply, /plan, /join |
| Short links | `curl -sI ollyhenson.com/feeling-ig` → 301 |
| GHL data | contacts count, tags, workflows, templates (same calls as `backup_everything.py`) vs the backup's counts |
| Business Hub | hub.ollyhenson.com loads, `wrangler kv key list` count vs `backups/<date>/hub/kv.json` |
| Plans | `curl` one share link from a Sales card (hub.ollyhenson.com/p/<code>/pages) |
| Workers | the delivery Workers (see `delivery/skills/skills_cloudflare-workers.md`), curl each |
| ManyChat, Skool, YouTube, Instagram, Notion | Olly checks by eye (no API from here) |

**Before restoring, run a fresh backup** of whatever survived (`python tools/backup_everything.py`), so a rebuild can't overwrite the only good copy.

---

## Restore order (money path first)

### 1. The laptop and API keys
- If `marketing/.env` is missing: copy it back from `backups/<date>/env-backup.txt` (or Olly's off-laptop copy).
- If keys were revoked in an outage, Olly makes new ones (GHL private integration token, Resend, Google). Placeholders only in anything committed ([[feedback_api_keys]]).
- Claude's memory: copy `backups/<date>/claude-memory/` back to `C:\Users\Olly\.claude\projects\C--Users-Olly\memory\`.
- `wrangler login` if Cloudflare asks.

### 2. GitHub (only if the repo is gone)
The laptop has the full history. Olly makes an empty repo on GitHub, then:
`git remote set-url origin <new url>` → `git push --all origin` → `git push --tags origin`.
Remember: the repo is public, so `backups/`, `funnel/applicant-guides/` and everything in `.gitignore` stays off it. Never force-add those.

### 3. Join link + application page (people can still buy)
- `ollyhenson.com/join` → Skool (`www.skool.com/heartcreator`). Recreate with `bash tools/ghl-redirect.sh /join "<target>"`.
- Application page: `funnel/sections/heart-attractor-application-steps.html` → GHL page ollyhenson.com/apply. Olly pastes it into one Custom HTML block ([[feedback_ghl_funnel_builder]]).

### 4. GHL settings that everything else depends on
In this order (workflows and pages break without them):
1. **Tags**: recreate from `backups/<date>/ghl/tags.json` via API (`POST /locations/{loc}/tags`).
2. **Custom fields + custom values**: from `custom-fields.json` / `custom-values.json` via API. Keep the same names and keys, since pages and the Hub read them by key.
3. **Short links**: loop `redirects.json` through `tools/ghl-redirect.sh` (skips ones that already exist).
4. **Contacts**: re-import from `contacts.json`. Write a CSV (name, email, phone, tags, custom fields) and Olly imports it in GHL (Contacts → Import), or upsert via API in batches. Keep tags exactly, because the lists and the Hub run off them. People tagged `removed - not a fit` stay removed.
5. **Email templates**: recreate from `email-templates/*.html` (the `make_weekly_templates.py` pattern: POST `/emails/builder`, then `/emails/builder/data`). Copy files in `marketing/email-sequences/` are the text source.

### 5. Funnel pages (lead magnets + application)
Each page is one Custom HTML block pasted from a local file. Source map (full detail in `funnel/CLAUDE.md` and `funnel/skills/skills_new-lead-magnet.md`):

| Page | Local file |
|---|---|
| /feeling (main lead magnet, A/B) | `funnel/sections/feeling-finder.html` + `feeling-finder-image-variant.html` |
| /attract | `funnel/sections/scientifically-attract-optin.html` |
| /training | `funnel/sections/emotional-resonance-optin.html` |
| /scale (retired, keep live) | `funnel/sections/emotional-scale-check.html` |
| /apply | `funnel/sections/heart-attractor-application-steps.html` |
| /plan (DM plan request) | `funnel/sections/plan-request.html` |
| thank-you pages | `funnel/sections/thank-you.html`, `application-thank-you.html`, `youre-all-set.html` |
| privacy / terms | ⚠ NO local copy (only in GHL). Save them: Olly copies each page's text into `funnel/sections/privacy-policy.html` / `terms.html` |
| Homepage | `website/` (read `website/CLAUDE.md`) |

Page URLs must stay the same: every short link, bio and video description points at them. After each paste: test the form end to end with a test contact, then delete the test contact.

### 6. GHL workflows
The API can't export workflow steps, so the backup has the **names and status only** (`workflows.json`, 21 of them on 2026-11-13). Rebuild each with the **GHL AI workflow builder prompt first** ([[feedback_ghl_workflow_building]]): tags must exist first, emails are the pre-built templates, From = Olly Henson. Where each one is described:

| Workflow | Described in |
|---|---|
| Feeling Finder | `funnel/CLAUDE.md`, `funnel/skills/skills_new-lead-magnet.md` |
| Scientifically Attract Training Opt-in | same + `marketing/email-sequences/scientifically-attract-training-welcome.md` |
| Emotional Resonance Training Opt-in, Emotional Scale Check | `funnel/skills/skills_new-lead-magnet.md` |
| Plan Of Action Requests | `funnel/skills/skills_dm-plan-setting.md` |
| Heart Attractor Applications | `funnel/CLAUDE.md`, `funnel/skills/skills_attribution.md` |
| Email engagement, Engaged timers, Unsubscribe | `marketing/skills/skills_email-creation.md` |
| Others (welcome, dates, autoresponders) | grep the name across the repo; if nothing, ask Olly what it did |

Olly builds, then publishes. Test each with a test contact before moving on.

### 7. Business Hub (hub.ollyhenson.com)
- **Code**: `bash tools/deploy-hub.sh` (needs the Pages project `hub-ollyhenson` + KV namespace bound as `HUB_KV`; see `business management/business hub/hub-site/DEPLOY.md` if the project itself is gone, then put the new namespace id in `wrangler.toml`, `tools/build_plan_v4.py` and `tools/backup_everything.py`).
- **Secrets**: Pages secret `REELS_KEY` = contents of `reels/.hubkey`; others listed in `DEPLOY.md`.
- **Cloudflare Access** in front of the Hub (Olly's email only).
- **Data**: write a small restore script. `hub/kv.json` → `wrangler kv bulk put` (a JSON array of `{key, value}`), and each `backups/kv-images/<key with __ for :>.bin` → `wrangler kv key put <key> --path <file>`. Restore only keys that are missing, never overwrite newer live data.
- Check: Hub loads, Sales cards show, a plan link (`/p/<code>`) shows its pages.

### 8. Personal plans
Saved plan images come back with the Hub data (step 7). If they're gone too: each plan's spec lives in `funnel/applicant-guides/<first-last>/spec.json`. Rebuild with `python tools/build_plan_v4.py <spec> <out> --upload` (skill: `funnel/skills/skills_plan-v4.md`). Share codes change when re-uploaded, so tell Olly which people have new links.

### 9. Delivery Workers (member emails)
Each `delivery/*-worker.js` is pasted into its Cloudflare Worker. Follow `delivery/skills/skills_cloudflare-workers.md`: name every Worker three ways, deploy one at a time, curl each. Secrets (Resend key etc.) re-added in the dashboard.

### 10. ManyChat (FEELING, VIDEO, SCALE keywords, plan check-in)
No export. Rebuild from memory `project_manychat.md` and `funnel/skills/skills_dm-plan-setting.md`. Until it's back, Olly sends links by hand: ollyhenson.com/feeling-dm.

### 11. Content system
- Reel uploader: `reels/Start Reel Upload.bat` (skill `reels/skills_reel-editor.md`). Raw videos are local only.
- Content generator: `marketing/consciousness-level-checker.html` (republish as an artifact if the link is gone).
- Notion: database IDs are in `marketing/.env`; content history lives there. If Notion is wiped, the Hub calendars (step 7) are the record that matters now.
- Skool classroom: videos in `delivery/classroom videos/`, trainings listed in memory `project_classroom_v6_trainings.md`.

### 12. Finish
- Fresh backup: `python tools/backup_everything.py`.
- Update `NEXT.md` with what was restored, what changed (new links, new keys) and anything still missing.
- Tell Olly in plain English what's live, what's tested and what he still has to do by hand.

---

## Keeping the backups useful
- **Weekly:** run `python tools/backup_everything.py` (about 3 minutes; images only download once). Old dated folders can be deleted after a month, but keep `kv-images/`.
- **Off the laptop:** the backup only protects against the cloud being wiped. If the laptop dies too, it's gone. Copy `backups/`, `funnel/applicant-guides/` and the raw media folders to somewhere off the laptop (Olly to choose: OneDrive, Google Drive or an external drive).
- **What the backup can't capture:** GHL workflow steps, GHL page settings (SEO, tracking code), ManyChat flows, Skool, YouTube/Instagram. Those rebuild from the files named above. If Olly's GHL plan offers **Snapshots** (an agency feature, check before claiming it), a snapshot of the sub-account saves workflows, pages and templates in one go and is the best extra protection.
- When a new page, workflow or tool is built, add it to the tables above.

<!-- Changelog
2026-11-13: created at Olly's request ("a skills file called something like relaunch… it could guide me through the process"), with tools/backup_everything.py and the first backup.
2026-11-15 skill review: no corrections from Olly yet. -->
