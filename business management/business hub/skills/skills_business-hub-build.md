# Skill: Building & Editing the Business Hub

Read this before making any change to the Business Hub Artifact. It covers the workflow, the data model, house conventions, and every gotcha this project has already hit once — don't rediscover them the hard way.

---

## 1. The golden rule: always re-read before editing

The Business Hub is a **live, self-publishing Artifact**. Olly interacts with it directly (ticking checkboxes, typing captions, adding rows) on his phone or desktop, and it saves its own state back via `artifact.publish()` every time he clicks the in-page Save button. That means:

- Your local copy of `community-tracker.html` is stale the moment anyone (including Olly) touches the live page.
- **Never publish from memory or from an old local file.** Always re-read the live artifact first.
- A `task-notification` of type `artifact-changed` means the live version moved — treat it as informational, no action needed until you're about to edit.

### The standard workflow, every single time

1. **Read the live artifact:**
   ```
   Artifact(action: "read", url: "https://claude.ai/code/artifact/3f07b448-9564-42ca-a274-530f0d982c02")
   ```
   This saves the full HTML to a tool-results file and tells you its path.

2. **Extract it into the local working file** (the read result gives you the exact snapshot filename):
   ```bash
   node <<'EOF'
   const fs = require('fs');
   const data = fs.readFileSync('<snapshot-file-from-step-1>','utf8');
   const idx = data.indexOf('<title>Business Hub');
   fs.writeFileSync(String.raw`C:\Users\Olly\AI OS\heartattractor\marketing\community-tracker.html`, data.slice(idx));
   EOF
   ```
   The snapshot file has frame-runtime boilerplate before the real content — `<title>Business Hub` is always the start of the actual page.

3. **Make your edits** with `Edit`/`Read` on the local file as normal.

4. **Syntax-check the script before publishing** (catches typos that would silently break the whole page):
   ```bash
   node -e "
   const fs=require('fs');
   const html=fs.readFileSync('community-tracker.html','utf8');
   const start = html.indexOf('(function(){');
   const end = html.lastIndexOf('})();');
   fs.writeFileSync('extracted_check.js', html.slice(start, end+5));
   "
   node --check extracted_check.js && echo OK
   rm -f extracted_check.js
   ```

5. **Publish:**
   ```
   Artifact(action: "publish", file_path: "...\community-tracker.html", url: "https://claude.ai/code/artifact/3f07b448-9564-42ca-a274-530f0d982c02", note: "<what changed>")
   ```

### If publish is refused with a "newer version" conflict

This happens often — Olly is frequently mid-interaction with the page. The error hands you the exact snapshot filename that's now live. **Do not force-publish.** Instead:

1. Extract that newer snapshot into the local file (same node script as step 2 above, new filename).
2. Re-apply your intended edits on top of it — grep first to check whether your change is already there (sometimes a previous publish attempt did land).
3. Publish again. Repeat if it conflicts again — this can chain 3-4 times in a row during an active session.

---

## 2. File structure

`community-tracker.html` has **no `<!doctype>/<html>/<head>/<body>`** — the Artifact tool wraps it automatically. The file is:

1. `<title>Business Hub</title>` + a few `<meta>` tags (PWA/Add-to-Home-Screen support) + Google Fonts `<link>`s
2. One big `<style>` block (all CSS, custom-property design tokens in `:root`)
3. All HTML markup for the five tabs (`#tab-mrr` "MRR", `#tab-content` "Content", `#tab-instagram` "Instagram", `#tab-email` "Email", `#tab-delivery` "Delivery"), plus the day-detail modal markup near the end. Instagram/Email are a display-only split off Content's shared `state.content.rows` — see §3.
4. A `<script type="application/json" id="state-data">` block — this is the actual saved data, embedded so the page boots with it
5. One large `<script>(function(){ ... })();` IIFE — all state, render, and event-handling logic

---

## 3. Data model

```js
state = {
  mrrTarget: 40000,
  rows: [ { month, visits, trials, newMembers, lost, activeMembers, price, locked } ], // emailLeads: legacy field, see note below
  content: {
    rows: [ { month, igFollowers, emailList, locked } ],
    outliers: [ { title, month, views, likes, comments, shares, saves, communityComments, saved } ],
    ideas: [ { title, date, mode, synced, posted, caption } ],
    captionTemplates: [ { name, text } ]
  },
  delivery: {
    projects: [ { title, urgent, important, done } ]
  }
}
```

