import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('C:/Users/Olly/AI OS/marketing/.env', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);

const CLIENT_ID = env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = env.GOOGLE_REFRESH_TOKEN;

async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to get access token: ' + JSON.stringify(data));
  return data.access_token;
}

async function createEvent(token, event) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
  const data = await res.json();
  if (data.error) throw new Error('Failed to create event: ' + JSON.stringify(data.error));
  return data;
}

const events = [
  {
    summary: '⚠️ Update RSVP Email — UK clocks back (BST → GMT)',
    start: { date: '2026-10-26' },
    end: { date: '2026-10-27' },
    description: 'Update the Q&A Coaching Call RSVP email in GHL.\n\nChange to:\n7pm GMT · 8pm SAST · 10pm GST · 3pm EST · 2pm CST · 12pm PST\n\nNote: US clocks change on 1 Nov — gap week where US times are 1 hour off.',
    reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 60 }, { method: 'popup', minutes: 60 }] },
  },
  {
    summary: '⚠️ Update RSVP Email — US clocks back (EDT → EST)',
    start: { date: '2026-11-01' },
    end: { date: '2026-11-02' },
    description: 'Update the Q&A Coaching Call RSVP email in GHL.\n\nUS times now settled. Confirm email reads:\n7pm GMT · 8pm SAST · 10pm GST · 3pm EST · 2pm CST · 12pm PST',
    reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 60 }, { method: 'popup', minutes: 60 }] },
  },
  {
    summary: '⚠️ Update RSVP Email — US clocks forward (EST → EDT)',
    start: { date: '2027-03-08' },
    end: { date: '2027-03-09' },
    description: 'Update the Q&A Coaching Call RSVP email in GHL.\n\nChange US times back to:\n2pm EDT · 1pm CDT · 11am PDT',
    reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 60 }, { method: 'popup', minutes: 60 }] },
  },
  {
    summary: '⚠️ Update RSVP Email — UK clocks forward (GMT → BST)',
    start: { date: '2027-03-29' },
    end: { date: '2027-03-30' },
    description: 'Update the Q&A Coaching Call RSVP email in GHL.\n\nChange to:\n7pm BST · 8pm SAST · 10pm GST · 2pm EDT · 1pm CDT · 11am PDT',
    reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 60 }, { method: 'popup', minutes: 60 }] },
  },
];

const token = await getAccessToken();
for (const event of events) {
  const created = await createEvent(token, event);
  console.log(`✅ Created: ${created.summary}`);
}
console.log('\nAll 4 timezone reminders added to Google Calendar.');
