/**
 * reauth_google.mjs
 * Opens a browser to re-authenticate Google with both Calendar + Analytics scopes.
 * Paste the code from the redirect URL back into the terminal when prompted.
 *
 * Run: node reauth_google.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { createServer } from "http";

const envPath = "C:/Users/Olly/AI OS/marketing/.env";
const env = Object.fromEntries(
  readFileSync(envPath, "utf8").split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => l.split("=").map(p => p.trim()))
);

const CLIENT_ID = env["GA_CLIENT_ID"];
const CLIENT_SECRET = env["GA_CLIENT_SECRET"];
const REDIRECT_URI = "http://localhost:3000/callback";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
].join(" ");

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", SCOPES);
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent"); // forces new refresh token

console.log("\n📋 Open this URL in your browser:\n");
console.log(authUrl.toString());
console.log("\nWaiting for Google to redirect back...\n");

// Spin up a local server to catch the redirect
const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:3000");
  const code = url.searchParams.get("code");
  if (!code) { res.end("No code found."); return; }

  res.end("<h2>✅ Authenticated! You can close this tab.</h2>");
  server.close();

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT_URI, grant_type: "authorization_code" }),
  });
  const tokens = await tokenRes.json();
  if (!tokenRes.ok) { console.error("❌ Token exchange failed:", tokens); process.exit(1); }

  // Update .env with new tokens
  let envContent = readFileSync(envPath, "utf8");
  if (tokens.refresh_token) {
    envContent = envContent.replace(/GA_REFRESH_TOKEN=.*/, `GA_REFRESH_TOKEN=${tokens.refresh_token}`);
    envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN=.*/, `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
  }
  writeFileSync(envPath, envContent);

  console.log("✅ New tokens saved to .env");
  console.log("\nNow run: node check_ga4.mjs  — to find your GA4 property ID");
  process.exit(0);
});

server.listen(3000);

// Auto-open browser on Windows
import { exec } from "child_process";
exec(`start "" "${authUrl.toString()}"`);
