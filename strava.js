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
  const getActivity = (id) => api(`/activities/${id}?include_all_efforts=false`);

  return {
    init, isConnected, disconnect, authorizeUrl, currentScope,
    getAthlete, getActivities, getActivity,
  };
})();
