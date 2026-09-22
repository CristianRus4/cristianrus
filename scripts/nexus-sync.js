#!/usr/bin/env node
// Pull Apple Health from the existing Nexus MCP and write public JSON
// snapshots the site already fetches on load.
//
// Required: NEXUS_TOKEN  (same bearer as Nexus .mcp-token)
// Optional: NEXUS_MCP_URL (default https://nexus.cristianrus.me/mcp)
//
// Writes:
//   nexus-workouts.json  — workout list from 2022-10-01 (merge, never shrink)
//   now-active.json      — today's steps / kcal + latest workout

const fs = require("fs");
const path = require("path");

const TOKEN = process.env.NEXUS_TOKEN;
const MCP_URL = process.env.NEXUS_MCP_URL || "https://nexus.cristianrus.me/mcp";
const ROOT = path.resolve(__dirname, "..");
const WORKOUTS_FILE = path.join(ROOT, "nexus-workouts.json");
const NOW_FILE = path.join(ROOT, "now-active.json");
const NEXUS_FROM = "2022-10-01";
const ZONE = "Pacific/Auckland";

if (!TOKEN) {
  console.error("Missing NEXUS_TOKEN. Add it as a GitHub Actions secret (the Nexus MCP bearer token).");
  process.exit(1);
}

function todayNZ() {
  return new Date().toLocaleDateString("en-CA", { timeZone: ZONE });
}

function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function round(n) {
  return typeof n === "number" && Number.isFinite(n) ? Math.round(n) : null;
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function parseMcpBody(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) throw new Error("empty MCP response");
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const data = trimmed
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);
  if (!data.length) throw new Error("MCP response was not JSON: " + trimmed.slice(0, 200));
  return JSON.parse(data[data.length - 1]);
}

let sessionId = "";
let rpcId = 1;

