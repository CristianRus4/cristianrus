const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT_DIR, "data", "digests");
const OUTPUT_DIR = path.join(ROOT_DIR, "digests");
const SHARED_STYLE_NAME = "styles.css";
const SHARED_SCRIPT_NAME = "app.js";

const PAGE_STYLE = `
      @font-face {
        font-family: "Quattro";
        src: url("../../fonts/Quattro.woff") format("woff");
      }

      @font-face {
        font-family: "Quattro Italic";
        src: url("../../fonts/Quattro-Italic.woff") format("woff");
      }

      :root {
        color-scheme: light dark;
        font-size: 18px;
        --black-rgb: 17, 17, 17;
        --gold-rgb: 112, 84, 28;
        --bg: #ffffff;
        --surface: rgb(var(--black-rgb));
        --border: rgba(var(--black-rgb), 0.16);
        --text: rgb(var(--black-rgb));
        --dim: rgba(var(--black-rgb), 0.7);
        --accent: rgb(var(--gold-rgb));
        --accent-dim: rgba(var(--gold-rgb), 0.6);
        --green: #2b7a55;
        --red: #b24a3b;
        --quote-text: rgba(var(--black-rgb), 0.88);
        --leading-inset: 0.45rem;
        --radius: 18px;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --black-rgb: 248, 245, 239;
          --gold-rgb: 196, 169, 110;
          --bg: #0e0d0b;
          --surface: #161510;
          --border: rgba(var(--black-rgb), 0.18);
          --text: rgb(var(--black-rgb));
          --dim: rgba(var(--black-rgb), 0.7);
          --accent: rgb(var(--gold-rgb));
          --accent-dim: rgba(var(--gold-rgb), 0.6);
          --green: #7ab090;
          --red: #c07060;
          --quote-text: rgba(var(--black-rgb), 0.88);
        }
      }

      * {
        box-sizing: border-box;
      }

      html {
        background: var(--bg);
      }

      body {
        max-width: 680px;
        margin: 0 auto;
        padding: 2.5rem 1.5rem 6rem;
        background: var(--bg);
        color: var(--text);
        font-family: "Quattro", serif;
        font-size: 18px;
        line-height: 1.78;
      }

      button,
      input {
        font: inherit;
      }

      button {
        border: 0;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      [hidden] {
        display: none !important;
      }

      .page {
        width: auto;
        margin: 0;
        padding: 0;
      }

      .masthead {
        display: none;
      }

      .site-link {
        display: inline-block;
        font-family: "Quattro Italic", serif;
        font-size: 1.45rem;
        color: var(--accent);
      }

      .site-kicker {
        margin: 0.3rem 0 0;
        color: var(--dim);
        font-size: 0.92rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .section-jump-button {
        position: fixed;
        right: 1.5rem;
        bottom: 1.5rem;
        z-index: 20;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 3.15rem;
        height: 3.15rem;
        padding: 0;
        border: 1px solid var(--text);
        border-radius: 0;
        background: var(--text);
        color: var(--bg);
        font-size: 1.45rem;
        line-height: 1;
      }

      .section-jump-button[disabled] {
        opacity: 0.45;
      }

      .section-jump-button span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-family: system-ui, sans-serif;
        transform: translateY(-0.08em);
      }

      .stack {
        display: block;
      }

      .card {
        background: transparent;
        border: 0;
        border-radius: 0;
        padding: 0;
        box-shadow: none;
      }

      .card + .card {
        margin-top: 2.3rem;
      }

      .section-rule {
        border-top: 2px solid var(--accent-dim);
        padding-top: 0.45rem;
      }

      .section-rule > .section-label {
        padding-right: 1.1rem;
      }

      .section-filled {
        background: var(--text);
        border: 1px solid var(--text);
        color: var(--bg);
        padding: 0.45rem 1.1rem 1rem;
      }

      .section-filled .section-label,
      .section-filled .number-value,
      .section-filled .word-term,
      .section-filled .word-origin,
      .section-filled p,
      .section-filled h2 {
        color: inherit;
      }

      .card > :first-child {
        margin-top: 0;
      }

      .card > :last-child {
        margin-bottom: 0;
      }

      .section-label {
        margin: 0 0 0.4rem;
        color: var(--accent-dim);
        font-family: "Quattro Italic", serif;
        font-size: 0.72rem;
        opacity: 0.62;
        text-align: right;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding-right: 0.075rem;
      }

      .answer-card .section-label {
        font-size: 1rem;
        letter-spacing: 0.04em;
        text-transform: none;
        text-align: left;
        padding-right: 0;
        margin-bottom: 0.35rem;
        opacity: 1;
      }

      .date-line {
        margin: 0 0 2.5rem;
        display: block;
        width: 100%;
        color: var(--accent-dim);
        font-size: 0.72rem;
        letter-spacing: 0.2em;
        text-align: right;
        text-transform: uppercase;
      }

      .entry-title {
        margin: 0 0 1rem;
        font-family: "Quattro Italic", serif;
        font-size: 2.1rem;
        font-weight: 400;
        color: var(--accent);
        line-height: 1.2;
      }

      .entry-subtitle {
        margin: 0;
        color: var(--dim);
        font-size: 0.9rem;
      }

      .fiction-box,
      .word-box,
      .answers-box {
        background: var(--surface);
        border: 1px solid var(--border);
        padding: 1.3rem 1.5rem;
      }

      .interactive-plain {
        background: transparent;
        border: 0;
        padding: 0;
      }

      .person-block {
        border-left: 0;
        padding-left: 0;
      }

      .prose p {
        margin: 0 0 1rem;
      }

      .essay-blockquote,
      .quote-block {
        margin: 1.8rem 0 1.8rem var(--leading-inset);
        padding: 0.2rem 1.3rem 0.2rem 1.4rem;
        border-left: 4px solid var(--accent);
        color: var(--dim);
        background: transparent;
      }

      .fragment-quote {
        margin: 1.8rem 0 1.8rem var(--leading-inset);
        padding: 0.2rem 1.3rem 0.2rem 1.4rem;
        border-left: 4px solid var(--accent);
        color: var(--dim);
        background: transparent;
      }

      .fragment-quote p {
        font-family: "Quattro Italic", serif;
      }

      .essay-blockquote p,
      .quote-block p,
      .fragment-quote p {
        margin: 0;
        font-family: "Quattro Italic", serif;
      }

      .number-value {
        margin: 0 0 0.55rem;
        font-family: "Quattro Italic", serif;
        font-size: 3.1rem;
        line-height: 1;
        color: var(--accent);
      }

      .word-term {
        margin: 0 0 0.55rem;
        font-family: "Quattro Italic", serif;
        font-size: 3.1rem;
        line-height: 1;
        color: var(--accent);
      }

      .person-name,
      .game-title {
        margin: 0 0 0.2rem;
        font-family: "Quattro Italic", serif;
        font-size: 1.45rem;
        line-height: 1.2;
        color: var(--accent);
      }

      .word-origin,
      .person-dates,
      .meta-line,
      .quote-source {
        color: var(--dim);
        font-size: 0.74rem;
        letter-spacing: 0.06em;
        margin-bottom: 0.55rem;
      }

      .question-list,
      .answer-list {
        display: grid;
        gap: 0.85rem;
      }

      .question-list {
        list-style: none;
        counter-reset: q;
        margin-left: 0;
        padding-left: 0;
      }

      .question-card {
        counter-increment: q;
        padding: 0;
        border: 0;
        background: transparent;
        padding-left: var(--leading-inset);
        padding-bottom: 0.85rem;
      }

      .question-prompt {
        display: flex;
        gap: 0.9rem;
        align-items: flex-start;
        margin-bottom: 0.35rem;
      }

      .question-prompt::before {
        content: counter(q);
        font-family: "Quattro Italic", serif;
        color: var(--accent);
        font-size: 2.55rem;
        min-width: 2.2rem;
        line-height: 1;
        align-self: flex-start;
        transform: translateY(-0.08rem);
      }

      .question-text {
        font-family: "Quattro Italic", serif;
      }

      .answer-card {
        padding: 0;
        border: 0;
        background: transparent;
      }

      .question-actions,
      .inline-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
        margin-top: 0;
        margin-left: 1.9rem;
      }

      .question-actions > * + *,
      .inline-actions > * + * {
        margin-left: 0.65rem;
      }

      .pill-button,
      .option-button,
      .secondary-button,
      .primary-button {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        min-height: 2.6rem;
        padding: 0.5rem 0.7rem;
        border-radius: 0;
        border: 1px solid var(--border);
        background: transparent;
        color: var(--text);
        transition: border-color 180ms ease, background-color 180ms ease, color 180ms ease;
        cursor: pointer;
      }

      .primary-button,
      .secondary-button {
        width: fit-content;
        min-width: 9.8rem;
      }

      .primary-button {
        background: transparent;
        border-color: var(--border);
      }

      .pill-button.is-active,
      .option-button.is-selected,
      .secondary-button.is-active {
        border-color: var(--accent);
        color: var(--accent);
      }

      .option-button.is-correct {
        border-color: var(--green);
        color: var(--green);
      }

      .option-button.is-incorrect {
        border-color: var(--red);
        color: var(--red);
      }

      .option-button.is-matched {
        border-color: var(--text);
        background: var(--text);
        color: var(--bg);
      }

      .pill-button:disabled,
      .option-button:disabled,
      .secondary-button:disabled,
      .primary-button:disabled {
        cursor: default;
      }

      .pill-button:focus-visible,
      .option-button:focus-visible,
      .secondary-button:focus-visible,
      .primary-button:focus-visible,
      .text-input:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
      }

      .question-panel {
        margin-top: 0.8rem;
        margin-left: 1.9rem;
        padding: 0 0 0 1rem;
        border-radius: 0;
        border: 0;
        border-left: 1px solid var(--border);
        background: transparent;
      }

      .button-marker {
        display: inline-block;
        min-width: 0.65rem;
        color: var(--text);
      }

      .choice-grid {
        display: grid;
        gap: 0.75rem;
      }

      .choice-grid.two-column {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .option-button {
        width: 100%;
        border-radius: 0;
        text-align: left;
      }

      .trivia-option-content {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
      }

      .trivia-option-marker {
        display: inline-block;
        min-width: 0.8rem;
        color: var(--accent);
      }

      .option-button.is-incorrect .trivia-option-marker,
      .option-button.is-correct .trivia-option-marker {
        color: inherit;
      }

      .match-words-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .match-option-content {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
      }

      .match-option-marker {
        display: inline-block;
        min-width: 0.8rem;
        color: var(--red);
      }

      .option-title {
        display: block;
        margin-bottom: 0.2rem;
        font-family: "Quattro Italic", serif;
        font-size: 1.02rem;
        color: inherit;
      }

      .game-shell {
        display: grid;
        gap: 0.9rem;
      }

      .game-prompt {
        margin: 0;
      }

      .game-status,
      .feedback {
        margin: 0;
        color: var(--dim);
      }

      .game-status:empty,
      .feedback:empty {
        display: none;
      }

      .feedback.is-success,
      .game-status.is-success {
        color: var(--green);
      }

      .feedback.is-error,
      .game-status.is-error {
        color: var(--red);
      }

      .text-input {
        width: 100%;
        min-height: 2.7rem;
        padding: 0.55rem 0.65rem;
        border-radius: 0;
        border: 1px solid var(--border);
        background: transparent;
        color: var(--text);
      }

      .guess-form {
        display: flex;
        gap: 0.85rem;
        align-items: center;
        flex-wrap: wrap;
      }

      .quote-translation {
        font-style: normal;
      }

      .mask {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        font-family: "Quattro Italic", serif;
        font-size: 1.35rem;
        color: var(--accent);
      }

      .mask span {
        min-width: 0.85rem;
        text-align: center;
      }

      .hint-line,
      .used-letters,
      .match-line {
        color: var(--dim);
        font-size: 0.95rem;
      }

      .primary-button.is-success {
        border-color: var(--green);
        color: var(--green);
      }

      .primary-button.is-error {
        border-color: var(--red);
        color: var(--red);
      }

      .scroll-hint {
        text-align: center;
        color: var(--dim);
        font-size: 0.95rem;
      }

      .answers-toggle-wrap {
        display: flex;
        justify-content: center;
        padding: 0.9rem 0 0;
      }

      .answers-toggle-button {
        min-width: 12rem;
      }

      .spacer {
        height: 4rem;
      }

      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      @media (max-width: 640px) {
        .section-jump-button {
          right: 1rem;
          bottom: 1rem;
        }

        .question-actions,
        .inline-actions {
          margin-left: 1.9rem;
        }
      }
`;

