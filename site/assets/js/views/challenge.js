/* ==========================================================================
   Challenge — mixed drill: complete / spot / name, with a mastery map
   ========================================================================== */
(function () {
  "use strict";
  const H = window.HSK;
  const { $, $$, html, sleep, shuffle } = App;
  const I = App.icon;
  const X = () => App.exam;
  const LETTERS = ["A", "B", "C", "D"];
  const KINDS = {
    complete: { label: "Complete the character", ico: "懂", desc: "Exactly like Part I: pick the missing radical." },
    spot: { label: "Spot the radical", ico: "跑", desc: "Which radical does this character use?" },
    name: { label: "Name the radical", ico: "扌", desc: "Match the shape to its Chinese name." }
  };

  function accOf(id) { const s = App.store.state.comp[id]; return s && s.s ? s.c / s.s : null; }

  function distractors(id, n, allowEars) {
    const c = App.comp(id);
    const banned = new Set([id]);
    const ban = (x) => { if (!allowEars) { if (x === "hill") banned.add("city"); if (x === "city") banned.add("hill"); } };
    ban(id);
    const look = shuffle(App.lookalikesOf(id));
    const same = shuffle(H.RADICALS.filter((r) => r.pos === c.pos).map((r) => r.id));
    const any = shuffle(H.RADICALS.map((r) => r.id));
    const out = [];
    for (const x of [...look.slice(0, 2), ...same.slice(0, 3), ...any]) {
      if (out.length >= n) break;
      if (!banned.has(x) && !out.includes(x)) { out.push(x); banned.add(x); ban(x); }
    }
    return out;
  }

  function buildPool(kinds, onlyComps) {
    const pool = [];
    if (kinds.complete) {
      for (const S of H.SETS) for (const q of S.qs) {
        pool.push({ kind: "complete", src: `Exam set ${S.n} · Q${q.no}`, word: q.word, py: q.py, t: q.t, miss: q.miss, en: q.en, chEn: q.chEn, why: q.why, sound: q.sound, comp: S.opts[q.ans], fixed: LETTERS.map((L) => S.opts[L]) });
      }
      for (const r of H.RADICALS) for (const e of r.examples) {
        pool.push({ kind: "complete", src: "Textbook example", word: e.word, py: e.wpy, t: e.t, miss: e.idx, en: e.wen, chEn: e.en, why: `${r.name}: ${r.meaning}`, comp: r.id });
      }
    }
    if (kinds.spot) for (const r of H.RADICALS) for (const e of r.examples) pool.push({ kind: "spot", src: "Textbook example", ch: e.ch, py: e.py, en: e.en, idx: e.idx, comp: r.id });
    if (kinds.name) for (const r of H.RADICALS) pool.push({ kind: "name", src: `Lesson ${r.lesson}`, comp: r.id });
    return onlyComps ? pool.filter((p) => onlyComps.has(p.comp)) : pool;
  }

  function sample(pool, n, weak) {
    const w = (it) => {
      if (!weak) return 1;
      const a = accOf(it.comp);
      return a === null ? 1.5 : 0.5 + (1 - a) * 4;
    };
    const left = pool.slice(), out = [];
    while (out.length < n && left.length) {
      const tot = left.reduce((s, it) => s + w(it), 0);
      let r = Math.random() * tot, k = 0;
      while (k < left.length - 1 && (r -= w(left[k])) > 0) k++;
      out.push(left.splice(k, 1)[0]);
    }
    for (let i = 1; i < out.length; i++) if (out[i].comp === out[i - 1].comp) { const j = (i + 2) % out.length; [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  }

  App.views.challenge = {
    nav: "challenge",
    title: "Challenge",
    render() {
      const root = html(`<div class="wrap ch-root"></div>`);
      this.root = root;
      this.cfg = this.cfg || { kinds: { complete: true, spot: true, name: true }, len: 20, weak: false };
      this.setup();
      return root;
    },

    /* ---------------- setup ---------------- */
    setup() {
      const root = this.root, cfg = this.cfg;
      const view = html(`<div>
        <header class="page-head">
          <span class="eyebrow">测 · Challenge</span>
          <h1 class="title-lg">Mixed drill<span class="zh-sub">综合练习</span></h1>
          <p class="lede">A fast, shuffled mix of the 45 exam questions plus 59 textbook examples. Wrong answers are explained, and the mastery map tracks every radical you've answered.</p>
        </header>
        <div class="ch-setup">
          <div class="card ch-panel">
            <h3>Question types</h3><p>Mixing all three works best.</p>
            <div class="opt-list kinds">${Object.entries(KINDS).map(([k, v]) => `
              <button class="toggle-row" data-kind="${k}" aria-pressed="${!!cfg.kinds[k]}"><span class="t-ico">${v.ico}</span><span><b>${v.label}</b><small>${v.desc}</small></span><span class="switch"></span></button>`).join("")}
            </div>
            <h3 style="margin-top:26px">Length</h3>
            <div class="len-pick">${[[10, "quick"], [20, "standard"], [30, "marathon"]].map(([n, l]) => `<button data-len="${n}" aria-pressed="${cfg.len === n}"><b>${n}</b><small>${l}</small></button>`).join("")}</div>
            <div class="opt-list"><button class="toggle-row" data-weak aria-pressed="${cfg.weak}"><span class="t-ico">弱</span><span><b>Focus on weak radicals</b><small>Ask more about radicals you've missed.</small></span><span class="switch"></span></button></div>
            <div class="btn-row" style="margin-top:24px"><button class="btn btn-accent" data-start>Start challenge ${I.arrow}</button></div>
          </div>
          <div class="card ch-panel">
            <h3>Mastery map</h3><p>Each radical is coloured by your accuracy across exam sets and challenges.</p>
            <div class="mastery"></div>
            <div class="legend"><span><i style="background:var(--surface-3)"></i>Not seen</span><span><i style="background:var(--accent-soft-2)"></i>&lt; 50%</span><span><i style="background:var(--gold-soft)"></i>50–80%</span><span><i style="background:var(--jade-soft)"></i>80%+</span></div>
          </div>
        </div>
      </div>`);
      root.replaceChildren(view);

      $$("[data-kind]", view).forEach((b) => b.addEventListener("click", () => {
        const k = b.dataset.kind, on = !cfg.kinds[k];
        if (!on && Object.values(cfg.kinds).filter(Boolean).length === 1) { App.toast("Keep at least one type"); return; }
        cfg.kinds[k] = on; b.setAttribute("aria-pressed", on);
      }));
      $$("[data-len]", view).forEach((b) => b.addEventListener("click", () => { cfg.len = +b.dataset.len; $$("[data-len]", view).forEach((x) => x.setAttribute("aria-pressed", x === b)); }));
      const wb = $("[data-weak]", view);
      wb.addEventListener("click", () => { cfg.weak = !cfg.weak; wb.setAttribute("aria-pressed", cfg.weak); });
      $("[data-start]", view).addEventListener("click", () => this.start());

      const m = $(".mastery", view);
      H.RADICALS.forEach((r) => {
        const a = accOf(r.id), s = App.store.state.comp[r.id];
        const bg = a === null ? "var(--surface-3)" : a < 0.5 ? "var(--accent-soft-2)" : a < 0.8 ? "var(--gold-soft)" : "var(--jade-soft)";
        const t = html(`<a class="m-tile" href="#/learn/${r.id}" style="background:${bg}" title="${r.name} · ${s ? `${s.c}/${s.s} correct` : "not seen yet"}"></a>`);
        App.compInk(t, r, { fill: 0.78 });
        m.appendChild(t);
      });
      App.onKey((e) => { if (view.isConnected && e.key === "Enter" && !e.target.closest("button, a")) { this.start(); return true; } return false; });
    },

    /* ---------------- run ---------------- */
    start(items) {
      const cfg = this.cfg;
      const pool = buildPool(cfg.kinds);
      this.items = items || sample(pool, cfg.len, cfg.weak);
      this.i = 0; this.correct = 0; this.streak = 0; this.best = 0; this.log = [];
      const view = html(`<div class="ch-run">
        <div class="ch-hud">
          <span class="hud-n"></span>
          <div class="bar-track"><div class="bar-fill" style="width:0%"></div></div>
          <span class="streak" title="Streak">${I.flame}<b>0</b></span>
          <button class="btn btn-sm btn-ghost" data-quit>${I.x} Quit</button>
        </div>
        <div class="ch-stage"></div>
      </div>`);
      this.root.replaceChildren(view);
      window.scrollTo({ top: 0, behavior: "smooth" });
      $("[data-quit]", view).addEventListener("click", () => this.finish());
      this.view = view;
      this.next(true);
    },

    async next(first) {
      const alive = App.alive();
      const stage = $(".ch-stage", this.view);
      const old = $(".ch-card", stage);
      if (old && !first) { old.classList.remove("enter"); old.classList.add("leave"); await sleep(300); if (!alive()) return; }
      if (this.i >= this.items.length) return this.finish();
      const it = this.items[this.i];
      $(".hud-n", this.view).textContent = `${this.i + 1} / ${this.items.length}`;
      $(".bar-fill", this.view).style.width = (this.i / this.items.length) * 100 + "%";
      const card = this["card_" + it.kind](it);
      card.classList.add("enter");
      stage.replaceChildren(card);
    },

    record(it, ok) {
      this.log.push({ it, ok });
      App.store.recordComp(it.comp, ok);
      const s = $(".streak", this.view);
      if (ok) { this.correct++; this.streak++; this.best = Math.max(this.best, this.streak); s.classList.remove("bump"); void s.offsetWidth; s.classList.add("bump"); }
      else this.streak = 0;
      $("b", s).textContent = this.streak;
    },

    feedback(card, ok, text, auto) {
      const fb = $(".ch-feedback", card);
      fb.innerHTML = `<div class="fb ${ok ? "good" : "bad"}"><span class="fb-ico">${ok ? I.check : I.x}</span><p>${text}</p><button class="btn btn-sm ${ok ? "" : "btn-primary"}" data-next>Next ${I.arrow}</button></div>`;
      let moved = false;
      const go = () => { if (moved) return; moved = true; this.i++; this.next(); };
      $("[data-next]", fb).addEventListener("click", go);
      this._go = go;
      if (ok && auto) App.later(go, 1700);
    },

    optionKeys(card, pick) {
      App.onKey((e) => {
        if (!card.isConnected) return false;
        const k = e.key.toLowerCase();
        const map = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
        if (k in map && !card.dataset.done) { pick(map[k]); return true; }
        if (e.key === "Enter" && card.dataset.done && this._go) { this._go(); return true; }
        return false;
      });
    },

    shell(it, prompt) {
      return html(`<div class="card ch-card">
        <div class="ch-kind">${KINDS[it.kind].label} <span style="color:var(--ink-4);font-weight:500;letter-spacing:.04em;text-transform:none">· ${it.src}</span></div>
        <div class="ch-prompt">${prompt}</div>
        <div class="ch-center"></div>
        <div class="ch-opts"></div>
        <div class="ch-feedback"></div>
      </div>`);
    },

    /* complete the character */
    card_complete(it) {
      const card = this.shell(it, `Which component completes <b class="py" style="color:var(--accent)">${it.py[it.t]}</b>? <span class="muted" style="font:italic 400 19px var(--font-display)">“${it.en}”</span>`);
      const ctx = { q: { word: it.word, py: it.py, t: it.t, miss: it.miss } };
      ctx.tiles = X().wordTiles(it.word, it.py, it.t, it.miss);
      // The hint button hangs off the side of the tiles, so toggling it never re-centres (moves) them.
      const anchor = html(`<div class="hint-anchor"></div>`);
      anchor.appendChild(ctx.tiles.el);
      $(".ch-center", card).appendChild(anchor);
      const hb = html(`<button class="hint-btn" type="button" aria-pressed="false" title="Show where the missing piece goes (H)">${I.bulb}<span>Hint</span></button>`);
      hb.addEventListener("click", () => X().setHint(ctx.tiles, hb));
      anchor.appendChild(hb);
      App.onKey((e) => { if (card.isConnected && !card.dataset.done && e.key.toLowerCase() === "h") { X().setHint(ctx.tiles, hb); return true; } return false; });
      const ids = it.fixed || shuffle([it.comp, ...distractors(it.comp, 3)]);
      const btns = ids.map((id, k) => {
        const b = X().optionButton(LETTERS[k], App.comp(id));
        b.addEventListener("click", () => pick(k));
        $(".ch-opts", card).appendChild(b);
        return b;
      });
      const alive = App.alive();
      const pick = async (k) => {
        if (card.dataset.done) return;
        card.dataset.done = "1";
        const id = ids[k], comp = App.comp(id), ok = id === it.comp;
        btns.forEach((b) => (b.style.pointerEvents = "none"));
        hb.style.visibility = "hidden";
        const ov = await X().fly($(".opt-glyph", btns[k]), ctx.tiles, comp, ok, "correct");
        if (!alive()) return;
        const ch = it.word[it.t];
        const answer = App.comp(it.comp);
        const why = `<span class="han">${ch}</span> <b class="py">${it.py[it.t]}</b> “${it.chEn}”: ${it.why}${it.sound ? ` <span style="color:var(--gold)">(${it.sound})</span>` : ""}`;
        if (ok) {
          X().fillSlot(ctx.tiles, comp, true, "correct"); ov.remove(); X().bloom(ctx.tiles);
          btns[k].classList.add("is-correct"); btns.forEach((b, j) => j !== k && b.classList.add("is-dim"));
          App.sfx.correct(); this.record(it, true);
          this.feedback(card, true, why, true);
        } else {
          btns[k].classList.add("is-wrong"); X().shake(ctx.tiles.el); App.sfx.wrong(); this.record(it, false);
          await X().fallAway(ov); if (!alive()) return;
          const ck = ids.indexOf(it.comp);
          btns[ck].classList.add("is-correct");
          const ov2 = await X().fly($(".opt-glyph", btns[ck]), ctx.tiles, answer, true, "correct"); if (!alive()) return;
          X().fillSlot(ctx.tiles, answer, true, "correct"); ov2.remove(); X().bloom(ctx.tiles);
          this.feedback(card, false, `The answer is <span class="han">${answer.name}</span> (${answer.en}). ${why}`);
        }
      };
      this.optionKeys(card, pick);
      return card;
    },

    /* spot the radical */
    card_spot(it) {
      const card = this.shell(it, `Which radical is in this character?`);
      const center = $(".ch-center", card);
      const box = html(`<div style="display:flex;flex-direction:column;align-items:center;gap:10px"><div class="ch-big"></div><div class="ch-sub"><b class="py" style="font-style:normal;color:var(--accent)">${it.py}</b> · ${it.en} ${App.speakBtn(it.ch)}</div></div>`);
      center.appendChild(box);
      const big = App.ink($(".ch-big", box), it.ch, { grid: "tian" });
      const ids = shuffle([it.comp, ...distractors(it.comp, 3)]);
      const btns = ids.map((id, k) => {
        const b = X().optionButton(LETTERS[k], App.comp(id));
        b.addEventListener("click", () => pick(k));
        $(".ch-opts", card).appendChild(b);
        return b;
      });
      const pick = (k) => {
        if (card.dataset.done) return;
        card.dataset.done = "1";
        const ok = ids[k] === it.comp, answer = App.comp(it.comp);
        btns.forEach((b) => (b.style.pointerEvents = "none"));
        const ck = ids.indexOf(it.comp);
        btns[ck].classList.add("is-correct");
        big.setHighlight(it.idx);
        big.animate({ strokes: it.idx, clear: true, speed: 1.4 });
        const txt = `<span class="han">${it.ch}</span> uses <span class="han">${answer.name}</span> (${answer.en}). ${answer.meaning}`;
        if (ok) { btns.forEach((b, j) => j !== k && b.classList.add("is-dim")); App.sfx.correct(); this.record(it, true); this.feedback(card, true, txt, true); }
        else { btns[k].classList.add("is-wrong"); App.sfx.wrong(); this.record(it, false); this.feedback(card, false, txt); }
      };
      this.optionKeys(card, pick);
      return card;
    },

    /* name the radical */
    card_name(it) {
      const r = App.comp(it.comp);
      const ear = r.id === "hill" || r.id === "city";
      const card = this.shell(it, ear ? `What is the radical in red called?` : `What is this radical called?`);
      const center = $(".ch-center", card);
      const box = html(`<div class="ch-big"></div>`);
      center.appendChild(box);
      if (ear) { const e = r.examples[0]; const k = App.ink(box, e.ch, { grid: "tian", highlight: e.idx, shown: false }); k.animate({ speed: 1.5 }); }
      else { const k = App.compInk(box, r, { grid: "mi", shown: false, fill: 0.7 }); k.animate({ speed: 1.3 }); }
      const ids = shuffle([r.id, ...distractors(r.id, 3, true)]);
      const opts = $(".ch-opts", card); opts.classList.add("names");
      const btns = ids.map((id, k) => {
        const c = App.comp(id);
        const b = html(`<button class="opt ch-opt-name"><span class="opt-letter">${LETTERS[k]}</span><b>${c.name}</b><small>${c.py}</small></button>`);
        b.addEventListener("click", () => pick(k));
        opts.appendChild(b);
        return b;
      });
      const pick = (k) => {
        if (card.dataset.done) return;
        card.dataset.done = "1";
        const ok = ids[k] === r.id;
        btns.forEach((b) => (b.style.pointerEvents = "none"));
        btns[ids.indexOf(r.id)].classList.add("is-correct");
        const txt = `<span class="han">${r.name}</span> ${r.py}, “${r.en}”. ${r.meaning}`;
        if (ok) { btns.forEach((b, j) => j !== k && b.classList.add("is-dim")); App.sfx.correct(); this.record(it, true); this.feedback(card, true, txt, true); }
        else { btns[k].classList.add("is-wrong"); App.sfx.wrong(); this.record(it, false); this.feedback(card, false, txt); }
      };
      this.optionKeys(card, pick);
      return card;
    },

    /* ---------------- results ---------------- */
    finish() {
      const n = this.log.length;
      const acc = n ? this.correct / n : 0;
      const pct = Math.round(acc * 100);
      const title = !n ? "Challenge ended" : acc === 1 ? "Flawless! 满分！" : acc >= 0.8 ? "Excellent. 很棒！" : acc >= 0.6 ? "Good work. 不错！" : "Keep practising. 加油！";
      const byComp = {};
      this.log.forEach(({ it, ok }) => { const b = (byComp[it.comp] = byComp[it.comp] || { ok: 0, bad: 0 }); ok ? b.ok++ : b.bad++; });
      const missed = this.log.filter((l) => !l.ok).map((l) => l.it);
      const view = html(`<div class="ch-run"><div class="card ch-result">
        <span class="eyebrow">Results</span>
        ${App.ring(acc, n ? pct + "%" : "–", acc >= 0.8 ? "jade" : acc >= 0.6 ? "gold" : "")}
        <h2 class="title-md">${title}</h2>
        <p class="sub">${this.correct} of ${n} correct · best streak ${this.best}</p>
        <div class="ch-breakdown"></div>
        <div class="btn-row">
          ${missed.length ? `<button class="btn btn-accent" data-missed>${I.target} Retry the ${missed.length} I missed</button>` : ""}
          <button class="btn btn-primary" data-again>${I.shuffle} New round</button>
          <button class="btn" data-setup>Settings</button>
        </div>
      </div></div>`);
      const bd = $(".ch-breakdown", view);
      Object.entries(byComp).sort((a, b) => b[1].bad - a[1].bad).forEach(([id, v]) => {
        const c = App.comp(id);
        const chip = html(`<a class="bd ${v.bad ? "bad" : "good"}" href="#/learn/${id}" title="${c.name}"><span class="g"></span><span>${v.ok ? `<b style="color:var(--jade)">✓${v.ok}</b>` : ""} ${v.bad ? `<b style="color:var(--accent)">✗${v.bad}</b>` : ""}</span></a>`);
        App.compInk($(".g", chip), c, { fill: 0.8 });
        bd.appendChild(chip);
      });
      this.root.replaceChildren(view);
      App.animateRings(view);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (n && acc >= 0.8) App.later(() => { App.sfx.win(); App.burstAt($(".ring", view), acc === 1 ? 1.3 : 0.8); }, 700);
      const m = $("[data-missed]", view);
      if (m) m.addEventListener("click", () => this.start(shuffle(missed)));
      $("[data-again]", view).addEventListener("click", () => this.start());
      $("[data-setup]", view).addEventListener("click", () => this.setup());
    }
  };
})();
