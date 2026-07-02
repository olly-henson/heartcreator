// Olly Henson Coaching — GHL Dashboard Sync
// Paste into: Google Sheet → Extensions → Apps Script
// Run: syncAll()

const GHL_TOKEN = "pit-79a4be73-1aad-4884-be31-ab13f2afdd47";
const GHL_LOCATION = "LRqVZmxns8f3xcJLHzBK";
const GA4_PROPERTY_ID = "539372524";

const FIELDS = {
  utm_source:    "O468O9YO86rNRlzVDFvn",
  utm_medium:    "0zyrJerhiHpiUOBriIny",
  utm_campaign:  "qcflgCMJt4hmosuySJa0",
  utm_content:   "zFmOgHptnUj3uxT7l1cL",
  upgrade_path:  "WF9bTjccdEhBYkkFOeTZ",
  sale_date:     "2w5Aow7Fv2H1NLXReiC1",
  contact_type:  "XkL6qkNeZExcLbKJj7cx"
};

const C = {
  bg:      "#0D0D1A",
  card:    "#1A1A2E",
  accent:  "#7B2FBE",
  accent2: "#E040FB",
  text:    "#FFFFFF",
  subtext: "#9B9BC0",
  border:  "#2E2E4A",
  green:   "#00E676",
  yellow:  "#FFD600"
};

const EXCLUDED_PAGES = [
  "/backtolife", "/backtolifetest", "/realitycodetraining",
  "/preview/3TEkDeZyqGd21RUoQj13", "/preview/7ujk1FKGGjo4Ej14QtDS",
  "/preview/DonpxmIJ35PhpcnDGeSS", "/preview/HtpTPMUoOZS9K0e9ADrB",
  "/preview/MlGChnQ0IVDgGpepSVVI", "/preview/iPeHNkPJ3tvkzfIQDynV",
  "/preview/jtzNtVPhewr1nkb51q2a", "/preview/lTqRQuzY1T4n8kaXDROX",
  "/preview/NcHc9RkV3FWYR4sigOyi"
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getField(customFields, key) {
  const id = FIELDS[key];
  if (!customFields) return "";
  const match = customFields.find(f => f.id === id);
  return match ? (match.value || "") : "";
}

function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toISOString().split("T")[0];
}

function getPeriodStarts() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = now.getDay();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + (day === 0 ? -6 : 1));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(2026, 5, 17); // 2026-06-17 — funnel go-live date
  return { todayStart, weekStart, monthStart, yearStart };
}

function countByPeriods(arr, dateGetter) {
  const { todayStart, weekStart, monthStart, yearStart } = getPeriodStarts();
  const counts = { today: 0, week: 0, month: 0, year: 0, all: arr.length };
  arr.forEach(item => {
    const d = dateGetter(item);
    if (!d) return;
    const date = new Date(d);
    if (date >= todayStart) counts.today++;
    if (date >= weekStart)  counts.week++;
    if (date >= monthStart) counts.month++;
    if (date >= yearStart)  counts.year++;
  });
  return counts;
}

function conv(a, b) {
  if (!b) return "—";
  return Math.round(a / b * 1000) / 10 + " %";
}

// ─── GHL FETCHERS ────────────────────────────────────────────────────────────
function fetchAllContacts() {
  let contacts = [], page = 1;
  while (true) {
    const url = `https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION}&limit=100&page=${page}`;
    const res = UrlFetchApp.fetch(url, {
      headers: { "Authorization": `Bearer ${GHL_TOKEN}`, "Version": "2021-07-28" },
      muteHttpExceptions: true
    });
    const data = JSON.parse(res.getContentText());
    const batch = data.contacts || [];
    contacts = contacts.concat(batch);
    if (batch.length < 100) break;
    page++;
  }
  return contacts;
}

function fetchAllOpportunities() {
  let opportunities = [], page = 1;
  while (true) {
    const url = `https://services.leadconnectorhq.com/opportunities/search?location_id=${GHL_LOCATION}&limit=100&page=${page}`;
    const res = UrlFetchApp.fetch(url, {
      headers: { "Authorization": `Bearer ${GHL_TOKEN}`, "Version": "2021-07-28" },
      muteHttpExceptions: true
    });
    const data = JSON.parse(res.getContentText());
    const batch = data.opportunities || [];
    opportunities = opportunities.concat(batch);
    if (batch.length < 100) break;
    page++;
  }
  return opportunities;
}

// ─── GA4 FETCHERS ────────────────────────────────────────────────────────────
function fetchGA4PageVisitors(pagePath, startDate) {
  const endDate = Utilities.formatDate(new Date(), "UTC", "yyyy-MM-dd");
  const res = AnalyticsData.Properties.runReport({
    dateRanges: [{ startDate: startDate, endDate: endDate }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "activeUsers" }],
    dimensionFilter: { filter: { fieldName: "pagePath", stringFilter: { matchType: "EXACT", value: pagePath } } }
  }, "properties/" + GA4_PROPERTY_ID);
  const rows = res.rows || [];
  return rows.length > 0 ? Number(rows[0].metricValues[0].value) : 0;
}

function fetchGA4AllPages(startDate) {
  const endDate = Utilities.formatDate(new Date(), "UTC", "yyyy-MM-dd");
  const res = AnalyticsData.Properties.runReport({
    dateRanges: [{ startDate: startDate, endDate: endDate }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit: 50
  }, "properties/" + GA4_PROPERTY_ID);
  return (res.rows || []).filter(r => !EXCLUDED_PAGES.includes(r.dimensionValues[0].value));
}

function ga4DateStr(d) { return Utilities.formatDate(d, "UTC", "yyyy-MM-dd"); }

// ─── SHEET WRITER ────────────────────────────────────────────────────────────
function writeSheet(tabName, rows) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(tabName);
  if (!sheet) sheet = ss.insertSheet(tabName);
  sheet.clearContents();
  if (rows.length > 0) sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  Logger.log("✓ " + tabName + " — " + (rows.length - 1) + " rows");
}

