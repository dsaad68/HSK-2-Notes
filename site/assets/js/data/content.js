/* ==========================================================================
   HSK 2 · Writing Part I — course content
   Transcribed from exam-materials/writings/radicals (30 radicals, 15 lessons)
   and exam-materials/writings/questions (15 sets of Q25–27).
   ========================================================================== */
(function () {
  "use strict";

  // Stroke names: Chinese → [pinyin, English]
  const STROKES = {
    "点": ["diǎn", "dot"],
    "横": ["héng", "horizontal"],
    "竖": ["shù", "vertical"],
    "撇": ["piě", "left-falling"],
    "捺": ["nà", "right-falling"],
    "提": ["tí", "rising"],
    "竖钩": ["shùgōu", "vertical hook"],
    "横折": ["héngzhé", "horizontal turn"],
    "横折钩": ["héngzhégōu", "horizontal turn hook"],
    "横钩": ["hénggōu", "horizontal hook"],
    "横撇": ["héngpiě", "horizontal + left-falling"],
    "撇折": ["piězhé", "left-falling turn"],
    "撇点": ["piědiǎn", "left-falling dot"],
    "竖提": ["shùtí", "vertical rising"],
    "竖撇": ["shùpiě", "vertical left-falling"],
    "横折提": ["héngzhétí", "horizontal turn rising"],
    "横折折撇": ["héngzhézhépiě", "horizontal double-turn falling"],
    "平捺": ["píngnà", "flat right-falling"],
    "横撇弯钩": ["héngpiěwāngōu", "horizontal–falling–curved hook"]
  };

  // Position of a component inside a character
  const POSITIONS = {
    "left":    { zh: "左", label: "Left side", term: "旁 páng", desc: "Sits on the left; written first." },
    "right":   { zh: "右", label: "Right side", term: "旁 páng", desc: "Sits on the right; written after the left part." },
    "top":     { zh: "上", label: "Top", term: "头 tóu", desc: "Sits on top; written first." },
    "bottom":  { zh: "下", label: "Bottom", term: "底 dǐ", desc: "Sits at the bottom; written last." },
    "frame":   { zh: "框", label: "Frame", term: "框 kuàng", desc: "Wraps the top and both sides; written first." },
    "wrap-tl": { zh: "厂", label: "Top-left wrap", term: "头 tóu", desc: "Covers the top and left; written first." },
    "wrap-bl": { zh: "辶", label: "Bottom-left wrap", term: "旁 páng", desc: "Wraps the bottom-left; written LAST." }
  };

  /* ------------------------------------------------------------------------
     Radicals — in the textbook's lesson order (2 per lesson).
     src:  [character, stroke indices] used to draw the radical in its real,
           in-character shape (e.g. 土 with a rising last stroke).
     examples[].idx: stroke indices of the radical inside the example.
     ---------------------------------------------------------------------- */
  const RADICALS = [
    // Lesson 1
    { id: "hand", lesson: 1, glyph: "扌", name: "提手旁", py: "tíshǒupáng", en: "raised hand",
      from: { ch: "手", py: "shǒu", en: "hand" }, pos: "left", src: ["打", [0, 1, 2]],
      strokes: ["横", "竖钩", "提"],
      meaning: "Actions you do with your hands: hitting, catching, holding, finding.",
      tip: "Only 扌 has a hook at the foot of its vertical. 提土旁 (土) has no hook, and 木字旁 (木) ends with 撇 + 点.",
      examples: [
        { ch: "打", py: "dǎ", en: "to hit; to make (a call)", word: "打电话", wpy: ["dǎ", "diàn", "huà"], t: 0, wen: "to make a phone call", idx: [0, 1, 2] },
        { ch: "接", py: "jiē", en: "to receive; to pick up", word: "接电话", wpy: ["jiē", "diàn", "huà"], t: 0, wen: "to answer the phone", idx: [0, 1, 2] }
      ],
      family: "打接找把拿报" },

    { id: "ice", lesson: 1, glyph: "冫", name: "两点水", py: "liǎngdiǎnshuǐ", en: "two-dot water",
      from: { ch: "冰", py: "bīng", en: "ice" }, pos: "left", src: ["冷", [0, 1]],
      strokes: ["点", "提"],
      meaning: "Cold and ice: water with one drop missing, because it froze.",
      tip: "Count the dots. Two dots is ice (冫), three dots is water (氵).",
      examples: [
        { ch: "冷", py: "lěng", en: "cold", word: "很冷", wpy: ["hěn", "lěng"], t: 1, wen: "very cold", idx: [0, 1] },
        { ch: "次", py: "cì", en: "time (occurrence)", word: "两次", wpy: ["liǎng", "cì"], t: 1, wen: "twice", idx: [0, 1] }
      ],
      family: "冷次准冰决" },

    // Lesson 2
    { id: "door", lesson: 2, glyph: "门", name: "门字框", py: "ménzìkuàng", en: "door frame",
      from: { ch: "门", py: "mén", en: "door" }, pos: "frame", src: ["间", [0, 1, 2]],
      strokes: ["点", "竖", "横折钩"],
      meaning: "Doors and gates: something sits inside the frame.",
      tip: "Write the frame first (dot, vertical, then the big 横折钩), then the inside.",
      examples: [
        { ch: "间", py: "jiān", en: "room; between", word: "房间", wpy: ["fáng", "jiān"], t: 1, wen: "room", idx: [0, 1, 2] },
        { ch: "问", py: "wèn", en: "to ask", word: "问题", wpy: ["wèn", "tí"], t: 0, wen: "question", idx: [0, 1, 2] }
      ],
      family: "间问闻闭" },

    { id: "walk", lesson: 2, glyph: "辶", name: "走之旁", py: "zǒuzhīpáng", en: "walking 之",
      from: { ch: "辵", py: "chuò", en: "to walk" }, pos: "wrap-bl", src: ["过", [3, 4, 5]],
      strokes: ["点", "横折折撇", "平捺"],
      meaning: "Movement, roads and distance: going, passing, entering, being far or near.",
      tip: "辶 is written LAST. Finish the inside first (寸 in 过, 元 in 远), then sweep 辶 underneath.",
      examples: [
        { ch: "过", py: "guò", en: "to pass; to spend (a day)", word: "过生日", wpy: ["guò", "shēng", "rì"], t: 0, wen: "to celebrate a birthday", idx: [3, 4, 5] },
        { ch: "远", py: "yuǎn", en: "far", word: "很远", wpy: ["hěn", "yuǎn"], t: 1, wen: "very far", idx: [4, 5, 6] }
      ],
      family: "过远这还送进边道近" },

    // Lesson 3
    { id: "water", lesson: 3, glyph: "氵", name: "三点水", py: "sāndiǎnshuǐ", en: "three-dot water",
      from: { ch: "水", py: "shuǐ", en: "water" }, pos: "left", src: ["汉", [0, 1, 2]],
      strokes: ["点", "点", "提"],
      meaning: "Water and liquids: rivers, seas, washing, swimming, wine.",
      tip: "Two dots, then a rising 提, three strokes in all. With one dot fewer it becomes ice (冫).",
      examples: [
        { ch: "汉", py: "hàn", en: "Han (Chinese)", word: "汉字", wpy: ["hàn", "zì"], t: 0, wen: "Chinese character", idx: [0, 1, 2] },
        { ch: "洗", py: "xǐ", en: "to wash", word: "洗手", wpy: ["xǐ", "shǒu"], t: 0, wen: "to wash hands", idx: [0, 1, 2] }
      ],
      family: "汉洗没河海游泳酒" },

    { id: "roof", lesson: 3, glyph: "宀", name: "宝盖头", py: "bǎogàitóu", en: "treasure lid",
      from: { ch: "宀", py: "mián", en: "roof" }, pos: "top", src: ["家", [0, 1, 2]],
      strokes: ["点", "点", "横钩"],
      meaning: "A roof over a house: homes, rooms, and things kept safe inside.",
      tip: "The dot on top makes it a roof (宀). Without the dot it is 冖.",
      examples: [
        { ch: "家", py: "jiā", en: "home; family", word: "回家", wpy: ["huí", "jiā"], t: 1, wen: "to go home", idx: [0, 1, 2] },
        { ch: "完", py: "wán", en: "to finish", word: "写完", wpy: ["xiě", "wán"], t: 1, wen: "to finish writing", idx: [0, 1, 2] }
      ],
      family: "家完字室安客" },

    // Lesson 4
    { id: "silk", lesson: 4, glyph: "纟", name: "绞丝旁", py: "jiǎosīpáng", en: "twisted silk",
      from: { ch: "丝", py: "sī", en: "silk thread" }, pos: "left", src: ["红", [0, 1, 2]],
      strokes: ["撇折", "撇折", "提"],
      meaning: "Silk and thread: textiles, tying, and colours (silk was dyed red and green).",
      tip: "Two zig-zags (撇折), then a rising 提: three strokes.",
      examples: [
        { ch: "红", py: "hóng", en: "red", word: "红色", wpy: ["hóng", "sè"], t: 0, wen: "red (colour)", idx: [0, 1, 2] },
        { ch: "绿", py: "lǜ", en: "green", word: "绿色", wpy: ["lǜ", "sè"], t: 0, wen: "green (colour)", idx: [0, 1, 2] }
      ],
      family: "红绿给经结级" },

    { id: "earth", lesson: 4, glyph: "土", name: "提土旁", py: "títǔpáng", en: "raised earth",
      from: { ch: "土", py: "tǔ", en: "earth" }, pos: "left", src: ["场", [0, 1, 2]],
      strokes: ["横", "竖", "提"],
      meaning: "Earth and ground: fields, places, lumps of soil.",
      tip: "On the left side, the last 横 of 土 turns into a rising 提.",
      examples: [
        { ch: "场", py: "chǎng", en: "field; place", word: "机场", wpy: ["jī", "chǎng"], t: 1, wen: "airport", idx: [0, 1, 2] },
        { ch: "块", py: "kuài", en: "piece; yuan", word: "一块钱", wpy: ["yí", "kuài", "qián"], t: 1, wen: "one yuan", idx: [0, 1, 2] }
      ],
      family: "场块地城坏" },

    // Lesson 5
    { id: "grass", lesson: 5, glyph: "艹", name: "草字头", py: "cǎozìtóu", en: "grass top",
      from: { ch: "草", py: "cǎo", en: "grass" }, pos: "top", src: ["菜", [0, 1, 2]],
      strokes: ["横", "竖", "竖"],
      meaning: "Plants: grass, flowers, tea, vegetables, herbal medicine.",
      tip: "Only three strokes. Don't confuse it with 竹字头 ⺮, which has six.",
      examples: [
        { ch: "茶", py: "chá", en: "tea", word: "喝茶", wpy: ["hē", "chá"], t: 1, wen: "to drink tea", idx: [0, 1, 2] },
        { ch: "菜", py: "cài", en: "vegetable; dish", word: "做菜", wpy: ["zuò", "cài"], t: 1, wen: "to cook", idx: [0, 1, 2] }
      ],
      family: "茶菜花药节苹英" },

    { id: "shelter", lesson: 5, glyph: "广", name: "广字头", py: "guǎngzìtóu", en: "shelter top",
      from: { ch: "广", py: "guǎng", en: "shelter; broad" }, pos: "wrap-tl", src: ["店", [0, 1, 2]],
      strokes: ["点", "横", "撇"],
      meaning: "A building that is open on one side: shops, beds, halls.",
      tip: "Add a 点 and a 提 on the left and it becomes 疒 (sickness).",
      examples: [
        { ch: "店", py: "diàn", en: "shop", word: "商店", wpy: ["shāng", "diàn"], t: 1, wen: "shop, store", idx: [0, 1, 2] },
        { ch: "床", py: "chuáng", en: "bed", word: "起床", wpy: ["qǐ", "chuáng"], t: 1, wen: "to get up", idx: [0, 1, 2] }
      ],
      family: "店床应座度" },

    // Lesson 6
    { id: "bamboo", lesson: 6, glyph: "⺮", name: "竹字头", py: "zhúzìtóu", en: "bamboo top",
      from: { ch: "竹", py: "zhú", en: "bamboo" }, pos: "top", src: ["笔", [0, 1, 2, 3, 4, 5]],
      strokes: ["撇", "横", "点", "撇", "横", "点"],
      meaning: "Bamboo and things made from it: brushes, baskets, counting slips.",
      tip: "Two small halves of three strokes each: 撇 横 点, then 撇 横 点.",
      examples: [
        { ch: "笔", py: "bǐ", en: "pen", word: "铅笔", wpy: ["qiān", "bǐ"], t: 1, wen: "pencil", idx: [0, 1, 2, 3, 4, 5] },
        { ch: "第", py: "dì", en: "(ordinal prefix)", word: "第一", wpy: ["dì", "yī"], t: 0, wen: "first", idx: [0, 1, 2, 3, 4, 5] }
      ],
      family: "笔第等笑篮答" },

    { id: "heart", lesson: 6, glyph: "忄", name: "竖心旁", py: "shùxīnpáng", en: "upright heart",
      from: { ch: "心", py: "xīn", en: "heart" }, pos: "left", src: ["快", [0, 1, 2]],
      strokes: ["点", "点", "竖"],
      meaning: "Feelings and the mind: happy, busy, understanding, afraid.",
      tip: "Write the left dot, then the right dot, and the vertical last.",
      examples: [
        { ch: "快", py: "kuài", en: "fast; happy", word: "快乐", wpy: ["kuài", "lè"], t: 0, wen: "happy", idx: [0, 1, 2] },
        { ch: "忙", py: "máng", en: "busy", word: "很忙", wpy: ["hěn", "máng"], t: 1, wen: "very busy", idx: [0, 1, 2] }
      ],
      family: "快忙懂慢情怕" },

    // Lesson 7
    { id: "foot", lesson: 7, glyph: "𧾷", name: "足字旁", py: "zúzìpáng", en: "foot side",
      from: { ch: "足", py: "zú", en: "foot" }, pos: "left", src: ["跑", [0, 1, 2, 3, 4, 5, 6]],
      strokes: ["竖", "横折", "横", "竖", "横", "竖", "提"],
      meaning: "Feet and legs: running, kicking, jumping, roads.",
      tip: "This is 足 squeezed onto the left: seven strokes, and the last one rises (提).",
      examples: [
        { ch: "跑", py: "pǎo", en: "to run", word: "跑步", wpy: ["pǎo", "bù"], t: 0, wen: "to jog", idx: [0, 1, 2, 3, 4, 5, 6] },
        { ch: "踢", py: "tī", en: "to kick", word: "踢足球", wpy: ["tī", "zú", "qiú"], t: 0, wen: "to play football", idx: [0, 1, 2, 3, 4, 5, 6] }
      ],
      family: "跑踢路跳跟" },

    { id: "step", lesson: 7, glyph: "彳", name: "双人旁", py: "shuāngrénpáng", en: "double person",
      from: { ch: "行", py: "xíng", en: "to walk" }, pos: "left", src: ["很", [0, 1, 2]],
      strokes: ["撇", "撇", "竖"],
      meaning: "Walking and roads: 彳 is the left half of 行 (to walk).",
      tip: "Two 撇 makes 彳 (double person). One 撇 makes 亻 (single person).",
      examples: [
        { ch: "往", py: "wǎng", en: "toward", word: "往前走", wpy: ["wǎng", "qián", "zǒu"], t: 0, wen: "walk forward", idx: [0, 1, 2] },
        { ch: "很", py: "hěn", en: "very", word: "很好", wpy: ["hěn", "hǎo"], t: 0, wen: "very good", idx: [0, 1, 2] }
      ],
      family: "往很得行" },

    // Lesson 8
    { id: "food", lesson: 8, glyph: "饣", name: "食字旁", py: "shízìpáng", en: "food side",
      from: { ch: "食", py: "shí", en: "food" }, pos: "left", src: ["饭", [0, 1, 2]],
      strokes: ["撇", "横钩", "竖提"],
      meaning: "Food and eating: meals, dumplings, restaurants, being hungry or full.",
      tip: "Three strokes. Compare 钅 (metal, five strokes) and 讠 (speech, two strokes).",
      examples: [
        { ch: "饭", py: "fàn", en: "meal; cooked rice", word: "吃饭", wpy: ["chī", "fàn"], t: 1, wen: "to eat a meal", idx: [0, 1, 2] },
        { ch: "饺", py: "jiǎo", en: "dumpling", word: "饺子", wpy: ["jiǎo", "zi"], t: 0, wen: "dumplings", idx: [0, 1, 2] }
      ],
      family: "饭饺馆饿饱" },

    { id: "fire", lesson: 8, glyph: "灬", name: "火字底", py: "huǒzìdǐ", en: "fire bottom",
      from: { ch: "火", py: "huǒ", en: "fire" }, pos: "bottom", src: ["热", [6, 7, 8, 9]],
      strokes: ["点", "点", "点", "点"],
      meaning: "Fire and heat at the bottom of a character, like flames under a pot.",
      tip: "Four dots: the first leans left, the other three lean right.",
      examples: [
        { ch: "点", py: "diǎn", en: "dot; o'clock", word: "三点", wpy: ["sān", "diǎn"], t: 1, wen: "three o'clock", idx: [5, 6, 7, 8] },
        { ch: "热", py: "rè", en: "hot", word: "很热", wpy: ["hěn", "rè"], t: 1, wen: "very hot", idx: [6, 7, 8, 9] }
      ],
      family: "点热然照黑" },

    // Lesson 9
    { id: "tree", lesson: 9, glyph: "木", name: "木字旁", py: "mùzìpáng", en: "wood side",
      from: { ch: "木", py: "mù", en: "tree; wood" }, pos: "left", src: ["校", [0, 1, 2, 3]],
      strokes: ["横", "竖", "撇", "点"],
      meaning: "Trees and wood: wooden things, buildings, machines.",
      tip: "On the left side, the 捺 of 木 shrinks into a 点.",
      examples: [
        { ch: "校", py: "xiào", en: "school", word: "学校", wpy: ["xué", "xiào"], t: 1, wen: "school", idx: [0, 1, 2, 3] },
        { ch: "样", py: "yàng", en: "kind; appearance", word: "怎么样", wpy: ["zěn", "me", "yàng"], t: 2, wen: "how is it?", idx: [0, 1, 2, 3] }
      ],
      family: "校样机楼树椅" },

    { id: "mouth", lesson: 9, glyph: "口", name: "口字旁", py: "kǒuzìpáng", en: "mouth side",
      from: { ch: "口", py: "kǒu", en: "mouth" }, pos: "left", src: ["吃", [0, 1, 2]],
      strokes: ["竖", "横折", "横"],
      meaning: "The mouth: eating, drinking, calling, and question particles (吗 呢 吧).",
      tip: "Three strokes. The last 横 closes the box.",
      examples: [
        { ch: "吃", py: "chī", en: "to eat", word: "好吃", wpy: ["hǎo", "chī"], t: 1, wen: "delicious", idx: [0, 1, 2] },
        { ch: "喝", py: "hē", en: "to drink", word: "喝水", wpy: ["hē", "shuǐ"], t: 0, wen: "to drink water", idx: [0, 1, 2] }
      ],
      family: "吃喝吗呢吧叫听" },

    // Lesson 10
    { id: "speech", lesson: 10, glyph: "讠", name: "言字旁", py: "yánzìpáng", en: "speech side",
      from: { ch: "言", py: "yán", en: "speech" }, pos: "left", src: ["词", [0, 1]],
      strokes: ["点", "横折提"],
      meaning: "Speech and language: words, telling, asking, thanking, lessons.",
      tip: "Only two strokes: a 点, then one 横折提.",
      examples: [
        { ch: "词", py: "cí", en: "word", word: "生词", wpy: ["shēng", "cí"], t: 1, wen: "new word", idx: [0, 1] },
        { ch: "试", py: "shì", en: "to try; test", word: "考试", wpy: ["kǎo", "shì"], t: 1, wen: "exam", idx: [0, 1] }
      ],
      family: "词试诉说话请谢课" },

    { id: "sun", lesson: 10, glyph: "日", name: "日字旁", py: "rìzìpáng", en: "sun side",
      from: { ch: "日", py: "rì", en: "sun; day" }, pos: "left", src: ["明", [0, 1, 2, 3]],
      strokes: ["竖", "横折", "横", "横"],
      meaning: "The sun, days and time: yesterday, tomorrow, evening, clear skies.",
      tip: "Four strokes, with only ONE line inside. 目 (eye) has two.",
      examples: [
        { ch: "昨", py: "zuó", en: "yesterday", word: "昨天", wpy: ["zuó", "tiān"], t: 0, wen: "yesterday", idx: [0, 1, 2, 3] },
        { ch: "明", py: "míng", en: "bright; next", word: "明天", wpy: ["míng", "tiān"], t: 0, wen: "tomorrow", idx: [0, 1, 2, 3] }
      ],
      family: "昨明时晚晴" },

    // Lesson 11
    { id: "person", lesson: 11, glyph: "亻", name: "单人旁", py: "dānrénpáng", en: "single person",
      from: { ch: "人", py: "rén", en: "person" }, pos: "left", src: ["他", [0, 1]],
      strokes: ["撇", "竖"],
      meaning: "People and what people do: he, you, body, seat, doing.",
      tip: "One 撇 makes 亻. Two 撇 make 彳 (double person).",
      examples: [
        { ch: "他", py: "tā", en: "he", word: "他们", wpy: ["tā", "men"], t: 0, wen: "they", idx: [0, 1] },
        { ch: "体", py: "tǐ", en: "body", word: "身体", wpy: ["shēn", "tǐ"], t: 1, wen: "body; health", idx: [0, 1] }
      ],
      family: "他体你们位做住" },

    { id: "sickness", lesson: 11, glyph: "疒", name: "病字头", py: "bìngzìtóu", en: "sickness top",
      from: { ch: "疒", py: "nè", en: "illness" }, pos: "wrap-tl", src: ["病", [0, 1, 2, 3, 4]],
      strokes: ["点", "横", "撇", "点", "提"],
      meaning: "Illness and pain: picture a sick person lying in bed under a roof.",
      tip: "疒 is 广 plus a 点 and a 提 on the left, five strokes in all.",
      examples: [
        { ch: "病", py: "bìng", en: "illness", word: "生病", wpy: ["shēng", "bìng"], t: 1, wen: "to get sick", idx: [0, 1, 2, 3, 4] },
        { ch: "疼", py: "téng", en: "to ache", word: "头疼", wpy: ["tóu", "téng"], t: 1, wen: "headache", idx: [0, 1, 2, 3, 4] }
      ],
      family: "病疼" },

    // Lesson 12
    { id: "metal", lesson: 12, glyph: "钅", name: "金字旁", py: "jīnzìpáng", en: "gold side",
      from: { ch: "金", py: "jīn", en: "metal; gold" }, pos: "left", src: ["钱", [0, 1, 2, 3, 4]],
      strokes: ["撇", "横", "横", "横", "竖提"],
      meaning: "Metals and money: iron, coins, clocks, and 错 (wrong).",
      tip: "Five strokes: 撇, three 横, then 竖提. Compare 饣 (food), which has three.",
      examples: [
        { ch: "铁", py: "tiě", en: "iron", word: "地铁", wpy: ["dì", "tiě"], t: 1, wen: "subway", idx: [0, 1, 2, 3, 4] },
        { ch: "钱", py: "qián", en: "money", word: "多少钱", wpy: ["duō", "shao", "qián"], t: 2, wen: "how much money?", idx: [0, 1, 2, 3, 4] }
      ],
      family: "铁钱错钟" },

    { id: "hill", lesson: 12, glyph: "阝", name: "左耳旁", py: "zuǒ'ěrpáng", en: "left ear",
      from: { ch: "阜", py: "fù", en: "mound; hill" }, pos: "left", src: ["阴", [0, 1]],
      strokes: ["横撇弯钩", "竖"],
      meaning: "On the LEFT, 阝 means hills and terrain: shade, sunshine, courtyards.",
      tip: "Same shape as 右耳旁. Its position tells you which one it is: left means hill.",
      examples: [
        { ch: "阴", py: "yīn", en: "overcast; shade", word: "阴天", wpy: ["yīn", "tiān"], t: 0, wen: "overcast day", idx: [0, 1] },
        { ch: "院", py: "yuàn", en: "courtyard", word: "医院", wpy: ["yī", "yuàn"], t: 1, wen: "hospital", idx: [0, 1] }
      ],
      family: "阴院阳队" },

    // Lesson 13
    { id: "city", lesson: 13, glyph: "阝", name: "右耳旁", py: "yòu'ěrpáng", en: "right ear",
      from: { ch: "邑", py: "yì", en: "town" }, pos: "right", src: ["都", [8, 9]],
      strokes: ["横撇弯钩", "竖"],
      meaning: "On the RIGHT, 阝 means towns and places: capital, district, post office.",
      tip: "Same shape as 左耳旁. Its position tells you which one it is: right means town.",
      examples: [
        { ch: "都", py: "dōu", en: "all; both", word: "都是", wpy: ["dōu", "shì"], t: 0, wen: "all are", idx: [8, 9] },
        { ch: "那", py: "nà", en: "that", word: "那个", wpy: ["nà", "ge"], t: 0, wen: "that one", idx: [4, 5] }
      ],
      family: "都那部邮" },

    { id: "tap", lesson: 13, glyph: "攵", name: "反文旁", py: "fǎnwénpáng", en: "reversed 文",
      from: { ch: "攴", py: "pū", en: "to tap" }, pos: "right", src: ["教", [7, 8, 9, 10]],
      strokes: ["撇", "横", "撇", "捺"],
      meaning: "A hand holding a stick, so it marks actions: teaching, counting, putting, receiving.",
      tip: "It is not 文. 攵 starts with a short 撇 and a 横, then 撇 and 捺.",
      examples: [
        { ch: "教", py: "jiāo / jiào", en: "to teach", word: "教室", wpy: ["jiào", "shì"], t: 0, wen: "classroom", idx: [7, 8, 9, 10] }
      ],
      family: "教数放收" },

    // Lesson 14
    { id: "eye", lesson: 14, glyph: "目", name: "目字旁", py: "mùzìpáng", en: "eye side",
      from: { ch: "目", py: "mù", en: "eye" }, pos: "left", src: ["眼", [0, 1, 2, 3, 4]],
      strokes: ["竖", "横折", "横", "横", "横"],
      meaning: "Eyes and looking: eyes, eyeballs, sleeping.",
      tip: "Five strokes with TWO lines inside. 日 has only one.",
      examples: [
        { ch: "眼", py: "yǎn", en: "eye", word: "眼睛", wpy: ["yǎn", "jing"], t: 0, wen: "eyes", idx: [0, 1, 2, 3, 4] },
        { ch: "睡", py: "shuì", en: "to sleep", word: "睡觉", wpy: ["shuì", "jiào"], t: 0, wen: "to sleep", idx: [0, 1, 2, 3, 4] }
      ],
      family: "眼睡睛" },

    { id: "stand", lesson: 14, glyph: "立", name: "立字旁", py: "lìzìpáng", en: "standing side",
      from: { ch: "立", py: "lì", en: "to stand" }, pos: "left", src: ["站", [0, 1, 2, 3, 4]],
      strokes: ["点", "横", "点", "撇", "提"],
      meaning: "Standing: 站 means to stand, and also a station, where you stand and wait.",
      tip: "On the left side, the last 横 of 立 becomes a rising 提.",
      examples: [
        { ch: "站", py: "zhàn", en: "to stand; station", word: "车站", wpy: ["chē", "zhàn"], t: 1, wen: "station", idx: [0, 1, 2, 3, 4] }
      ],
      family: "站" },

    // Lesson 15
    { id: "woman", lesson: 15, glyph: "女", name: "女字旁", py: "nǚzìpáng", en: "woman side",
      from: { ch: "女", py: "nǚ", en: "woman" }, pos: "left", src: ["姐", [0, 1, 2]],
      strokes: ["撇点", "撇", "提"],
      meaning: "Women and family: sister, mother, grandmother, surname.",
      tip: "On the left side, the last 横 of 女 becomes a rising 提.",
      examples: [
        { ch: "姐", py: "jiě", en: "older sister", word: "姐姐", wpy: ["jiě", "jie"], t: 0, wen: "older sister", idx: [0, 1, 2] },
        { ch: "姓", py: "xìng", en: "surname", word: "姓王", wpy: ["xìng", "wáng"], t: 0, wen: "to be surnamed Wang", idx: [0, 1, 2] }
      ],
      family: "姐姓奶妈她好妹" },

    { id: "moon", lesson: 15, glyph: "月", name: "月字旁", py: "yuèzìpáng", en: "moon side",
      from: { ch: "月", py: "yuè", en: "moon; month" }, pos: "left", src: ["脑", [0, 1, 2, 3]],
      strokes: ["竖撇", "横折钩", "横", "横"],
      meaning: "Moon and time (期), but more often the BODY. Most body-part characters come from ⺼ (flesh), which looks like 月.",
      tip: "It usually sits on the left (脑), but it can sit on the right too (期).",
      examples: [
        { ch: "期", py: "qī", en: "period of time", word: "星期", wpy: ["xīng", "qī"], t: 1, wen: "week", idx: [8, 9, 10, 11] },
        { ch: "脑", py: "nǎo", en: "brain", word: "电脑", wpy: ["diàn", "nǎo"], t: 1, wen: "computer", idx: [0, 1, 2, 3] }
      ],
      family: "期脑服朋腿脸" }
  ];

  /* Components that appear as exam options but are not among the 30. */
  const EXTRAS = [
    { id: "knife", glyph: "刂", name: "立刀旁", py: "lìdāopáng", en: "standing knife",
      from: { ch: "刀", py: "dāo", en: "knife" }, pos: "right", src: ["别", [5, 6]],
      strokes: ["竖", "竖钩"],
      meaning: "A knife: cutting and separating. 别 first meant 'to separate'.",
      examples: [{ ch: "别", py: "bié", en: "don't; other", word: "别去", wpy: ["bié", "qù"], t: 0, wen: "don't go", idx: [5, 6] }],
      family: "别到刻" },
    { id: "clothes", glyph: "衤", name: "衣字旁", py: "yīzìpáng", en: "clothing side",
      from: { ch: "衣", py: "yī", en: "clothes" }, pos: "left", src: ["裤", [0, 1, 2, 3, 4]],
      strokes: ["点", "横撇", "竖", "撇", "点"],
      meaning: "Clothing: trousers, shirts, socks.",
      tip: "Two dots at the end (衤) means clothing. One dot (礻) means spirits.",
      examples: [{ ch: "裤", py: "kù", en: "trousers", word: "裤子", wpy: ["kù", "zi"], t: 0, wen: "trousers", idx: [0, 1, 2, 3, 4] }],
      family: "裤衬袜" },
    { id: "jade", glyph: "王", name: "斜玉旁", py: "xiéyùpáng", en: "slanted jade",
      from: { ch: "玉", py: "yù", en: "jade" }, pos: "left", src: ["球", [0, 1, 2, 3]],
      strokes: ["横", "横", "竖", "提"],
      meaning: "Jade and precious stones. A round jade bead became 球 (ball).",
      tip: "王 has two 横 above the vertical; 提土旁 (土) has only one.",
      examples: [{ ch: "球", py: "qiú", en: "ball", word: "篮球", wpy: ["lán", "qiú"], t: 1, wen: "basketball", idx: [0, 1, 2, 3] }],
      family: "球玩现班" },
    { id: "is", glyph: "是", name: "是", py: "shì", en: "'to be' as a component",
      from: { ch: "是", py: "shì", en: "to be" }, pos: "wrap-bl", src: ["题", [0, 1, 2, 3, 4, 5, 6, 7, 8]],
      strokes: ["竖", "横折", "横", "横", "横", "竖", "横", "撇", "捺"],
      meaning: "In 题, 是 wraps under 页 (head). 题 first meant 'forehead', then 'title' and 'question'.",
      examples: [{ ch: "题", py: "tí", en: "question; topic", word: "问题", wpy: ["wèn", "tí"], t: 1, wen: "question", idx: [0, 1, 2, 3, 4, 5, 6, 7, 8] }],
      family: "题" },
    { id: "square", glyph: "方", name: "方", py: "fāng", en: "square; direction",
      from: { ch: "方", py: "fāng", en: "square" }, pos: "bottom", src: ["旁", [6, 7, 8, 9]],
      strokes: ["点", "横", "横折钩", "撇"],
      meaning: "In 旁 (páng), 方 (fāng) sits at the bottom and gives the sound.",
      examples: [{ ch: "旁", py: "páng", en: "side", word: "旁边", wpy: ["páng", "biān"], t: 0, wen: "beside", idx: [6, 7, 8, 9] }],
      family: "旁放房访" },
    { id: "evening", glyph: "夕", name: "夕", py: "xī", en: "evening",
      from: { ch: "夕", py: "xī", en: "evening" }, pos: "top", src: ["名", [0, 1, 2]],
      strokes: ["撇", "横撇", "点"],
      meaning: "Evening. In 名 it's dark (夕), so you call out (口) your name.",
      examples: [{ ch: "名", py: "míng", en: "name", word: "名字", wpy: ["míng", "zi"], t: 0, wen: "name", idx: [0, 1, 2] }],
      family: "名多外岁" },
    { id: "west", glyph: "覀", name: "西字头", py: "xīzìtóu", en: "west top",
      from: { ch: "西", py: "xī", en: "west" }, pos: "top", src: ["票", [0, 1, 2, 3, 4, 5]],
      strokes: ["横", "竖", "横折", "竖", "竖", "横"],
      meaning: "A flattened 西 on top, as in 票 (ticket) and 要 (want).",
      examples: [{ ch: "票", py: "piào", en: "ticket", word: "门票", wpy: ["mén", "piào"], t: 1, wen: "admission ticket", idx: [0, 1, 2, 3, 4, 5] }],
      family: "票要" },
    { id: "ten", glyph: "十", name: "十", py: "shí", en: "ten",
      from: { ch: "十", py: "shí", en: "ten" }, pos: "right", src: ["什", [2, 3]],
      strokes: ["横", "竖"],
      meaning: "Ten. In every set it is option D and is only used by the example: 亻 + 十 = 什 (什么).",
      examples: [{ ch: "什", py: "shén", en: "what", word: "什么", wpy: ["shén", "me"], t: 0, wen: "what", idx: [2, 3] }],
      family: "什" }
  ];

  /* ------------------------------------------------------------------------
     Exam sets — 第25–27题：根据部件组字 (Form characters using components)
     t:    index of the incomplete character inside the word
     miss: stroke indices of that character which are missing (= the answer)
     ---------------------------------------------------------------------- */
  const EXAMPLE_Q = { no: 0, word: "什么", py: ["shén", "me"], t: 0, ans: "D", miss: [2, 3], en: "what" };

  const SETS = [
    { n: 1, opts: { A: "ice", B: "silk", C: "heart", D: "ten" }, qs: [
      { no: 25, word: "不懂", py: ["bù", "dǒng"], t: 1, ans: "C", miss: [0, 1, 2], en: "don't understand", chEn: "to understand",
        why: "忄 is the heart and mind. Understanding happens in your mind.", sound: "董 dǒng → 懂 dǒng (same sound)" },
      { no: 26, word: "给他", py: ["gěi", "tā"], t: 0, ans: "B", miss: [0, 1, 2], en: "give (to) him", chEn: "to give",
        why: "纟 is silk thread. 给 first meant 'to supply', and silk was the classic thing to hand over." },
      { no: 27, word: "两次", py: ["liǎng", "cì"], t: 1, ans: "A", miss: [0, 1], en: "twice", chEn: "time (occurrence)",
        why: "次 = 冫 + 欠. Learn it as a whole word: 一次 once, 两次 twice. Note it has two dots, not three." }
    ] },
    { n: 2, opts: { A: "tap", B: "walk", C: "knife", D: "ten" }, qs: [
      { no: 25, word: "很远", py: ["hěn", "yuǎn"], t: 1, ans: "B", miss: [4, 5, 6], en: "very far", chEn: "far",
        why: "辶 means walking and roads. Distance is something you walk.", sound: "元 yuán → 远 yuǎn" },
      { no: 26, word: "教室", py: ["jiào", "shì"], t: 0, ans: "A", miss: [7, 8, 9, 10], en: "classroom", chEn: "to teach",
        why: "攵 is a hand holding a stick, so it marks an action. Here the action is teaching." },
      { no: 27, word: "别去", py: ["bié", "qù"], t: 0, ans: "C", miss: [5, 6], en: "don't go", chEn: "don't; other",
        why: "刂 is a knife. 别 first meant 'to cut apart, separate'." }
    ] },
    { n: 3, opts: { A: "walk", B: "roof", C: "water", D: "ten" }, qs: [
      { no: 25, word: "送你", py: ["sòng", "nǐ"], t: 0, ans: "A", miss: [6, 7, 8], en: "see you off; give you", chEn: "to send; to see off",
        why: "辶 marks movement: sending something, or walking someone out." },
      { no: 26, word: "洗手", py: ["xǐ", "shǒu"], t: 0, ans: "C", miss: [0, 1, 2], en: "wash hands", chEn: "to wash",
        why: "氵 is water. You wash with water.", sound: "先 xiān → 洗 xǐ (similar)" },
      { no: 27, word: "写完", py: ["xiě", "wán"], t: 1, ans: "B", miss: [0, 1, 2], en: "finish writing", chEn: "to finish",
        why: "宀 is a roof. 完 first described a complete, intact house.", sound: "元 yuán → 完 wán" }
    ] },
    { n: 4, opts: { A: "silk", B: "clothes", C: "walk", D: "ten" }, qs: [
      { no: 25, word: "进去", py: ["jìn", "qù"], t: 0, ans: "C", miss: [4, 5, 6], en: "go in", chEn: "to enter",
        why: "辶 marks movement. Here the movement is entering.", sound: "井 jǐng → 进 jìn (similar)" },
      { no: 26, word: "裤子", py: ["kù", "zi"], t: 0, ans: "B", miss: [0, 1, 2, 3, 4], en: "trousers", chEn: "trousers",
        why: "衤 (衣字旁) means clothing.", sound: "库 kù → 裤 kù (same sound)" },
      { no: 27, word: "红色", py: ["hóng", "sè"], t: 0, ans: "A", miss: [0, 1, 2], en: "red", chEn: "red",
        why: "纟 is silk. Colours come from dyed silk: 红 red, 绿 green.", sound: "工 gōng → 红 hóng (rhymes)" }
    ] },
    { n: 5, opts: { A: "bamboo", B: "ice", C: "woman", D: "ten" }, qs: [
      { no: 25, word: "等一下", py: ["děng", "yí", "xià"], t: 0, ans: "A", miss: [0, 1, 2, 3, 4, 5], en: "wait a moment", chEn: "to wait",
        why: "⺮ is bamboo. 等 first meant lining up bamboo slips evenly (rank, grade), and later 'to wait'." },
      { no: 26, word: "奶茶", py: ["nǎi", "chá"], t: 0, ans: "C", miss: [0, 1, 2], en: "milk tea", chEn: "milk; grandma",
        why: "女 is a woman: 奶 means milk, and 奶奶 is grandmother.", sound: "乃 nǎi → 奶 nǎi (same sound)" },
      { no: 27, word: "准备", py: ["zhǔn", "bèi"], t: 0, ans: "B", miss: [0, 1], en: "to prepare", chEn: "accurate; to allow",
        why: "准 = 冫 + 隹. Learn it with 准备 (prepare). It has two dots, not three." }
    ] },
    { n: 6, opts: { A: "walk", B: "heart", C: "moon", D: "ten" }, qs: [
      { no: 25, word: "快乐", py: ["kuài", "lè"], t: 0, ans: "B", miss: [0, 1, 2], en: "happy", chEn: "fast; happy",
        why: "忄 is the heart. 快 first meant 'pleased', a feeling.", sound: "夬 guài → 快 kuài" },
      { no: 26, word: "过生日", py: ["guò", "shēng", "rì"], t: 0, ans: "A", miss: [3, 4, 5], en: "celebrate a birthday", chEn: "to pass; to spend",
        why: "辶 marks movement: 过 means to pass through, or to spend a day." },
      { no: 27, word: "舒服", py: ["shū", "fu"], t: 1, ans: "C", miss: [0, 1, 2, 3], en: "comfortable", chEn: "clothes; to serve",
        why: "月 on the left. Remember 服 from 衣服 (clothes) and 舒服 (comfortable)." }
    ] },
    { n: 7, opts: { A: "step", B: "jade", C: "foot", D: "ten" }, qs: [
      { no: 25, word: "往前", py: ["wǎng", "qián"], t: 0, ans: "A", miss: [0, 1, 2], en: "go forward", chEn: "toward",
        why: "彳 means walking, so 往 is to go toward something." },
      { no: 26, word: "跑步", py: ["pǎo", "bù"], t: 0, ans: "C", miss: [0, 1, 2, 3, 4, 5, 6], en: "to run, jog", chEn: "to run",
        why: "𧾷 is the foot. You run with your feet.", sound: "包 bāo → 跑 pǎo (rhymes)" },
      { no: 27, word: "篮球", py: ["lán", "qiú"], t: 1, ans: "B", miss: [0, 1, 2, 3], en: "basketball", chEn: "ball",
        why: "王 here is 斜玉旁 (jade). A round jade bead became a ball.", sound: "求 qiú → 球 qiú (same sound)" }
    ] },
    { n: 8, opts: { A: "fire", B: "grass", C: "food", D: "ten" }, qs: [
      { no: 25, word: "虽然", py: ["suī", "rán"], t: 1, ans: "A", miss: [8, 9, 10, 11], en: "although", chEn: "so; like that",
        why: "灬 is fire. 然 first meant 'to burn'; today that meaning is written 燃.", sound: "肰 rán → 然 rán" },
      { no: 26, word: "花钱", py: ["huā", "qián"], t: 0, ans: "B", miss: [0, 1, 2], en: "spend money", chEn: "flower; to spend",
        why: "艹 means plants, and 花 is a flower. It also means 'to spend'.", sound: "化 huà → 花 huā" },
      { no: 27, word: "饭馆", py: ["fàn", "guǎn"], t: 0, ans: "C", miss: [0, 1, 2], en: "restaurant", chEn: "meal",
        why: "饣 is food, and 饭 is a meal.", sound: "反 fǎn → 饭 fàn" }
    ] },
    { n: 9, opts: { A: "foot", B: "tree", C: "square", D: "ten" }, qs: [
      { no: 25, word: "走路", py: ["zǒu", "lù"], t: 1, ans: "A", miss: [0, 1, 2, 3, 4, 5, 6], en: "to walk", chEn: "road",
        why: "𧾷 is the foot. A road is where your feet go." },
      { no: 26, word: "这样", py: ["zhè", "yàng"], t: 1, ans: "B", miss: [0, 1, 2, 3], en: "like this", chEn: "kind; appearance",
        why: "样 = 木 + 羊. It was originally the name of a tree.", sound: "羊 yáng → 样 yàng" },
      { no: 27, word: "旁边", py: ["páng", "biān"], t: 0, ans: "C", miss: [6, 7, 8, 9], en: "beside", chEn: "side",
        why: "方 completes 旁 at the bottom.", sound: "方 fāng → 旁 páng (rhymes)" }
    ] },
    { n: 10, opts: { A: "is", B: "metal", C: "bamboo", D: "ten" }, qs: [
      { no: 25, word: "写错", py: ["xiě", "cuò"], t: 1, ans: "B", miss: [0, 1, 2, 3, 4], en: "write wrongly", chEn: "wrong",
        why: "钅 is metal. 错 first meant inlaying gold, mixing metals, and later came to mean 'wrong'." },
      { no: 26, word: "做题", py: ["zuò", "tí"], t: 1, ans: "A", miss: [0, 1, 2, 3, 4, 5, 6, 7, 8], en: "do exercises", chEn: "question; topic",
        why: "题 = 是 + 页 (head). Remember it from 问题 (question) and 做题 (do exercises)." },
      { no: 27, word: "笑了", py: ["xiào", "le"], t: 0, ans: "C", miss: [0, 1, 2, 3, 4, 5], en: "laughed", chEn: "to laugh",
        why: "⺮ is bamboo. Mnemonic: bamboo bending in the wind looks like someone doubled over laughing." }
    ] },
    { n: 11, opts: { A: "silk", B: "grass", C: "sickness", D: "ten" }, qs: [
      { no: 25, word: "头疼", py: ["tóu", "téng"], t: 1, ans: "C", miss: [0, 1, 2, 3, 4], en: "headache", chEn: "to ache",
        why: "疒 means illness. Pain belongs here.", sound: "冬 dōng → 疼 téng (rhymes)" },
      { no: 26, word: "经常", py: ["jīng", "cháng"], t: 0, ans: "A", miss: [0, 1, 2], en: "often", chEn: "to pass through",
        why: "纟 is silk. 经 is the warp thread on a loom, which 'runs through' the cloth. That gives 经常 (often) and 已经 (already)." },
      { no: 27, word: "药店", py: ["yào", "diàn"], t: 0, ans: "B", miss: [0, 1, 2], en: "pharmacy", chEn: "medicine",
        why: "艹 means plants. Traditional medicine is made from herbs." }
    ] },
    { n: 12, opts: { A: "hill", B: "sun", C: "tree", D: "ten" }, qs: [
      { no: 25, word: "阴天", py: ["yīn", "tiān"], t: 0, ans: "A", miss: [0, 1], en: "overcast day", chEn: "shade; overcast",
        why: "阝 on the left is a hill. 阴 is the shady side of a hill." },
      { no: 26, word: "大楼", py: ["dà", "lóu"], t: 1, ans: "C", miss: [0, 1, 2, 3], en: "big building", chEn: "building; floor",
        why: "木 is wood. Buildings used to be made of wood.", sound: "娄 lóu → 楼 lóu (same sound)" },
      { no: 27, word: "小时候", py: ["xiǎo", "shí", "hou"], t: 1, ans: "B", miss: [0, 1, 2, 3], en: "in childhood", chEn: "time",
        why: "日 is the sun. Time is measured by the sun." }
    ] },
    { n: 13, opts: { A: "speech", B: "city", C: "bamboo", D: "ten" }, qs: [
      { no: 25, word: "写一笔", py: ["xiě", "yì", "bǐ"], t: 2, ans: "C", miss: [0, 1, 2, 3, 4, 5], en: "write one stroke", chEn: "pen; stroke",
        why: "⺮ + 毛: a bamboo handle with hair on the end is a writing brush." },
      { no: 26, word: "那样", py: ["nà", "yàng"], t: 0, ans: "B", miss: [4, 5], en: "like that", chEn: "that",
        why: "阝 on the right (右耳旁) completes 那 (that)." },
      { no: 27, word: "告诉", py: ["gào", "su"], t: 1, ans: "A", miss: [0, 1], en: "to tell", chEn: "to tell; to accuse",
        why: "讠 means speech. You tell someone with words." }
    ] },
    { n: 14, opts: { A: "eye", B: "person", C: "foot", D: "ten" }, qs: [
      { no: 25, word: "一位", py: ["yí", "wèi"], t: 1, ans: "B", miss: [0, 1], en: "one (person, polite)", chEn: "seat; position",
        why: "亻 + 立: a person standing in their place, which gives 'seat' and 'position'." },
      { no: 26, word: "眼睛", py: ["yǎn", "jing"], t: 1, ans: "A", miss: [0, 1, 2, 3, 4], en: "eyes", chEn: "eyeball",
        why: "目 is the eye.", sound: "青 qīng → 睛 jīng (rhymes)" },
      { no: 27, word: "跳舞", py: ["tiào", "wǔ"], t: 0, ans: "C", miss: [0, 1, 2, 3, 4, 5, 6], en: "to dance", chEn: "to jump",
        why: "𧾷 is the foot: jumping and dancing.", sound: "兆 zhào → 跳 tiào (rhymes)" }
    ] },
    { n: 15, opts: { A: "tree", B: "evening", C: "west", D: "ten" }, qs: [
      { no: 25, word: "门票", py: ["mén", "piào"], t: 1, ans: "C", miss: [0, 1, 2, 3, 4, 5], en: "admission ticket", chEn: "ticket",
        why: "票 = 覀 + 示, the same top as 要 (want)." },
      { no: 26, word: "机场", py: ["jī", "chǎng"], t: 0, ans: "A", miss: [0, 1, 2, 3], en: "airport", chEn: "machine",
        why: "木 is wood. 机 first meant a wooden mechanism, and now means machine.", sound: "几 jǐ → 机 jī" },
      { no: 27, word: "姓名", py: ["xìng", "míng"], t: 1, ans: "B", miss: [0, 1, 2], en: "full name", chEn: "name",
        why: "夕 (evening) + 口 (mouth): in the dark you call out your name." }
    ] }
  ];

  // Groups of easily-confused components (used for comparisons & smart distractors)
  const LOOKALIKES = [
    { id: "dots", title: "Ice or water?", ids: ["ice", "water"],
      diff: { water: [1] },
      hint: "Count the dots. Ice (冫) has 2 and water (氵) has 3. Ice is water with one drop frozen away.",
      ex: ["冷", "汉"] },
    { id: "people", title: "One person or two?", ids: ["person", "step"],
      diff: { step: [0] },
      hint: "亻 has one 撇 (a single person). 彳 has two (a double person), and it's about walking.",
      ex: ["他", "很"] },
    { id: "ears", title: "Left ear or right ear?", ids: ["hill", "city"],
      diff: {},
      hint: "The shape is the same and only the position differs. On the left it means hill or terrain (阴 院); on the right it means town or place (都 那).",
      ex: ["阴", "都"] },
    { id: "roofs", title: "Shelter or sickness?", ids: ["shelter", "sickness"],
      diff: { sickness: [3, 4] },
      hint: "疒 is 广 plus a 点 and a 提 on the left: a sick person lying under the roof.",
      ex: ["店", "病"] },
    { id: "boxes", title: "Sun, eye or moon?", ids: ["sun", "eye", "moon"],
      diff: { eye: [3], moon: [0, 1] },
      hint: "日 has one line inside (4 strokes). 目 is taller with two lines (5 strokes). 月 opens at the bottom, with a 撇 and a hook.",
      ex: ["明", "眼", "脑"] },
    { id: "uprights", title: "Hand, earth, wood or jade?", ids: ["hand", "earth", "tree", "jade"],
      diff: { hand: [1], tree: [2, 3], jade: [1] },
      hint: "扌 has a hook. 土 has no hook and ends with 提. 木 ends with 撇 + 点. 王 has two 横 above the 提.",
      ex: ["打", "场", "校", "球"] },
    { id: "tops", title: "Grass or bamboo?", ids: ["grass", "bamboo"],
      diff: {},
      hint: "艹 is 3 strokes (grass, plants). ⺮ is 6 strokes in two little 'bamboo' halves (pens, waiting, laughing).",
      ex: ["茶", "笔"] },
    { id: "sides", title: "Food, metal or speech?", ids: ["food", "metal", "speech"],
      diff: {},
      hint: "Count the strokes: 讠 has 2 (speech), 饣 has 3 (food), 钅 has 5 (metal and money).",
      ex: ["饭", "钱", "词"] }
  ];

  // Hero showcase: character → [component a, component b] with labels
  const SHOWCASE = [
    { ch: "懂", py: "dǒng", en: "to understand", rad: [0, 1, 2], radLabel: "忄 heart → meaning", restLabel: "董 dǒng → sound", axis: "x" },
    { ch: "花", py: "huā", en: "flower; to spend", rad: [0, 1, 2], radLabel: "艹 grass → meaning", restLabel: "化 huà → sound", axis: "y" },
    { ch: "跑", py: "pǎo", en: "to run", rad: [0, 1, 2, 3, 4, 5, 6], radLabel: "𧾷 foot → meaning", restLabel: "包 bāo → sound", axis: "x" },
    { ch: "远", py: "yuǎn", en: "far", rad: [4, 5, 6], radLabel: "辶 walk → meaning", restLabel: "元 yuán → sound", axis: "bl" },
    { ch: "然", py: "rán", en: "so; like that", rad: [8, 9, 10, 11], radLabel: "灬 fire → meaning", restLabel: "肰 rán → sound", axis: "-y" },
    { ch: "饭", py: "fàn", en: "meal", rad: [0, 1, 2], radLabel: "饣 food → meaning", restLabel: "反 fǎn → sound", axis: "x" },
    { ch: "睛", py: "jīng", en: "eyeball", rad: [0, 1, 2, 3, 4], radLabel: "目 eye → meaning", restLabel: "青 qīng → sound", axis: "x" },
    { ch: "球", py: "qiú", en: "ball", rad: [0, 1, 2, 3], radLabel: "王 jade → meaning", restLabel: "求 qiú → sound", axis: "x" }
  ];

  window.HSK = { STROKES, POSITIONS, RADICALS, EXTRAS, SETS, EXAMPLE_Q, LOOKALIKES, SHOWCASE };
})();
