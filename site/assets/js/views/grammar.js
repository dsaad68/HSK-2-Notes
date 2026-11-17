/* ==========================================================================
   Grammar — overview, lesson page (one point at a time, then a quiz), review
   ========================================================================== */
(function () {
  "use strict";
  const { $, $$, html, shuffle, sleep } = App;
  const Gm = () => App.grammar;
  const best = (n) => ((App.store.state.grammar || {})[n] || null);
  const lessonName = (L) => L.zh ? `<span class="han">${L.zh}</span>` : L.points.map((p) => `<span class="han">${p.short}</span>`).join('<span class="xl-sep">·</span>');

  const dots = (L) => {
    const b = best(L.n), total = Gm().lessonQuestions(L).length;
    if (!b) return `<span class="xl-new">New</span>`;
    return `<span class="xl-dots" aria-label="Best ${b.best} of ${total}">${Array.from({ length: total }, (_, k) => `<i class="${k < b.best ? "on" : ""}"></i>`).join("")}</span>`;
  };
  const pills = (cur) => `<nav class="lesson-pills" aria-label="Lessons">${Gm().LESSONS.map((L) => {
    const b = best(L.n), done = b && b.best === Gm().lessonQuestions(L).length;
    return `<a href="#/grammar/${L.n}" class="${L.n === cur ? "is-on" : ""}${done ? " is-done" : ""}" title="Lesson ${L.n}">${L.n}</a>`;
  }).join("")}</nav>`;

  /* ======================================================================
     Overview
     ====================================================================== */
  App.views.gram = {
    section: "grammar",
    nav: "gram",
    title: "Grammar",
    render() {
      const { LESSONS, POINTS } = Gm(), st = Gm().stats();
      const next = LESSONS.find((L) => !best(L.n)) || LESSONS[0];
      const nq = POINTS.reduce((a, p) => a + p.quiz.length, 0);
      const root = html(`<div class="page-gram">
        <section class="hero wrap g-hero">
          <div class="hero-grid">
            <div class="hero-copy">
              <span class="eyebrow">HSK 2 · 语法 Grammar</span>
              <h1 class="title-xl">Sentence patterns, <em>one at a time</em>.</h1>
              <p class="lede">The grammar notes from each textbook lesson. Watch each pattern build itself, read the textbook's examples, then answer questions taken from the textbook dialogues.</p>
              <div class="btn-row">
                <a class="btn btn-primary" href="#/grammar/${next.n}">${st.tried ? "Continue with" : "Start"} lesson ${next.n} ${App.icon.arrow}</a>
                <a class="btn" href="#/grammar/review">Mixed review</a>
              </div>
              <div class="hero-stats">
                <div><b>${LESSONS.length}</b><span>lessons · 课</span></div>
                <div><b>${POINTS.length}</b><span>patterns · 语法点</span></div>
                <div><b>${nq}</b><span>practice questions</span></div>
              </div>
            </div>
            <div class="g-stage card" aria-label="Animated grammar patterns">
              <div class="g-stage-top"><span class="g-stage-name"></span><a class="g-stage-go" href="#/grammar">Open ${App.icon.arrow}</a></div>
              <div class="g-stage-vis"></div>
              <div class="g-stage-tabs" role="tablist">${POINTS.map((p, k) => `<button role="tab" aria-label="${p.en}"><span class="han">${p.short}</span></button>`).join("")}</div>
            </div>
          </div>
        </section>

        ${LESSONS.map((L) => `
        <section class="section wrap">
          <div class="section-head reveal">
            <div><span class="eyebrow">Lesson ${L.n} · 第${"一二三四五六七八九十"[L.n - 1]}课</span><h2 class="title-lg" style="margin-top:12px">${L.zh ? `<span class="han">${L.zh}</span>` : `Lesson ${L.n}`}</h2>${L.en ? `<p class="muted" style="margin-top:6px">${L.en}</p>` : ""}</div>
            <div class="g-lhead">${dots(L)}<a class="btn btn-sm" href="#/grammar/${L.n}">Study lesson ${L.n} ${App.icon.arrow}</a></div>
          </div>
          <div class="g-points">
            ${L.points.map((p, k) => `<a class="card g-pt reveal" href="#/grammar/${L.n}/${k + 1}" style="--d:${k * 60}ms">
              <div class="g-pt-top"><span class="g-pt-n">${k + 1}</span><span class="han g-pt-zh">${p.zh}</span></div>
              <h3 class="title-md">${p.en}</h3>
              ${p.formulas.map(Gm().formula).join("")}
              <div class="g-sent is-sm">${Gm().chips(Gm().parse(p.examples[0].zh))}</div>
              <p class="g-pt-en">${p.examples[0].en}</p>
              <span class="xl-go">Learn it ${App.icon.arrow}</span>
            </a>`).join("")}
          </div>
        </section>`).join("")}
      </div>`);
      this.root = root;
      return root;
    },
    mounted() { this.stage($(".g-stage", this.root)); },

    /* Hero: play each pattern's visual in turn. */
    stage(el) {
      const alive = App.alive(), P = Gm().POINTS;
      const vis = $(".g-stage-vis", el), name = $(".g-stage-name", el), go = $(".g-stage-go", el), tabs = $$(".g-stage-tabs button", el);
      let i = 0, run = 0;
      tabs.forEach((t, k) => t.addEventListener("click", () => { App.sfx.tick(); i = k; loop(); }));
      const loop = async () => {
        const my = ++run, ok = () => alive() && my === run;
        while (ok()) {
          const p = P[i];
          tabs.forEach((t, k) => { t.classList.toggle("is-on", k === i); t.setAttribute("aria-selected", k === i); });
          name.innerHTML = `<span class="han">${p.zh}</span> ${p.en}`;
          go.href = `#/grammar/${p.L.n}/${p.i + 1}`;
          const v = Gm().visual(p);
          v.prime();
          vis.replaceChildren(v.el);
          v.el.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" });
          await sleep(200); if (!ok()) return;
          await v.play({});
          if (!ok()) return;
          await sleep(2600); if (!ok()) return;
          i = (i + 1) % P.length;
        }
      };
      App.whenVisible(el, loop);
      App.onCleanup(() => { run++; });
    }
  };

  /* ======================================================================
     Lesson — one grammar point at a time, then the quiz
     ====================================================================== */
  App.views.gramLesson = {
    section: "grammar",
    nav: "gram",
    title: (n) => `Lesson ${n} · Grammar`,
    render(n, start) {
      const { LESSONS } = Gm(), L = Gm().lesson(n);
      this.L = null;
      if (!L) return html(`<div class="wrap page-head"><span class="eyebrow">Grammar</span><h1 class="title-lg">Lesson ${n} isn't here yet</h1><p class="lede">So far the notes cover lessons ${LESSONS.map((x) => x.n).join(" and ")}.</p><div class="btn-row" style="margin-top:24px"><a class="btn btn-primary" href="#/grammar">All lessons ${App.icon.arrow}</a></div></div>`);
      this.L = L;
      const i = LESSONS.indexOf(L), prev = LESSONS[i - 1], next = LESSONS[i + 1];
      const root = html(`<div class="page-xlesson page-glesson">
        <section class="wrap page-head xl-head">
          <div class="xl-head-row">
            <div>
              <span class="eyebrow">Grammar · Lesson ${L.n}</span>
              <h1 class="title-lg xl-title">${lessonName(L)}${L.en ? `<span class="zh-sub">${L.en}</span>` : ""}</h1>
            </div>
            ${pills(L.n)}
          </div>
        </section>
        <section class="wrap xs">
          <div class="xs-tabs" role="tablist" aria-label="Lesson steps">
            ${L.points.map((p, k) => `<button class="xs-tab${(best("p-" + p.id) || {}).best === 5 ? " is-mastered" : ""}" role="tab" data-i="${k}"><span class="xs-tab-n">${k + 1}</span><span class="han">${p.short}</span></button><span class="xs-tab-line" aria-hidden="true"></span>`).join("")}
            <button class="xs-tab" role="tab" data-i="${L.points.length}"><span class="xs-tab-n">${App.icon.check}</span>Quiz</button>
          </div>
          <div class="card xs-stage"></div>
        </section>
        <nav class="wrap x-pager">
          ${prev ? `<a class="x-pg" href="#/grammar/${prev.n}">${App.icon.prev}<span><small>Lesson ${prev.n}</small><b>${prev.points.map((p) => p.short).join(" · ")}</b></span></a>` : `<a class="x-pg" href="#/grammar">${App.icon.prev}<span><small>Overview</small><b>All lessons</b></span></a>`}
          ${next ? `<a class="x-pg is-next" href="#/grammar/${next.n}"><span><small>Lesson ${next.n}</small><b>${next.points.map((p) => p.short).join(" · ")}</b></span>${App.icon.next}</a>` : `<a class="x-pg is-next" href="#/grammar/review"><span><small>Finished?</small><b>Mixed review</b></span>${App.icon.next}</a>`}
        </nav>
      </div>`);
      this.root = root;
      this.next = next;
      this.cur = -1;
      this.seen = new Set();
      $$(".xs-tab", root).forEach((t) => t.addEventListener("click", () => { App.sfx.tick(); this.show(+t.dataset.i); }));
      App.onKey((ev) => {
        if (this.cur >= L.points.length) return false;
        if (ev.key === "ArrowRight") { this.show(this.cur + 1); return true; }
        if (ev.key === "ArrowLeft" && this.cur > 0) { this.show(this.cur - 1); return true; }
        return false;
      });
      const k0 = Math.min(Math.max((+start || 1) - 1, 0), L.points.length);
      this.show(k0);
      return root;
    },

    mounted() {
      const s = this.slide;
      if (this.L && s && s.v && s.v.layout) s.v.layout();
    },

    show(k) {
      const L = this.L, root = this.root, n = L.points.length;
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
      const slide = k < n ? this.pointSlide(k) : this.quizSlide();
      this.slide = slide;
      const old = stage.firstElementChild;
      const enter = () => {
        stage.replaceChildren(slide.el);
        if (!live) return;
        slide.el.animate([{ opacity: 0, transform: `translateX(${dir * 26}px)` }, { opacity: 1, transform: "none" }], { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" });
        if (slide.v && slide.v.layout) slide.v.layout();
        const top = $(".xs-tabs", root).getBoundingClientRect().top;
        if (top < 70 || top > innerHeight * 0.6) $(".xs-tabs", root).scrollIntoView({ behavior: App.reduceMotion() ? "auto" : "smooth", block: "start" });
      };
      if (live && old && !App.reduceMotion()) {
        old.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${-dir * 22}px)` }], { duration: 170, fill: "forwards" }).finished.then(enter).catch(enter);
      } else enter();
    },

    pbest(p) { return best("p-" + p.id); },

    pointSlide(k) {
      const L = this.L, p = L.points[k], n = L.points.length;
      const nextLabel = k < n - 1 ? `Next: <span class="han">${L.points[k + 1].short}</span>` : "Check yourself";
      const el = html(`<div class="xs-slide g-slide">
        <header class="g-slide-head">
          <span class="xs-count">Pattern ${k + 1} of ${n}</span>
          <div class="g-slide-title">
            <h2 class="title-md g-slide-en">${p.en}</h2>
            <span class="g-slide-zh"><span class="han py-font">${p.zh}</span></span>
          </div>
        </header>
        <section class="g-part g-pattern">
          <h3 class="g-h"><span class="g-h-n">1</span>The pattern</h3>
          <div class="g-pattern-box">
            <div class="g-formulas">${p.formulas.map(Gm().formula).join("")}</div>
            <p class="g-rule-text">${p.rule}</p>
            <div class="x-note">${App.icon.bulb}<span>${p.note}</span></div>
          </div>
        </section>
        <h3 class="g-h g-part-h"><span class="g-h-n">2</span>See it work <span class="muted">· the steps light up as it plays</span></h3>
        <div class="xs-body">
          <div class="xs-build g-build">
            <header class="xs-head"><span></span>
              <div class="x-card-actions"><button class="btn btn-sm btn-primary g-play" title="Play the steps">${App.icon.play}<span>Play</span></button></div>
            </header>
          </div>
          <ol class="xs-steps">${p.steps.map(([t, body], i) => `<li data-s="${i + 1}"><span class="xs-n">${i + 1}</span><div class="xs-text"><small>${t}</small><div>${body}</div></div></li>`).join("")}</ol>
        </div>
        <section class="g-part g-exs">
          <h3 class="g-h"><span class="g-h-n">3</span>From the textbook <span class="muted">· tap ${App.icon.speaker} to listen</span></h3>
          <ol class="g-ex-list">${p.examples.map(Gm().example).join("")}</ol>
        </section>
        <section class="g-part g-check">
          <h3 class="g-h"><span class="g-h-n">4</span>Check yourself <span class="muted">· five questions on <span class="han">${p.short}</span>${this.pbest(p) ? ` · best ${this.pbest(p).best}/5` : ""}</span></h3>
          <div class="x-quiz-host"></div>
        </section>
        <footer class="xs-foot">
          ${k > 0 ? `<button class="btn btn-ghost xs-prev">${App.icon.prev} <span class="han">${L.points[k - 1].short}</span></button>` : `<span></span>`}
          <span class="xs-keys muted"><kbd>←</kbd><kbd>→</kbd> patterns</span>
          <button class="btn btn-primary xs-next">${nextLabel} ${App.icon.arrow}</button>
        </footer>
      </div>`);
      Gm().rubyfy($(".g-pattern-box", el));
      const v = Gm().visual(p);
      v.prime();
      $(".g-build", el).appendChild(v.el);
      const steps = $$(".xs-steps li", el);
      const onStep = (s) => steps.forEach((li) => {
        const x = +li.dataset.s;
        li.classList.toggle("is-on", x === s);
        li.classList.toggle("is-done", x < s);
      });
      onStep(0);
      const playOpts = { onStep };
      const nextP = k < n - 1;
      App.expr.quiz($(".g-check .x-quiz-host", el), Gm().questions(p, "practice"), {
        nextHref: `#/grammar/${L.n}/${k + 2}`,
        nextLabel: nextP ? `Next: ${L.points[k + 1].short}` : "Lesson quiz",
        perfectMsg: "Perfect! You've got this pattern.",
        retryMsg: "Read the pattern and the examples again, then try once more.",
        onDone: (score, total) => App.store.recordGrammar("p-" + p.id, score, total)
      });
      const playBtn = $(".g-play", el);
      playBtn.addEventListener("click", () => {
        App.sfx.tick();
        playBtn.classList.replace("btn-primary", "btn-ghost");
        playBtn.innerHTML = `${App.icon.replay}<span>Replay</span>`;
        v.play(playOpts);
      });
      $(".xs-next", el).addEventListener("click", () => { App.sfx.tick(); this.show(k + 1); });
      const pv = $(".xs-prev", el);
      if (pv) pv.addEventListener("click", () => { App.sfx.tick(); this.show(k - 1); });
      return { el, v, playOpts };
    },

    quizSlide() {
      const L = this.L, root = this.root, next = this.next, n = L.points.length;
      const qs = Gm().lessonQuestions(L);
      const el = html(`<div class="xs-slide xs-quiz">
        <header class="xs-head">
          <div class="xs-title"><span class="xs-count">Check yourself</span><h3 class="title-md">${qs.length} questions from the textbook dialogues</h3></div>
          <p class="muted xs-quiz-help">Two for each pattern. Keys: <kbd>1</kbd>–<kbd>5</kbd> answer, <kbd>Backspace</kbd> undo, <kbd>Enter</kbd> next.</p>
        </header>
        <div class="x-quiz-host"></div>
        <footer class="xs-foot"><button class="btn btn-ghost xs-prev">${App.icon.prev} <span class="han">${L.points[n - 1].short}</span></button><span></span><span></span></footer>
      </div>`);
      $(".xs-prev", el).addEventListener("click", () => { App.sfx.tick(); this.show(n - 1); });
      App.expr.quiz($(".x-quiz-host", el), qs, {
        nextHref: next ? `#/grammar/${next.n}` : "#/grammar/review",
        nextLabel: next ? `Lesson ${next.n}` : "Mixed review",
        perfectMsg: "Perfect! Every pattern in the right place.",
        retryMsg: "Have another look at the patterns above, then try again.",
        onDone: (score, total) => {
          App.store.recordGrammar(L.n, score, total);
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
  App.views.gramReview = {
    section: "grammar",
    nav: "gram-review",
    title: "Review · Grammar",
    render() {
      const P = Gm().POINTS;
      const root = html(`<div class="page-xreview">
        <section class="wrap page-head">
          <span class="eyebrow">Grammar · Review</span>
          <h1 class="title-lg">Mixed review <span class="zh-sub">复习</span></h1>
          <p class="lede">Ten questions covering all ${P.length} patterns, in a new random order every round.</p>
        </section>
        <section class="wrap section" style="padding-top:28px"><div class="x-quiz-host"></div></section>
      </div>`);
      const host = $(".x-quiz-host", root);
      const round = () => {
        // every pattern at least once, then fill up to ten
        const per = shuffle(P).map((p) => shuffle(Gm().questions(p, true)));
        const picked = per.map((qs) => qs[0]);
        const rest = shuffle(per.flatMap((qs) => qs.slice(1)));
        const qs = shuffle(picked.concat(rest.slice(0, 10 - picked.length))).map((q) => Object.assign(q, { showLesson: true }));
        App.expr.quiz(host, qs, { restart: round, nextHref: "#/grammar", nextLabel: "All lessons", perfectMsg: "Perfect! Every pattern in the right place.", retryMsg: "Go back to the lessons for the patterns you missed, then try again." });
      };
      round();
      return root;
    }
  };
})();
