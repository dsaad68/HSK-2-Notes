/* ==========================================================================
   Home — hero showcase, exam demo, position map, progress
   ========================================================================== */
(function () {
  "use strict";
  const H = window.HSK;
  const { $, $$, html, sleep } = App;
  const X = () => App.exam;

  const POS_ORDER = ["left", "right", "top", "bottom", "frame", "wrap-tl", "wrap-bl"];

  App.views.home = {
    nav: "",
    title: "",
    render() {
      const st = App.stats();
      const root = html(`<div class="page-home">
        <section class="hero wrap">
          <div class="hero-grid">
            <div class="hero-copy">
              <span class="eyebrow">HSK 2 · 书写 Writing · Part I</span>
              <h1 class="title-xl">Every character is built from <em>pieces</em>. Learn the pieces.</h1>
              <p class="lede">In the HSK Exam Writing Section, Part 1, you see a character with one piece missing, and you pick the radical (偏旁) that completes it. This course covers the 30 radicals from your textbook, animated stroke by stroke, and then drills all 15 exam sets.</p>
              <div class="btn-row">
                <a class="btn btn-primary" href="#/course">Start the course ${App.icon.arrow}</a>
                <a class="btn" href="#/learn">Browse the 30 radicals</a>
              </div>
              <div class="hero-stats">
                <div><b>30</b><span>radicals · 偏旁</span></div>
                <div><b>15</b><span>exam sets</span></div>
                <div><b>45</b><span>exam questions</span></div>
              </div>
            </div>
            <div class="stage" aria-label="Animated character assembly">
              <div class="stage-dots" role="tablist" aria-label="Examples"></div>
              <div class="stage-grid"></div>
              <div class="stage-layer layer-a"></div>
              <div class="stage-layer layer-b"></div>
              <div class="stage-label label-a"><i></i><span></span></div>
              <div class="stage-label is-rest label-b"><i></i><span></span></div>
              <div class="stage-caption"><span class="han" style="font-size:22px"></span><span class="py"></span><span class="en"></span></div>
            </div>
          </div>
        </section>

        <section class="section wrap">
          <div class="section-head reveal">
            <div><span class="eyebrow">How Part I works</span><h2 class="title-lg" style="margin-top:12px">Read, match, eliminate.</h2></div>
            <button class="btn btn-sm btn-ghost demo-replay">${App.icon.replay} Replay demo</button>
          </div>
          <div class="demo reveal">
            <div class="card demo-sheet">
              <div class="sheet-instr"><span class="sq"></span><div><div class="han">书写 第一部分：根据部件组字。</div><p>HSK Exam Writing Section, Part 1: form Chinese characters using the given components.</p></div></div>
              <div class="opts demo-opts"></div>
              <div class="qrows demo-rows"></div>
              <svg class="cursor" viewBox="0 0 26 26" aria-hidden="true"><path d="M4 2.5l17 9.2-7.4 1.6-3.6 6.9z" fill="#1e1a15" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>
            </div>
            <div class="demo-steps">
              <div class="step" data-step="1"><div class="step-n">1</div><div><h4>Read the pinyin and the word</h4><p>The pinyin tells you which character it is. <span class="han">不懂 bù dǒng</span> means “don't understand”.</p></div></div>
              <div class="step" data-step="2"><div class="step-n">2</div><div><h4>Match the meaning to a radical</h4><p>Understanding happens in the mind, so you want the heart radical <span class="han">忄</span>. Radicals carry meaning.</p></div></div>
              <div class="step" data-step="3"><div class="step-n">3</div><div><h4>Eliminate</h4><p>A, B and C are each used exactly once, and D (<span class="han">十</span>) belongs to the example. The last answer is the one that's left.</p></div></div>
            </div>
          </div>
        </section>

        <section class="section wrap">
          <div class="section-head reveal">
            <div><span class="eyebrow">Where radicals live</span><h2 class="title-lg" style="margin-top:12px">Radicals by position</h2></div>
            <p class="muted" style="max-width:420px">The position of a radical is a clue in itself. Names end in 旁 (side), 头 (top), 底 (bottom) or 框 (frame).</p>
          </div>
          <div class="posmap"></div>
        </section>

        <section class="section wrap">
          <div class="section-head reveal"><div><span class="eyebrow">Your progress</span><h2 class="title-lg" style="margin-top:12px">Keep the streak going</h2></div></div>
          <div class="progress-grid">
            <a class="card prog-card reveal" href="#/course">${App.ring(st.lessons / 8, st.lessons + "<small style='font-size:12px;color:var(--ink-4)'>/8</small>")}<div><h4>Course checks</h4><p>Nine short lessons on how radicals work.</p></div></a>
            <a class="card prog-card reveal" style="--d:60ms" href="#/learn">${App.ring(st.studied / 30, st.studied + "<small style='font-size:12px;color:var(--ink-4)'>/30</small>")}<div><h4>Radicals studied</h4><p>Open a radical to watch its strokes and practise writing it.</p></div></a>
            <a class="card prog-card reveal" style="--d:80ms" href="#/practice">${App.ring(st.setsDone / 15, st.setsDone + "<small style='font-size:12px;color:var(--ink-4)'>/15</small>", "jade")}<div><h4>Exam sets done</h4><p>${st.perfect} perfect so far. Aim for 3/3 on every set.</p></div></a>
            <a class="card prog-card reveal" style="--d:160ms" href="#/challenge">${App.ring(st.acc, st.seen ? Math.round(st.acc * 100) + "%" : "–", "gold")}<div><h4>Challenge accuracy</h4><p>${st.seen ? st.correct + " of " + st.seen + " answered correctly." : "Mixed drills across all 30 radicals."}</p></div></a>
          </div>
        </section>
      </div>`);

      this.buildPosMap($(".posmap", root));
      this.root = root;
      return root;
    },

    mounted() {
      const root = this.root;
      this.showcase($(".stage", root));
      const demo = $(".demo", root);
      let started = false;
      const startDemo = () => { this.demo(root); };
      App.whenVisible(demo, () => { started = true; startDemo(); });
      $(".demo-replay", root).addEventListener("click", () => { if (started) startDemo(); });
    },

    /* ---------- Hero: pieces fly together into a character ---------- */
    showcase(stage) {
      const alive = App.alive();
      const dots = $(".stage-dots", stage);
      const A = $(".layer-a", stage), B = $(".layer-b", stage);
      const la = $(".label-a", stage), lb = $(".label-b", stage), cap = $(".stage-caption", stage);
      new Ink.InkChar($(".stage-grid", stage), "一", { strokes: [], grid: "mi" });
      let i = 0, run = 0;
      H.SHOWCASE.forEach((s, k) => {
        const d = html(`<button role="tab" aria-label="${s.ch}"></button>`);
        d.addEventListener("click", () => { i = k; loop(); });
        dots.appendChild(d);
      });
      const OFF = { x: [[-11, 0], [10, 0]], y: [[0, -9], [0, 9]], "-y": [[0, 9], [0, -8]], bl: [[-8, 8], [7, -7]] };
      const place = (axis) => {
        const set = (el, v) => { el.style.top = v.top || ""; el.style.bottom = v.bottom || ""; el.style.left = v.left || ""; el.style.right = v.right || ""; };
        if (axis === "-y") { set(la, { bottom: "16px", left: "16px" }); set(lb, { top: "16px", left: "16px" }); }
        else { set(la, { top: "16px", left: "16px" }); set(lb, { bottom: "16px", right: "16px" }); }
      };
      const loop = async () => {
        const my = ++run;
        const ok = () => alive() && my === run;
        while (ok()) {
          const s = H.SHOWCASE[i];
          $$("button", dots).forEach((b, k) => b.classList.toggle("is-on", k === i));
          const n = Ink.data(s.ch).s.length;
          const rest = Ink.range(n).filter((x) => !s.rad.includes(x));
          A.replaceChildren(); B.replaceChildren();
          const off = OFF[s.axis] || OFF.x;
          place(s.axis);
          [A, B].forEach((L, k) => { L.style.transition = "none"; L.style.opacity = 1; L.style.transform = `translate(${off[k][0]}%, ${off[k][1]}%)`; });
          void A.offsetWidth;
          [A, B].forEach((L) => (L.style.transition = ""));
          stage.classList.remove("is-joined");
          la.classList.remove("is-on"); lb.classList.remove("is-on"); cap.classList.remove("is-on");
          const ka = App.ink(A, s.ch, { strokes: s.rad, highlight: s.rad, shown: false });
          const kb = App.ink(B, s.ch, { strokes: rest, shown: false });
          $("span", la).innerHTML = s.radLabel.replace(/^(\S+)/, '<span class="han">$1</span>');
          $("span", lb).innerHTML = s.restLabel.replace(/^(\S+)/, '<span class="han">$1</span>');
          await sleep(350); if (!ok()) return;
          la.classList.add("is-on");
          if (!(await ka.animate({ speed: 1.9, gap: 90 })) || !ok()) return;
          lb.classList.add("is-on");
          if (!(await kb.animate({ speed: 2.4, gap: 70 })) || !ok()) return;
          await sleep(650); if (!ok()) return;
          la.classList.remove("is-on"); lb.classList.remove("is-on");
          [A, B].forEach((L) => (L.style.transform = "translate(0,0)"));
          await sleep(520); if (!ok()) return;
          stage.classList.add("is-joined");
          App.sfx.tick();
          $(".han", cap).textContent = s.ch;
          $(".py", cap).textContent = s.py;
          $(".en", cap).textContent = s.en;
          cap.classList.add("is-on");
          await sleep(2600); if (!ok()) return;
          cap.classList.remove("is-on");
          [A, B].forEach((L) => (L.style.opacity = 0));
          await sleep(550); if (!ok()) return;
          i = (i + 1) % H.SHOWCASE.length;
        }
      };
      loop();
      App.onCleanup(() => { run++; });
    },

    /* ---------- Demo: scripted walkthrough of set 1 ---------- */
    async demo(root) {
      const alive = App.alive();
      const my = (this._demoRun = (this._demoRun || 0) + 1);
      const ok = () => alive() && my === this._demoRun;
      const S = H.SETS[0];
      const sheet = $(".demo-sheet", root), optsEl = $(".demo-opts", root), rowsEl = $(".demo-rows", root);
      const cursor = $(".cursor", root);
      const steps = $$(".step", root);
      const setStep = (n) => steps.forEach((s) => s.classList.toggle("is-on", +s.dataset.step === n));
      optsEl.replaceChildren(); rowsEl.replaceChildren();
      const opts = {};
      ["A", "B", "C", "D"].forEach((L) => { const b = X().optionButton(L, App.comp(S.opts[L])); b.tabIndex = -1; b.style.pointerEvents = "none"; opts[L] = b; optsEl.appendChild(b); });
      const ex = X().questionRow(H.EXAMPLE_Q, { example: true, cell: 64 });
      X().fillSlot(ex.tiles, App.comp("ten"), true, "correct");
      X().stamp(ex.ans, "D", "is-example");
      rowsEl.appendChild(ex.row);
      const rows = S.qs.map((q) => { const r = X().questionRow(q, { cell: 64, hint: false }); r.row.style.pointerEvents = "none"; rowsEl.appendChild(r.row); return r; });
      const moveTo = (el) => {
        const a = sheet.getBoundingClientRect(), b = el.getBoundingClientRect();
        cursor.style.transform = `translate(${b.left - a.left + b.width * 0.55}px, ${b.top - a.top + b.height * 0.55}px)`;
      };
      cursor.classList.remove("is-on");
      setStep(0);
      await sleep(600); if (!ok()) return;
      cursor.style.transition = "none"; moveTo(rows[0].row); void cursor.offsetWidth; cursor.style.transition = "";
      cursor.classList.add("is-on");
      for (let k = 0; k < rows.length; k++) {
        const r = rows[k], q = r.q, L = q.ans, comp = App.comp(S.opts[L]);
        r.row.classList.add("is-active");
        setStep(1);
        moveTo(r.tiles.targetCell);
        r.tiles.targetCell.querySelector(".cell-py").animate([{ transform: "scale(1)" }, { transform: "scale(1.35)", color: "var(--accent)" }, { transform: "scale(1)" }], { duration: 900, delay: 500 });
        await sleep(k === 0 ? 2300 : 1400); if (!ok()) return;
        setStep(k === 2 ? 3 : 2);
        moveTo(opts[L]);
        await sleep(k === 2 ? 2000 : 1500); if (!ok()) return;
        cursor.classList.remove("is-click"); void cursor.offsetWidth; cursor.classList.add("is-click");
        opts[L].classList.add("is-ready");
        App.sfx.tick();
        const ov = await X().fly($(".opt-glyph", opts[L]), r.tiles, comp, true, "correct");
        if (!ok()) { ov.remove(); return; }
        X().fillSlot(r.tiles, comp, true, "correct"); ov.remove();
        X().bloom(r.tiles);
        X().stamp(r.ans, L, "is-correct");
        App.sfx.stamp();
        r.row.classList.add("is-solved");
        r.row.classList.remove("is-active");
        opts[L].classList.remove("is-ready");
        opts[L].classList.add("is-used");
        await sleep(900); if (!ok()) return;
      }
      setStep(3);
      cursor.classList.remove("is-on");
      await sleep(5200); if (!ok()) return;
      if (ok()) this.demo(root);
    },

    /* ---------- Position map ---------- */
    buildPosMap(el) {
      const all = [...H.RADICALS];
      POS_ORDER.forEach((pos, k) => {
        const P = H.POSITIONS[pos];
        const items = all.filter((r) => r.pos === pos);
        if (!items.length) return;
        const card = html(`<div class="card pos-card reveal${pos === "left" ? " is-left" : ""}" style="--d:${k * 60}ms">
          ${App.posDiagram(pos)}
          <div><h4>${P.label} <span class="han">${P.term.split(" ")[0]}</span></h4><p>${P.desc}</p><div class="pos-glyphs"></div></div>
        </div>`);
        const g = $(".pos-glyphs", card);
        items.forEach((r) => {
          const a = html(`<a class="mini-glyph" href="#/learn/${r.id}" title="${r.name} · ${r.en}" aria-label="${r.name}"></a>`);
          App.compInk(a, r, {});
          g.appendChild(a);
        });
        el.appendChild(card);
      });
    }
  };
})();
