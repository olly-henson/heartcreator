/**
 * Heart Attractor — Instagram Content Survey → Google Sheet
 * Receives POSTs from website/sections/content-survey.html, appends one row per response
 * to "Responses" and rebuilds a "Summary" tab that tallies every answer.
 *
 * Setup:
 * 1. Create a new Google Sheet called "Content Survey Responses".
 * 2. Extensions > Apps Script. Delete the starter code and paste this whole file. Save.
 * 3. Deploy > New deployment > type "Web app".
 *    Execute as: Me. Who has access: Anyone. Deploy and authorise.
 * 4. Copy the Web app URL into SHEET_URL in content-survey.html.
 *
 * If you change the questions in content-survey.html, update COLUMNS and SUMMARY below to match.
 *
 * How To Read The Results (each question answers one content decision):
 *   Content Types Love / Not For Me → which kind of soulmate content they're into and which to avoid
 *   Titles (pick rate)         → which exact titles win. Each person only sees titles from the types they
 *                                love, so titles are ranked by "picked ÷ shown", not raw picks
 *   Hook Styles (pick rate)    → which style of title to use (Question, List, Contrarian, How-to, Science, Story)
 *   Reel Length                → how long to make them
 *   Favourite Reel             → which existing Reels to remake in new versions
 *   Scroll-Past Turn-Offs      → what to avoid
 *   Biggest Struggle           → ready-made hooks in their own words
 *   Other Creators They Follow → who you're competing with and what they already trust
 *   How Often They Watch / Age Range → who's answering; filter Responses to regulars for your core fans
 */

var SHEET_NAME = 'Responses';
var SUMMARY_NAME = 'Summary';

var COLUMNS = [
  ['timestamp',          'Timestamp'],
  ['content_love',       'Content Types They Love'],
  ['content_ok',         'Content Types That Are OK'],
  ['content_not',        'Content Types Not For Them'],
  ['titles',             'Titles They\'d Stop For'],
  ['titles_shown',       'Titles They Were Shown'],
  ['title_styles',       'Hook Styles Picked'],
  ['title_styles_shown', 'Hook Styles Shown'],
  ['reel_length',        'Ideal Reel Length'],
  ['fav_reel',           'Favourite Reel'],
  ['fav_reel_other',     'Favourite Reel (Typed In)'],
  ['turn_offs',          'Scroll-Past Turn-Offs'],
  ['struggle',           'Biggest Struggle'],
  ['other_creators',     'Other Creators They Follow'],
  ['watch_freq',         'How Often They Watch'],
  ['age',                'Age Range'],
  ['source',             'Source']
];

// Summary sections, in order. "shown" = column of what each person was shown, so the
// section is ranked by pick rate (picked ÷ shown) instead of raw picks.
var SUMMARY = [
  { key: 'content_love', label: 'Content Types They Love → the world your content belongs in' },
  { key: 'content_not',  label: 'Content Types Not For Them → stay away from these' },
  { key: 'titles',       shown: 'titles_shown',       label: 'Titles → make the ones with the highest pick rate' },
  { key: 'title_styles', shown: 'title_styles_shown', label: 'Hook Styles → use the styles with the highest pick rate' },
  { key: 'reel_length',  label: 'Ideal Reel Length' },
  { key: 'fav_reel',     label: 'Favourite Reel → what to remake (typed-in answers are on Responses)' },
  { key: 'turn_offs',    label: 'Scroll-Past Turn-Offs → avoid these' },
  { key: 'watch_freq',   label: 'How Often They Watch → who answered (regulars vs new)' },
  { key: 'age',          label: 'Age Range' }
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = JSON.parse(e.postData.contents);
    data.timestamp = new Date();

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS.map(function(c) { return c[1]; }));
      sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow(COLUMNS.map(function(c) {
      var v = data[c[0]];
      return v === undefined || v === null ? '' : String(v).slice(0, 5000);
    }));

    updateSummary();
    buildContentPlan();

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/** Counts each " | "-separated value in one column across all rows. */
function tally(rows, col) {
  var counts = {};
  rows.forEach(function(r) {
    String(r[col]).split(' | ').forEach(function(v) {
      v = v.trim();
      if (v) counts[v] = (counts[v] || 0) + 1;
    });
  });
  return counts;
}

