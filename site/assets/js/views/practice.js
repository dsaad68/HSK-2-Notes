/* ==========================================================================
   Exam sets — list + interactive sheet (Learn mode / Exam mode)
   ========================================================================== */
(function () {
  "use strict";
  const H = window.HSK;
  const { $, $$, html, sleep } = App;
  const I = App.icon;
  const X = () => App.exam;
  const LETTERS = ["A", "B", "C", "D"];

  function badge(n) {
    const s = App.store.state.sets[n];
    if (!s) return `<span class="score-badge">Not started</span>`;
    if (s.best === 3) return `<span class="score-badge is-perfect">${I.check} 3 / 3</span>`;
    return `<span class="score-badge is-partial">Best ${s.best} / 3</span>`;
  }

  /* ---------------- list ---------------- */
  App.views.practice = {
    nav: "practice",
    title: "Exam sets",
    render() {
      const root = html(`<div class="wrap">
        <header class="page-head">
          <span class="eyebrow">练 · Exam sets</span>
          <h1 class="title-lg">HSK Exam Writing Section, Part 1<span class="zh-sub">根据部件组字</span></h1>
          <p class="lede">Every set from your practice exams, rebuilt to be interactive. Click a question, then click an option, or drag the option straight into the gap.</p>
        </header>
        <div class="tipbar reveal"><div class="tip-ico">${I.bulb}</div>
          <p><b>Exam strategy:</b> in all 15 sets, A, B and C are each the answer exactly once, and D (十) only belongs to the example 什么. If you know two answers, the third is the one left over.</p></div>
        <div class="sets"></div>
      </div>`);
      const grid = $(".sets", root);
      H.SETS.forEach((S, i) => {
        const card = html(`<a class="set-card reveal" href="#/practice/${S.n}" style="--d:${(i % 3) * 70}ms">
          <div class="set-card-head"><h3>Set ${S.n} <span>/ 15</span></h3>${badge(S.n)}</div>
          <div class="set-opts"></div>
          <div class="set-words">${S.qs.map((q) => `<span class="py" style="font-family:var(--font-ui);font-size:14px;letter-spacing:0">${q.py.join(" ")}</span>`).join("")}</div>
        </a>`);
        LETTERS.forEach((L) => {
          const o = html(`<div class="set-opt"><b>${L}</b><div class="g"></div></div>`);
          App.compInk($(".g", o), App.comp(S.opts[L]), {});
          $(".set-opts", card).appendChild(o);
        });
        grid.appendChild(card);
      });
      return root;
    }
  };

  /* ---------------- one set: fits on one screen, explanations in a side panel ---------------- */
  App.views.set = {
    nav: "practice",
    title(n) { return "Exam set " + n; },

    render(nStr) {
      const n = +nStr;
      const S = H.SETS[n - 1];
      if (!S) return html(`<div class="wrap page-head"><h1 class="title-lg">Set not found</h1><p class="lede"><a href="#/practice" style="color:var(--accent)">All sets</a></p></div>`);
      const mode = App.store.setting("examMode") || "learn";
      const root = html(`<div class="wrap exam-page">
        <div class="exam-top">
          <div><span class="eyebrow">Exam set ${n} of 15</span><h1 class="exam-title">HSK Exam Writing Section <span>· Part 1</span></h1></div>
          <nav class="set-dots" aria-label="Sets">${H.SETS.map((s) => {
            const st = App.store.state.sets[s.n];
            return `<a href="#/practice/${s.n}" class="${s.n === n ? "is-current" : ""} ${st && st.best === 3 ? "is-done" : ""}" aria-label="Set ${s.n}">${s.n}</a>`;
          }).join("")}</nav>
        </div>
        <div class="exam-grid">
          <div class="card sheet">
            <div class="sheet-instr"><span class="sq"></span><div><div class="han">书写 第一部分：根据部件组字。</div><p>HSK Exam Writing Section, Part 1: form Chinese characters using the given components.</p></div></div>
            <div class="opts" role="group" aria-label="Components"></div>
            <div class="qrows"></div>
            <div class="sheet-toolbar">
              <div class="seg" role="group" aria-label="Mode">
                <button data-v="learn" aria-pressed="${mode === "learn"}">Learn mode</button>
                <button data-v="exam" aria-pressed="${mode === "exam"}">Exam mode</button>
              </div>
              <div class="btn-row">
                <button class="btn btn-sm btn-ghost" data-orig>${I.image} Original page</button>
                <button class="btn btn-sm btn-ghost" data-reset>${I.reset} Reset</button>
                ${mode === "exam" ? `<button class="btn btn-sm btn-accent" data-submit disabled>Check answers</button>` : ""}
              </div>
            </div>
          </div>
          <aside class="card exam-side" aria-live="polite">
            <div class="side-head"><h3>${mode === "exam" ? "Results" : "Explanations"}</h3>
              <div class="side-nav">${n > 1 ? `<a class="ctrl" href="#/practice/${n - 1}" aria-label="Previous set">${I.prev}</a>` : ""}${n < 15 ? `<a class="ctrl" href="#/practice/${n + 1}" aria-label="Next set">${I.next}</a>` : ""}</div></div>
            <div class="side-feed">
              <div class="side-item is-tip">
                <b>How to answer</b>
                <ol><li>Read the pinyin and recognise the word.</li><li>Ask what the missing character is about.</li><li>Pick the radical with that meaning.</li><li>Eliminate: A, B and C are each used once; D (十) is only the example.</li></ol>
                <div class="keys"><span><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> question</span><span><kbd>A</kbd>–<kbd>D</kbd> answer</span><span><kbd>H</kbd> hint</span><span>or drag &amp; drop</span></div>
                <p class="side-note">Stuck? Press <b>Hint</b> on a question to see where its missing piece goes.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>`);

      App.seg($(".seg", root), (v) => { App.store.setting("examMode", v); App.refresh(); });
      $("[data-reset]", root).addEventListener("click", () => App.refresh());
      $("[data-orig]", root).addEventListener("click", () => App.lightbox(`assets/scans/questions/${n}.webp`, `Original exam page · set ${n}`));
      this.setup(root, S, mode);
      return root;
    },

    setup(root, S, mode) {
      const alive = App.alive();
      const st = { active: 0, solved: [false, false, false], placed: [null, null, null], wrongs: [new Set(), new Set(), new Set()], first: [true, true, true], busy: false, done: false };
      const optsEl = $(".opts", root), rowsEl = $(".qrows", root), feed = $(".side-feed", root);
      const submitBtn = $("[data-submit]", root);
      const opts = {};
      const hintEls = [null, null, null];

      /* side panel helpers */
      const push = (node) => {
        feed.prepend(node);
        feed.scrollTo({ top: 0, behavior: "smooth" });
        if (!App.reduceMotion()) node.animate([{ opacity: 0, transform: "translateY(-10px)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" });
      };
      const qHead = (q) => `<div class="side-q"><b>${q.no}.</b> <span class="han">${q.word}</span> <span class="py">${q.py.join(" ")}</span> · ${q.en}</div>`;
      const explain = (i, verdict) => {
        const q = S.qs[i];
        const el = html(`<div class="side-item${verdict ? " is-" + verdict : ""}">${qHead(q)}<div class="explain-inner"></div></div>`);
        X().fillExplain({ q, explain: $(".explain-inner", el) }, App.comp(S.opts[q.ans]));
        if (hintEls[i]) { hintEls[i].remove(); hintEls[i] = null; }
        push(el);
      };
      const hint = (i, comp) => {
        const q = S.qs[i];
        const body = `${qHead(q)}<div class="hint-line">${X().hintFor(q, comp)}</div>`;
        if (hintEls[i]) { hintEls[i].innerHTML = body; feed.prepend(hintEls[i]); X().shake(hintEls[i]); return; }
        hintEls[i] = html(`<div class="side-item is-hint">${body}</div>`);
        push(hintEls[i]);
      };

      // example row (什么 → D)
      const ex = X().questionRow(H.EXAMPLE_Q, { example: true });
      X().fillSlot(ex.tiles, App.comp("ten"), true, "correct");
      X().stamp(ex.ans, "D", "is-example");
      rowsEl.appendChild(ex.row);

      const rows = S.qs.map((q, i) => {
        const r = X().questionRow(q);
        r.row.addEventListener("click", (e) => { if (!e.target.closest("a, .speak")) setActive(i); });
        r.row.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActive(i); } });
        rowsEl.appendChild(r.row);
        return r;
      });

      LETTERS.forEach((L) => {
        const b = X().optionButton(L, App.comp(S.opts[L]));
        opts[L] = b;
        X().enableDrag(b, {
          onClick: () => answer(st.active, L, $(".opt-glyph", b)),
          onDrop: (rowEl, ghost) => { const i = rows.findIndex((r) => r.row === rowEl); return i >= 0 ? answer(i, L, ghost) : Promise.resolve(); }
        });
        optsEl.appendChild(b);
      });

      const sync = () => {
        rows.forEach((r, i) => r.row.classList.toggle("is-active", i === st.active && !st.done));
        LETTERS.forEach((L) => {
          const b = opts[L];
          b.classList.toggle("is-wrong", mode === "learn" && st.wrongs[st.active].has(L) && !st.solved[st.active]);
          const used = mode === "learn" ? S.qs.some((q, i) => st.solved[i] && q.ans === L) : st.placed.includes(L);
          b.classList.toggle("is-used", used);
        });
        if (submitBtn) submitBtn.disabled = st.done || st.placed.some((p) => !p);
      };
      const setActive = (i) => { if (st.done) return; st.active = i; sync(); };
      const nextOpen = () => {
        for (let k = 1; k <= 3; k++) { const j = (st.active + k) % 3; if (mode === "learn" ? !st.solved[j] : !st.placed[j]) return j; }
        return -1;
      };

      const answer = async (i, L, fromEl) => {
        if (st.busy || st.done || i < 0) return;
        if (mode === "learn" && (st.solved[i] || st.wrongs[i].has(L))) { setActive(i); return; }
        st.busy = true;
        setActive(i);
        const ctx = rows[i], q = S.qs[i], comp = App.comp(S.opts[L]), correct = L === q.ans;
        opts[L].classList.add("is-ready");
        try {
          if (mode === "learn") {
            App.sfx.tick();
            const ov = await X().fly(fromEl, ctx.tiles, comp, correct, "correct");
            if (!alive()) return;
            if (correct) {
              X().fillSlot(ctx.tiles, comp, true, "correct"); ov.remove();
              X().bloom(ctx.tiles);
              X().stamp(ctx.ans, L, "is-correct");
              App.sfx.correct();
              ctx.row.classList.add("is-solved");
              st.solved[i] = true;
              App.store.recordComp(comp.id, st.first[i]);
              explain(i, st.first[i] ? "good" : "");
              const nx = nextOpen();
              if (nx >= 0) st.active = nx;
              sync();
              if (st.solved.every(Boolean)) finish(st.first.filter(Boolean).length);
            } else {
              X().shake(ctx.tiles.el);
              App.sfx.wrong();
              st.wrongs[i].add(L);
              if (st.first[i]) App.store.recordComp(S.opts[q.ans], false);
              st.first[i] = false;
              hint(i, comp);
              await X().fallAway(ov);
              if (!alive()) return;
              ctx.tiles.gap.classList.remove("is-hidden");
              sync();
            }
          } else {
            X().fillSlot(ctx.tiles, null);
            const ov = await X().fly(fromEl, ctx.tiles, comp, correct, "neutral");
            if (!alive()) return;
            X().fillSlot(ctx.tiles, comp, correct, "neutral"); ov.remove();
            X().stamp(ctx.ans, L);
            App.sfx.stamp();
            st.placed[i] = L;
            const nx = nextOpen();
            if (nx >= 0) st.active = nx;
            sync();
            if (submitBtn && !submitBtn.disabled) submitBtn.animate([{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }], { duration: 500, easing: "ease-out" });
          }
        } finally {
          opts[L].classList.remove("is-ready");
          st.busy = false;
        }
      };

      const submit = async () => {
        if (st.done || st.placed.some((p) => !p)) return;
        st.done = true; sync();
        let score = 0;
        for (let i = 0; i < 3; i++) {
          const ctx = rows[i], q = S.qs[i], L = st.placed[i], ok = L === q.ans;
          await sleep(420); if (!alive()) return;
          if (ok) {
            score++;
            ctx.tiles.slot.className = "slot is-correct";
            X().bloom(ctx.tiles);
            X().stamp(ctx.ans, L, "is-correct");
            App.sfx.correct();
          } else {
            X().stamp(ctx.ans, L, "is-wrong");
            App.sfx.wrong();
            X().shake(ctx.tiles.el);
            await sleep(650); if (!alive()) return;
            const comp = App.comp(S.opts[q.ans]);
            X().fillSlot(ctx.tiles, null);
            const ov = await X().fly($(".opt-glyph", opts[q.ans]), ctx.tiles, comp, true, "correct");
            if (!alive()) return;
            X().fillSlot(ctx.tiles, comp, true, "correct"); ov.remove();
            X().bloom(ctx.tiles);
          }
          ctx.row.classList.add("is-solved");
          App.store.recordComp(S.opts[q.ans], ok);
        }
        for (let i = 2; i >= 0; i--) explain(i, st.placed[i] === S.qs[i].ans ? "good" : "bad");
        finish(score);
      };
      if (submitBtn) submitBtn.addEventListener("click", submit);

      const finish = (score) => {
        st.done = true; sync();
        App.store.recordSet(S.n, score, mode);
        const dot = $(`.set-dots a[href="#/practice/${S.n}"]`, root);
        if (dot && score === 3) dot.classList.add("is-done");
        const msgs = {
          3: ["Perfect! 太棒了！", "All three right on the first try."],
          2: ["Nearly there. 很好！", "One slipped. Read its explanation below, then try the set again."],
          1: ["Keep going. 加油！", "Read the explanations below, then retry. The radicals' meanings are the key."],
          0: ["Keep going. 加油！", "Start from the meaning of each word, then match it to a radical."]
        };
        const [t, p] = msgs[score];
        const card = html(`<div class="side-item side-result">
          <div class="big">${score}<small>/3</small></div>
          <div><h4>${t}</h4><p>${p}${mode === "learn" ? " Scored on first attempts." : ""}</p></div>
          <div class="btn-row">
            <button class="btn btn-sm" data-again>${I.replay} Try again</button>
            ${S.n < 15 ? `<a class="btn btn-sm btn-primary" href="#/practice/${S.n + 1}">Next set ${I.arrow}</a>` : `<a class="btn btn-sm btn-primary" href="#/challenge">Challenge ${I.arrow}</a>`}
          </div>
        </div>`);
        $("[data-again]", card).addEventListener("click", () => App.refresh());
        App.later(() => {
          push(card);
          if (score === 3) { App.sfx.win(); App.later(() => App.burstAt($(".big", card), 1.1), 250); }
        }, 450);
      };

      App.onKey((e) => {
        const k = e.key.toLowerCase();
        if (["1", "2", "3"].includes(k)) { setActive(+k - 1); rows[+k - 1].row.focus({ preventScroll: true }); return true; }
        if (["a", "b", "c", "d"].includes(k)) { const L = k.toUpperCase(); answer(st.active, L, $(".opt-glyph", opts[L])); return true; }
        if (k === "h" && !st.done) { const r = rows[st.active]; if (r.toggleHint && !st.solved[st.active]) r.toggleHint(); return true; }
        if (e.key === "Enter" && submitBtn && !submitBtn.disabled) { submit(); return true; }
        return false;
      });
      sync();
    }
  };
})();