Notes on fields that aren't obvious:

- **`rows[].emailLeads`** — legacy field (quiz-funnel lead count, unrelated to the Email tab's `content.rows[].emailList`). Removed from every render path 2026-09-06 per Olly's request; still present untouched in old rows in the saved `state-data` JSON, but no code reads it any more. Don't reintroduce it into any render path without Olly explicitly asking for it back.
- **`rows[].price` / cohort MRR** — MRR is NOT `activeMembers × price`. It's a running-total cohort calculation in `computeRows()`: each row's `newMembers * price` adds to the running total; `lost` members are removed at the average revenue-per-member at that point. This correctly handles the Aug 2026 price change ($30→$99) with grandfathered existing members. Never simplify this back to a naive multiplication.
- **`ideas[].mode`** — `"auto"` (date auto-assigned to the next slot with capacity, date input disabled) or `"specific"` (user picks the date manually). Toggled via two checkboxes styled as radios in the Video ideas table.
- **`ideas[].synced`** — internal bookkeeping for `syncIdeaToOutliers()`, not meaningful on its own.
- **`ideas[].posted`** — boolean, but the UI presents it as a **Draft / Published** status toggle (two pill buttons, `.statusbtn.draft` / `.statusbtn.published`) in the calendar day-detail modal, not a checkbox. `true` = Published = the *only* thing that adds a video to `content.outliers` (Video stats tracking) — see `syncIdeaToOutliers()`. Switching back to Draft removes it again (with a confirm if the linked outlier already has real stats logged — see `removeIdeaFromOutliers()`). Also drives the small coloured status dot on each calendar month-view item (amber = Draft, green = Published) — see `.calitem-dot` and the `renderCalendar()` item-building code.
- **`ideas[].caption`** — per-video caption override. Empty by default. A caption template just fills this in as a starting point when tapped (`idea.caption = tpl.text`) — there's no ongoing link back to the template.
- **`outliers[].saved`** — controls whether a video appears on the Leaderboard. Set via the "Save" button (first column of Video stats tracking). Leaderboard = all `saved` outliers ranked 1–N, not a top-10 cut.
- **Video ideas list visibility** — an idea disappears from the Video ideas table once it has **both** a title and a date (`isIdeaPlaced()`), because at that point it's showing on the calendar instead. It's still fully in `state.content.ideas`, just filtered out of that particular table's render. **Once placed, the calendar day-detail modal is the only place left to delete it** — there's a ✕ next to the title there (matches `.rowdel-btn` styling). Deleting only removes the calendar/ideas entry — a linked Video stats tracking row (if the idea was ever Published) is left alone on purpose, since real logged stats shouldn't vanish just because the scheduling entry did.
- **Video stats tracking "Date" column** — not stored on the outlier itself. It's looked up live by title-match against `state.content.ideas` (`scheduledDateForTitle()`), so moving a video's date in the calendar updates this automatically with no extra sync step.
- **Renaming a video's title** — since idea↔outlier linkage is title-match only, a rename from *any* editable title field (calendar day panel, Leaderboard, or Video stats tracking itself) must go through `renameVideoTitle(oldTitle, newTitle)`, which updates every matching idea and outlier at once. Never just overwrite `.title` directly on one side — that orphans the link (Date column stops resolving, a duplicate row can get created next sync).
- **Video stats tracking's Month AND Date columns are both sortable** — click either to cycle old→new / new→old / insertion order (`outlierSortKey`, `outlierSortDir`, `outlierSortedIndices()`). Sorting only ever changes *display* order via a computed array of indices — `data-oi` on each row still points at the video's real index in `state.content.outliers`, so editing/saving/deleting a row while sorted still targets the right object. Any UI that reorders rows for display without moving the underlying array should follow this same pattern rather than physically re-sorting `state` (which would need every other title-matched/index-matched reference kept in sync too). Date sorts by the same live calendar lookup as the Date column itself (`scheduledDateForTitle()`), not a stored value.
- **The Leaderboard also has a sortable Date column** (`leaderSortBy === "date"` in `leaderMetricValue()`) — same live calendar lookup, sorts newest-first, videos with no calendar match sort to 0/last.
- **Gotcha already hit once:** the leaderboard's generic sortable-header wiring (`document.querySelectorAll("th.sortable")`) originally caught Video stats tracking's Month/Date headers too, since they share the same `sortable` CSS class for styling. Fixed by scoping every leaderboard-only `th.sortable` query to `th.sortable[data-sortkey]` — only the leaderboard's own headers carry `data-sortkey`. Any new sortable column anywhere in the page needs to respect this scoping (either give it `data-sortkey` if it belongs to the leaderboard's shared sort system, or keep it out of that selector entirely like the outlier headers).

