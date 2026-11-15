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
          <h1 class="title-lg">15 sets of Questions 25–27<span class="zh-sub">根据部件组字</span></h1>
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

  /* ---------------- one set ---------------- */
  App.views.set = {
    nav: "practice",
    title(n) { return "Exam set " + n; },

    render(nStr) {
      const n = +nStr;
      const S = H.SETS[n - 1];
      if (!S) return html(`<div class="wrap page-head"><h1 class="title-lg">Set not found</h1><p class="lede"><a href="#/practice" style="color:var(--accent)">All sets</a></p></div>`);
      const mode = App.store.setting("examMode") || "learn";
      const root = html(`<div class="wrap" style="padding-bottom:60px">
        <div class="exam-top">
          <div><span class="eyebrow">Exam set ${n} of 15</span><h1 class="title-md" style="margin-top:10px">第25–27题 <span>· form the characters</span></h1></div>
          <nav class="set-dots" aria-label="Sets">${H.SETS.map((s) => {
            const st = App.store.state.sets[s.n];
            return `<a href="#/practice/${s.n}" class="${s.n === n ? "is-current" : ""} ${st && st.best === 3 ? "is-done" : ""}" aria-label="Set ${s.n}">${s.n}</a>`;
          }).join("")}</nav>
        </div>
        <div class="card sheet">
          <div class="sheet-instr"><span class="sq"></span><div><div class="han">第25–27题：根据部件组字。</div><p>Questions 25–27: Form Chinese characters using the given components.</p></div></div>
          <div class="opts" role="group" aria-label="Components"></div>
          <div class="qrows"></div>
          <div class="sheet-toolbar">
            <div class="seg" role="group" aria-label="Mode">
              <button data-v="learn" aria-pressed="${mode === "learn"}">Learn mode</button>
              <button data-v="exam" aria-pressed="${mode === "exam"}">Exam mode</button>
            </div>
            <div class="keys"><span><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> question</span><span><kbd>A</kbd>–<kbd>D</kbd> answer</span><span>or drag &amp; drop</span></div>
            <div class="btn-row">
              <button class="btn btn-sm btn-ghost" data-orig>${I.image} Original page</button>
              <button class="btn btn-sm btn-ghost" data-reset>${I.reset} Reset</button>
              ${mode === "exam" ? `<button class="btn btn-sm btn-accent" data-submit disabled>Check answers</button>` : ""}
            </div>
          </div>
        </div>
        <div class="result-slot"></div>
        <div class="btn-row" style="justify-content:space-between;margin-top:26px">
          ${n > 1 ? `<a class="btn btn-sm" href="#/practice/${n - 1}">${I.prev} Set ${n - 1}</a>` : "<span></span>"}
          ${n < 15 ? `<a class="btn btn-sm" href="#/practice/${n + 1}">Set ${n + 1} ${I.next}</a>` : `<a class="btn btn-sm" href="#/challenge">Challenge mode ${I.next}</a>`}
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
      const optsEl = $(".opts", root), rowsEl = $(".qrows", root);
      const submitBtn = $("[data-submit]", root);
      const opts = {};

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
              ctx.hint.innerHTML = "";
              X().fillExplain(ctx, comp);
              ctx.row.classList.add("is-solved");
              st.solved[i] = true;
              App.store.recordComp(comp.id, st.first[i]);
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
              ctx.hint.innerHTML = X().hintFor(q, comp);
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
          ctx.row.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
            ctx.hint.innerHTML = `${I.check}<span>The answer is <b>${q.ans}</b>, not ${L}.</span>`;
          }
          X().fillExplain(ctx, App.comp(S.opts[q.ans]));
          ctx.row.classList.add("is-solved");
          App.store.recordComp(S.opts[q.ans], ok);
        }
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
          2: ["Nearly there. 很好！", "One slipped. Read its explanation, then try the set again."],
          1: ["Keep going. 加油！", "Study the explanations, then retry. The radicals' meanings are the key."],
          0: ["Keep going. 加油！", "Start from the meaning of each word, then match it to a radical."]
        };
        const [t, p] = msgs[score];
        const card = html(`<div class="card result-card">
          <div class="big">${score}<small>/3</small></div>
          <div><h3>${t}</h3><p>${p} ${mode === "learn" ? "Scored on first attempts." : ""}</p></div>
          <div class="btn-row">
            <button class="btn btn-sm" data-again>${I.replay} Try again</button>
            ${S.n < 15 ? `<a class="btn btn-sm btn-primary" href="#/practice/${S.n + 1}">Next set ${I.arrow}</a>` : `<a class="btn btn-sm btn-primary" href="#/challenge">Challenge ${I.arrow}</a>`}
          </div>
        </div>`);
        $("[data-again]", card).addEventListener("click", () => App.refresh());
        const slot = $(".result-slot", root);
        slot.replaceChildren(card);
        App.later(() => {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          if (score === 3) { App.sfx.win(); App.later(() => App.burstAt($(".big", card), 1.2), 250); }
        }, 500);
      };

      App.onKey((e) => {
        const k = e.key.toLowerCase();
        if (["1", "2", "3"].includes(k)) { setActive(+k - 1); rows[+k - 1].row.focus({ preventScroll: true }); return true; }
        if (["a", "b", "c", "d"].includes(k)) { const L = k.toUpperCase(); answer(st.active, L, $(".opt-glyph", opts[L])); return true; }
        if (e.key === "Enter" && submitBtn && !submitBtn.disabled) { submit(); return true; }
        return false;
      });
      sync();
    }
  };
})();
