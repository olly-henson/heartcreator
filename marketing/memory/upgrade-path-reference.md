# Upgrade Path Reference — Olly Henson Coaching

> Documents all upgrade path tags in use. These are stored in the GHL contact field "Upgrade Path" and tell you what prompted someone to apply for the Heart Creator Program.

---

## Current Upgrade Paths

| Page | CTA | Ref tag stored in GHL |
|---|---|---|
| `/thank-you` | Heart Creator Program button | `Applied from thank you page` |
| `/meditation-access` | Heart Creator Program button | `Applied from meditation page` |
| Practice Guide PDF | Link at bottom of PDF | `Applied from PDF guide` |

---

## How it works

1. The CTA link includes `?ref=Applied from X`
2. When someone submits the application form, the JS reads the `ref` parameter from the URL
3. It sends it to the GHL webhook as `upgrade_path`
4. The Applications workflow maps it to the Upgrade Path custom field on the contact record

---

## Adding a new upgrade path

1. Add `?ref=Applied from [plain english description]` to the CTA link
2. No code changes needed — `funnel-application.html` already captures any `ref` parameter automatically
3. Add the new path to this doc

---

## Viewing upgrade paths in GHL

- Open any contact → scroll to custom fields → Upgrade Path
- To filter: GHL → Contacts → Smart Lists → filter by Upgrade Path field
