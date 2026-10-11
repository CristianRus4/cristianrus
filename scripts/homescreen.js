#!/usr/bin/env node
/* ============================================================================
   Homescreen gallery builder — run by the Pages deploy on every push.

   Drop a screenshot into images/homescreen/ named after its month and this:
     1. renames it to the canonical <mon><yy>.webp (oct26.webp), converting
        PNG/JPG/HEIC to WebP and deleting the original,
     2. makes a 320px thumbnail in images/homescreen/thumbs/,
     3. rewrites the gallery in homescreen.html between the
        <!-- homescreen:start --> and <!-- homescreen:end --> markers.

   Accepted names (case and separators don't matter):
     oct26 · oct2026 · october-2026 · Oct 26 · 2026-10 · 202610
     Spanish month names work too (ene, abr, ago, dic…).

   Needs cwebp (`brew install webp` / `apt install webp`) or ImageMagick only
   when there's something to convert or a thumbnail to make. Exits 3 if one
   is needed and neither is installed.
   =========================================================================== */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "images/homescreen");
const THUMBS = path.join(DIR, "thumbs");
const PAGE = path.join(ROOT, "homescreen.html");
const THUMB_WIDTH = 320;
const EAGER = 8; // first thumbnails load straight away, the rest lazily

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SLUGS = MONTHS.map(m => m.slice(0, 3).toLowerCase());
const SPANISH = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MONTH_WORDS = { sept: 8, set: 8 }; // full name or 3-letter start, English or Spanish → 0-11
[MONTHS.map(m => m.toLowerCase()), SPANISH].forEach(list => list.forEach((m, i) => {
  MONTH_WORDS[m] = i;
  MONTH_WORDS[m.slice(0, 3)] = i;
}));
const SOURCE_EXT = [".webp", ".png", ".jpg", ".jpeg", ".heic"];

const monthIndex = (word) => (word in MONTH_WORDS ? MONTH_WORDS[word] : -1);

function fullYear(y) {
  const n = Number(y);
  return y.length === 2 ? 2000 + n : n;
}

// "oct26" / "october-2026" / "2026-10" → { year: 2026, month: 9 } (month 0-based)
function parseName(file) {
  const name = path.parse(file).name.toLowerCase().trim();
  let m = name.match(/^([a-z]+)[\s._-]*(\d{4}|\d{2})$/);
  if (m) {
    const month = monthIndex(m[1]);
    if (month !== -1) return { year: fullYear(m[2]), month };
  }
  m = name.match(/^(\d{4})[\s._-]?(\d{1,2})$/);
  if (m && m[2] >= 1 && m[2] <= 12) return { year: Number(m[1]), month: Number(m[2]) - 1 };
  return null;
}

const slugOf = ({ year, month }) => SLUGS[month] + String(year).slice(-2);