// ─── MAIN SYNC ───────────────────────────────────────────────────────────────
function syncAll() {
  Logger.log("Starting sync...");

  const allContacts   = fetchAllContacts();
  const contacts      = allContacts.filter(c => getField(c.customFields, "contact_type") !== "Staff");
  const opportunities = fetchAllOpportunities();
  Logger.log("Contacts: " + contacts.length + " (excl. staff) | Opps: " + opportunities.length);

  const { todayStart, weekStart, monthStart, yearStart } = getPeriodStarts();

  // ── Segments ──────────────────────────────────────────────────────────────
  const allLeads = contacts.filter(c => (c.tags || []).some(t => t.toLowerCase().includes("meditation download")));
  const allApps  = contacts.filter(c => (c.tags || []).some(t => t.toLowerCase().includes("heart creator applicant")));
  const allWon   = opportunities.filter(o => o.status === "won");

  // ── Period counts ─────────────────────────────────────────────────────────
  const leadCounts = countByPeriods(allLeads, c => c.dateAdded);
  const appCounts  = countByPeriods(allApps,  c => c.dateAdded);

  // Sales use sale_date custom field (Unix ms timestamp)
  const saleCounts = countByPeriods(allWon, o => {
    const contact = contacts.find(c => c.email && o.contact && c.email === o.contact.email);
    if (!contact) return null;
    const raw = getField(contact.customFields, "sale_date");
    return raw ? new Date(Number(raw)) : null;
  });

  // ── Pipeline stage counts (all time) ──────────────────────────────────────
  const stageMap = {};
  opportunities.forEach(o => {
    const stage = (o.pipelineStage && o.pipelineStage.name) ? o.pipelineStage.name : "Unknown";
    if (!stageMap[stage]) stageMap[stage] = { count: 0, revenue: 0 };
    stageMap[stage].count++;
    stageMap[stage].revenue += (o.monetaryValue || 0);
  });

  // Pipeline counts by period using sale_date
  function pipelineByPeriod(stageName) {
    const stageOpps = opportunities.filter(o => (o.pipelineStage && o.pipelineStage.name) === stageName);
    return countByPeriods(stageOpps, o => {
      const contact = contacts.find(c => c.email && o.contact && c.email === o.contact.email);
      if (!contact) return null;
      const raw = getField(contact.customFields, "sale_date");
      return raw ? new Date(Number(raw)) : o.createdAt;
    });
  }

  function revenueByPeriod(stageName, from) {
    return opportunities.filter(o => {
      if ((o.pipelineStage && o.pipelineStage.name) !== stageName) return false;
      const contact = contacts.find(c => c.email && o.contact && c.email === o.contact.email);
      const raw = contact ? getField(contact.customFields, "sale_date") : null;
      const date = raw ? new Date(Number(raw)) : new Date(o.createdAt);
      return date >= from;
    }).reduce((sum, o) => sum + (o.monetaryValue || 0), 0);
  }

  // Loom count uses tag so contacts are counted even after moving past that pipeline stage
  const allLooms  = contacts.filter(c => (c.tags || []).some(t => t.toLowerCase().includes("loom sent")));
  const loomCounts = countByPeriods(allLooms, c => c.dateAdded);
  const allOffers     = contacts.filter(c => (c.tags || []).some(t => t.toLowerCase().includes("offer sent")));
  const allOneToOnes  = contacts.filter(c => (c.tags || []).some(t => t.toLowerCase().includes("heart creator 1-2-1")));
  const allCommunity  = contacts.filter(c => (c.tags || []).some(t => t.toLowerCase().includes("heart creator community")));

  const offerCounts     = countByPeriods(allOffers,    c => c.dateAdded);
  const oneToOneCounts  = countByPeriods(allOneToOnes, c => c.dateAdded);
  const communityCounts = countByPeriods(allCommunity, c => c.dateAdded);

  const oneToOneRevenue  = { today: revenueByPeriod("Joined 1-2-1", todayStart), week: revenueByPeriod("Joined 1-2-1", weekStart), month: revenueByPeriod("Joined 1-2-1", monthStart), year: revenueByPeriod("Joined 1-2-1", yearStart), all: (stageMap["Joined 1-2-1"] || {}).revenue || 0 };
  const communityRevenue = { today: revenueByPeriod("Joined Community", todayStart), week: revenueByPeriod("Joined Community", weekStart), month: revenueByPeriod("Joined Community", monthStart), year: revenueByPeriod("Joined Community", yearStart), all: (stageMap["Joined Community"] || {}).revenue || 0 };

  // ── Email → attribution lookup ────────────────────────────────────────────
  const emailToAttr = {};
  contacts.forEach(c => {
    const content = getField(c.customFields, "utm_content");
    const source  = getField(c.customFields, "utm_source");
    if (c.email && content) emailToAttr[c.email] = { content, source };
  });

  // ── Source / medium by period ─────────────────────────────────────────────
  function buildSourceMap(arr) {
    const map = {};
    arr.forEach(c => {
      const src = getField(c.customFields, "utm_source") || "direct";
      const med = getField(c.customFields, "utm_medium") || "";
      const key = med ? src + " / " + med : src;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }

  function filterByDate(arr, from) {
    return arr.filter(c => c.dateAdded && new Date(c.dateAdded) >= from);
  }

  const sourceMapAll   = buildSourceMap(allLeads);
  const sourceMapYear  = buildSourceMap(filterByDate(allLeads, yearStart));
  const sourceMapMonth = buildSourceMap(filterByDate(allLeads, monthStart));
  const sourceMapWeek  = buildSourceMap(filterByDate(allLeads, weekStart));
  const sourceMapToday = buildSourceMap(filterByDate(allLeads, todayStart));

  // ── Platform performance by period ────────────────────────────────────────
  function buildPlatformMap(leads, apps, wons, from) {
    const map = {};
    (from ? filterByDate(leads, from) : leads).forEach(c => {
      const src = getField(c.customFields, "utm_source") || "direct";
      if (!map[src]) map[src] = { leads: 0, applications: 0, sales: 0 };
      map[src].leads++;
    });
    (from ? filterByDate(apps, from) : apps).forEach(c => {
      const src = getField(c.customFields, "utm_source") || "direct";
      if (!map[src]) map[src] = { leads: 0, applications: 0, sales: 0 };
      map[src].applications++;
    });
    wons.forEach(o => {
      const contact = contacts.find(c => c.email && o.contact && c.email === o.contact.email);
      if (!contact) return;
      const raw = getField(contact.customFields, "sale_date");
      const date = raw ? new Date(Number(raw)) : new Date(o.createdAt);
      if (from && date < from) return;
      const attr = emailToAttr[contact.email] || {};
      const src = attr.source || "direct";
      if (!map[src]) map[src] = { leads: 0, applications: 0, sales: 0 };
      map[src].sales++;
    });
    return map;
  }

  const platformAll   = buildPlatformMap(allLeads, allApps, allWon, null);
  const platformYear  = buildPlatformMap(allLeads, allApps, allWon, yearStart);
  const platformMonth = buildPlatformMap(allLeads, allApps, allWon, monthStart);
  const platformWeek  = buildPlatformMap(allLeads, allApps, allWon, weekStart);
  const platformToday = buildPlatformMap(allLeads, allApps, allWon, todayStart);

  // ── Upgrade paths by period ────────────────────────────────────────────────
  function buildUpgradeMap(arr) {
    const map = {};
    arr.forEach(c => {
      const path = getField(c.customFields, "upgrade_path");
      if (path) map[path] = (map[path] || 0) + 1;
    });
    return map;
  }

  const upgradeAll   = buildUpgradeMap(contacts);
  const upgradeYear  = buildUpgradeMap(filterByDate(contacts, yearStart));
  const upgradeMonth = buildUpgradeMap(filterByDate(contacts, monthStart));
  const upgradeWeek  = buildUpgradeMap(filterByDate(contacts, weekStart));
  const upgradeToday = buildUpgradeMap(filterByDate(contacts, todayStart));

  // ── Content performance by period ─────────────────────────────────────────
  function buildContentMap(leads, apps, wons, from) {
    const map = {};
    (from ? filterByDate(leads, from) : leads).forEach(c => {
      const content = getField(c.customFields, "utm_content");
      const source  = getField(c.customFields, "utm_source");
      if (!content) return;
      const key = content + "||" + source;
      if (!map[key]) map[key] = { content, source, leads: 0, applications: 0, sales: 0 };
      map[key].leads++;
    });
    (from ? filterByDate(apps, from) : apps).forEach(c => {
      const content = getField(c.customFields, "utm_content");
      const source  = getField(c.customFields, "utm_source");
      if (!content) return;
      const key = content + "||" + source;
      if (!map[key]) map[key] = { content, source, leads: 0, applications: 0, sales: 0 };
      map[key].applications++;
    });
    wons.forEach(o => {
      const contact = contacts.find(c => c.email && o.contact && c.email === o.contact.email);
      if (!contact) return;
      const raw = getField(contact.customFields, "sale_date");
      const date = raw ? new Date(Number(raw)) : new Date(o.createdAt);
      if (from && date < from) return;
      const attr = emailToAttr[contact.email] || {};
      if (!attr.content) return;
      const key = attr.content + "||" + attr.source;
      if (!map[key]) map[key] = { content: attr.content, source: attr.source, leads: 0, applications: 0, sales: 0 };
      map[key].sales++;
    });
    return map;
  }

  const contentAll   = buildContentMap(allLeads, allApps, allWon, null);
  const contentYear  = buildContentMap(allLeads, allApps, allWon, yearStart);
  const contentMonth = buildContentMap(allLeads, allApps, allWon, monthStart);
  const contentWeek  = buildContentMap(allLeads, allApps, allWon, weekStart);
  const contentToday = buildContentMap(allLeads, allApps, allWon, todayStart);

  // ── GA4 page visits ───────────────────────────────────────────────────────
  const { todayStart: ts, weekStart: ws, monthStart: ms, yearStart: ys } = getPeriodStarts();
  const medVisits = {
    today: fetchGA4PageVisitors("/meditation", ga4DateStr(ts)),
    week:  fetchGA4PageVisitors("/meditation", ga4DateStr(ws)),
    month: fetchGA4PageVisitors("/meditation", "2026-06-17"),
    year:  fetchGA4PageVisitors("/meditation", "2026-06-17"),
    all:   fetchGA4PageVisitors("/meditation", "2026-06-17")
  };
  const appVisits = {
    today: fetchGA4PageVisitors("/coaching-application", ga4DateStr(ts)),
    week:  fetchGA4PageVisitors("/coaching-application", ga4DateStr(ws)),
    month: fetchGA4PageVisitors("/coaching-application", "2026-06-17"),
    year:  fetchGA4PageVisitors("/coaching-application", "2026-06-17"),
    all:   fetchGA4PageVisitors("/coaching-application", "2026-06-17")
  };

  // Website pages by period
  const pageToday = fetchGA4AllPages(ga4DateStr(ts));
  const pageWeek  = fetchGA4AllPages(ga4DateStr(ws));
  const pageMonth = fetchGA4AllPages("2026-06-17");
  const pageYear  = fetchGA4AllPages("2026-06-17");
  const pageAll   = fetchGA4AllPages("2026-06-17");

  // ── Write raw data tabs ───────────────────────────────────────────────────
  writeSheet("Leads", [
    ["Name", "Email", "Created Date", "UTM Source", "UTM Medium", "UTM Content", "Upgrade Path"]
  ].concat(allLeads.map(c => [
    ((c.firstName || "") + " " + (c.lastName || "")).trim(),
    c.email || "", formatDate(c.dateAdded),
    getField(c.customFields, "utm_source"), getField(c.customFields, "utm_medium"),
    getField(c.customFields, "utm_content"), getField(c.customFields, "upgrade_path")
  ])));

  writeSheet("Applications", [
    ["Name", "Email", "Created Date", "UTM Source", "UTM Medium", "UTM Content", "Upgrade Path"]
  ].concat(allApps.map(c => [
    ((c.firstName || "") + " " + (c.lastName || "")).trim(),
    c.email || "", formatDate(c.dateAdded),
    getField(c.customFields, "utm_source"), getField(c.customFields, "utm_medium"),
    getField(c.customFields, "utm_content"), getField(c.customFields, "upgrade_path")
  ])));

  writeSheet("Sales", [
    ["Name", "Contact", "Pipeline Stage", "Value", "Status", "Created Date", "Sale Date"]
  ].concat(opportunities.map(o => {
    const contact = contacts.find(c => c.email && o.contact && c.email === o.contact.email);
    const raw = contact ? getField(contact.customFields, "sale_date") : null;
    return [
      o.name || "",
      (o.contact && o.contact.name) ? o.contact.name : "",
      (o.pipelineStage && o.pipelineStage.name) ? o.pipelineStage.name : (o.status || ""),
      o.monetaryValue || 0, o.status || "",
      formatDate(o.createdAt),
      raw ? formatDate(Number(raw)) : ""
    ];
  })));

  // ── LTV calculation ───────────────────────────────────────────────────────
  const ltvByContact = {};
  allWon.forEach(o => {
    const email = o.contact && o.contact.email ? o.contact.email : null;
    if (!email) return;
    ltvByContact[email] = (ltvByContact[email] || 0) + (o.monetaryValue || 0);
  });
  const ltvValues = Object.values(ltvByContact);
  const ltvCustomers = ltvValues.length;
  const ltvTotal = ltvValues.reduce((s, v) => s + v, 0);
  const ltvAverage = ltvCustomers > 0 ? Math.round(ltvTotal / ltvCustomers) : 0;

  // ── Build Charts ─────────────────────────────────────────────────────────
  buildCharts({
    leadCounts, appCounts, saleCounts,
    medVisits, appVisits,
    sourceMapAll, platformAll, upgradeAll, contentAll,
    pageAll
  });

  // ── Build Dashboard ───────────────────────────────────────────────────────
  buildDashboard({
    leadCounts, appCounts, saleCounts,
    medVisits, appVisits,
    loomCounts, offerCounts, oneToOneCounts, oneToOneRevenue, communityCounts, communityRevenue,
    ltvCustomers, ltvTotal, ltvAverage,
    sourceMapAll, sourceMapYear, sourceMapMonth, sourceMapWeek, sourceMapToday,
    platformAll, platformYear, platformMonth, platformWeek, platformToday,
    upgradeAll, upgradeYear, upgradeMonth, upgradeWeek, upgradeToday,
    contentAll, contentYear, contentMonth, contentWeek, contentToday,
    pageAll, pageYear, pageMonth, pageWeek, pageToday
  });

  Logger.log("✅ Sync complete!");
}

// ─── DASHBOARD BUILDER ────────────────────────────────────────────────────────
function buildDashboard(d) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName("📊 Dashboard");
  if (sh) ss.deleteSheet(sh);
  sh = ss.insertSheet("📊 Dashboard");
  ss.setActiveSheet(sh);
  ss.moveActiveSheet(1);

  sh.setColumnWidth(1, 20);
  sh.setColumnWidth(2, 230);
  sh.setColumnWidth(3, 140);
  sh.setColumnWidth(4, 140);
  sh.setColumnWidth(5, 140);
  sh.setColumnWidth(6, 140);
  sh.setColumnWidth(7, 140);
  for (var i = 8; i <= 25; i++) sh.setColumnWidth(i, 140);

  sh.getRange(1, 1, 300, 25).setBackground(C.bg);

  var row = 2;

  // ── Title ─────────────────────────────────────────────────────────────────
  sh.setRowHeight(row, 50);
  merge(sh, row, 2, 1, 6, "OLLY HENSON COACHING", 22, true, C.accent2, C.bg, "left");
  merge(sh, row, 8, 1, 4, "Last synced: " + new Date().toLocaleString("en-GB"), 10, false, C.subtext, C.bg, "right");
  row += 2;

  // ── FUNNEL OVERVIEW ───────────────────────────────────────────────────────
  sectionHeader(sh, row, "FUNNEL OVERVIEW"); row += 2;
  periodHeaders(sh, row); row++;

  var mv = d.medVisits, av = d.appVisits, lc = d.leadCounts, ac = d.appCounts;

  metricRowMulti(sh, row, "Opt-in Page Visits",  [mv.today, mv.week, mv.month, mv.year, mv.all], C.accent2); row += 3;
  metricRowMulti(sh, row, "Leads",               [lc.today, lc.week, lc.month, lc.year, lc.all], C.accent2); row += 3;
  metricRowMulti(sh, row, "Opt-in Conv Rate",    [conv(lc.today,mv.today), conv(lc.week,mv.week), conv(lc.month,mv.month), conv(lc.year,mv.year), conv(lc.all,mv.all)], C.accent2); row += 3;
  row++;
  metricRowMulti(sh, row, "App Page Visits",     [av.today, av.week, av.month, av.year, av.all], C.accent2); row += 3;
  metricRowMulti(sh, row, "Applications",        [ac.today, ac.week, ac.month, ac.year, ac.all], C.accent2); row += 3;
  metricRowMulti(sh, row, "App Conv Rate",       [conv(ac.today,av.today), conv(ac.week,av.week), conv(ac.month,av.month), conv(ac.year,av.year), conv(ac.all,av.all)], C.accent2); row += 3;

  // ── PIPELINE ──────────────────────────────────────────────────────────────
  row++;
  sectionHeader(sh, row, "PIPELINE — OVERVIEW"); row += 2;
  periodHeaders(sh, row); row++;

  var lc2 = d.loomCounts, oc = d.offerCounts, ac2 = d.appCounts;
  metricRowMulti(sh, row, "Loom Videos Sent",  [lc2.today, lc2.week, lc2.month, lc2.year, lc2.all], C.green); row += 3;
  metricRowMulti(sh, row, "Offers Sent",        [oc.today, oc.week, oc.month, oc.year, oc.all], C.green); row += 3;

  row++;
  sectionHeader(sh, row, "PIPELINE — 1-2-1 ($2,500)"); row += 2;
  periodHeaders(sh, row); row++;

  var otoc = d.oneToOneCounts, otor = d.oneToOneRevenue;
  metricRowMulti(sh, row, "1-2-1 Sales",    [otoc.today, otoc.week, otoc.month, otoc.year, otoc.all], C.green); row += 3;
  metricRowMulti(sh, row, "1-2-1 Revenue",  ["£"+otor.today, "£"+otor.week, "£"+otor.month, "£"+otor.year, "£"+otor.all], C.green); row += 3;
  metricRowMulti(sh, row, "1-2-1 Conv Rate",[conv(otoc.today,oc.today), conv(otoc.week,oc.week), conv(otoc.month,oc.month), conv(otoc.year,oc.year), conv(otoc.all,oc.all)], C.green); row += 3;

  row++;
  sectionHeader(sh, row, "PIPELINE — COMMUNITY ($997)"); row += 2;
  periodHeaders(sh, row); row++;

  var cc = d.communityCounts, cr = d.communityRevenue;
  metricRowMulti(sh, row, "Community Sales",    [cc.today, cc.week, cc.month, cc.year, cc.all], C.yellow); row += 3;
  metricRowMulti(sh, row, "Community Revenue",  ["£"+cr.today, "£"+cr.week, "£"+cr.month, "£"+cr.year, "£"+cr.all], C.yellow); row += 3;
  metricRowMulti(sh, row, "Community Conv Rate",[conv(cc.today,oc.today), conv(cc.week,oc.week), conv(cc.month,oc.month), conv(cc.year,oc.year), conv(cc.all,oc.all)], C.yellow); row += 3;

  // ── LTV ───────────────────────────────────────────────────────────────────
  row++;
  sectionHeader(sh, row, "LIFETIME CUSTOMER VALUE"); row += 2;
  sh.setRowHeight(row, 40);
  merge(sh, row, 2, 1, 6, "Based on all won opportunities per unique customer", 11, false, C.subtext, C.bg, "left"); row++;
  singleMetricRow(sh, row, "Paying Customers", d.ltvCustomers, C.green); row += 3;
  singleMetricRow(sh, row, "Total Revenue",    "£"+d.ltvTotal, C.green); row += 3;
  singleMetricRow(sh, row, "Average LTV",      "£"+d.ltvAverage, C.accent2); row += 3;

  // ── WHERE LEADS COME FROM ────────────────────────────────────────────────
  row++;
  sectionHeader(sh, row, "WHERE LEADS COME FROM"); row += 2;
  periodTableHeader(sh, row, "Source / Medium"); row++;
  const allSources = new Set([
    ...Object.keys(d.sourceMapAll), ...Object.keys(d.sourceMapYear),
    ...Object.keys(d.sourceMapMonth), ...Object.keys(d.sourceMapWeek), ...Object.keys(d.sourceMapToday)
  ]);
  Array.from(allSources).sort().forEach(key => {
    periodTableRow(sh, row, key, [
      d.sourceMapToday[key] || 0, d.sourceMapWeek[key] || 0,
      d.sourceMapMonth[key] || 0, d.sourceMapYear[key] || 0, d.sourceMapAll[key] || 0
    ]); row++;
  });
  if (!allSources.size) { tableRow(sh, row, ["No data yet", "", "", "", "", ""], 2); row++; }
  row += 2;

  // ── PLATFORM PERFORMANCE ─────────────────────────────────────────────────
  sectionHeader(sh, row, "PLATFORM PERFORMANCE"); row += 2;
  const allPlats = new Set([
    ...Object.keys(d.platformAll), ...Object.keys(d.platformYear),
    ...Object.keys(d.platformMonth), ...Object.keys(d.platformWeek), ...Object.keys(d.platformToday)
  ]);

  ["Leads", "Applications", "Sales"].forEach(metric => {
    const mkey = metric.toLowerCase();
    tableHeader(sh, row, [metric + " by Platform", "TODAY", "THIS WEEK", "THIS MONTH", "THIS YEAR", "ALL TIME"], 2); row++;
    Array.from(allPlats).sort().forEach(p => {
      tableRow(sh, row, [
        p,
        (d.platformToday[p] || {})[mkey] || 0,
        (d.platformWeek[p]  || {})[mkey] || 0,
        (d.platformMonth[p] || {})[mkey] || 0,
        (d.platformYear[p]  || {})[mkey] || 0,
        (d.platformAll[p]   || {})[mkey] || 0
      ], 2); row++;
    });
    if (!allPlats.size) { tableRow(sh, row, ["No data yet", "", "", "", "", ""], 2); row++; }
    row++;
  });
  row++;

  // ── UPGRADE PATHS ─────────────────────────────────────────────────────────
  sectionHeader(sh, row, "UPGRADE PATHS"); row += 2;
  periodTableHeader(sh, row, "Path"); row++;
  const allPaths = new Set([
    ...Object.keys(d.upgradeAll), ...Object.keys(d.upgradeYear),
    ...Object.keys(d.upgradeMonth), ...Object.keys(d.upgradeWeek), ...Object.keys(d.upgradeToday)
  ]);
  Array.from(allPaths).sort().forEach(key => {
    periodTableRow(sh, row, key, [
      d.upgradeToday[key] || 0, d.upgradeWeek[key] || 0,
      d.upgradeMonth[key] || 0, d.upgradeYear[key] || 0, d.upgradeAll[key] || 0
    ]); row++;
  });
  if (!allPaths.size) { tableRow(sh, row, ["No data yet", "", "", "", "", ""], 2); row++; }
  row += 2;

  // ── CONTENT PERFORMANCE ───────────────────────────────────────────────────
  sectionHeader(sh, row, "CONTENT PERFORMANCE"); row += 2;

  ["Leads", "Applications", "Sales"].forEach(metric => {
    const mkey = metric.toLowerCase();
    const allKeys = new Set([
      ...Object.keys(d.contentAll), ...Object.keys(d.contentYear),
      ...Object.keys(d.contentMonth), ...Object.keys(d.contentWeek), ...Object.keys(d.contentToday)
    ]);
    tableHeader(sh, row, [metric + " by Content", "Platform", "TODAY", "THIS WEEK", "THIS MONTH", "THIS YEAR", "ALL TIME"], 2); row++;
    Array.from(allKeys).sort().forEach(key => {
      const piece = (d.contentAll[key] || d.contentYear[key] || d.contentMonth[key] || d.contentWeek[key] || d.contentToday[key] || {});
      tableRow(sh, row, [
        piece.content || key.split("||")[0],
        piece.source || key.split("||")[1] || "",
        (d.contentToday[key] || {})[mkey] || 0,
        (d.contentWeek[key]  || {})[mkey] || 0,
        (d.contentMonth[key] || {})[mkey] || 0,
        (d.contentYear[key]  || {})[mkey] || 0,
        (d.contentAll[key]   || {})[mkey] || 0
      ], 2); row++;
    });
    if (!allKeys.size) { tableRow(sh, row, ["No data yet", "", "", "", "", "", ""], 2); row++; }
    row++;
  });
  row++;

  // ── EMAIL PERFORMANCE ─────────────────────────────────────────────────────
  sectionHeader(sh, row, "EMAIL PERFORMANCE"); row += 2;
  ["Leads", "Applications", "Sales"].forEach(metric => {
    const mkey = metric.toLowerCase();
    const emailKeys = new Set(
      [...Object.keys(d.contentAll), ...Object.keys(d.contentYear), ...Object.keys(d.contentMonth), ...Object.keys(d.contentWeek), ...Object.keys(d.contentToday)]
        .filter(k => k.includes("||email"))
    );
    tableHeader(sh, row, [metric + " by Email", "TODAY", "THIS WEEK", "THIS MONTH", "THIS YEAR", "ALL TIME"], 2); row++;
    Array.from(emailKeys).sort().forEach(key => {
      const piece = (d.contentAll[key] || d.contentYear[key] || {});
      tableRow(sh, row, [
        piece.content || key.split("||")[0],
        (d.contentToday[key] || {})[mkey] || 0,
        (d.contentWeek[key]  || {})[mkey] || 0,
        (d.contentMonth[key] || {})[mkey] || 0,
        (d.contentYear[key]  || {})[mkey] || 0,
        (d.contentAll[key]   || {})[mkey] || 0
      ], 2); row++;
    });
    if (!emailKeys.size) { tableRow(sh, row, ["No data yet", "", "", "", "", ""], 2); row++; }
    row++;
  });
  row++;

  // ── WEBSITE PAGES ─────────────────────────────────────────────────────────
  sectionHeader(sh, row, "WEBSITE — UNIQUE VISITORS BY PAGE"); row += 2;

  // Collect all unique pages across all periods
  const allPages = new Set();
  [d.pageAll, d.pageYear, d.pageMonth, d.pageWeek, d.pageToday].forEach(arr => {
    arr.forEach(r => allPages.add(r.dimensionValues[0].value));
  });

  function pageVal(arr, path) {
    const r = arr.find(r => r.dimensionValues[0].value === path);
    return r ? Number(r.metricValues[0].value) : 0;
  }

  tableHeader(sh, row, ["Page", "TODAY", "THIS WEEK", "THIS MONTH", "THIS YEAR", "ALL TIME"], 2); row++;
  Array.from(allPages).sort().forEach(path => {
    tableRow(sh, row, [
      path,
      pageVal(d.pageToday, path),
      pageVal(d.pageWeek, path),
      pageVal(d.pageMonth, path),
      pageVal(d.pageYear, path),
      pageVal(d.pageAll, path)
    ], 2); row++;
  });
  if (!allPages.size) { tableRow(sh, row, ["No data yet", "", "", "", "", ""], 2); row++; }

  Logger.log("✓ Dashboard built — " + row + " rows");
}

// ─── STYLE HELPERS ────────────────────────────────────────────────────────────
function merge(sh, row, col, numRows, numCols, value, fontSize, bold, fontColor, bgColor, align) {
  const r = sh.getRange(row, col, numRows, numCols);
  r.merge();
  r.setValue(value).setFontSize(fontSize || 10).setFontWeight(bold ? "bold" : "normal")
    .setFontColor(fontColor || C.text).setBackground(bgColor || C.bg)
    .setHorizontalAlignment(align || "left").setFontFamily("Arial").setVerticalAlignment("middle");
}

function sectionHeader(sh, row, label) {
  sh.setRowHeight(row, 8);
  merge(sh, row, 2, 1, 20, "", 10, false, C.bg, C.accent, "left");
  sh.setRowHeight(row + 1, 40);
  merge(sh, row + 1, 2, 1, 20, label, 14, true, C.text, C.card, "left");
}

function periodHeaders(sh, row) {
  sh.setRowHeight(row, 40);
  sh.getRange(row, 2).setValue("").setBackground(C.bg);
  ["TODAY", "THIS WEEK", "THIS MONTH", "THIS YEAR", "ALL TIME"].forEach(function(p, i) {
    sh.getRange(row, 3 + i).setValue(p)
      .setFontSize(13).setFontWeight("bold").setFontColor(C.accent2)
      .setBackground(C.bg).setHorizontalAlignment("center").setFontFamily("Arial").setVerticalAlignment("middle");
  });
}

function metricRowMulti(sh, row, label, values, color) {
  sh.setRowHeight(row, 36);
  sh.setRowHeight(row + 1, 65);
  sh.setRowHeight(row + 2, 8);
  sh.getRange(row, 2).setValue(label)
    .setFontSize(13).setFontColor(C.subtext).setBackground(C.card)
    .setHorizontalAlignment("left").setFontFamily("Arial").setVerticalAlignment("middle");
  values.forEach(function(v, i) {
    sh.getRange(row, 3 + i).setValue("").setBackground(C.card);
    sh.getRange(row + 1, 3 + i).setValue(v)
      .setFontSize(32).setFontWeight("bold").setFontColor(color || C.text)
      .setBackground(C.card).setHorizontalAlignment("center").setFontFamily("Arial").setVerticalAlignment("middle")
      .setNumberFormat("@");
  });
  sh.getRange(row + 1, 2).setValue("").setBackground(C.card);
  sh.getRange(row + 2, 2, 1, 7).setBackground(C.border);
}

function singleMetricRow(sh, row, label, value, color) {
  sh.setRowHeight(row, 36);
  sh.setRowHeight(row + 1, 65);
  sh.setRowHeight(row + 2, 8);
  sh.getRange(row, 2).setValue(label)
    .setFontSize(13).setFontColor(C.subtext).setBackground(C.card)
    .setHorizontalAlignment("left").setFontFamily("Arial").setVerticalAlignment("middle");
  sh.getRange(row + 1, 2).setValue(value)
    .setFontSize(32).setFontWeight("bold").setFontColor(color || C.text)
    .setBackground(C.card).setHorizontalAlignment("left").setFontFamily("Arial").setVerticalAlignment("middle");
  sh.getRange(row + 2, 2, 1, 7).setBackground(C.border);
}

function periodTableHeader(sh, row, firstCol) {
  tableHeader(sh, row, [firstCol, "TODAY", "THIS WEEK", "THIS MONTH", "THIS YEAR", "ALL TIME"], 2);
}

function periodTableRow(sh, row, label, values) {
  tableRow(sh, row, [label, values[0], values[1], values[2], values[3], values[4]], 2);
}

function tableHeader(sh, row, cols, startCol) {
  sh.setRowHeight(row, 40);
  cols.forEach(function(label, i) {
    sh.getRange(row, startCol + i).setValue(label)
      .setFontSize(13).setFontWeight("bold").setFontColor(C.accent2)
      .setBackground(C.card).setHorizontalAlignment("left").setFontFamily("Arial").setVerticalAlignment("middle");
  });
}

function tableRow(sh, row, values, startCol) {
  sh.setRowHeight(row, 40);
  values.forEach(function(val, i) {
    sh.getRange(row, startCol + i).setValue(val)
      .setFontSize(16).setFontColor(C.text)
      .setBackground(C.bg).setHorizontalAlignment("left").setFontFamily("Arial").setVerticalAlignment("middle");
  });
}

function ga4DateStr(d) { return Utilities.formatDate(d, "UTC", "yyyy-MM-dd"); }

// ─── CHARTS ───────────────────────────────────────────────────────────────────
function buildCharts(d) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName("📈 Charts");
  if (sh) ss.deleteSheet(sh);
  sh = ss.insertSheet("📈 Charts");

  sh.getRange(1, 1, 400, 20).setBackground(C.bg).setFontColor(C.text).setFontFamily("Arial");
  sh.setColumnWidth(1, 260);
  sh.setColumnWidth(2, 100);
  sh.setColumnWidth(3, 100);
  sh.setColumnWidth(4, 100);

  var dataRow = 2;

  function writeTable(title, headers, rows) {
    sh.getRange(dataRow, 1).setValue(title);
    dataRow++;
    var startRow = dataRow;
    var allRows = [headers].concat(rows);
    sh.getRange(startRow, 1, allRows.length, headers.length).setValues(allRows);
    dataRow += allRows.length + 1;
    return sh.getRange(startRow, 1, allRows.length, headers.length);
  }

  function makeChart(range, type, title, colours, anchor, w, h, legendPos) {
    var builder = sh.newChart()
      .setChartType(type)
      .addRange(range)
      .setPosition(anchor.row, anchor.col, 10, 10)
      .setOption("title", title)
      .setOption("titleTextStyle", { color: C.text, fontSize: 13, bold: true })
      .setOption("backgroundColor", { fill: C.card })
      .setOption("width",  w || 550)
      .setOption("height", h || 320)
      .setOption("legend", { position: legendPos || "none", textStyle: { color: C.subtext, fontSize: 11 } })
      .setOption("chartArea", { backgroundColor: C.card, left: 140, top: 40, width: "55%", height: "75%" });
    if (colours) builder.setOption("colors", colours);
    if (type === Charts.ChartType.BAR || type === Charts.ChartType.COLUMN) {
      builder
        .setOption("hAxis", { textStyle: { color: C.subtext, fontSize: 11 }, gridlines: { color: C.border }, baselineColor: C.border })
        .setOption("vAxis", { textStyle: { color: C.subtext, fontSize: 11 }, gridlines: { color: C.border } });
    }
    if (type === Charts.ChartType.PIE) {
      builder
        .setOption("pieSliceBorderColor", C.bg)
        .setOption("pieSliceTextStyle", { color: C.text, fontSize: 11 })
        .setOption("legend", { position: "right", textStyle: { color: C.subtext, fontSize: 11 } })
        .setOption("chartArea", { left: 20, top: 30, width: "60%", height: "80%" });
    }
    sh.insertChart(builder.build());
  }

  // ── 1. Funnel — sorted largest to smallest (funnel shape) ─────────────────
  var r1 = dataRow;
  var funnelRange = writeTable("Funnel Overview", ["Stage", "Visitors / Count"], [
    ["Opt-in Page Visits", d.medVisits.all],
    ["Leads",             d.leadCounts.all],
    ["App Page Visits",   d.appVisits.all],
    ["Applications",      d.appCounts.all],
    ["Sales",             d.saleCounts.all]
  ]);
  makeChart(funnelRange, Charts.ChartType.BAR, "Funnel — All Time", [C.accent2], { row: r1, col: 6 }, 550, 300);
  dataRow += 3;

  // ── 2. Leads by Source — bar (scales better than pie as sources grow) ──────
  var r2 = dataRow;
  var sourceRows = Object.entries(d.sourceMapAll).sort(function(a,b){ return b[1]-a[1]; });
  if (!sourceRows.length) sourceRows = [["No data yet", 0]];
  var sourceRange = writeTable("Leads by Source", ["Source / Medium", "Leads"], sourceRows);
  makeChart(sourceRange, Charts.ChartType.BAR, "Where Leads Come From — All Time", [C.accent2], { row: r2, col: 6 }, 550, Math.max(280, sourceRows.length * 45 + 80));
  dataRow += 3;

  // ── 3. Platform Performance — grouped column ───────────────────────────────
  var r3 = dataRow;
  var platRows = Object.keys(d.platformAll).sort().map(function(p) {
    return [p, (d.platformAll[p]||{}).leads||0, (d.platformAll[p]||{}).applications||0, (d.platformAll[p]||{}).sales||0];
  });
  if (!platRows.length) platRows = [["No data yet", 0, 0, 0]];
  var platRange = writeTable("Platform Performance", ["Platform", "Leads", "Applications", "Sales"], platRows);
  makeChart(platRange, Charts.ChartType.COLUMN, "Platform Performance — All Time",
    [C.accent2, C.green, C.yellow], { row: r3, col: 6 }, 550, 320, "top");
  dataRow += 3;

  // ── 4. Upgrade Paths — horizontal bar (long labels, easier to read) ────────
  var r4 = dataRow;
  var upgradeRows = Object.entries(d.upgradeAll).sort(function(a,b){ return b[1]-a[1]; });
  if (!upgradeRows.length) upgradeRows = [["No data yet", 0]];
  var upgradeRange = writeTable("Upgrade Paths", ["Path", "Count"], upgradeRows);
  makeChart(upgradeRange, Charts.ChartType.BAR, "How People Find the Application — All Time",
    [C.green], { row: r4, col: 6 }, 550, Math.max(280, upgradeRows.length * 50 + 80));
  dataRow += 3;

  // ── 5. Top Content — grouped bar: leads / apps / sales ────────────────────
  var r5 = dataRow;
  var contentRows = Object.values(d.contentAll)
    .sort(function(a,b){ return b.leads - a.leads; }).slice(0, 10)
    .map(function(c) { return [c.content + " [" + c.source + "]", c.leads, c.applications, c.sales]; });
  if (!contentRows.length) contentRows = [["No data yet", 0, 0, 0]];
  var contentRange = writeTable("Content Performance", ["Content [Platform]", "Leads", "Applications", "Sales"], contentRows);
  makeChart(contentRange, Charts.ChartType.BAR, "Top Content Pieces — All Time",
    [C.accent2, C.green, C.yellow], { row: r5, col: 6 }, 580, Math.max(300, contentRows.length * 40 + 100), "top");
  dataRow += 3;

  // ── 6. Website Pages — horizontal bar sorted by visitors ──────────────────
  var r6 = dataRow;
  var pageRows = d.pageAll.slice(0, 12).map(function(r) {
    return [r.dimensionValues[0].value, Number(r.metricValues[0].value)];
  });
  if (!pageRows.length) pageRows = [["No data yet", 0]];
  var pageRange = writeTable("Website Pages", ["Page", "Unique Visitors"], pageRows);
  makeChart(pageRange, Charts.ChartType.BAR, "Unique Visitors by Page — All Time",
    [C.accent], { row: r6, col: 6 }, 580, Math.max(300, pageRows.length * 35 + 100));

  Logger.log("✓ Charts built");
}

function listCustomFields() {
  const contacts = fetchAllContacts();
  if (!contacts.length) { Logger.log("No contacts"); return; }
  const c = contacts[0];
  Logger.log("Contact: " + c.email);
  (c.customFields || []).forEach(f => Logger.log(f.id + " → " + JSON.stringify(f.value)));
}
