/* ==========================================================================
   Grammar — sentence chips, one animated visual per grammar point,
   and two question types (pick the gap, put the chunks in order).
   Uses App.expr.quiz as the quiz shell.
   ========================================================================== */
(function () {
  "use strict";
  const G = window.HSK_GRAMMAR;
  const { $, $$, html, sleep, shuffle } = App;

  const LESSONS = G.LESSONS;
  const POINTS = LESSONS.flatMap((L) => L.points.map((p, i) => Object.assign(p, { L, i })));
  const lesson = (n) => LESSONS.find((L) => L.n === +n);
  const point = (id) => POINTS.find((p) => p.id === id);

  /* ---------- tokens & chips ---------- */
  const PUNCT = /^[，。？！、：；]$/;
  function parse(s) {
    return s.split(" · ").map((t) => {
      t = t.trim();
      if (PUNCT.test(t)) return { zh: t, punct: true };
      const [zh, py, r] = t.split("|");
      return { zh, py: py || "", r: r || "" };
    });
  }
  const zhOf = (toks) => toks.map((t) => t.zh).join("");
  const chip = (t, cls) => t.punct
    ? `<span class="g-punct han">${t.zh}</span>`
    : `<span class="g-chip${cls ? " " + cls : ""}" data-r="${t.r || ""}"><span class="han">${t.zh}</span><span class="py">${t.py || ""}</span></span>`;
  /* punctuation sticks to the chip before it, so it never wraps onto its own line */
  const chips = (toks) => toks.map((t, i) => {
    const nx = toks[i + 1];
    if (t.punct) return "";
    return nx && nx.punct ? `<span class="g-nb">${chip(t)}${chip(nx)}</span>` : chip(t);
  }).join("");
  const T = (zh, py, r, cls) => chip({ zh, py, r }, cls);

  /* Show pinyin above the Chinese in a block of text, using the pinyin font. */
  function rubyfy(root) {
    $$(".han", root).forEach((h) => h.classList.add("py-font"));
    return root;
  }
  const isZh = (t) => /[一-鿿]/.test(t) && !/[a-z]/i.test(t);

  function formula(f) {
    return `<div class="g-formula">${f.cap ? `<span class="g-fx-cap">${f.cap}</span>` : ""}${f.parts.map(([t, r]) => `<span class="g-fx" data-r="${r}">${isZh(t) ? `<span class="han py-font">${t}</span>` : t}</span>`).join('<span class="g-fx-plus">+</span>')}</div>`;
  }


  function example(ex, k) {
    const toks = parse(ex.zh);
    return `<li class="g-ex">
      <span class="g-ex-n">${k + 1}</span>
      <div class="g-ex-body">
        <div class="g-sent is-sm">${chips(toks)}${App.speakBtn(zhOf(toks))}</div>
        <p class="g-ex-en">${ex.en}${ex.tag ? ` <span class="g-ex-tag">${ex.tag}</span>` : ""}</p>
      </div>
    </li>`;
  }

  /* ---------- tiny animation helpers ---------- */
  const EASE = "cubic-bezier(.16,1,.3,1)", SPRING = "cubic-bezier(.34,1.56,.64,1)";
  const live = (el) => el.isConnected && el.ownerDocument === document && !App.reduceMotion();
  const pop = (el, d) => { if (live(el)) el.animate([{ opacity: 0, transform: "translateY(10px) scale(.86)" }, { opacity: 1, transform: "none" }], { duration: 520, delay: d || 0, easing: SPRING, fill: "backwards" }); };
  const swapText = (el, text) => {
    if (el.textContent === text) return;
    if (!live(el)) { el.textContent = text; return; }
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: "forwards" }).finished.then(() => {
      el.textContent = text;
      el.animate([{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: EASE, fill: "forwards" });
    }).catch(() => { el.textContent = text; });
  };
  /* Move a node with fn(), animating from where it was (FLIP). */
  function flip(nodes, fn, dur) {
    nodes = [].concat(nodes);
    const first = nodes.map((n) => n.getBoundingClientRect());
    fn();
    if (!nodes.length || !live(nodes[0])) return;
    nodes.forEach((n, i) => {
      const r = n.getBoundingClientRect(), f = first[i];
      const dx = f.left - r.left, dy = f.top - r.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      n.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: dur || 420, easing: EASE });
    });
  }
  /* Shared run-control for a visual: a newer play() cancels the older one. */
  function runner(el) {
    const alive = App.alive();
    let run = 0;
    return {
      start() { const my = ++run; return () => alive() && my === run && el.isConnected; },
      stop() { run++; }
    };
  }
  const wait = async (ok, ms) => { await sleep(App.reduceMotion() ? Math.min(ms, 60) : ms); return ok(); };
  const switchRow = (items, cls) => `<div class="gv-switch ${cls || ""}" role="group">${items.map((it, k) => `<button data-k="${k}">${it}</button>`).join("")}</div>`;
  const markSwitch = (el, k) => $$(".gv-switch button", el).forEach((b) => b.classList.toggle("is-on", +b.dataset.k === k));

  /* ======================================================================
     The visuals. Each returns { el, play({ onStep }), prime() }.
     ====================================================================== */
  const VIS = {};

  /* 吧 — a certainty meter: statement → 吗 → 吧 */
  VIS.ba = () => {
    const ENDS = [
      { zh: "", py: "", p: "。", x: 1, lab: "I know", en: "Chen Tianzhong is from Thailand." },
      { zh: "吗", py: "ma", p: "？", x: 0.08, lab: "No idea", en: "Is Chen Tianzhong from Thailand?" },
      { zh: "吧", py: "ba", p: "？", x: 0.74, lab: "I think so", en: "Chen Tianzhong is from Thailand, right?" }
    ];
    const el = html(`<div class="gv gv-ba">
      <div class="g-sent is-lg">${T("陈天中", "Chén Tiānzhōng")}${T("是", "shì")}${T("泰国人", "Tàiguó rén")}<span class="g-nb"><span class="g-chip gv-end" data-r="m"><span class="han"></span><span class="py"></span></span><span class="g-punct han gv-p">。</span></span></div>
      <p class="gv-en"></p>
      <div class="gv-meter" aria-hidden="true">
        <div class="gv-track"><i class="gv-fill"></i><span class="gv-dot"><b></b></span></div>
        <div class="gv-scale"><span>no idea</span><span>sure</span></div>
      </div>
      ${switchRow(["<span class=\"han\">。</span> say it", "<span class=\"han\">吗？</span> ask", "<span class=\"han\">吧？</span> guess"])}
    </div>`);
    const end = $(".gv-end", el), p = $(".gv-p", el), en = $(".gv-en", el), meter = $(".gv-meter", el), lab = $(".gv-dot b", el);
    let onStep = null;
    const set = (k) => {
      const e = ENDS[k];
      el.dataset.k = k;
      end.classList.toggle("is-in", !!e.zh);
      if (e.zh) { $(".han", end).textContent = e.zh; $(".py", end).textContent = e.py; if (k === 2 || k === 1) pop(end); }
      p.textContent = e.p;
      meter.style.setProperty("--x", e.x);
      swapText(lab, e.lab);
      swapText(en, e.en);
      markSwitch(el, k);
      onStep && onStep(k + 1);
    };
    const r = runner(el);
    $$(".gv-switch button", el).forEach((b) => b.addEventListener("click", () => { r.stop(); App.sfx.tick(); set(+b.dataset.k); }));
    return {
      el,
      prime() { onStep = null; set(0); },
      async play(o) {
        onStep = o && o.onStep; const ok = r.start();
        set(0); if (!(await wait(ok, 2300))) return;
        set(1); if (!(await wait(ok, 2500))) return;
        set(2);
      }
    };
  };

  /* 是……的 — a frame drops around the detail; the detail swaps; 是 drops except after 不 */
  VIS.shide = () => {
    const FOCI = [
      { zh: "昨天", py: "zuótiān", q: "When?", en: "I came to Beijing <b>yesterday</b>." },
      { zh: "坐飞机", py: "zuò fēijī", q: "How?", en: "I came to Beijing <b>by plane</b>." },
      { zh: "跟朋友", py: "gēn péngyou", q: "With whom?", en: "I came to Beijing <b>with a friend</b>." }
    ];
    const el = html(`<div class="gv gv-shide">
      <div class="g-sent is-lg">
        ${T("我", "wǒ")}
        ${T("不", "bù", "m", "gv-neg g-fold")}
        ${T("是", "shì", "m", "gv-shi g-fold")}
        <span class="g-chip gv-focus g-fold" data-r="f"><span class="gv-flag"></span><span class="han"></span><span class="py"></span></span>
        ${T("来北京", "lái Běijīng")}
        ${T("了", "le", "", "gv-le g-fold is-in")}
        <span class="g-nb">${T("的", "de", "m", "gv-de g-fold")}<span class="g-punct han">。</span></span>
      </div>
      <p class="gv-en"></p>
      <p class="gv-sub"></p>
      ${switchRow(FOCI.map((f) => f.q))}
    </div>`);
    const q = (s) => $(s, el);
    const neg = q(".gv-neg"), shi = q(".gv-shi"), focus = q(".gv-focus"), le = q(".gv-le"), de = q(".gv-de"), en = q(".gv-en"), sub = q(".gv-sub");
    const sent = q(".g-sent");
    const all = () => $$(".g-chip, .g-punct", sent);
    const fold = (node, on) => node.classList.toggle("is-in", on);
    const setFocus = (k) => {
      const f = FOCI[k];
      $(".gv-flag", focus).textContent = f.q;
      swapText($(".han", focus), f.zh); swapText($(".py", focus), f.py);
      markSwitch(el, k);
      return f;
    };
    let onStep = null;
    const step = (s) => { onStep && onStep(s); };
    const base = () => {
      flip(all(), () => { fold(neg, false); fold(shi, false); fold(focus, false); fold(de, false); fold(le, true); shi.classList.remove("is-ghost", "is-lock"); });
      en.innerHTML = "I came to Beijing."; sub.textContent = "";
      markSwitch(el, -1);
    };
    const frame = (k) => {
      const f = setFocus(k);
      flip(all(), () => { fold(le, false); fold(neg, false); fold(shi, true); fold(focus, true); fold(de, true); shi.classList.remove("is-ghost", "is-lock"); });
      en.innerHTML = f.en; sub.textContent = "";
      focus.classList.remove("is-lit"); void focus.offsetWidth; focus.classList.add("is-lit");
    };
    const r = runner(el);
    $$(".gv-switch button", el).forEach((b) => b.addEventListener("click", () => { r.stop(); App.sfx.tick(); frame(+b.dataset.k); step(3); }));
    return {
      el,
      prime() { onStep = null; base(); $(".han", focus).textContent = FOCI[0].zh; $(".py", focus).textContent = FOCI[0].py; },
      async play(o) {
        onStep = o && o.onStep; const ok = r.start();
        base(); step(1);
        if (!(await wait(ok, 2200))) return;
        frame(0); step(2);
        if (!(await wait(ok, 2600))) return;
        step(3);
        for (const k of [1, 2]) { frame(k); if (!(await wait(ok, 2000))) return; }
        frame(1); step(4);
        shi.classList.add("is-ghost");
        en.innerHTML = "I came to Beijing by plane."; sub.innerHTML = "<span class=\"han\">我坐飞机来北京的。</span> also works: <span class=\"han\">是</span> is optional here.";
        if (!(await wait(ok, 2800))) return;
        flip(all(), () => { fold(neg, true); shi.classList.remove("is-ghost"); shi.classList.add("is-lock"); });
        pop(neg);
        en.innerHTML = "I <b>didn't</b> come to Beijing by plane."; sub.innerHTML = "After <span class=\"han\">不</span>, <span class=\"han\">是</span> has to stay.";
      }
    };
  };

  /* 兼语句 — two arcs: object of the first verb, subject of the second */
  VIS.pivot = () => {
    const SETS = [
      { v: ["叫", "jiào"], s: ["妈妈", "māma"], p: ["孩子们", "háizimen"], v2: ["回家", "huí jiā"], en: "Mum tells <b>the children</b> to come home.", a: "tell whom?", b: "who goes home?" },
      { v: ["请", "qǐng"], s: ["我", "wǒ"], p: ["朋友", "péngyou"], v2: ["吃饭", "chī fàn"], en: "I invite <b>a friend</b> to dinner.", a: "invite whom?", b: "who eats?" },
      { v: ["让", "ràng"], s: ["老师", "lǎoshī"], p: ["我们", "wǒmen"], v2: ["说中文", "shuō Zhōngwén"], en: "The teacher has <b>us</b> speak Chinese.", a: "let whom?", b: "who speaks?" }
    ];
    const el = html(`<div class="gv gv-pivot">
      <div class="gv-arcbox">
        <svg class="gv-arcs" aria-hidden="true"><path class="arc arc-a" pathLength="1"/><path class="arc arc-b" pathLength="1"/></svg>
        <span class="gv-lab lab-a"><b>object</b><small></small></span>
        <div class="g-sent is-lg">${T("", "", "", "c-s")}${T("", "", "m", "c-v")}${T("", "", "p", "c-p")}<span class="g-nb">${T("", "", "", "c-v2")}<span class="g-punct han">。</span></span></div>
        <span class="gv-lab lab-b"><b>subject</b><small></small></span>
      </div>
      <p class="gv-en"></p>
      ${switchRow(SETS.map((s) => `<span class="han">${s.v[0]}</span> ${s.v[1]}`))}
    </div>`);
    const box = $(".gv-arcbox", el), svg = $(".gv-arcs", el);
    const C = { s: $(".c-s", el), v: $(".c-v", el), p: $(".c-p", el), v2: $(".c-v2", el) };
    const la = $(".lab-a", el), lb = $(".lab-b", el), en = $(".gv-en", el);
    const fill = (c, [zh, py]) => { $(".han", c).textContent = zh; $(".py", c).textContent = py; };
    function layout() {
      // offsets, not getBoundingClientRect: chips may be mid-animation (scaled / shifted)
      const W = box.clientWidth, H = box.clientHeight;
      if (!W) return;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      const R = (c) => ({ cx: c.offsetLeft + c.offsetWidth / 2, top: c.offsetTop, bot: c.offsetTop + c.offsetHeight });
      const v = R(C.v), p = R(C.p), v2 = R(C.v2);
      const h = 40;
      $(".arc-a", svg).setAttribute("d", `M${v.cx} ${v.top - 4} C ${v.cx} ${v.top - h}, ${p.cx} ${p.top - h}, ${p.cx} ${p.top - 6}`);
      $(".arc-b", svg).setAttribute("d", `M${p.cx} ${p.bot + 4} C ${p.cx} ${p.bot + h}, ${v2.cx} ${v2.bot + h}, ${v2.cx} ${v2.bot + 6}`);
      la.style.left = `${(v.cx + p.cx) / 2}px`; la.style.top = `${v.top - h - 16}px`;
      lb.style.left = `${(p.cx + v2.cx) / 2}px`; lb.style.top = `${p.bot + h + 16}px`;
    }
    let onStep = null, cur = 0;
    const stage = (s) => {
      el.classList.toggle("s-hot", s >= 1);
      el.classList.toggle("s-a", s >= 2);
      el.classList.toggle("s-b", s >= 3);
      el.classList.toggle("s-pivot", s >= 4);
      onStep && onStep(s);
    };
    const use = (k) => {
      cur = k;
      const S = SETS[k];
      fill(C.s, S.s); fill(C.v, S.v); fill(C.p, S.p); fill(C.v2, S.v2);
      $("small", la).textContent = S.a; $("small", lb).textContent = S.b;
      en.innerHTML = S.en;
      markSwitch(el, k);
      layout();
    };
    if (window.ResizeObserver) { const ro = new ResizeObserver(() => layout()); ro.observe(box); App.onCleanup(() => ro.disconnect()); }
    const r = runner(el);
    const redraw = () => { el.classList.remove("s-a", "s-b"); void el.offsetWidth; el.classList.add("s-a", "s-b"); };
    $$(".gv-switch button", el).forEach((b) => b.addEventListener("click", () => {
      r.stop(); App.sfx.tick(); use(+b.dataset.k); stage(4); redraw(); $$(".g-chip", el).forEach((c, i) => pop(c, i * 60));
    }));
    return {
      el,
      prime() { onStep = null; use(0); stage(0); },
      async play(o) {
        onStep = o && o.onStep; const ok = r.start();
        use(0); stage(0); requestAnimationFrame(layout);
        if (!(await wait(ok, 300))) return;
        stage(1); if (!(await wait(ok, 1900))) return;
        stage(2); if (!(await wait(ok, 2100))) return;
        stage(3); if (!(await wait(ok, 2100))) return;
        stage(4); if (!(await wait(ok, 2400))) return;
        for (const k of [1, 2, 0]) {
          use(k); redraw(); $$(".g-chip", el).forEach((c, i) => pop(c, i * 60));
          if (!(await wait(ok, 2300))) return;
        }
      },
      layout
    };
  };

  /* 还是……吧 — two options, a reason, and the winner flies into the frame */
  VIS.haishi = () => {
    const el = html(`<div class="gv gv-haishi">
      <div class="gv-opts">
        <div class="gv-opt" data-k="0"><span class="han">走路去</span><span class="py">zǒulù qù</span><small>walk</small><i class="gv-tick">${App.icon.check}</i></div>
        <span class="gv-or">or</span>
        <div class="gv-opt" data-k="1"><span class="han">打车去</span><span class="py">dǎ chē qù</span><small>take a taxi</small><i class="gv-tick">${App.icon.check}</i></div>
      </div>
      <div class="gv-reason"><span class="han">太远了</span><span class="py">tài yuǎn le</span><small>it's too far</small></div>
      <div class="g-sent is-lg">${T("我们", "wǒmen")}${T("还是", "háishi", "m", "gv-hs")}<span class="gv-slot"><span class="gv-slot-q">？</span></span><span class="g-nb">${T("吧", "ba", "m", "gv-ba")}<span class="g-punct han">。</span></span></div>
      <p class="gv-en">&nbsp;</p>
    </div>`);
    const opts = $$(".gv-opt", el), reason = $(".gv-reason", el), slot = $(".gv-slot", el), en = $(".gv-en", el);
    let onStep = null;
    const reset = () => {
      el.classList.remove("s-1", "s-2", "s-3");
      opts.forEach((o) => o.classList.remove("is-picked", "is-out"));
      slot.replaceChildren(html(`<span class="gv-slot-q">？</span>`)); slot.classList.remove("is-full");
      en.innerHTML = "&nbsp;";
    };
    const r = runner(el);
    const land = () => {
      const from = opts[1].getBoundingClientRect();
      const c = html(T("打车去", "dǎ chē qù", "f"));
      slot.replaceChildren(c); slot.classList.add("is-full");
      if (live(c)) {
        const to = c.getBoundingClientRect();
        c.animate([{ transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(1.06)`, opacity: 0.4 }, { transform: "none", opacity: 1 }], { duration: 760, easing: EASE });
      }
      en.innerHTML = "Let's just <b>take a taxi</b>.";
    };
    return {
      el,
      prime() { onStep = null; reset(); },
      async play(o) {
        onStep = o && o.onStep; const ok = r.start();
        reset(); el.classList.add("s-1"); onStep && onStep(1);
        opts.forEach((x, i) => pop(x, i * 120));
        if (!(await wait(ok, 2200))) return;
        el.classList.add("s-2"); onStep && onStep(2); pop(reason);
        if (!(await wait(ok, 1300))) return;
        opts[1].classList.add("is-picked"); opts[0].classList.add("is-out");
        if (!(await wait(ok, 1000))) return;
        el.classList.add("s-3"); onStep && onStep(3); land();
      }
    };
  };

  /* 多 — number lines: 二十多个 (21–29) and 五块多 (5.1–5.9) */
  VIS.duo = () => {
    const line = (a, b, ticks, band) => {
      const W = 300, x = (i) => 14 + (i / ticks) * (W - 28);
      let t = "";
      for (let i = 0; i <= ticks; i++) t += `<line x1="${x(i)}" x2="${x(i)}" y1="${i === 0 || i === ticks ? 22 : 26}" y2="${i === 0 || i === ticks ? 38 : 34}"/>`;
      return `<svg class="gv-line" viewBox="0 0 ${W} 56" aria-hidden="true">
        <rect class="gv-band" x="${x(1)}" y="23" width="${x(ticks - 1) - x(1)}" height="14" rx="7"/>
        <line class="gv-axis" x1="${x(0)}" x2="${x(ticks)}" y1="30" y2="30"/>
        <g class="gv-ticks">${t}</g>
        <circle class="gv-pt" cx="${x(0)}" cy="30" r="6"/>
        <text x="${x(0)}" y="52">${a}</text><text x="${x(ticks)}" y="52">${b}</text>
        <text class="gv-band-l" x="${W / 2}" y="15">${band}</text>
      </svg>`;
    };
    const el = html(`<div class="gv gv-duo">
      <div class="gv-row" data-k="0">
        <span class="gv-rule">Round ten <small>number + 多 + measure</small></span>
        ${line("20", "30", 10, "21 … 29")}
        <div class="g-sent">${T("二十", "èrshí", "n")}${T("多", "duō", "m", "gv-duo g-fold")}${T("个", "ge", "w")}${T("学生", "xuésheng")}</div>
        <p class="gv-en"><span class="a">20 students</span><span class="b">twenty-odd students</span></p>
      </div>
      <div class="gv-row" data-k="1">
        <span class="gv-rule">Other number <small>number + measure + 多</small></span>
        ${line("5", "6", 10, "5.1 … 5.9")}
        <div class="g-sent">${T("五", "wǔ", "n")}${T("块", "kuài", "w")}${T("多", "duō", "m", "gv-duo g-fold")}${T("钱", "qián")}</div>
        <p class="gv-en"><span class="a">5 kuai</span><span class="b">just over 5 kuai</span></p>
      </div>
    </div>`);
    const rows = $$(".gv-row", el);
    let onStep = null;
    const set = (row, s) => {
      row.classList.toggle("is-in", s >= 1);
      row.classList.toggle("is-more", s >= 2);
      const d = $(".gv-duo", row), chipsIn = $$(".g-chip", row);
      flip(chipsIn.filter((c) => c !== d), () => d.classList.toggle("is-in", s >= 2), 520);
      if (s >= 2) pop(d);
    };
    const r = runner(el);
    rows.forEach((row) => row.addEventListener("click", () => { r.stop(); App.sfx.tick(); set(row, row.classList.contains("is-more") ? 1 : 2); }));
    return {
      el,
      prime() { onStep = null; set(rows[0], 0); set(rows[1], 0); },
      async play(o) {
        onStep = o && o.onStep; const ok = r.start();
        set(rows[0], 0); set(rows[1], 0);
        set(rows[0], 1); onStep && onStep(1);
        if (!(await wait(ok, 1900))) return;
        set(rows[0], 2); onStep && onStep(2);
        if (!(await wait(ok, 2600))) return;
        set(rows[1], 1); onStep && onStep(3);
        if (!(await wait(ok, 1400))) return;
        set(rows[1], 2);
      }
    };
  };

  /* Action as describer — Chinese and English rows, lines that cross */
  VIS.attr = () => {
    const SETS = [
      { d: ["朋友给我", "péngyou gěi wǒ"], n: ["杯子", "bēizi"], en: ["the cup", "a friend gave me"] },
      { d: ["学中文", "xué Zhōngwén"], n: ["学生", "xuésheng"], en: ["students", "who study Chinese"] },
      { d: ["他们卖", "tāmen mài"], n: ["电影票", "diànyǐngpiào"], en: ["the film tickets", "they sell"] }
    ];
    const el = html(`<div class="gv gv-attr">
      <div class="gv-lang"><span class="gv-tag">中文</span><div class="g-sent is-lg">${T("", "", "f", "c-d g-fold")}${T("的", "de", "m", "c-de g-fold")}${T("", "", "p", "c-n")}</div></div>
      <svg class="gv-cross" aria-hidden="true"><path class="arc l-n" pathLength="1"/><path class="arc l-d" pathLength="1"/></svg>
      <div class="gv-lang"><span class="gv-tag">English</span><div class="g-sent is-en"><span class="g-chip e-n" data-r="p"><span>the cup</span></span><span class="g-chip e-d g-fold" data-r="f"><span>a friend gave me</span></span></div></div>
      ${switchRow(SETS.map((s) => `<span class="han">${s.d[0]}的${s.n[0]}</span>`))}
    </div>`);
    const svg = $(".gv-cross", el);
    const D = $(".c-d", el), DE = $(".c-de", el), N = $(".c-n", el), EN = $(".e-n", el), ED = $(".e-d", el);
    function layout() {
      const sw = svg.clientWidth || svg.getBoundingClientRect().width, sh = svg.clientHeight || svg.getBoundingClientRect().height;
      if (!sw) return;
      svg.setAttribute("viewBox", `0 0 ${sw} ${sh}`);
      const X = (c) => c.offsetLeft + c.offsetWidth / 2 - svg.getBoundingClientRect().left + el.getBoundingClientRect().left;
      const y0 = 2, y1 = sh - 2, m = sh / 2;
      $(".l-n", svg).setAttribute("d", `M${X(N)} ${y0} C ${X(N)} ${m}, ${X(EN)} ${m}, ${X(EN)} ${y1}`);
      $(".l-d", svg).setAttribute("d", `M${X(D)} ${y0} C ${X(D)} ${m}, ${X(ED)} ${m}, ${X(ED)} ${y1}`);
    }
    const use = (k) => {
      const S = SETS[k];
      $(".han", D).textContent = S.d[0]; $(".py", D).textContent = S.d[1];
      $(".han", N).textContent = S.n[0]; $(".py", N).textContent = S.n[1];
      $("span", EN).textContent = S.en[0]; $("span", ED).textContent = S.en[1];
      markSwitch(el, k);
    };
    let onStep = null;
    const stage = (s) => {
      flip([D, DE, N, EN, ED], () => { [D, DE, ED].forEach((c) => c.classList.toggle("is-in", s >= 2)); }, 560);
      el.classList.toggle("s-1", s >= 1);
      el.classList.toggle("s-3", s >= 3);
      layout();
      if (s === 2) { pop(D); pop(DE, 120); pop(ED, 200); }
      onStep && onStep(s);
    };
    if (window.ResizeObserver) { const ro = new ResizeObserver(() => layout()); ro.observe(el); App.onCleanup(() => ro.disconnect()); }
    const r = runner(el);
    $$(".gv-switch button", el).forEach((b) => b.addEventListener("click", async () => {
      r.stop(); App.sfx.tick(); el.classList.remove("s-3");
      use(+b.dataset.k); stage(3); el.classList.remove("s-3"); void el.offsetWidth; el.classList.add("s-3");
      $$(".g-chip", el).forEach((c, i) => pop(c, i * 50));
    }));
    return {
      el,
      prime() { onStep = null; use(0); stage(0); },
      async play(o) {
        onStep = o && o.onStep; const ok = r.start();
        use(0); stage(0);
        if (!(await wait(ok, 250))) return;
        stage(1); pop(N); pop(EN, 80);
        if (!(await wait(ok, 1900))) return;
        stage(2);
        if (!(await wait(ok, 2100))) return;
        stage(3);
        if (!(await wait(ok, 2600))) return;
        for (const k of [1, 2, 0]) {
          use(k); el.classList.remove("s-3"); layout(); void el.offsetWidth; el.classList.add("s-3");
          $$(".g-chip", el).forEach((c, i) => pop(c, i * 50));
          if (!(await wait(ok, 2400))) return;
        }
      },
      layout
    };
  };

  const visual = (p) => VIS[p.vis]();

  /* ======================================================================
     Quiz questions
     ====================================================================== */
  const head = (q, label) => `<div class="qz-kind"><span class="qz-kind-i">${App.expr.ICON.spark}</span>${label}<span class="qz-from">${q.showLesson ? `Lesson ${q.p.L.n} · ` : ""}${q.p.short}</span></div>`;
  const BLANK = `<span class="qz-blank"><span class="qz-blank-in">？</span></span>`;
  const dialogue = (q) => q.ctx.length ? `<div class="g-dlg">${q.ctx.map(([who, s]) => `<div class="g-dlg-line"><span class="g-dlg-who">${who}</span><p class="han">${s.replace("＿＿", BLANK)}</p></div>`).join("")}</div>` : "";
  const enHTML = (q) => (q.en || "").split(" · ").map((x) => `<span>${x}</span>`).join("");
  const reveal = (el) => el.classList.add("is-checked");

  /* "Show meaning" / "Show pinyin" switches above a quiz. Remembered across visits. */
  function quizTools(host) {
    const bar = html(`<div class="g-qtools" role="group" aria-label="Quiz help">
      <button class="meaning-toggle" type="button" data-k="showMeaning" title="Show the English of the dialogue"><span class="switch"></span>Show meaning</button>
      <button class="meaning-toggle" type="button" data-k="showPinyin" title="Show pinyin above the Chinese"><span class="switch"></span>Show pinyin</button>
    </div>`);
    const sync = () => $$("button", bar).forEach((b) => {
      const on = !!App.store.setting(b.dataset.k);
      b.setAttribute("aria-pressed", on);
      host.classList.toggle(b.dataset.k === "showMeaning" ? "g-show-en" : "g-show-py", on);
    });
    $$("button", bar).forEach((b) => b.addEventListener("click", () => { App.sfx.tick(); App.store.setting(b.dataset.k, !App.store.setting(b.dataset.k)); sync(); }));
    sync();
    host.before(bar);
    return bar;
  }

  /* Pick the words that fill the gap (or the one correct sentence). */
  function qPick(q, settle) {
    const opts = shuffle(q.opts.map((t, k) => ({ t, ok: k === 0 })));
    const el = html(`<div class="qz-q g-qz">
      ${head(q, q.ctx.length ? "Complete the dialogue" : "Pick the right sentence")}
      ${q.say ? `<p class="g-qz-say">${q.say}</p>` : ""}
      ${dialogue(q)}
      <div class="qz-opts g-opts${q.ctx.length ? "" : " is-sent"}${q.opts.some((o) => o.length > 4) ? " is-long" : ""}" role="group" aria-label="Answers"></div>
      <p class="g-qz-en muted">${enHTML(q)}</p>
    </div>`);
    const box = $(".qz-opts", el), blank = $(".qz-blank-in", el);
    const btns = opts.map((op, k) => {
      const b = html(`<button class="qz-opt"><kbd>${k + 1}</kbd><span class="han">${op.t}</span></button>`);
      b.addEventListener("click", () => choose(k));
      box.appendChild(b);
      return b;
    });
    let done = false;
    function choose(k) {
      if (done) return;
      done = true;
      const ok = opts[k].ok;
      btns.forEach((b, i) => { b.disabled = true; if (opts[i].ok) b.classList.add("is-right"); else if (i === k) b.classList.add("is-wrong"); else b.classList.add("is-dim"); });
      if (blank) {
        blank.textContent = q.opts[0];
        blank.parentElement.classList.add(ok ? "is-right" : "is-wrong");
        if (!ok) blank.parentElement.dataset.tried = opts[k].t;
        if (live(blank)) blank.animate([{ transform: "translateY(-10px) scale(1.2)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 420, easing: SPRING });
      }
      reveal(el);
      if (ok) App.burstAt(blank || btns[k], 0.5);
      settle(ok, q.why);
    }
    return { el, key: (ev) => { const n = +ev.key; if (n >= 1 && n <= btns.length) { choose(n - 1); return true; } return false; } };
  }

  /* Tap the chunks in the right order. */
  function qOrder(q, settle, alive) {
    const parts = q.parts.map((s, i) => { const [zh, py] = s.split("|"); return { zh, py, i }; });
    const answer = parts.map((p) => p.zh).join("");
    let pool = shuffle(parts);
    while (pool.length > 1 && pool.every((p, i) => p.i === i)) pool = shuffle(parts);
    const el = html(`<div class="qz-q g-qz g-order">
      ${head(q, "Put it in order")}
      ${dialogue(q)}
      <div class="g-ord-line" aria-label="Your sentence"><span class="g-ord-ph">Tap the pieces in order</span></div>
      <div class="g-ord-pool" role="group" aria-label="Pieces"></div>
      <p class="g-qz-en muted">${enHTML(q)}</p>
    </div>`);
    const lineEl = $(".g-ord-line", el), poolEl = $(".g-ord-pool", el), ph = $(".g-ord-ph", el), blank = $(".qz-blank-in", el);
    const placed = [];
    const nodes = pool.map((p) => {
      const b = html(`<button class="g-chip g-piece" data-r=""><span class="han">${p.zh}</span><span class="py">${p.py}</span></button>`);
      b.part = p;
      b.addEventListener("click", () => (b.parentElement === lineEl ? back(b) : put(b)));
      poolEl.appendChild(b);
      return b;
    });
    let done = false;
    const sync = () => {
      ph.hidden = placed.length > 0;
      if (blank) blank.textContent = placed.length ? placed.map((b) => b.part.zh).join("") : "？";
    };
    function put(b) {
      if (done) return;
      const others = nodes.filter((n) => n !== b);
      flip([b, ...others], () => { lineEl.appendChild(b); placed.push(b); sync(); }, 380);
      App.sfx.tick();
      if (placed.length === parts.length) App.later(check, 380);
    }
    function back(b) {
      if (done) return;
      flip(nodes, () => { const i = placed.indexOf(b); placed.splice(i, 1); poolEl.appendChild(b); sync(); }, 380);
      App.sfx.tick();
    }
    function check() {
      if (done || !alive() || placed.length !== parts.length) return;
      done = true;
      const got = placed.map((b) => b.part.zh).join("");
      const ok = got === answer || (q.alts || []).includes(got);
      lineEl.classList.add(ok ? "is-right" : "is-wrong");
      if (blank) { blank.textContent = answer; blank.parentElement.classList.add(ok ? "is-right" : "is-wrong"); if (!ok) blank.parentElement.dataset.tried = got; }
      if (ok) App.burstAt(lineEl, 0.7);
      else {
        if (live(lineEl)) lineEl.animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(7px)" }, { transform: "translateX(-4px)" }, { transform: "none" }], { duration: 420 });
        const fix = html(`<div class="g-ord-fix"><span class="muted">Answer</span><div class="g-sent is-sm">${parts.map((p) => chip({ zh: p.zh, py: p.py, r: "" })).join("")}</div></div>`);
        lineEl.after(fix);
      }
      reveal(el);
      settle(ok, q.why);
    }
    sync();
    return {
      el,
      key: (ev) => {
        if (ev.key === "Backspace" && placed.length) { back(placed[placed.length - 1]); return true; }
        const n = +ev.key, left = nodes.filter((b) => b.parentElement === poolEl);
        if (n >= 1 && n <= left.length) { put(left[n - 1]); return true; }
        return false;
      }
    };
  }

  /** A point's questions as quiz items: "practice" = its five, true = all, default = the two for the lesson quiz. */
  function questions(p, which) {
    const list = which === "practice" ? p.quiz.slice(0, 5) : which ? p.quiz : p.quiz.slice(0, 2);
    return list.map((q) => Object.assign({}, q, { p, render: q.t === "order" ? qOrder : qPick }));
  }
  const lessonQuestions = (L) => L.points.flatMap((p) => questions(p));

  /* ---------- landing-page row: example sentences assembling chip by chip ---------- */
  function showcase(host) {
    const alive = App.alive();
    const box = html(`<div class="g-show"><div class="g-show-cap"><span class="han"></span><small></small></div><div class="g-sent is-sm"></div><p class="g-show-en"></p></div>`);
    host.appendChild(box);
    const cap = $(".g-show-cap", box), sent = $(".g-sent", box), en = $(".g-show-en", box);
    let i = 0, run = 0;
    const list = POINTS.map((p) => ({ p, ex: p.examples[p.id === "pivot" ? 2 : p.id === "duo" ? 1 : 0] }));
    const loop = async () => {
      const my = ++run, ok = () => alive() && my === run;
      while (ok()) {
        const { p, ex } = list[i];
        $(".han", cap).textContent = p.short; $("small", cap).textContent = p.en;
        sent.innerHTML = chips(parse(ex.zh)); en.textContent = "";
        $$(".g-chip, .g-punct", sent).forEach((c, k) => pop(c, 80 + k * 110));
        await sleep(1200); if (!ok()) return;
        en.textContent = ex.en;
        await sleep(2600); if (!ok()) return;
        i = (i + 1) % list.length;
      }
    };
    App.whenVisible(host, loop);
    App.onCleanup(() => { run++; });
  }

  /* ---------- progress ---------- */
  function stats() {
    const st = App.store.state.grammar || {};
    const tried = LESSONS.filter((L) => st[L.n]).length;
    const perfect = LESSONS.filter((L) => st[L.n] && st[L.n].best === lessonQuestions(L).length).length;
    return { lessons: LESSONS.length, points: POINTS.length, tried, perfect };
  }

  App.grammar = { G, LESSONS, POINTS, rubyfy, quizTools, lesson, point, parse, chips, chip, formula, example, visual, questions, lessonQuestions, showcase, stats };
})();
