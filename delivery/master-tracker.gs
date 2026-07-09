// ============================================================
// OLLY HENSON COACHING — Master Client Tracker
// ============================================================
//
// SETUP:
//   1. Create a new Google Sheet called: Master Client Tracker
//   2. Extensions > Apps Script > paste this file > save
//   3. Run setupMasterTrigger() once — approve permissions
//   4. Run syncAllPrograms() to do an immediate sync
//
// HOW IT WORKS:
//   Reads the Master tab from each program sheet every 5 minutes.
//   Active clients → "All Active Clients" tab
//   Completed clients → "Completed Clients" tab (rows appended, never overwritten)
// ============================================================

const PROGRAMMES = [
  {
    name:         'Regulate for Relief',
    sheetId:      '1chK7Tg9Z43l-zQ_JHvpU70GrrxJKBEhA8e_3axacp5I',
    masterTab:    'Master',
    completedTab: 'Completed Program',
    interval:     'weekly',
    scoreFields:  ['pain', 'energy', 'anxiety', 'calmness', 'sleep', 'depressive thoughts', 'focus', 'mood', 'stress resilience'],
  },
  {
    name:         'Release & Let Go',
    sheetId:      '1xehfDNae1GBC5VsLULhB7VN250sYuuNDcRu5-nhTaxY',
    masterTab:    'Master',
    completedTab: 'Completed Program',
    interval:     'weekly',
    scoreFields:  ['sense of lightness', 'energy', 'calmness', 'clarity of mind'],
  },
  {
    name:         'Emotional Mastery',
    sheetId:      '1vdW-EoyQrAt5ZwNGSKnnGq_mGdhALRa1yN7aoQms9C8',
    masterTab:    'Master',
    completedTab: 'Completed Program',
    interval:     'weekly',
    scoreFields:  ['feeling in meditation', 'maintaining the feeling', 'tapping in during the day'],
  },
  {
    name:         'Creative Flow',
    sheetId:      '1sZM7vfzKRtgv4zCnvf6Wm9ATWXST_KPWOnEADJZpKLU',
    masterTab:    'Master',
    completedTab: 'Completed Program',
    interval:     'monthly',
    scoreFields:  ['confidence'],
  },
  {
    name:         '28 Day Heart-Opening Program',
    sheetId:      '1xMvKWHU0uA60_1lGLigzRdxc5cGyeQST5E-5zGI4iwU',
    masterTab:    'Master',
    completedTab: 'Completed Program',
    interval:     'weekly',
    scoreFields:  ['pain', 'energy', 'anxiety', 'calmness', 'sleep', 'depressive thoughts', 'focus', 'mood', 'stress resilience'],
  },
];

const ACTIVE_HEADERS = [
  'Name', 'Email', 'Program', 'Start Date', 'Status',
  'Last Check-In Date', 'Next Check-In Date', 'Week / Month',
  'Scores', 'Wins', 'Synchronicities', 'Needs Help With'
];

const COMPLETED_HEADERS = [
  'Name', 'Email', 'Program', 'Start Date', 'End Date',
  'How They Feel Now', 'Biggest Positive', 'Would Recommend', 'Improvements'
];

// ============================================================
// MAIN SYNC
// ============================================================
function syncAllPrograms() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const activeSheet = getOrCreateSheet(ss, 'All Active Clients');
  activeSheet.clearContents();
  writeHeaders(activeSheet, ACTIVE_HEADERS);

  const completedSheet = getOrCreateSheet(ss, 'Completed Clients');
  // Don't clear completed — append only to preserve history

  // If completed sheet is empty, write headers
  if (completedSheet.getLastRow() === 0) {
    writeHeaders(completedSheet, COMPLETED_HEADERS);
  }

  let totalActive = 0;

  for (const program of PROGRAMMES) {
    const activeRows = getActiveClients(program);
    for (const row of activeRows) {
      activeSheet.appendRow(row);
      totalActive++;
    }

    const completedRows = getCompletedClients(program, completedSheet);
    for (const row of completedRows) {
      completedSheet.appendRow(row);
    }
  }

  // Format and colour active sheet
  formatSheet(activeSheet, ACTIVE_HEADERS.length, [4, 6, 7]); // date cols: Start Date=4, Last Check-In=6, Next Check-In=7
  colourStatusColumn(activeSheet, 5); // Status = col 5

  // Format completed sheet
  formatSheet(completedSheet, COMPLETED_HEADERS.length, [4, 5]); // Start Date=4, End Date=5

  Logger.log('Sync complete. Active clients: ' + totalActive);
}

