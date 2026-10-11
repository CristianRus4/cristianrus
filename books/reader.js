/* ============================================================================
   Book reader — books/*.html.

   Expects: <header class="cover"> (title page with a .toc nav) followed by
   <main> holding the book, one <h2 id> per chapter. It turns that into:
     · one chapter at a time, with previous/next at the end of each,
     · the URL hash as the place in the book (#book4, #book4-12…), so links,
       notes and the back button all work,
     · a thin reading-progress line at the top,
     · the gold button (or C): reading settings (size, font, theme —
       ../reading-prefs.js) and the contents,
     · footnotes and name-index entries in a small sheet instead of a jump,
     · "Continue" on the cover, from where you left off.
   Keys: ← → previous/next chapter · C contents · Esc closes a sheet.
   =========================================================================== */
(function () {
  const cover = document.querySelector('.cover');
  const main = document.querySelector('main');
  if (!cover || !main || typeof HTMLDialogElement !== 'function') return;

  const store = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ } }
  };
  const PLACE = 'reader:place:' + location.pathname.replace(/\.html$/, '');
  const bookTitle = cover.dataset.title || document.title;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // Heading text without the source's "#" and "↑" anchors.
  function headingText(h) {
    const clone = h.cloneNode(true);
    clone.querySelectorAll(':scope > a[href^="#"], sup').forEach(a => a.remove());
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  // ---- Chapters: each <h2 id> and what follows it, up to the next one ----
  const chapters = Array.from(main.querySelectorAll(':scope > h2[id]')).map(h2 => {
    const el = document.createElement('section');
    el.className = 'chapter';
    el.hidden = true;
    h2.before(el);
    for (let n = h2; n && !(n !== h2 && n.nodeType === 1 && n.matches('h2[id]'));) {
      const next = n.nextSibling;
      el.appendChild(n);
      n = next;
    }
    const title = headingText(h2);
    return { id: h2.id, el, heading: h2, title, short: title.split(':')[0], length: el.textContent.length };
  });
  if (!chapters.length) return;
  const total = chapters.reduce((sum, c) => sum + c.length, 0);

  chapters.forEach((c, i) => {
    const prev = chapters[i - 1], next = chapters[i + 1];
    const nav = document.createElement('nav');
    nav.className = 'chapter-nav';
    nav.setAttribute('aria-label', 'Chapters');
    if (prev) nav.insertAdjacentHTML('beforeend', `<a class="prev" href="#${prev.id}"><span>← Previous</span></a>`);
    if (next) nav.insertAdjacentHTML('beforeend', `<a class="next" href="#${next.id}"><span>Next →</span></a>`);
    if (prev) nav.querySelector('.prev').append(prev.title);
    if (next) nav.querySelector('.next').append(next.title);
    c.el.appendChild(nav);
  });

  // ---- Chrome: progress line, the gold button + its sheet (settings, contents), note sheet ----
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="progress" aria-hidden="true"></div>`);
  document.body.insertAdjacentHTML('beforeend', `
    <button type="button" class="contents-button" id="contents-button" aria-label="Settings and contents"><i></i></button>
    <dialog class="sheet contents-sheet" id="contents-sheet" aria-label="Settings and contents">
      <div class="sheet-header"><span></span><button type="button" class="reader-link" data-close>Close</button></div>
      <div data-reading-prefs></div>
      <h2 class="sheet-title">Contents</h2>
      <div class="toc"></div>
    </dialog>
    <dialog class="sheet note-sheet" id="note-sheet" aria-label="Note">
      <div class="sheet-header"><h2 class="sheet-title">Note</h2><button type="button" class="reader-link" data-close>Close</button></div>
      <div class="note-body"></div>
      <a class="note-go reader-link" href="#">Open in the book →</a>
    </dialog>`);

  const progress = document.querySelector('.progress');
  const contentsButton = document.getElementById('contents-button');
  const contents = document.getElementById('contents-sheet');
  const noteSheet = document.getElementById('note-sheet');
  const coverToc = cover.querySelector('.toc ul');
  if (coverToc) contents.querySelector('.toc').appendChild(coverToc.cloneNode(true));

  // Begin / Continue on the cover.
  const actions = document.createElement('div');
  actions.className = 'cover-actions';
  (cover.querySelector('.cover-credit') || cover.querySelector('.cover-title')).after(actions);

  function renderCover() {
    const place = store.get(PLACE);
    const at = place && chapters.find(c => c.id === place.chapter);
    actions.innerHTML = '';
    const begin = `<a class="reader-button${at ? '' : ' primary'}" href="#${chapters[0].id}">${at ? 'Start from the beginning' : 'Begin reading'}</a>`;
    if (at) {
      actions.insertAdjacentHTML('beforeend', `<button type="button" class="reader-button primary" data-continue>Continue · ${at.short}, ${Math.round(place.overall * 100)}%</button>`);
    }
    actions.insertAdjacentHTML('beforeend', begin);
  }

  // ---- Place in the book ----
  let current = null;
  let restore = null;
  let followedLink = false;      // set when a link or key moved us; Back/Forward leave it false
  const left = {};               // chapter id → how far you'd read when you left it

  function overall(chapter, fraction) {
    let before = 0;
    for (const c of chapters) {
      if (c === chapter) break;
      before += c.length;
    }
    return (before + chapter.length * fraction) / total;
  }

  function fractionRead() {
    const rect = current.el.getBoundingClientRect();
    const span = rect.height - innerHeight;
    return span <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / span));
  }

  function update() {
    if (!current) return;
    const fraction = fractionRead();
    const all = overall(current, fraction);
    progress.style.transform = `scaleX(${all})`;
    store.set(PLACE, { chapter: current.id, fraction, overall: all });
  }

  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  }, { passive: true });

  function showCover() {
    followedLink = false;
    if (current) left[current.id] = fractionRead();
    if (current) current.el.hidden = true;
    current = null;
    document.body.classList.remove('reading');
    progress.style.transform = 'scaleX(0)';
    document.title = bookTitle;
    renderCover();
    scrollTo(0, 0);
  }

  function showChapter(chapter, target) {
    if (current !== chapter) {
      if (current) left[current.id] = fractionRead();
      if (current) current.el.hidden = true;
      chapter.el.hidden = false;
      current = chapter;
    }
    document.body.classList.add('reading');
    document.title = chapter.title + ' — ' + bookTitle;
    contents.querySelectorAll('a[aria-current]').forEach(a => a.removeAttribute('aria-current'));
    const tocLink = contents.querySelector(`a[href="#${CSS.escape(chapter.id)}"]`);
    if (tocLink) tocLink.setAttribute('aria-current', 'true');

    // Back/Forward to a chapter: return to where you were in it, not its top.
    if (!restore && !followedLink && target === chapter.heading && chapter.id in left) {
      restore = { chapter: chapter.id, fraction: left[chapter.id] };
    }
    followedLink = false;
    if (restore && restore.chapter === chapter.id) {
      const top = chapter.el.getBoundingClientRect().top + scrollY;
      scrollTo(0, restore.fraction > 0 ? top + restore.fraction * Math.max(0, chapter.el.offsetHeight - innerHeight) : 0);
      restore = null;
    } else if (target && target !== chapter.heading) {
      target.scrollIntoView({ block: 'start' });
    } else {
      scrollTo(0, 0);
    }
    update();
  }

  function route() {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = id && document.getElementById(id);
    const section = target && target.closest('section.chapter');
    const chapter = section && chapters.find(c => c.el === section);
    if (chapter) showChapter(chapter, target);
    else showCover();
  }

  function go(chapter) {
    if (!chapter) return;
    followedLink = true;
    if (location.hash === '#' + chapter.id) route();
    else location.hash = chapter.id;
  }

  document.addEventListener('click', e => {
    if (e.target.closest('a[href^="#"]')) followedLink = true;
  }, true);

  addEventListener('hashchange', () => {
    if (noteSheet.open) noteSheet.close();
    if (contents.open) contents.close();
    route();
  });

  // ---- Footnotes and name index: show them in place ----
  function noteFor(target) {
    if (target.matches('li[id]')) {
      const li = target.cloneNode(true);
      li.removeAttribute('id');
      li.querySelectorAll('a.return, a[href$="-ref"]').forEach(a => a.remove());
      return { title: 'Note', nodes: Array.from(li.childNodes) };
    }
    if (target.matches('dt')) {
      const nodes = [target.cloneNode(true)];
      for (let n = target.nextElementSibling; n && n.matches('dd'); n = n.nextElementSibling) nodes.push(n.cloneNode(true));
      nodes.forEach(n => n.removeAttribute('id'));
      const dl = document.createElement('dl');
      dl.append(...nodes);
      return { title: target.textContent.trim(), nodes: [dl] };
    }
    return null;
  }

  main.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || link.closest('.chapter-nav')) return;
    const target = document.getElementById(decodeURIComponent(link.getAttribute('href').slice(1)));
    const note = target && noteFor(target);
    if (!note) return;
    e.preventDefault();
    followedLink = false;        // it opens a sheet, it doesn't move you
    noteSheet.querySelector('.sheet-title').textContent = note.title;
    noteSheet.querySelector('.note-body').replaceChildren(...note.nodes);
    noteSheet.querySelector('.note-go').setAttribute('href', '#' + target.id);
    noteSheet.showModal();
  });

  // ---- Sheets, buttons, keys ----
  [contents, noteSheet].forEach(sheet => sheet.addEventListener('click', e => {
    if (e.target === sheet || e.target.closest('[data-close]')) sheet.close();
  }));
  contentsButton.addEventListener('click', () => contents.showModal());
  // Picking the chapter you're already in still closes the sheet.
  contents.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    contents.close();
    if (link.getAttribute('href') === location.hash) route();
  });

  actions.addEventListener('click', e => {
    if (!e.target.closest('[data-continue]')) return;
    const place = store.get(PLACE);
    restore = place;
    go(chapters.find(c => c.id === place.chapter));
  });

  // Size and font changes reflow the chapter; keep the reader's place.
  if (window.ReadingPrefs) ReadingPrefs.wrap(apply => {
    if (!current) return apply();
    const fraction = fractionRead();
    apply();
    restore = { chapter: current.id, fraction };
    showChapter(current);
  });

  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || noteSheet.open || contents.open) return;
    const i = current ? chapters.indexOf(current) : -1;
    if (e.key === 'ArrowRight' && current) go(chapters[i + 1]);
    if (e.key === 'ArrowLeft' && current) go(chapters[i - 1]);
    if (e.key === 'c' || e.key === 'C') contents.showModal();
  });

  route();
})();
