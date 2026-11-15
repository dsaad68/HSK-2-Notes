/* ==========================================================================
   Course — "How radicals work", 9 lessons with visualisations & quick checks
   ========================================================================== */
(function () {
  "use strict";
  const H = window.HSK, C = window.HSK_COURSE;
  const { $, $$, html, sleep, shuffle } = App;
  const I = App.icon;
  const LETTERS = ["A", "B", "C", "D"];
  const isHan = (s) => /^[㐀-鿿⺀-⿟]+$/.test(s);

  App.views.course = {
    nav: "course",
    title: "The Radical Course",

    render() {
      const root = html(`<div class="wrap">
        <header class="page-head course-hero">
          <div>
            <span class="eyebrow">课 · Course</span>
            <h1 class="title-lg">How radicals work<span class="zh-sub">偏旁课</span></h1>
            <p class="lede">Nine short lessons. You'll see where radicals come from, the four ways characters are built, why radicals change shape, how to decode their names, and how all of it helps in Questions 25–27.</p>
            <div class="course-meta"><span class="chip">9 lessons</span><span class="chip">≈ 15 minutes</span><span class="chip chip-accent">A quick check in each lesson</span></div>
          </div>
          <div class="course-progress"><span class="cp-label"></span><div class="bar-track"><div class="bar-fill" style="width:0%"></div></div></div>
        </header>
        <div class="course-layout">
          <nav class="toc" aria-label="Lessons"></nav>
          <div class="lsns"></div>
        </div>
      </div>`);
      this.root = root;
      const toc = $(".toc", root), list = $(".lsns", root);

      C.LESSONS.forEach((L, k) => {
        const n = String(k + 1).padStart(2, "0");
        const link = html(`<a role="button" tabindex="0" data-id="${L.id}"><span class="n">${k + 1}</span><span>${L.title}<small>${L.zh}</small></span></a>`);
        const go = () => $("#lsn-" + L.id, root).scrollIntoView({ behavior: "smooth", block: "start" });
        link.addEventListener("click", go);
        link.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
        toc.appendChild(link);

        const sec = html(`<section class="card lsn" id="lsn-${L.id}" data-id="${L.id}">
          <header class="lsn-head"><span class="lsn-n">${n}</span><div><span class="eyebrow">${L.zh}</span><h2 class="title-md">${L.title}</h2></div></header>
          <div class="lsn-text">${L.body.map((p) => `<p>${p}</p>`).join("")}</div>
          <div class="lsn-visual"></div>
          ${L.fact ? `<div class="fact-chip">${I.spark}<span>${L.fact}</span></div>` : ""}
          <div class="takeaway">${I.bulb}<div><b>Remember:</b> ${L.takeaway}</div></div>
          ${L.check ? `<div class="qcheck"></div>` : ""}
        </section>`);
        list.appendChild(sec);
        const vis = $(".lsn-visual", sec);
        try { this["v_" + L.id](vis); } catch (err) { console.error(err); }
        if (L.check) this.quickCheck($(".qcheck", sec), L);
      });

      this.syncProgress();
      this.scrollSpy();
      return root;
    },

    /* ---------------- progress & navigation ---------------- */
    done() { const s = App.store.state; s.course = s.course || {}; return s.course; },
    markDone(id) { if (!this.done()[id]) { this.done()[id] = Date.now(); App.store.save(); } this.syncProgress(); },
    syncProgress() {
      const root = this.root, d = this.done();
      const checks = C.LESSONS.filter((L) => L.check);
      const n = checks.filter((L) => d[L.id]).length;
      $(".cp-label", root).textContent = n === checks.length ? `All ${n} quick checks done 🎉` : `${n} of ${checks.length} quick checks done`;
      requestAnimationFrame(() => { $(".course-progress .bar-fill", root).style.width = (n / checks.length) * 100 + "%"; });
      $$(".toc a", root).forEach((a) => {
        const ok = !!d[a.dataset.id];
        a.classList.toggle("is-done", ok);
        $(".n", a).innerHTML = ok ? I.check : String(C.LESSONS.findIndex((L) => L.id === a.dataset.id) + 1);
      });
    },
    scrollSpy() {
      if (!("IntersectionObserver" in window)) return;
      const root = this.root;
      const ob = new IntersectionObserver((ents) => {
        ents.forEach((e) => { if (e.isIntersecting) $$(".toc a", root).forEach((a) => a.classList.toggle("is-active", a.dataset.id === e.target.dataset.id)); });
      }, { rootMargin: "-35% 0px -60% 0px" });
      $$(".lsn", root).forEach((s) => ob.observe(s));
      App.onCleanup(() => ob.disconnect());
    },

    quickCheck(el, L) {
      const ch = L.check;
      el.innerHTML = `<div class="qcheck-head">${I.target} Quick check</div><div class="qcheck-q">${ch.q}</div><div class="qcheck-opts" role="group"></div><div class="qcheck-fb" aria-live="polite"></div>`;
      const box = $(".qcheck-opts", el), fb = $(".qcheck-fb", el);
      const finish = (b) => {
        b.classList.add("is-right");
        el.classList.add("is-done");
        fb.className = "qcheck-fb good";
        fb.innerHTML = `${I.check}<span><b>Correct.</b> ${ch.why}</span>`;
      };
      shuffle(ch.opts).forEach((o) => {
        let b;
        if (ch.glyphs) {
          const c = App.comp(o.t);
          b = html(`<button class="qopt is-glyph" aria-label="${c.name}, ${c.en}" title="${c.name}"></button>`);
          App.compInk(b, c, { fill: 0.8 });
        } else b = html(`<button class="qopt${isHan(o.t) ? " han" : ""}">${o.t}</button>`);
        b.addEventListener("click", () => {
          if (el.classList.contains("is-done")) return;
          if (o.ok) {
            finish(b);
            App.sfx.correct();
            App.burstAt(b, 0.45);
            this.markDone(L.id);
          } else {
            b.classList.add("is-wrong");
            App.exam.shake(b);
            App.sfx.wrong();
            fb.className = "qcheck-fb bad";
            fb.innerHTML = `${I.x}<span>Not quite. Try another one.</span>`;
          }
        });
        if (o.ok) b.dataset.ok = "1";
        box.appendChild(b);
      });
      if (this.done()[L.id]) finish($("[data-ok]", box));
    },

    /* ================= L1: take it apart ================= */
    v_pieces(el) {
      const EX = [
        { ch: "妈", axis: "x", parts: [["meaning", "女", "woman"], ["sound", "马", "mǎ"]], text: "<span class=\"han\">女</span> (woman) gives the meaning and <span class=\"han\">马</span> mǎ gives the sound: <span class=\"han\">妈</span> mā, mom." },
        { ch: "懂", axis: "x", parts: [["meaning", "忄", "heart"], ["sound", "董", "dǒng"]], text: "<span class=\"han\">忄</span> (heart, mind) gives the meaning and <span class=\"han\">董</span> dǒng gives the sound: <span class=\"han\">懂</span> dǒng, to understand." },
        { ch: "花", axis: "y", parts: [["meaning", "艹", "grass"], ["sound", "化", "huà"]], text: "<span class=\"han\">艹</span> (plants) gives the meaning and <span class=\"han\">化</span> huà gives the sound: <span class=\"han\">花</span> huā, flower." },
        { ch: "跑", axis: "x", parts: [["meaning", "足", "foot"], ["sound", "包", "bāo"]], text: "<span class=\"han\">𧾷</span> (foot) gives the meaning and <span class=\"han\">包</span> bāo gives the sound: <span class=\"han\">跑</span> pǎo, to run." },
        { ch: "明", axis: "x", parts: [["meaning", "日", "sun"], ["meaning", "月", "moon"]], text: "Two meaning parts and no sound part: sun + moon = <span class=\"han\">明</span> míng, bright. More on this in lesson 3." }
      ];
      el.innerHTML = `<div class="split">
        <div class="split-stage"><div class="grid-bg"></div><div class="piece pa"></div><div class="piece pb"></div>
          <span class="split-tag ta"></span><span class="split-tag tb"></span></div>
        <div class="split-side">
          <div class="chips" role="group" aria-label="Characters"></div>
          <div class="split-legend"><span><i class="dot-meaning"></i>meaning part</span><span><i class="dot-sound"></i>sound part</span></div>
          <p class="split-explain"></p>
          <button class="btn btn-sm" data-toggle>${I.shuffle} Put it back together</button>
        </div></div>`;
      new Ink.InkChar($(".grid-bg", el), "一", { strokes: [], grid: "mi" });
      const stage = $(".split-stage", el), pa = $(".pa", el), pb = $(".pb", el), ta = $(".ta", el), tb = $(".tb", el);
      const chips = $(".chips", el), explain = $(".split-explain", el), tog = $("[data-toggle]", el);
      let cur = null, split = false;
      const OFF = { x: [["-7%", "0"], ["7%", "0"]], y: [["0", "-8%"], ["0", "7%"]] };
      const setSplit = (on) => {
        split = on;
        const o = OFF[cur.axis];
        pa.style.transform = on ? `translate(${o[0][0]}, ${o[0][1]})` : "none";
        pb.style.transform = on ? `translate(${o[1][0]}, ${o[1][1]})` : "none";
        stage.classList.toggle("is-split", on);
        tog.innerHTML = on ? `${I.shuffle} Put it back together` : `${I.shuffle} Take it apart`;
        if (on) App.sfx.tick();
      };
      const pick = (ex, auto) => {
        cur = ex;
        $$("button", chips).forEach((b) => b.setAttribute("aria-pressed", b.dataset.ch === ex.ch));
        const g = Ink.groups(ex.ch);
        pa.replaceChildren(); pb.replaceChildren();
        pa.style.transition = pb.style.transition = "none";
        pa.style.transform = pb.style.transform = "none";
        void pa.offsetWidth;
        pa.style.transition = pb.style.transition = "";
        stage.classList.remove("is-split");
        const role = (k) => ex.parts[k][0];
        App.ink(pa, ex.ch, { strokes: g[0], [role(0) === "sound" ? "highlight2" : "highlight"]: g[0] });
        App.ink(pb, ex.ch, { strokes: g[1], [role(1) === "sound" ? "highlight2" : "highlight"]: g[1] });
        const tag = (p) => `<i class="dot-${p[0]}"></i><span class="han">${p[1]}</span> ${p[2]} · ${p[0]}`;
        ta.innerHTML = tag(ex.parts[0]); tb.innerHTML = tag(ex.parts[1]);
        const pos = ex.axis === "y" ? [{ top: "10px", left: "10px" }, { bottom: "10px", left: "10px" }] : [{ bottom: "10px", left: "10px" }, { bottom: "10px", right: "10px" }];
        [ta, tb].forEach((t, k) => { t.style.cssText = ""; Object.assign(t.style, pos[k]); });
        explain.innerHTML = ex.text;
        App.later(() => setSplit(true), auto ? 900 : 450);
      };
      EX.forEach((ex) => {
        const b = html(`<button data-ch="${ex.ch}" aria-label="${ex.ch}">${ex.ch}</button>`);
        b.addEventListener("click", () => pick(ex));
        chips.appendChild(b);
      });
      tog.addEventListener("click", () => setSplit(!split));
      pick(EX[0], true);
    },

    /* ================= L2: picture → character ================= */
    v_pictures(el) {
      el.innerHTML = `<div class="morph">
        <div class="morph-stage"><div class="morph-title"></div>
          <div class="morph-layer l1"></div><div class="morph-layer l2 is-early"></div><div class="morph-layer l3"></div>
          <div class="morph-steps"><span>Picture</span><span>Ancient</span><span>Today</span></div></div>
        <div class="morph-grid"></div></div>`;
      const L1 = $(".l1", el), L2 = $(".l2", el), L3 = $(".l3", el), title = $(".morph-title", el), stepsEl = $$(".morph-steps span", el);
      const grid = $(".morph-grid", el);
      const alive = App.alive();
      let run = 0, idx = 0, autoplay = true;
      const thumbs = C.PICTOGRAPHS.map((p, k) => {
        const b = html(`<button class="morph-thumb" aria-pressed="false"><b>${p.ch}</b><small>${p.en}</small></button>`);
        b.prepend(App.art.make(p.art, "art", { drawn: true, label: p.en }));
        b.addEventListener("click", () => { autoplay = false; idx = k; play(); });
        grid.appendChild(b);
        return b;
      });
      const setStep = (k) => { [L1, L2, L3].forEach((l, j) => l.classList.toggle("is-on", j === k)); stepsEl.forEach((s, j) => s.classList.toggle("is-on", j === k)); };
      const play = async () => {
        const my = ++run;
        const ok = () => alive() && my === run;
        while (ok()) {
          const p = C.PICTOGRAPHS[idx];
          thumbs.forEach((t, j) => t.setAttribute("aria-pressed", j === idx));
          title.innerHTML = `${p.ch}<small>${p.en}</small>`;
          L1.replaceChildren(App.art.make(p.art, "art", { label: p.en }));
          L2.replaceChildren(App.art.make(p.art, "early", { label: "ancient form" }));
          L3.replaceChildren();
          const ink = App.ink(L3, p.ch, { fit: "center", fill: 0.78, grid: "tian", shown: false });
          setStep(0); await App.art.draw(L1.firstChild, 1.15); if (!ok()) return; await sleep(700); if (!ok()) return;
          setStep(1); await sleep(250); await App.art.draw(L2.firstChild, 1); if (!ok()) return; await sleep(600); if (!ok()) return;
          setStep(2); await sleep(250); await ink.animate({ speed: 1.8, gap: 90 }); if (!ok()) return;
          await sleep(1800); if (!ok()) return;
          if (!autoplay) return;
          idx = (idx + 1) % C.PICTOGRAPHS.length;
        }
      };
      App.whenVisible(el, play);
      App.onCleanup(() => { run++; });
    },

    /* ================= L3: pointers & picture puzzles ================= */
    v_combine(el) {
      el.innerHTML = `<div class="sub-h"><span class="han">指事</span> Pointers: a mark on a picture</div><div class="pointers"></div>
        <div class="sub-h" style="margin-top:26px"><span class="han">会意</span> Picture puzzles: two meanings make a new one</div><div class="puzzles" style="margin-top:0"></div>`;
      const pw = $(".pointers", el);
      const inks = [];
      C.POINTERS.forEach((p) => {
        const c = html(`<div class="ptr"><div class="g"></div><b>${p.ch}<span class="py">${p.py}</span></b><small>${p.en}<br>${p.note}</small></div>`);
        const n = Ink.data(p.ch).s.length;
        const rest = Ink.range(n).filter((i) => !p.mark.includes(i));
        const k = App.ink($(".g", c), p.ch, { grid: "tian", highlight: p.mark, shown: false });
        inks.push({ k, order: [...rest, ...p.mark] });
        pw.appendChild(c);
      });
      App.whenVisible(pw, () => inks.forEach((x, i) => App.later(() => x.k.animate({ strokes: x.order, speed: 1.6, gap: 90 }), i * 300)));

      const zw = $(".puzzles", el);
      C.PUZZLES.forEach((p, i) => {
        const part = (x) => `<div class="puz-part"><div class="pic" data-art="${x.art || ""}">${x.art ? "" : `<span class="glyph-only">${x.t}</span>`}</div><small><span class="han">${x.t}</span> ${x.en}</small></div>`;
        const c = html(`<div class="puz">${part(p.parts[0])}<span class="op">+</span>${part(p.parts[1])}<span class="op">=</span>
          <div class="puz-res"><div class="g"></div><small><b>${p.py}</b> ${p.en}</small></div><div class="puz-note">${p.note}</div></div>`);
        $$("[data-art]", c).forEach((pic) => { if (pic.dataset.art) pic.appendChild(App.art.make(pic.dataset.art, "art", { label: pic.dataset.art })); });
        const g = Ink.groups(p.ch);
        const k = App.ink($(".g", c), p.ch, { highlight: g[0], highlight2: g[1], shown: false });
        App.whenVisible(c, () => {
          $$(".art-wrap", c).forEach((a, j) => App.later(() => App.art.draw(a, 1.6), j * 250));
          App.later(() => k.animate({ speed: 2, gap: 60 }), 700 + (i % 2) * 150);
        });
        zw.appendChild(c);
      });
    },

    /* ================= L4: meaning + sound ================= */
    v_sound(el) {
      const total = C.SHUOWEN.reduce((s, x) => s + x.n, 0);
      const pct = (n) => (n / total) * 100;
      el.innerHTML = `<div class="segchart">
          <h4>How the ${total.toLocaleString("en")} characters of the <span class="han">说文解字</span> are built<small>Xu Shen's own count, around AD 100</small></h4>
          <div class="segbar" role="img" aria-label="${C.SHUOWEN.map((x) => `${x.en} ${pct(x.n).toFixed(1)}%`).join(", ")}">${C.SHUOWEN.map((x, k) => `<div class="seg" style="--c:var(--cat-${k + 1})" data-k="${k}">${pct(x.n) >= 10 ? Math.round(pct(x.n)) + "%" : ""}</div>`).join("")}<div class="seg-tip"></div></div>
          <div class="seg-legend">${C.SHUOWEN.map((x, k) => `<div><i style="--c:var(--cat-${k + 1})"></i><b><span class="han">${x.k}</span> ${x.en}</b><small>${x.n.toLocaleString("en")} · ${pct(x.n).toFixed(1)}%</small></div>`).join("")}</div>
        </div>
        <div class="sub-h" style="margin-top:28px"><span class="han">一音多义</span> One sound part, many radicals: tap a radical</div>
        <div class="families"></div>`;
      const bar = $(".segbar", el), tip = $(".seg-tip", el);
      App.whenVisible(bar, () => $$(".seg", bar).forEach((s) => { s.style.width = `calc(${pct(C.SHUOWEN[+s.dataset.k].n)}% - 2px)`; }));
      $$(".seg", bar).forEach((s) => {
        const x = C.SHUOWEN[+s.dataset.k];
        const show = () => {
          tip.innerHTML = `<b class="han">${x.k}</b> ${x.en}<br>${x.n.toLocaleString("en")} characters · ${pct(x.n).toFixed(1)}%`;
          tip.style.left = s.offsetLeft + s.offsetWidth / 2 + "px";
          tip.classList.add("is-on");
        };
        s.addEventListener("mouseenter", show);
        s.addEventListener("mouseleave", () => tip.classList.remove("is-on"));
      });

      const fw = $(".families", el);
      C.FAMILIES.forEach((fam) => {
        const card = html(`<div class="fam-card"><div class="orbit"><div class="orbit-center"><small>${fam.sound} ${fam.py}</small></div></div>
          <div class="fam-result"><div class="g"></div><div><div class="py"></div><small></small></div></div></div>`);
        App.ink($(".orbit-center", card), fam.sound, { fit: "center", fill: 0.82, highlight2: Ink.range(Ink.data(fam.sound).s.length) });
        const orbit = $(".orbit", card), gEl = $(".fam-result .g", card), pyEl = $(".fam-result .py", card), sm = $(".fam-result small", card), res = $(".fam-result", card);
        let auto = true, k = 0;
        const btns = fam.members.map((m, j) => {
          const g = Ink.groups(m.ch);
          const b = html(`<button class="orbit-btn" style="--a:${j * 72}deg" aria-label="${App.comp(m.rad).from.en} radical"></button>`);
          App.ink(b, m.ch, { strokes: g[0], fit: "center", fill: 0.8, highlight: g[0] });
          b.addEventListener("click", () => { auto = false; show(j); });
          orbit.appendChild(b);
          return b;
        });
        const show = (j) => {
          k = j;
          const m = fam.members[j], g = Ink.groups(m.ch), comp = App.comp(m.rad);
          btns.forEach((b, i) => b.setAttribute("aria-pressed", i === j));
          gEl.replaceChildren();
          const ink = App.ink(gEl, m.ch, { grid: "tian", highlight: g[0], highlight2: g[1], shown: false });
          ink.animate({ speed: 2.4, gap: 50 });
          pyEl.innerHTML = `<span class="han" style="font-size:22px;color:var(--ink);margin-right:6px">${m.ch}</span>${m.py}`;
          sm.innerHTML = `<span class="han">${comp.from.ch}</span> ${comp.from.en} + <span class="han">${fam.sound}</span> ${fam.py} → ${m.en}`;
          res.classList.remove("pop"); void res.offsetWidth; res.classList.add("pop");
        };
        App.whenVisible(card, () => {
          show(0);
          const tick = () => { if (!auto || !card.isConnected) return; show((k + 1) % fam.members.length); App.later(tick, 2800); };
          App.later(tick, 2800);
        });
        fw.appendChild(card);
      });
    },

    /* ================= L5: shapes change ================= */
    v_shapes(el) {
      el.innerHTML = `<div class="shapes"></div>`;
      const wrap = $(".shapes", el);
      const ZONE = { left: "translate(-27%, 0) scale(0.42, 0.9)", right: "translate(27%, 0) scale(0.42, 0.9)", top: "translate(0, -31%) scale(0.92, 0.36)", bottom: "translate(0, 33%) scale(0.92, 0.32)" };
      C.SHAPES.forEach((s, i) => {
        const comp = App.comp(s.comp), ex = comp.examples[0];
        const t = html(`<button class="shape-tile" aria-label="${s.full} becomes ${comp.name}">
          <div class="shape-box"><div class="lay full"></div><div class="lay ctx"></div></div>
          <div class="shape-cap"><span class="han">${s.full}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg><span class="mini" style="width:26px;height:26px;display:inline-block"></span></div>
          <div class="shape-name han">${comp.name}</div></button>`);
        const full = $(".full", t), ctx = $(".ctx", t);
        const kFull = App.ink(full, s.full, { fit: "center", fill: 0.76, grid: "tian" });
        const n = Ink.data(ex.ch).s.length;
        const rest = Ink.range(n).filter((x) => !ex.idx.includes(x));
        const kCtx = App.ink(ctx, ex.ch, { highlight: ex.idx, shown: false });
        App.compInk($(".mini", t), comp, { highlight: comp.src[1] });
        let busy = false;
        const play = async () => {
          if (busy) return; busy = true;
          full.style.transition = ctx.style.transition = "none";
          full.style.transform = "none"; full.style.opacity = 1; ctx.style.opacity = 0;
          kCtx.hideAll();
          void full.offsetWidth;
          full.style.transition = ctx.style.transition = "";
          await kFull.animate({ speed: 2.6, gap: 40 });
          await sleep(350);
          full.style.transform = ZONE[s.zone];
          await sleep(650);
          full.style.opacity = 0;
          ctx.style.opacity = 1;
          kCtx.show(rest);
          await kCtx.animate({ strokes: ex.idx, clear: false, speed: 2.2, gap: 60 });
          busy = false;
        };
        ctx.style.opacity = 0;
        t.addEventListener("mouseenter", play);
        t.addEventListener("click", play);
        App.whenVisible(t, () => App.later(play, (i % 6) * 260));
        wrap.appendChild(t);
      });
    },

    /* ================= L6: name decoder ================= */
    v_names(el) {
      el.innerHTML = `<div class="decoder">
        <div><div class="pattern-row"><span><span class="han">…旁</span> side</span><span><span class="han">…头</span> top</span><span><span class="han">…底</span> bottom</span><span><span class="han">…框</span> frame</span><span><span class="han">…字…</span> “the character …”</span></div>
          <div class="name-list" style="margin-top:16px" role="group" aria-label="Radical names"></div></div>
        <div class="decode-panel" aria-live="polite"></div></div>`;
      const listEl = $(".name-list", el), panel = $(".decode-panel", el);
      const pick = (r) => {
        $$("button", listEl).forEach((b) => b.setAttribute("aria-pressed", b.dataset.id === r.id));
        const chars = Array.from(r.name);
        const gl = chars.map((c) => C.NAME_PARTS[c] || c);
        panel.innerHTML = `<div class="decode-top"><div class="g"></div>${App.posDiagram(r.pos)}<div><h4>${r.name}</h4><p>${r.py} · ${r.en}</p></div></div>
          <div class="syl" style="--k:${chars.length}">${chars.map((c, j) => `<div class="${C.POS_WORDS[c] ? "is-pos" : ""}" style="--j:${j}"><b>${c}</b><small>${C.POS_WORDS[c] ? C.POS_WORDS[c] + "<br>(where it sits)" : gl[j]}</small></div>`).join("")}</div>
          <p class="decode-read">Literally: <b>${gl.join(" · ")}</b>. It sits on the <b>${H.POSITIONS[r.pos].label.toLowerCase()}</b> of a character.</p>
          <a class="btn btn-sm" style="margin-top:14px" href="#/learn/${r.id}">Study ${r.name} ${I.arrow}</a>`;
        App.compInk($(".g", panel), r, { grid: "tian", highlight: r.src[1] });
      };
      H.RADICALS.forEach((r) => {
        const b = html(`<button data-id="${r.id}">${r.name}</button>`);
        b.addEventListener("click", () => pick(r));
        listEl.appendChild(b);
      });
      pick(H.RADICALS.find((r) => r.id === "grass"));
    },

    /* ================= L7: meaning families ================= */
    v_families(el) {
      el.innerHTML = `<div class="themes"></div>`;
      const wrap = $(".themes", el);
      C.THEMES.forEach((T) => {
        const card = html(`<div class="theme"><div class="theme-top"><div class="pic"></div><h4>${T.en}<span class="han">${T.zh}</span></h4></div>
          <div class="theme-glyphs"></div><div class="theme-info">Hover a radical.</div></div>`);
        const a = App.art.make(T.art, "art", { label: T.en });
        $(".pic", card).appendChild(a);
        App.whenVisible(card, () => App.art.draw(a, 1.5));
        const info = $(".theme-info", card);
        T.ids.forEach((id) => {
          const c = App.comp(id), o = window.HSK_ORIGINS[id];
          const g = html(`<a href="#/learn/${id}" aria-label="${c.name}: ${c.en}"></a>`);
          App.compInk(g, c, { fill: 0.78 });
          const say = () => { info.innerHTML = `<span class="han">${c.name}</span> <b>${c.from.en}</b>: ${o ? o.means.slice(0, 4).join(", ") : c.meaning}`; };
          g.addEventListener("mouseenter", say); g.addEventListener("focus", say);
          $(".theme-glyphs", card).appendChild(g);
        });
        wrap.appendChild(card);
      });
    },

    /* ================= L8: traps ================= */
    v_traps(el) {
      el.innerHTML = `<div class="traps"></div>`;
      const wrap = $(".traps", el);
      C.TRAPS.forEach((t) => {
        const comp = App.comp(t.comp);
        const ex = comp.examples.find((e) => e.ch === t.ch) || comp.examples[0];
        const py = ex.ch === t.ch ? ex.py : "";
        const c = html(`<div class="trap"><div class="g"></div><div><span class="kind">${t.kind}</span><b class="han">${t.ch} <span class="py" style="font-size:14px;color:var(--accent)">${py}</span></b><p>${t.note}</p></div></div>`);
        App.ink($(".g", c), t.ch, { highlight: ex.idx, grid: "tian" });
        wrap.appendChild(c);
      });
    },

    /* ================= L9: try a real question ================= */
    v_exam(el) {
      const S = H.SETS[10], q = S.qs[0];
      el.innerHTML = `<div class="live"><div class="sheet-instr"><span class="sq"></span><div><div class="han">第25–27题：根据部件组字。</div><p>Try a real question from exam set 11: click the component that completes the word.</p></div></div>
        <div class="opts"></div><div class="qrows"></div></div>
        <div class="course-cta"><a class="btn btn-accent" href="#/practice/1">Practise all 15 exam sets ${I.arrow}</a><a class="btn" href="#/challenge">Mixed challenge</a><a class="btn btn-ghost" href="#/learn">Review the 30 radicals</a></div>`;
      const X = App.exam;
      const ctx = X.questionRow(q);
      $(".qrows", el).appendChild(ctx.row);
      ctx.row.classList.add("is-active");
      let busy = false, solved = false;
      LETTERS.forEach((L) => {
        const comp = App.comp(S.opts[L]);
        const b = X.optionButton(L, comp);
        b.addEventListener("click", async () => {
          if (busy || solved || b.classList.contains("is-wrong")) return;
          busy = true;
          const ok = L === q.ans;
          const ov = await X.fly($(".opt-glyph", b), ctx.tiles, comp, ok, "correct");
          if (ok) {
            X.fillSlot(ctx.tiles, comp, true, "correct"); ov.remove(); X.bloom(ctx.tiles);
            X.stamp(ctx.ans, L, "is-correct"); App.sfx.correct();
            ctx.hint.innerHTML = ""; X.fillExplain(ctx, comp);
            ctx.row.classList.add("is-solved"); ctx.row.classList.remove("is-active");
            b.classList.add("is-used"); solved = true;
            App.burstAt(ctx.ans, 0.7);
          } else {
            b.classList.add("is-wrong"); X.shake(ctx.tiles.el); App.sfx.wrong();
            ctx.hint.innerHTML = X.hintFor(q, comp);
            await X.fallAway(ov);
            ctx.tiles.gap.classList.remove("is-hidden");
          }
          busy = false;
        });
        $(".opts", el).appendChild(b);
      });
    }
  };
})();
