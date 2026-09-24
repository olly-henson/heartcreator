// ============================================================
// Build the editable email-preview viewer for a check-in Worker
// ============================================================
//
// Reads a *-checkin-worker.js, renders every email it sends using the
// Worker's OWN template functions (so the preview can never drift from
// what actually sends), and writes ONE self-contained HTML file to publish
// as a claude.ai Artifact (see ../skills/skills_email-preview-artifact.md).
//
// Run from the delivery/ folder:
//   node email-preview-artifact/build-email-preview.mjs \
//     --worker rewrite-checkin-worker.js --program Rewrite \
//     --days 60 --checkins 6 --start 2026-09-24 \
//     --confirm-subject "You've started The Rewrite Meditation!" \
//     --out email-preview-artifact/rewrite-emails-artifact.html
//
// The Worker file must define (top level, same names) these functions:
//   confirmationEmailHtml(name, startDateText, endDateText)
//   coachNotificationHtml(name, email, startDateText, firstCheckinText)
//   checkinEmailHtml(name, checkinNumber, isFinal)
//   dateAtDaysOffset(startDate, days, hourUTC)
//   formatDateLong(date)
// Subjects live inside the Worker's fetch() handler, so they're passed as
// flags here (defaults shown below) — keep them in sync with the Worker.
// No temp files are written: the Worker source is loaded via a data: URL.
// ============================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));

function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name);
  return i > -1 ? process.argv[i + 1] : fallback;
}

const workerFile = arg('worker');
const program = arg('program');
const days = Number(arg('days'));
const checkins = Number(arg('checkins'));
const start = arg('start', '2026-09-24');
const out = arg('out');
if (!workerFile || !program || !days || !checkins || !out) {
  console.error('Missing flags. Need --worker --program --days --checkins --out (and optionally --start --confirm-subject --final-subject).');
  process.exit(1);
}
const confirmSubject = arg('confirm-subject', `You've started The ${program} Meditation`);
const finalSubject = arg('final-subject', `Well done on completing The ${program} Meditation! 🎉`);
const midSubject = arg('mid-subject', "How's it going?");
const SEND_HOUR_UTC = 9; // same as the Workers' SEND_HOUR_UTC

// Load the Worker's pure functions without running its fetch handler.
let src = fs.readFileSync(workerFile, 'utf8').replace('export default {', 'const __worker = {');
src += '\nexport { confirmationEmailHtml, coachNotificationHtml, checkinEmailHtml, dateAtDaysOffset, formatDateLong };';
const m = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));

const sampleName = 'Olly';
const when = (k) => m.formatDateLong(m.dateAtDaysOffset(start, k, SEND_HOUR_UTC));

const emails = [
  { tab: 'Signup', sub: 'To client', when: 'Sent immediately on signup', to: 'Client',
    subj: confirmSubject, html: m.confirmationEmailHtml(sampleName, when(0), when(days)) },
  { tab: 'Signup', sub: 'To Olly', when: 'Sent immediately on signup', to: 'Olly',
    subj: `Olly Henson has started The ${program} Meditation`,
    html: m.coachNotificationHtml('Olly Henson', 'olly@ollyhenson.com', when(0), when(10)) },
];
for (let i = 1; i <= checkins; i++) {
  const isFinal = i === checkins;
  emails.push({
    tab: 'Day ' + i * 10, sub: 'Check-in ' + i, when: 'Scheduled for ' + when(i * 10), to: 'Client',
    subj: isFinal ? finalSubject : midSubject, html: m.checkinEmailHtml(sampleName, i, isFinal),
  });
}

const [y, mo, d] = start.split('-').map(Number);
const startLabel = new Date(Date.UTC(y, mo - 1, d)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

let tpl = fs.readFileSync(path.join(here, 'email-preview-template.html'), 'utf8');
tpl = tpl.split('{{PROGRAM}}').join(program)
  .split('{{EMAIL_COUNT}}').join(String(emails.length))
  .split('{{PROGRAM_DAYS}}').join(String(days))
  .split('{{START_LABEL}}').join(startLabel)
  // "<" escaped so an email's markup can never close the <script> tag.
  .replace('/*DATA*/[]', () => JSON.stringify(emails).replace(/</g, '\\u003c'));

fs.writeFileSync(out, tpl);
console.log(`Wrote ${out} — ${emails.length} emails (${program}, ${days} days, ${checkins} check-ins).`);