async function mcpRpc(method, params) {
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (sessionId) headers["mcp-session-id"] = sessionId;
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id: rpcId++, method, params }),
  });
  const sid = res.headers.get("mcp-session-id");
  if (sid) sessionId = sid;
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`MCP ${method} HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return parseMcpBody(text);
}

async function mcpInit() {
  const msg = await mcpRpc("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "cristianrus-github-action", version: "1.0.0" },
  });
  if (msg.error) throw new Error(msg.error.message || "initialize failed");
  await fetch(MCP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...(sessionId ? { "mcp-session-id": sessionId } : {}),
    },
    body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
  }).catch(() => {});
}

async function mcpCall(name, args) {
  const msg = await mcpRpc("tools/call", { name, arguments: args || {} });
  if (msg.error) throw new Error(`${name}: ${msg.error.message}`);
  const result = msg.result;
  if (!result) throw new Error(`${name}: no result`);
  if (result.isError) {
    throw new Error(`${name}: ${(result.content && result.content[0] && result.content[0].text) || "tool error"}`);
  }
  const text = result.content && result.content[0] && result.content[0].text;
  if (typeof text !== "string") throw new Error(`${name}: unexpected tool payload`);
  return JSON.parse(text);
}

function mapWorkout(w) {
  const durationMin = w.duration_min ?? 0;
  if (durationMin < 1) return null;
  const name = w.name || "Workout";
  const date = w.date || "";
  const distKm = typeof w.distance_km === "number" ? w.distance_km : 0;
  const moving = Math.round(durationMin * 60);
  return {
    id: w.id,
    name,
    type: name,
    sport_type: name,
    start_date: w.start || null,
    start_date_local: date ? `${date}T12:00:00` : null,
    moving_time: moving,
    elapsed_time: moving,
    distance: distKm ? Math.round(distKm * 1000 * 10) / 10 : 0,
    calories: round(w.active_kcal) || 0,
    average_heartrate: round(w.avg_hr),
    max_heartrate: round(w.max_hr),
    average_speed: distKm && moving ? (distKm * 1000) / moving : null,
    trainer: w.indoor ?? null,
    source: "nexus",
  };
}

async function fetchWindow(from, to) {
  const raw = await mcpCall("workouts", { from, to, limit: 200 });
  const list = Array.isArray(raw) ? raw : [];
  return list.map(mapWorkout).filter(Boolean);
}

async function fetchFresh(existingCount) {
  const end = todayNZ();
  const out = [];
  const seen = new Set();
  const start = existingCount < 50 ? NEXUS_FROM : addDays(end, -90);
  let cursor = start;
  while (cursor <= end) {
    let next = addDays(cursor, 89);
    if (next > end) next = end;
    const chunk = await fetchWindow(cursor, next);
    for (const w of chunk) {
      const id = String(w.id);
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(w);
    }
    if (next === end) break;
    cursor = addDays(next, 1);
  }
  return out;
}

function mergeWorkouts(existing, fresh) {
  const byId = new Map();
  for (const w of existing) {
    if (w && w.id != null) byId.set(String(w.id), w);
  }
  for (const w of fresh) byId.set(String(w.id), w);
  return [...byId.values()].sort((a, b) =>
    String(b.start_date || "").localeCompare(String(a.start_date || ""))
  );
}

function sameIds(a, b) {
  if (a.length !== b.length) return false;
  const sa = a.map((w) => String(w.id)).sort().join("\n");
  const sb = b.map((w) => String(w.id)).sort().join("\n");
  return sa === sb;
}

async function syncWorkouts() {
  const current = readJson(WORKOUTS_FILE, { data: [] });
  const existing = Array.isArray(current.data) ? current.data : [];
  const fresh = await fetchFresh(existing.length);
  if (!fresh.length && existing.length) {
    console.log("workouts: Nexus returned nothing — leaving snapshot alone");
    return false;
  }
  const merged = mergeWorkouts(existing, fresh);
  if (!merged.length) {
    console.log("workouts: merge empty — skip");
    return false;
  }
  if (existing.length >= 50 && merged.length < existing.length * 0.8) {
    console.log(`workouts: merge shrank ${existing.length} → ${merged.length} — skip`);
    return false;
  }
  if (sameIds(existing, merged)) {
    console.log(`workouts: ${merged.length} unchanged`);
    return false;
  }
  fs.writeFileSync(
    WORKOUTS_FILE,
    JSON.stringify({ at: Date.now(), source: "nexus", data: merged })
  );
  console.log(`workouts: ${existing.length} → ${merged.length}`);
  return true;
}

function workoutLabel(w) {
  if (!w) return null;
  return {
    id: w.id,
    name: String(w.name || "workout").toLowerCase().replace(/\s+training$/, ""),
    durationMin: Math.round(w.duration_min),
    date: w.date,
  };
}

async function syncNow() {
  const day = todayNZ();
  const [summary, recent] = await Promise.all([
    mcpCall("summary", {}),
    mcpCall("workouts", { from: addDays(day, -30), to: day, limit: 8 }),
  ]);
  const activity = (summary && summary.activity) || {};
  const list = Array.isArray(recent) ? recent : [];
  const latest = list.find((w) => (w.duration_min ?? 0) >= 1) || null;
  const next = {
    date: summary.date || day,
    steps: round(activity.steps) || 0,
    exerciseMin: round(activity.exercise_min) || 0,
    moveKcal: round(activity.move_kcal) || 0,
    workout: workoutLabel(latest),
    updatedAt: new Date().toISOString(),
  };
  const prev = readJson(NOW_FILE, {});
  if (
    prev.steps === next.steps &&
    prev.exerciseMin === next.exerciseMin &&
    prev.moveKcal === next.moveKcal &&
    (prev.workout && prev.workout.id) === (next.workout && next.workout.id)
  ) {
    console.log("now: unchanged");
    return false;
  }
  fs.writeFileSync(NOW_FILE, JSON.stringify(next, null, 2) + "\n");
  console.log(`now: ${next.steps} steps, ${next.moveKcal} kcal, workout ${next.workout && next.workout.name}`);
  return true;
}

(async () => {
  await mcpInit();
  const a = await syncNow();
  const b = await syncWorkouts();
  if (!a && !b) {
    console.log("nothing to commit");
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
