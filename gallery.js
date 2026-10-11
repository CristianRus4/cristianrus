/* ============================================================================
   Full-size image viewer — homescreen.html, tattoos.html.

   Put data-gallery on a container. Every figure[id] inside it holding an
   <a href="full-size.webp"><img></a> becomes an item; without JS the link
   still opens the image. Optional attributes on the container:
     data-gallery-prev / -next   button labels (default "previous" / "next")
     data-gallery-reversed       items are newest first (count and play run
                                 from the oldest)
     data-gallery-play           adds a play button that steps through time
     data-gallery-class          extra class for the viewer
   An item's label is the figure's data-label, else its <time> or figcaption
   text; an element marked data-story inside it is shown under the label.
   /page#<figure id> opens that item directly.
   =========================================================================== */
(function () {
  const root = document.querySelector('[data-gallery]');
  if (!root || typeof HTMLDialogElement !== 'function') return;
  const opt = root.dataset;
  const reversed = 'galleryReversed' in opt;

  const items = Array.from(root.querySelectorAll('figure[id]'))
    .filter(fig => fig.querySelector('a[href] img'))
    .map(fig => {
      const link = fig.querySelector('a[href]');
      const img = link.querySelector('img');
      const story = fig.querySelector('[data-story]');
      return {
        id: fig.id,
        link,
        img,
        full: link.getAttribute('href'),
        label: fig.dataset.label || (fig.querySelector('time') || fig.querySelector('figcaption') || img).textContent.trim() || img.alt,
        story: story ? story.textContent.trim() : ''
      };
    });
  if (!items.length) return;

  const viewer = document.createElement('dialog');
  viewer.className = 'gallery-viewer ' + (opt.galleryClass || '');
  viewer.setAttribute('aria-label', 'Image viewer');
  viewer.innerHTML =
    '<figure><img alt=""><figcaption><span class="gv-label"></span> <span class="gv-count"></span><span class="gv-story"></span></figcaption></figure>' +
    '<div class="gv-controls">' +
      '<button type="button" data-act="prev"></button>' +
      ('galleryPlay' in opt ? '<button type="button" data-act="play">play</button>' : '') +
      '<button type="button" data-act="next"></button>' +
      '<button type="button" data-act="close">close</button>' +
    '</div>';
  document.body.appendChild(viewer);

  const $ = (sel) => viewer.querySelector(sel);
  const view = $('img');
  const prevBtn = $('[data-act="prev"]');
  const nextBtn = $('[data-act="next"]');
  const playBtn = $('[data-act="play"]');
  prevBtn.textContent = opt.galleryPrev || 'previous';
  nextBtn.textContent = opt.galleryNext || 'next';

  let index = 0, timer = null, opener = null;

  function show(i) {
    index = Math.max(0, Math.min(items.length - 1, i));
    const item = items[index];
    // Show the already-loaded small image straight away, swap in the full one once it's here.
    view.onerror = () => { view.onerror = null; view.src = item.full; };
    view.src = item.img.currentSrc || item.img.src;
    view.alt = item.img.alt;
    const full = new Image();
    full.onload = () => { if (items[index] === item) view.src = item.full; };
    full.src = item.full;
    [index - 1, index + 1].forEach(n => { if (items[n]) new Image().src = items[n].full; });
    $('.gv-label').textContent = item.label;
    $('.gv-count').textContent = (reversed ? items.length - index : index + 1) + ' / ' + items.length;
    $('.gv-story').textContent = item.story;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === items.length - 1;
    history.replaceState(null, '', '#' + item.id);
  }

  function open(i) {
    opener = items[i].link;
    show(i);
    if (!viewer.open) viewer.showModal();
  }

  // Play steps forward in time: towards the start of a newest-first list.
  const forward = reversed ? -1 : 1;
  const atEnd = () => (reversed ? index === 0 : index === items.length - 1);

  function stop() {
    clearInterval(timer);
    timer = null;
    if (playBtn) playBtn.textContent = 'play';
  }

  function play() {
    if (!playBtn) return;
    if (timer) return stop();
    if (atEnd()) show(reversed ? items.length - 1 : 0);
    playBtn.textContent = 'pause';
    timer = setInterval(() => (atEnd() ? stop() : show(index + forward)), 700);
  }

  items.forEach((item, i) => item.link.addEventListener('click', e => {
    e.preventDefault();
    open(i);
  }));

  viewer.addEventListener('click', e => {
    const act = e.target.dataset && e.target.dataset.act;
    if (e.target === viewer || act === 'close') return viewer.close();
    if (act === 'prev') { stop(); show(index - 1); }
    if (act === 'next') { stop(); show(index + 1); }
    if (act === 'play') play();
  });

  viewer.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { stop(); show(index - 1); }
    if (e.key === 'ArrowRight') { stop(); show(index + 1); }
    if (e.key === ' ' && e.target === viewer) { e.preventDefault(); play(); }
  });

  // Swipe left for the next item, right for the previous one.
  let startX = null;
  viewer.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) < 40) return;
    stop();
    show(index + (dx < 0 ? 1 : -1));
  });

  viewer.addEventListener('close', () => {
    stop();
    history.replaceState(null, '', location.pathname + location.search);
    if (opener) opener.focus();
  });

  const fromHash = items.findIndex(item => '#' + item.id === location.hash);
  if (fromHash !== -1) open(fromHash);
})();
