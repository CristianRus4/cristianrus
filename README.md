# cristianrus.me

Static HTML personal website hosted on GitHub Pages.

## Structure

- Root HTML files — URL routing (`cristianrus.me/[page]`)
- `/apps` — App landing pages (privacy policies, descriptions)
- `/books` — Reading material PDFs (NOT the books.html reading list)
- `/images` — Site imagery
- `/fonts` — Custom typefaces
- `style.css` — Main stylesheet (at root)
- `swissstyle.css` — Swiss poster layer on top of `style.css` (see Styles)
- `tools.css` — Shared styles for tool pages
- `/unwind` — Self-contained daily digest with its own styles
- `llms.txt` — Plain-markdown summary of the site for LLMs; update it when pages or apps change

## Styles

The site deliberately has three looks. Keep all three.

1. **Classic** — `style.css` alone. Light/dark, narrow centred column, gradient link hover. Books, tattoos, experience, homescreen, tools, 404.
2. **Swiss** — `style.css` + `swissstyle.css`. One flat colour per page (`--paper`/`--ink` on `<html>`), giant title, grain, invert-on-hover links. Home, about, now, attitude, active, lorem. Linking the stylesheet is what opts a page in.
3. **Unwind** — everything under `/unwind`, styled inline. Independent of the other two.

## Active Pages

- `index.html` — Homepage
- `now.html` — Current status
- `about.html` — About page
- `homescreen.html` — Phone homescreen archive (2015–present), year grid + full-size viewer
- `books.html` — Reading list (separate from `/books` folder)
- `attitude.html` — Personal principles
- `experience.html` — Career history
- `tattoos.html` — Tattoo collection

### Tool pages
`focus.html`, `flip.html`, `think.html`, `time.html`, `lofi.html`

All tool pages share `tools.css` for common styles and are marked with `<!-- TOOL PAGE: name -->`.

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

Upload the screenshot to `images/homescreen/`, named after its month: `nov26.png`, `November 2026.png`, `2026-11.png` and Spanish names (`dic26`) all work. That's it.

On push, the Pages deploy runs `scripts/homescreen.js`, which renames it to `nov26.webp` (converting PNG/JPG/HEIC), makes its thumbnail in `images/homescreen/thumbs/`, rebuilds the gallery in `homescreen.html` (between the `homescreen:start`/`end` markers — don't edit that part by hand) and commits the result back to `main`. Files it can't date are skipped and listed in the workflow log. You can also run `node scripts/homescreen.js` locally (needs `cwebp` or ImageMagick).

## Asset Management

- All fonts must be referenced in `style.css` before use
- Images should be optimized (use webp where possible)
- JavaScript is kept minimal and inline — no build step
- `loading="lazy"` applied to all images except above-the-fold

## URL Preservation

All `.html` files must remain at root to preserve `cristianrus.me/[page]` routing.
Do not move root HTML files or introduce a build process that changes output paths.