---

## 4. House conventions (follow these, don't reinvent)

### Never

- Never add autosave or auto-publish-on-change anywhere — every input just calls `markDirty()`, publishing is manual only.
- Never hide, relocate, or auto-advance a row on `blur`/`input` of the very field the user is actively typing into — wait for a deliberate commit point instead.
- Never let a `<table>` cell's input/textarea inherit a font-size under 16px without a mobile override — iOS Safari zooms the page on focus.
- Never reuse a CSS class name without `grep`-ing the file for it first.
- Never ship a table that can scroll horizontally without pinning its delete/action column with `position:sticky`.
- Never let an empty-state row's `colspan` drift from the real column count.
- Never physically re-sort a `state` array to change display order — sort a computed array of indices instead (see `outlierSortedIndices()`), so every index-based or title-matched reference elsewhere keeps working.
- Never assume a field exists on previously-saved data — guard every new field in `boot()`.
- Never model a real two-way workflow state (e.g. draft vs published, the thing that gates whether a row appears somewhere else) as a bare checkbox once it means something to the user — see "Design principles" below.
- Never mutate an element's own text/`disabled` state as "in-progress" feedback (e.g. a Save button showing "Saving…") *before* calling `saveNow()`/`buildDoc()` in the same synchronous tick — `buildDoc()` snapshots `document.body.innerHTML` synchronously, so whatever the DOM looks like at that instant gets published as the page's own resting HTML. Defer any such feedback with `setTimeout(fn, 0)` so it lands strictly after that snapshot, and put transient text in a separate sibling element rather than the button's own label — see the day-modal Save button fix, 2026-09-06.
- Never delete a real logged data field wholesale just because Olly asked to remove it from a *view*. "Remove X from the MRR Tracker page" means strip it from every render path (KPI cards, table columns, glossary) — it does not mean touch the saved `state-data` JSON. Historic numbers already logged stay in storage, untouched, even though nothing displays them any more.

### Design principles from past corrections

- **A binary state that gates a real transition needs an explicit, labeled control — not a plain checkbox.** The calendar's posted/not-posted tick started as a checkbox; once "ticked" started meaning "this video is now live and enters Video stats tracking," Olly asked for it to become an explicit **Draft / Published** toggle (`.statusbtn.draft` / `.statusbtn.published`) so the state reads as a real status, not an editing convenience. Apply this test up front for any new boolean: if flipping it does something consequential elsewhere in the app (adds a row, sends something, changes what's visible), give it a named control, don't default to a checkbox.
- **A free-text field holding reusable content needs a name/identifier as soon as there's more than one instance.** Caption templates were first built as a single "default caption" textarea; once Olly wanted several (QUIZ, COMMUNITY, etc.) each needed its own `name` field so they could be told apart in the quick-pick chips. When building any list of reusable snippets/presets, add the identifier field from the start rather than waiting for "I need more than one of these."
- **New tables/lists should assume they'll outgrow the screen.** Delete-button reachability (sticky column) and mobile input font-size weren't designed in up front — both were fixed reactively after Olly hit them. Any new editable table should get `position:sticky` on its action column and 16px mobile input font-size at build time, not as a follow-up fix.
- **A toggle/sort control with only two real-world meaningful states shouldn't grow a third "neutral" state by default.** Video stats tracking's Date column originally cycled asc → desc → unsorted, copying the generic 3-state pattern used for Month. But a date only ever means "newest first" or "oldest first" to Olly — there's no meaningful "unsorted by date" — so he asked for the third state removed entirely (2026-09-06). When adding a sort/toggle, check what the control actually represents before defaulting to the codebase's generic cycling pattern; a genuinely binary concept (newest/oldest, on/off, draft/published) should be a strict two-state toggle, not a 3-state cycle borrowed from somewhere else in the file.
- **Per-viewer UI convenience state (which tab, which calendar month, scroll position) is never part of the published business data.** It goes in its own separate `localStorage` key (`uiSave()`/`uiLoad()`, key `heart-attractor-community-tracker-ui`), never mixed into `state`/`localSave()`/`buildDoc()`. The two must stay structurally separate: one gets published and shared with every viewer, the other is local-only and meaningless to anyone else who opens the link.

