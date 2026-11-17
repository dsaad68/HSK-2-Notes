# HSK 2 Notes

Interactive, animated study notes for **HSK 2 (3.0)**, built from the textbook pages and practice exams.
The source scans live in `exam-materials/`, which is git-ignored and stays on your machine only;
the one exception is the vocabulary list, `exam-materials/vocab/HSK-2.xls`, which the Vocabulary part is built from.

The landing page (`#/`) lists the five parts in exam order. Three are ready:

| # | Part | Where | Status |
| --- | --- | --- | --- |
| 01 | 词汇 Vocabulary | `#/vocab` | **ready**: 109 character graphs from the 497-word list, quiz |
| 02 | 语法 Grammar | `#/grammar` | **ready**: lessons 1–2, 6 patterns |
| 03 | 词组 Expressions | `#/expressions` | **ready**: 14 lessons, 42 expressions |
| 04 | 偏旁 Writing · Radicals | `#/radicals` | **ready**: 30 radicals, 15 exam sets |
| 05 | 书写 Writing · Part 2 | | coming soon |

Each part has its own links in the top bar, and the breadcrumb next to the logo goes back to that part's home.

## Open it

Double-click `index.html`. Everything works offline except the two Latin web fonts
(Fraunces, Inter), which fall back to system fonts.

Or serve it locally:

```sh
cd site && python3 -m http.server 8765
# → http://127.0.0.1:8765
```

## Vocabulary 词汇 (character graphs)

The HSK 2 word list (`exam-materials/vocab/HSK-2.xls`, 500 rows = 497 words; 点, 过 and 花 appear twice) drawn as graphs.
Every character that two or more words share becomes a **hub**: the hub in red, its words around it, each with pinyin and meaning.
Words that **start** with the hub branch right (上 → 上班, 上课), words where it comes **later** branch left (晚上, 路上 ← 上), so the structure is visible at a glance.
A character that only ever appears inside one two-character word is merged into a hub for that word (意 + 思 → 意思, 朋 + 友 → 朋友).
A character read two ways gets one graph per reading: 觉 jué (觉得) and 觉 jiào (睡觉), 好 hǎo and 好 hào (爱好), 儿 ér (儿子, 女儿) and 儿 -r (哪儿, 这儿 …).
Each links to the other ("same character, another reading"), and a blue character always links to the graph of the reading it has in that word.

| Page | What it does |
| --- | --- |
| **Graphs 图** (`#/vocab`) | All 109 graphs as cards, each with its meaning on top; click anywhere on a card to open it. Search by character, toneless pinyin or English, show only graphs with words that are new in HSK 2, and sort by size or A–Z. Partner characters in blue are links to their own graph. |
| **One graph** (`#/vocab/学`) | Fits on one laptop screen. Small families stand in a straight column per side; families that wouldn't fit bend each side into half an ellipse around the hub, so the words spread out instead of stacking (`vocab.js` widens only the crowded side until no two words touch). Previous / next graph sit at the top next to *All graphs*; moving between graphs swaps the content in place while the hub is inked and the words glide out of it. Pinyin is spaced one syllable per character (shàng bān; erhua stays attached: nǎr). Hover a blue character for a card with its pinyin (as read in that word) and meaning; click it to open its graph. Characters without a graph (影 in 电影) show their meaning too. Switches at the bottom left hide or show the **Pinyin** and **Meaning** (`P`, `M`). **All words** shows the whole family; **One by one** reveals the words one at a time (`→` next word, `←` back; past the last word `→` moves on to the next graph, `Enter` plays the current word). Beside the graph (under it on windows narrower than 1160px): a one-line note on what the family has in common, whether the hub is a word on its own, light tones (晚上 wǎnshang) and the tone changes of 一 and 不, and every connected graph. In *All words* mode `←` `→` move between graphs; `S` switches mode, `R` replays. |
| **Quiz 练** (`#/vocab/quiz`) | Ten questions, a new mix each round: six graphs with the shared character blanked out (pick it from four; distractors that would also make every shown word are excluded) and four asking the meaning of one word, with the other words of the family as the wrong answers. |

