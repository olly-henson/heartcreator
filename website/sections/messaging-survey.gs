/**
 * Heart Attractor — Messaging Survey (prospects) → Google Sheet
 * Receives POSTs from website/sections/messaging-survey.html, appends one row per response
 * to "Responses" and rebuilds a "Summary" tab that tallies the multiple-choice answers.
 *
 * Setup:
 * 1. Create a new Google Sheet called "Messaging Survey Responses".
 * 2. Extensions > Apps Script. Delete the starter code and paste this whole file. Save.
 * 3. Deploy > New deployment > type "Web app".
 *    Execute as: Me. Who has access: Anyone. Deploy and authorise.
 * 4. Copy the Web app URL into SHEET_URL in messaging-survey.html.
 *
 * Using the answers: select the whole Responses tab, copy it, and paste it into
 * Belief Bridge > "Import survey answers". It turns their words into your messaging.
 *
 * Which answer feeds which step of Belief Bridge (and which beat of the template post):
 *   Love Life / How Long / Age                  → Who
 *   What They're Putting Energy Into            → the opening mirror ("If you're a … spending hours on …")
 *   What They've Put The Most Into              → the exaggeration crack ("You could … 10x … and still …")
 *   Promised Land                               → promised land, in their words
 *   What Still Isn't Happening                  → pain ("But … isn't happening, I bet I know why")
 *   Why It Feels Harder Today                   → what's changed in the world ("unlike 2017 …")
 *   What Hits Hardest                           → bleeding neck pain (relabelled as symptoms later)
 *   "I'll Meet Them Once I…"                    → the current beliefs ("5 things run through their mind")
 *   Why Not Yet                                 → real cause
 *   Advice Sources / Advice That Annoys Them    → where the old belief comes from and the villain
 *   Friends Who Found Their Person vs Them      → your friends crack, with your own numbers
 *   What Would Make Them Hesitate               → risk reversal and the stress test
 *
 * If you change the questions in messaging-survey.html, update COLUMNS and SUMMARY below to match.
 */

var SHEET_NAME = 'Responses';
var SUMMARY_NAME = 'Summary';

var COLUMNS = [
  ['timestamp',          'Timestamp'],
  ['situation',          'Love Life Right Now'],
  ['how_long',           'How Long They\'ve Been Looking'],
  ['effort',             'What They\'re Putting Energy Into'],
  ['most_effort',        'What They\'ve Put The Most Into'],
  ['promised_land',      'Promised Land (A Sunday A Year From Now)'],
  ['pain',               'What Still Isn\'t Happening'],
  ['why_now',            'Why It Feels Harder Today'],
  ['worst',              'What Hits Hardest'],
  ['finish_sentence',    '"I\'ll Meet The Right Person Once I…"'],
  ['why_not_yet',        'Why They Think It Hasn\'t Happened'],
  ['advice_sources',     'Where They Get Advice'],
  ['frustrating_advice', 'Advice That Annoys Them Most'],
  ['friends_compare',    'Have Friends Who Found Their Person Done As Much Work As Them'],
  ['doubts',             'What Would Make Them Hesitate'],
  ['age',                'Age Range'],
  ['source',             'Source']
];

var SUMMARY = [
  { key: 'situation',         label: 'Love life right now' },
  { key: 'how_long',          label: 'How long they\'ve been looking' },
  { key: 'effort',            label: 'What they\'re putting energy into → your opening mirror' },
  { key: 'most_effort',       label: 'What they\'ve put the most into → your exaggeration crack' },
  { key: 'why_now',           label: 'Why it feels harder today → "what\'s changed in the world"' },
  { key: 'worst',             label: 'What hits hardest → your bleeding neck pain list' },
  { key: 'advice_sources',    label: 'Where they get advice → where the old belief comes from' },
  { key: 'friends_compare',   label: 'Have friends who found their person done as much work on themselves? → your friends crack (quote the % honestly)' },
  { key: 'age',               label: 'Age range' }
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
      v = v.replace(/:.*$/, '').trim();   // "Something else: …" counts as "Something else"
      if (v) counts[v] = (counts[v] || 0) + 1;
    });
  });
  return counts;
}

/** Rebuilds the Summary tab: every multiple-choice answer counted, most common first. Can also be run by hand. */
function updateSummary() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return;

  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, COLUMNS.length).getValues();
  var total = rows.length;
  var colIndex = {};
  COLUMNS.forEach(function(c, i) { colIndex[c[0]] = i; });

  var out = [['Total responses', total, '']];
  var headerRows = [0];
  SUMMARY.forEach(function(q) {
    var picks = tally(rows, colIndex[q.key]);
    out.push(['', '', '']);
    headerRows.push(out.length);
    out.push([q.label, 'People', '% of people']);
    Object.keys(picks)
      .sort(function(a, b) { return picks[b] - picks[a]; })
      .forEach(function(k) { out.push([k, picks[k], picks[k] / total]); });
  });
  out.push(['', '', '']);
  out.push(['The written answers are on the Responses tab. Copy that whole tab into Belief Bridge to turn them into messaging.', '', '']);

  var summary = ss.getSheetByName(SUMMARY_NAME) || ss.insertSheet(SUMMARY_NAME, 0);
  summary.clear();
  summary.getRange(1, 1, out.length, 3).setValues(out);
  out.forEach(function(r, i) {
    if (typeof r[2] === 'number') {
      summary.getRange(i + 1, 2).setNumberFormat('0');
      summary.getRange(i + 1, 3).setNumberFormat('0%');
    }
  });
  headerRows.forEach(function(i) { summary.getRange(i + 1, 1, 1, 3).setFontWeight('bold'); });
  summary.setColumnWidth(1, 480);
}
