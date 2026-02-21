# cristianrus.me

Static HTML personal website hosted on GitHub Pages.

## Structure

- Root HTML files — URL routing (`cristianrus.me/[page]`)
- `/apps` — App landing pages (privacy policies, descriptions)
- `/books` — Reading material PDFs (NOT the books.html reading list)
- `/images` — Site imagery
- `/fonts` — Custom typefaces
- `style.css` — Main stylesheet (at root)
- `tools.css` — Shared styles for tool pages

## Active Pages

- `index.html` — Homepage
- `now.html` — Current status
- `about.html` — About page
- `homescreen.html` — Phone homescreen archive (2015–present)
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

## Asset Management

- All fonts must be referenced in `style.css` before use
- Images should be optimized (use webp where possible)
- JavaScript is kept minimal and inline — no build step
- `loading="lazy"` applied to all images except above-the-fold

## URL Preservation

All `.html` files must remain at root to preserve `cristianrus.me/[page]` routing.
Do not move root HTML files or introduce a build process that changes output paths.