Marker: 新 = new in HSK 2 (the sheet's “New HSK2” tag), not in HSK 1.

The sheet is cleaned on the way in, never edited: typos and unhelpful glosses are replaced (“coutry”, “prettty”, 名 “a/an”, 岁 “year (of crop harvests)” …),
上去 gets its correct tone (shàngqù, not shǎngqù), erhua is written as -r (哪儿 nǎr), and the tone changes of 一 and 不 are marked (yíxià, búyào).
All corrections are listed in `tools/build_vocab.py`.

## Grammar 语法

From the textbook's “小语讲堂 Xiaoyu's Classroom” pages, so far lessons 1 and 2: 吧 for a guess, 是……的, pivot sentences with 请 · 让 · 叫, 还是……吧, 多 for approximate numbers, and an action that describes a noun (……的 + noun).

| Page | What it does |
|---|---|
| **Lessons 学** (`#/grammar`) | A hero that plays every pattern's animation in turn, then each lesson's patterns as cards with the formula and a textbook example. |
| **Lesson** (`#/grammar/N`, or `#/grammar/N/K` to open pattern K) | One pattern at a time (tabs, or `←` `→`). The formula in coloured chips, an animation whose numbered steps light up as it plays (a certainty meter for 吗 vs. 吧, the 是……的 frame spotlighting when / how / with whom and locking 是 after 不, the two arcs of a pivot, two options and the winner flying between 还是 and 吧, number lines for 二十多 and 五块多, Chinese vs. English word order with crossing lines), then the rule, a note, and the textbook's three examples with pinyin, English and audio. Then a **six-question quiz** built from the textbook's “complete the dialogues” exercises: fill the gap, pick the right sentence, or tap the pieces in order. |
| **Review 练** (`#/grammar/review`) | Ten questions covering every pattern, a new mix every round. |

## Expressions 词组

From the textbook's “学一学 Learn the new expressions” pages (lessons 1–5 and 7–15; lesson 6 has none).
Every new expression keeps one piece of two words the learner already knows: 茶 + 杯子 → 茶杯.

| Page | What it does |
| --- | --- |
| **Lessons 学** (`#/expressions`) | An animated word builder, **four rules** (the last character is the boss, 子 falls off, same word / different piece, light tones come back), the **seven word patterns** (kind + thing, place, people, do + what, pairs, where, helper words) with every expression sorted into them, and the lesson grid with your best scores. |
| **Lesson** (`#/expressions/N`) | One expression at a time (tabs 1 → 2 → 3 → Quiz, or `←` `→`). Five numbered steps light up with the animation: you know word A, you also know word B, keep one piece of each, join them, use it in a sentence. The kept piece of each source word lights up, the rest falls away, threads draw down, and the characters fly into the new word, which then shows its pinyin (with tone changes like 衣服 yīfu → 运动服 yùndòngfú), a literal gloss, the meaning and its pattern. **Write** draws the word stroke by stroke. The last step is an example sentence with pinyin and English. Then come **three questions**: build a word from the lesson's source words, pick a meaning (with deliberate traps such as 门后 vs. 后门), and fill a gap in a sentence. |
| **Review 练** (`#/expressions/review`) | Ten questions drawn from all lessons, a new mix every round. |

Quiz keys: `1`–`4` answer, `Enter` next, `Backspace` takes back the last character when building.

## Radicals 偏旁 (Writing Part 1)

An interactive course for the **HSK 2 Exam Writing Section, Part 1** (书写 第一部分 · 根据部件组字):
"form a character from the given components", from the textbook's radical lessons (30 radicals, 15 lessons) and 15 practice exam sets.

| Page | What it does |
| --- | --- |
| **Radicals home** (`#/radicals`) | Characters assembling from their radical and sound component, an animated walkthrough of how Part I works (read → match → eliminate), and radicals grouped by position. |
| **Course 课** | Nine short lessons on how radicals work, each with an interactive visual and a quick check: <ol><li>Characters are built from pieces (meaning part vs. sound part)</li><li>Pictographs morphing from picture to ancient form to modern character</li><li>Pointers (本 末 上 下 刃) and picture puzzles (明 休 好 看 家 林 笔 名)</li><li>Meaning + sound, with the 说文解字 breakdown and the 青 / 包 sound families</li><li>How full forms squeeze into radicals (手 → 扌, 水 → 氵 …)</li><li>A decoder for radical names (旁 / 头 / 底 / 框)</li><li>Meaning families</li><li>False friends (次, 很, 样, 那, 问, 都)</li><li>A live exam question</li></ol> |
| **Learn 学** | All 30 radicals in one grid in textbook order, each card labelled with its level and lesson (HSK 2 · Lesson 1 第一课), with filters by position. Each radical page has a stroke-order player with step controls and stroke names, and a **memory card** next to it: an illustration of the real thing that draws itself, the memory hook, and what the radical means. Below that, an **Origin** strip plays picture → full character → radical → in a word, followed by the story and an honest rating of how each example relates to the radical (meaning link · loose link · sound part · just a shape). The page also covers examples, a family of related characters (each with pinyin and meaning), and handwriting practice. |
| **Compare 辨** | Lookalikes side by side with the distinguishing strokes pulsing: 冫/氵, 亻/彳, left/right 阝, 广/疒, 日/目/月, 扌/土/木/王, 艹/⺮, 饣/钅/讠. |
| **Exam sets 练** | All 15 practice sets of the HSK Exam Writing Section, Part 1, rebuilt to be interactive and sized to fit on one screen. Click or drag a component into the gap. *Learn mode* gives instant feedback, with hints and explanations (radical + rest = character, plus sound hints) in a side panel. *Exam mode* lets you answer all three, then grades them. |
| **Challenge 测** | Shuffled drills (complete the character / spot the radical / name the radical) drawn from the 45 exam questions and 59 textbook examples, with an optional weak-radical focus and a mastery map. |

Keyboard: `1` `2` `3` choose a question, `A`–`D` answer, `Enter` submits or moves on. On a radical page, `←` `→` step through strokes and `Space` plays or pauses.

Progress is saved in your browser (`localStorage`). Use **Reset progress** in the footer to start over.

**Exam tip:** in every set, A, B and C are each the answer exactly once, and D (十) only belongs to the example 什么.

## How it's built

Plain HTML, CSS and JavaScript with no build step.

- `assets/js/ink.js` is the SVG brush-stroke renderer. It can draw any subset of a character's strokes, re-centre a radical, and animate strokes with a moving brush tip.
- `assets/js/exam.js` has the shared exam UI: option tiles, 田字格 word tiles with the gap, the flight animation and drag-and-drop.
- `assets/js/data/vocab.js` holds the cleaned word list and the graphs, **generated** by `tools/build_vocab.py` from the Excel file. The script also holds the editorial data: gloss fixes, the meaning of hubs that aren't words on their own (and of each reading of 觉, 好, 儿), and the one-line note for every graph. The hover-card meaning of characters that aren't words or hubs comes from Make Me a Hanzi's `dictionary.txt` (a few odd ones are overridden in `CHAR_FIX`). `assets/js/vocab.js` lays out and draws the graphs (arrows are an SVG overlay measured from the laid-out words); `assets/js/views/vocab.js` has the overview, graph and quiz pages.
- `assets/js/data/sections.js` lists the five parts (landing page and top-bar links). `assets/js/views/hub.js` is the landing page.
- `assets/js/data/grammar.js` holds the grammar points: formula, rule, steps, examples (as `汉字|pīnyīn|role` tokens) and quiz items. `assets/js/grammar.js` has the sentence chips, the six animations and the two question types (it reuses the expressions quiz shell); `assets/js/views/grammar.js` has the overview, lesson and review pages. Add a lesson by appending to `LESSONS`; a new kind of pattern also needs a visual in `VIS`.
- `assets/js/data/expressions.js` holds the 42 expressions: per-character pinyin, which piece of each source word is kept, the gloss, the pattern, an example sentence, and each lesson's three questions. `assets/js/expr.js` has the builder animation and the quiz; `assets/js/views/expressions.js` has the overview, lesson and review pages.
- `assets/js/data/content.js` holds the radicals and exam sets. Edit it to fix or extend explanations.
- `assets/js/data/origins.js` holds each radical's story, meaning, memory hook, example-relation ratings, and two hand-drawn SVGs: the real-world picture and a stylised ancient form. The ancient forms are only used in course lesson 2, and they're approximations inspired by oracle-bone and bronze scripts, not facsimiles. `assets/js/art.js` draws them line by line.
- `assets/js/data/course.js` holds the course lessons. `assets/js/views/course.js` contains their visualisations.
- `assets/js/data/hanzi-data.js` is the stroke data, **generated** by `tools/build_data.mjs` (it includes every graph hub). The script also verifies that every highlighted or missing stroke range matches the radical's real components.
- `assets/font/wing-pinyin-grammar.woff2` is a subset of `WingSansPutonghuaPinyin.woff2` (the full font draws pinyin above every character) with only the characters in the grammar data. Rebuild it after adding grammar text: `pyftsubset WingSansPutonghuaPinyin.woff2 --text-file=chars.txt --layout-features='*' --flavor=woff2 --output-file=wing-pinyin-grammar.woff2`.
- `assets/css/fonts.css` is a subset of the LXGW WenKai font, **generated** by `tools/subset_font.py`. Re-run it after adding new Chinese text.

```sh
python3 site/tools/build_vocab.py --mmah /path/to/makemeahanzi   # needs openpyxl; reads exam-materials/vocab/HSK-2.xls
node site/tools/build_data.mjs /path/to/makemeahanzi          # needs graphics.txt + dictionary.txt
python3 site/tools/subset_font.py LXGWWenKai-Regular.ttf LXGWWenKai-Medium.ttf
```

## Credits

- Stroke outlines and medians, and the character meanings on the vocabulary hover cards: [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) (Arphic Public License / LGPL)
- Handwriting quiz: [Hanzi Writer](https://hanziwriter.org) (MIT), vendored in `assets/vendor/`
- Chinese font: [LXGW WenKai](https://github.com/lxgw/LxgwWenKai) (SIL OFL 1.1)
- Pinyin-on-top font for the grammar rules: [Wing Sans Putonghua Pinyin](https://github.com/Wing-Font/wing-sans-chinese) (SIL OFL 1.1)