/** Rebuilds the Summary tab: every answer option counted, best first. Can also be run by hand. */
function updateSummary() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return;

  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, COLUMNS.length).getValues();
  var total = rows.length;
  var colIndex = {};
  COLUMNS.forEach(function(c, i) { colIndex[c[0]] = i; });

  var out = [['Total responses', total, '', '']];
  var headerRows = [0];
  SUMMARY.forEach(function(q) {
    var picks = tally(rows, colIndex[q.key]);
    out.push(['', '', '', '']);
    headerRows.push(out.length);
    if (q.shown) {
      var shown = tally(rows, colIndex[q.shown]);
      out.push([q.label, 'Picks', 'Shown', 'Pick rate']);
      Object.keys(shown)
        .map(function(k) { return [k, picks[k] || 0, shown[k], (picks[k] || 0) / shown[k]]; })
        .sort(function(a, b) { return b[3] - a[3] || b[1] - a[1]; })
        .forEach(function(r) { out.push(r); });
    } else {
      out.push([q.label, 'Picks', '% of people', '']);
      Object.keys(picks)
        .sort(function(a, b) { return picks[b] - picks[a]; })
        .forEach(function(k) { out.push([k, picks[k], picks[k] / total, '']); });
    }
  });

  var summary = ss.getSheetByName(SUMMARY_NAME) || ss.insertSheet(SUMMARY_NAME, 0);
  summary.clear();
  summary.getRange(1, 1, out.length, 4).setValues(out);
  // Set every number cell's format explicitly so counts never show as percentages.
  out.forEach(function(r, i) {
    if (typeof r[3] === 'number') {          // pick-rate rows: Picks, Shown, Pick rate
      summary.getRange(i + 1, 2, 1, 2).setNumberFormat('0');
      summary.getRange(i + 1, 4).setNumberFormat('0%');
    } else if (typeof r[2] === 'number') {   // count rows: Picks, % of people
      summary.getRange(i + 1, 2).setNumberFormat('0');
      summary.getRange(i + 1, 3).setNumberFormat('0%');
    }
  });
  headerRows.forEach(function(i) { summary.getRange(i + 1, 1, 1, 4).setFontWeight('bold'); });
  summary.setColumnWidth(1, 480);
}

/* ------------------------------------------------------------------------------------------
 * CONTENT PLAN TAB
 * Turns the answers into plain-English recommendations. Rebuilt on every response, or by hand
 * from the "Content Survey" menu in the Sheet.
 * ---------------------------------------------------------------------------------------- */

var PLAN_NAME = 'Content Plan';

// What each hook style looks like, so the plan can say how to open a Reel.
var STYLE_TIPS = {
  'Question':   'Open with a question they\'re already asking themselves, e.g. "Why do you keep attracting people who won\'t commit?"',
  'List':       'Open with a number, e.g. "3 signs…" or "5 habits…"',
  'Contrarian': 'Open by challenging what they\'ve been told, e.g. "Stop doing X if you want Y"',
  'How-to':     'Open with a clear promise of a method, e.g. "The scientific way to…" or "How to…"',
  'Science':    'Open by explaining why something happens, e.g. "Why calm feels boring when…"',
  'Story':      'Open with your own story, e.g. "This is how I met my wife"'
};

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Content Survey')
    .addItem('Refresh content plan', 'refreshAll')
    .addToUi();
}

function refreshAll() {
  updateSummary();
  buildContentPlan();
}

