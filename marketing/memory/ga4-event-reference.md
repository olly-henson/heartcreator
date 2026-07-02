# GA4 Event Reference — Olly Henson Coaching

> Quick reference for all GA4 events in use. Update this whenever a new event is added.

---

## Key Events (Conversions)

| Event | Fires on | Label | Marked as key event |
|---|---|---|---|
| `generate_lead` | `/thank-you` page load | `meditation_optin` | ✓ |
| `application_submitted` | `/application-thank-you` page load | `coaching_application` | ✓ |

## Standard Events

| Event | Fires on | Label |
|---|---|---|
| `pdf_download` | Click on PDF button on `/meditation-access` | `practice_guide` |

---

## How events are fired

All events use this pattern with a 1 second delay to ensure GA4 has loaded:

```javascript
function fireEvent() {
  if (typeof gtag === 'function') {
    gtag('event', 'event_name', {
      event_category: 'funnel',
      event_label: 'label'
    });
  }
}
if (document.readyState === 'complete') {
  setTimeout(fireEvent, 1000);
} else {
  window.addEventListener('load', function() { setTimeout(fireEvent, 1000); });
}
```

The `pdf_download` event fires on click (no delay needed):

```javascript
document.getElementById('ohc-pdf-btn').addEventListener('click', function() {
  if (typeof gtag === 'function') {
    gtag('event', 'pdf_download', {
      event_category: 'funnel',
      event_label: 'practice_guide'
    });
  }
});
```

---

## Where to view in GA4

- **Realtime → Event count by Event name** — live event firing
- **Realtime → Key events by Event name** — live conversions
- **Admin → Events** — all events + key event toggles