// ============================================================
// READ ACTIVE CLIENTS
// ============================================================
function getActiveClients(program) {
  try {
    const sheet = SpreadsheetApp.openById(program.sheetId).getSheetByName(program.masterTab);
    if (!sheet || sheet.getLastRow() <= 1) return [];

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).toLowerCase().trim());
    const rows = [];

    const col = {
      name:       findCol(headers, ['name']),
      email:      findCol(headers, ['email']),
      startDate:  findCol(headers, ['start date']),
      nextCheckin: findCol(headers, ['next check-in', 'next checkin']),
      status:     findCol(headers, ['status']),
      week:       findCol(headers, ['current week', 'week', 'month', 'week / month']),
      wins:       findCol(headers, ['wins this month', 'wins']),
      sync:       findCol(headers, ['synchronicities this month', 'synchronicities']),
      needs:      findCol(headers, ['needs help with', 'needs']),
    };

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const name = col.name !== -1 ? String(row[col.name] || '').trim() : '';
      const email = col.email !== -1 ? String(row[col.email] || '').trim() : '';
      if (!name && !email) continue;

      const startDate   = col.startDate !== -1 ? row[col.startDate] : '';
      const nextCheckin = col.nextCheckin !== -1 ? row[col.nextCheckin] : '';
      const status      = col.status !== -1 ? String(row[col.status] || '').trim() : '';
      const weekMonth   = col.week !== -1 ? row[col.week] : '';
      const wins        = col.wins !== -1 ? String(row[col.wins] || '').trim() : '';
      const sync        = col.sync !== -1 ? String(row[col.sync] || '').trim() : '';
      const needs       = col.needs !== -1 ? String(row[col.needs] || '').trim() : '';

      // Last check-in = Next check-in minus interval
      const lastCheckin = calcLastCheckin(nextCheckin, program.interval);

      // Scores — find each score field by header name
      const scoreParts = [];
      for (const field of program.scoreFields) {
        const idx = findCol(headers, [field]);
        if (idx !== -1 && row[idx] !== '' && row[idx] !== null && row[idx] !== undefined) {
          const label = toTitleCase(field);
          scoreParts.push(label + ': ' + row[idx]);
        }
      }
      const scores = scoreParts.join(' | ');

      rows.push([
        name, email, program.name,
        startDate, status,
        lastCheckin, nextCheckin,
        weekMonth, scores, wins, sync, needs
      ]);
    }

    return rows;
  } catch (e) {
    Logger.log('Error reading active clients for ' + program.name + ': ' + e.message);
    return [];
  }
}

