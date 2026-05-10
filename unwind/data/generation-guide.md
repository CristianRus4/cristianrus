# Unwind Generation Guide

## Core principle
There is no content pool to draw from. Everything — essay topics, words, people, quotes — is generated fresh each batch. Read `user-profile.json` to understand who this person is: what they have read, what they watch, what they care about, how they think. Use that understanding to generate content that feels true to them. The profile is a window into a personality, not a boundary around permitted topics. Go wherever the essay territory and genuine intellectual curiosity leads.

## How to generate a batch
1. Read `user-profile.json` in full. Form a picture of the person — their sensibility, their intellectual range, the kinds of things they find meaningful.
2. Read the last 10 files in `data/digests/` and extract what has already been used: essay topics, words, authors quoted, people featured, places, films, and game types. Do not repeat any of these within the new batch or within those last 10 entries.
3. Generate one `DigestEntry` JSON object per requested day, saved to `data/digests/YYYY-MM-DD.json`.

## Expanded profile fields

The profile now includes six fields beyond authors, books, films, music, interests, and languages. Read each one during step 1 and apply as follows:

- **`trusted_publications`** — these define the quality register and intellectual genre. Every section of every digest should feel like it belongs in one of these outlets. Use them to calibrate voice, depth, and the level of assumed reader engagement. The register is rigorous but not academic; serious but not solemn.
- **`avoid`** — hard constraints on tone, framing, and topic treatment. Nothing in this list should appear anywhere in a digest — not in the essay, not in the questions, not in the fragment or game. This applies not just to subject matter but to rhetorical posture: a piece should not sound like the things described here even when its topic differs.
- **`what_resonates_in_writing`** — active qualities to build into every essay, fragment, and person paragraph. These are not optional stylistic preferences; they describe what makes a piece land for this reader. The existing essay rules already encode several of them (tension over resolution, concrete images over abstraction) — treat the others as extensions of the same logic.
- **`values`** — the implicit worldview. Essays and questions need not state these explicitly, but should never contradict them. A piece that celebrates speed, productivity framing, forced resolution, or naive optimism contradicts this profile at its core regardless of its stated topic.
- **`recurring_motifs`** — background texture, not essay subjects. These images belong to this reader's sensibility and may appear incidentally — a passing detail, a word choice that carries atmosphere, the setting of a now_here. They are never the point of a digest. Do not build essays, fragments, or questions around them. Do not reach for them. At most one should surface in any digest, and only when the essay's independent territory makes it genuinely natural.
- **`podcasts_and_audio`** — supplementary cultural range alongside books and films. Figures and ideas from these programmes are valid sources for quotes and person sections, subject to the same rules as all other sources (no repetition, prefer lesser-known passages).

## Essay rules
- Generate topics that a person with this sensibility would find genuinely resonant. The profile gives you a sense of what that means — use it to calibrate, not to restrict. Topics are not limited to anything listed there.
- No topic from the last 10 digests may be repeated, but similarity of angle counts — a rephrase does not constitute a different topic.
- Essays must not mention the author of the quote. The quote section is the only place authors appear.
- Essays should end in tension, not resolution. No tidy moral, no call to action.
- Aim for 5–7 paragraphs in `essay.paragraphs`. Prefer concrete images over abstract statements. Let moods accumulate rather than arguing toward a conclusion.
- The `blockquote` renders after all paragraphs. Treat it as the sentence the essay has been building toward — not a summary, but a crystallisation. The paragraphs must earn it.
- Write the essay so that the final 2–3 paragraphs drive toward the blockquote: the last paragraph before it should arrive at the tension or image the blockquote then states plainly.
- The `blockquote` field holds a single sentence, stated without attribution.

## Tension rules
- This section appears immediately after the essay.
- `tension.positions` must contain exactly 2 items.
- Each item is one position on the essay's central idea, written as exactly 2 sentences.
- Across the whole section, there are 4 sentences total. No synthesis, no winner, no compromise language.
- The goal is philosophical antinomy, not a debate-club "both sides" summary.

## Word rules
- Choose any word from any language that fits the essay's territory organically. The word should emerge from or sit directly beside the essay's thematic core — not appended arbitrarily.
- Any real word from any language is valid if the fit is precise and the word is genuinely interesting.
- Never reuse a word from any existing digest.
- Rotate language families across a batch. No family should dominate.
- Always include a pronunciation line in `word.pronunciation`.
- `word.pronunciation` must be a slash-delimited IPA transcription, not an English respelling. Write `/saʊˈdɑːdə/`, not `sow-DAH-duh`.
- Use broad IPA for the intended reading of the featured term in the digest. Keep it consistent and readable; do not mix IPA with explanatory text.
- If the word's original writing system is non-Latin, also include it in `word.original` exactly as written in that script. If the word is already normally written in the Latin alphabet, set `word.original` to `null`.
- The rendered order is: `word.term`, then the pronunciation line, then the existing origin/context line, then the definition.
- The `origin` field names the language and gives etymological or cultural context. The `definition` field is the lived sense of the word, not a dictionary entry.

## Quote rules
- The quote can be from anyone — the authors list in `user-profile.json` describes who the owner reads and admires, but the quote is not limited to those people. Any writer, thinker, poet, or figure whose words fit is valid.
- Never reuse a quote. Track by author and source.
- Prefer lesser-known passages over canonical ones. Avoid the quotes everyone already knows.
- If the quote is not in English, include the original language text first, then the English translation.
- The quote should resonate with the essay's territory without illustrating it literally.
- Use a middle dot ` · ` as a separator for both the quote attribution (Author · Source) and the person info (Years · Location).

