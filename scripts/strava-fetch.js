#!/usr/bin/env node
// Fetches all Strava activities and writes strava-cache.json to the repo root.
// Required env vars: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN

const fs = require("fs");
const path = require("path");

const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } = process.env;

if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
  console.error("Missing env vars: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN");
  process.exit(1);
}

// Browser-like headers to pass Strava's CloudFront WAF.
const BASE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Origin": "https://www.strava.com",
  "Referer": "https://www.strava.com/",
};

async function main() {
  // Token refresh — send as form-encoded (what browsers send to OAuth endpoints).
  console.log("Refreshing Strava access token…");
  const tokenRes = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { ...BASE_HEADERS, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:     STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type:    "refresh_token",
      refresh_token: STRAVA_REFRESH_TOKEN,
    }),
  });
  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`Token refresh HTTP ${tokenRes.status}: ${text}`);
  }
  const { access_token, expires_at } = await tokenRes.json();
  console.log(`Token valid until ${new Date(expires_at * 1000).toISOString()}`);

  // Paginate all activities.
  const all = [];
  let page = 1;
  while (page <= 50) {
    process.stdout.write(`Fetching page ${page}… `);
    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=200&page=${page}`,
      { headers: { ...BASE_HEADERS, Authorization: `Bearer ${access_token}` } }
    );
    if (!res.ok) throw new Error(`Activities HTTP ${res.status}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || !batch.length) { console.log("done."); break; }
    all.push(...batch);
    console.log(`${all.length} activities`);
    if (batch.length < 200) break;
    page++;
  }

  const outPath = path.join(__dirname, "..", "strava-cache.json");
  fs.writeFileSync(outPath, JSON.stringify({ at: Date.now(), data: all }));
  const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`Wrote strava-cache.json — ${all.length} activities, ${kb} KB`);
}

main().catch((err) => { console.error(err.message); process.exit(1); });
