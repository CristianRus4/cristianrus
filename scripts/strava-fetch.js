#!/usr/bin/env node
// Fetches all Strava activities and writes strava-cache.json to the repo root.
// Required env vars: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN

const https = require("https");
const fs = require("fs");
const path = require("path");

const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } = process.env;

if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
  console.error("Missing env vars: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN");
  process.exit(1);
}

const UA = "Mozilla/5.0 (compatible; strava-cache-bot/1.0)";

function post(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = https.request(
      { hostname: u.hostname, path: u.pathname, method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data), "User-Agent": UA } },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300)
            return reject(new Error(`HTTP ${res.statusCode}: ${raw}`));
          resolve(JSON.parse(raw));
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    https
      .get(
        { hostname: u.hostname, path: u.pathname + u.search,
          headers: { Authorization: `Bearer ${token}`, "User-Agent": UA } },
        (res) => {
          let raw = "";
          res.on("data", (c) => (raw += c));
          res.on("end", () => {
            if (res.statusCode < 200 || res.statusCode >= 300)
              return reject(new Error(`HTTP ${res.statusCode}: ${raw}`));
            resolve(JSON.parse(raw));
          });
        }
      )
      .on("error", reject);
  });
}

async function main() {
  console.log("Refreshing Strava access token…");
  const tokenData = await post("https://www.strava.com/oauth/token", {
    client_id: STRAVA_CLIENT_ID,
    client_secret: STRAVA_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: STRAVA_REFRESH_TOKEN,
  });
  const { access_token: accessToken } = tokenData;
  console.log(`Token valid until ${new Date(tokenData.expires_at * 1000).toISOString()}`);

  const all = [];
  const perPage = 200;
  let page = 1;
  while (page <= 50) {
    process.stdout.write(`Fetching page ${page}… `);
    const batch = await get(
      `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&page=${page}`,
      accessToken
    );
    if (!Array.isArray(batch) || !batch.length) { console.log("done."); break; }
    all.push(...batch);
    console.log(`${all.length} activities`);
    if (batch.length < perPage) break;
    page++;
  }

  const outPath = path.join(__dirname, "..", "strava-cache.json");
  fs.writeFileSync(outPath, JSON.stringify({ at: Date.now(), data: all }));
  const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`Wrote strava-cache.json — ${all.length} activities, ${kb} KB`);
}

main().catch((err) => { console.error(err.message); process.exit(1); });