function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, SHARED_STYLE_NAME), buildSharedStyle(), "utf8");
  fs.writeFileSync(path.join(OUTPUT_DIR, SHARED_SCRIPT_NAME), buildSharedScript(), "utf8");

  const files = fs.readdirSync(DATA_DIR)
    .filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name))
    .sort();

  const digests = files.map((name) => {
    const fullPath = path.join(DATA_DIR, name);
    const entry = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    const fallbackDate = name.replace(/\.json$/, "");
    const normalized = normalizeEntry(entry, fallbackDate);
    const outputName = fallbackDate + ".html";

    fs.writeFileSync(
      path.join(OUTPUT_DIR, outputName),
      renderDigestPage(normalized),
      "utf8"
    );

    return normalized;
  });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "index.html"),
    renderArchivePage(digests),
    "utf8"
  );

  console.log("Generated " + digests.length + " digest page(s).");
}

function renderDigestPage(entry) {
  return [
    "<!DOCTYPE html>",
    "<html lang=\"en\">",
    "  <head>",
    "    <meta charset=\"utf-8\">",
    "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1\">",
    "    <meta name=\"description\" content=\"Nightly Digest — a static daily page with an essay, a question ritual, and a small game.\">",
    "    <meta property=\"og:type\" content=\"website\">",
    "    <meta property=\"og:url\" content=\"https://www.cristianrus.me/nightly/digests/" + escapeAttribute(entry.date) + ".html\">",
    "    <meta property=\"og:title\" content=\"" + escapeAttribute(entry.title) + " — Nightly Digest\">",
    "    <meta property=\"og:description\" content=\"A nightly reading ritual with one digest per day.\">",
    "    <meta property=\"og:image\" content=\"https://www.cristianrus.me/images/avatar.jpg\">",
    "    <link rel=\"icon\" type=\"image/x-icon\" href=\"../../images/favicon.ico\">",
    "    <link rel=\"shortcut icon\" type=\"image/x-icon\" href=\"../../images/favicon.ico\">",
    "    <link rel=\"stylesheet\" href=\"./" + SHARED_STYLE_NAME + "\">",
    "    <title>" + escapeHtml(entry.title) + " — Nightly Digest</title>",
    "  </head>",
    "  <body>",
    "    <main class=\"page\">",
    "      <header class=\"masthead\">",
    "        <a class=\"site-link\" href=\"../../\">Cristian Rus</a>",
    "        <p class=\"site-kicker\">nightly digest</p>",
    "      </header>",
    "      <div id=\"app\" class=\"stack\">",
    renderDigestContent(entry),
    "      </div>",
    "    </main>",
    "    <script id=\"nightly-page-data\" type=\"application/json\">" + safeJson(entry) + "</script>",
    "    <script src=\"./" + SHARED_SCRIPT_NAME + "\"></script>",
    "  </body>",
    "</html>",
    ""
  ].join("\n");
}

function renderArchivePage(digests) {
  const grouped = groupDigestsByMonth(
    digests
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
  );
  const sections = grouped
    .map((group) => {
      return [
        "          <section class=\"card section-rule\">",
        "            <p class=\"section-label\" style=\"text-align:left;padding-right:0;opacity:1;\">" + escapeHtml(group.label) + "</p>",
        "            <ul class=\"question-list\" style=\"margin-top:0.85rem;\">",
        group.items.map((entry) => {
          return [
            "              <li class=\"answer-card\">",
            "                <p><a href=\"./" + escapeAttribute(entry.date) + ".html\">" + escapeHtml(formatArchiveDate(entry.date) + " – " + entry.title) + "</a></p>",
            "              </li>"
          ].join("\n");
        }).join("\n"),
        "            </ul>",
        "          </section>"
      ].join("\n");
    })
    .join("\n");

  return [
    "<!DOCTYPE html>",
    "<html lang=\"en\">",
    "  <head>",
    "    <meta charset=\"utf-8\">",
    "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1\">",
    "    <meta name=\"description\" content=\"Nightly Digest archive.\">",
    "    <link rel=\"icon\" type=\"image/x-icon\" href=\"../../images/favicon.ico\">",
    "    <link rel=\"shortcut icon\" type=\"image/x-icon\" href=\"../../images/favicon.ico\">",
    "    <link rel=\"stylesheet\" href=\"./" + SHARED_STYLE_NAME + "\">",
    "    <title>Nightly Digest Archive</title>",
    "  </head>",
    "  <body>",
    "    <main class=\"page\">",
    "      <div class=\"stack\">",
    "        <section class=\"card\">",
    "          <p class=\"date-line\">Nightly Archive</p>",
    "          <h1 class=\"entry-title\">Every available digest</h1>",
    "          <p class=\"entry-subtitle\"><a href=\"../index.html\">Back to today launcher</a></p>",
    "        </section>",
    sections,
    "      </div>",
    "    </main>",
    "  </body>",
    "</html>",
    ""
  ].join("\n");
}

