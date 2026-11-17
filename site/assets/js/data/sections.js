/* ==========================================================================
   The five parts of the notes, in the order shown on the landing page.
   `nav` = the section's own top-bar links: [hash, nav id, 汉字, label].
   ========================================================================== */
(function () {
  "use strict";
  window.HSK_SECTIONS = [
    { id: "vocab", n: 1, zh: "词汇", py: "cíhuì", glyph: "词", en: "Vocabulary", status: "live",
      href: "#/vocab", cta: "Explore the graphs",
      desc: "The HSK 2 word list as character graphs: one shared character in red, every word it builds around it, like <span class=\"han\">车 → 火车 · 开车 · 车站</span>. Open a family, follow the links to the next one, then quiz yourself.",
      nav: [["#/vocab", "vocab", "图", "Graphs"], ["#/vocab/quiz", "vocab-quiz", "练", "Quiz"]] },
    { id: "grammar", n: 2, zh: "语法", py: "yǔfǎ", glyph: "法", en: "Grammar", status: "live",
      href: "#/grammar", cta: "Start with lesson 1",
      desc: "The grammar notes of each textbook lesson, one pattern at a time: <span class=\"han\">吧</span> for a guess, <span class=\"han\">是……的</span>, <span class=\"han\">请 · 让 · 叫</span>, <span class=\"han\">还是……吧</span>, <span class=\"han\">二十多</span> and more. Each pattern builds itself, then you practise with the textbook dialogues.",
      nav: [["#/grammar", "gram", "学", "Lessons"], ["#/grammar/review", "gram-review", "练", "Review"]] },
    { id: "expressions", n: 3, zh: "词组", py: "cízǔ", glyph: "组", en: "Expressions", status: "live",
      href: "#/expressions", cta: "Start building words",
      desc: "Make new words from words you already know: <span class=\"han\">茶 + 杯子 → 茶杯</span>. Fourteen lessons, three expressions each, with a short quiz after every lesson.",
      nav: [["#/expressions", "expr", "学", "Lessons"], ["#/expressions/review", "expr-review", "练", "Review"]] },
    { id: "radicals", n: 4, zh: "偏旁", py: "piānpáng", glyph: "旁", en: "Writing · Radicals", status: "live",
      href: "#/radicals", cta: "Open the radicals",
      desc: "Writing Part 1: the 30 textbook radicals, animated stroke by stroke, and all 15 exam sets of “form characters from components”.",
      nav: [["#/course", "course", "课", "Course"], ["#/learn", "learn", "学", "Learn"], ["#/compare", "compare", "辨", "Compare"], ["#/practice", "practice", "练", "Exam sets"], ["#/challenge", "challenge", "测", "Challenge"]] },
    { id: "writing2", n: 5, zh: "书写 · 二", py: "shūxiě", glyph: "写", en: "Writing · Part 2", status: "soon",
      desc: "The second part of the writing section." }
  ];
})();
