# Nightly Generation Guide

## Core principle
There is no content pool to draw from. Everything — essay topics, words, people, quotes — is generated fresh each batch by reasoning directly from `user-profile.json`. Read the profile, understand the person, and derive content that fits. Do not recycle, do not default to the obvious. The profile exists to constrain quality and direction, not to supply pre-approved answers.

## How to generate a batch
1. Read `user-profile.json` in full. Internalise the interests, authors, sensibility, and languages.
2. Read the last 10 files in `data/digests/` and extract what has already been used: essay topics, words, authors quoted, people featured, game types. Do not repeat any of these within the new batch or within those last 10 entries.
3. Generate one `DigestEntry` JSON object per requested day, saved to `data/digests/YYYY-MM-DD.json`.

## Essay rules
- Derive topics from the owner's interests as described in `user-profile.json`. Any genuine interest is fair territory. Do not restrict to a predetermined list.
- No topic from the last 10 digests may be repeated, but similarity of angle counts — a rephrase does not constitute a different topic.
- Essays must not mention the author of the quote. The quote section is the only place authors appear.
- Essays should end in tension, not resolution. No tidy moral, no call to action.
- Aim for 4–6 paragraphs. Prefer concrete images over abstract statements. Let moods accumulate rather than arguing toward a conclusion.
- The blockquote appears inside the essay, not at the end. It is a single sentence the essay has earned, stated plainly. After the blockquote, the essay continues — at least one paragraph follows it before the essay closes.
- The `blockquote` field holds that sentence. It is not attributed to any author.

## Word rules
- Choose any word from any language that fits the essay's territory organically. The word should emerge from or sit directly beside the essay's thematic core — not appended arbitrarily.
- Any real word from any language is valid if the fit is precise and the word is genuinely interesting. Do not restrict to a list.
- Never reuse a word from any existing digest.
- Rotate language families across a batch. No family should dominate.
- The `origin` field names the language and gives etymological or cultural context. The `definition` field is the lived sense of the word, not a dictionary entry.

## Quote rules
- Draw from authors in `user-profile.json`. Authors marked as primary may appear at most once every 5 days. Secondary authors at most once every 14 days.
- Never reuse a quote. Track by source title and approximate location.
- Prefer lesser-known passages over canonical ones. Avoid the quotes everyone already knows.
- If the quote is not in English, include the original language text first, then the English translation.
- The quote should resonate with the essay's territory without illustrating it literally.

## Person rules
- Feature someone the reader is genuinely unlikely to know. The person should require real effort to recognise.
- Derive the person freely — anyone who fits the essay's territory and the owner's intellectual range is a valid candidate. Do not rely on a fixed list.
- Do not repeat a person from the last 10 digests.
- Two paragraphs: achievement or contribution first, complication or irony second.
- Format dates and location exactly as `1824 – 1907 — City, Country`.

## Number rules
- One real, verifiable figure per digest. Label approximate figures explicitly.
- The number should recontextualise something from the essay — shift its scale or complicate its premise — not merely illustrate it.
- Format: a display value and a single sentence label.

## Fiction fragment rules
- 4 to 6 sentences.
- Unnamed narrator or unnamed subject.
- No resolution, no moral.
- Same thematic territory as the essay, but approached obliquely — do not spell the connection out.
- Register: precise, imagistic, slightly strange. Not poetic in a decorative sense.

## Game rules
- Every digest includes `trivia` plus exactly one main game.
- Available game types: `reveal`, `two_truths_one_lie`, `missing_word`, `concept_match`, `letter_by_letter`, `first_and_last`, `false_cognate`, `odd_one_out`.
- Do not repeat a game type that has appeared recently. Check the last 10 digests and avoid types used there.
- Game content must relate to the essay topic of that day. Do not reuse essay words verbatim in game options.
- For `reveal`: the hidden word should be a concept from the essay, not the exact title word.

## Questions rules
- Exactly 3 questions per digest.
- Each question has a `text` (the main prompt), a `deeper` (a follow-up that goes further), and an `experiment` (a small concrete action the reader can do today).
- Questions should be genuinely open — not rhetorical, not leading. They should feel like the essay left something unresolved and the question inhabits that gap.

## Output schema
Each digest entry must contain exactly:
- `date`
- `title`
- `essay.paragraphs` (array of strings)
- `essay.blockquote`
- `number.value`
- `number.label`
- `fragment`
- `word.term`
- `word.origin`
- `word.definition`
- `quote.text`
- `quote.translation` (null if English)
- `quote.author`
- `quote.source`
- `person.name`
- `person.dates`
- `person.paragraphs` (array, 2 items)
- `questions` (array of 3 items, each with `text`, `deeper`, `experiment`)
- `trivia.question`
- `trivia.options` (array of 4 strings)
- `trivia.correct` (0-indexed integer)
- `trivia.explanation`
- `game.type`
- `game.data` (structure depends on type — see existing digests for reference)

## Workflow
1. Review quote attribution, game correctness, and visible topic repetition before saving.
2. Save each digest as its own file in `data/digests/` using `YYYY-MM-DD.json`.
3. Run `node nightly/scripts/build-static.js` to generate static pages in `nightly/digests/`.