function renderDigestContent(entry) {
  return [
    "        <section class=\"card\">",
    "          <p class=\"date-line\">" + escapeHtml(formatLongDate(entry.date)) + "</p>",
    "          <h1 class=\"entry-title\">" + escapeHtml(entry.title) + "</h1>",
    renderParagraphs(entry.essay.paragraphs, 10),
    "          <blockquote class=\"essay-blockquote\">",
    "            <p>" + escapeHtml(entry.essay.blockquote) + "</p>",
    "          </blockquote>",
    "        </section>",
    "",
    "        <section class=\"card section-filled\">",
    "          <p class=\"section-label\">Today's Number</p>",
    "          <p class=\"number-value\">" + escapeHtml(entry.number.value) + "</p>",
    "          <p>" + escapeHtml(entry.number.label) + "</p>",
    "        </section>",
    "",
    "        <section class=\"card section-rule prose\">",
    "          <p class=\"section-label\">Fragment</p>",
    "          <blockquote class=\"fragment-quote\">",
    "            <p>" + escapeHtml(entry.fragment) + "</p>",
    "          </blockquote>",
    "        </section>",
    "",
    "        <section class=\"card section-filled prose\">",
    "          <p class=\"section-label\">Word Of The Night</p>",
    "          <h2 class=\"word-term\">" + escapeHtml(entry.word.term) + "</h2>",
    "          <p class=\"word-origin\">" + escapeHtml(entry.word.origin) + "</p>",
    "          <p>" + escapeHtml(entry.word.definition) + "</p>",
    "        </section>",
    "",
    "        <section class=\"card section-rule prose\">",
    "          <p class=\"section-label\">Tonight's Voice</p>",
    "          <blockquote class=\"quote-block\">",
    "            <p>" + escapeHtml(entry.quote.text) + "</p>",
    "          </blockquote>",
    entry.quote.translation
      ? "          <p class=\"meta-line quote-translation\">" + escapeHtml(entry.quote.translation) + "</p>"
      : "",
    "          <p class=\"quote-source\">" + escapeHtml(entry.quote.author) + " · " + escapeHtml(entry.quote.source) + "</p>",
    "        </section>",
    "",
    "        <section class=\"card section-rule prose\">",
    "          <p class=\"section-label\">Person You've Never Heard Of</p>",
    "          <div class=\"person-block\">",
    "            <h2 class=\"person-name\">" + escapeHtml(entry.person.name) + "</h2>",
    "            <p class=\"person-dates\">" + escapeHtml(entry.person.dates) + "</p>",
    renderParagraphs(entry.person.paragraphs, 12),
    "          </div>",
    "        </section>",
    "",
    "        <section class=\"card section-rule\">",
    "          <p class=\"section-label\">Three Questions</p>",
    "          <ul class=\"question-list\">",
    renderQuestions(entry.questions),
    "          </ul>",
    "        </section>",
    "",
    "        <section class=\"card section-rule\">",
    "          <p class=\"section-label\">Games</p>",
    "        </section>",
    "",
    "        <section class=\"card\">",
    "          <div class=\"word-box interactive-plain\">",
    "            <h2 class=\"game-title\">Trivia</h2>",
    "            <p class=\"game-prompt\">" + escapeHtml(entry.trivia.question) + "</p>",
    "            <div class=\"choice-grid\" data-trivia-options>",
    renderTriviaOptions(entry.trivia.options),
    "            </div>",
    "            <p class=\"hint-line\" data-trivia-explanation hidden>" + escapeHtml(entry.trivia.explanation) + "</p>",
    "          </div>",
    "        </section>",
    "",
    "        <section class=\"card\">",
    "          <div class=\"word-box interactive-plain\">",
    "            <div id=\"nightly-game\" class=\"game-shell\">",
    renderGameMarkup(entry.game, entry.date),
    "            </div>",
    "          </div>",
    "        </section>",
    "",
    "        <section class=\"card section-rule\">",
    "          <p class=\"section-label\">Answers</p>",
    "          <div class=\"answers-toggle-wrap\" data-answers-toggle-wrap>",
    "            <button class=\"secondary-button answers-toggle-button\" type=\"button\" data-answers-toggle>Reveal answers</button>",
    "          </div>",
    "          <div class=\"answer-list answers-box interactive-plain\" data-answers-content hidden>",
    renderTriviaAnswer(entry.trivia),
    renderGameAnswer(entry.game),
    "          </div>",
    "        </section>"
  ]
    .filter(Boolean)
    .join("\n");
}

function renderParagraphs(paragraphs, indent) {
  const spaces = repeatSpaces(indent);
  return paragraphs.map((paragraph) => spaces + "<p>" + escapeHtml(paragraph) + "</p>").join("\n");
}

function renderQuestions(questions) {
  return questions
    .map((question, index) => {
      return [
        "            <li class=\"question-card\" data-question-card=\"" + index + "\">",
        "              <div class=\"question-prompt\">",
        "                <p class=\"question-text\">" + escapeHtml(question.text) + "</p>",
        "              </div>",
        "              <div class=\"question-actions\">",
        "                <button class=\"pill-button\" type=\"button\" data-question-toggle=\"deeper\" aria-expanded=\"false\">",
        "                  <span class=\"button-marker\" aria-hidden=\"true\">+</span><span>Deeper</span>",
        "                </button>",
        "                <button class=\"pill-button\" type=\"button\" data-question-toggle=\"experiment\" aria-expanded=\"false\">",
        "                  <span class=\"button-marker\" aria-hidden=\"true\">+</span><span>Experiment</span>",
        "                </button>",
        "              </div>",
        "              <div class=\"question-panel\" data-question-panel=\"deeper\" hidden>",
        "                <p>" + escapeHtml(question.deeper) + "</p>",
        "              </div>",
        "              <div class=\"question-panel\" data-question-panel=\"experiment\" hidden>",
        "                <p>" + escapeHtml(question.experiment) + "</p>",
        "              </div>",
        "            </li>"
      ].join("\n");
    })
    .join("\n");
}

function renderTriviaOptions(options) {
  return options
    .map((option, index) => {
      return [
        "              <button class=\"option-button\" type=\"button\" data-trivia-option=\"" + index + "\">",
        "                <span class=\"trivia-option-content\"><span class=\"trivia-option-marker\" aria-hidden=\"true\"></span><span>" + escapeHtml(option) + "</span></span>",
        "              </button>"
      ].join("\n");
    })
    .join("\n");
}

function renderGameMarkup(game, dateString) {
  switch (game.type) {
    case "reveal":
      return renderRevealMarkup(game.data);
    case "two_truths_one_lie":
      return renderTwoTruthsMarkup(game.data);
    case "missing_word":
      return renderMissingWordMarkup(game.data);
    case "concept_match":
      return renderConceptMatchMarkup(game.data, dateString);
    case "letter_by_letter":
      return renderLetterByLetterMarkup(game.data);
    case "first_and_last":
      return renderFirstAndLastMarkup(game.data);
    case "false_cognate":
      return renderFalseCognateMarkup(game.data);
    case "odd_one_out":
      return renderOddOneOutMarkup(game.data);
    default:
      return [
        "              <h2 class=\"game-title\">Tonight's game is unavailable.</h2>",
        "              <p class=\"game-prompt\">The answers section still holds the stored answer data if present.</p>"
      ].join("\n");
  }
}

function renderRevealMarkup(data) {
  const clues = toStringArray(data && data.clues, 4, "Clue unavailable.");
  return [
    "              <h2 class=\"game-title\">Reveal</h2>",
    "              <p class=\"game-prompt\">Guess the hidden word after as few clues as possible.</p>",
    "              <div data-reveal-clues>",
    "                <p>" + escapeHtml(clues[0]) + "</p>",
    "              </div>",
    "              <div class=\"inline-actions\">",
    "                <button class=\"secondary-button\" type=\"button\" data-reveal-more>? Clue</button>",
    "              </div>",
    "              <form class=\"guess-form\" data-reveal-form>",
    "                <label class=\"visually-hidden\" for=\"reveal-guess\">Your guess</label>",
    "                <input class=\"text-input\" id=\"reveal-guess\" type=\"text\" autocomplete=\"off\" placeholder=\"Type your guess\">",
    "                <button class=\"primary-button\" type=\"submit\" data-default-label=\"Submit\">↑ Submit</button>",
    "              </form>",
    "              <p class=\"game-status\" data-reveal-status aria-live=\"polite\"></p>"
  ].join("\n");
}

