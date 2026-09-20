/* ============================================================================
   Nexus Apple Health workouts — public snapshot client for /active
   ----------------------------------------------------------------------------
   Reads nexus-workouts.json (refreshed by a Grok automation from Nexus) and
   stitches in frozen Strava history through September 2022. From October 2022
   onwards the timeline is Apple Health only.

   Caches the merged list in localStorage for 30 minutes.
   Shape is Strava-compatible enough for active.html (start_date, moving_time,
   sport_type, distance, calories, heart-rate averages).
   =========================================================================== */
window.Nexus = (function () {
  const CONFIG = {
    staticDataUrl: "nexus-workouts.json",
    stravaHistoryUrl: "strava-cache.json",
    // Nexus from this day inclusive; Strava for everything before.
    nexusFrom: "2022-10-01",
  };
  const ACT_KEY = "nexus_workouts_v2";
  const DEFAULT_MAX_AGE = 30 * 60 * 1000;

  function dayOf(a) {
    return (a.start_date_local || a.start_date || "").slice(0, 10);
  }

  function cachedActivities() {
    try {
      const o = JSON.parse(localStorage.getItem(ACT_KEY));
      return o && Array.isArray(o.data) ? o : null;
    } catch (e) {
      return null;
    }
  }

  function saveCache(data) {
    try {
      localStorage.setItem(ACT_KEY, JSON.stringify({ at: Date.now(), data: data }));
    } catch (e) { /* quota — snapshot still works */ }
  }

  async function loadJson(url) {
    const res = await fetch(url + "?t=" + Date.now(), { cache: "no-cache" });
    if (!res.ok) throw new Error("Couldn't load " + url + " (" + res.status + ")");
    return res.json();
  }

  async function getAllActivities(opts) {
    opts = opts || {};
    const maxAge = opts.maxAgeMs != null ? opts.maxAgeMs : DEFAULT_MAX_AGE;
    const cache = cachedActivities();
    if (!opts.force && cache && Date.now() - cache.at < maxAge) return cache.data;

    const nexusP = loadJson(CONFIG.staticDataUrl);
    const stravaP = loadJson(CONFIG.stravaHistoryUrl).catch(function () { return { data: [] }; });
    const snap = await nexusP;
    const hist = await stravaP;

    const nexus = (Array.isArray(snap.data) ? snap.data : []).filter(function (a) {
      const d = dayOf(a);
      return d && d >= CONFIG.nexusFrom;
    });
    const strava = (Array.isArray(hist.data) ? hist.data : []).filter(function (a) {
      const d = dayOf(a);
      return d && d < CONFIG.nexusFrom;
    });
    const data = nexus.concat(strava).sort(function (a, b) {
      return (b.start_date || "").localeCompare(a.start_date || "");
    });
    saveCache(data);
    return data;
  }

  function getCachedDetail(id) {
    const cache = cachedActivities();
    if (!cache) return null;
    for (let i = 0; i < cache.data.length; i++) {
      if (String(cache.data[i].id) === String(id)) return cache.data[i];
    }
    return null;
  }

  async function getActivityCached(id) {
    return getCachedDetail(id);
  }

  // No per-workout stream/zone endpoint on the public snapshot.
  async function getActivityStreams() { return {}; }
  async function getActivityZones() { return []; }
  async function getAthleteZones() { return {}; }
  async function getAthleteStats() { return {}; }
  async function init() { return true; }
  function isPublic() { return true; }

  return {
    init: init,
    isPublic: isPublic,
    getAllActivities: getAllActivities,
    cachedActivities: cachedActivities,
    getCachedDetail: getCachedDetail,
    getActivityCached: getActivityCached,
    getActivityStreams: getActivityStreams,
    getActivityZones: getActivityZones,
    getAthleteZones: getAthleteZones,
    getAthleteStats: getAthleteStats,
  };
})();
