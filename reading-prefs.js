/* ============================================================================
   Reading preferences — text size, font and theme for books/ and unwind/.
   Saved in this browser (localStorage) and shared by every reading page.

   Load it in <head>, not deferred, so the page paints with the saved
   settings. Then, in the page:
     <div data-reading-prefs></div>             the controls, right there
     <button data-reading-prefs-toggle>Aa</button>  opens them in a sheet
                                                (style it yourself by giving it a class)
   ReadingPrefs.wrap(fn) lets a page run each change itself, e.g. to keep
   the reader's place: fn receives the function that applies the change.
   =========================================================================== */
(function () {
  var KEY = 'reading:prefs';
  var SIZES = [12, 13, 14, 15, 16, 17, 18, 20, 22, 24];
  var FONTS = [['mono', 'Mono'], ['serif', 'Serif'], ['sans', 'Sans']];
  var THEMES = [['auto', 'Auto'], ['light', 'Light'], ['sepia', 'Sepia'], ['dark', 'Dark']];
  var root = document.documentElement;
  var wrapper = null;

  var prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { /* private mode */ }
  // The book reader used to keep its own text size.
  try {
    var oldSize = JSON.parse(localStorage.getItem('reader:size'));
    if (!prefs.size && SIZES.indexOf(oldSize) !== -1) prefs.size = oldSize;
  } catch (e) { /* ignore */ }

  function apply() {
    root.style.setProperty('--read-size', (SIZES.indexOf(prefs.size) !== -1 ? prefs.size : 18) + 'px');
    root.setAttribute('data-font', prefs.font || 'mono');
    if (prefs.theme && prefs.theme !== 'auto') root.setAttribute('data-theme', prefs.theme);
    else root.removeAttribute('data-theme');
  }
  apply();

  function set(key, value) {
    prefs[key] = value;
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* private mode */ }
    var run = function () { apply(); refresh(); };
    if (wrapper) wrapper(run);
    else run();
  }

  function stepSize(step) {
    var now = SIZES.indexOf(prefs.size) !== -1 ? prefs.size : 18;
    var i = Math.max(0, Math.min(SIZES.length - 1, SIZES.indexOf(now) + step));
    set('size', SIZES[i]);
  }

  // ---- Controls ----
  var panels = [];

  function row(label, buttons) {
    return '<div class="rp-row"><span>' + label + '</span><div class="rp-options">' + buttons + '</div></div>';
  }

  function build() {
    var el = document.createElement('div');
    el.className = 'reading-prefs';
    el.innerHTML =
      row('Size', '<button type="button" data-step="-1" aria-label="Smaller text">A−</button><button type="button" data-step="1" aria-label="Larger text">A+</button>') +
      row('Font', FONTS.map(function (f) { return '<button type="button" data-font="' + f[0] + '">' + f[1] + '</button>'; }).join('')) +
      row('Theme', THEMES.map(function (t) { return '<button type="button" data-theme="' + t[0] + '">' + t[1] + '</button>'; }).join(''));
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.step) stepSize(Number(b.dataset.step));
      if (b.dataset.font) set('font', b.dataset.font);
      if (b.dataset.theme) set('theme', b.dataset.theme);
    });
    panels.push(el);
    refresh();
    return el;
  }

  function refresh() {
    var size = SIZES.indexOf(prefs.size) !== -1 ? prefs.size : 18;
    panels.forEach(function (el) {
      el.querySelectorAll('[data-font]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.font === (prefs.font || 'mono'))); });
      el.querySelectorAll('[data-theme]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.theme === (prefs.theme || 'auto'))); });
      el.querySelector('[data-step="-1"]').disabled = size === SIZES[0];
      el.querySelector('[data-step="1"]').disabled = size === SIZES[SIZES.length - 1];
    });
  }

  function mount() {
    document.querySelectorAll('[data-reading-prefs]').forEach(function (spot) { spot.appendChild(build()); });

    var toggles = document.querySelectorAll('[data-reading-prefs-toggle]');
    if (!toggles.length || typeof HTMLDialogElement !== 'function') return;
    var sheet = document.createElement('dialog');
    sheet.className = 'rp-sheet';
    sheet.setAttribute('aria-label', 'Reading settings');
    sheet.appendChild(build());
    document.body.appendChild(sheet);
    sheet.addEventListener('click', function (e) { if (e.target === sheet) sheet.close(); });
    toggles.forEach(function (t) {
      if (!t.className) t.classList.add('rp-toggle');
      t.setAttribute('aria-label', 'Reading settings');
      t.addEventListener('click', function () { sheet.showModal(); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();

  window.ReadingPrefs = {
    wrap: function (fn) { wrapper = fn; }
  };
})();