function renderTwoTruthsMarkup(data) {
  const options = Array.isArray(data && data.options) ? data.options.slice(0, 3) : [];
  return [
    "              <h2 class=\"game-title\">Two Truths, One Lie</h2>",
    "              <p class=\"game-prompt\">One definition is fabricated. Find the lie.</p>",
    "              <div class=\"choice-grid\">",
    options.map((option, index) => {
      return [
        "                <button class=\"option-button\" type=\"button\" data-lie-option=\"" + index + "\">",
        "                  <span class=\"option-title\">" + escapeHtml(safeText(option && option.word, "Word unavailable")) + "</span>",
        "                  <span>" + escapeHtml(safeText(option && option.definition, "Definition unavailable.")) + "</span>",
        "                </button>"
      ].join("\n");
    }).join("\n"),
    "              </div>",
    "              <p class=\"game-status\" data-lie-status aria-live=\"polite\"></p>"
  ].join("\n");
}

function renderMissingWordMarkup(data) {
  return [
    "              <h2 class=\"game-title\">Missing Word</h2>",
    "              <p class=\"game-prompt\">" + escapeHtml(safeText(data && data.before, "")) + " <strong>_____</strong> " + escapeHtml(safeText(data && data.after, "")) + "</p>",
    "              <form class=\"guess-form\" data-missing-form>",
    "                <label class=\"visually-hidden\" for=\"missing-word-guess\">Missing word</label>",
    "                <input class=\"text-input\" id=\"missing-word-guess\" type=\"text\" autocomplete=\"off\" placeholder=\"Type the missing word\">",
    "                <button class=\"primary-button\" type=\"submit\" data-default-label=\"Check\">↑ Check</button>",
    "              </form>",
    "              <p class=\"game-status\" data-missing-status aria-live=\"polite\"></p>",
    "              <p class=\"hint-line\" data-missing-hint hidden></p>"
  ].join("\n");
}

function renderConceptMatchMarkup(data, dateString) {
  const pairs = Array.isArray(data && data.pairs) ? data.pairs.slice(0, 4) : [];
  const shuffledDefinitions = seededShuffle(
    pairs.map((pair) => ({
      id: safeText(pair && pair.id, ""),
      definition: safeText(pair && pair.definition, "Definition unavailable.")
    })),
    buildSeed(dateString)
  );

  return [
    "              <h2 class=\"game-title\">Concept Match</h2>",
    "              <p class=\"game-prompt\">Tap one word and one definition to pair them.</p>",
    "              <div class=\"match-words-grid\">",
    pairs.map((pair) => {
      return [
        "                <button class=\"option-button\" type=\"button\" data-match-word=\"" + escapeAttribute(safeText(pair && pair.id, "")) + "\">",
        "                  <span class=\"match-option-content\"><span class=\"match-option-marker\" aria-hidden=\"true\"></span><span class=\"option-title\">" + escapeHtml(safeText(pair && pair.word, "Word unavailable")) + "</span></span>",
        "                </button>"
      ].join("\n");
    }).join("\n"),
    "              </div>",
    "              <div class=\"choice-grid\">",
    shuffledDefinitions.map((pair) => {
      return [
        "                <button class=\"option-button\" type=\"button\" data-match-definition=\"" + escapeAttribute(pair.id) + "\">",
        "                  <span class=\"match-option-content\"><span class=\"match-option-marker\" aria-hidden=\"true\"></span><span>" + escapeHtml(pair.definition) + "</span></span>",
        "                </button>"
      ].join("\n");
    }).join("\n"),
    "              </div>"
  ].join("\n");
}

function renderLetterByLetterMarkup(data) {
  const answer = safeText(data && data.answer, "");
  return [
    "              <h2 class=\"game-title\">Letter By Letter</h2>",
    "              <p class=\"game-prompt\">" + escapeHtml(safeText(data && data.definition, "Definition unavailable.")) + "</p>",
    "              <div class=\"mask\" data-letter-mask>" + renderMask(answer, []) + "</div>",
    "              <form class=\"guess-form\" data-letter-form>",
    "                <label class=\"visually-hidden\" for=\"letter-guess\">Guess one letter</label>",
    "                <input class=\"text-input\" id=\"letter-guess\" type=\"text\" maxlength=\"1\" autocomplete=\"off\" placeholder=\"Type one letter\">",
    "                <button class=\"primary-button\" type=\"submit\" data-default-label=\"Submit\">↑ Submit</button>",
    "              </form>",
    "              <p class=\"used-letters\" data-letter-used>Used letters: none</p>",
    "              <p class=\"hint-line\" data-letter-wrong>Wrong guesses: 0</p>",
    "              <p class=\"game-status\" data-letter-status aria-live=\"polite\"></p>"
  ].join("\n");
}

function renderFirstAndLastMarkup(data) {
  const answer = safeText(data && data.answer, "");
  const mask = renderFirstAndLastMask(answer, data && data.display_length);
  return [
    "              <h2 class=\"game-title\">First And Last</h2>",
    "              <p class=\"game-prompt\">" + escapeHtml(safeText(data && data.definition, "Definition unavailable.")) + "</p>",
    "              <div class=\"mask\">" + mask + "</div>",
    "              <form class=\"guess-form\" data-first-last-form>",
    "                <label class=\"visually-hidden\" for=\"first-last-guess\">Middle letters</label>",
    "                <input class=\"text-input\" id=\"first-last-guess\" type=\"text\" autocomplete=\"off\" placeholder=\"Type the middle letters\">",
    "                <button class=\"primary-button\" type=\"submit\" data-default-label=\"Check\">↑ Check</button>",
    "              </form>",
    "              <p class=\"game-status\" data-first-last-status aria-live=\"polite\"></p>"
  ].join("\n");
}

function renderFalseCognateMarkup(data) {
  return [
    "              <h2 class=\"game-title\">False Cognate</h2>",
    "              <p class=\"game-prompt\">" + escapeHtml(safeText(data && data.word_a && data.word_a.term, "Word A")) + " and " + escapeHtml(safeText(data && data.word_b && data.word_b.term, "Word B")) + "</p>",
    "              <p>" + escapeHtml(safeText(data && data.question, "Are they truly connected?")) + "</p>",
    "              <div class=\"inline-actions\">",
    "                <button class=\"option-button\" type=\"button\" data-cognate-choice=\"connected\">connected</button>",
    "                <button class=\"option-button\" type=\"button\" data-cognate-choice=\"false_cognate\">false cognate</button>",
    "              </div>",
    "              <p class=\"game-status\" data-cognate-status aria-live=\"polite\"></p>"
  ].join("\n");
}

function renderOddOneOutMarkup(data) {
  const options = Array.isArray(data && data.options) ? data.options.slice(0, 5) : [];
  return [
    "              <h2 class=\"game-title\">Odd One Out</h2>",
    "              <p class=\"game-prompt\">" + escapeHtml(safeText(data && data.prompt, "Find the outlier.")) + "</p>",
    "              <div class=\"choice-grid\">",
    options.map((option, index) => {
      return [
        "                <button class=\"option-button\" type=\"button\" data-odd-option=\"" + index + "\">",
        "                  <span class=\"option-title\">" + escapeHtml(safeText(option && option.word, "Word unavailable")) + "</span>",
        "                </button>"
      ].join("\n");
    }).join("\n"),
    "              </div>",
    "              <p class=\"game-status\" data-odd-status aria-live=\"polite\"></p>"
  ].join("\n");
}

function renderTriviaAnswer(trivia) {
  const answerText = trivia.options[trivia.correct] || "Answer unavailable.";
  return [
    "            <article class=\"answer-card\">",
    "              <p class=\"section-label\">Trivia Answer</p>",
    "              <p><strong>" + escapeHtml(stripTrailingPeriod(answerText)) + "</strong></p>",
    "              <p>" + escapeHtml(trivia.explanation) + "</p>",
    "            </article>"
  ].join("\n");
}