- **No autosave, ever.** Every input handler calls `markDirty()` (just flips a local "unsaved" indicator) — nothing publishes until the user clicks the in-page Save button, which calls `saveNow()`. This was a deliberate fix for a real data-loss bug (concurrent publishes silently overwriting each other). Don't add auto-publish-on-change anywhere.
- **Incremental table rendering, not full rebuild-on-every-keystroke.** Tables track a `xTableBuiltForCount` variable; the render function only tears down and rebuilds `<tbody>` rows when the row *count* changes, otherwise it just patches specific calculated cells (`querySelector('[data-xcalc]')`). This exists because a full rebuild on every input event was yanking keyboard focus out from under the user mid-type. Follow this pattern for any new editable table.
- **Number inputs use the `"input"` event, not `"change"`** — `"change"` doesn't fire until blur, which reads as unresponsive. Text fields that trigger something consequential on every keystroke (like the old caption-sync bug, see §5) should use `"blur"` instead of `"input"` for the consequential action, while still using `"input"` for just updating the stored value live.
- **`var` inside a `for` loop that creates closures (e.g. calendar cells) is a real bug, not just style.** All 42 cells would share the same closed-over date. Use `let` for any loop variable captured by an event listener created inside that loop.
- **Sync/link functions should be idempotent and dedupe by a stable key** (currently title-matching, since there's no id system on ideas/outliers). Calling `syncIdeaToOutliers(idea)` twice must never create a duplicate row.
- **Migrations belong in `boot()`, guarded with `if (x === undefined)`.** Never assume a field exists on data saved before that field was added.

---

## 5. Known pitfalls (already hit once — don't repeat)

- **Syncing on every keystroke instead of on blur/commit.** Early version of the idea→outliers sync fired on the very first character typed, copied that single letter across, then marked the idea "synced" so the rest of the typed title never made it over. Any "do X once field Y is filled in" logic must wait for a natural commit point (blur, change, or an explicit action like ticking posted) — never `input`.
- **CSS class name collisions.** `.savebtn` was reused for both the global page Save button and a new per-row video Save button — the second definition silently overrode the first, breaking the *main* Save button's look. Before naming a new class, `grep` the file for it first. When in doubt, prefix scoped classes (`vidsavebtn`, `capttpl-name`, etc.).
- **Sticky columns need `min-width:0`.** A flex/grid item containing unbreakable text (e.g. a long video title in a calendar cell) will force its container wider than its grid track unless the item and its ancestors have `min-width:0`. Grid tracks should use `minmax(0,1fr)`, not bare `1fr`, wherever cell content might overflow.
- **Wide tables bury the delete button off-screen.** Any table that can grow past viewport width needs its delete/action column pinned with `position:sticky; right:0` (see `.rowdel` in this file) — otherwise the affordance exists but nobody can reach it without knowing to scroll right.
- **`colspan` on empty-state rows must be kept in sync** with the real column count — it silently breaks alignment (not a crash) whenever a column is added or removed. Grep for `colspan="N"` after any column change.
- **True native app packaging isn't possible from an Artifact.** The closest equivalent is PWA-style `<meta name="apple-mobile-web-app-capable">` etc. plus telling the user to "Add to Home Screen" from their mobile browser — set expectations accordingly if asked for "an app."
- **Hiding a row on `blur` is not safe on mobile.** The Video ideas list hid a row (moved it to "lives on the calendar only") as soon as its title input lost focus and a date was already set. On mobile a longer title makes an accidental blur far more likely — autocorrect suggestion tap, keyboard "next", a stray scroll — so the row would vanish mid-type and read as data loss. Fix: only re-filter/hide rows at a deliberate transition point (adding another row, an explicit date/mode change) — never on blur of the field the user is actively typing into.
- **Any input/textarea inside a table inherits the table's font-size — check it's ≥16px on mobile.** Table body text in this app is 13.5px for density; iOS Safari auto-zooms the whole page when an input under 16px gets focus, which makes typing into a table cell feel broken/fiddly on a phone. Fixed with `input, textarea, select{ font-size:16px !important; }` inside the `@media (max-width:640px)` block — keep that rule if the table styling changes.
- **"I need to see the whole title" means immediately, not on click.** The first attempt at fixing Video stats tracking's truncated titles made the `<input>` expand-on-focus (overlay the row when clicked). Olly's actual ask was to see every title at a glance without interacting with anything — a single-line `<input>` can never do that (inputs don't wrap), so the real fix was switching to an auto-height wrapping `<textarea>`. When "I can't see X" comes up for text truncated inside a fixed-width single-line field, check whether the ask is "let me reveal it on demand" or "show it by default" before picking a fix — they need different elements (input+interaction vs. textarea+auto-height).
- **A `<select>`'s default-selected `<option>` in saved/static HTML is meaningless — never read `sel.value` to decide a default on first load.** Both Content's month dropdown and MRR Tracker's Month/Year dropdown (`renderPeriodPicker()`) had the exact same bug: they were supposed to default to the real current period, but kept defaulting to whichever option was first in the saved markup instead. Root cause: the code read `sel.value` (the raw DOM's currently-selected option, which has no `selected` attribute in the saved file and so is just "whatever option happened to render first") as if it were the user's actual choice, and that took priority over the real-current-period check. Fix, applied identically in both places: key any "what's currently selected" logic off a tracked JS variable (`contentSelectedMonth`, `selectedPeriod`) that starts genuinely empty, never off `sel.value`, when a default needs to reflect something computed (today's date) rather than the last explicit user action. **Any future period/month/year picker in this app must follow this same pattern from the start** — this bug has now recurred twice.

---

## 6. Quick reference — where things are in the code

| Feature | Key functions |
|---|---|
| MRR cohort calculation | `computeRows()` |
| Monthly/Yearly/All-time aggregation | `aggregatePeriod()` |
| Content calendar | `renderCalendar()`, `findNextAvailableDate()`, `isoDate()` |
| Calendar day-detail modal | `openDayModal()`, `renderDayModal()`, `closeDayModal()` |
| Idea → Video stats tracking sync | `syncIdeaToOutliers()`, `removeIdeaFromOutliers()`, `scheduledDateForTitle()`, `renameVideoTitle()` |
| Video ideas list filtering | `isIdeaPlaced()`, `renderIdeas()` |
| Priority Score / Leaderboard | `PRIORITY_WEIGHTS`, `computePriorityScores()`, `renderLeaderboard()` |
| Caption templates | `renderCaptionTemplates()` |
| Eisenhower priority board | `renderDelivery()` (computed live from `delivery.projects`, not separately stored) |
| Save/publish cycle | `markDirty()`, `saveNow()`, `setSaveState()`, `boot()` |
| Video stats tracking sort (Month/Date) | `outlierSortKey`, `outlierSortDir`, `outlierSortedIndices()`, `outlierSortClick()` |
| Leaderboard sort (incl. Date) | `leaderSortBy`, `leaderMetricValue()`, `renderLeaderboard()` — scoped to `th.sortable[data-sortkey]`, don't widen that selector |
| Video stats tracking title (always fully visible) + Engagement column | Title is a wrapping, auto-height `<textarea class="outliertitlein">`, not an `<input>` — `autosizeTitleTextarea()` sets its height from `scrollHeight` on build and on every keystroke, so the whole title shows immediately, no click/focus needed. **One** Engagement column (`.outliereng`, bold pink via `--accent-2`) sits immediately left of Title — `data-oecalc` on that cell, updated in `updateOutlierCalc()`. There is no second engagement value anywhere else in this table; don't reintroduce one — an earlier version had it both as a badge inside the title cell and as a trailing column, which pushed the Title header out of visual alignment with the actual title text. |
| MRR KPI growth cards | `mrrGrowth(rows, idx, field)` mirrors Content's `contentGrowth()` exactly — `idx <= 0` returns null (no prior row to diff against). `renderKPIs()` only computes/shows these when `viewMode === "month"` (Year/All time span more than one row, so "vs. previous month" doesn't map cleanly); `idx` is found against the full unfiltered `rows` array, not the period-filtered `periodRows`, so it lines up with the chronological array `mrrGrowth` reads from. Growth cards are `"accent"`-styled and interleaved directly after their base-metric card, same placement convention as `renderContentKPIs()`. |
| Instagram / Email tabs (split from Content, 2026-09-06) | Two separate tabs, but **one shared data source** — `state.content.rows` still stores `igFollowers` and `emailList` together per month, same as before the split. `renderContentTab()` is still the single orchestrating function (called from everywhere Content used to be re-rendered); it now calls `renderInstagramKPIs/renderEmailKPIs`, `renderInstagramTable/renderEmailTable` (both thin wrappers around generic `renderMetricTable(tbodyId, rows, field, isIG)` / `buildMetricRow(...)` — parameterized by field name, not duplicated logic), and `renderInstagramChart/renderEmailChart`. Two period selects (`igPeriodSel`, `emailPeriodSel`) both sync to the one shared `contentSelectedMonth` variable via `syncPeriodSel()` — selecting a month on either tab moves both. **Locking/unlocking or deleting a row from either tab's table must reset both `igTableBuiltForCount` and `emailTableBuiltForCount`** (not just the one clicked in) since both tables render the same underlying row — this is in `wireMetricTableEvents()`, don't drop it if this code gets touched again. |

