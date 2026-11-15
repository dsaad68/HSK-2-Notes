/* ==========================================================================
   The Radical Course — 9 short lessons on how radicals work
   ========================================================================== */
(function () {
  "use strict";

  const LESSONS = [
    {
      id: "pieces", zh: "偏旁", title: "Characters are built from pieces",
      body: [
        "Most Chinese characters aren't one single picture. They're assembled from smaller building blocks called <b class=\"han\">偏旁</b> (piānpáng), components.",
        "Usually one block hints at the <b>meaning</b> and another hints at the <b>sound</b>. The meaning block is what people call the <em>radical</em>, and the 30 you study for HSK 2 are all meaning blocks.",
        "Dictionaries file every character under one <b class=\"han\">部首</b> (bùshǒu), its “section header”, which is usually that same meaning radical."
      ],
      takeaway: "Character = meaning part (the radical) + another part, which is often a sound hint.",
      check: { q: "In 妈 (mā, mom), which part gives the meaning?", opts: [{ t: "女", ok: true }, { t: "马" }], why: "女 = woman, so mom. 马 mǎ only gives the sound." }
    },
    {
      id: "pictures", zh: "象形", title: "Pictures that became characters",
      body: [
        "The oldest characters were drawings, carved into ox bones and turtle shells more than 3,000 years ago (<b class=\"han\">甲骨文</b>, oracle-bone script).",
        "Centuries of brush writing straightened the curves into strokes, but the pictures are still there. These <b>pictographs</b> (<b class=\"han\">象形</b>) are the roots of many radicals."
      ],
      takeaway: "Many radicals are pictures: 木 tree, 日 sun, 口 mouth, 目 eye, 女 woman, 火 fire, 水 water, 心 heart.",
      fact: "目 used to lie on its side, like a real eye. It was stood upright to fit narrow strips of bamboo.",
      check: { q: "目 started life as a picture of…", opts: [{ t: "an eye", ok: true }, { t: "a window" }, { t: "a ladder" }, { t: "a box" }], why: "An eye, drawn sideways at first and later turned upright." }
    },
    {
      id: "combine", zh: "指事 · 会意", title: "Pointers and picture puzzles",
      body: [
        "Pictures only get you so far. How do you write “root”, or “rest”?",
        "<b>Pointers</b> (<b class=\"han\">指事</b>): add a mark to a picture. A line at the bottom of a tree 木 points to its root: 本.",
        "<b>Picture puzzles</b> (<b class=\"han\">会意</b>): put two pictures together and read the scene. A person 亻 + a tree 木 = 休, a person leaning against a tree, which means <em>to rest</em>."
      ],
      takeaway: "Two meaning parts can combine into a new idea: 明 = sun + moon = bright.",
      check: { q: "休 (to rest) is 亻 + 木. What scene does it show?", opts: [{ t: "a person leaning against a tree", ok: true }, { t: "a person chopping wood" }, { t: "a tree shaped like a person" }], why: "Resting in the shade of a tree: 亻 (person) + 木 (tree)." }
    },
    {
      id: "sound", zh: "形声", title: "Meaning + sound: the big one",
      body: [
        "The most productive trick of all is <b>meaning + sound</b> (<b class=\"han\">形声</b>). One part says <em>what it's about</em>, and the other says roughly <em>how it sounds</em>.",
        "In the oldest Chinese dictionary, the <b class=\"han\">说文解字</b> (about AD 100), 7,697 of its 9,353 characters are built this way: about 82%.",
        "Keep the sound part and swap the radical, and you get a family of characters that sound alike but mean different things."
      ],
      takeaway: "Same sound part + a different radical = a different meaning. In the exam, the radical is the part that decides the meaning.",
      check: { q: "Which radical turns 青 into 晴, “sunny”?", glyphs: true, opts: [{ t: "sun", ok: true }, { t: "water" }, { t: "eye" }, { t: "speech" }], why: "日 (sun) + 青 qīng = 晴 qíng, sunny." }
    },
    {
      id: "shapes", zh: "变形", title: "Radicals change shape",
      body: [
        "When a character becomes a radical, it has to squeeze into part of a square, so it changes shape.",
        "Strokes get shorter, the last stroke often rises (<b class=\"han\">提</b>) to point at its neighbour, and some forms change completely: 水 becomes three dots, 心 stands up, and 言 shrinks to 讠."
      ],
      takeaway: "Learn both forms of each pair: 手 ↔ 扌, 水 ↔ 氵, 心 ↔ 忄, 人 ↔ 亻, 火 ↔ 灬.",
      check: { q: "扌 is the squeezed form of which character?", opts: [{ t: "手", ok: true }, { t: "才" }, { t: "木" }, { t: "土" }], why: "手 (hand) becomes 扌 on the left side: 提手旁." }
    },
    {
      id: "names", zh: "名称", title: "Decoding radical names",
      body: [
        "Every radical has a Chinese name, and the names follow patterns. Once you see the pattern, you can decode any name.",
        "The <b>last syllable says where it sits</b>: <b class=\"han\">旁</b> side · <b class=\"han\">头</b> top · <b class=\"han\">底</b> bottom · <b class=\"han\">框</b> frame.",
        "The first part says <b>what it is</b>: either the full character (<span class=\"han\">木字旁</span>, “the 木 character, as a side”) or a description (<span class=\"han\">三点水</span>, “three dots of water”; <span class=\"han\">竖心旁</span>, “upright heart, as a side”)."
      ],
      takeaway: "X字旁 = “character X, on the side”. 头 = top, 底 = bottom, 框 = frame.",
      check: { q: "Where does a …字底 radical sit?", opts: [{ t: "at the bottom", ok: true }, { t: "on top" }, { t: "on the left" }, { t: "around the outside" }], why: "底 means bottom: 火字底 (灬) sits under 点 and 热." }
    },
    {
      id: "families", zh: "义类", title: "Meaning families",
      body: [
        "The 30 radicals fall into a handful of themes. When you meet a word, first ask: is it about the body? Nature? A place? An action?",
        "Then pick the radical from that family. Hover a radical to see what it covers."
      ],
      takeaway: "Think theme first, then radical.",
      check: { q: "A word about illness, like 疼 téng (ache), will most likely contain…", glyphs: true, opts: [{ t: "sickness", ok: true }, { t: "shelter" }, { t: "roof" }, { t: "ice" }], why: "疒 (病字头) covers illness and pain: 病, 疼." }
    },
    {
      id: "traps", zh: "陷阱", title: "When the radical lies",
      body: [
        "Radicals are clues, not rules. Writing changed over 3,000 years, and some characters drifted far from their radical.",
        "Sometimes the “radical” is really the sound part, and sometimes it is just a shape that happens to look the same. In those cases, learn the word as a whole."
      ],
      takeaway: "If the meaning doesn't fit, don't force it. Learn 两次, 很好 and 怎么样 as whole words.",
      check: { q: "In 问 (wèn, to ask), what job does 门 do?", opts: [{ t: "it gives the sound (mén → wèn)", ok: true }, { t: "it means “door”" }, { t: "it means “mouth”" }], why: "The meaning comes from 口 (mouth), and 门 mén only hints at the sound." }
    },
    {
      id: "exam", zh: "考试", title: "Using radicals in the exam",
      body: [
        "In <b class=\"han\">第25–27题</b> you see three words, each with one character missing a piece, and four components A–D.",
        "<b>1.</b> Read the pinyin and recognise the word. <b>2.</b> Ask what the missing character is about. <b>3.</b> Pick the radical with that meaning. <b>4.</b> Eliminate: A, B and C are each used exactly once, and D (十) belongs to the example."
      ],
      takeaway: "Pinyin → word → meaning → radical → eliminate."
    }
  ];

  // Lesson 2: pictographs (art ids from origins.js)
  const PICTOGRAPHS = [
    { ch: "日", art: "sun", en: "sun" }, { ch: "月", art: "moon", en: "moon" }, { ch: "木", art: "tree", en: "tree" },
    { ch: "人", art: "person", en: "person" }, { ch: "口", art: "mouth", en: "mouth" }, { ch: "目", art: "eye", en: "eye" },
    { ch: "女", art: "woman", en: "woman" }, { ch: "火", art: "fire", en: "fire" }, { ch: "水", art: "water", en: "water" },
    { ch: "心", art: "heart", en: "heart" }, { ch: "手", art: "hand", en: "hand" }, { ch: "门", art: "door", en: "door" }
  ];

  // Lesson 3a: pointers — mark = stroke indices of the pointing mark
  const POINTERS = [
    { ch: "本", base: "木", mark: [4], py: "běn", en: "root, origin", note: "a mark at the root of the tree" },
    { ch: "末", base: "木", mark: [0], py: "mò", en: "tip, end", note: "a mark at the top of the tree" },
    { ch: "上", mark: [0, 1], py: "shàng", en: "up, above", note: "a mark above a line" },
    { ch: "下", mark: [1, 2], py: "xià", en: "down, below", note: "a mark below a line" },
    { ch: "刃", base: "刀", mark: [2], py: "rèn", en: "blade edge", note: "a dot on the edge of a knife 刀" }
  ];

  // Lesson 3b: picture puzzles — parts in order of the top-level split
  const PUZZLES = [
    { ch: "明", py: "míng", en: "bright", parts: [{ t: "日", art: "sun", en: "sun" }, { t: "月", art: "moon", en: "moon" }], note: "The sun and the moon together: bright." },
    { ch: "休", py: "xiū", en: "to rest", parts: [{ t: "亻", art: "person", en: "person" }, { t: "木", art: "tree", en: "tree" }], note: "A person leaning against a tree." },
    { ch: "好", py: "hǎo", en: "good", parts: [{ t: "女", art: "woman", en: "woman" }, { t: "子", en: "child" }], note: "A mother with her child: good." },
    { ch: "看", py: "kàn", en: "to look", parts: [{ t: "手", art: "hand", en: "hand" }, { t: "目", art: "eye", en: "eye" }], note: "A hand above the eye, shading it to look far." },
    { ch: "家", py: "jiā", en: "home", parts: [{ t: "宀", art: "roof", en: "roof" }, { t: "豕", en: "pig" }], note: "A pig under a roof: a household." },
    { ch: "林", py: "lín", en: "woods", parts: [{ t: "木", art: "tree", en: "tree" }, { t: "木", art: "tree", en: "tree" }], note: "Two trees make a wood. Three make 森, a forest." },
    { ch: "笔", py: "bǐ", en: "brush, pen", parts: [{ t: "⺮", art: "bamboo", en: "bamboo" }, { t: "毛", en: "hair" }], note: "A bamboo handle with hair at the tip." },
    { ch: "名", py: "míng", en: "name", parts: [{ t: "夕", art: "evening", en: "evening" }, { t: "口", art: "mouth", en: "mouth" }], note: "In the dark you call out your name." }
  ];

  // Lesson 4: sound families
  const FAMILIES = [
    { sound: "青", py: "qīng", en: "green-blue", members: [
      { ch: "清", rad: "water", py: "qīng", en: "clear (water)" },
      { ch: "晴", rad: "sun", py: "qíng", en: "sunny" },
      { ch: "睛", rad: "eye", py: "jīng", en: "eyeball" },
      { ch: "请", rad: "speech", py: "qǐng", en: "please; to invite" },
      { ch: "情", rad: "heart", py: "qíng", en: "feeling" }
    ] },
    { sound: "包", py: "bāo", en: "to wrap", members: [
      { ch: "抱", rad: "hand", py: "bào", en: "to hug" },
      { ch: "跑", rad: "foot", py: "pǎo", en: "to run" },
      { ch: "饱", rad: "food", py: "bǎo", en: "full (after eating)" },
      { ch: "泡", rad: "water", py: "pào", en: "bubble; to soak" },
      { ch: "炮", rad: "fire", py: "pào", en: "firecracker; cannon" }
    ] }
  ];
  // 说文解字 counts (Xu Shen's own classification)
  const SHUOWEN = [
    { k: "形声", en: "meaning + sound", n: 7697 },
    { k: "会意", en: "picture puzzles", n: 1167 },
    { k: "象形", en: "pictures", n: 364 },
    { k: "指事", en: "pointers", n: 125 }
  ];

  // Lesson 5: full form → radical form. zone = where the radical ends up.
  const SHAPES = [
    { full: "手", comp: "hand", zone: "left" }, { full: "水", comp: "water", zone: "left" }, { full: "心", comp: "heart", zone: "left" },
    { full: "人", comp: "person", zone: "left" }, { full: "火", comp: "fire", zone: "bottom" }, { full: "言", comp: "speech", zone: "left" },
    { full: "食", comp: "food", zone: "left" }, { full: "金", comp: "metal", zone: "left" }, { full: "糸", comp: "silk", zone: "left" },
    { full: "足", comp: "foot", zone: "left" }, { full: "艸", comp: "grass", zone: "top" }, { full: "竹", comp: "bamboo", zone: "top" },
    { full: "刀", comp: "knife", zone: "right" }, { full: "衣", comp: "clothes", zone: "left" }, { full: "玉", comp: "jade", zone: "left" },
    { full: "阜", comp: "hill", zone: "left" }, { full: "邑", comp: "city", zone: "right" }, { full: "攴", comp: "tap", zone: "right" }
  ];

  // Lesson 6: name decoder — syllable glosses
  const NAME_PARTS = {
    "提": "rising stroke (提)", "手": "hand", "旁": "side", "两": "two", "点": "dots", "水": "water", "门": "door", "字": "the character",
    "框": "frame", "走": "walk", "之": "之-shaped", "三": "three", "宝": "treasure (宝)", "盖": "lid", "头": "top", "绞": "twisted",
    "丝": "silk", "土": "earth", "草": "grass", "广": "shelter", "竹": "bamboo", "竖": "upright", "心": "heart", "足": "foot",
    "双": "double", "人": "person", "食": "food", "火": "fire", "底": "bottom", "木": "tree", "口": "mouth", "言": "speech",
    "日": "sun", "单": "single", "病": "illness (病)", "金": "metal", "左": "left", "耳": "ear-shaped", "右": "right",
    "反": "reversed", "文": "文", "目": "eye", "立": "stand", "女": "woman", "月": "moon"
  };
  const POS_WORDS = { "旁": "side", "头": "top", "底": "bottom", "框": "frame" };

  // Lesson 7: meaning families
  const THEMES = [
    { id: "body", zh: "身体与人", en: "Body & people", art: "person", ids: ["person", "woman", "hand", "foot", "eye", "mouth", "heart", "moon"] },
    { id: "nature", zh: "自然", en: "Nature & elements", art: "sun", ids: ["water", "ice", "fire", "sun", "earth", "hill"] },
    { id: "plants", zh: "植物与材料", en: "Plants & materials", art: "bamboo", ids: ["grass", "bamboo", "tree", "silk", "metal"] },
    { id: "places", zh: "房屋与地方", en: "Buildings & places", art: "roof", ids: ["roof", "shelter", "door", "city"] },
    { id: "action", zh: "动作", en: "Movement & action", art: "walk", ids: ["walk", "step", "tap", "stand", "speech"] },
    { id: "life", zh: "生活", en: "Daily life", art: "food", ids: ["food", "sickness"] }
  ];

  // Lesson 8: false friends. comp = radical id, ch must be an example in content.js
  const TRAPS = [
    { ch: "次", comp: "ice", kind: "Just a shape", note: "Not ice: these two strokes were once 二 (two), meaning 'second, next'." },
    { ch: "很", comp: "step", kind: "Meaning drifted", note: "Not walking: it once meant 'defiant', and today it's a grammar word meaning 'very'." },
    { ch: "样", comp: "tree", kind: "Meaning drifted", note: "Not a tree today: it means 'kind, appearance' (怎么样)." },
    { ch: "那", comp: "city", kind: "Meaning drifted", note: "Once a place name, and now just 'that'." },
    { ch: "问", comp: "door", kind: "Sound, not meaning", note: "门 mén gives the sound. The meaning is in 口 (mouth)." },
    { ch: "都", comp: "city", kind: "Borrowed reading", note: "dū means capital city, which fits! The everyday dōu ('all') simply borrowed the character." }
  ];

  window.HSK_COURSE = { LESSONS, PICTOGRAPHS, POINTERS, PUZZLES, FAMILIES, SHUOWEN, SHAPES, NAME_PARTS, POS_WORDS, THEMES, TRAPS };
})();