function renderGameAnswer(game) {
  switch (game.type) {
    case "reveal":
      return [
        "            <article class=\"answer-card\">",
        "              <p class=\"section-label\">Game Answer</p>",
        "              <p><strong>" + escapeHtml(stripTrailingPeriod(safeText(game.data && game.data.answer, "Answer unavailable"))) + "</strong></p>",
        "              <p>" + escapeHtml(toStringArray(game.data && game.data.clues, 4, "").join(" ")) + "</p>",
        "            </article>"
      ].join("\n");
    case "two_truths_one_lie": {
      const lie = (Array.isArray(game.data && game.data.options) ? game.data.options : []).find((item) => item && item.is_lie);
      return [
        "            <article class=\"answer-card\">",
        "              <p class=\"section-label\">Game Answer</p>",
        "              <p><strong>" + escapeHtml(stripTrailingPeriod(safeText(lie && lie.word, "Lie unavailable"))) + "</strong></p>",
        "              <p>" + escapeHtml(safeText(game.data && game.data.lie_explanation, "Explanation unavailable.")) + "</p>",
        "            </article>"
      ].join("\n");
    }
    case "missing_word":
      return [
        "            <article class=\"answer-card\">",
        "              <p class=\"section-label\">Game Answer</p>",
        "              <p><strong>" + escapeHtml(stripTrailingPeriod(safeText(game.data && game.data.answer, "Answer unavailable"))) + "</strong></p>",
        "              <p>" + escapeHtml(safeText(game.data && game.data.hint, "No hint stored.")) + "</p>",
        "            </article>"
      ].join("\n");
    case "concept_match":
      return [
        "            <article class=\"answer-card\">",
        "              <p class=\"section-label\">Game Answer</p>",
        renderConceptMatchAnswer(game.data),
        "            </article>"
      ].join("\n");
    case "letter_by_letter":
      return [
        "            <article class=\"answer-card\">",
        "              <p class=\"section-label\">Game Answer</p>",
        "              <p><strong>" + escapeHtml(stripTrailingPeriod(safeText(game.data && game.data.answer, "Answer unavailable"))) + "</strong></p>",
        "              <p>" + escapeHtml(safeText(game.data && game.data.success_note, "No success note stored.")) + "</p>",
        "            </article>"
      ].join("\n");
    case "first_and_last":
      return [
        "            <article class=\"answer-card\">",
        "              <p class=\"section-label\">Game Answer</p>",
        "              <p><strong>" + escapeHtml(stripTrailingPeriod(safeText(game.data && game.data.answer, "Answer unavailable"))) + "</strong></p>",
        "              <p>" + escapeHtml(safeText(game.data && game.data.definition, "Definition unavailable.")) + "</p>",
        "            </article>"
      ].join("\n");
    case "false_cognate":
      return [
        "            <article class=\"answer-card\">",
        "              <p class=\"section-label\">Game Answer</p>",
        "              <p><strong>" + escapeHtml(stripTrailingPeriod(safeText(game.data && game.data.answer, "Answer unavailable"))) + "</strong></p>",
        "              <p>" + escapeHtml(safeText(game.data && game.data.explanation, "Explanation unavailable.")) + "</p>",
        "            </article>"
      ].join("\n");
    case "odd_one_out": {
      const odd = (Array.isArray(game.data && game.data.options) ? game.data.options : []).find((item) => item && item.is_odd);
      return [
        "            <article class=\"answer-card\">",
        "              <p class=\"section-label\">Game Answer</p>",
        "              <p><strong>" + escapeHtml(stripTrailingPeriod(safeText(odd && odd.word, "Odd word unavailable"))) + "</strong></p>",
        "              <p>" + escapeHtml(safeText(game.data && game.data.explanation, "Explanation unavailable.")) + "</p>",
        "            </article>"
      ].join("\n");
    }
    default:
      return [
        "            <article class=\"answer-card\">",
        "              <p class=\"section-label\">Game Answer</p>",
        "              <p>No answer data is available for tonight's game.</p>",
        "            </article>"
      ].join("\n");
  }
}

function renderConceptMatchAnswer(data) {
  const pairs = Array.isArray(data && data.pairs) ? data.pairs.slice(0, 4) : [];
  if (!pairs.length) {
    return "              <p>No pair data available.</p>";
  }

  return pairs.map((pair) => {
    return "              <p><strong>" + escapeHtml(stripTrailingPeriod(safeText(pair && pair.word, "Word unavailable"))) + "</strong> — " + escapeHtml(safeText(pair && pair.definition, "Definition unavailable.")) + "</p>";
  }).join("\n");
}

function buildInteractionScript(entry) {
  return [
    "var NIGHTLY_PAGE_DATA = " + safeJson(entry) + ";",
    "var app = document.getElementById(\"app\");",
    "document.addEventListener(\"DOMContentLoaded\", function () {",
    "  setupQuestionToggles();",
    "  setupTrivia(NIGHTLY_PAGE_DATA.trivia);",
    "  setupGame(NIGHTLY_PAGE_DATA.game, NIGHTLY_PAGE_DATA.date);",
    "});",
    interactionFunctions()
  ].join("\n");
}

function buildSharedStyle() {
  return PAGE_STYLE.replace(/^\n/, "") + "\n";
}

function buildSharedScript() {
  return [
    "var app;",
    "var NIGHTLY_PAGE_DATA;",
    "document.addEventListener(\"DOMContentLoaded\", function () {",
    "  var dataElement = document.getElementById(\"nightly-page-data\");",
    "  app = document.getElementById(\"app\");",
    "  if (!app || !dataElement) {",
    "    return;",
    "  }",
    "  NIGHTLY_PAGE_DATA = JSON.parse(dataElement.textContent || \"{}\");",
    "  setupSectionJumpButton();",
    "  setupQuestionToggles();",
    "  setupAnswersReveal();",
    "  setupTrivia(NIGHTLY_PAGE_DATA.trivia);",
    "  setupGame(NIGHTLY_PAGE_DATA.game, NIGHTLY_PAGE_DATA.date);",
    "});",
    interactionFunctions().trim(),
    ""
  ].join("\n");
}