## On this day rules
- This section appears between the quote and the person section.
- One real historical event only, and it must have happened on that calendar date.
- Choose for thematic resonance with the essay, not because it is the most famous event available.
- Avoid trivia. The event should recontextualise the essay's territory through actual time.
- Always include a place line beneath the year. If the event spans multiple sites, choose the most meaningful location or the clearest geographic frame.
- Use `on_this_day.year`, `on_this_day.place`, and `on_this_day.text`.

## Person rules
- Feature someone the reader is genuinely unlikely to know. The person should require real effort to recognise.
- Derive the person freely — anyone who fits the essay's territory and the owner's intellectual range is a valid candidate. Do not rely on a fixed list.
- Do not repeat a person from the last 10 digests.
- Two paragraphs: achievement or contribution first, complication or irony second.
- Format dates and location exactly as `1824 – 1907 · City, Country`.

## Now here rules
- This section appears after the person section and before the questions.
- Choose one specific location in the world: a forest, monastery, street, river, mountain, cave, ruin, island, valley, or similarly concrete place.
- This is not travel writing. No recommendation voice, no itinerary language, no "visit" framing.
- The place should fit the essay's sensibility, not merely its subject.
- Use `now_here.name`, `now_here.location`, and `now_here.text` for one paragraph.

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
- For `missing_word`: use the `_` character with spaces between them (e.g., `_ _ _ _ _`) to represent the missing word, matching its exact character count.
- Game JSON must match one of the exact schemas below. Do not rename fields, do not invent alternative shapes, and do not mix schemas from different game types.
- `reveal` schema:
  `{"type":"reveal","data":{"answer":"string","clues":["string","string","string","string"],"score_labels":["string","string","string","string"]}}`
- `two_truths_one_lie` schema:
  `{"type":"two_truths_one_lie","data":{"prompt":"string","statements":[{"text":"string","is_lie":false},{"text":"string","is_lie":true},{"text":"string","is_lie":false}],"explanation":"string"}}`
- `missing_word` schema:
  `{"type":"missing_word","data":{"before":"string","after":"string","answer":"string","hint":"string"}}`
- `concept_match` schema:
  `{"type":"concept_match","data":{"pairs":[{"id":"a","word":"string","definition":"string"},{"id":"b","word":"string","definition":"string"},{"id":"c","word":"string","definition":"string"},{"id":"d","word":"string","definition":"string"}]}}`
- `letter_by_letter` schema:
  `{"type":"letter_by_letter","data":{"answer":"string","definition":"string","max_wrong":6,"success_note":"string"}}`
- `first_and_last` schema:
  `{"type":"first_and_last","data":{"answer":"string","display_length":10,"definition":"string"}}`
- `false_cognate` schema:
  `{"type":"false_cognate","data":{"word_a":{"term":"string","language":"string","meaning":"string"},"word_b":{"term":"string","language":"string","meaning":"string"},"question":"string","answer":"true_cognate|false_cognate","explanation":"string"}}`
- `odd_one_out` schema:
  `{"type":"odd_one_out","data":{"prompt":"string","options":[{"word":"string","is_odd":false},{"word":"string","is_odd":false},{"word":"string","is_odd":true},{"word":"string","is_odd":false},{"word":"string","is_odd":false}],"explanation":"string"}}`
- For `two_truths_one_lie`, use `statements`, not `options`, and use `explanation`, not `lie_explanation`.
- For `reveal` and `letter_by_letter`, the answer field name is always `answer`, never `word`.
- For `odd_one_out`, use `prompt`, not `question`, and each option must be an object with `word` and `is_odd`.
- For `first_and_last`, do not supply `pairs`, `prompt`, or multiple answers. It is a single answer game only.
- Before saving, validate the game payload against the exact schema for its type and compare it with at least one existing working digest of the same game type.

## Movie time rules
- This section appears after the games and before the answers.
- Recommend exactly one film.
- Before choosing, read the `films` list in `user-profile.json` and avoid recommending anything already present there.
- Also avoid repeating films used in recent digests.
- The film should come from territory adjacent to the essay, not serve as a literal illustration of it.
- Keep the blurb to 3 sentences maximum.
- Use `movie.title`, `movie.director`, `movie.year`, and `movie.text`.

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
- `tension.positions` (array of 2 strings, each 2 sentences)
- `number.value`
- `number.label`
- `fragment`
- `word.term`
- `word.pronunciation` (slash-delimited IPA only, e.g. `/ˈjuːɡɛn/`)
- `word.original` (null if normally written in the Latin alphabet)
- `word.origin`
- `word.definition`
- `quote.text`
- `quote.translation` (null if English)
- `quote.author`
- `quote.source`
- `on_this_day.year`
- `on_this_day.place`
- `on_this_day.text`
- `person.name`
- `person.dates`
- `person.paragraphs` (array, 2 items)
- `now_here.name`
- `now_here.location`
- `now_here.text`
- `questions` (array of 3 items, each with `text`, `deeper`, `experiment`)
- `trivia.question`
- `trivia.options` (array of 4 strings)
- `trivia.correct` (0-indexed integer)
- `trivia.explanation`
- `game.type`
- `game.data` (structure depends on type — see existing digests for reference)
- `movie.title`
- `movie.director`
- `movie.year`
- `movie.text`

## Workflow
1. Review quote attribution, game correctness, and visible topic repetition before saving.
2. Save each digest as its own file in `data/digests/` using `YYYY-MM-DD.json`.
3. Run `node unwind/scripts/build-static.js` to generate static pages in `unwind/digests/`.
