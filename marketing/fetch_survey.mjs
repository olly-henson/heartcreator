// Pulls every Content Survey response from the Google Sheet (via the Apps Script read link)
// and prints an aggregated summary for writing Reel titles. Used by skills/skills_reel-titles.md.
//
// Run:  node fetch_survey.mjs            → readable summary
//       node fetch_survey.mjs --json     → raw responses as JSON
//
// Needs SURVEY_URL and SURVEY_READ_KEY in marketing/.env (see .env.example).

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(join(here, '.env'), 'utf8')
    .split(/\r?\n/)
    .filter(l => /^\s*[A-Z0-9_]+\s*=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
if (!env.SURVEY_URL || !env.SURVEY_READ_KEY) {
  console.error('Missing SURVEY_URL or SURVEY_READ_KEY in marketing/.env');
  process.exit(1);
}

const res = await fetch(`${env.SURVEY_URL}?key=${encodeURIComponent(env.SURVEY_READ_KEY)}`);
const data = await res.json().catch(() => null);
if (!data || !data.ok) {
  console.error('Could not read the survey:', data ? data.error : `HTTP ${res.status}`);
  console.error('Check READ_KEY in Apps Script matches SURVEY_READ_KEY, and that the latest version is deployed.');
  process.exit(1);
}

const rows = data.responses;
if (process.argv.includes('--json')) { console.log(JSON.stringify(rows, null, 2)); process.exit(0); }

const total = rows.length;
const split = v => String(v || '').split(' | ').map(s => s.trim()).filter(Boolean);
const tally = key => rows.reduce((c, r) => { split(r[key]).forEach(v => { c[v] = (c[v] || 0) + 1; }); return c; }, {});
const pct = (n, d) => `${Math.round(n / d * 100)}%`;
const ranked = c => Object.entries(c).sort((a, b) => b[1] - a[1]);
const byRate = (key, shownKey) => {
  const picks = tally(key), shown = tally(shownKey);
  return Object.keys(shown)
    .map(k => ({ name: k, picks: picks[k] || 0, shown: shown[k], rate: (picks[k] || 0) / shown[k] }))
    .sort((a, b) => b.rate - a.rate || b.picks - a.picks);
};
const texts = key => rows.map(r => String(r[key] || '').trim()).filter(Boolean).reverse();
const section = (title, lines) => {
  console.log(`\n## ${title}`);
  console.log(lines.length ? lines.map(l => `- ${l}`).join('\n') : '- (no answers yet)');
};

const dates = rows.map(r => r.timestamp).filter(Boolean).sort();
console.log(`# Content Survey: ${total} response${total === 1 ? '' : 's'}` +
  (dates.length ? ` (${dates[0].slice(0, 10)} to ${dates[dates.length - 1].slice(0, 10)})` : ''));
if (total < 10) console.log('Early signal only: fewer than 10 responses.');

const love = tally('content_love'), ok = tally('content_ok'), not = tally('content_not');
const types = [...new Set([...Object.keys(love), ...Object.keys(ok), ...Object.keys(not)])]
  .map(t => ({ t, love: love[t] || 0, ok: ok[t] || 0, not: not[t] || 0, score: (love[t] || 0) - (not[t] || 0) }))
  .sort((a, b) => b.score - a.score || b.love - a.love);
section('Content types (net score = loves minus not-for-me)', types.map(x =>
  `${x.t}: love ${x.love}, ok ${x.ok}, not ${x.not} (net ${x.score >= 0 ? '+' : ''}${x.score})`));
section('Titles by pick rate (picked / shown)', byRate('titles', 'titles_shown').map(x =>
  `${x.name}: ${x.picks}/${x.shown} (${pct(x.picks, x.shown)})`));
section('Hook styles by pick rate', byRate('title_styles', 'title_styles_shown').map(x =>
  `${x.name}: ${x.picks}/${x.shown} (${pct(x.picks, x.shown)})`));
section('Reel length', ranked(tally('reel_length')).map(([k, n]) => `${k}: ${n} (${pct(n, total)})`));
section('Turn-offs', ranked(tally('turn_offs')).map(([k, n]) => `${k}: ${n} (${pct(n, total)})`));
section('Favourite Reels', [...ranked(tally('fav_reel')).map(([k, n]) => `${k}: ${n}`),
  ...texts('fav_reel_other').map(t => `typed in: "${t}"`)]);
section('Biggest struggles (their words, newest first)', texts('struggle').map(t => `"${t}"`));
section('Other creators they follow', texts('other_creators'));
section('How often they watch', ranked(tally('watch_freq')).map(([k, n]) => `${k}: ${n}`));
section('Age range', ranked(tally('age')).map(([k, n]) => `${k}: ${n}`));
