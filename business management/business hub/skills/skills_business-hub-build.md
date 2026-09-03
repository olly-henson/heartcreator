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
3. All HTML markup for the three tabs (`#tab-mrr`, `#tab-content`, `#tab-delivery`), plus the day-detail modal markup near the end
4. A `<script type="application/json" id="state-data">` block — this is the actual saved data, embedded so the page boots with it
5. One large `<script>(function(){ ... })();` IIFE — all state, render, and event-handling logic

---

## 3. Data model

```js
state = {
  mrrTarget: 40000,
  rows: [ { month, emailLeads, visits, trials, newMembers, lost, activeMembers, price, locked } ],
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

- **`rows[].price` / cohort MRR** — MRR is NOT `activeMembers × price`. It's a running-total cohort calculation in `computeRows()`: each row's `newMembers * price` adds to the running total; `lost` members are removed at the average revenue-per-member at that point. This correctly handles the Aug 2026 price change ($30→$99) with grandfathered existing members. Never simplify this back to a naive multiplication.
- **`ideas[].mode`** — `"auto"` (date auto-assigned to the next slot with capacity, date input disabled) or `"specific"` (user picks the date manually). Toggled via two checkboxes styled as radios in the Video ideas table.
- **`ideas[].synced`** — internal bookkeeping for `syncIdeaToOutliers()`, not meaningful on its own.
- **`ideas[].posted`** — the *only* thing that adds a video to `content.outliers` (Video stats tracking). Ticked in the calendar day-detail modal. Unticking removes it again (with a confirm if the linked outlier already has real stats logged — see `removeIdeaFromOutliers()`).
- **`ideas[].caption`** — per-video caption override. Empty by default. A caption template just fills this in as a starting point when tapped (`idea.caption = tpl.text`) — there's no ongoing link back to the template.
- **`outliers[].saved`** — controls whether a video appears on the Leaderboard. Set via the "Save" button (first column of Video stats tracking). Leaderboard = all `saved` outliers ranked 1–N, not a top-10 cut.
- **Video ideas list visibility** — an idea disappears from the Video ideas table once it has **both** a title and a date (`isIdeaPlaced()`), because at that point it's showing on the calendar instead. It's still fully in `state.content.ideas`, just filtered out of that particular table's render.
- **Video stats tracking "Date" column** — not stored on the outlier itself. It's looked up live by title-match against `state.content.ideas` (`scheduledDateForTitle()`), so moving a video's date in the calendar updates this automatically with no extra sync step.

---

## 4. House conventions (follow these, don't reinvent)

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

---

## 6. Quick reference — where things are in the code

| Feature | Key functions |
|---|---|
| MRR cohort calculation | `computeRows()` |
| Monthly/Yearly/All-time aggregation | `aggregatePeriod()` |
| Content calendar | `renderCalendar()`, `findNextAvailableDate()`, `isoDate()` |
| Calendar day-detail modal | `openDayModal()`, `renderDayModal()`, `closeDayModal()` |
| Idea → Video stats tracking sync | `syncIdeaToOutliers()`, `removeIdeaFromOutliers()`, `scheduledDateForTitle()` |
| Video ideas list filtering | `isIdeaPlaced()`, `renderIdeas()` |
| Priority Score / Leaderboard | `PRIORITY_WEIGHTS`, `computePriorityScores()`, `renderLeaderboard()` |
| Caption templates | `renderCaptionTemplates()` |
| Eisenhower priority board | `renderDelivery()` (computed live from `delivery.projects`, not separately stored) |
| Save/publish cycle | `markDirty()`, `saveNow()`, `setSaveState()`, `boot()` |
