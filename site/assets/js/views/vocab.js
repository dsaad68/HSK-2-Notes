/* ==========================================================================
   Vocabulary graphs — overview of every family, one graph per page, quiz
   ========================================================================== */
(function () {
  "use strict";
  const { $, $$, html, shuffle } = App;
  const VB = () => App.vocab;
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + "s"}`;
  const hanList = (ws) => ws.map((w) => `<span class="han">${w}</span>`).join(", ");

  /* Notes on how the hub sounds inside its words. */
  function readingNotes(h) {
    const { WORDS, pyText } = VB();
    const out = [];
    if (h.readings) {
      const parts = h.readings.map((r) => r.py === "r"
        ? `as a light <b>-r</b> added to the syllable before it in ${hanList(r.w.slice(0, 4))}${r.w.length > 4 ? " …" : ""}`
        : `<b>${r.py}</b> in ${hanList(r.w)}`);
      out.push(`<b>Two readings.</b> ${parts.join("; ")}.`);
    }
    if (h.sandhi) {
      const cite = h.py;
      out.push(`<b>Tone change.</b> ${h.h} is <b>${cite}</b> on its own, ` + h.sandhi.map((g) => `<b>${g.py}</b> in ${hanList(g.w)}`).join(" and ") +
        `: ${h.h === "一" ? "yí before a 4th tone, yì before the other tones" : "bú before a 4th tone"}.`);
    }
    if (h.light && h.light.length) {
      const all = h.light.length === h.leaves.length;
      const syl = (() => { const w = WORDS.get(h.light[0]); return w.py[Array.from(w.w).indexOf(h.h)]; })();
      out.push(all
        ? `<b>Light tone.</b> Said light (<b>${syl}</b>) in every word here, without its own tone.`
        : `<b>Light tone</b> (<b>${syl}</b>) in ${hanList(h.light)}.`);
    }
    return out;
  }

  function hubBox(h, cls) {
    return `<div class="vg-box ${cls || ""}"><span class="vg-box-pos">${VB().posLine(h.pos)}</span><span class="vg-box-en">${h.en}</span></div>`;
  }

  /* ======================================================================
     Overview
     ====================================================================== */
  App.views.vocab = {
    section: "vocab",
    nav: "vocab",
    title: "Graphs",
    render() {
      const { HUBS, WORDS, LINKED, NEW_TAG } = VB();
      const st = VB().stats();
      const fresh = [...WORDS.values()].filter((w) => w.l === 2).length;
      // start with a family whose hub is a word of its own (儿 and 子 are mostly endings)
      const firstNew = HUBS.find((h) => h.word && !VB().seen(h.h)) || HUBS.find((h) => h.word);
      const sort = App.store.setting("vgSort") || "size";
      const only = App.store.setting("vgNew") ? "new" : "all";
      const arrowIcon = `<svg viewBox="0 0 40 16" aria-hidden="true"><path d="M2 8H36M30 3l6 5-6 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

      const root = html(`<div class="page-vocab">
        <section class="hero wrap vg-hero">
          <div class="hero-grid">
            <div class="hero-copy">
              <span class="eyebrow">HSK 2 · 词汇 Vocabulary</span>
              <h1 class="title-xl">One character, <em>a family of words</em>.</h1>
              <p class="lede">Every word in the HSK 2 list that shares a character is drawn as a graph: the shared character in red, its words branching out. Know <span class="han">车</span> and you're already halfway to <span class="han">火车</span>, <span class="han">开车</span> and <span class="han">车站</span>.</p>
              <div class="btn-row">
                <a class="btn btn-primary" href="${VB().href(firstNew.h)}">${st.seen ? "Continue with" : "Start with"} <span class="han">${firstNew.h}</span> ${App.icon.arrow}</a>
                <a class="btn" href="#/vocab/quiz">Quiz yourself</a>
              </div>
              <div class="hero-stats">
                <div><b>${HUBS.length}</b><span>graphs · 图</span></div>
                <div><b>${WORDS.size}</b><span>words in the list</span></div>
                <div><b>${LINKED.size}</b><span>words in a graph</span></div>
                <div><b>${fresh}</b><span>new in HSK 2</span></div>
              </div>
            </div>
            <div class="vg-stage card" aria-label="Animated vocabulary graphs"><div class="stage-tag">词汇图 · word graph</div></div>
          </div>
        </section>

        <section class="section wrap" id="graphs">
          <div class="section-head reveal">
            <div><span class="eyebrow">${HUBS.length} graphs · 图</span><h2 class="title-lg" style="margin-top:12px">Every family in the word list</h2></div>
            <p class="muted" style="max-width:440px">Built from the ${WORDS.size}-word HSK 2 list. A character gets a graph once two or more words share it. Tap a red character to open its graph, or a blue one to jump to the next family.</p>
          </div>
          <div class="vg-legend reveal">
            <span><b class="han vg-h">车</b> the shared character</span>
            <span><span class="han vg-link is-demo">火</span> has its own graph</span>
            <span>${NEW_TAG} new in HSK 2</span>
            <span class="vg-legend-dir"><span class="han">车</span>${arrowIcon}<span class="han">车站</span> starts with it</span>
            <span class="vg-legend-dir"><span class="han">火车</span><span class="vg-flip">${arrowIcon}</span><span class="han">车</span> ends with it</span>
          </div>
          <div class="vg-toolbar reveal">
            <label class="vg-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
              <input type="search" placeholder="Search 字, pinyin or English" aria-label="Search the graphs" autocomplete="off" spellcheck="false"></label>
            <div class="seg vg-only" role="group" aria-label="Which graphs"><button data-v="all" aria-pressed="${only === "all"}">All</button><button data-v="new" aria-pressed="${only === "new"}">With new words</button></div>
            <div class="seg vg-sort" role="group" aria-label="Order"><button data-v="size" aria-pressed="${sort === "size"}">Largest first</button><button data-v="az" aria-pressed="${sort === "az"}">A–Z pinyin</button></div>
            <span class="vg-count muted" aria-live="polite"></span>
          </div>
          <div class="vg-grid"></div>
          <div class="vg-empty" hidden><p class="lede">No graph matches that. Try a single character (<span class="han">学</span>), toneless pinyin (<i>xue</i>) or an English word (<i>school</i>).</p></div>
        </section>
      </div>`);

      const grid = $(".vg-grid", root), count = $(".vg-count", root), empty = $(".vg-empty", root), input = $(".vg-search input", root);
      const cards = new Map();
      HUBS.forEach((h) => {
        const c = html(`<article class="card vg-card${VB().seen(h.h) ? " is-seen" : ""}" data-hub="${h.h}">
          <div class="vg-card-top"><span class="vg-card-n">${plural(h.leaves.length, "word")}</span>${h.fresh ? `<span class="vg-card-new">${h.fresh} new</span>` : ""}<span class="vg-card-seen" title="You've opened this graph">${App.icon.check}</span></div>
          <div class="vg-fan-wrap"></div>
          <a class="vg-box vg-box-link" href="${VB().href(h.h)}" aria-label="Open the graph of ${h.h}: ${h.en}"><span class="vg-box-pos">${VB().posLine(h.pos)}</span><span class="vg-box-en">${h.en}</span>${App.icon.arrow}</a>
        </article>`);
        $(".vg-fan-wrap", c).appendChild(VB().fan(h, { size: "sm" }));
        c._idx = this.index(h);
        cards.set(h.h, c);
      });

      const state = { q: "", sort, only };
      const apply = () => {
        const q = state.q.trim().toLowerCase();
        const qp = VB().plain(q).replace(/[\s'0-9]/g, "");
        const han = /[㐀-鿿]/.test(q);
        let list = HUBS.filter((h) => {
          if (state.only === "new" && !h.fresh) return false;
          if (!q) return true;
          const ix = cards.get(h.h)._idx;
          if (han) return [...q.replace(/[^㐀-鿿]/g, "")].every((ch) => ix.zh.includes(ch));
          return (qp && ix.py.includes(qp)) || ix.en.includes(q);
        });
        if (state.sort === "az") list = list.slice().sort((a, b) => a.key.localeCompare(b.key));
        grid.replaceChildren(...list.map((h) => cards.get(h.h)));
        count.textContent = list.length === HUBS.length ? `${HUBS.length} graphs` : `${list.length} of ${HUBS.length} graphs`;
        empty.hidden = !!list.length;
        requestAnimationFrame(() => VB().redraw(list.map((h) => $(".vg-fan", cards.get(h.h)))));
      };
      let t = 0;
      input.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { state.q = input.value; apply(); }, 90); });
      App.seg($(".vg-only", root), (v) => { state.only = v; App.store.setting("vgNew", v === "new"); apply(); });
      App.seg($(".vg-sort", root), (v) => { state.sort = v; App.store.setting("vgSort", v); apply(); });
      App.onKey((ev) => { if (ev.key === "/" ) { input.focus(); return true; } return false; });
      apply();

      // draw each graph as it scrolls into view
      if ("IntersectionObserver" in window && !App.reduceMotion()) {
        const io = new IntersectionObserver((ents) => ents.forEach((en) => {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          $(".vg-fan", en.target).classList.add("is-drawn");
        }), { rootMargin: "0px 0px -6% 0px", threshold: 0.15 });
        cards.forEach((c) => io.observe(c));
        App.onCleanup(() => io.disconnect());
      } else cards.forEach((c) => $(".vg-fan", c).classList.add("is-drawn"));

      this.root = root;
      return root;
    },

    /* Text to search in: characters, toneless pinyin, English. */
    index(h) {
      const { WORDS, plain } = VB();
      const ws = [h.h, ...h.leaves].map((w) => WORDS.get(w)).filter(Boolean);
      h.key = VB().plain(h.py).replace(/\s/g, "") + " " + h.h;
      return {
        zh: [h.h, ...h.leaves].join(" "),
        py: [plain(h.py).replace(/\s/g, ""), ...ws.map((w) => plain(w.py.join("")))].join(" "),
        en: [h.en, ...ws.map((w) => w.en)].join(" | ").toLowerCase()
      };
    },

    mounted() {
      const { HUB } = VB();
      const pick = ["车", "电", "机", "天", "出", "色"].map((c) => HUB.get(c)).filter(Boolean);
      VB().showcase($(".vg-stage", this.root), pick, { size: "md" });
    }
  };

  /* ======================================================================
     One graph
     ====================================================================== */
  App.views.vocabGraph = {
    section: "vocab",
    nav: "vocab",
    title: (h) => `${h} · Graphs`,
    render(id) {
      const { HUBS, HUB, WORDS } = VB();
      const h = HUB.get(id);
      this.h = h;
      if (!h) {
        const homes = HUBS.filter((x) => x.leaves.includes(id) || Array.from(id).some((c) => x.h === c));
        return html(`<div class="wrap page-head"><span class="eyebrow">Vocabulary graphs</span>
          <h1 class="title-lg">No graph for <span class="han">${id}</span></h1>
          <p class="lede">${WORDS.has(id) ? `<span class="han">${id}</span> is in the word list but shares no character with two other words.` : "Only characters that two or more HSK 2 words share have a graph."}</p>
          ${homes.length ? `<p class="lede" style="margin-top:10px">It appears in: ${homes.map((x) => `<a class="vgp-inline" href="${VB().href(x.h)}"><span class="han">${x.h}</span></a>`).join(" ")}</p>` : ""}
          <div class="btn-row" style="margin-top:24px"><a class="btn btn-primary" href="#/vocab">All graphs ${App.icon.arrow}</a></div></div>`);
      }
      VB().markSeen(h.h);
      const prev = HUBS[(h.i - 1 + HUBS.length) % HUBS.length], next = HUBS[(h.i + 1) % HUBS.length];
      const nb = VB().neighbours(h);
      const notes = readingNotes(h);
      const own = h.word
        ? `<span class="han">${h.h}</span> is also a word on its own${h.l === 2 ? `, new in HSK 2 ${VB().NEW_TAG}` : " (HSK 1)"}.`
        : `<span class="han">${h.h}</span> isn't a word on its own in HSK 2. You meet it only inside these words.`;
      const pos = !h.left.length ? `Starts all ${plural(h.right.length, "word")} (they branch right).`
        : !h.right.length ? `Never starts a word here: it comes later in all ${plural(h.left.length, "word")} (they branch left).`
        : `Starts ${plural(h.right.length, "word")} (right) and comes later in ${plural(h.left.length, "word")} (left).`;

      const root = html(`<div class="page-vgraph">
        <section class="wrap page-head vgp-head">
          <div class="vgp-crumbs">
            <a class="back" href="#/vocab">${App.icon.back} All graphs</a>
            <span class="muted vgp-of">Graph ${h.i + 1} of ${HUBS.length}</span>
          </div>
          <span class="eyebrow">Vocabulary graph · ${plural(h.leaves.length, "word")}</span>
          <h1 class="title-lg vgp-title"><span class="han vgp-h">${h.h}</span><span class="vgp-py py">${VB().hubPy(h)}</span>${App.speakBtn(h.h, VB().hubPy(h))}<span class="vgp-en">${h.en}</span></h1>
          <p class="lede">${h.note}</p>
        </section>

        <section class="wrap vgp-body">
          <div class="card vgp-stage">
            <div class="vgp-tools">
              <span class="chip">${plural(h.leaves.length, "word")}</span>
              ${h.fresh ? `<span class="chip chip-gold">${h.fresh} new in HSK 2</span>` : ""}
              <button class="btn btn-sm btn-ghost vgp-replay" title="Draw it again (R)">${App.icon.replay}<span>Replay</span></button>
            </div>
            <div class="vgp-fan"></div>
            ${hubBox(h, "vgp-box")}
          </div>

          <aside class="vgp-side">
            <div class="card vgp-panel">
              <h3 class="vgp-ph">About <span class="han">${h.h}</span></h3>
              <ul class="vgp-facts">
                <li>${own}</li>
                <li>${pos}</li>
              </ul>
              ${notes.map((t) => `<p class="x-note">${App.icon.bulb}<span>${t}</span></p>`).join("")}
            </div>
            ${nb.length ? `<div class="card vgp-panel">
              <h3 class="vgp-ph">Connected graphs <small class="muted">${nb.length}</small></h3>
              <p class="vgp-sub muted">The other characters in these words have graphs too.</p>
              <div class="vgp-nbs">${nb.map((n) => `<a class="vgp-nb" href="${VB().href(n.hub.h)}" title="${n.hub.en}"><b class="han">${n.hub.h}</b><small class="han">${n.via.join(" · ")}</small></a>`).join("")}</div>
            </div>` : ""}
            <a class="card vgp-panel vgp-quiz" href="#/vocab/quiz"><span>${App.icon.target}</span><div><b>Quiz yourself</b><small>Find the shared character in ten graphs.</small></div>${App.icon.arrow}</a>
          </aside>
        </section>

        <nav class="wrap x-pager">
          <a class="x-pg" href="${VB().href(prev.h)}">${App.icon.prev}<span><small>Graph ${prev.i + 1} · ${prev.en}</small><b class="han">${prev.h}</b></span></a>
          <span class="xs-keys muted vgp-keys"><kbd>←</kbd><kbd>→</kbd> graphs · <kbd>R</kbd> replay</span>
          <a class="x-pg is-next" href="${VB().href(next.h)}"><span><small>Graph ${next.i + 1} · ${next.en}</small><b class="han">${next.h}</b></span>${App.icon.next}</a>
        </nav>
      </div>`);

      const small = window.matchMedia("(max-width: 640px)").matches;
      // a tall side reads better a size down
      const tall = Math.max(h.left.length, h.right.length) > 5;
      const f = VB().fan(h, { size: small || tall ? "md" : "lg", ink: true, speak: true });
      $(".vgp-fan", root).appendChild(f);
      this.f = f;
      $(".vgp-replay", root).addEventListener("click", () => { App.sfx.tick(); VB().play(f); });
      App.onKey((ev) => {
        if (ev.key === "ArrowLeft") { App.go(VB().href(prev.h)); return true; }
        if (ev.key === "ArrowRight") { App.go(VB().href(next.h)); return true; }
        if (ev.key === "r" || ev.key === "R") { VB().play(f); return true; }
        return false;
      });
      this.root = root;
      return root;
    },
    mounted() {
      if (this.h && this.f) VB().play(this.f);
    }
  };

  /* ======================================================================
     Quiz: find the shared character / what does this word mean
     ====================================================================== */
  const ICON_HUB = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="7" cy="12" r="3"/><path d="M10 11l8-5M10 12h9M10 13l8 5"/></svg>`;

  /** Pick n items, larger graphs more likely. */
  function weighted(list, n, w) {
    const pool = list.slice(), out = [];
    while (out.length < n && pool.length) {
      const tot = pool.reduce((s, x) => s + w(x), 0);
      let r = Math.random() * tot, i = 0;
      while (r > w(pool[i])) { r -= w(pool[i]); i++; }
      out.push(pool.splice(Math.min(i, pool.length - 1), 1)[0]);
    }
    return out;
  }
  const sample = (list, n) => shuffle(list).slice(0, n);
  const keepOrder = (all, some) => all.filter((x) => some.includes(x));

  function hubQuestion(h) {
    const { HUBS, WORDS } = VB();
    const leaves = keepOrder(h.leaves, sample(h.leaves, 5));
    const seenChars = new Set(leaves.join(""));
    // a distractor must not also make every shown word (that would be a second right answer)
    const fits = (d) => leaves.every((w) => WORDS.has(w.split(h.h).join(d)));
    const ds = shuffle(HUBS.filter((x) => x.h.length === 1 && x !== h && !seenChars.has(x.h) && !fits(x.h))).slice(0, 3);
    return { render: renderHubQ, hub: h, leaves, opts: shuffle([h, ...ds]) };
  }
  function meaningQuestion(h) {
    const { WORDS } = VB();
    const target = h.leaves[(Math.random() * h.leaves.length) | 0];
    const en = WORDS.get(target).en;
    const others = shuffle(h.leaves.filter((w) => w !== target && WORDS.get(w).en !== en));
    const shown = keepOrder(h.leaves, [target, ...others.slice(0, 4)]);
    const opts = [en];
    others.forEach((w) => { const e = WORDS.get(w).en; if (opts.length < 4 && !opts.includes(e)) opts.push(e); });
    shuffle([...WORDS.values()]).forEach((w) => { if (opts.length < 4 && w.w.length > 1 && !opts.includes(w.en)) opts.push(w.en); });
    return { render: renderMeanQ, hub: h, target, leaves: shown, opts: shuffle(opts), ans: en };
  }
  function round() {
    const { HUBS } = VB();
    const chars = HUBS.filter((h) => h.h.length === 1);
    const a = weighted(chars, 6, (h) => Math.min(h.leaves.length, 6));
    const b = weighted(HUBS.filter((h) => h.leaves.length >= 3 && !a.includes(h)), 4, (h) => Math.min(h.leaves.length, 6));
    return shuffle([...a.map(hubQuestion), ...b.map(meaningQuestion)]);
  }

  const qHead = (icon, label, h) => `<div class="qz-kind"><span class="qz-kind-i">${icon}</span>${label}<span class="qz-from">${plural(h.leaves.length, "word")} in this family</span></div>`;

  function renderHubQ(q, settle) {
    const el = html(`<div class="qz-q vq-q">
      ${qHead(ICON_HUB, "Find the shared character", q.hub)}
      <h3 class="qz-prompt">Which character do these words share?</h3>
      <div class="vq-fan"></div>
      <div class="qz-opts vq-opts" role="group" aria-label="Answers"></div>
    </div>`);
    const host = $(".vq-fan", el);
    const f = VB().fan(q.hub, { size: "md", mask: true, links: false, leaves: q.leaves });
    f.classList.add("is-drawn");
    host.appendChild(f);
    const box = $(".vq-opts", el);
    const btns = q.opts.map((o, k) => {
      const b = html(`<button class="qz-opt vq-opt"><kbd>${k + 1}</kbd><span class="han">${o.h}</span></button>`);
      b.addEventListener("click", () => choose(k));
      box.appendChild(b);
      return b;
    });
    let done = false;
    function choose(k) {
      if (done) return;
      done = true;
      const ok = q.opts[k] === q.hub;
      btns.forEach((b, i) => { b.disabled = true; if (q.opts[i] === q.hub) b.classList.add("is-right"); else if (i === k) b.classList.add("is-wrong"); else b.classList.add("is-dim"); });
      const g = VB().fan(q.hub, { size: "md", links: false, leaves: q.leaves });
      g.classList.add("is-drawn");
      host.replaceChildren(g);
      $$(".vg-h, .vg-hub-ch", g).forEach((n) => n.animate([{ transform: "scale(1.5)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 420, easing: "cubic-bezier(.34,1.56,.64,1)" }));
      if (ok) App.burstAt($(".vg-hub-ch", g), 0.6);
      settle(ok, `<b class="han">${q.hub.h}</b> <span class="py">${VB().hubPy(q.hub)}</span>, ${q.hub.en}. ${q.hub.note} <a href="${VB().href(q.hub.h)}">Open the graph</a>`);
    }
    return { el, key: (ev) => { const n = +ev.key; if (n >= 1 && n <= btns.length) { choose(n - 1); return true; } return false; } };
  }

  function renderMeanQ(q, settle) {
    const { WORDS, pyText } = VB();
    const t = WORDS.get(q.target);
    const el = html(`<div class="qz-q vq-q">
      ${qHead(App.icon.eye, "What does it mean?", q.hub)}
      <h3 class="qz-prompt">What does <span class="han vq-word">${q.target}</span> <span class="py">${pyText(t.py)}</span> mean?</h3>
      <div class="vq-fan"></div>
      <div class="qz-opts" role="group" aria-label="Answers"></div>
    </div>`);
    const host = $(".vq-fan", el);
    const f = VB().fan(q.hub, { size: "md", links: false, leaves: q.leaves, ask: q.target, noEn: true });
    f.classList.add("is-drawn");
    host.appendChild(f);
    const box = $(".qz-opts", el);
    const btns = q.opts.map((o, k) => {
      const b = html(`<button class="qz-opt"><kbd>${k + 1}</kbd><span>${o}</span></button>`);
      b.addEventListener("click", () => choose(k));
      box.appendChild(b);
      return b;
    });
    let done = false;
    function choose(k) {
      if (done) return;
      done = true;
      const ok = q.opts[k] === q.ans;
      btns.forEach((b, i) => { b.disabled = true; if (q.opts[i] === q.ans) b.classList.add("is-right"); else if (i === k) b.classList.add("is-wrong"); else b.classList.add("is-dim"); });
      const g = VB().fan(q.hub, { size: "md", links: false, leaves: q.leaves });
      g.classList.add("is-drawn");
      $$(".vg-leaf", g).forEach((lf) => lf.classList.toggle("is-asked", lf.dataset.w === q.target));
      host.replaceChildren(g);
      if (ok) App.burstAt(btns[k], 0.5);
      settle(ok, `<b class="han">${q.target}</b> <span class="py">${pyText(t.py)}</span> means <b>${q.ans}</b>. The other words of the <span class="han">${q.hub.h}</span> family now show their meanings too.`);
    }
    return { el, key: (ev) => { const n = +ev.key; if (n >= 1 && n <= btns.length) { choose(n - 1); return true; } return false; } };
  }

  App.views.vocabQuiz = {
    section: "vocab",
    nav: "vocab-quiz",
    title: "Quiz · Graphs",
    render() {
      const q = VB().stats().quiz;
      const root = html(`<div class="page-vquiz">
        <section class="wrap page-head">
          <span class="eyebrow">Vocabulary · Quiz</span>
          <h1 class="title-lg">Graph quiz <span class="zh-sub">练一练</span></h1>
          <p class="lede">Ten graphs with a piece missing. Six times the shared character is gone: which one makes all the words? Four times a word has lost its meaning: which one is it? A new mix every round.${q ? ` Your best so far: <b>${q.best}/${q.total || 10}</b>.` : ""}</p>
        </section>
        <section class="wrap section" style="padding-top:28px"><div class="x-quiz-host"></div></section>
      </div>`);
      const host = $(".x-quiz-host", root);
      const go = () => App.expr.quiz(host, round(), { restart: go, nextHref: "#/vocab", nextLabel: "All graphs", onDone: (s, n) => VB().recordQuiz(s, n) });
      go();
      return root;
    }
  };
})();