function interactionFunctions() {
  return `
function setupQuestionToggles() {
  var cards = app.querySelectorAll("[data-question-card]");
  var index;
  for (index = 0; index < cards.length; index += 1) {
    setupQuestionCard(cards[index]);
  }
}

function setupAnswersReveal() {
  var button = app.querySelector("[data-answers-toggle]");
  var wrap = app.querySelector("[data-answers-toggle-wrap]");
  var content = app.querySelector("[data-answers-content]");
  if (!button || !content || !wrap) {
    return;
  }

  button.onclick = function () {
    wrap.hidden = true;
    content.hidden = false;
  };
}

function setupSectionJumpButton() {
  var button = document.createElement("button");
  button.type = "button";
  button.className = "section-jump-button";
  button.setAttribute("aria-label", "Jump to next section");
  button.innerHTML = "<span aria-hidden=\\"true\\">⌄</span>";

  button.onclick = function () {
    jumpToNextSection();
  };

  document.body.appendChild(button);
  updateSectionJumpButton(button);
  window.addEventListener("scroll", function () {
    updateSectionJumpButton(button);
  }, { passive: true });
  window.addEventListener("resize", function () {
    updateSectionJumpButton(button);
  });
}

function getNextSection() {
  var sections = app ? app.children : [];
  var tolerance = 96;
  var index;
  var section;
  var top;

  for (index = 0; index < sections.length; index += 1) {
    section = sections[index];
    if (!section.classList || !section.classList.contains("card")) {
      continue;
    }

    top = section.getBoundingClientRect().top;
    if (top > tolerance) {
      return section;
    }
  }

  return null;
}

function updateSectionJumpButton(button) {
  var nextSection = getNextSection();
  button.disabled = !nextSection;
  button.hidden = !nextSection;
}

function jumpToNextSection() {
  var nextSection = getNextSection();
  var offset = 18;
  if (!nextSection) {
    return;
  }

  window.scrollTo({
    top: window.scrollY + nextSection.getBoundingClientRect().top - offset,
    behavior: "smooth"
  });
}

function setupQuestionCard(card) {
  var buttons = card.querySelectorAll("[data-question-toggle]");
  var panels = card.querySelectorAll("[data-question-panel]");
  var index;

  function setButtonState(button, isOpen) {
    var marker = button.querySelector(".button-marker");
    button.classList.toggle("is-active", isOpen);
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (marker) {
      marker.textContent = isOpen ? "-" : "+";
    }
  }

  function closeAll() {
    var panelIndex;
    for (panelIndex = 0; panelIndex < panels.length; panelIndex += 1) {
      panels[panelIndex].hidden = true;
    }

    for (panelIndex = 0; panelIndex < buttons.length; panelIndex += 1) {
      setButtonState(buttons[panelIndex], false);
    }
  }

  for (index = 0; index < buttons.length; index += 1) {
    buttons[index].onclick = function () {
      var target = this.getAttribute("data-question-toggle");
      var targetPanel = card.querySelector('[data-question-panel="' + target + '"]');
      var isOpen = !targetPanel.hidden;

      closeAll();

      if (!isOpen) {
        targetPanel.hidden = false;
        setButtonState(this, true);
      }
    };
  }
}

function setupTrivia(trivia) {
  var buttons = app.querySelectorAll("[data-trivia-option]");
  var explanation = app.querySelector("[data-trivia-explanation]");
  var index;

  for (index = 0; index < buttons.length; index += 1) {
    attachTriviaButton(buttons[index], buttons, explanation, trivia);
  }
}

function attachTriviaButton(button, buttons, explanation, trivia) {
  button.onclick = function () {
    var selected;
    var isCorrect;
    var index;
    var marker;
    var loopMarker;

    selected = Number(button.getAttribute("data-trivia-option"));
    isCorrect = selected === trivia.correct;
    marker = button.querySelector(".trivia-option-marker");

    for (index = 0; index < buttons.length; index += 1) {
      buttons[index].classList.remove("is-selected");
      buttons[index].classList.remove("is-correct");
      loopMarker = buttons[index].querySelector(".trivia-option-marker");
      if (buttons[index] !== button && buttons[index].classList.contains("is-incorrect") && loopMarker) {
        loopMarker.textContent = "×";
      }
    }

    button.classList.add("is-selected");
    button.classList.remove("is-incorrect");

    if (isCorrect) {
      button.classList.add("is-correct");
      if (marker) {
        marker.textContent = "✓";
      }
      if (explanation) {
        explanation.hidden = false;
      }
    } else {
      button.classList.add("is-incorrect");
      if (marker) {
        marker.textContent = "×";
      }
      if (explanation) {
        explanation.hidden = true;
      }
    }
  };
}

function setupGame(game, dateString) {
  var container = document.getElementById("nightly-game");
  if (!container) {
    return;
  }

  if (game.type === "reveal") {
    setupRevealGame(container, game.data);
  } else if (game.type === "two_truths_one_lie") {
    setupTwoTruthsGame(container, game.data);
  } else if (game.type === "missing_word") {
    setupMissingWordGame(container, game.data);
  } else if (game.type === "concept_match") {
    setupConceptMatchGame(container, game.data, dateString);
  } else if (game.type === "letter_by_letter") {
    setupLetterByLetterGame(container, game.data);
  } else if (game.type === "first_and_last") {
    setupFirstAndLastGame(container, game.data);
  } else if (game.type === "false_cognate") {
    setupFalseCognateGame(container, game.data);
  } else if (game.type === "odd_one_out") {
    setupOddOneOutGame(container, game.data);
  }
}

function setupRevealGame(container, data) {
  var clues = toStringArray(data && data.clues, 4, "Clue unavailable.");
  var answer = safeText(data && data.answer, "");
  var scoreLabels = toStringArray(data && data.score_labels, 4, "Complete");
  var list = container.querySelector("[data-reveal-clues]");
  var button = container.querySelector("[data-reveal-more]");
  var form = container.querySelector("[data-reveal-form]");
  var input = container.querySelector("#reveal-guess");
  var status = container.querySelector("[data-reveal-status]");
  var submitButton = form.querySelector("button");
  var clueCount = 1;

  button.onclick = function () {
    var item;
    if (clueCount >= clues.length) {
      button.disabled = true;
      return;
    }

    item = document.createElement("p");
    item.textContent = clues[clueCount];
    list.appendChild(item);
    clueCount += 1;

    if (clueCount >= clues.length) {
      button.disabled = true;
    }
  };

  form.onsubmit = function (event) {
    var guess;
    var expected;
    var scoreIndex;

    event.preventDefault();
    guess = normalizeAnswer(input.value);
    expected = normalizeAnswer(answer);

    if (!guess) {
      setStatus(status, "Enter a guess first.", false);
      return;
    }

    if (guess === expected) {
      scoreIndex = Math.max(0, Math.min(clueCount - 1, scoreLabels.length - 1));
      setStatus(status, "", true);
      setActionButtonState(submitButton, "success");
      submitButton.disabled = true;
      input.disabled = true;
      button.disabled = true;
    } else {
      setStatus(status, "", false);
      setActionButtonState(submitButton, "error");
    }
  };

  input.oninput = function () {
    if (!submitButton.disabled) {
      setActionButtonState(submitButton, "idle");
    }
  };
}

function setupTwoTruthsGame(container, data) {
  var options = Array.isArray(data && data.options) ? data.options.slice(0, 3) : [];
  var buttons = container.querySelectorAll("[data-lie-option]");
  var status = container.querySelector("[data-lie-status]");
  var index;

  for (index = 0; index < buttons.length; index += 1) {
    attachLieButton(buttons[index], buttons, options, container, status);
  }
}

function attachLieButton(button, buttons, options, container, status) {
  button.onclick = function () {
    var selected;
    var isLie;
    var index;
    var correctIndex;
    var correctButton;

    if (button.disabled) {
      return;
    }

    selected = Number(button.getAttribute("data-lie-option"));
    isLie = Boolean(options[selected] && options[selected].is_lie);

    for (index = 0; index < buttons.length; index += 1) {
      buttons[index].disabled = true;
    }

    if (isLie) {
      button.classList.add("is-correct");
      setStatus(status, "", true);
    } else {
      button.classList.add("is-incorrect");
      setStatus(status, "", false);
      correctIndex = -1;
      for (index = 0; index < options.length; index += 1) {
        if (options[index] && options[index].is_lie) {
          correctIndex = index;
          break;
        }
      }
      correctButton = container.querySelector('[data-lie-option="' + correctIndex + '"]');
      if (correctButton) {
        correctButton.classList.add("is-correct");
      }
    }
  };
}

function setupMissingWordGame(container, data) {
  var answer = safeText(data && data.answer, "");
  var hint = safeNullableText(data && data.hint);
  var form = container.querySelector("[data-missing-form]");
  var input = container.querySelector("#missing-word-guess");
  var status = container.querySelector("[data-missing-status]");
  var hintLine = container.querySelector("[data-missing-hint]");
  var submitButton = form.querySelector("button");

  form.onsubmit = function (event) {
    var guess;
    event.preventDefault();
    guess = normalizeAnswer(input.value);

    if (!guess) {
      setStatus(status, "Enter a guess first.", false);
      return;
    }

    if (guess === normalizeAnswer(answer)) {
      setStatus(status, "", true);
      setActionButtonState(submitButton, "success");
      input.disabled = true;
      submitButton.disabled = true;
    } else {
      setStatus(status, "", false);
      setActionButtonState(submitButton, "error");
      if (hint) {
        hintLine.textContent = "Hint: " + hint;
        hintLine.hidden = false;
      }
    }
  };

  input.oninput = function () {
    if (!submitButton.disabled) {
      setActionButtonState(submitButton, "idle");
    }
  };
}

function setupConceptMatchGame(container, data) {
  var pairs = Array.isArray(data && data.pairs) ? data.pairs.slice(0, 4) : [];
  var wordButtons = container.querySelectorAll("[data-match-word]");
  var definitionButtons = container.querySelectorAll("[data-match-definition]");
  var status = container.querySelector("[data-match-status]");
  var selectedWordId = null;
  var selectedDefinitionId = null;
  var matches = 0;
  var index;

  for (index = 0; index < wordButtons.length; index += 1) {
    attachWordButton(wordButtons[index]);
  }

  for (index = 0; index < definitionButtons.length; index += 1) {
    attachDefinitionButton(definitionButtons[index]);
  }

  function attachWordButton(button) {
    button.onclick = function () {
      var buttonIndex;
      if (button.disabled) {
        return;
      }

      for (buttonIndex = 0; buttonIndex < wordButtons.length; buttonIndex += 1) {
        wordButtons[buttonIndex].classList.remove("is-selected");
      }
      button.classList.add("is-selected");
      selectedWordId = button.getAttribute("data-match-word");
      attemptMatch();
    };
  }

  function attachDefinitionButton(button) {
    button.onclick = function () {
      var buttonIndex;
      if (button.disabled) {
        return;
      }

      for (buttonIndex = 0; buttonIndex < definitionButtons.length; buttonIndex += 1) {
        definitionButtons[buttonIndex].classList.remove("is-selected");
      }
      button.classList.add("is-selected");
      selectedDefinitionId = button.getAttribute("data-match-definition");
      attemptMatch();
    };
  }

  function attemptMatch() {
    var wordButton;
    var definitionButton;
    var wordMarker;
    var definitionMarker;
    if (!selectedWordId || !selectedDefinitionId) {
      return;
    }

    wordButton = container.querySelector('[data-match-word="' + selectedWordId + '"]');
    definitionButton = container.querySelector('[data-match-definition="' + selectedDefinitionId + '"]');
    wordMarker = wordButton ? wordButton.querySelector(".match-option-marker") : null;
    definitionMarker = definitionButton ? definitionButton.querySelector(".match-option-marker") : null;

    if (selectedWordId === selectedDefinitionId) {
      matches += 1;
      wordButton.disabled = true;
      definitionButton.disabled = true;
      wordButton.classList.remove("is-incorrect", "is-selected");
      definitionButton.classList.remove("is-incorrect", "is-selected");
      wordButton.className = "option-button is-matched";
      definitionButton.className = "option-button is-matched";
      if (wordMarker) {
        wordMarker.textContent = "";
      }
      if (definitionMarker) {
        definitionMarker.textContent = "";
      }
      setStatus(status, "", true);

      if (matches === pairs.length) {
        setStatus(status, "All pairs matched.", true);
      }
    } else {
      if (wordButton) {
        wordButton.classList.add("is-incorrect");
      }
      if (definitionButton) {
        definitionButton.classList.add("is-incorrect");
      }
      if (wordMarker) {
        wordMarker.textContent = "×";
      }
      if (definitionMarker) {
        definitionMarker.textContent = "×";
      }
      setStatus(status, "", false);
      if (wordButton) {
        wordButton.classList.remove("is-selected");
      }
      if (definitionButton) {
        definitionButton.classList.remove("is-selected");
      }
    }

    selectedWordId = null;
    selectedDefinitionId = null;
  }
}

function setupLetterByLetterGame(container, data) {
  var answer = safeText(data && data.answer, "").toUpperCase();
  var maxWrong = Number.isInteger(data && data.max_wrong) ? data.max_wrong : 6;
  var successNote = safeNullableText(data && data.success_note);
  var mask = container.querySelector("[data-letter-mask]");
  var used = container.querySelector("[data-letter-used]");
  var wrong = container.querySelector("[data-letter-wrong]");
  var status = container.querySelector("[data-letter-status]");
  var form = container.querySelector("[data-letter-form]");
  var input = container.querySelector("#letter-guess");
  var submitButton = form.querySelector("button");
  var guessedLetters = [];
  var wrongCount = 0;

  form.onsubmit = function (event) {
    var letter;
    var currentMask;
    event.preventDefault();
    letter = String(input.value || "").trim().toUpperCase();

    if (!/^[A-ZÀ-ÖØ-Þ]$/i.test(letter)) {
      setStatus(status, "Enter one letter.", false);
      return;
    }

    if (guessedLetters.indexOf(letter) !== -1) {
      setStatus(status, "That letter was already used.", false);
      input.value = "";
      return;
    }

    guessedLetters.push(letter);
    used.textContent = "Used letters: " + guessedLetters.join(", ");

    if (answer.indexOf(letter) !== -1) {
      currentMask = renderMask(answer, guessedLetters);
      mask.innerHTML = currentMask;
      if (currentMask.indexOf("_") === -1) {
        setStatus(status, successNote || "Solved.", true);
        setActionButtonState(submitButton, "success");
        submitButton.disabled = true;
        input.disabled = true;
      } else {
        setStatus(status, "Good letter.", true);
        setActionButtonState(submitButton, "idle");
      }
    } else {
      wrongCount += 1;
      wrong.textContent = "Wrong guesses: " + wrongCount + " / " + maxWrong;
      if (wrongCount >= maxWrong) {
        setStatus(status, "No more guesses. The answer is below.", false);
        setActionButtonState(submitButton, "error");
        submitButton.disabled = true;
        input.disabled = true;
      } else {
        setStatus(status, "Not in the word.", false);
        setActionButtonState(submitButton, "error");
      }
    }

    input.value = "";
  };
}

function setupFirstAndLastGame(container, data) {
  var answer = safeText(data && data.answer, "");
  var form = container.querySelector("[data-first-last-form]");
  var input = container.querySelector("#first-last-guess");
  var status = container.querySelector("[data-first-last-status]");
  var submitButton = form.querySelector("button");

  form.onsubmit = function (event) {
    var middle;
    var guess;
    event.preventDefault();
    middle = String(input.value || "").trim();
    if (!middle) {
      setStatus(status, "Enter the missing middle letters.", false);
      return;
    }

    guess = answer.charAt(0) + middle + answer.charAt(answer.length - 1);
    if (normalizeAnswer(guess) === normalizeAnswer(answer)) {
      setStatus(status, "", true);
      setActionButtonState(submitButton, "success");
      input.disabled = true;
      submitButton.disabled = true;
    } else {
      setStatus(status, "", false);
      setActionButtonState(submitButton, "error");
    }
  };

  input.oninput = function () {
    if (!submitButton.disabled) {
      setActionButtonState(submitButton, "idle");
    }
  };
}

function setupFalseCognateGame(container, data) {
  var answer = normalizeGameType(data && data.answer);
  var buttons = container.querySelectorAll("[data-cognate-choice]");
  var status = container.querySelector("[data-cognate-status]");
  var index;

  for (index = 0; index < buttons.length; index += 1) {
    attachCognateButton(buttons[index], buttons, container, status, answer);
  }
}

function attachCognateButton(button, buttons, container, status, answer) {
  button.onclick = function () {
    var choice;
    var index;
    var correctButton;

    if (button.disabled) {
      return;
    }

    choice = button.getAttribute("data-cognate-choice");
    for (index = 0; index < buttons.length; index += 1) {
      buttons[index].disabled = true;
    }

    if (choice === answer) {
      button.classList.add("is-correct");
      setStatus(status, "", true);
    } else {
      button.classList.add("is-incorrect");
      setStatus(status, "", false);
      correctButton = container.querySelector('[data-cognate-choice="' + answer + '"]');
      if (correctButton) {
        correctButton.classList.add("is-correct");
      }
    }
  };
}

function setupOddOneOutGame(container, data) {
  var options = Array.isArray(data && data.options) ? data.options.slice(0, 5) : [];
  var buttons = container.querySelectorAll("[data-odd-option]");
  var status = container.querySelector("[data-odd-status]");
  var index;

  for (index = 0; index < buttons.length; index += 1) {
    attachOddButton(buttons[index], buttons, options, container, status);
  }
}

function attachOddButton(button, buttons, options, container, status) {
  button.onclick = function () {
    var selected;
    var isOdd;
    var index;
    var correctIndex;
    var correctButton;

    if (button.disabled) {
      return;
    }

    selected = Number(button.getAttribute("data-odd-option"));
    isOdd = Boolean(options[selected] && options[selected].is_odd);

    for (index = 0; index < buttons.length; index += 1) {
      buttons[index].disabled = true;
    }

    if (isOdd) {
      button.classList.add("is-correct");
      setStatus(status, "", true);
    } else {
      button.classList.add("is-incorrect");
      setStatus(status, "", false);
      correctIndex = -1;
      for (index = 0; index < options.length; index += 1) {
        if (options[index] && options[index].is_odd) {
          correctIndex = index;
          break;
        }
      }
      correctButton = container.querySelector('[data-odd-option="' + correctIndex + '"]');
      if (correctButton) {
        correctButton.classList.add("is-correct");
      }
    }
  };
}

function renderMask(answer, guessedLetters) {
  return answer
    .toUpperCase()
    .split("")
    .map(function (character) {
      if (character === " ") {
        return "<span>&nbsp;</span>";
      }

      return guessedLetters.indexOf(character) !== -1
        ? "<span>" + escapeHtml(character) + "</span>"
        : "<span>_</span>";
    })
    .join("");
}

function normalizeGameType(value) {
  var raw = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\\s-]+/g, "_");

  var aliases = {
    reveal: "reveal",
    two_truths_one_lie: "two_truths_one_lie",
    two_truths_one_lies: "two_truths_one_lie",
    missing_word: "missing_word",
    concept_match: "concept_match",
    letter_by_letter: "letter_by_letter",
    first_and_last: "first_and_last",
    false_cognate: "false_cognate",
    odd_one_out: "odd_one_out"
  };

  return aliases[raw] || "unsupported";
}

function normalizeAnswer(value) {
  return stripMarks(String(value || ""))
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\\s-]/g, "")
    .replace(/\\s+/g, " ");
}

function stripMarks(value) {
  return value.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");
}

function setStatus(element, text, isSuccess) {
  if (!element) {
    return;
  }
  element.textContent = text;
  element.className = isSuccess ? "game-status is-success" : "game-status is-error";
}

function setActionButtonState(button, state) {
  var defaultLabel;
  if (!button) {
    return;
  }

  defaultLabel = button.getAttribute("data-default-label") || "Submit";
  button.classList.remove("is-success", "is-error");

  if (state === "success") {
    button.textContent = "✓ Correct";
    button.classList.add("is-success");
    return;
  }

  if (state === "error") {
    button.textContent = "✕ Try again";
    button.classList.add("is-error");
    return;
  }

  button.textContent = "↑ " + defaultLabel;
}

function safeText(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function safeNullableText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function toStringArray(value, fallbackCount, fallbackText) {
  var index;
  var result;
  if (!Array.isArray(value) || !value.length) {
    result = [];
    for (index = 0; index < Math.max(fallbackCount, 1); index += 1) {
      result.push(fallbackText);
    }
    return result;
  }

  return value.map(function (item) {
    return safeText(item, fallbackText);
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
`;
}