// ============================================================
// READ COMPLETED CLIENTS (append only — no duplicates)
// ============================================================
function getCompletedClients(program, completedSheet) {
  try {
    const sheet = SpreadsheetApp.openById(program.sheetId).getSheetByName(program.completedTab);
    if (!sheet || sheet.getLastRow() <= 1) return [];

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).toLowerCase().trim());

    // Get existing emails+program combos already in completed sheet to avoid duplicates
    const existing = getExistingCompletedKeys(completedSheet);

    const col = {
      name:       findCol(headers, ['name']),
      email:      findCol(headers, ['email']),
      startDate:  findCol(headers, ['start date']),
      endDate:    findCol(headers, ['completion date', 'end date']),
      howFeel:    findCol(headers, ['how do you feel', 'how they feel', 'how feel']),
      biggestPos: findCol(headers, ['biggest positive', 'biggest pos']),
      recommend:  findCol(headers, ['recommend']),
      improve:    findCol(headers, ['improvements', 'improve']),
    };

    const rows = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const name  = col.name !== -1 ? String(row[col.name] || '').trim() : '';
      const email = col.email !== -1 ? String(row[col.email] || '').trim() : '';
      if (!name && !email) continue;

      const key = email.toLowerCase() + '|' + program.name;
      if (existing.has(key)) continue; // already in master completed tab

      const startDate  = col.startDate !== -1 ? row[col.startDate] : '';
      const endDate    = col.endDate !== -1 ? row[col.endDate] : '';
      const howFeel    = col.howFeel !== -1 ? String(row[col.howFeel] || '').trim() : '';
      const biggestPos = col.biggestPos !== -1 ? String(row[col.biggestPos] || '').trim() : '';
      const recommend  = col.recommend !== -1 ? String(row[col.recommend] || '').trim() : '';
      const improve    = col.improve !== -1 ? String(row[col.improve] || '').trim() : '';

      rows.push([
        name, email, program.name,
        startDate, endDate,
        howFeel, biggestPos, recommend, improve
      ]);
    }

    return rows;
  } catch (e) {
    Logger.log('Error reading completed clients for ' + program.name + ': ' + e.message);
    return [];
  }
}

function getExistingCompletedKeys(completedSheet) {
  const keys = new Set();
  if (completedSheet.getLastRow() <= 1) return keys;
  const data = completedSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const email = String(data[i][1] || '').trim().toLowerCase();
    const program = String(data[i][2] || '').trim();
    if (email && program) keys.add(email + '|' + program);
  }
  return keys;
}

// ============================================================
// HELPERS
// ============================================================
function calcLastCheckin(nextCheckin, interval) {
  if (!nextCheckin) return '';
  const d = new Date(nextCheckin);
  if (isNaN(d.getTime())) return '';
  if (interval === 'monthly') {
    d.setMonth(d.getMonth() - 1);
  } else {
    d.setDate(d.getDate() - 7);
  }
  return d;
}

function findCol(headers, candidates) {
  for (const candidate of candidates) {
    const idx = headers.indexOf(candidate);
    if (idx !== -1) return idx;
  }
  // Partial match fallback
  for (const candidate of candidates) {
    const idx = headers.findIndex(h => h.includes(candidate));
    if (idx !== -1) return idx;
  }
  return -1;
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1));
}

function getOrCreateSheet(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function writeHeaders(sheet, headers) {
  sheet.appendRow(headers);
  const range = sheet.getRange(1, 1, 1, headers.length);
  range.setFontWeight('bold');
  range.setBackground('#111111');
  range.setFontColor('#ffffff');
}

function formatSheet(sheet, numCols, dateCols) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  const dataRows = lastRow - 1;

  for (const col of dateCols) {
    sheet.getRange(2, col, dataRows, 1).setNumberFormat('d MMMM yyyy');
  }

  for (let col = 1; col <= numCols; col++) {
    sheet.autoResizeColumn(col);
  }
}

function colourStatusColumn(sheet, colNum) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  for (let i = 2; i <= lastRow; i++) {
    const cell = sheet.getRange(i, colNum);
    const val = String(cell.getValue()).toLowerCase();
    if (val.includes('🟢') || val.includes('well') || val.includes('completely confident')) {
      cell.setBackground('#e8f5e9');
    } else if (val.includes('🟡') || val.includes('okay') || val.includes('kind of confident')) {
      cell.setBackground('#fff9c4');
    } else if (val.includes('🔴') || val.includes('help') || val.includes('not confident')) {
      cell.setBackground('#ffebee');
    }
  }
}

// ============================================================
// SETUP — run once
// ============================================================
function setupMasterTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('syncAllPrograms')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('Master tracker trigger live. Syncing every 5 minutes.');
}
