# cristianrus.me

Static HTML personal website hosted on GitHub Pages.

## Structure

- Root HTML files — URL routing (`cristianrus.me/[page]`)
- `/apps` — App landing pages (privacy policies, descriptions)
- `/books` — Books to read on the site, in the Unwind-style reader (`books/reader.css` + `books/reader.js`). Not the books.html reading list.
- `/images` — Site imagery
- `/fonts` — Custom typefaces
- `style.css` — Main stylesheet (at root)
- `swissstyle.css` — Swiss poster layer on top of `style.css` (see Styles)
- `tools.css` — Shared styles for tool pages
- `gallery.js` — Full-size image viewer shared by homescreen and tattoos (see the comment at its top)
- `/unwind` — Self-contained daily digest with its own styles
- `llms.txt` — Plain-markdown summary of the site for LLMs; update it when pages or apps change

## Styles

The site deliberately has three looks. Keep all three.

1. **Classic** — `style.css` alone. Light/dark, narrow centred column, gradient link hover. Books, tattoos, experience, homescreen, tools, 404.
2. **Swiss** — `style.css` + `swissstyle.css`. One flat colour per page (`--paper`/`--ink` on `<html>`), giant title, grain, invert-on-hover links. Home, about, now, attitude, think, active, lorem. Linking the stylesheet is what opts a page in.
3. **Unwind** — everything under `/unwind`, styled inline. Independent of the other two.

## Active Pages

- `index.html` — Homepage
- `now.html` — Current status
- `about.html` — About page
- `homescreen.html` — Phone homescreen archive (2015–present), year grid + full-size viewer
- `books.html` — Reading list (separate from `/books` folder)
- `attitude.html` — Personal principles
- `experience.html` — Career history
- `tattoos.html` — Tattoo designs with their stories, grid + full-size viewer (thumbnails in `images/tattoos/thumbs/`)

### Tool pages
`focus.html`, `flip.html`, `think.html`, `time.html`, `lofi.html`

`think` (Swiss style) reads its principles from `attitude.html` — edit them there.

The classic tool pages share `tools.css` for common styles and are marked with `<!-- TOOL PAGE: name -->`.

### Social redirects
`applesfera`, `xataka`, `letterboxd`, `twitter`, `linkedin`, `reddit`, `pinterest`, `strava`, `telegram`, `trakt`, `music`, `goodreads`, `pocket`, `vimeo`, `paypal`, `facebook`, `phone`, `mail`, `movies`

All redirect pages are actively used and include `<meta name="referrer" content="no-referrer">`.

### App pages (in `/apps`)
`left`, `ftnss`, `ftnss-workouts`, `txtpod`, `kiwicamping`, `notsobusy`, `bites`

### Utility
- `fetchtest.html` — Live API dashboard (Last.fm, Letterboxd, GitHub, calendar)
- `sos.html` — Emergency info (noindex, not linked from navigation)
- `hyper.html` — Full site index / link hub
- `lorem.html` — Typography test page

### Adding a homescreen month

Upload the screenshot to `images/homescreen/` named `<month><yy>` in English, like `nov26.png` (a Spanish month such as `dic26` is renamed to `dec26`). That's it.

On push, the Pages deploy runs `scripts/homescreen.js`, which makes it `nov26.webp` (converting PNG/JPG/HEIC), makes its thumbnail in `images/homescreen/thumbs/`, rebuilds the gallery in `homescreen.html` (between the `homescreen:start`/`end` markers — don't edit that part by hand) and commits the result back to `main`. Files not named like that are skipped and listed in the workflow log. You can also run `node scripts/homescreen.js` locally (needs `cwebp` or ImageMagick).

### Adding a book to read

Make `books/<name>.html` with the same head as `books/meditations.html` (it links `reader.css` and `reader.js`), then:

```html
<header class="cover" id="header" data-title="Title">
<p class="cover-author">Author</p>
<h1 class="cover-title">Title</h1>
<p class="cover-credit">Translated by …</p>
<nav class="toc" id="nav" aria-label="Contents">
<h2>Contents</h2>
<ul><li><a href="#chapter-1">Chapter 1</a></li> …</ul>
</nav>
</header>
<main>
<h2 id="chapter-1">Chapter 1</h2>
<p>…</p>
</main>
```

Every `<h2 id>` inside `<main>` becomes a chapter. Footnotes as `<li id>` and glossary entries as `<dt id>` open in a small sheet when linked from the text; numbered passages as `<strong id="…">2.1</strong>` at the start of a paragraph hang in the margin. Without JS the book still reads top to bottom.

## Asset Management

- All fonts must be referenced in `style.css` before use
- Images should be optimized (use webp where possible)
- JavaScript is kept minimal and inline — no build step
- `loading="lazy"` applied to all images except above-the-fold

## URL Preservation

All `.html` files must remain at root to preserve `cristianrus.me/[page]` routing.
Do not move root HTML files or introduce a build process that changes output paths.
