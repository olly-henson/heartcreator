/**
 * fetch_metrics.mjs
 * Pulls live data from connected APIs and creates (or updates) the current
 * month's row in the Business Metrics Notion database.
 *
 * Run: node fetch_metrics.mjs
 *
 * APIs supported:
 *   ✅ GHL  — Email subscribers + active customers (token in .env)
 *   ⏳ YouTube — needs YOUTUBE_API_KEY added to .env
 *   ⏳ Instagram — needs IG_ACCESS_TOKEN added to .env
 *   ⏳ Skool — no public API yet; enter manually
 *   ⏳ Website — needs GA4 credentials added to .env
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve("C:/Users/Olly/AI OS/marketing/.env");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => l.split("=").map(p => p.trim()))
);

const NOTION_TOKEN = env["NOTION_API_TOKEN"];
const DB_ID = "36e30e58-6a0d-8187-ac85-d3b16d11e297";
const SNAPSHOT = {
  youtube:   env["SNAPSHOT_YOUTUBE_ID"],
  instagram: env["SNAPSHOT_INSTAGRAM_ID"],
  email:     env["SNAPSHOT_EMAIL_ID"],
  skool:     env["SNAPSHOT_SKOOL_ID"],
  customers: env["SNAPSHOT_CUSTOMERS_ID"],
  website:   env["SNAPSHOT_WEBSITE_ID"],
  revenue:   env["SNAPSHOT_REVENUE_ID"],
  expenses:  env["SNAPSHOT_EXPENSES_ID"],
  profit:    env["SNAPSHOT_PROFIT_ID"],
  timestamp: env["SNAPSHOT_TIMESTAMP_ID"],
};
const GHL_TOKEN = env["GHL_PIT_TOKEN"];
const GHL_LOCATION = env["GHL_LOCATION_ID"];
const YOUTUBE_API_KEY = env["YOUTUBE_API_KEY"];
const YOUTUBE_CHANNEL_ID = env["YOUTUBE_CHANNEL_ID"] || "";
const GA_CLIENT_ID = env["GA_CLIENT_ID"];
const GA_CLIENT_SECRET = env["GA_CLIENT_SECRET"];
const GA_REFRESH_TOKEN = env["GA_REFRESH_TOKEN"];
const GA_PROPERTY_ID = env["GA_PROPERTY_ID"];
const REGULATE_SHEET_ID = env["REGULATE_SHEET_ID"];
const CUSTOMER_SATISFACTION_DB = "36e30e58-6a0d-81b2-9f0c-fb3ba412015d";

const notionHeaders = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
};

function currentPeriod() {
  const now = new Date();
  return {
    label: now.toLocaleString("en-GB", { month: "long", year: "numeric" }),
    start: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
  };
}

// ── GHL: count contacts tagged "back to life prospect" ───────────────────
async function fetchGHLEmailSubscribers() {
  const TAG = "back to life prospect";
  try {
    let total = 0;
    let after = null;
    do {
      const url = new URL(`https://services.leadconnectorhq.com/contacts/`);
      url.searchParams.set("locationId", GHL_LOCATION);
      url.searchParams.set("limit", "100");
      if (after) url.searchParams.set("startAfter", after);
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${GHL_TOKEN}`, Version: "2021-07-28" },
      });
      const data = await res.json();
      const contacts = data?.contacts ?? [];
      total += contacts.filter(c => c.tags?.includes(TAG)).length;
      after = contacts.length === 100 ? contacts[contacts.length - 1].id : null;
    } while (after);
    return total;
  } catch { return null; }
}

// ── GHL: count contacts tagged "back to life customers" ──────────────────
async function fetchGHLCustomers() {
  const TAG = "back to life customers";
  try {
    let total = 0;
    let after = null;
    do {
      const url = new URL(`https://services.leadconnectorhq.com/contacts/`);
      url.searchParams.set("locationId", GHL_LOCATION);
      url.searchParams.set("limit", "100");
      if (after) url.searchParams.set("startAfter", after);
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${GHL_TOKEN}`, Version: "2021-07-28" },
      });
      const data = await res.json();
      const contacts = data?.contacts ?? [];
      total += contacts.filter(c => c.tags?.includes(TAG)).length;
      after = contacts.length === 100 ? contacts[contacts.length - 1].id : null;
    } while (after);
    return total;
  } catch { return null; }
}

// ── GA4: website visits last 30 days ─────────────────────────────────────
async function fetchWebsiteVisits() {
  if (!GA_REFRESH_TOKEN || !GA_PROPERTY_ID) return null;
  try {
    // Refresh token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: GA_REFRESH_TOKEN, client_id: GA_CLIENT_ID, client_secret: GA_CLIENT_SECRET }),
    });
    const { access_token } = await tokenRes.json();

    // Query sessions for last 30 days
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA_PROPERTY_ID}:runReport`, {
      method: "POST",
      headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        metrics: [{ name: "sessions" }],
      }),
    });
    const data = await res.json();
    return parseInt(data?.rows?.[0]?.metricValues?.[0]?.value) || 0;
  } catch { return null; }
}

// ── YouTube: full channel stats + monthly analytics ───────────────────────
async function fetchYouTubeData() {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) return null;
  try {
    // Refresh token for Analytics API
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: env["GA_REFRESH_TOKEN"], client_id: env["GA_CLIENT_ID"], client_secret: env["GA_CLIENT_SECRET"] }),
    });
    const { access_token } = await tokenRes.json();

    // Current subscriber count (Data API)
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
    );
    const statsData = await statsRes.json();
    const stats = statsData?.items?.[0]?.statistics;

    // Monthly analytics — views, watch time, CTR, retention (Analytics API)
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const endDate = now.toISOString().split("T")[0];

    const analyticsRes = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${YOUTUBE_CHANNEL_ID}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,averageViewPercentage,averageViewDuration,subscribersGained,subscribersLost`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const analyticsData = await analyticsRes.json();
    const row = analyticsData?.rows?.[0];

    // Top video by views this month
    const topVideoRes = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${YOUTUBE_CHANNEL_ID}&startDate=${startDate}&endDate=${endDate}&metrics=views&dimensions=video&sort=-views&maxResults=1`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const topVideoData = await topVideoRes.json();
    const topVideoId = topVideoData?.rows?.[0]?.[0];
    let topVideo = null;
    if (topVideoId) {
      const tvRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${topVideoId}&key=${YOUTUBE_API_KEY}`);
      const tvData = await tvRes.json();
      const title = tvData?.items?.[0]?.snippet?.title ?? "Unknown";
      topVideo = `${title} — https://www.youtube.com/watch?v=${topVideoId}`;
    }

    // Videos published this month (Data API)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const uploadsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${YOUTUBE_CHANNEL_ID}&type=video&publishedAfter=${monthStart}&maxResults=50&key=${YOUTUBE_API_KEY}`
    );
    const uploadsData = await uploadsRes.json();
    const videosThisMonth = uploadsData?.pageInfo?.totalResults ?? 0;

    return {
      subscribers:     parseInt(stats?.subscriberCount) || 0,
      views:           row?.[0] ?? null,
      watchTimeHours:  row?.[1] ? Math.round(row[1] / 60) : null,
      retention:       row?.[2] ? row[2] / 100 : null,
      newSubscribers:  row?.[4] ?? null,
      videosThisMonth,
      topVideo,
    };
  } catch (e) { console.error("YouTube fetch error:", e); return null; }
}

// ── Google Sheets: avg % improvement from Summary Dashboard ──────────────
async function fetchAvgImprovement(accessToken) {
  if (!REGULATE_SHEET_ID) return null;
  try {
    // Read column E (% Improvement) from Summary Dashboard, rows 4-12 (9 metrics)
    const range = encodeURIComponent("Summary Dashboard!E4:E12");
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${REGULATE_SHEET_ID}/values/${range}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await res.json();
    if (!data.values?.length) return null;

    const values = data.values
      .flat()
      .map(v => parseFloat(String(v).replace('%', '').replace('+', '').trim()))
      .filter(v => !isNaN(v) && v !== 0);

    if (!values.length) return null;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(avg * 10) / 10; // e.g. 47.3
  } catch (e) { console.error("Sheets fetch error:", e); return null; }
}

// ── Main ──────────────────────────────────────────────────────────────────
const { label, start } = currentPeriod();
console.log(`\nFetching metrics for: ${label}\n`);

// Get GA access token first (shared by YouTube, GA4, and Sheets)
const gaTokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: GA_REFRESH_TOKEN, client_id: GA_CLIENT_ID, client_secret: GA_CLIENT_SECRET }),
});
const { access_token: gaAccessToken } = await gaTokenRes.json();

const [emailSubs, customers, youtubeData, websiteVisits, avgImprovement] = await Promise.all([
  fetchGHLEmailSubscribers(),
  fetchGHLCustomers(),
  fetchYouTubeData(),
  fetchWebsiteVisits(),
  fetchAvgImprovement(gaAccessToken),
]);
const youtubeSubs = youtubeData?.subscribers ?? null;

const skoolMembers = (emailSubs ?? 0) + (customers ?? 0);

console.log(`Email Subscribers : ${emailSubs ?? "⏳ not connected"}`);
console.log(`Customers         : ${customers ?? "⏳ not connected"}`);
console.log(`Skool Members     : ${skoolMembers} (prospects + customers)`);
console.log(`YouTube Subs      : ${youtubeSubs ?? "⏳ needs YOUTUBE_API_KEY"}`);
console.log(`Instagram         : ⏳ needs IG_ACCESS_TOKEN`);
console.log(`Website Visits    : ${websiteVisits ?? "⏳ not connected"}`);
console.log(`Avg % Improvement : ${avgImprovement !== null ? avgImprovement + "%" : "⏳ no data yet"}`);

// ── Write Avg % Improvement to Customer Satisfaction DB ──────────────────
if (avgImprovement !== null) {
  const csSearch = await fetch(`https://api.notion.com/v1/databases/${CUSTOMER_SATISFACTION_DB}/query`, {
    method: "POST", headers: notionHeaders,
    body: JSON.stringify({ filter: { property: "Period", title: { equals: label } } }),
  }).then(r => r.json());
  const csPage = csSearch.results?.[0];
  const csProps = { "Avg % Improvement": { number: avgImprovement / 100 } };
  if (csPage) {
    await fetch(`https://api.notion.com/v1/pages/${csPage.id}`, {
      method: "PATCH", headers: notionHeaders,
      body: JSON.stringify({ properties: csProps }),
    });
  } else {
    await fetch("https://api.notion.com/v1/pages", {
      method: "POST", headers: notionHeaders,
      body: JSON.stringify({ parent: { database_id: CUSTOMER_SATISFACTION_DB }, properties: { "Period": { title: [{ text: { content: label } }] }, "Date": { date: { start } }, ...csProps } }),
    });
  }
}

// ── Pull latest Avg % Improvement from Customer Satisfaction DB ──────────
const csAllRows = await fetch(`https://api.notion.com/v1/databases/${CUSTOMER_SATISFACTION_DB}/query`, {
  method: "POST", headers: notionHeaders,
  body: JSON.stringify({ page_size: 100 }),
}).then(r => r.json());
const csDisplayRow = csAllRows.results?.find(r => r.properties?.["Avg % Improvement"]?.number != null);
const csAvgImprovement = csDisplayRow?.properties?.["Avg % Improvement"]?.number ?? null;

// ── Website growth % ──────────────────────────────────────────────────────
let websiteMonthGrowth  = null;
let websiteYearGrowth   = null;
let websiteTotalVisits  = null;
let websiteUniqueVisits = null;
if (websiteVisits !== null) {
  const webDbId = env["NOTION_WEBSITE_DB_ID"];
  const allWebRows = await fetch(`https://api.notion.com/v1/databases/${webDbId}/query`, {
    method: "POST", headers: notionHeaders,
    body: JSON.stringify({ page_size: 100 }),
  }).then(r => r.json());

  const webCurrRow  = allWebRows.results?.find(r => r.properties?.Month?.title?.[0]?.plain_text === label);
  const webPrevRow  = allWebRows.results?.find(r => r.properties?.Month?.title?.[0]?.plain_text !== label);
  const webDisplayRow = allWebRows.results?.find(r => (r.properties?.["Total Visits"]?.number ?? 0) > 0);
  websiteTotalVisits  = webDisplayRow?.properties?.["Total Visits"]?.number ?? null;
  websiteUniqueVisits = webDisplayRow?.properties?.["Unique Visitors"]?.number ?? null;
  const webAprilRow = allWebRows.results?.find(r => r.properties?.Month?.title?.[0]?.plain_text === "April 2026");
  const prevVisits  = webPrevRow?.properties?.["Total Visits"]?.number ?? 0;
  const aprilVisits = webAprilRow?.properties?.["Total Visits"]?.number ?? 0;

  websiteMonthGrowth = prevVisits  > 0 ? (websiteVisits - prevVisits)  / prevVisits  : null;
  websiteYearGrowth  = aprilVisits > 0 ? (websiteVisits - aprilVisits) / aprilVisits : null;

  if (webCurrRow) {
    const webProps = { "Total Visits": { number: websiteVisits } };
    if (websiteMonthGrowth !== null) webProps["Overall Growth (%)"] = { number: websiteMonthGrowth };
    if (websiteYearGrowth  !== null) webProps["Year Growth (%)"]    = { number: websiteYearGrowth };
    await fetch(`https://api.notion.com/v1/pages/${webCurrRow.id}`, {
      method: "PATCH", headers: notionHeaders,
      body: JSON.stringify({ properties: webProps }),
    });
  }
  const fmt = v => v === null ? "—" : `${(v * 100).toFixed(1)}%`;
  console.log(`Website Growth    : Month ${fmt(websiteMonthGrowth)} | Year ${fmt(websiteYearGrowth)}`);
}

// ── Sales / Customer growth % ─────────────────────────────────────────────
let customerMonthGrowth  = null;
let customerYearGrowth   = null;
let salesDMConvos        = null;
let salesNewCustomers    = null;
let salesMRR             = null;
if (customers !== null || skoolMembers !== null) {
  const custDbId = env["NOTION_CUSTOMERS_DB_ID"];
  const allCustRows = await fetch(`https://api.notion.com/v1/databases/${custDbId}/query`, {
    method: "POST", headers: notionHeaders,
    body: JSON.stringify({ page_size: 100 }),
  }).then(r => r.json());

  // Pull display figures from most recent row with data
  const custDisplayRow = allCustRows.results?.find(r => r.properties?.["Skool DM Conversations"]?.number > 0 || r.properties?.["New Customers"]?.number > 0 || r.properties?.["MRR ($)"]?.number > 0) ?? allCustRows.results?.[0];
  salesDMConvos     = custDisplayRow?.properties?.["Skool DM Conversations"]?.number ?? null;
  salesNewCustomers = custDisplayRow?.properties?.["New Customers"]?.number ?? null;
  salesMRR          = custDisplayRow?.properties?.["MRR ($)"]?.number ?? null;

  const getTitle = r => r.properties?.Month?.title?.[0]?.plain_text ?? r.properties?.Period?.title?.[0]?.plain_text;
  const custCurrRow  = allCustRows.results?.find(r => getTitle(r) === label);
  const custPrevRow  = allCustRows.results?.find(r => getTitle(r) !== label);
  const custAprilRow = allCustRows.results?.find(r => getTitle(r) === "April 2026");

  const prevCust  = custPrevRow?.properties?.["New Customers"]?.number ?? 0;
  const aprilCust = custAprilRow?.properties?.["New Customers"]?.number ?? 0;
  const prevSkool  = custPrevRow?.properties?.["New Skool Members"]?.number ?? 0;
  const aprilSkool = custAprilRow?.properties?.["New Skool Members"]?.number ?? 0;

  customerMonthGrowth = prevCust  > 0 ? (customers - prevCust)  / prevCust  : null;
  customerYearGrowth  = aprilCust > 0 ? (customers - aprilCust) / aprilCust : null;
  const skoolMonthG  = prevSkool  > 0 ? (skoolMembers - prevSkool)  / prevSkool  : null;
  const skoolYearG   = aprilSkool > 0 ? (skoolMembers - aprilSkool) / aprilSkool : null;

  // Overall growth = avg of customer growth + skool growth
  const growths = [customerMonthGrowth, skoolMonthG].filter(v => v !== null);
  const overallCustGrowth = growths.length > 0 ? growths.reduce((a,b) => a+b,0) / growths.length : null;
  const yearGrowths = [customerYearGrowth, skoolYearG].filter(v => v !== null);
  const overallCustYearGrowth = yearGrowths.length > 0 ? yearGrowths.reduce((a,b) => a+b,0) / yearGrowths.length : null;

  if (custCurrRow) {
    const custProps = {
      "New Customers":    { number: customers ?? 0 },
      "New Skool Members":{ number: skoolMembers ?? 0 },
    };
    if (customerMonthGrowth !== null) custProps["Sales Growth (%)"]      = { number: customerMonthGrowth };
    if (skoolMonthG !== null)         custProps["Conversion Growth (%)"]  = { number: skoolMonthG };
    if (overallCustGrowth !== null)   custProps["Overall Growth (%)"]     = { number: overallCustGrowth };
    if (overallCustYearGrowth !== null) custProps["Year Growth (%)"]      = { number: overallCustYearGrowth };
    await fetch(`https://api.notion.com/v1/pages/${custCurrRow.id}`, {
      method: "PATCH", headers: notionHeaders,
      body: JSON.stringify({ properties: custProps }),
    });
  }
  const fmt = v => v === null ? "—" : `${(v*100).toFixed(1)}%`;
  console.log(`Sales Growth      : Month ${fmt(customerMonthGrowth)} | Year ${fmt(customerYearGrowth)}`);
}

// ── Write to Skool sub-database + calculate growth ────────────────────────
let skoolMonthGrowth    = null;
let skoolYearGrowth     = null;
let skoolAboutVisitors  = null;
let skoolConversionRate = null;
if (skoolMembers !== null) {
  const skoolDbId = env["NOTION_SKOOL_MEMBERS_DB_ID"];
  const allSkoolRows = await fetch(`https://api.notion.com/v1/databases/${skoolDbId}/query`, {
    method: "POST", headers: notionHeaders,
    body: JSON.stringify({ page_size: 100 }),
  }).then(r => r.json());

  const skoolCurrRow  = allSkoolRows.results?.find(r => r.properties?.Month?.title?.[0]?.plain_text === label);
  const skoolPrevRow  = allSkoolRows.results?.find(r => r.properties?.Month?.title?.[0]?.plain_text !== label);
  const skoolAprilRow = allSkoolRows.results?.find(r => r.properties?.Month?.title?.[0]?.plain_text === "April 2026");
  const prevTotal  = skoolPrevRow?.properties?.["Total Members (1)"]?.number ?? skoolPrevRow?.properties?.["Total Members"]?.number ?? 0;
  const aprilTotal = skoolAprilRow?.properties?.["Total Members (1)"]?.number ?? skoolAprilRow?.properties?.["Total Members"]?.number ?? 0;

  skoolMonthGrowth = prevTotal  > 0 ? (skoolMembers - prevTotal)  / prevTotal  : null;
  skoolYearGrowth  = aprilTotal > 0 ? (skoolMembers - aprilTotal) / aprilTotal : null;

  // Pull About Page Visitors and Conversion Rate from most recent row with data
  const skoolDataRow = allSkoolRows.results?.find(r => r.properties?.["About Page Visitors"]?.number > 0);
  skoolAboutVisitors  = skoolDataRow?.properties?.["About Page Visitors"]?.number ?? null;
  skoolConversionRate = skoolDataRow?.properties?.["Conversion Rate"]?.number ?? null;

  const skoolProps = { "Total Members (1)": { number: skoolMembers } };
  if (skoolMonthGrowth !== null) skoolProps["Overall Growth (%)"] = { number: skoolMonthGrowth };
  if (skoolYearGrowth  !== null) skoolProps["Year Growth (%)"]    = { number: skoolYearGrowth };

  if (skoolCurrRow) {
    await fetch(`https://api.notion.com/v1/pages/${skoolCurrRow.id}`, {
      method: "PATCH", headers: notionHeaders,
      body: JSON.stringify({ properties: skoolProps }),
    });
  }
  const fmt = v => v === null ? "—" : `${(v * 100).toFixed(1)}%`;
  console.log(`Skool Growth      : Month ${fmt(skoolMonthGrowth)} | Year ${fmt(skoolYearGrowth)}`);
}

// ── Write to Email sub-database + calculate growth ────────────────────────
let emailMonthGrowth = null;
let emailYearGrowth  = null;
let emailOpenRate    = null;
let emailReplyRate   = null;
if (emailSubs !== null) {
  const emailDbId = env["NOTION_EMAIL_SUBSCRIBERS_DB_ID"];
  const emailSearch = await fetch(`https://api.notion.com/v1/databases/${emailDbId}/query`, {
    method: "POST", headers: notionHeaders,
    body: JSON.stringify({ filter: { property: "Month", title: { equals: label } } }),
  }).then(r => r.json());
  const emailPageId = emailSearch.results?.[0]?.id;

  // Get previous month for growth calc
  const allEmailRows = await fetch(`https://api.notion.com/v1/databases/${emailDbId}/query`, {
    method: "POST", headers: notionHeaders,
    body: JSON.stringify({ page_size: 100 }),
  }).then(r => r.json());
  const emailPrevRow  = allEmailRows.results?.find(r => r.properties?.Month?.title?.[0]?.plain_text !== label);
  const emailAprilRow = allEmailRows.results?.find(r => r.properties?.Month?.title?.[0]?.plain_text === "April 2026");
  const prevSubs  = emailPrevRow?.properties?.["Total Subscribers"]?.number ?? 0;
  const aprilSubs = emailAprilRow?.properties?.["Total Subscribers"]?.number ?? 0;
  emailMonthGrowth = prevSubs  > 0 ? (emailSubs - prevSubs)  / prevSubs  : null;
  emailYearGrowth  = aprilSubs > 0 ? (emailSubs - aprilSubs) / aprilSubs : null;

  // Fallback: if growth still null, use stored value from most recent row
  if (emailMonthGrowth === null && emailPrevRow) {
    emailMonthGrowth = emailPrevRow.properties?.["Overall Growth (%)"]?.number ?? null;
    emailYearGrowth  = emailPrevRow.properties?.["Year Growth (%)"]?.number ?? null;
  }

  // Pull Open Rate and Reply Rate from most recent row with data
  const emailDataRow = allEmailRows.results?.find(r => r.properties?.["Open Rate (%)"]?.number > 0);
  emailOpenRate  = emailDataRow?.properties?.["Open Rate (%)"]?.number ?? null;
  emailReplyRate = emailDataRow?.properties?.["Replies (%)"]?.number ?? null;

  const emailProps = { "Total Subscribers": { number: emailSubs } };
  if (emailMonthGrowth !== null) emailProps["Overall Growth (%)"] = { number: emailMonthGrowth };
  if (emailYearGrowth  !== null) emailProps["Year Growth (%)"]    = { number: emailYearGrowth };

  if (emailPageId) {
    await fetch(`https://api.notion.com/v1/pages/${emailPageId}`, {
      method: "PATCH", headers: notionHeaders,
      body: JSON.stringify({ properties: emailProps }),
    });
  }
  const fmt = v => v === null ? "—" : `${(v * 100).toFixed(1)}%`;
  console.log(`Email Growth      : Month ${fmt(emailMonthGrowth)} | Year ${fmt(emailYearGrowth)}`);
}

// ── Write to YouTube sub-database ─────────────────────────────────────────
if (youtubeData) {
  const ytSubRes = await fetch(`https://api.notion.com/v1/databases/${env["NOTION_YOUTUBE_DB_ID"]}/query`, {
    method: "POST", headers: notionHeaders,
    body: JSON.stringify({ filter: { property: "Period", title: { equals: label } } }),
  }).then(r => r.json());

  const ytSubPageId = ytSubRes.results?.[0]?.id;
  const ytSubProps = {
    "Subscribers":                 { number: youtubeData.subscribers },
    "Videos Published This Month": { number: youtubeData.videosThisMonth },
  };
  if (youtubeData.views !== null)          ytSubProps["Monthly Views"]            = { number: youtubeData.views };
  if (youtubeData.watchTimeHours !== null) ytSubProps["Watch Time (Hours)"]       = { number: youtubeData.watchTimeHours };
  if (youtubeData.retention !== null)      ytSubProps["Audience Retention (%)"]   = { number: youtubeData.retention };
  if (youtubeData.newSubscribers !== null) ytSubProps["New Subscribers"]          = { number: youtubeData.newSubscribers };
  if (youtubeData.topVideo)               ytSubProps["Top Video"]                = { rich_text: [{ text: { content: youtubeData.topVideo } }] };

  if (ytSubPageId) {
    await fetch(`https://api.notion.com/v1/pages/${ytSubPageId}`, {
      method: "PATCH", headers: notionHeaders,
      body: JSON.stringify({ properties: ytSubProps }),
    });
  } else {
    await fetch("https://api.notion.com/v1/pages", {
      method: "POST", headers: notionHeaders,
      body: JSON.stringify({ parent: { database_id: env["NOTION_YOUTUBE_DB_ID"] }, properties: { "Period": { title: [{ text: { content: label } }] }, "Date": { date: { start } }, ...ytSubProps } }),
    });
  }
  console.log(`YouTube DB        : ${youtubeData.subscribers} subs | ${youtubeData.videosThisMonth} videos this month`);
}

// ── Calculate YouTube growth % vs previous month and vs April 2026 ────────
async function calcYouTubeGrowth(currentSubs, currentViews, currentWatchTime) {
  const YOUTUBE_DB = env["NOTION_YOUTUBE_DB_ID"];
  const res = await fetch(`https://api.notion.com/v1/databases/${YOUTUBE_DB}/query`, {
    method: "POST", headers: notionHeaders,
    body: JSON.stringify({ sorts: [{ property: "Date", direction: "descending" }], page_size: 100 }),
  }).then(r => r.json());

  const rows = res.results ?? [];
  const prevRow  = rows.find(r => r.properties?.Period?.title?.[0]?.plain_text !== label);
  const aprilRow = rows.find(r => r.properties?.Period?.title?.[0]?.plain_text === "April 2026");
  if (!prevRow) return null;

  const extract = row => ({
    subs:      row.properties?.["Subscribers"]?.number ?? 0,
    views:     row.properties?.["Monthly Views"]?.number ?? 0,
    watchTime: row.properties?.["Watch Time (Hours)"]?.number ?? 0,
    ctr:       row.properties?.["CTR (%)"]?.number ?? 0,
    retention: row.properties?.["Audience Retention (%)"]?.number ?? 0,
  });

  const growth = (current, previous) => previous === 0 ? null : (current - previous) / previous;
  const avgGrowth = (curr, base) => {
    const vals = ["subs","views","watchTime","ctr","retention"]
      .map(k => growth(curr[k], base[k]))
      .filter(v => v !== null);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };

  const curr = {
    subs:      currentSubs ?? 0,
    views:     currentViews ?? 0,
    watchTime: currentWatchTime ?? 0,
    ctr:       ytCurrentRow?.["CTR (%)"]?.number ?? 0,
    retention: ytCurrentRow?.["Audience Retention (%)"]?.number ?? 0,
  };

  const prev  = extract(prevRow);
  const april = aprilRow ? extract(aprilRow) : null;

  return {
    subs:        growth(curr.subs,      prev.subs),
    views:       growth(curr.views,     prev.views),
    watchTime:   growth(curr.watchTime, prev.watchTime),
    ctr:         growth(curr.ctr,       prev.ctr),
    retention:   growth(curr.retention, prev.retention),
    monthOverall: avgGrowth(curr, prev),
    yearOverall:  april ? avgGrowth(curr, april) : null,
  };
}

// Fetch current YouTube row data for growth calc
const ytRes = await fetch(`https://api.notion.com/v1/databases/${env["NOTION_YOUTUBE_DB_ID"]}/query`, {
  method: "POST", headers: notionHeaders,
  body: JSON.stringify({ filter: { property: "Period", title: { equals: label } } }),
}).then(r => r.json());
const ytCurrentRow = ytRes.results?.[0]?.properties;

// Fetch all YouTube rows to find most recent with data (for display fallback)
const ytAllRes = await fetch(`https://api.notion.com/v1/databases/${env["NOTION_YOUTUBE_DB_ID"]}/query`, {
  method: "POST", headers: notionHeaders,
  body: JSON.stringify({ page_size: 100 }),
}).then(r => r.json());
const ytDisplayRow = ytAllRes.results?.find(r => (r.properties?.["Monthly Views"]?.number ?? 0) > 0)?.properties ?? ytCurrentRow;

const ytSubs      = youtubeData?.subscribers ?? ytCurrentRow?.["Subscribers"]?.number ?? 0;
const ytViews     = youtubeData?.views ?? ytCurrentRow?.["Monthly Views"]?.number ?? 0;
const ytWatchTime = youtubeData?.watchTimeHours ?? ytCurrentRow?.["Watch Time (Hours)"]?.number ?? 0;

const ytGrowth = await calcYouTubeGrowth(ytSubs, ytViews, ytWatchTime);

// ── Instagram growth % from Notion (manual data) ──────────────────────────
async function calcInstagramGrowth() {
  const res = await fetch(`https://api.notion.com/v1/databases/${env["NOTION_INSTAGRAM_DB_ID"]}/query`, {
    method: "POST", headers: notionHeaders,
    body: JSON.stringify({ sorts: [{ property: "Date", direction: "descending" }], page_size: 100 }),
  }).then(r => r.json());

  const rows = res.results ?? [];
  const getTitle = r => r.properties?.Month?.title?.[0]?.plain_text ?? r.properties?.Period?.title?.[0]?.plain_text;
  const currRow  = rows.find(r => getTitle(r) === label);
  const prevRow  = rows.find(r => getTitle(r) !== label);
  const aprilRow = rows.find(r => getTitle(r) === "April 2026");

  // Always pull engagement stats from most recent row with data
  const dataRow = rows.find(r => r.properties?.["Total views"]?.number > 0);
  igViews    = dataRow?.properties?.["Total views"]?.number ?? null;
  igComments = dataRow?.properties?.["Comments"]?.number ?? null;
  igSaves    = dataRow?.properties?.["Saves"]?.number ?? null;
  igShares   = dataRow?.properties?.["Shares"]?.number ?? null;

  // If no current month row yet (manual entry pending), return stored growth from most recent row
  if (!currRow) {
    const latestRow = rows[0];
    if (!latestRow) return null;
    const storedMonth = latestRow.properties?.["Overall Growth (%)"]?.number ?? null;
    const storedYear  = latestRow.properties?.["Year Growth (%)"]?.number ?? null;
    return storedMonth !== null ? { monthGrowth: storedMonth, yearGrowth: storedYear } : null;
  }
  if (!prevRow) return null;

  const extract = row => ({
    followers: row.properties?.["Followers"]?.number ?? 0,
    reached:   row.properties?.["Accounts reached"]?.number ?? 0,
    views:     row.properties?.["Total views"]?.number ?? 0,
  });

  const growth = (curr, prev) => prev === 0 ? null : (curr - prev) / prev;
  const avgGrowth = (curr, base) => {
    const vals = ["followers","reached","views"]
      .map(k => growth(curr[k], base[k]))
      .filter(v => v !== null);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };

  const curr  = extract(currRow);
  const prev  = extract(prevRow);
  const april = aprilRow ? extract(aprilRow) : null;

  const monthGrowth = avgGrowth(curr, prev);
  const yearGrowth  = april ? avgGrowth(curr, april) : null;

  // Write growth % back to Notion
  if (monthGrowth !== null) {
    const igProps = { "Overall Growth (%)": { number: monthGrowth } };
    if (yearGrowth !== null) igProps["Year Growth (%)"] = { number: yearGrowth };
    const followerGrowth = growth(extract(currRow).followers, extract(prevRow).followers);
    const reachGrowth    = growth(extract(currRow).reached,   extract(prevRow).reached);
    if (followerGrowth !== null) igProps["Follower Growth (%)"] = { number: followerGrowth };
    if (reachGrowth    !== null) igProps["Reach Growth (%)"]    = { number: reachGrowth };
    await fetch(`https://api.notion.com/v1/pages/${currRow.id}`, {
      method: "PATCH", headers: notionHeaders,
      body: JSON.stringify({ properties: igProps }),
    });
  }
  return { monthGrowth, yearGrowth };
}

let igViews    = null;
let igComments = null;
let igSaves    = null;
let igShares   = null;
const igGrowthData = await calcInstagramGrowth();
console.log(`Instagram Growth  : Month ${igGrowthData?.monthGrowth != null ? (igGrowthData.monthGrowth*100).toFixed(1)+"%" : "—"} | Year ${igGrowthData?.yearGrowth != null ? (igGrowthData.yearGrowth*100).toFixed(1)+"%" : "—"}`);
const igMonthStr = igGrowthData?.monthGrowth != null ? `${(igGrowthData.monthGrowth * 100).toFixed(1)}%` : "—";
const igYearStr  = igGrowthData?.yearGrowth  != null ? `${(igGrowthData.yearGrowth  * 100).toFixed(1)}%` : "—";

const fmtIg = v => {
  if (!v || v === "—") return { text: "—", color: "gray", positive: null };
  const num = parseFloat(v);
  return num >= 0
    ? { text: `↑ +${v}`, color: "green", positive: true }
    : { text: `↓ ${v}`,  color: "red",   positive: false };
};
const igMonthFmt = fmtIg(igMonthStr);
const igYearFmt  = fmtIg(igYearStr);
const igIsPositive = igMonthFmt.positive ?? igYearFmt.positive;
const igCardColor = igIsPositive === true ? "green_background" : igIsPositive === false ? "red_background" : "pink_background";

const igCallout = {
  color: igCardColor,
  icon: { type: "emoji", emoji: "📸" },
  rich_text: [
    { type: "text", text: { content: "📸  Organic Instagram Growth", link: { url: `https://app.notion.com/p/${env["NOTION_INSTAGRAM_DB_ID"].replace(/-/g,"")}` } }, annotations: { bold: true, color: "default" } },
    { type: "text", text: { content: "\nGrowth this month: " }, annotations: { bold: false, color: "default" } },
    { type: "text", text: { content: igMonthFmt.text }, annotations: { bold: true, color: igMonthFmt.color } },
    { type: "text", text: { content: "\nGrowth this year:  " }, annotations: { bold: false, color: "default" } },
    { type: "text", text: { content: igYearFmt.text },  annotations: { bold: true, color: igYearFmt.color } },
  ],
};

let overallGrowth = null;
let yearGrowth = null;
if (ytGrowth) {
  const ytPageRes = await fetch(`https://api.notion.com/v1/databases/${env["NOTION_YOUTUBE_DB_ID"]}/query`, {
    method: "POST", headers: notionHeaders,
    body: JSON.stringify({ filter: { property: "Period", title: { equals: label } } }),
  }).then(r => r.json());
  const ytPageId = ytPageRes.results?.[0]?.id;
  if (ytPageId) {
    overallGrowth = ytGrowth.monthOverall;
    yearGrowth    = ytGrowth.yearOverall;

    const ytProps = {};
    if (ytGrowth.subs !== null)      ytProps["Subscriber Growth (%)"]  = { number: ytGrowth.subs };
    if (ytGrowth.views !== null)     ytProps["View Growth (%)"]        = { number: ytGrowth.views };
    if (ytGrowth.watchTime !== null) ytProps["Watch Time Growth (%)"]  = { number: ytGrowth.watchTime };
    if (ytGrowth.ctr !== null)       ytProps["CTR Growth (%)"]         = { number: ytGrowth.ctr };
    if (ytGrowth.retention !== null) ytProps["Retention Growth (%)"]   = { number: ytGrowth.retention };
    if (overallGrowth !== null) ytProps["Overall Growth (%)"] = { number: overallGrowth };
    if (yearGrowth !== null)    ytProps["Year Growth (%)"]    = { number: yearGrowth };

    await fetch(`https://api.notion.com/v1/pages/${ytPageId}`, {
      method: "PATCH", headers: notionHeaders,
      body: JSON.stringify({ properties: ytProps }),
    });
    const fmt = v => v === null ? "—" : `${(v * 100).toFixed(1)}%`;
    console.log(`YouTube Growth    : Month ${fmt(overallGrowth)} | Year (from Apr) ${fmt(yearGrowth)}`);
  }
}

// Check if this month's row already exists
const search = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
  method: "POST",
  headers: notionHeaders,
  body: JSON.stringify({
    filter: { property: "Period", title: { equals: label } },
  }),
});
const searchData = await search.json();
const existingPage = searchData?.results?.[0];

// Build properties object — only include values we actually fetched
const props = {
  "Period":      { title: [{ text: { content: label } }] },
  "Date":        { date: { start } },
  "Period Type": { select: { name: "Monthly" } },
};
if (emailSubs !== null)   props["Email Subscribers"]  = { number: emailSubs };
if (customers !== null)   props["Customers"]          = { number: customers };
props["Skool Members"]                                = { number: skoolMembers };
if (youtubeSubs !== null)  props["YouTube Subscribers"]          = { number: youtubeSubs };
if (websiteVisits !== null) props["Website Visits (Last 30 Days)"] = { number: websiteVisits };

if (existingPage) {
  await fetch(`https://api.notion.com/v1/pages/${existingPage.id}`, {
    method: "PATCH",
    headers: notionHeaders,
    body: JSON.stringify({ properties: props }),
  });
  console.log(`\n✅ Updated existing row: ${label}`);
} else {
  await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: notionHeaders,
    body: JSON.stringify({ parent: { database_id: DB_ID }, properties: props }),
  });
  console.log(`\n✅ Created new row: ${label}`);
}

// ── Pull latest Monthly Financials figures ────────────────────────────────
const finAllRows = await fetch(`https://api.notion.com/v1/databases/37230e58-6a0d-81f4-9e9d-e1932a881e5a/query`, {
  method: "POST", headers: notionHeaders,
  body: JSON.stringify({ page_size: 100 }),
}).then(r => r.json());
const finDisplayRow = finAllRows.results?.find(r => (r.properties?.["MRR ($)"]?.number ?? 0) > 0 || (r.properties?.["Total Expenses ($) "]?.rollup?.number ?? 0) > 0);
const finMRR      = finDisplayRow?.properties?.["MRR ($)"]?.number ?? null;
const finExpenses = finDisplayRow?.properties?.["Total Expenses ($) "]?.rollup?.number ?? null;
const finProfit   = finDisplayRow?.properties?.["Profit ($)"]?.formula?.number ?? null;

// ── Update snapshot blocks in-place ──────────────────────────────────────
const now = new Date();
const updatedAt = now.toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

const pageUrl = id => `https://app.notion.com/p/${id.replace(/-/g, "")}`;

function calloutBody(label, pageId, value, color) {
  const display = value !== null ? String(value) : "—";
  return {
    color,
    rich_text: [
      { type: "text", text: { content: label, link: { url: pageUrl(pageId) } }, annotations: { bold: true, color: "default" } },
      { type: "text", text: { content: `\n${display}` }, annotations: { bold: true, color: "default" } },
    ],
  };
}

const fmtGrowth = v => {
  if (v === null || v === undefined) return { text: "—", color: "gray", positive: null };
  const pct = (v * 100).toFixed(1);
  return v >= 0
    ? { text: `↑ +${pct}%`, color: "green", positive: true }
    : { text: `↓ ${pct}%`,  color: "red",   positive: false };
};

const ytMonth = fmtGrowth(overallGrowth);
const ytYear  = fmtGrowth(typeof yearGrowth !== "undefined" ? yearGrowth : null);
const ytIsPositive = ytMonth.positive ?? ytYear.positive;
const ytCardColor = ytIsPositive === true ? "green_background" : ytIsPositive === false ? "red_background" : "brown_background";
const ytOverallDisplay = { month: ytMonth, year: ytYear, color: ytCardColor };

const ytCallout = {
  color: ytOverallDisplay.color,
  icon: { type: "emoji", emoji: "🎬" },
  rich_text: [
    { type: "text", text: { content: "🎬  Organic Long-Form YouTube Growth", link: { url: pageUrl(env["NOTION_YOUTUBE_DB_ID"]) } }, annotations: { bold: true, color: "default" } },
    { type: "text", text: { content: "\nGrowth this month: " }, annotations: { bold: false, color: "default" } },
    { type: "text", text: { content: ytOverallDisplay.month.text }, annotations: { bold: true, color: ytOverallDisplay.month.color } },
    { type: "text", text: { content: "\nGrowth this year:  " }, annotations: { bold: false, color: "default" } },
    { type: "text", text: { content: ytOverallDisplay.year.text },  annotations: { bold: true, color: ytOverallDisplay.year.color } },
  ],
};

const fmtEmailGrowth = (v, subs) => {
  if (v === null || v === undefined) return subs > 0 ? { text: `↑ ${subs} new`, color: "green" } : { text: "—", color: "gray" };
  const pct = (v * 100).toFixed(1);
  return v >= 0 ? { text: `↑ +${pct}%`, color: "green" } : { text: `↓ ${pct}%`, color: "red" };
};
const emailFmtMonth = fmtEmailGrowth(emailMonthGrowth, emailSubs ?? 0);
const emailFmtYear  = fmtEmailGrowth(emailYearGrowth,  emailSubs ?? 0);
const emailCardColor = emailFmtMonth.color === "green" ? "blue_background" : emailFmtMonth.color === "red" ? "red_background" : "blue_background";

const emailCallout = {
  color: emailCardColor,
  icon: { type: "emoji", emoji: "📧" },
  rich_text: [
    { type: "text", text: { content: "📧  Email Campaign Growth", link: { url: pageUrl(env["NOTION_EMAIL_SUBSCRIBERS_DB_ID"]) } }, annotations: { bold: true, color: "default" } },
    { type: "text", text: { content: "\nGrowth this month: " }, annotations: { bold: false, color: "default" } },
    { type: "text", text: { content: emailFmtMonth.text }, annotations: { bold: true, color: emailFmtMonth.color } },
    { type: "text", text: { content: "\nGrowth this year:  " }, annotations: { bold: false, color: "default" } },
    { type: "text", text: { content: emailFmtYear.text }, annotations: { bold: true, color: emailFmtYear.color } },
  ],
};

// Build combined Marketing block
const mktFmt = (v) => v !== null ? `${v >= 0 ? "↑ +" : "↓ "}${(v * 100).toFixed(1)}%` : "—";
const mktColor = (v) => v === null ? "gray" : v >= 0 ? "green" : "red";
const overallMktGrowths = [overallGrowth, igGrowthData?.monthGrowth, emailMonthGrowth, skoolMonthGrowth, websiteMonthGrowth].filter(v => v !== null);
const overallMktScore = overallMktGrowths.length > 0 ? overallMktGrowths.reduce((a,b) => a+b, 0) / overallMktGrowths.length : null;
const marketingBlock = {
  color: overallMktScore > 0 ? "green_background" : overallMktScore < 0 ? "red_background" : "gray_background",
  icon: { type: "emoji", emoji: "📊" },
  rich_text: [
    { type: "text", text: { content: "📊  Marketing" }, annotations: { bold: true, color: "default" } },
    { type: "text", text: { content: "\nMarketing Figures to beat this month:" }, annotations: { bold: false, italic: true, color: "default" } },
    { type: "text", text: { content: "\n🎬  YouTube", link: { url: pageUrl(env["NOTION_YOUTUBE_DB_ID"]) } }, annotations: { bold: false, color: "default" } },
    { type: "text", text: { content: ":    Views: " + ((ytDisplayRow?.["Monthly Views"]?.number ?? 0) > 0 ? ytDisplayRow["Monthly Views"].number.toLocaleString() : "—") + "  |  CTR: " + (ytDisplayRow?.["CTR (%)"]?.number != null ? `${(ytDisplayRow["CTR (%)"].number * 100).toFixed(1)}%` : "—") + "  |  Retention: " + (ytDisplayRow?.["Audience Retention (%)"]?.number != null ? `${(ytDisplayRow["Audience Retention (%)"].number * 100).toFixed(1)}%` : "—") }, annotations: { bold: true, color: "default" } },
    { type: "text", text: { content: "\n📸  Instagram", link: { url: pageUrl(env["NOTION_INSTAGRAM_DB_ID"]) } }, annotations: { bold: false, color: "default" } },
    { type: "text", text: { content: ":  Views: " + (igViews !== null ? igViews.toLocaleString() : "—") + "  |  Comments: " + (igComments !== null ? String(igComments) : "—") + "  |  Saves: " + (igSaves !== null ? String(igSaves) : "—") + "  |  Shares: " + (igShares !== null ? String(igShares) : "—") }, annotations: { bold: true, color: "default" } },
    { type: "text", text: { content: "\n📧  Email", link: { url: pageUrl(env["NOTION_EMAIL_SUBSCRIBERS_DB_ID"]) } }, annotations: { bold: false, color: "default" } },
    { type: "text", text: { content: ":      Open Rate: " + (emailOpenRate !== null ? `${(emailOpenRate * 100).toFixed(1)}%` : "—") + "  |  Reply Rate: " + (emailReplyRate !== null ? `${(emailReplyRate * 100).toFixed(1)}%` : "—") }, annotations: { bold: true, color: "default" } },
    { type: "text", text: { content: "\n🏫  Skool", link: { url: pageUrl(env["NOTION_SKOOL_MEMBERS_DB_ID"]) } }, annotations: { bold: false, color: "default" } },
    { type: "text", text: { content: ":      About Page Visitors: " + (skoolAboutVisitors !== null ? String(skoolAboutVisitors) : "—") + "  |  Conversion Rate: " + (skoolConversionRate !== null ? `${(skoolConversionRate * 100).toFixed(1)}%` : "—") }, annotations: { bold: true, color: "default" } },
    { type: "text", text: { content: "\n🌐  Website", link: { url: pageUrl(env["NOTION_WEBSITE_DB_ID"]) } }, annotations: { bold: false, color: "default" } },
    { type: "text", text: { content: ":    Total Visits: " + (websiteTotalVisits !== null ? websiteTotalVisits.toLocaleString() : "—") + "  |  Unique Visitors: " + (websiteUniqueVisits !== null ? websiteUniqueVisits.toLocaleString() : "—") }, annotations: { bold: true, color: "default" } },
  ],
};

const snapshotUpdates = [
  [SNAPSHOT.youtube, marketingBlock],
  [SNAPSHOT.customers, {
    color: customerMonthGrowth > 0 ? "green_background" : customerMonthGrowth < 0 ? "red_background" : "purple_background",
    icon: { type: "emoji", emoji: "🚀" },
    rich_text: [
      { type: "text", text: { content: "🚀  Delivery" }, annotations: { bold: true, color: "default" } },
      { type: "text", text: { content: "\nDelivery metrics to beat this month:" }, annotations: { bold: false, italic: true, color: "default" } },
      { type: "text", text: { content: "\n🤝  Customer Satisfaction", link: { url: "https://app.notion.com/p/36e30e586a0d81b29f0cfb3ba412015d" } }, annotations: { bold: false, color: "default" } },
      { type: "text", text: { content: ":  Avg % Improvement: " + (csAvgImprovement !== null ? `${(csAvgImprovement * 100).toFixed(1)}%` : "—") }, annotations: { bold: true, color: "default" } },
    ],
  }],
  [SNAPSHOT.revenue, {
    color: "yellow_background",
    icon: { type: "emoji", emoji: "💵" },
    rich_text: [
      { type: "text", text: { content: "💵  Sales" }, annotations: { bold: true, color: "default" } },
      { type: "text", text: { content: "\nSales figures to beat this month:" }, annotations: { bold: false, italic: true, color: "default" } },
      { type: "text", text: { content: "\n💰  Sales Growth", link: { url: pageUrl(env["NOTION_CUSTOMERS_DB_ID"]) } }, annotations: { bold: false, color: "default" } },
      { type: "text", text: { content: ":  Skool DM Conversations: " + (salesDMConvos !== null ? String(salesDMConvos) : "—") + "  |  New Customers: " + (salesNewCustomers !== null ? String(salesNewCustomers) : "—") + "  |  MRR: $" + (salesMRR !== null ? salesMRR.toLocaleString() : "—") }, annotations: { bold: true, color: "default" } },
    ],
  }],
  [SNAPSHOT.expenses, {
    color: "red_background",
    icon: { type: "emoji", emoji: "📋" },
    rich_text: [
      { type: "text", text: { content: "📋  Financial Management" }, annotations: { bold: true, color: "default" } },
      { type: "text", text: { content: "\nFinancial numbers to beat this month:" }, annotations: { bold: false, italic: true, color: "default" } },
      { type: "text", text: { content: "\n📈  Finances", link: { url: "https://app.notion.com/p/36e30e586a0d81e2817bfceff7538eef" } }, annotations: { bold: false, color: "default" } },
      { type: "text", text: { content: ":  MRR: $" + (finMRR !== null ? finMRR.toLocaleString() : "—") + "  |  Expenses: $" + (finExpenses !== null ? finExpenses.toLocaleString() : "—") + "  |  Profit: $" + (finProfit !== null ? finProfit.toLocaleString() : "—") }, annotations: { bold: true, color: "default" } },
    ],
  }],
];

for (const [blockId, callout] of snapshotUpdates) {
  await fetch(`https://api.notion.com/v1/blocks/${blockId}`, {
    method: "PATCH",
    headers: notionHeaders,
    body: JSON.stringify({ callout }),
  });
}

await fetch(`https://api.notion.com/v1/blocks/${SNAPSHOT.timestamp}`, {
  method: "PATCH",
  headers: notionHeaders,
  body: JSON.stringify({ paragraph: { rich_text: [{ type: "text", text: { content: `Last updated: ${updatedAt}` }, annotations: { italic: true, color: "gray" } }] } }),
});

console.log(`✅ Snapshot updated on dashboard`);

