/* ==========================================================================
   Expressions — overview (rules, patterns, lessons), lesson page, review
   ========================================================================== */
(function () {
  "use strict";
  const { $, $$, html, shuffle } = App;
  const X = () => App.expr;
  const PAT_ORDER = ["kind", "place", "people", "action", "pair", "position", "helper"];
  const best = (n) => ((App.store.state.expr || {})[n] || null);

  /* Score dots for a lesson card / pill */
  const dots = (L) => {
    const b = best(L.n);
    if (!b) return `<span class="xl-new">New</span>`;
    return `<span class="xl-dots" aria-label="Best ${b.best} of ${L.quiz.length}">${L.quiz.map((_, k) => `<i class="${k < b.best ? "on" : ""}"></i>`).join("")}</span>`;
  };

  const pills = (cur) => `<nav class="lesson-pills" aria-label="Lessons">${X().E.LESSONS.map((L) => {
    const b = best(L.n), done = b && b.best === L.quiz.length;
    return `<a href="#/expressions/${L.n}" class="${L.n === cur ? "is-on" : ""}${done ? " is-done" : ""}" title="Lesson ${L.n} · ${L.items.map((e) => e.w).join(" ")}">${L.n}</a>`;
  }).join("")}</nav>`;

  /* ======================================================================
     Overview
     ====================================================================== */
  App.views.expr = {
    section: "expressions",
    nav: "expr",
    title: "Expressions",
    render() {
      const E = X().E, st = X().stats();
      const next = E.LESSONS.find((L) => !best(L.n)) || E.LESSONS[0];
      const byPat = {};
      X().ALL.forEach((e) => (byPat[e.pat] = byPat[e.pat] || []).push(e));
      const total = X().ALL.length;

      const root = html(`<div class="page-expr">
        <section class="hero wrap x-hero">
          <div class="hero-grid">
            <div class="hero-copy">
              <span class="eyebrow">HSK 2 · 词组 Expressions</span>
              <h1 class="title-xl">New words from <em>words you know</em>.</h1>
              <p class="lede">Every lesson teaches three new expressions, and each one keeps a piece of two words you already know: <span class="han">茶</span> tea + <span class="han">杯子</span> cup → <span class="han">茶杯</span> teacup. Once you see how the pieces join, new words become easy to guess.</p>
              <div class="btn-row">
                <a class="btn btn-primary" href="#/expressions/${next.n}">${st.tried ? "Continue with" : "Start"} lesson ${next.n} ${App.icon.arrow}</a>
                <a class="btn" href="#/expressions/review">Mixed review</a>
              </div>
              <div class="hero-stats">
                <div><b>${E.LESSONS.length}</b><span>lessons · 课</span></div>
                <div><b>${total}</b><span>expressions · 词组</span></div>
                <div><b>${PAT_ORDER.length}</b><span>word patterns</span></div>
              </div>
            </div>
            <div class="x-stage card" aria-label="Animated word building"><div class="x-stage-label"><span class="han">学一学</span> Learn the new expressions</div></div>
          </div>
        </section>

        <section class="section wrap">
          <div class="section-head reveal">
            <div><span class="eyebrow">How it works</span><h2 class="title-lg" style="margin-top:12px">Four rules that make it click</h2></div>
            <p class="muted" style="max-width:430px">Almost every new expression follows these. Learn them once and you can guess words you've never seen.</p>
          </div>
          <div class="rules">
            <article class="card rule reveal">
              <div class="rule-n">1</div>
              <div class="rule-body"><h3 class="title-md">The last character is the boss</h3>
              <p>It says what the thing <b>is</b>. Everything in front only says <b>which one</b>.</p></div>
              <div class="rule-vis boss">
                ${[["茶", "杯", "tea", "a cup"], ["火车", "站", "train", "a station"], ["高中", "生", "high school", "a student"]].map((r, k) => `
                <div class="boss-row" style="--k:${k}">
                  <span class="boss-w"><span class="han boss-rest">${r[0]}</span><span class="han boss-head">${r[1]}</span></span>
                  <span class="boss-line"></span>
                  <span class="boss-is">${r[3]} <small>for ${r[2]}</small></span>
                </div>`).join("")}
              </div>
            </article>
            <article class="card rule reveal" style="--d:70ms">
              <div class="rule-n">2</div>
              <div class="rule-body"><h3 class="title-md"><span class="han">子</span> falls off</h3>
              <p><span class="han">子</span> is only a noun ending, so when a word lends a piece, <span class="han">子</span> stays behind.</p></div>
              <div class="rule-vis drop">
                ${E.RULES.drop.map((d, k) => `<div class="drop-w" style="--k:${k}"><span class="han">${d[1]}</span><span class="han drop-zi">子</span></div>`).join("")}
              </div>
            </article>
            <article class="card rule reveal" style="--d:140ms">
              <div class="rule-n">3</div>
              <div class="rule-body"><h3 class="title-md">Same word, different piece</h3>
              <p>Take the character that carries the meaning you need. <span class="han">衣服</span> gives <span class="han">衣</span> to one word and <span class="han">服</span> to another.</p></div>
              <div class="rule-vis pick">
                <div class="pick-src"><span class="han"><b class="p0">衣</b><b class="p1">服</b></span><small class="py">yīfu · clothes</small></div>
                <svg class="pick-arrows" viewBox="0 0 300 54" preserveAspectRatio="none" aria-hidden="true"><path class="a0" d="M136 4 C 120 30, 84 30, 70 50"/><path class="a1" d="M164 4 C 180 30, 216 30, 230 50"/></svg>
                <div class="pick-to">
                  <div><span class="han">雨<b class="p0">衣</b></span><small><span class="py">yǔyī</span> raincoat</small></div>
                  <div><span class="han">运动<b class="p1">服</b></span><small><span class="py">yùndòngfú</span> sportswear</small></div>
                </div>
              </div>
            </article>
            <article class="card rule reveal" style="--d:210ms">
              <div class="rule-n">4</div>
              <div class="rule-body"><h3 class="title-md">Light tones come back</h3>
              <p>A syllable that is light (no tone) at the end of a word gets its full tone back when it moves to the front or the end of a new word.</p></div>
              <div class="rule-vis tone">
                ${E.RULES.tone.map((t) => {
                  const lightPy = t[1].replace(/(fu)$/, '<span class="tone-light">$1</span>');
                  const fullPy = t[3].replace(/(fú|fū)/, '<span class="tone-full">$1</span>');
                  return `<div class="tone-row"><span class="tone-w"><span class="han">${t[0]}</span><span class="py">${lightPy}</span></span><span class="tone-arrow">${App.icon.arrow}</span><span class="tone-w"><span class="han">${t[2].replace(t[4], `<b>${t[4]}</b>`)}</span><span class="py">${fullPy}</span></span></div>`;
                }).join("")}
              </div>
            </article>
          </div>
        </section>

        <section class="section wrap">
          <div class="section-head reveal">
            <div><span class="eyebrow">${PAT_ORDER.length} patterns</span><h2 class="title-lg" style="margin-top:12px">What kind of word is it?</h2></div>
            <p class="muted" style="max-width:430px">All ${total} expressions fit one of these patterns. The bar shows how many use each one. Tap a word to open its lesson.</p>
          </div>
          <div class="patterns">
            ${PAT_ORDER.map((id, k) => {
              const p = E.PATTERNS[id], list = byPat[id] || [];
              return `<article class="card pat-card reveal${id === "kind" ? " is-wide" : ""}" data-pat="${id}" style="--d:${k * 50}ms">
                <div class="pat-head"><span class="pat-icon">${X().ICON[p.icon]}</span>
                  <div><h3>${p.label} <span class="han pat-zh">${p.zh}</span></h3>
                  <div class="pat-meter" role="img" aria-label="${list.length} of ${total} expressions"><i style="--w:${((list.length / total) * 100).toFixed(1)}%"></i><span>${list.length} of ${total}</span></div></div>
                </div>
                <div class="pat-formula"><span class="pf">${p.formula[0]}</span><span class="pf-plus">+</span><span class="pf is-head">${p.formula[1]}</span></div>
                <p class="pat-desc">${p.desc}</p>
                ${p.ends ? `<div class="pat-ends">${Object.entries(p.ends).map(([ch, v]) => `<span class="pat-end"><b class="han">${ch}</b><span class="py">${v[0]}</span><span>${v[1]}</span></span>`).join("")}</div>` : ""}
                <div class="pat-words">${list.map((e) => `<a class="pat-w" href="#/expressions/${e.lesson}" title="Lesson ${e.lesson}"><span class="han">${e.w}</span><small>${e.en}</small></a>`).join("")}</div>
              </article>`;
            }).join("")}
          </div>
        </section>

        <section class="section wrap" id="lessons">
          <div class="section-head reveal">
            <div><span class="eyebrow">Lessons · 课</span><h2 class="title-lg" style="margin-top:12px">${E.LESSONS.length} lessons, three words each</h2></div>
            <p class="muted" style="max-width:430px">Each lesson ends with three quick questions, and your best score is saved here. (Lesson 6 has no expressions page.)</p>
          </div>
          <div class="x-lessons">
            ${E.LESSONS.map((L, k) => `<a class="card x-lesson reveal" href="#/expressions/${L.n}" style="--d:${(k % 4) * 50}ms">
              <div class="xl-top"><span class="xl-n">${L.n}</span><span class="han xl-zh">${L.zh}</span>${dots(L)}</div>
              <div class="xl-words">${L.items.map((e) => `<div><span class="han">${e.w}</span><small class="py">${e.py}</small></div>`).join("")}</div>
              <div class="xl-go">Open lesson ${App.icon.arrow}</div>
            </a>`).join("")}
          </div>
        </section>
      </div>`);
      this.root = root;
      return root;
    },
    mounted() {
      const pick = ["茶杯", "火车站", "运动服", "网名", "夫妻", "泳裤", "高中生", "门后"];
      const list = pick.map((w) => X().ALL.find((e) => e.w === w)).filter(Boolean);
      const stage = $(".x-stage", this.root);
      X().showcase(stage, list, { dots: true, builder: { cell: 52, rcell: 72 } });
    }
  };

  /* ======================================================================
     Lesson — one expression at a time, then the quiz
     ====================================================================== */
  const join = (py) => py.join("");
  const keepOf = (s) => s.keep.map((i) => Array.from(s.w)[i]).join("");
  const dropOf = (s) => Array.from(s.w).filter((_, i) => !s.keep.includes(i)).join("");

  /* One line saying which pattern the new word follows. */
  function patternLine(e) {
    const P = X().E.PATTERNS[e.pat], [A, B] = e.from;
    const chars = Array.from(e.w), first = chars[0], last = chars[chars.length - 1];
    const h = (c) => `<span class="han">${c}</span>`;
    switch (e.pat) {
      case "kind": return `It's a kind of <b>${B.g}</b>: the last character, ${h(last)}, says what it is.`;
      case "place": return `It's a place: ${h(last)} means ${P.ends[last][1]}.`;
      case "people": return `It's a person: ${h(last)} means ${P.ends[last][1]}.`;
      case "action": return `First the action (<b>${A.g}</b>), then what it's about (<b>${B.g}</b>).`;
      case "pair": return `A pair: <b>${A.g}</b> and <b>${B.g}</b> together in one word.`;
      case "position": return `First the thing (<b>${A.g}</b>), then where (<b>${B.g}</b>).`;
      case "helper": return `${h(first)} in front is a helper word: “${P.ends[first][1]}”.`;
    }
    return "";
  }

  /* The five narration steps that light up with the animation. */
  function stepsHTML(e) {
    const [A, B] = e.from;
    const keepLine = (s) => {
      const k = keepOf(s), d = dropOf(s);
      if (!d) return `<span class="han xs-k">${k}</span> <i>${s.g}</i> stays as it is.`;
      return `From <span class="han">${s.w}</span>, keep <span class="han xs-k">${k}</span> <i>${s.g}</i>. <span class="han xs-d">${d}</span> drops off.`;
    };
    const word = (s) => `<span class="han xs-w">${s.w}</span><span class="py">${join(s.py)}</span><span class="xs-en">${s.en}</span>`;
    const items = [
      ["You know", word(A)],
      ["You also know", word(B)],
      ["Keep one piece of each", `<span class="xs-line">${keepLine(A)}</span><span class="xs-line">${keepLine(B)}</span>`],
      ["Join them", `<span class="xs-res"><span class="han xs-w">${e.w}</span><span class="py">${e.py}</span>=<b>${e.en}</b></span><span class="xs-line muted">${patternLine(e)}</span>${X().notes(e).map((t) => `<span class="x-note">${App.icon.bulb}<span>${t}</span></span>`).join("")}`],
      ["Use it", X().sentence(e)]
    ];
    return items.map(([t, body], k) => `<li data-s="${k + 1}"><span class="xs-n">${k + 1}</span><div class="xs-text"><small>${t}</small><div>${body}</div></div></li>`).join("");
  }

  App.views.exprLesson = {
    section: "expressions",
    nav: "expr",
    title: (n) => `Lesson ${n} · Expressions`,
    render(n) {
      const E = X().E, L = X().lesson(n);
      this.L = null;
      if (!L) {
        return html(`<div class="wrap page-head"><span class="eyebrow">Expressions</span><h1 class="title-lg">There's no lesson ${n}</h1><p class="lede">${+n === 6 ? "Lesson 6 has no new-expressions page in the textbook." : "Pick a lesson from the list."}</p><div class="btn-row" style="margin-top:24px"><a class="btn btn-primary" href="#/expressions">All lessons ${App.icon.arrow}</a></div></div>`);
      }
      this.L = L;
      const i = X().lessonIndex(n), prev = E.LESSONS[i - 1], next = E.LESSONS[i + 1];
      const root = html(`<div class="page-xlesson">
        <section class="wrap page-head xl-head">
          <div class="xl-head-row">
            <div>
              <span class="eyebrow">Expressions · Lesson ${L.n}</span>
              <h1 class="title-lg xl-title" title="Three new expressions, one at a time, each built from two words you already know">${L.items.map((e) => `<span class="han">${e.w}</span>`).join('<span class="xl-sep">·</span>')}<span class="zh-sub">${L.zh}</span></h1>
            </div>
            ${pills(L.n)}
          </div>
        </section>
        <section class="wrap xs">
          <div class="xs-tabs" role="tablist" aria-label="Lesson steps">
            ${L.items.map((e, k) => `<button class="xs-tab" role="tab" data-i="${k}"><span class="xs-tab-n">${k + 1}</span><span class="han">${e.w}</span></button><span class="xs-tab-line" aria-hidden="true"></span>`).join("")}
            <button class="xs-tab" role="tab" data-i="${L.items.length}"><span class="xs-tab-n">${App.icon.check}</span>Quiz</button>
          </div>
          <div class="card xs-stage"></div>
        </section>
        <nav class="wrap x-pager">
          ${prev ? `<a class="x-pg" href="#/expressions/${prev.n}">${App.icon.prev}<span><small>Lesson ${prev.n}</small><b class="han">${prev.items.map((e) => e.w).join(" · ")}</b></span></a>` : `<a class="x-pg" href="#/expressions">${App.icon.prev}<span><small>Overview</small><b>All lessons</b></span></a>`}
          ${next ? `<a class="x-pg is-next" href="#/expressions/${next.n}"><span><small>Lesson ${next.n}</small><b class="han">${next.items.map((e) => e.w).join(" · ")}</b></span>${App.icon.next}</a>` : `<a class="x-pg is-next" href="#/expressions/review"><span><small>Finished?</small><b>Mixed review</b></span>${App.icon.next}</a>`}
        </nav>
      </div>`);
      this.root = root;
      this.next = next;
      this.cur = -1;
      this.seen = new Set();
      $$(".xs-tab", root).forEach((t) => t.addEventListener("click", () => { App.sfx.tick(); this.show(+t.dataset.i); }));
      App.onKey((ev) => {
        if (this.cur >= L.items.length) return false; // the quiz has its own keys
        if (ev.key === "ArrowRight") { this.show(this.cur + 1); return true; }
        if (ev.key === "ArrowLeft" && this.cur > 0) { this.show(this.cur - 1); return true; }
        return false;
      });
      this.show(0);
      return root;
    },

    mounted() {
      if (this.L && this.slide && this.slide.b) this.slide.b.play(this.slide.playOpts);
    },

    /* Show step k: 0–2 are the expressions, 3 is the quiz. */
    show(k) {
      const L = this.L, root = this.root, n = L.items.length;
      if (k < 0 || k > n || k === this.cur) return;
      const dir = k > this.cur ? 1 : -1;
      this.cur = k;
      this.seen.add(k);
      $$(".xs-tab", root).forEach((t) => {
        const i = +t.dataset.i;
        t.classList.toggle("is-on", i === k);
        t.classList.toggle("is-seen", this.seen.has(i) && i !== k);
        t.setAttribute("aria-selected", i === k);
      });
      const stage = $(".xs-stage", root);
      const live = stage.isConnected && stage.ownerDocument === document;
      const slide = k < n ? this.exprSlide(k) : this.quizSlide();
      this.slide = slide;
      const old = stage.firstElementChild;
      const enter = () => {
        stage.replaceChildren(slide.el);
        if (!live) return;
        slide.el.animate([{ opacity: 0, transform: `translateX(${dir * 26}px)` }, { opacity: 1, transform: "none" }], { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" });
        if (slide.b) App.later(() => slide.b.play(slide.playOpts), 250);
        const top = $(".xs-tabs", root).getBoundingClientRect().top;
        if (top < 70 || top > innerHeight * 0.6) $(".xs-tabs", root).scrollIntoView({ behavior: App.reduceMotion() ? "auto" : "smooth", block: "start" });
      };
      if (live && old && !App.reduceMotion()) {
        old.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${-dir * 22}px)` }], { duration: 170, fill: "forwards" }).finished.then(enter).catch(enter);
      } else enter();
    },

    exprSlide(k) {
      const L = this.L, e = L.items[k], n = L.items.length;
      const nextLabel = k < n - 1 ? `Next: <span class="han">${L.items[k + 1].w}</span>` : "Check yourself";
      const el = html(`<div class="xs-slide">
        <div class="xs-body">
          <div class="xs-build">
            <header class="xs-head">
              <div class="xs-title"><span class="xs-count">Expression ${k + 1} of ${n}</span>${X().patTag(e.pat)}</div>
              <div class="x-card-actions">
                <button class="btn btn-sm btn-ghost x-write" title="Write it stroke by stroke">${X().ICON.write}<span>Write</span></button>
                <button class="btn btn-sm btn-ghost x-replay" title="Play the steps again">${App.icon.replay}<span>Replay</span></button>
              </div>
            </header>
          </div>
          <ol class="xs-steps">${stepsHTML(e)}</ol>
          <footer class="xs-foot">
            ${k > 0 ? `<button class="btn btn-ghost xs-prev">${App.icon.prev} <span class="han">${L.items[k - 1].w}</span></button>` : `<span></span>`}
            <span class="xs-keys muted"><kbd>←</kbd><kbd>→</kbd> words</span>
            <button class="btn btn-primary xs-next">${nextLabel} ${App.icon.arrow}</button>
          </footer>
        </div>
      </div>`);
      const small = window.matchMedia("(max-width: 640px)").matches;
      const b = X().builder(e, small ? { cell: 42, rcell: 62 } : { cell: 56, rcell: 84 });
      b.prime();
      $(".xs-build", el).appendChild(b.el);
      const steps = $$(".xs-steps li", el);
      const onStep = (s) => steps.forEach((li) => {
        const v = +li.dataset.s;
        li.classList.toggle("is-on", v === s);
        li.classList.toggle("is-done", v < s);
      });
      onStep(0);
      const playOpts = { staged: true, onStep };
      $(".x-replay", el).addEventListener("click", () => { App.sfx.tick(); b.play(playOpts); });
      $(".x-write", el).addEventListener("click", () => { App.sfx.tick(); onStep(6); b.write(); });
      $(".xs-next", el).addEventListener("click", () => { App.sfx.tick(); this.show(k + 1); });
      const pv = $(".xs-prev", el);
      if (pv) pv.addEventListener("click", () => { App.sfx.tick(); this.show(k - 1); });
      return { el, b, playOpts };
    },

    quizSlide() {
      const L = this.L, root = this.root, next = this.next, n = L.items.length;
      const el = html(`<div class="xs-slide xs-quiz">
        <header class="xs-head">
          <div class="xs-title"><span class="xs-count">Check yourself</span><h3 class="title-md">Three quick questions</h3></div>
          <p class="muted xs-quiz-help">Build one word, pick the meaning of one, and put one in a sentence. Keys: <kbd>1</kbd>–<kbd>4</kbd> answer, <kbd>Enter</kbd> next.</p>
        </header>
        <div class="x-quiz-host"></div>
        <footer class="xs-foot"><button class="btn btn-ghost xs-prev">${App.icon.prev} <span class="han">${L.items[n - 1].w}</span></button><span></span><span></span></footer>
      </div>`);
      $(".xs-prev", el).addEventListener("click", () => { App.sfx.tick(); this.show(n - 1); });
      X().quiz($(".x-quiz-host", el), X().questions(L), {
        nextHref: next ? `#/expressions/${next.n}` : "#/expressions/review",
        nextLabel: next ? `Lesson ${next.n}` : "Mixed review",
        onDone: (score, total) => {
          App.store.recordExpr(L.n, score, total);
          const nav = $(".lesson-pills", root);
          if (nav) nav.outerHTML = pills(L.n);
        }
      });
      return { el };
    }
  };

  /* ======================================================================
     Mixed review
     ====================================================================== */
  App.views.exprReview = {
    section: "expressions",
    nav: "expr-review",
    title: "Review · Expressions",
    render() {
      const root = html(`<div class="page-xreview">
        <section class="wrap page-head">
          <span class="eyebrow">Expressions · Review</span>
          <h1 class="title-lg">Mixed review <span class="zh-sub">复习</span></h1>
          <p class="lede">Ten questions from all fourteen lessons, in a new random order every round. Build words, pick meanings and fill gaps.</p>
        </section>
        <section class="wrap section" style="padding-top:28px"><div class="x-quiz-host"></div></section>
      </div>`);
      const host = $(".x-quiz-host", root);
      const round = () => {
        const all = X().E.LESSONS.flatMap((L) => X().questions(L).map((q) => Object.assign(q, { showLesson: true })));
        // one question per lesson at most, then fill up
        const picked = shuffle(X().E.LESSONS).slice(0, 10).map((L) => shuffle(all.filter((q) => q.L === L))[0]);
        X().quiz(host, shuffle(picked), { restart: round, nextHref: "#/expressions", nextLabel: "All lessons" });
      };
      round();
      return root;
    }
  };
})();
