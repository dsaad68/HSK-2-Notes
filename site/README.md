# 偏旁 Radicals — HSK 2 Writing, Part I

An interactive study site for the **HSK 2 (3.0) Exam Writing Section, Part 1** (书写 第一部分 · 根据部件组字):
"form a character from the given components". It is built from the materials in
the textbook's radical lessons (30 radicals, 15 lessons) and 15 practice exam sets.
The source scans live in `exam-materials/`, which is git-ignored and stays on your machine only.

## Open it

Double-click `index.html`. Everything works offline except the two Latin web fonts
(Fraunces, Inter), which fall back to system fonts.

Or serve it locally:

```sh
cd site && python3 -m http.server 8765
# → http://127.0.0.1:8765
```

## What's inside

| Page | What it does |
| --- | --- |
| **Home** | Characters assembling from their radical and sound component, an animated walkthrough of how Part I works (read → match → eliminate), and radicals grouped by position. |
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
- `assets/js/data/content.js` holds the radicals and exam sets. Edit it to fix or extend explanations.
- `assets/js/data/origins.js` holds each radical's story, meaning, memory hook, example-relation ratings, and two hand-drawn SVGs: the real-world picture and a stylised ancient form. The ancient forms are only used in course lesson 2, and they're approximations inspired by oracle-bone and bronze scripts, not facsimiles. `assets/js/art.js` draws them line by line.
- `assets/js/data/course.js` holds the course lessons. `assets/js/views/course.js` contains their visualisations.
- `assets/js/data/hanzi-data.js` is the stroke data, **generated** by `tools/build_data.mjs`. The script also verifies that every highlighted or missing stroke range matches the radical's real components.
- `assets/css/fonts.css` is a subset of the LXGW WenKai font, **generated** by `tools/subset_font.py`. Re-run it after adding new Chinese text.

```sh
node site/tools/build_data.mjs /path/to/makemeahanzi          # needs graphics.txt + dictionary.txt
python3 site/tools/subset_font.py LXGWWenKai-Regular.ttf LXGWWenKai-Medium.ttf
```

## Credits

- Stroke outlines and medians: [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) (Arphic Public License / LGPL)
- Handwriting quiz: [Hanzi Writer](https://hanziwriter.org) (MIT), vendored in `assets/vendor/`
- Chinese font: [LXGW WenKai](https://github.com/lxgw/LxgwWenKai) (SIL OFL 1.1)