function normalizeEntry(entry, fallbackDate) {
  const essayParagraphs = toStringArray(entry && entry.essay && entry.essay.paragraphs, 1, "Tonight's essay is not available yet.");
  const personParagraphs = toStringArray(entry && entry.person && entry.person.paragraphs, 1, "This profile will appear once the person notes are available.");
  const triviaOptions = toStringArray(entry && entry.trivia && entry.trivia.options, 4, "Option unavailable.");
  let baseQuestions;
  const questions = [];

  if (Array.isArray(entry && entry.questions) && entry.questions.length) {
    baseQuestions = entry.questions.slice(0, 3).map((item) => ({
      text: safeText(item && item.text, "Question unavailable."),
      deeper: safeText(item && item.deeper, "No deeper prompt is available yet."),
      experiment: safeText(item && item.experiment, "No experiment is available yet.")
    }));
  } else {
    baseQuestions = [{
      text: "Question unavailable.",
      deeper: "No deeper prompt is available yet.",
      experiment: "No experiment is available yet."
    }];
  }

  baseQuestions.forEach((item) => questions.push(item));

  while (questions.length < 3) {
    questions.push({
      text: "Question unavailable.",
      deeper: "No deeper prompt is available yet.",
      experiment: "No experiment is available yet."
    });
  }

  return {
    date: safeText(entry && entry.date, fallbackDate),
    title: safeText(entry && entry.title, "Nightly Digest"),
    essay: {
      paragraphs: essayParagraphs,
      blockquote: safeText(entry && entry.essay && entry.essay.blockquote, "The note for tonight is still being prepared."),
      crosslink: safeText(entry && entry.essay && entry.essay.crosslink, "Crosslink unavailable.")
    },
    number: {
      value: safeText(entry && entry.number && entry.number.value, "No number yet"),
      label: safeText(entry && entry.number && entry.number.label, "The contextual note for tonight's number is not available yet.")
    },
    fragment: safeText(entry && entry.fragment, "Tonight's fragment is not available yet."),
    word: {
      term: safeText(entry && entry.word && entry.word.term, "Word unavailable"),
      origin: safeText(entry && entry.word && entry.word.origin, "Origin unavailable."),
      definition: safeText(entry && entry.word && entry.word.definition, "Definition unavailable.")
    },
    quote: {
      text: safeText(entry && entry.quote && entry.quote.text, "Quote unavailable."),
      translation: safeNullableText(entry && entry.quote && entry.quote.translation),
      author: safeText(entry && entry.quote && entry.quote.author, "Unknown author"),
      source: safeText(entry && entry.quote && entry.quote.source, "Unknown source")
    },
    person: {
      name: safeText(entry && entry.person && entry.person.name, "Unknown person"),
      dates: safeText(entry && entry.person && entry.person.dates, "Dates unavailable."),
      paragraphs: personParagraphs
    },
    questions,
    trivia: {
      question: safeText(entry && entry.trivia && entry.trivia.question, "Trivia question unavailable."),
      options: triviaOptions.slice(0, 4),
      correct: Number.isInteger(entry && entry.trivia && entry.trivia.correct) ? entry.trivia.correct : 0,
      explanation: safeText(entry && entry.trivia && entry.trivia.explanation, "Explanation unavailable.")
    },
    game: normalizeGame(entry && entry.game)
  };
}

