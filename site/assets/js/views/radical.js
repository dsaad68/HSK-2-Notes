/* ==========================================================================
   Radical detail — stroke player, facts, examples, handwriting, exam links
   ========================================================================== */
(function () {
  "use strict";
  const H = window.HSK;
  const { $, $$, html } = App;
  const I = App.icon;

  const SPEEDS = [0.5, 1, 1.5, 2];

  App.views.radical = {
    nav: "learn",
    title(id) { const r = App.comp(id); return r ? r.name + " " + r.py : "Radical"; },

    render(id) {
      const r = App.comp(id);
      if (!r) return html(`<div class="wrap page-head"><h1 class="title-lg">Radical not found</h1><p class="lede"><a href="#/learn" style="color:var(--accent)">Back to all radicals</a></p></div>`);
      const list = r.isExtra ? H.EXTRAS : H.RADICALS;
      const k = list.indexOf(r);
      const prev = list[(k - 1 + list.length) % list.length], next = list[(k + 1) % list.length];
      const P = H.POSITIONS[r.pos];
      const nStrokes = r.src[1].length;
      const refs = App.examRefs(r.id);

      const root = html(`<div class="wrap">
        <div class="crumbs">
          <a class="back" href="#/learn">${I.back} All radicals</a>
          <div class="pager">
            <a href="#/learn/${prev.id}" aria-label="Previous: ${prev.name}">${I.prev}<span class="han">${prev.name}</span></a>
            <a href="#/learn/${next.id}" aria-label="Next: ${next.name}"><span class="han">${next.name}</span>${I.next}</a>
          </div>
        </div>

        <section class="detail-hero">
          <div class="card player">
            <div class="player-stage"></div>
            <div class="player-controls">
              <div class="group">
                <button class="ctrl" data-act="prev" aria-label="Previous stroke">${I.prev}</button>
                <button class="ctrl is-primary" data-act="play" aria-label="Play">${I.play}</button>
                <button class="ctrl" data-act="next" aria-label="Next stroke">${I.next}</button>
              </div>
              <div class="group">
                <button class="speed" data-act="speed" aria-label="Animation speed">1×</button>
                <button class="ctrl" data-act="numbers" aria-pressed="true" aria-label="Stroke numbers" title="Stroke numbers">${I.numbers}</button>
                <button class="ctrl" data-act="ghost" aria-pressed="true" aria-label="Outline" title="Outline">${I.eye}</button>
              </div>
            </div>
            <div class="stroke-rail" role="list" aria-label="Strokes in order"></div>
          </div>

          <div class="info">
            <span class="eyebrow">${r.isExtra ? "Exam component" : `Lesson ${r.lesson} · radical ${k + 1} of 30`}</span>
            <div class="rad-title" style="margin-top:16px">
              <div class="big-glyph" style="view-transition-name: rad-${r.id}"></div>
              <div>
                <h1>${r.name}</h1>
                <div class="py-line"><span class="py">${r.py}</span>${App.speakBtn(r.name)}</div>
                <div class="en-line">“${r.en}”</div>
              </div>
            </div>
            <dl class="facts">
              <div class="fact"><dt>Strokes</dt><dd><span style="font:600 30px/1 var(--font-display)">${nStrokes}</span><small>${r.strokes.join(" · ")}</small></dd></div>
              <div class="fact"><dt>Comes from</dt><dd><span class="from-arrow"><span class="mini from-full"></span><svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg><span class="mini from-rad"></span></span><small><span class="han">${r.from.ch}</span> ${r.from.py} · ${r.from.en}</small></dd></div>
              <div class="fact"><dt>Position</dt><dd>${App.posDiagram(r.pos)}<small>${P.label}<br><span class="han">${P.term}</span></small></dd></div>
            </dl>
            <p class="meaning">${r.meaning}</p>
            ${r.tip ? `<div class="callout">${I.bulb}<div>${r.tip}</div></div>` : ""}
            <div class="detail-actions">
              <button class="btn btn-sm" data-go="write">${I.pen} Practise writing</button>
              ${r.isExtra ? "" : `<button class="btn btn-sm" data-scan>${I.image} Textbook page</button>`}
              ${refs.length ? `<button class="btn btn-sm btn-ghost" data-go="exam">${I.target} In the exam (${refs.length})</button>` : ""}
            </div>
            ${window.HSK_ORIGINS && HSK_ORIGINS[r.id] ? `<div class="card memo">
              <div class="memo-art" role="button" tabindex="0" aria-label="Replay the picture of ${r.from.en}" title="Replay"></div>
              <div class="memo-body">
                <span class="memo-k">${I.bulb} Memory hook</span>
                <p class="memo-hook">${HSK_ORIGINS[r.id].hook}</p>
                <div class="means">${HSK_ORIGINS[r.id].means.map((m) => `<span class="chip">${m}</span>`).join("")}</div>
              </div>
            </div>` : ""}
          </div>
        </section>

        ${window.HSK_ORIGINS && HSK_ORIGINS[r.id] ? `<section class="section" id="sec-origin" style="padding-top:16px">
          <div class="section-head"><div><span class="eyebrow">源 · Origin</span><h2 class="title-md" style="margin-top:10px">From a picture to ${r.name}</h2></div>
            <button class="btn btn-sm btn-ghost" data-evo-replay>${I.replay} Replay</button></div>
          <div class="card evo" aria-label="How ${r.name} evolved"></div>
          <div class="card origin-story"><h3>Where it comes from</h3><p>${HSK_ORIGINS[r.id].story}</p></div>
          <div class="card links">
            <h3>Does the meaning fit your characters?</h3>
            <p>Not every character keeps its radical's meaning. Here's how each example really relates to ${r.name}.</p>
            <div class="link-rows"></div>
            <div class="rel-legend">${Object.entries(HSK_REL).map(([k, v]) => `<span class="rel-${k}" title="${v.desc}"><i></i>${v.label}</span>`).join("")}</div>
          </div>
        </section>` : ""}

        <section class="section" style="padding-top:16px">
          <div class="section-head"><div><span class="eyebrow">例字 · Examples</span><h2 class="title-md" style="margin-top:10px">See it inside real characters</h2></div>
          <p class="muted">Click a character to replay it. The radical is drawn in red.</p></div>
          <div class="examples"></div>
        </section>

        <section class="section" style="padding-top:8px">
          <div class="section-head"><div><span class="eyebrow">字族 · Family</span><h2 class="title-md" style="margin-top:10px">More characters with ${r.name}</h2></div><p class="muted">Tap one to hear it.</p></div>
          <div class="family">${Array.from(r.family).map((c) => `<button class="fam han" data-say="${c}" aria-label="${c}">${c}</button>`).join("")}</div>
        </section>

        <section class="section" id="sec-write" style="padding-top:8px">
          <div class="section-head"><div><span class="eyebrow">写 · Write</span><h2 class="title-md" style="margin-top:10px">Write it yourself</h2></div></div>
          <div class="card write">
            <div class="write-pad">
              <svg class="bg-grid" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M50 0V100M0 50H100" stroke="var(--grid)" stroke-dasharray="1.5 1.5" stroke-width=".5"/>
                <path d="M0 0L100 100M100 0L0 100" stroke="var(--grid)" stroke-dasharray="1.5 1.5" stroke-width=".35" opacity=".7"/>
              </svg>
              <div class="hw"></div>
            </div>
            <div class="write-side">
              <h3>Trace the strokes in order</h3>
              <p>Draw each stroke with your mouse, finger or stylus. Wrong strokes are rejected, and after two misses the next stroke flashes as a hint.</p>
              <div class="write-tabs" role="group" aria-label="What to write"></div>
              <div class="btn-row">
                <button class="btn btn-sm" data-w="restart">${I.reset} Restart</button>
                <button class="btn btn-sm" data-w="demo">${I.play} Show me</button>
                <button class="btn btn-sm btn-ghost" data-w="outline" aria-pressed="true">${I.eye} Outline</button>
              </div>
              <div class="write-status"><div class="dotline"></div><span class="msg"></span></div>
            </div>
          </div>
        </section>

        ${refs.length ? `<section class="section" id="sec-exam" style="padding-top:8px">
          <div class="section-head"><div><span class="eyebrow">考 · In the exam</span><h2 class="title-md" style="margin-top:10px">Where ${r.name} is the answer</h2></div></div>
          <div class="exam-refs">${refs.map(({ set, q }) => {
            const w = Array.from(q.word).map((c, i) => (i === q.t ? `<b>${c}</b>` : c)).join("");
            return `<a class="exam-ref" href="#/practice/${set}"><div><span class="han">${w}</span><small>${q.py.join(" ")} · ${q.en}</small></div><span class="badge">Set ${set} · Q${q.no}</span></a>`;
          }).join("")}</div>
        </section>` : ""}
      </div>`);

      this.r = r;
      this.root = root;
      this.buildPlayer(root, r);
      this.buildFacts(root, r);
      this.buildOrigin(root, r);
      this.buildExamples(root, r);
      this.buildWriter(root, r);

      $$("[data-go]", root).forEach((b) => b.addEventListener("click", () => {
        const t = $("#sec-" + b.dataset.go, root); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
      }));
      const scan = $("[data-scan]", root);
      if (scan) scan.addEventListener("click", () => App.lightbox(`assets/scans/radicals/${r.lesson}.webp`, `Lesson ${r.lesson} · 学习偏旁知识，认读例字`));

      App.onKey((e) => {
        if (e.key === "ArrowLeft" && e.shiftKey) { App.go("#/learn/" + prev.id); return true; }
        if (e.key === "ArrowRight" && e.shiftKey) { App.go("#/learn/" + next.id); return true; }
        if (e.key === " " && !e.target.closest("button, a")) { this.toggle(); return true; }
        if (e.key === "ArrowRight") { this.step(1); return true; }
        if (e.key === "ArrowLeft") { this.step(-1); return true; }
        return false;
      });

      App.later(() => App.store.studied(r.id), 2500);
      return root;
    },

    mounted() {
      // Let the shared-element transition land, then start drawing.
      App.later(() => this.play(), 650);
    },

    /* ---------------- stroke player ---------------- */
    buildPlayer(root, r) {
      const stage = $(".player-stage", root);
      const idx = r.src[1];
      this.player = App.compInk(stage, r, { grid: "mi", ghost: true, numbers: true, fill: 0.7 });
      this.cur = idx.length;
      this.playing = false;
      this.speed = App.store.setting("speed") || 1;
      const rail = $(".stroke-rail", root);
      this.chips = idx.map((si, k) => {
        const name = r.strokes[k] || "";
        const meta = H.STROKES[name] || ["", ""];
        const chip = html(`<button class="stroke-chip" role="listitem" aria-label="Stroke ${k + 1}: ${name} ${meta[0]}, ${meta[1]}">
          <span class="k">${k + 1}</span><span class="chip-glyph"></span><b>${name}</b><small>${meta[0]}<br>${meta[1]}</small></button>`);
        const mini = App.compInk($(".chip-glyph", chip), r, { fill: 0.7, highlight: [si] });
        mini.showUpTo(k + 1);
        chip.addEventListener("click", () => this.jump(k));
        rail.appendChild(chip);
        return chip;
      });
      const playBtn = $('[data-act="play"]', root);
      this.syncPlay = () => { playBtn.innerHTML = this.playing ? App.icon.pause : App.icon.play; playBtn.setAttribute("aria-label", this.playing ? "Pause" : "Play"); };
      $('[data-act="play"]', root).addEventListener("click", () => this.toggle());
      $('[data-act="prev"]', root).addEventListener("click", () => this.step(-1));
      $('[data-act="next"]', root).addEventListener("click", () => this.step(1));
      const sp = $('[data-act="speed"]', root);
      sp.textContent = this.speed + "×";
      sp.addEventListener("click", () => {
        this.speed = SPEEDS[(SPEEDS.indexOf(this.speed) + 1) % SPEEDS.length];
        App.store.setting("speed", this.speed);
        sp.textContent = this.speed + "×";
        if (this.playing) { this.pause(); this.play(); }
      });
      const tg = (sel, fn) => { const b = $(sel, root); b.addEventListener("click", () => { const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); fn(on); }); };
      tg('[data-act="numbers"]', (on) => this.player.setNumbers(on));
      tg('[data-act="ghost"]', (on) => this.player.setGhost(on));
      this.setChip(-1);
    },

    setChip(k) {
      this.chips.forEach((c, i) => c.classList.toggle("is-on", i === k));
      const c = this.chips[k];
      if (c && c.parentElement) {
        const rail = c.parentElement;
        const target = c.offsetLeft - rail.clientWidth / 2 + c.offsetWidth / 2;
        rail.scrollTo({ left: target, behavior: "smooth" });
      }
    },

    async play() {
      const idx = this.r.src[1];
      if (this.cur >= idx.length) this.cur = 0;
      this.playing = true; this.syncPlay();
      this.player.showUpTo(this.cur);
      const from = this.cur;
      const done = await this.player.animate({
        strokes: idx.slice(from), clear: false, speed: this.speed,
        onStart: (i, k) => this.setChip(from + k),
        onStroke: (i, k) => { this.cur = from + k + 1; }
      });
      if (done) { this.playing = false; this.syncPlay(); App.later(() => this.setChip(-1), 900); }
    },
    pause() {
      this.player.stop();
      this.player.showUpTo(this.cur);
      this.playing = false; this.syncPlay();
    },
    toggle() { if (this.playing) this.pause(); else this.play(); },
    async step(dir) {
      const idx = this.r.src[1];
      this.pause();
      if (dir < 0) { this.cur = Math.max(0, this.cur - 1); this.player.showUpTo(this.cur); this.setChip(this.cur - 1); return; }
      if (this.cur >= idx.length) this.cur = 0;
      this.player.showUpTo(this.cur);
      const k = this.cur;
      this.setChip(k);
      this.cur = k + 1;
      await this.player.drawStroke(idx[k], { speed: this.speed });
    },
    async jump(k) {
      const idx = this.r.src[1];
      this.pause();
      this.player.showUpTo(k);
      this.setChip(k);
      this.cur = k + 1;
      await this.player.drawStroke(idx[k], { speed: this.speed });
    },

    /* ---------------- hero glyph + facts ---------------- */
    buildFacts(root, r) {
      App.compInk($(".big-glyph", root), r, { grid: "tian", fill: 0.72 });
      const full = $(".from-full", root);
      if (Ink.data(r.from.ch)) App.ink(full, r.from.ch, { fit: "center", fill: 0.82 });
      else full.innerHTML = `<span class="han" style="font-size:30px">${r.from.ch}</span>`;
      App.compInk($(".from-rad", root), r, { fill: 0.82, highlight: r.src[1] });
    },

    /* ---------------- origin: picture → ancient → full → radical → word ---------------- */
    buildOrigin(root, r) {
      const o = window.HSK_ORIGINS && HSK_ORIGINS[r.id];
      const evo = $(".evo", root);
      if (!o || !evo) return;
      const e0 = r.examples[0];
      const steps = [];
      const arrows = [];
      const addStep = (title, sub, cls) => {
        if (steps.length) {
          const a = html(`<div class="evo-arrow" aria-hidden="true"><svg viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 7H22"/><path d="M17 2L23 7L17 12" stroke-dasharray="none"/></svg></div>`);
          evo.appendChild(a); arrows.push(a);
        }
        const s = html(`<figure class="evo-step"><div class="evo-card ${cls || ""}"></div><figcaption><b>${title}</b><span>${sub}</span></figcaption></figure>`);
        evo.appendChild(s);
        const st = { el: s, card: $(".evo-card", s) };
        steps.push(st);
        return st;
      };

      const sPic = addStep("The picture", r.from.en);
      sPic.art = App.art.make(r.id, "art", { label: r.from.en });
      sPic.card.appendChild(sPic.art);

      // Memory card in the hero: the picture draws itself; click to replay.
      const memo = $(".memo-art", root);
      if (memo) {
        const a = App.art.make(r.id, "art", { label: r.from.en });
        memo.appendChild(a);
        const replay = () => App.art.draw(a, 0.9);
        memo.addEventListener("click", replay);
        memo.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); replay(); } });
        App.whenVisible(memo, () => App.later(replay, 500));
      }

      let sFull = null;
      if (r.from.ch !== r.glyph && Ink.data(r.from.ch)) {
        sFull = addStep("Full character", `<span class="han">${r.from.ch}</span> ${r.from.py}`);
        sFull.ink = App.ink(sFull.card, r.from.ch, { fit: "center", fill: 0.8, grid: "tian", shown: false });
      }
      const sRad = addStep("As a radical", `<span class="han">${r.name}</span>`);
      sRad.ink = App.compInk(sRad.card, r, { grid: "tian", highlight: r.src[1], shown: false, fill: 0.72 });
      const sWord = addStep("In a word", `<span class="han">${e0.word}</span> ${e0.wpy.join(" ")}`);
      sWord.ink = App.ink(sWord.card, e0.ch, { grid: "tian", highlight: e0.idx, shown: false });

      const alive = App.alive();
      let run = 0;
      const play = async () => {
        const my = ++run;
        const ok = () => alive() && my === run;
        steps.forEach((s) => { s.el.classList.remove("is-on", "is-active"); if (s.ink) s.ink.hideAll(); if (s.art) App.art.reset(s.art); });
        arrows.forEach((a) => a.classList.remove("is-on"));
        for (let k = 0; k < steps.length; k++) {
          if (!ok()) return;
          const s = steps[k];
          if (k) arrows[k - 1].classList.add("is-on");
          s.el.classList.add("is-on", "is-active");
          if (k && s.el.scrollIntoView && evo.scrollWidth > evo.clientWidth + 4) evo.scrollTo({ left: s.el.offsetLeft - evo.clientWidth / 2 + s.el.offsetWidth / 2, behavior: "smooth" });
          if (s.art) await App.art.draw(s.art, 1.1);
          else if (s.ink) await s.ink.animate({ speed: 2.2, gap: 70 });
          if (!ok()) return;
          await App.sleep(350);
          s.el.classList.remove("is-active");
          if (k) arrows[k - 1].classList.remove("is-on");
        }
      };
      App.whenVisible(evo, play);
      $("[data-evo-replay]", root).addEventListener("click", play);
      App.onCleanup(() => { run++; });

      // Does the meaning fit? one row per example
      const rowsEl = $(".link-rows", root);
      const ARC = { strong: "meaning", partial: "loosely", sound: "sound", form: "shape only" };
      r.examples.forEach((e) => {
        const L = o.links[e.ch];
        if (!L) return;
        const row = html(`<div class="link-row rel-${L.rel}">
          <div class="link-art"></div>
          <div class="link-arrow"><span>${ARC[L.rel]}</span><svg viewBox="0 0 100 26" preserveAspectRatio="none"><path class="arc" d="M4 18C30 4 70 4 94 16"/><path d="M86 9L95 16L86 22"/></svg></div>
          <div class="link-char"></div>
          <div class="link-text"><span class="rel-badge">${HSK_REL[L.rel].label}</span><div><b class="han">${e.ch}</b><span class="py">${e.py}</span> · ${e.en} ${App.speakBtn(e.ch)}</div><p>${L.note}</p></div>
        </div>`);
        const a = App.art.make(r.id, "art", { drawn: true, label: r.from.en });
        $(".link-art", row).appendChild(a);
        App.ink($(".link-char", row), e.ch, { highlight: e.idx, grid: "tian" });
        rowsEl.appendChild(row);
      });
    },

    /* ---------------- examples ---------------- */
    buildExamples(root, r) {
      const wrap = $(".examples", root);
      r.examples.forEach((e, n) => {
        const d = Ink.data(e.ch);
        const rest = Ink.range(d.s.length).filter((i) => !e.idx.includes(i));
        const word = Array.from(e.word).map((c, i) => (i === e.t ? `<b>${c}</b>` : c)).join("");
        const card = html(`<div class="card ex-card reveal" style="--d:${n * 90}ms">
          <div class="ex-glyph" role="button" tabindex="0" aria-label="Replay ${e.ch}"><span class="replay-hint">${I.replay}</span></div>
          <div>
            <div class="ex-py"><span class="han" style="color:var(--ink);font-size:30px;margin-right:4px">${e.ch}</span>${e.py}${App.speakBtn(e.ch)}</div>
            <div class="ex-en">${e.en}</div>
            <div class="ex-split"><span class="eq-glyph"></span><span>+</span><span class="eq-glyph"></span><span>=</span><span class="han" style="font-size:22px;color:var(--ink)">${e.ch}</span></div>
            <div class="ex-word"><span class="han">${word}</span>${App.speakBtn(e.word)}<small>${e.wpy.join(" ")} · ${e.wen}</small></div>
          </div>
        </div>`);
        const k = App.ink($(".ex-glyph", card), e.ch, { grid: "tian", highlight: e.idx, shown: false, ghost: true });
        const eqs = $$(".eq-glyph", card);
        App.ink(eqs[0], e.ch, { strokes: e.idx, fit: "center", highlight: e.idx });
        App.ink(eqs[1], e.ch, { strokes: rest, fit: "center" });
        const replay = () => k.animate({ speed: 1.6, gap: 90 });
        $(".ex-glyph", card).addEventListener("click", replay);
        $(".ex-glyph", card).addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); replay(); } });
        App.whenVisible(card, () => App.later(replay, 250 + n * 400));
        wrap.appendChild(card);
      });
    },

    /* ---------------- handwriting (Hanzi Writer) ---------------- */
    buildWriter(root, r) {
      const pad = $(".write-pad", root), hw = $(".hw", root);
      const tabs = $(".write-tabs", root), dots = $(".dotline", root), msg = $(".write-status .msg", root);
      if (!window.HanziWriter) { $(".write", root).innerHTML = `<p class="muted" style="padding:20px">Handwriting practice needs <code>assets/vendor/hanzi-writer.min.js</code>.</p>`; return; }
      const targets = [{ label: r.name, comp: true, n: r.src[1].length }, ...r.examples.map((e) => ({ label: e.ch, ch: e.ch, idx: e.idx, n: Ink.data(e.ch).s.length }))];
      let writer = null, current = 0, outline = true;
      const alive = App.alive();

      targets.forEach((t, i) => {
        const b = html(`<button class="write-tab" aria-pressed="${i === 0}" aria-label="Write ${t.label}"></button>`);
        if (t.comp) App.compInk(b, r, { fill: 0.8 }); else App.ink(b, t.ch, { highlight: t.idx });
        b.addEventListener("click", () => { $$(".write-tab", tabs).forEach((x) => x.setAttribute("aria-pressed", x === b)); current = i; start(); });
        tabs.appendChild(b);
      });

      const dataFor = (t) => {
        if (t.comp) { const d = Ink.transformData(r.src[0], r.src[1], { fill: 0.72 }); d.radStrokes = Ink.range(d.strokes.length); return d; }
        const d = Ink.data(t.ch); return { strokes: d.s, medians: d.m, radStrokes: t.idx };
      };

      const start = () => {
        if (!alive()) return;
        if (writer) { try { writer.cancelQuiz(); } catch (e) { /* ignore */ } }
        hw.replaceChildren();
        pad.classList.remove("is-done");
        const t = targets[current];
        const size = Math.round(pad.clientWidth || 300);
        const dark = App.isDark();
        const data = dataFor(t);
        dots.innerHTML = Array.from({ length: t.n }, () => "<i></i>").join("");
        msg.textContent = `${t.n} stroke${t.n > 1 ? "s" : ""}. Start with stroke 1.`;
        writer = HanziWriter.create(hw, "字", {
          width: size, height: size, padding: 12,
          showCharacter: false, showOutline: outline,
          strokeColor: App.cssVar("--ink"), radicalColor: App.cssVar("--accent"),
          outlineColor: dark ? "#3a342b" : "#e2d8c6", drawingColor: App.cssVar("--accent"),
          highlightColor: App.cssVar("--jade"), drawingWidth: 24, showHintAfterMisses: 2,
          strokeAnimationSpeed: 1.2, delayBetweenStrokes: 160, strokeFadeDuration: 300,
          charDataLoader: (c, done) => done(data)
        });
        writer.quiz({
          onCorrectStroke: (d) => { const i = dots.children[d.strokeNum]; i && i.classList.add("ok"); App.sfx.tick(); msg.textContent = d.strokesRemaining ? `Good. ${d.strokesRemaining} to go.` : ""; },
          onMistake: (d) => { const i = dots.children[d.strokeNum]; if (i && !i.classList.contains("ok")) i.classList.add("miss"); msg.textContent = d.mistakesOnStroke >= 2 ? "Follow the flashing stroke." : "Not quite. Check the direction and the stroke order."; },
          onComplete: (s) => {
            pad.classList.add("is-done");
            msg.innerHTML = s.totalMistakes === 0 ? "<b style='color:var(--jade)'>Perfect, no mistakes!</b>" : `<b style='color:var(--jade)'>Done</b>, with ${s.totalMistakes} mistake${s.totalMistakes > 1 ? "s" : ""}. Restart to try for a clean run.`;
            App.sfx.correct();
            if (s.totalMistakes === 0) App.burstAt(pad, 0.6);
          }
        });
      };

      $('[data-w="restart"]', root).addEventListener("click", start);
      $('[data-w="demo"]', root).addEventListener("click", () => {
        if (!writer) return;
        try { writer.cancelQuiz(); } catch (e) { /* ignore */ }
        msg.textContent = "Watch the order…";
        writer.showCharacter({ duration: 0 });
        writer.hideCharacter({ duration: 0 });
        writer.animateCharacter({ onComplete: () => App.later(() => { writer.hideCharacter(); start(); }, 700) });
      });
      const ob = $('[data-w="outline"]', root);
      ob.addEventListener("click", () => { outline = !outline; ob.setAttribute("aria-pressed", outline); if (writer) outline ? writer.showOutline() : writer.hideOutline(); });

      App.whenVisible(pad, start);
      App.onCleanup(() => { if (writer) { try { writer.cancelQuiz(); } catch (e) { /* ignore */ } } });
    }
  };
})();
