/* ==========================================================================
   Expressions — shared pieces: ink word tiles, the animated word builder
   (two known words → keep a piece of each → the new expression), and the
   lesson quiz (build / meaning / fill-the-gap).
   ========================================================================== */
(function () {
  "use strict";
  const E = window.HSK_EXPR;
  const { $, $$, html, sleep, shuffle } = App;

  const ALL = E.LESSONS.flatMap((L) => L.items);
  const lesson = (n) => E.LESSONS.find((L) => L.n === +n);
  const lessonIndex = (n) => E.LESSONS.findIndex((L) => L.n === +n);

  /* ---------- pattern icons (24px stroke icons) ---------- */
  const P = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICON = {
    tag: P('<path d="M3.5 12.3V4.6a1.1 1.1 0 0 1 1.1-1.1h7.7l8.2 8.2a1.5 1.5 0 0 1 0 2.1l-6.5 6.5a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8.2" cy="8.2" r="1.6"/>'),
    place: P('<path d="M4.5 10.5v9h15v-9"/><path d="M3 10.5 4.8 4.5h14.4l1.8 6c0 1.4-1.3 2.3-2.6 2.3s-2.4-.9-2.6-2.3c-.2 1.4-1.4 2.3-2.8 2.3s-2.6-.9-2.8-2.3c-.2 1.4-1.3 2.3-2.6 2.3S3 11.9 3 10.5z"/><path d="M10 19.5v-4.5h4v4.5"/>'),
    person: P('<circle cx="12" cy="7.5" r="3.6"/><path d="M4.8 20.5c.8-4 3.7-6.4 7.2-6.4s6.4 2.4 7.2 6.4"/>'),
    action: P('<path d="M3.5 12h13"/><path d="M12.5 6.5 18 12l-5.5 5.5"/><path d="M21 6v12"/>'),
    pair: P('<circle cx="8.8" cy="12" r="5.3"/><circle cx="15.2" cy="12" r="5.3"/>'),
    pin: P('<path d="M12 21.2s-6.6-6-6.6-11.1a6.6 6.6 0 0 1 13.2 0c0 5.1-6.6 11.1-6.6 11.1z"/><circle cx="12" cy="10" r="2.4"/>'),
    spark: P('<path d="M12 3.2l1.9 5.6 5.6 1.9-5.6 1.9L12 18.2l-1.9-5.6-5.6-1.9 5.6-1.9z"/><path d="M19 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>'),
    write: P('<path d="M4 20l1-4.5L16 4.5a2.1 2.1 0 0 1 3 3L8 18.5z"/><path d="M14 6.5l3 3"/>')
  };
  const patTag = (pat) => { const p = E.PATTERNS[pat]; return `<span class="pat-tag" data-pat="${pat}">${ICON[p.icon]}<span>${p.short}</span></span>`; };

  /* ---------- ink word tiles: a row of 田-grid cells with pinyin on top ---------- */
  function tiles(word, pys, o) {
    o = o || {};
    const el = html(`<div class="word x-tiles${o.cls ? " " + o.cls : ""}"${o.cell ? ` style="--cell:${o.cell}px"` : ""}></div>`);
    const cells = Array.from(word).map((ch, k) => {
      const c = html(`<div class="cell"><div class="cell-py py">${pys[k] || ""}</div><div class="cell-ch"></div></div>`);
      el.appendChild(c);
      c.ch = ch;
      c.ink = App.ink($(".cell-ch", c), ch, { shown: o.shown !== false, label: ch });
      return c;
    });
    return { el, cells };
  }

  /* Bounding box of several elements */
  const union = (els) => {
    const rs = els.map((e) => e.getBoundingClientRect());
    const l = Math.min(...rs.map((r) => r.left)), r = Math.max(...rs.map((r) => r.right));
    const t = Math.min(...rs.map((r) => r.top)), b = Math.max(...rs.map((r) => r.bottom));
    return { left: l, right: r, top: t, bottom: b, width: r - l, height: b - t, cx: (l + r) / 2 };
  };

  /** Fly one ink character from one cell to another (arc + scale), then show it there. */
  async function flyCell(fromCell, toCell, o) {
    o = o || {};
    const fr = $(".cell-ch", fromCell).getBoundingClientRect(), tr = $(".cell-ch", toCell).getBoundingClientRect();
    if (App.reduceMotion() || !fr.width || !tr.width) { toCell.ink.showAll(); return; }
    const ov = html(`<div class="flight x-flight${o.tone ? " is-" + o.tone : ""}"></div>`);
    Object.assign(ov.style, { left: tr.left + "px", top: tr.top + "px", width: tr.width + "px", height: tr.height + "px" });
    document.body.appendChild(ov);
    App.ink(ov, toCell.ch, {});
    const sx = fr.width / tr.width, dx = fr.left - tr.left, dy = fr.top - tr.top;
    const lift = Math.min(90, Math.abs(dx) * 0.18 + 26);
    const a = ov.animate([
      { transform: `translate(${dx}px, ${dy}px) scale(${sx})` },
      { transform: `translate(${dx * 0.42}px, ${dy * 0.42 - lift}px) scale(${((sx + 1) / 2) * 1.12}) rotate(${dx > 0 ? 5 : -5}deg)`, offset: 0.48 },
      { transform: "none" }
    ], { duration: o.dur || 700, easing: "cubic-bezier(.5,.02,.2,1)" });
    await a.finished.catch(() => {});
    toCell.ink.showAll();
    ov.remove();
    $(".cell-ch", toCell).animate([{ transform: "scale(1.16)" }, { transform: "scale(0.97)", offset: 0.6 }, { transform: "none" }], { duration: 420, easing: "ease-out" });
  }

  /* ======================================================================
     Builder:  [word A] + [word B]  →  [new expression]
     ====================================================================== */
  function builder(e, o) {
    o = Object.assign({ cell: 46, rcell: 62, mini: false, tone: true }, o || {});
    const alive = App.alive();
    const el = html(`<div class="builder${o.mini ? " is-mini" : ""}" data-pat="${e.pat}" style="--cell:${o.cell}px;--rcell:${o.rcell}px">
      <div class="b-src"></div>
      <svg class="b-threads" aria-hidden="true"></svg>
      <div class="b-out">
        <div class="b-res"></div>
        <div class="b-gloss"></div>
        <div class="b-meta"><span class="py b-py">${e.py}</span><span class="b-en">${e.en}</span>${o.mini ? "" : App.speakBtn(e.w, e.py)}</div>
      </div>
    </div>`);
    const srcEl = $(".b-src", el), svg = $(".b-threads", el);
    const pieces = [];
    let plusEl = null;
    const srcs = e.from.map((s, k) => {
      const t = tiles(s.w, s.py, { cell: o.cell });
      const w = html(`<div class="b-word"><div class="b-src-en">${s.en}</div></div>`);
      w.prepend(t.el);
      t.cells.forEach((c, i) => c.classList.add(s.keep.includes(i) ? "is-keep" : "is-drop"));
      if (k === 1) { plusEl = html(`<span class="b-plus" aria-hidden="true">+</span>`); srcEl.appendChild(plusEl); }
      srcEl.appendChild(w);
      return { s, t, w };
    });
    const res = tiles(e.w, e.rp, { cell: o.rcell, shown: false, cls: "b-word-res" });
    $(".b-res", el).appendChild(res.el);
    const gloss = $(".b-gloss", el);
    let j = 0;
    srcs.forEach((S) => {
      const n = S.s.keep.length;
      const p = { src: S.s.keep.map((i) => S.t.cells[i]), word: S.w, res: res.cells.slice(j, j + n), g: S.s.g };
      p.res.forEach((c, m) => {
        const before = S.s.py[S.s.keep[m]];
        if (before !== e.rp[j + m]) { c.classList.add("has-tone"); c.dataset.before = before; $(".cell-py", c).textContent = before; }
      });
      j += n;
      pieces.push(p);
      gloss.appendChild(html(`<span style="width:calc(var(--rcell) * ${n})">${S.s.g}</span>`));
    });

    function drawThreads(animate) {
      const R = el.getBoundingClientRect();
      if (!R.width) return;
      svg.setAttribute("viewBox", `0 0 ${R.width.toFixed(1)} ${R.height.toFixed(1)}`);
      const rr = res.el.getBoundingClientRect();
      let out = "";
      pieces.forEach((p) => {
        const a = union(p.src), wb = p.word.getBoundingClientRect(), b = union(p.res);
        const x1 = a.cx - R.left, y1 = wb.bottom - R.top + 3;
        const x2 = b.cx - R.left, y2 = rr.top - R.top - 5;
        const ym = (y1 + y2) / 2;
        out += `<path class="b-thread" d="M${x1.toFixed(1)} ${y1.toFixed(1)} C${x1.toFixed(1)} ${ym.toFixed(1)} ${x2.toFixed(1)} ${ym.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}"/>`;
        out += `<circle class="b-thread-dot" cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="3.2"/>`;
      });
      svg.innerHTML = out;
      if (animate && !App.reduceMotion()) {
        $$(".b-thread", svg).forEach((pth, k) => {
          const len = pth.getTotalLength();
          pth.style.strokeDasharray = `${len} ${len}`;
          pth.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 520, delay: k * 90, easing: "cubic-bezier(.6,0,.2,1)", fill: "backwards" })
            .finished.then(() => { pth.style.strokeDasharray = ""; }).catch(() => {});
        });
        $$(".b-thread-dot", svg).forEach((d, k) => d.animate([{ opacity: 0, transform: "scale(0)" }, { opacity: 1, transform: "none" }], { duration: 260, delay: 420 + k * 90, fill: "backwards", easing: "ease-out" }));
      }
    }
    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver(() => { if (el.classList.contains("is-threads")) drawThreads(false); });
      ro.observe(el);
      App.onCleanup(() => ro.disconnect());
    }

    let run = 0;
    function reset() {
      run++;
      el.classList.remove("is-pick", "is-threads", "is-built", "is-staged");
      [plusEl, ...srcs.map((S) => S.w)].forEach((n) => n && n.classList.remove("is-on"));
      svg.innerHTML = "";
      res.cells.forEach((c) => { c.ink.hideAll(); if (c.dataset.before) $(".cell-py", c).textContent = c.dataset.before; });
    }
    function finish() {
      reset();
      el.classList.add("is-pick", "is-threads", "is-built");
      res.cells.forEach((c) => { c.ink.showAll(); });
      tones(false);
      requestAnimationFrame(() => drawThreads(false));
    }
    function tones(animate) {
      res.cells.filter((c) => c.dataset.before).forEach((c, k) => {
        const py = $(".cell-py", c), next = e.rp[res.cells.indexOf(c)];
        if (!animate || App.reduceMotion()) { py.textContent = next; return; }
        App.later(() => {
          py.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-6px)" }], { duration: 220, fill: "forwards" }).finished.then(() => {
            py.textContent = next;
            py.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 320, fill: "forwards", easing: "cubic-bezier(.34,1.56,.64,1)" });
            c.classList.add("tone-pulse");
            App.later(() => c.classList.remove("tone-pulse"), 1400);
          }).catch(() => {});
        }, 650 + k * 200);
      });
    }

    /* Staged mode (lesson page): nothing shown yet, waiting for play({ staged: true }). */
    function prime() { reset(); el.classList.add("is-staged"); }

    /**
     * play()                    one continuous animation (showcases)
     * play({ staged, onStep })  word A (1) → word B (2) → keep the pieces (3) → join (4) → use it (5),
     *                           pausing between steps so the narration can be read
     */
    async function play(po) {
      po = po || {};
      reset();
      const my = run;
      const ok = () => alive() && my === run && el.isConnected;
      const step = (n) => { if (po.onStep) po.onStep(n); };
      const pace = po.pace || 1900;
      if (App.reduceMotion()) { finish(); if (po.staged) step(5); return true; }
      if (po.staged) {
        el.classList.add("is-staged");
        await sleep(350); if (!ok()) return false;
        srcs[0].w.classList.add("is-on"); step(1);
        await sleep(pace); if (!ok()) return false;
        if (plusEl) plusEl.classList.add("is-on");
        srcs[1].w.classList.add("is-on"); step(2);
        await sleep(pace); if (!ok()) return false;
        step(3);
        await sleep(250); if (!ok()) return false;
      } else {
        await sleep(260); if (!ok()) return false;
      }
      el.classList.add("is-pick");
      await sleep(po.staged ? pace + 300 : 820); if (!ok()) return false;
      if (po.staged) step(4);
      el.classList.add("is-threads");
      drawThreads(true);
      await sleep(560); if (!ok()) return false;
      const flights = [];
      let k = 0;
      pieces.forEach((p) => p.res.forEach((c, m) => {
        const from = p.src[m], d = k++;
        flights.push(sleep(d * 120).then(() => (ok() ? flyCell(from, c, { tone: "accent" }) : null)));
      }));
      await Promise.all(flights); if (!ok()) return false;
      App.sfx.tick();
      el.classList.add("is-built");
      if (o.tone) tones(true);
      await sleep(po.staged ? 1500 : 700);
      if (po.staged && ok()) step(5);
      return ok();
    }

    /* Write the new expression stroke by stroke inside its own cells. */
    async function write() {
      if (!el.classList.contains("is-built")) finish();
      const my = ++run;
      for (const c of res.cells) {
        c.ink.hideAll();
      }
      for (const c of res.cells) {
        if (my !== run || !alive()) return;
        c.classList.add("is-writing");
        await c.ink.animate({ speed: 1.25, gap: 90 });
        c.classList.remove("is-writing");
      }
    }

    return { el, e, play, prime, reset, finish, write, res, srcs };
  }

  /* Example sentence with the expression highlighted (Chinese + pinyin). */
  function mark(text, word) {
    const i = text.toLowerCase().indexOf(word.toLowerCase());
    if (i < 0) return text;
    return text.slice(0, i) + `<mark>${text.slice(i, i + word.length)}</mark>` + text.slice(i + word.length);
  }
  function sentence(e) {
    return `<div class="x-sent">
      <span class="x-sent-tag han" aria-hidden="true">例</span>
      <div>
        <div class="x-sent-zh han">${mark(e.s.zh, e.w)} ${App.speakBtn(e.s.zh, "the sentence")}</div>
        <div class="x-sent-py py">${mark(e.s.py, e.py)}</div>
        <div class="x-sent-en">${e.s.en}</div>
      </div>
    </div>`;
  }
  /* Short learning notes: the expression's own note, or what happened to 子. */
  function notes(e) {
    const out = [];
    if (e.note) out.push(e.note);
    const sub = e.from.find((s) => Array.from(s.w).some((ch, i) => ch === "子" && !s.keep.includes(i)));
    if (sub && !e.note) out.push(`子 in ${sub.w} is only a noun ending, so it drops off: ${sub.w} → ${sub.keep.map((i) => Array.from(sub.w)[i]).join("")}.`);
    return out;
  }

  /* Loop a builder through several expressions (hero / landing page). */
  function showcase(host, list, o) {
    o = o || {};
    const alive = App.alive();
    let i = 0, run = 0, cur = null;
    const dots = o.dots ? html(`<div class="x-dots" role="tablist" aria-label="Examples"></div>`) : null;
    const stage = html(`<div class="x-stage-in"></div>`);
    host.appendChild(stage);
    if (dots) {
      list.forEach((e, k) => {
        const d = html(`<button role="tab" aria-label="${e.w}"></button>`);
        d.addEventListener("click", () => { i = k; loop(); });
        dots.appendChild(d);
      });
      host.appendChild(dots);
    }
    const loop = async () => {
      const my = ++run;
      const ok = () => alive() && my === run;
      while (ok()) {
        const e = list[i];
        if (dots) $$("button", dots).forEach((b, k) => b.classList.toggle("is-on", k === i));
        if (cur) { const old = cur.el; old.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(-8px)" }], { duration: 300, fill: "forwards" }); await sleep(300); old.remove(); if (!ok()) return; }
        cur = builder(e, Object.assign({ mini: true }, o.builder));
        stage.appendChild(cur.el);
        cur.el.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" });
        if (o.onShow) o.onShow(e);
        await sleep(350); if (!ok()) return;
        const done = await cur.play(); if (!done || !ok()) return;
        await sleep(o.hold || 2600); if (!ok()) return;
        i = (i + 1) % list.length;
      }
    };
    App.whenVisible(host, loop);
    App.onCleanup(() => { run++; });
    return { stop: () => run++ };
  }

  /* ======================================================================
     Quiz
     ====================================================================== */
  /** Resolve a lesson's quiz definitions into question objects. */
  function questions(L) {
    return L.quiz.map((q) => Object.assign({}, q, { e: L.items[q.x], L }));
  }

  function quiz(host, qs, o) {
    o = o || {};
    const alive = App.alive();
    const card = html(`<div class="quiz card">
      <div class="qz-top"><div class="qz-steps" aria-hidden="true"></div><span class="qz-count"></span></div>
      <div class="qz-stage" aria-live="polite"></div>
      <div class="qz-foot"><div class="qz-fb"></div><button class="btn btn-primary qz-next" hidden>Next ${App.icon.arrow}</button></div>
    </div>`);
    host.replaceChildren(card);
    const steps = $(".qz-steps", card), count = $(".qz-count", card), stage = $(".qz-stage", card);
    const fb = $(".qz-fb", card), next = $(".qz-next", card);
    qs.forEach(() => steps.appendChild(html(`<span></span>`)));
    let idx = 0, score = 0, answered = false, cur = null;

    const setStep = () => {
      $$("span", steps).forEach((s, k) => s.classList.toggle("is-on", k === idx));
      count.textContent = `Question ${idx + 1} of ${qs.length}`;
    };
    const settle = (ok, why) => {
      answered = true;
      if (ok) score++;
      $$("span", steps)[idx].classList.add(ok ? "is-right" : "is-wrong");
      fb.innerHTML = `<div class="qz-verdict ${ok ? "is-right" : "is-wrong"}">${ok ? App.icon.check : App.icon.x}<b>${ok ? "Correct" : "Not quite"}</b></div><p>${why}</p>`;
      fb.classList.add("is-on");
      next.hidden = false;
      next.innerHTML = idx === qs.length - 1 ? `See result ${App.icon.arrow}` : `Next ${App.icon.arrow}`;
      if (ok) App.sfx.correct(); else App.sfx.wrong();
      requestAnimationFrame(() => next.focus({ preventScroll: true }));
    };
    const show = () => {
      answered = false;
      fb.classList.remove("is-on"); fb.innerHTML = ""; next.hidden = true;
      setStep();
      const q = qs[idx];
      const node = (q.render || (q.type === "build" ? qBuild : q.type === "meaning" ? qMeaning : qCloze))(q, settle, alive);
      cur = node;
      stage.replaceChildren(node.el);
      // Only animate once the card is in the live page: an element still inside a <template>
      // (first render) belongs to an inert document whose timeline never runs.
      if (card.isConnected && card.ownerDocument === document) {
        node.el.animate([{ opacity: 0, transform: "translateX(18px)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(.16,1,.3,1)" });
      }
    };
    const result = () => {
      cur = null;
      card.classList.add("is-done");
      $$("span", steps).forEach((s) => s.classList.remove("is-on"));
      count.textContent = "Done";
      fb.classList.remove("is-on"); fb.innerHTML = ""; next.hidden = true;
      const pct = score / qs.length;
      const msg = pct === 1 ? (o.perfectMsg || "Perfect! Every piece in the right place.") : pct >= 0.6 ? "Nice work. Look again at the one you missed." : (o.retryMsg || "Have another look at the builders above, then try again.");
      const el = html(`<div class="qz-result">
        ${App.ring(pct, `${score}<small style="font-size:13px;color:var(--ink-4)">/${qs.length}</small>`, pct === 1 ? "jade" : pct >= 0.6 ? "gold" : "")}
        <div><h3 class="title-md">${pct === 1 ? "全对！" : "加油！"} <span class="muted" style="font-size:.7em">${pct === 1 ? "quán duì · all correct" : "jiāyóu · keep going"}</span></h3><p>${msg}</p>
        <div class="btn-row"><button class="btn btn-sm qz-again">${App.icon.replay} Try again</button>${o.nextHref ? `<a class="btn btn-sm btn-primary" href="${o.nextHref}">${o.nextLabel || "Next"} ${App.icon.arrow}</a>` : ""}</div></div>
      </div>`);
      stage.replaceChildren(el);
      App.animateRings(el);
      $(".qz-again", el).addEventListener("click", () => { App.sfx.tick(); (o.restart || restart)(); });
      if (pct === 1) { App.sfx.win(); App.later(() => App.burstAt($(".ring", el), 0.9), 200); }
      o.onDone && o.onDone(score, qs.length);
    };
    const restart = () => { card.classList.remove("is-done"); idx = 0; score = 0; $$("span", steps).forEach((s) => (s.className = "")); show(); };
    next.addEventListener("click", () => { App.sfx.tick(); idx++; if (idx >= qs.length) result(); else show(); });
    App.onKey((ev) => {
      if (!card.isConnected) return false;
      if (ev.key === "Enter" && answered && !next.hidden && document.activeElement !== next) { next.click(); return true; }
      if (!answered && cur && cur.key) return cur.key(ev);
      return false;
    });
    show();
    return { restart };
  }

  const kindLabel = { build: "Build the word", meaning: "What does it mean?", cloze: "Fill the gap" };
  const qHead = (q) => `<div class="qz-kind"><span class="qz-kind-i">${q.type === "build" ? ICON.write : q.type === "meaning" ? ICON.tag : ICON.spark}</span>${kindLabel[q.type]}${q.L && q.showLesson ? `<span class="qz-from">Lesson ${q.L.n}</span>` : ""}</div>`;

  /* --- Build: tap the right characters, in order, from the lesson's source words --- */
  function qBuild(q, settle, alive) {
    const e = q.e, n = Array.from(e.w).length;
    const el = html(`<div class="qz-q qz-build">
      ${qHead(q)}
      <h3 class="qz-prompt">Make the word for <em>“${e.en}”</em> <span class="py">${e.py}</span></h3>
      <div class="qz-slots"></div>
      <div class="qz-pool" role="group" aria-label="Characters to choose from"></div>
      <p class="qz-help muted">Tap the characters in order. Tap a filled box to take it back.</p>
    </div>`);
    const slotsEl = $(".qz-slots", el), pool = $(".qz-pool", el);
    const slots = tiles(e.w, e.rp.map(() => ""), { cell: 66, shown: false, cls: "qz-slot-word" });
    slots.cells.forEach((c) => { c.ink.destroy(); c.ink = null; c.classList.add("is-empty"); });
    slotsEl.appendChild(slots.el);
    // every source word of the lesson, once each, shuffled
    const words = [], seen = new Set();
    q.L.items.forEach((it) => it.from.forEach((s) => { if (!seen.has(s.w)) { seen.add(s.w); words.push(s); } }));
    const picked = [];
    shuffle(words).forEach((s) => {
      const t = tiles(s.w, s.py, { cell: 50, cls: "pool-word" });
      t.cells.forEach((c) => {
        c.setAttribute("role", "button"); c.tabIndex = 0;
        c.setAttribute("aria-label", `${c.ch} ${$(".cell-py", c).textContent}`);
        const go = () => pick(c);
        c.addEventListener("click", go);
        c.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); go(); } });
      });
      pool.appendChild(t.el);
    });
    let done = false, busy = 0;
    async function pick(c) {
      if (done || c.classList.contains("is-used") || picked.length >= n) return;
      const k = picked.length, slot = slots.cells[k];
      picked.push(c);
      c.classList.add("is-used");
      slot.classList.remove("is-empty");
      slot.ch = c.ch;
      const box = $(".cell-ch", slot);
      box.replaceChildren();
      slot.ink = App.ink(box, c.ch, { shown: false });
      $(".cell-py", slot).textContent = $(".cell-py", c).textContent;
      App.sfx.tick();
      busy++;
      await flyCell(c, slot, { dur: 520 });
      busy--;
      if (picked.length === n && !busy) check();
    }
    function unpick(k) {
      if (done || k >= picked.length) return;
      // take back this one and everything after it
      while (picked.length > k) {
        const c = picked.pop(), slot = slots.cells[picked.length];
        c.classList.remove("is-used");
        slot.classList.add("is-empty");
        $(".cell-ch", slot).replaceChildren(); slot.ink = null;
        $(".cell-py", slot).textContent = "";
      }
      App.sfx.tick();
    }
    slots.cells.forEach((s, k) => s.addEventListener("click", () => unpick(k)));
    function check() {
      if (done || !alive()) return;
      done = true;
      const got = picked.map((c) => c.ch).join("");
      const ok = got === e.w;
      el.classList.add("is-checked");
      slots.el.classList.add(ok ? "is-right" : "is-wrong");
      if (ok) App.burstAt(slots.el, 0.7);
      else slots.el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(7px)" }, { transform: "translateX(-4px)" }, { transform: "none" }], { duration: 420 });
      const how = e.from.map((s) => `<b class="han">${s.keep.map((i) => Array.from(s.w)[i]).join("")}</b> ${s.g} <span class="muted">(from <span class="han">${s.w}</span>)</span>`).join(" + ");
      if (!ok) {
        const ans = tiles(e.w, e.rp, { cell: 44, cls: "qz-answer" });
        const wrap = html(`<div class="qz-answer-row"><span class="muted">Answer</span></div>`);
        wrap.appendChild(ans.el);
        slotsEl.appendChild(wrap);
      }
      settle(ok, `${how} = <b class="han">${e.w}</b> <span class="py">${e.py}</span>, ${e.en}.`);
    }
    return { el, key: (ev) => { if (ev.key === "Backspace" && picked.length) { unpick(picked.length - 1); return true; } return false; } };
  }

  /* --- Meaning: pick the English --- */
  function qMeaning(q, settle) {
    const e = q.e;
    const opts = shuffle(q.opts.map((t, k) => ({ t, ok: k === 0 })));
    const el = html(`<div class="qz-q qz-meaning">
      ${qHead(q)}
      <div class="qz-word"></div>
      <div class="qz-opts" role="group" aria-label="Answers"></div>
    </div>`);
    const w = tiles(e.w, e.rp, { cell: 72 });
    const wordBox = $(".qz-word", el);
    wordBox.appendChild(w.el);
    wordBox.insertAdjacentHTML("beforeend", App.speakBtn(e.w, e.py));
    const box = $(".qz-opts", el);
    const btns = opts.map((op, k) => {
      const b = html(`<button class="qz-opt"><kbd>${k + 1}</kbd><span>${op.t}</span></button>`);
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
      if (ok) App.burstAt(btns[k], 0.5);
      settle(ok, q.why);
    }
    return { el, key: (ev) => { const n = +ev.key; if (n >= 1 && n <= btns.length) { choose(n - 1); return true; } return false; } };
  }

  /* --- Fill the gap: choose the expression that fits the sentence --- */
  function qCloze(q, settle) {
    const e = q.e;
    const words = shuffle(q.L.items.slice());
    const [zh, py, en] = q.s;
    const parts = zh.split("＿＿");
    const el = html(`<div class="qz-q qz-cloze">
      ${qHead(q)}
      <p class="qz-sent han">${parts[0]}<span class="qz-blank"><span class="qz-blank-in">？</span></span>${parts[1] || ""}</p>
      <div class="qz-sent-more"><p class="py">${py}</p><p class="muted">${en}</p></div>
      <div class="qz-opts is-words" role="group" aria-label="Answers"></div>
    </div>`);
    const box = $(".qz-opts", el), blank = $(".qz-blank-in", el);
    const btns = words.map((w, k) => {
      const b = html(`<button class="qz-opt"><kbd>${k + 1}</kbd><span class="han">${w.w}</span><span class="py">${w.py}</span></button>`);
      b.addEventListener("click", () => choose(k));
      box.appendChild(b);
      return b;
    });
    let done = false;
    function choose(k) {
      if (done) return;
      done = true;
      const ok = words[k] === e;
      btns.forEach((b, i) => { b.disabled = true; if (words[i] === e) b.classList.add("is-right"); else if (i === k) b.classList.add("is-wrong"); else b.classList.add("is-dim"); });
      blank.textContent = e.w;
      blank.parentElement.classList.add(ok ? "is-right" : "is-wrong");
      if (!ok) blank.parentElement.dataset.tried = words[k].w;
      blank.animate([{ transform: "translateY(-10px) scale(1.2)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 420, easing: "cubic-bezier(.34,1.56,.64,1)" });
      el.classList.add("is-checked");
      if (ok) App.burstAt(blank, 0.5);
      settle(ok, q.why);
    }
    return { el, key: (ev) => { const n = +ev.key; if (n >= 1 && n <= btns.length) { choose(n - 1); return true; } return false; } };
  }

  /* ---------- progress ---------- */
  function stats() {
    const st = App.store.state.expr || {};
    const lessons = E.LESSONS.length;
    const tried = E.LESSONS.filter((L) => st[L.n]).length;
    const perfect = E.LESSONS.filter((L) => st[L.n] && st[L.n].best === L.quiz.length).length;
    return { lessons, tried, perfect };
  }

  App.expr = { E, ALL, lesson, lessonIndex, ICON, patTag, tiles, builder, sentence, notes, showcase, questions, quiz, flyCell, stats };
})();
