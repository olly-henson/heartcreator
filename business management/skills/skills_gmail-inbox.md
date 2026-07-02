# Skill: Gmail Inbox Management

## Purpose

Keep Olly's Gmail inbox at zero. This covers three operations:
1. **Clearing** — archiving everything currently in the inbox
2. **Filtering** — routing future emails to the correct labels automatically
3. **Bulk deleting** — removing junk/promotional emails from labels

All three have been completed as of 2026-06-30. Use this file to maintain the system or rebuild it from scratch.

---

## Labels in use

| Label | Gmail ID | What goes here |
|---|---|---|
| Clients | Label_1 | Skool DMs and client messages |
| Business | Label_2 | Canva, Revolut, Google Workspace, Zapier alerts |
| Newsletters | Label_3 | ManyChat, Bana Hwinn, Zapier, Gareth Lamb, HeartMath |
| Client Program | Label_4 | Client progress reports and check-in emails |
| Applications | Label_6083342795714502079 | Coaching application notifications |

---

## Part 1 — Clearing the inbox

### Fastest method: bulk archive via Chrome MCP

This archives everything in one action. Use when the inbox has more than a handful of threads.

1. Navigate to Gmail inbox: `mcp__Claude_in_Chrome__navigate` → `https://mail.google.com`
2. Take a screenshot to confirm inbox is open and how many threads there are
3. Run this JavaScript to select all and archive:

```javascript
// Step 1: Click the select-all checkbox
document.querySelector('div[gh="tm"] .T-Jo').click();

// Step 2: Click "Select all X conversations in Inbox" link (appears after step 1)
// Wait ~500ms then click the link that appears
document.querySelector('.ya .ya').click();

// Step 3: Click the Archive button
// Gmail blocks synthetic JS clicks on the archive button — use computer tool instead
```

4. After the "Select all X conversations" link is clicked, take a screenshot to confirm the banner appears
5. Use `computer` tool (real mouse click) to click the Archive button — **do not use JS `.click()` on it, Gmail blocks synthetic events**
6. A confirmation dialog may appear — use `computer` tool to click OK
7. Take a final screenshot to confirm "No new emails!" is showing

**Note:** The archive button selector is `div[act="7"]` but click it with the computer tool, not JavaScript.

### Slower method: archive via Gmail MCP (one thread at a time)

Use only for small inboxes or targeted cleanup.

```
mcp__7d957388-e67d-4624-a384-026aa05d562a__unlabel_thread(
  threadId: "<thread_id>",
  labelIds: ["INBOX"]
)
```

Pagination pattern:
```
search_threads(query: "in:inbox", pageSize: 50)
→ archive each thread ID
→ use nextPageToken to fetch next page
→ repeat until no nextPageToken returned
```

If a thread fails with "Stream closed", retry immediately — it usually succeeds on the second attempt.

---

## Part 2 — Gmail filters (all live as of 2026-06-30)

These filters auto-route incoming emails and skip the inbox. They were created via Chrome MCP (Settings → Filters and Blocked Addresses → Create a new filter). The Gmail MCP does not support filter creation.

### Filter creation steps (Chrome MCP)

1. Navigate to: `https://mail.google.com/mail/u/0/#settings/filters`
2. Scroll to the bottom and click "Create a new filter"
3. Fill in the From and/or Subject fields
4. Click "Create filter" (not Search)
5. On the action panel: check the relevant actions, select label if needed, check "Also apply filter to X matching conversations"
6. Click "Create filter"

**Key gotcha:** After setting actions, scroll down to check "Also apply filter to matching conversations" before clicking Create filter — it's easy to miss.

**Another gotcha:** Gmail blocks JavaScript `.click()` on certain buttons. If a click does nothing, switch to the `computer` tool and click at screen coordinates instead.

### The 7 filters

#### 1. Newsletters
**From:** `info@email.manychat.com OR info@heartmath.org OR hi@garethlamb.com OR news@send.zapier.com OR Mail@email.banahwinn.com OR recommendations@inspire.pinterest.com OR recommendations@discover.pinterest.com`
**Action:** Apply label: Newsletters, Skip inbox

#### 2. Clients (Skool DMs)
**From:** `noreply@skool.com`
**Subject contains:** `sent you a message`
**Action:** Apply label: Clients, Skip inbox

#### 3. Applications
**Subject contains:** `New Application OR Application received`
**Action:** Apply label: Applications, Skip inbox

#### 4. Client Program
**Subject contains:** `progress report OR monthly report`
**Action:** Apply label: Client Program, Skip inbox

#### 5. Business
**From:** `no-reply@canva.com OR no-reply@revolut.com OR workspace-noreply@google.com OR alerts@mail.zapier.com OR payments-noreply@google.com`
**Action:** Apply label: Business, Skip inbox

#### 6. Archive — Facebook notifications
**From:** `friendupdates@facebookmail.com OR notification@facebookmail.com OR mentions@facebookmail.com OR security@facebookmail.com`
**Action:** Skip inbox, Mark as read

#### 7. Archive — Skool digests and events
**From:** `noreply@skool.com`
**Subject contains:** `event happening OR Weekly digest OR posted`
**Action:** Skip inbox, Mark as read

**Note on filter 7:** `noreply@skool.com` sends both client DMs (kept by filter 2) and community noise (caught by filter 7). The split is by subject line.

---

## Part 3 — Bulk deleting junk from labels

Use this periodically to clear out accumulated junk in the Newsletters and Business labels.

### How to identify candidates

Search by label and review by sender:

```
search_threads(query: "label:Newsletters", pageSize: 50)
search_threads(query: "label:Business", pageSize: 50)
```

Look for:
- Nurture sequences from products Olly no longer uses (trial ended, unsubscribed)
- Repeated "payment failed" emails for resolved issues
- Old product newsletters (Zapier updates, ManyChat marketing)
- Purchase confirmations no longer needed

### What was deleted on 2026-06-30

The following categories were trashed. Use as a reference for what is safe to delete in future:

- **Canva "payment failed for Rees Family"** — recurring billing failures for a Canva Teams account (now cancelled). ~22 emails spanning April–June 2026.
- **Bana Hwinn Golden Ratio nurture sequence** — trial sign-up emails from March 2026. Trial ended, no longer relevant. ~11 emails.
- **ManyChat marketing emails** — "Inspiring stories", "Don't miss your moment" etc. Pure promotional content. ~6 emails.
- **Zapier product newsletters** — feature update emails (Dec 2025–Mar 2026). ~4 emails.
- **Revolut eSIM purchase confirmations** — purchase receipts no longer needed. ~4 emails.

### What to keep in Business label

- Google Workspace invoices (financial records)
- Google Workspace payment declined notices (until resolved)
- Google Workspace admin/security alerts (worth acting on)
- Revolut account change notifications

### How to trash threads

```
mcp__7d957388-e67d-4624-a384-026aa05d562a__label_thread(
  threadId: "<thread_id>",
  labelIds: ["TRASH"]
)
```

This moves to trash (recoverable for 30 days). Do not permanently delete — that is prohibited.

---

## Notes

- ManyChat Pro trial ended 2026-07-01
- Skool `noreply@skool.com` handles both DMs (labelled Clients) and digests (archived) — filters 2 and 7 handle the split
- After any inbox clearing session, run `search_threads(query: "in:inbox")` to confirm inbox is at zero
- Google Workspace storage was at 88% as of 2026-06-29 — worth monitoring
