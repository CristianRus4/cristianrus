# Nightly Generation Guide

## How to generate a batch
- A batch is 7 digests (one week). Generate 7 complete `DigestEntry` JSON objects.
- Read `user-profile.json` first. All content choices must be consistent with it.
- Read `content-bible.md` for the pool of available essay topics, words, people, and quote sources.
- If files already exist in `data/digests/`, read the latest 10 dated files and extract: essay topics used, authors quoted, words used, game types used, and people featured. Do not repeat any of these within the new batch or within the last 10 entries.
- Output valid JSON only: one `DigestEntry` object per day, saved to `data/digests/YYYY-MM-DD.json`.

## Quote rotation rules
- Primary authors from `user-profile.json` may appear at most once every 5 days.
- Secondary authors may appear at most once every 14 days.
- Never use the same quote twice. Track by source title plus approximate location.
- Prefer lesser-known passages over canonical ones.
- If the quote is not in English, include the original language text first, then the translation.

## Essay topic rules
- No topic from the last 10 digests may be repeated.
- Rotate across the 10 territory categories in `content-bible.md`. No more than 2 digests per batch from the same territory.
- Essays must not mention the author of the quote. The quote section is the only place authors appear.
- Essays should end in tension, not resolution.
- Do not use a call to action or tidy moral.
- The `crosslink` field connects the essay to a concept from a different field entirely. One sentence only.

## Game rotation rules
- Every digest must always include `trivia` plus exactly one main game in `game`.
- Available main game types: `reveal`, `two_truths_one_lie`, `missing_word`, `concept_match`, `letter_by_letter`, `first_and_last`, `false_cognate`, `odd_one_out`.
- In any 8-day window, each type should appear once.
- Within a 7-day batch, no type repeats.
- Game content must relate to the essay topic of that day.
- Never reuse essay words verbatim in game options.
- For `concept_match`, include the word of the night as one of the four pairs.
- For `reveal`, the hidden word should be a concept from the essay, not the exact title word.

## Word rules
- Never use a Greek-origin word two batches in a row.
- Rotate language families: Latin, Germanic, Celtic, Slavic, Japanese, Arabic, Portuguese or Spanish, French.
- Never reuse a word from any existing digest.
- The word should appear organically in the essay or sit directly beside its theme.

## Person rules
- Do not repeat a person from the last 10 digests.
- Avoid famous figures. The person should require genuine effort to recognise.
- Use two paragraphs maximum: achievement first, complication or irony second.
- Format dates and location exactly as `1824 – 1907 — City, Country`.

## Number callout rules
- One number per digest.
- Use a real, verifiable figure, not an approximate number unless it is labelled as such.
- The number should recontextualise something from the essay, not merely illustrate it.
- Format as a display value plus a single sentence label.

## Fiction fragment rules
- Write 4 to 6 sentences.
- Use an unnamed narrator or unnamed subject.
- Do not add resolution or moral.
- Keep it in the same thematic neighborhood as the essay without spelling the connection out.
- Aim for a precise, imagistic, slightly strange register.

## Output schema reminder
Each digest entry must contain:
- `date`
- `title`
- `essay.paragraphs`
- `essay.blockquote`
- `essay.crosslink`
- `number.value`
- `number.label`
- `fragment`
- `word.term`
- `word.origin`
- `word.definition`
- `quote.text`
- `quote.translation`
- `quote.author`
- `quote.source`
- `person.name`
- `person.dates`
- `person.paragraphs`
- `questions` with exactly 3 items
- `trivia`
- `game` (exactly one main game from the 8-type pool)

## Owner workflow
1. Generate one 7-day batch, usually on Sunday.
2. Review quote attribution, game correctness, and visible topic repetition before merging.
3. Save each digest as its own file in `data/digests/` using `YYYY-MM-DD.json`.
4. Keep at least 14 future dated files in `data/digests/` at all times.
5. Commit and push. GitHub Pages will serve the updated files immediately.