function has(cmd) {
  try {
    execFileSync("sh", ["-c", `command -v ${cmd}`], { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
}

// Write src as WebP to out, optionally resized to `width` px wide.
function toWebp(src, out, { width, quality }) {
  if (has("cwebp") && !/\.heic$/i.test(src)) {
    const args = ["-quiet", "-q", String(quality), "-m", "6"];
    if (width) args.push("-resize", String(width), "0");
    execFileSync("cwebp", [...args, src, "-o", out]);
    return;
  }
  const magick = has("magick") ? ["magick"] : has("convert") ? ["convert"] : null;
  if (!magick) {
    console.error("Need cwebp or ImageMagick to process " + path.relative(ROOT, src));
    process.exit(3);
  }
  const args = [src];
  if (width) args.push("-resize", width + "x");
  execFileSync(magick[0], [...args, "-quality", String(quality), out]);
}

// Pixel size of a WebP file, read from its header (VP8, VP8L or VP8X).
function webpSize(file) {
  const b = fs.readFileSync(file);
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (chunk === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  throw new Error("Not a WebP file: " + file);
}

// ---- 1. Canonical names + WebP -------------------------------------------
const shots = new Map(); // slug → { year, month }
const files = fs.readdirSync(DIR).filter(f => !f.startsWith(".") && SOURCE_EXT.includes(path.extname(f).toLowerCase()));

// Canonical files first, so a stray "October 2026.png" never overwrites oct26.webp.
const isCanonical = (f) => { const d = parseName(f); return Boolean(d) && slugOf(d) + ".webp" === f; };
files.sort((a, b) => isCanonical(b) - isCanonical(a));

for (const file of files) {
  const date = parseName(file);
  if (!date) {
    console.warn(`Skipping ${file}: can't tell the month from its name (use e.g. oct26.webp)`);
    continue;
  }
  const slug = slugOf(date);
  const canonical = slug + ".webp";
  if (file !== canonical) {
    if (shots.has(slug) || fs.existsSync(path.join(DIR, canonical))) {
      console.warn(`Skipping ${file}: ${canonical} already exists`);
      continue;
    }
    const src = path.join(DIR, file);
    if (path.extname(file).toLowerCase() === ".webp") fs.renameSync(src, path.join(DIR, canonical));
    else {
      toWebp(src, path.join(DIR, canonical), { quality: 82 });
      fs.unlinkSync(src);
    }
    console.log(`Added ${canonical} (from ${file})`);
  }
  shots.set(slug, date);
}

// ---- 2. Thumbnails ---------------------------------------------------------
fs.mkdirSync(THUMBS, { recursive: true });
for (const slug of shots.keys()) {
  const thumb = path.join(THUMBS, slug + ".webp");
  if (fs.existsSync(thumb)) continue;
  toWebp(path.join(DIR, slug + ".webp"), thumb, { width: THUMB_WIDTH, quality: 72 });
  console.log(`Thumbnail ${path.relative(ROOT, thumb)}`);
}

// ---- 3. Gallery HTML -------------------------------------------------------
const ordered = [...shots.entries()]
  .map(([slug, d]) => ({ slug, ...d }))
  .sort((a, b) => b.year - a.year || b.month - a.month);
const years = [...new Set(ordered.map(s => s.year))];

const lines = [];
lines.push('\t\t<nav class="hs-years" aria-label="Years">');
lines.push('\t\t\t<div class="hs-years-track" id="hs-years">');
years.forEach(y => lines.push(`\t\t\t\t<a href="#${y}">${y}</a>`));
lines.push("\t\t\t</div>");
lines.push("\t\t</nav>");
lines.push("");
let n = 0;
for (const year of years) {
  lines.push(`\t\t<section class="hs-year" id="${year}" aria-labelledby="y${year}">`);
  lines.push(`\t\t\t<h2 id="y${year}">${year}</h2>`);
  lines.push('\t\t\t<ol class="hs-grid">');
  for (const s of ordered.filter(s => s.year === year)) {
    const { w, h } = webpSize(path.join(THUMBS, s.slug + ".webp"));
    const month = MONTHS[s.month];
    const lazy = n++ < EAGER ? "" : ' loading="lazy"';
    lines.push(
      `\t\t\t\t<li><figure id="${s.slug}"><a href="images/homescreen/${s.slug}.webp">` +
      `<img src="images/homescreen/thumbs/${s.slug}.webp" width="${w}" height="${h}" alt="Home screen, ${month} ${year}"${lazy} decoding="async"></a>` +
      `<figcaption><time datetime="${year}-${String(s.month + 1).padStart(2, "0")}">${month}<span class="hs-y"> ${year}</span></time></figcaption></figure></li>`
    );
  }
  lines.push("\t\t\t</ol>");
  lines.push("\t\t</section>");
  lines.push("");
}

const START = "<!-- homescreen:start (generated by scripts/homescreen.js — edit there, not here) -->";
const END = "<!-- homescreen:end -->";
const html = fs.readFileSync(PAGE, "utf8");
const a = html.indexOf("<!-- homescreen:start");
const b = html.indexOf(END);
if (a === -1 || b === -1) throw new Error("homescreen.html is missing the homescreen:start/end markers");
const next = html.slice(0, a) + START + "\n" + lines.join("\n") + "\n\t\t" + html.slice(b);
if (next !== html) {
  fs.writeFileSync(PAGE, next);
  console.log(`homescreen.html updated: ${ordered.length} home screens, ${years[years.length - 1]}–${years[0]}`);
} else {
  console.log(`homescreen.html already up to date (${ordered.length} home screens)`);
}
