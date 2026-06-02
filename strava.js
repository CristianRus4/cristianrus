/* ============================================================================
   Strava API client — shared across pages (strava-workouts, /now, etc.)
   ----------------------------------------------------------------------------
   Usage:
     await Strava.init();                 // handles ?code= redirect, refreshes token
     if (!Strava.isConnected()) {         // show a "Connect with Strava" link
       location.href = Strava.authorizeUrl();
     }
     const activities = await Strava.getActivities(20);
     const full       = await Strava.getActivity(id);   // detailed fields
     const me         = await Strava.getAthlete();

   Tokens are cached in localStorage, so once you connect on cristianrus.me
   every page on that origin (including /now) can read your Strava data.

   SECURITY: the Client Secret lives in the browser here. Fine for a personal
   site, but anyone viewing source can read it. For a hardened setup, move the
   token exchange/refresh to a serverless function.
   ============================================================================ */
window.Strava = (function () {
  const CONFIG = {
    clientId:     "124696",
    clientSecret: "9d73c6e0e384bd2336b61fc7ae4396c70eb757a6",
    // Scope needed to LIST activities. "read" alone is not enough.
    scope:        "activity:read_all",
  };

  const API = "https://www.strava.com/api/v3";
  const AUTH_URL = "https://www.strava.com/oauth/authorize";
  const TOKEN_URL = "https://www.strava.com/oauth/token";
  const LS_KEY = "strava_tokens_v1";

  /* ---- token storage ---- */
  function loadTokens() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); }
    catch (e) { return null; }
  }
  function saveTokens(t) { localStorage.setItem(LS_KEY, JSON.stringify(t)); }
  function clearTokens() { localStorage.removeItem(LS_KEY); }

  let tokens = loadTokens();

  /* ---- OAuth ---- */
  // redirect_uri is THIS page's URL, so OAuth returns here. The domain must be
  // listed as the "Authorization Callback Domain" in your Strava API settings
  // (e.g. cristianrus.me). Works on localhost too if you add localhost there.
  function redirectUri() {
    return location.origin + location.pathname;
  }

  function authorizeUrl(scope) {
    const params = new URLSearchParams({
      client_id: CONFIG.clientId,
      redirect_uri: redirectUri(),
      response_type: "code",
      approval_prompt: "auto",
      scope: scope || CONFIG.scope,
    });
    return AUTH_URL + "?" + params.toString();
  }

  // Exchange a one-time ?code= for tokens (first connect).
  async function exchangeCode(code) {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CONFIG.clientId,
        client_secret: CONFIG.clientSecret,
        code: code,
        grant_type: "authorization_code",
      }),
    });
    if (!res.ok) throw new Error("Token exchange failed (" + res.status + "): " + (await res.text()));
    const data = await res.json();
    tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      scope: (data.scope || CONFIG.scope),
      athlete: data.athlete || null,
    };
    saveTokens(tokens);
    return tokens;
  }

  async function refresh() {
    if (!tokens || !tokens.refreshToken) throw new Error("Not connected to Strava.");
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CONFIG.clientId,
        client_secret: CONFIG.clientSecret,
        grant_type: "refresh_token",
        refresh_token: tokens.refreshToken,
      }),
    });
    if (!res.ok) throw new Error("Token refresh failed (" + res.status + "): " + (await res.text()));
    const data = await res.json();
    tokens = Object.assign({}, tokens, {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || tokens.refreshToken,
      expiresAt: data.expires_at,
    });
    saveTokens(tokens);
    return tokens.accessToken;
  }

  async function getValidAccessToken() {
    const now = Math.floor(Date.now() / 1000);
    if (tokens && tokens.accessToken && tokens.expiresAt && tokens.expiresAt - now > 120) {
      return tokens.accessToken;
    }
    return refresh();
  }

  /* ---- call on every page load: completes OAuth if we just came back with a code ---- */
  async function init() {
    const url = new URL(location.href);
    const code = url.searchParams.get("code");
    const err = url.searchParams.get("error");
    if (err) {
      // Clean the URL and surface the error to the caller.
      url.searchParams.delete("error");
      history.replaceState({}, "", url.pathname + url.hash);
      throw new Error("Strava authorization was denied: " + err);
    }
    if (code) {
      await exchangeCode(code);
      // Strip ?code & ?scope from the address bar.
      url.searchParams.delete("code");
      url.searchParams.delete("scope");
      url.searchParams.delete("state");
      history.replaceState({}, "", url.pathname + url.hash);
    }
    return tokens;
  }

  function isConnected() { return !!(tokens && tokens.refreshToken); }
  function disconnect() { clearTokens(); tokens = null; }
  function currentScope() { return tokens && tokens.scope; }

  /* ---- API ---- */
  async function api(path) {
    const token = await getValidAccessToken();
    let res = await fetch(API + path, { headers: { Authorization: "Bearer " + token } });
    if (res.status === 401) {
      const t2 = await refresh();
      res = await fetch(API + path, { headers: { Authorization: "Bearer " + t2 } });
    }
    if (!res.ok) {
      let body = "";
      try { body = JSON.stringify(await res.json()); } catch (e) { body = await res.text(); }
      throw new Error("HTTP " + res.status + " — " + body);
    }
    return res.json();
  }

  const getAthlete = () => api("/athlete");
  const getActivities = (perPage = 20, page = 1) =>
    api(`/athlete/activities?per_page=${perPage}&page=${page}`);
  // include_all_efforts=true → populates segment_efforts, best_efforts, laps.
  const getActivity = (id) => api(`/activities/${id}?include_all_efforts=true`);

  // Time-series for a workout (heart rate, power, altitude, speed, cadence, …).
  const getActivityStreams = (id, keys) =>
    api(`/activities/${id}/streams?keys=${encodeURIComponent(
      (keys || ["time", "heartrate", "altitude", "velocity_smooth", "watts", "cadence", "distance"]).join(",")
    )}&key_by_type=true`);

  // Time spent in each heart-rate / power zone for a workout.
  const getActivityZones = (id) => api(`/activities/${id}/zones`);
  const getActivityLaps  = (id) => api(`/activities/${id}/laps`);

  // The athlete's configured HR / power zone thresholds.
  const getAthleteZones = () => api(`/athlete/zones`);

  /* ---- bulk: fetch every activity (paginated) with localStorage caching ---- */
  const ACT_KEY = "strava_activities_v1";
  const DET_KEY = "strava_details_v1";
  const ATH_STATS = "strava_stats_v1";

  function cachedActivities() {
    try { const o = JSON.parse(localStorage.getItem(ACT_KEY)); return o ? o : null; }
    catch (e) { return null; }
  }

  // Returns ALL activities. Uses cache unless { force:true } or cache older than maxAgeMs.
  async function getAllActivities(opts = {}) {
    const maxAge = opts.maxAgeMs != null ? opts.maxAgeMs : 30 * 60 * 1000; // 30 min
    const cache = cachedActivities();
    if (!opts.force && cache && (Date.now() - cache.at) < maxAge && Array.isArray(cache.data)) {
      return cache.data;
    }
    const all = [];
    const perPage = 200;
    let page = 1;
    while (true) {
      const batch = await api(`/athlete/activities?per_page=${perPage}&page=${page}`);
      if (!Array.isArray(batch) || batch.length === 0) break;
      all.push(...batch);
      if (opts.onProgress) opts.onProgress(all.length);
      if (batch.length < perPage) break;
      page++;
      if (page > 50) break; // safety: 10k activities cap
    }
    try { localStorage.setItem(ACT_KEY, JSON.stringify({ at: Date.now(), data: all })); } catch (e) {}
    return all;
  }

  /* ---- detail cache (so expanding / enriching is cheap and persistent) ---- */
  function detailsCache() {
    try { return JSON.parse(localStorage.getItem(DET_KEY) || "{}"); } catch (e) { return {}; }
  }
  function saveDetail(id, data) {
    const c = detailsCache();
    c[id] = data;
    try { localStorage.setItem(DET_KEY, JSON.stringify(c)); }
    catch (e) { /* quota — drop the cache and keep going */ try { localStorage.removeItem(DET_KEY); } catch (_) {} }
  }
  function getCachedDetail(id) { return detailsCache()[id] || null; }
  async function getActivityCached(id) {
    const hit = getCachedDetail(id);
    if (hit) return hit;
    const full = await getActivity(id);
    saveDetail(id, full);
    return full;
  }

  /* ---- athlete rollup stats: recent/ytd/all totals for ride/run/swim ---- */
  async function getAthleteStats(force) {
    if (!force) {
      try { const o = JSON.parse(localStorage.getItem(ATH_STATS)); if (o && (Date.now() - o.at) < 30 * 60 * 1000) return o.data; } catch (e) {}
    }
    const me = (tokens && tokens.athlete) || await getAthlete();
    const data = await api(`/athletes/${me.id}/stats`);
    try { localStorage.setItem(ATH_STATS, JSON.stringify({ at: Date.now(), data })); } catch (e) {}
    return data;
  }

  return {
    init, isConnected, disconnect, authorizeUrl, currentScope,
    getAthlete, getActivities, getActivity,
    getAllActivities, cachedActivities,
    getActivityCached, getCachedDetail,
    getAthleteStats, getAthleteZones,
    getActivityStreams, getActivityZones, getActivityLaps,
  };
})();
