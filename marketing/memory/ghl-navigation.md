# GHL Navigation — Confirmed UI Paths

> Built from real screenshots. Only add paths that have been visually confirmed. Never guess.

---

## Automations / Workflows

- **Find workflows:** Left sidebar → Automation → Workflows
- **Add a step:** Click the + button between existing steps in the flow builder
- **Notification email recipient options:** "Assigned Owners > Contact Owner" or specific email address — confirmed via screenshot 2026-06-17
- **Assign to User step:** Available as a workflow action — add before notification step to ensure owner is set

---

## Funnels / Pages

- **Find funnels:** Left sidebar → Sites → Funnels
- **Edit a page:** Click the funnel → click the page name → Edit button
- **Noindex a page (whole funnel):** Sites → Funnels → open funnel → Settings tab (top) → Head Tracking Code box → paste `<meta name="robots" content="noindex, nofollow">` → Save
- **Noindex a specific funnel step only:** Click the 3 dots next to the step name in the left panel → Settings → Head Tracking Code box → paste noindex meta tag → Save

---

## Contacts

- **Find contacts:** Left sidebar → Contacts
- **Edit custom fields on a contact:** Open contact → scroll to Custom Fields section on right panel
- **Contact Type field:** Custom field — appears in contact record, options: Lead / Applicant / Client / Staff

---

## Custom Fields

- **Create a custom field:** Settings → Custom Fields → + Add Field
- **Field types confirmed to work with webhooks:** Single line text (multi line can fail)
- **Field key format:** `{{contact.field_key_here}}`

---

## Pipelines / Opportunities

- **Find pipelines:** Left sidebar → Opportunities (or CRM → Pipelines depending on view)
- **Set opportunity value:** Open opportunity → edit monetary value field manually
- **Sale date field:** Custom field — Unix ms timestamp, set manually when sale closes

---

## Emails

- **Merge tag for first name:** `{{contact.first_name}}` — always use this, never custom webhook tags in emails
- **Unsubscribe link:** `{{contact.unsubscribe_link}}` — suppressed on test sends, appears on real sends
- **Internal notification emails:** Plain text only — HTML stripped. Only use `{{contact.*}}` tags.

---

## Notes
- Always confirm new navigation paths via screenshot before documenting here
- UI changes frequently — treat paths as "last confirmed on [date]" not permanent