function normalizeGame(game) {
  return {
    type: normalizeGameType(game && game.type),
    data: game && typeof game.data === "object" ? game.data : {}
  };
}

function normalizeGameType(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const aliases = {
    reveal: "reveal",
    two_truths_one_lie: "two_truths_one_lie",
    two_truths_one_lies: "two_truths_one_lie",
    missing_word: "missing_word",
    concept_match: "concept_match",
    letter_by_letter: "letter_by_letter",
    first_and_last: "first_and_last",
    false_cognate: "false_cognate",
    odd_one_out: "odd_one_out"
  };

  return aliases[raw] || "unsupported";
}

function renderMask(answer, guessedLetters) {
  return safeText(answer, "")
    .toUpperCase()
    .split("")
    .map((character) => {
      if (character === " ") {
        return "<span>&nbsp;</span>";
      }

      return guessedLetters.includes(character)
        ? "<span>" + escapeHtml(character) + "</span>"
        : "<span>_</span>";
    })
    .join("");
}

function renderFirstAndLastMask(answer, displayLength) {
  const safeAnswer = safeText(answer, "");
  const length = Number.isInteger(displayLength) ? displayLength : safeAnswer.length;
  if (!safeAnswer) {
    return "<span>_</span>";
  }

  const first = escapeHtml(safeAnswer.charAt(0));
  const last = escapeHtml(safeAnswer.charAt(safeAnswer.length - 1));
  const middleCount = Math.max(length - 2, 1);

  return [
    "<span>" + first + "</span>",
    ...new Array(middleCount).fill("<span>_</span>"),
    "<span>" + last + "</span>"
  ].join("");
}

function seededShuffle(items, seed) {
  let state = seed;
  const values = items.slice();

  for (let index = values.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    const swapIndex = Math.abs(state) % (index + 1);
    const temp = values[index];
    values[index] = values[swapIndex];
    values[swapIndex] = temp;
  }

  return values;
}

function buildSeed(dateString) {
  return Number(String(dateString || "").replace(/-/g, "")) || 1;
}

function formatLongDate(dateString) {
  const parts = String(dateString).split("-").map((part) => Number(part));
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return dateString;
  }

  const date = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  return date.toLocaleDateString("en-NZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function formatArchiveDate(dateString) {
  const parts = String(dateString).split("-").map((part) => Number(part));
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  if (parts.length !== 3 || parts.some(Number.isNaN) || !monthNames[parts[1] - 1]) {
    return dateString;
  }

  return ordinal(parts[2]) + " " + monthNames[parts[1] - 1] + " " + parts[0];
}

function formatMonthYear(dateString) {
  const parts = String(dateString).split("-").map((part) => Number(part));
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  if (parts.length !== 3 || parts.some(Number.isNaN) || !monthNames[parts[1] - 1]) {
    return dateString;
  }

  return monthNames[parts[1] - 1] + " " + parts[0];
}

function ordinal(day) {
  const remainder = day % 100;
  if (remainder >= 11 && remainder <= 13) {
    return day + "th";
  }

  switch (day % 10) {
    case 1:
      return day + "st";
    case 2:
      return day + "nd";
    case 3:
      return day + "rd";
    default:
      return day + "th";
  }
}

function groupDigestsByMonth(digests) {
  const groups = [];
  let currentGroup = null;

  digests.forEach((entry) => {
    const label = formatMonthYear(entry.date);
    if (!currentGroup || currentGroup.label !== label) {
      currentGroup = {
        label,
        items: []
      };
      groups.push(currentGroup);
    }

    currentGroup.items.push(entry);
  });

  return groups;
}

function stripTrailingPeriod(value) {
  return String(value || "").replace(/\.\s*$/, "").trim();
}

function safeText(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function safeNullableText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function toStringArray(value, fallbackCount, fallbackText) {
  if (!Array.isArray(value) || !value.length) {
    return new Array(Math.max(fallbackCount, 1)).fill(fallbackText);
  }

  return value.map((item) => safeText(item, fallbackText));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function repeatSpaces(count) {
  return " ".repeat(count);
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

main();
