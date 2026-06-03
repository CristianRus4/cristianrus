#!/usr/bin/env node
// Fetches all Strava activities → strava-cache.json
// Fetches details for last 2 weeks → strava-sessions.md
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

/* ---- formatters ---- */
function durShort(s) {
  const min = Math.round(s / 60), h = Math.floor(min / 60), m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}
function paceStr(mps, type) {
  if (!mps) return null;
  if (/ride|cycl|ebike|velo|handcycle/i.test(type || "")) return `${(mps * 3.6).toFixed(1)} km/h`;
  const spk = 1000 / mps, mm = Math.floor(spk / 60), ss = Math.round(spk % 60);
  return `${mm}:${String(ss).padStart(2, "0")} /km`;
}
function niceType(t) {
  if (!t) return "Other";
  if (/strength|weight.*training|weighttraining|workout/i.test(t)) return "Strength";
  return t.replace(/([a-z])([A-Z])/g, "$1 $2");
}

/* ---- markdown builder ---- */
function buildSessions(activities) {
  const lines = [
    "# Strava Workouts — Last 2 Weeks",
    `Updated: ${new Date().toISOString().slice(0, 10)}`,
    "",
  ];
  for (const a of activities) {
    const date = (a.start_date_local || a.start_date || "").slice(0, 10);
    const type = niceType(a.sport_type || a.type);
    lines.push(`## ${date} — ${type}`);
    if (a.distance > 0)          lines.push(`- Distance: ${(a.distance / 1000).toFixed(2)} km`);
    if (a.moving_time)           lines.push(`- Moving time: ${durShort(a.moving_time)}`);
    if (a.elapsed_time)          lines.push(`- Elapsed time: ${durShort(a.elapsed_time)}`);
    const pace = paceStr(a.average_speed, type);
    if (pace)                    lines.push(`- Avg pace/speed: ${pace}`);
    if (a.max_speed)             lines.push(`- Max speed: ${(a.max_speed * 3.6).toFixed(1)} km/h`);
    if (a.average_cadence)       lines.push(`- Avg cadence: ${Math.round(a.average_cadence)} rpm`);
    if (a.average_watts != null) lines.push(`- Avg power: ${Math.round(a.average_watts)} W`);
    if (a.weighted_average_watts != null) lines.push(`- Weighted power: ${Math.round(a.weighted_average_watts)} W`);
    if (a.average_heartrate != null) lines.push(`- Avg heart rate: ${Math.round(a.average_heartrate)} bpm`);
    if (a.max_heartrate != null) lines.push(`- Max heart rate: ${Math.round(a.max_heartrate)} bpm`);
    if (a.suffer_score)          lines.push(`- Suffer score: ${a.suffer_score}`);
    if (a.perceived_exertion)    lines.push(`- Perceived exertion: ${a.perceived_exertion}`);
    if (a.total_elevation_gain)  lines.push(`- Elevation gain: ${Math.round(a.total_elevation_gain)} m`);
    if (a.elev_high != null)     lines.push(`- Elevation high: ${Math.round(a.elev_high)} m`);
    if (a.elev_low != null)      lines.push(`- Elevation low: ${Math.round(a.elev_low)} m`);
    if (a.calories)              lines.push(`- Calories: ${Math.round(a.calories)}`);
    if (a.kilojoules != null)    lines.push(`- Energy: ${a.kilojoules} kJ`);
    if (a.average_temp != null)  lines.push(`- Avg temp: ${a.average_temp} °C`);
    const loc = [a.location_city, a.location_state, a.location_country].filter(Boolean).join(", ");
    if (loc)                     lines.push(`- Location: ${loc}`);
    if (a.gear && a.gear.name)   lines.push(`- Gear: ${a.gear.name}`);
    if (a.description && a.description.trim()) lines.push(`- Description: ${a.description.trim()}`);
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  // Token refresh — form-encoded (what browsers send to OAuth endpoints).
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

  const authHeaders = { ...BASE_HEADERS, Authorization: `Bearer ${access_token}` };

  // 1. Fetch all activities (paginated) → strava-cache.json
  const all = [];
  let page = 1;
  while (page <= 50) {
    process.stdout.write(`Fetching page ${page}… `);
    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=200&page=${page}`,
      { headers: authHeaders }
    );
    if (!res.ok) throw new Error(`Activities HTTP ${res.status}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || !batch.length) { console.log("done."); break; }
    all.push(...batch);
    console.log(`${all.length} activities`);
    if (batch.length < 200) break;
    page++;
  }

  const cachePath = path.join(__dirname, "..", "strava-cache.json");
  fs.writeFileSync(cachePath, JSON.stringify({ at: Date.now(), data: all }));
  console.log(`Wrote strava-cache.json — ${all.length} activities, ${(fs.statSync(cachePath).size / 1024).toFixed(1)} KB`);

  // 2. Fetch details for last 2 weeks → strava-sessions.md
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const recent = all.filter(a => new Date(a.start_date_local || a.start_date).getTime() >= cutoff);
  console.log(`\nFetching details for ${recent.length} workouts in the last 2 weeks…`);

  const detailed = [];
  for (const a of recent) {
    process.stdout.write(`  ${a.id} (${(a.start_date_local || "").slice(0, 10)})… `);
    const res = await fetch(
      `https://www.strava.com/api/v3/activities/${a.id}`,
      { headers: authHeaders }
    );
    if (res.ok) {
      detailed.push(await res.json());
      console.log("ok");
    } else {
      console.log(`HTTP ${res.status} — using summary`);
      detailed.push(a);
    }
    // Small delay to stay well within Strava's rate limit (100 req/15min).
    await new Promise(r => setTimeout(r, 200));
  }

  const sessionsPath = path.join(__dirname, "..", "strava-sessions.md");
  fs.writeFileSync(sessionsPath, buildSessions(detailed));
  console.log(`\nWrote strava-sessions.md — ${detailed.length} workouts`);
}

main().catch((err) => { console.error(err.message); process.exit(1); });