---

## Changelog

- **2026-09-04** — Structured retrospective pass over this session's Business Hub corrections (per Olly's request to review feedback → lessons → rules). Added a `### Never` quick-list and a `### Design principles from past corrections` subsection to §4, covering two lessons that were previously only implicit in the data-model notes: (1) a boolean that gates a real transition elsewhere needs an explicit labeled control, not a checkbox — from the Draft/Published redesign; (2) a reusable-content list needs a name/identifier field as soon as there's more than one item — from the caption-templates redesign. Also added the new sort-related functions (`outlierSortKey`/`outlierSortedIndices`/`leaderMetricValue` Date handling) to the quick-reference table — they existed in code but weren't listed. No existing rule was removed — nothing in this session contradicted an earlier one, everything so far has been additive.
- **2026-09-06** — Added month-over-month growth indicators to MRR Tracker's "Month at a glance" KPI section, per Olly's request to mirror the Content tab's growth-card pattern for About Page visits, free trials etc. New `mrrGrowth()` helper + growth-card interleaving in `renderKPIs()`, documented in the quick-reference table above. No new pitfall — this was a straightforward port of an already-documented pattern, not a correction.
- **2026-09-06** — Split Content's "This month at a glance / Trends / Monthly log" section into two new top-level tabs, Instagram and Email, per Olly's request. Data model unchanged (`state.content.rows` still holds both metrics per month) — only the display layer split, via generic `renderMetricTable()`/`buildMetricRow()` parameterized by field name rather than duplicating the whole table twice. Content tab now opens straight on Caption templates. Documented in the quick-reference table above, including the one real gotcha (both tables must rebuild together on lock/delete since they render the same shared row).
- **2026-09-06** — Reordered Content tab's sections to Video Ideas → Calendar → Video Stats Tracking → Leaderboard → Caption Templates (was: Caption Templates → Video Ideas → Calendar → Video Stats Tracking → Leaderboard), per Olly's request. Pure HTML reorder — every render/event wire-up in this app targets elements by ID, not DOM position, so nothing in the `<script>` needed to change.
- **2026-09-06** — Removed "Email leads (quiz)" from MRR Tracker entirely, per Olly's request ("remove anything about email from mrr tracker page") — this was the `emailLeads` field: a KPI card, its growth card, a Monthly log column, and a glossary entry. Note it's a different thing from the new Email tab (that's `state.content.rows[i].emailList`, subscriber count) — `emailLeads` was quiz-funnel lead count, tracked on `state.rows` (the MRR array) since before the Email tab existed. Removed from every render path (`renderKPIs`, `buildRow`, `aggregatePeriod`, `computeRows`, `addMonth`, seed rows) but **left untouched in the saved `state-data` JSON blob** — real historic numbers (59 in Aug, 1 in Sept) aren't deleted, just no longer surfaced, per the "never silently delete real logged data" guardrail.
- **2026-09-06** — Added PWA "remember where I was" UI state, per Olly's real mobile workflow: he jumps out to Instagram to paste a caption/title, then comes back into the home-screen app, and every trip out was silently resetting the app to Tab 1 and the current calendar month. New `uiSave(patch)`/`uiLoad()` helpers, a **separate** localStorage key (`heart-attractor-community-tracker-ui`) from the business-data save (`heart-attractor-community-tracker`) — this one is pure per-viewer UI convenience (active tab + `calCursor`'s month), never meant to be part of the published/shared state, and wrapped in try/catch same as the data localStorage calls. Restored in `boot()` before the first `render()`/`renderIdeasAndWeek()` call. **Pitfall for next time:** if a future feature adds another "where was I" affordance (scroll position, an open day-modal, a selected row) it belongs in this same UI-only key, not the business-data one — the two must stay separate since one gets published/shared and the other never should.
- **2026-09-06** — Video stats tracking's Date column sort (`outlierSortClick("date")`) is now a strict two-state toggle — Newest (desc) / Oldest (asc) — never the third "back to unsorted" state Month still cycles through, per Olly's request ("just newest and oldest"). Handled with an `if (key === "date")` branch inside `outlierSortClick()` rather than touching the shared cycling logic, so Month's existing 3-state behaviour (asc → desc → unsorted) is untouched — only fix what was asked. Header label for Date now spells out "▼ Newest" / "▲ Oldest" in `renderOutliers()` instead of a bare arrow, since two fixed states read better named than inferred from direction.
- **2026-09-06** — Added a Save button inside the calendar day modal itself (`#dayModalSave`, in `.daymodal-headactions` next to the close ✕), per Olly's real mobile workflow: editing a video title in the day panel already updated `state` via `markDirty()` (on blur), but the only way to actually *publish* it was to close the modal and find the header Save button — annoying when he's mid-flow copying a title out to Instagram. `saveNow()` gained an optional `onDone(ok)` callback (header Save button still doesn't pass one — `setSaveState()` already drives its own label) so the modal button shows the real outcome ("Saving…" → "Saved ✓" / "Save failed") instead of a guessed timeout. **Reusable pattern:** any future "save from inside a modal/panel" button should call `saveNow(onDone)` the same way — never invent a second publish path.
- **2026-09-06 — bug fix, same day:** that new day-modal Save button shipped with a real bug, reported by Olly as "glitching and not saving properly." Root cause: `buildDoc()` (called synchronously inside `saveNow()`, as the argument to `artifact.publish(...)`) builds the published document from a **live snapshot of `document.body.innerHTML` at that exact instant**. The click handler was setting the button's own `textContent` to "Saving…" and `disabled = true` *before* calling `saveNow()` — so that transient state got captured and published as the page's own resting HTML. Next time anyone opened the app, the button loaded already stuck on "Saving…", permanently disabled, unclickable — every save made the bug worse, not better. **⚠️ New rule for this whole file: never mutate any element's DOM state as "in-progress" feedback before a `saveNow()`/`buildDoc()` call in the same synchronous tick — including anything a future feature adds.** Fix, two parts: (1) feedback text moved to a separate sibling `<span id="dayModalSaveStatus">`, never the button's own label, so the button's baked-in resting text is always literally "Save"; (2) even that span's mutation (plus the `disabled` toggle) is deferred via `setTimeout(fn, 0)` so it only touches the DOM on the *next* tick — strictly after `buildDoc()` has already run for that click. The already-broken published button state was also reset by hand in this fix.
- **2026-09-06** — Renamed the MRR tab's label from "MRR Tracker" to "MRR" per Olly's request. Tab id (`#tab-mrr`) and every internal function/variable name are unchanged — this was a label-only change, and prose references to "MRR Tracker" elsewhere in this file (as a feature description, not a literal button label) were deliberately left alone.
- **2026-09-06 — structured retrospective pass** (per Olly's standing request to review this session's feedback → lessons → durable rules, same process as the 2026-09-04 pass). Reviewed everything since the last retrospective and promoted two real *corrections* (not just feature builds) into permanent rules rather than leaving them as changelog prose only:
  1. The day-modal Save button DOM-snapshot bug → added to `### Never` in §4, worded generally so it catches any future "in-progress" UI feedback, not just this one button.
  2. Video stats tracking's Date sort being cut from three states to two (Olly: "just newest and oldest") → added as a new "Design principles" bullet in §4: a genuinely two-state real-world concept shouldn't inherit a generic 3-state cycling pattern just because that's what's used elsewhere in the file.
  Also caught two places this file had gone stale from feature work landing without a docs pass: §2's file-structure description still said "three tabs" (now five — MRR/Content/Instagram/Email/Delivery), and §3's data-model snippet still listed `emailLeads` as a live field on `rows[]` after it was removed from every render path — both corrected, with a note on `emailLeads` explaining it's legacy-only now. Added one more design principle codifying the UI-state-vs-business-data separation (`uiSave`/`uiLoad` vs `state`/`saveNow`) since it's a distinction worth stating explicitly rather than only being discoverable from the Changelog. No existing rule was removed — nothing this session contradicted an earlier one; everything remains additive.
