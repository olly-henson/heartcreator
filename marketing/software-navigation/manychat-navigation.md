# ManyChat navigation (confirmed paths)

## Clear old contacts when the contact limit is hit (confirmed 2026-11-06 from Olly's screenshots)
Contacts (left menu) → untick the header box first (it can default to ALL selected) → Filter → + Condition → System Fields → **Last Interaction with the Instagram icon** (the one with the Messenger icon only covers Facebook) → before → DD/MM/YYYY hh:mm (30 days ago) → click away → check "N selected of N total" after ticking the header box → Bulk Actions → Delete. 2026-11-06: 979 → ~601 (deleted 378 not seen on Instagram since 7 Oct). Deleted people who comment again are re-added and still get the link.

## Add a delayed follow-up after a link is sent (confirmed 2026-11-12, Olly did it live)
Automation (left menu) → open the automation (e.g. the FEELING DM one) → click the block that sends the link → its **Next Step** connector → **Smart Delay** → set 2 hours → Smart Delay's Next Step → **Instagram** (send message) → Text → paste → **Set Live** (top right). Repeat in each automation (DM and comment are separate). Story reply automations built in the simple setup screen have no Next Step (skipped).