function buildContentPlan() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return;

  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, COLUMNS.length).getValues();
  var total = rows.length;
  var col = {};
  COLUMNS.forEach(function(c, i) { col[c[0]] = i; });

  function sorted(counts) {
    return Object.keys(counts).sort(function(a, b) { return counts[b] - counts[a]; });
  }
  function pct(n, d) { return Math.round(n / d * 100) + '%'; }

  // Rank by pick rate (picked ÷ shown), ignoring items shown too few times to judge yet.
  function byRate(key, shownKey) {
    var picks = tally(rows, col[key]);
    var shown = tally(rows, col[shownKey]);
    var minShown = Math.min(3, total);
    return Object.keys(shown)
      .filter(function(k) { return shown[k] >= minShown; })
      .map(function(k) { return { name: k, picks: picks[k] || 0, shown: shown[k], rate: (picks[k] || 0) / shown[k] }; })
      .sort(function(a, b) { return b.rate - a.rate || b.picks - a.picks; });
  }

  // Latest non-empty written answers, newest first.
  function latestText(key, n) {
    var out = [];
    for (var i = rows.length - 1; i >= 0 && out.length < n; i--) {
      var v = String(rows[i][col[key]]).trim();
      if (v) out.push(v);
    }
    return out;
  }

  var love = tally(rows, col.content_love);
  var not = tally(rows, col.content_not);
  var loveTop = sorted(love).slice(0, 3);
  var notTop = sorted(not).slice(0, 3);
  var titles = byRate('titles', 'titles_shown').filter(function(t) { return t.picks > 0; }).slice(0, 5);
  var styles = byRate('title_styles', 'title_styles_shown');
  var length = tally(rows, col.reel_length);
  var lengthTop = sorted(length);
  var turnOffs = tally(rows, col.turn_offs);
  var turnOffTop = sorted(turnOffs).slice(0, 3);
  var fav = tally(rows, col.fav_reel);
  var favTop = sorted(fav).filter(function(k) { return k.indexOf('A different one') !== 0 && k.indexOf('I haven') !== 0; }).slice(0, 3);
  var favTyped = latestText('fav_reel_other', 5);
  var struggles = latestText('struggle', 10);
  var creators = latestText('other_creators', 10);
  var regulars = tally(rows, col.watch_freq)['Most days'] || 0;

  var out = [];
  var headings = [];
  function heading(text) { out.push(['', '']); headings.push(out.length + 1); out.push([text, '']); }
  function line(a, b) { out.push([a, b || '']); }

  line('YOUR CONTENT PLAN', 'Based on ' + total + ' response' + (total === 1 ? '' : 's') + ' · updated ' +
       Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'd MMM yyyy, HH:mm'));
  line(total < 10 ? '⚠️ Early signal only. Trust these patterns more once you have 10+ responses.' : '✅ Enough responses to start trusting these patterns.',
       pct(regulars, total) + ' of people who answered watch your Reels most days');

  heading('1. Make content about this');
  if (loveTop.length) loveTop.forEach(function(k) { line(k, 'loved by ' + pct(love[k], total)); });
  else line('Not enough answers yet');

  heading('2. Steer clear of this');
  if (notTop.length) notTop.forEach(function(k) { line(k, '"not for me" for ' + pct(not[k], total)); });
  else line('Nothing stands out yet');

  heading('3. Your next Reels (the titles that won)');
  if (titles.length) titles.forEach(function(t) { line(t.name, 'picked ' + t.picks + ' of ' + t.shown + ' times shown (' + pct(t.picks, t.shown) + ')'); });
  else line('Not enough answers yet. Each title needs to be shown at least ' + Math.min(3, total) + ' times');

  heading('4. How to open your Reels');
  if (styles.length) {
    line('Best hook style: ' + styles[0].name + ' (' + pct(styles[0].picks, styles[0].shown) + ' pick rate)', STYLE_TIPS[styles[0].name] || '');
    if (styles[1]) line('Runner-up: ' + styles[1].name + ' (' + pct(styles[1].picks, styles[1].shown) + ')', STYLE_TIPS[styles[1].name] || '');
    var worst = styles[styles.length - 1];
    if (styles.length > 2) line('Weakest: ' + worst.name + ' (' + pct(worst.picks, worst.shown) + ')', 'Use this style least');
  } else line('Not enough answers yet');

  heading('5. How long to make them');
  if (lengthTop.length) line(lengthTop[0], 'picked by ' + pct(length[lengthTop[0]], total) +
       (lengthTop[1] ? ' · next: ' + lengthTop[1] + ' (' + pct(length[lengthTop[1]], total) + ')' : ''));
  else line('Not enough answers yet');

  heading('6. Avoid this in how you say it');
  if (turnOffTop.length) turnOffTop.forEach(function(k) { line(k, 'a turn-off for ' + pct(turnOffs[k], total)); });
  else line('Nothing stands out yet');

  heading('7. Remake these Reels of yours');
  if (favTop.length) favTop.forEach(function(k) { line(k, 'a favourite for ' + pct(fav[k], total)); });
  favTyped.forEach(function(v) { line(v, 'typed in'); });
  if (!favTop.length && !favTyped.length) line('Not enough answers yet');

  heading('8. Hooks in their own words (latest struggles)');
  if (struggles.length) struggles.forEach(function(v) { line('"' + v + '"', 'use their exact words as an opening line'); });
  else line('Not enough answers yet');

  heading('9. Who else they follow');
  if (creators.length) creators.forEach(function(v) { line(v, 'check what these creators post and how'); });
  else line('No answers yet');

  heading('YOUR REEL RECIPE');
  if (loveTop.length && styles.length) {
    line('A Reel about ' + loveTop[0].replace(/^\S+\s/, '').toLowerCase() +
         ', opened with a ' + styles[0].name.toLowerCase() + ' hook' +
         (lengthTop.length ? ', ' + lengthTop[0].toLowerCase() : '') +
         (turnOffTop.length ? ', and make sure it doesn\'t feel like this: ' + turnOffTop[0].toLowerCase() : '') + '.',
         titles.length ? 'Start with: ' + titles[0].name : '');
  } else line('Not enough answers yet');

  var plan = ss.getSheetByName(PLAN_NAME) || ss.insertSheet(PLAN_NAME, 0);
  plan.clear();
  plan.getRange(1, 1, out.length, 2).setValues(out).setWrap(true).setVerticalAlignment('top');
  plan.getRange(1, 1).setFontSize(16).setFontWeight('bold');
  plan.getRange(2, 1, 1, 2).setFontStyle('italic');
  headings.forEach(function(r) { plan.getRange(r, 1, 1, 2).setFontWeight('bold').setFontSize(12).setBackground('#f3e8ff'); });
  plan.setColumnWidth(1, 520);
  plan.setColumnWidth(2, 420);
  plan.setFrozenRows(1);
}

/* ------------------------------------------------------------------------------------------
 * READ LINK (for Claude)
 * GET <web app URL>?key=<READ_KEY> returns every response as JSON, so Claude can pull the
 * latest answers and write Reel titles from them. READ_KEY lives in Project Settings →
 * Script Properties (never in this file). Without the right key, nothing is returned.
 * ---------------------------------------------------------------------------------------- */
function doGet(e) {
  var key = PropertiesService.getScriptProperties().getProperty('READ_KEY');
  if (!key || !e || !e.parameter || e.parameter.key !== key) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'not allowed' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var responses = [];
  if (sheet && sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, COLUMNS.length).getValues().forEach(function(r) {
      var o = {};
      COLUMNS.forEach(function(c, i) { o[c[0]] = r[i] instanceof Date ? r[i].toISOString() : r[i]; });
      responses.push(o);
    });
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true, total: responses.length, responses: responses }))
    .setMimeType(ContentService.MimeType.JSON);
}
