/* ==========================================================================
   Vocabulary graphs — data model and the fan renderer
   One hub character in red, its words branching out: words that start with
   the hub go right, words that end with it (or hold it inside) go left.
   ========================================================================== */
(function () {
  "use strict";
  const { $, $$, html, sleep, shuffle } = App;
  const V = window.HSK_VOCAB;

  /* ---------------- data ---------------- */
  const WORDS = new Map(V.words.map((w) => [w.w, w]));
  const MARKS = { "ā": "a1", "á": "a2", "ǎ": "a3", "à": "a4", "ē": "e1", "é": "e2", "ě": "e3", "è": "e4", "ī": "i1", "í": "i2", "ǐ": "i3", "ì": "i4",
    "ō": "o1", "ó": "o2", "ǒ": "o3", "ò": "o4", "ū": "u1", "ú": "u2", "ǔ": "u3", "ù": "u4", "ǖ": "v1", "ǘ": "v2", "ǚ": "v3", "ǜ": "v4", "ü": "v0" };
  /** "xué" → "xue2" (toneless + tone digit, for sorting) */
  const pyKey = (s) => { let t = "0"; const b = s.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/g, (m) => { t = MARKS[m][1]; return MARKS[m][0]; }); return b + t; };
  const plain = (s) => s.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/g, (m) => MARKS[m][0].replace("v", "u"));

  const HUBS = V.hubs.slice().sort((a, b) => b.leaves.length - a.leaves.length || pyKey(a.py).localeCompare(pyKey(b.py)));
  const HUB = new Map(HUBS.map((h) => [h.h, h]));
  const WORD_HUBS = HUBS.filter((h) => h.h.length > 1).map((h) => h.h);
  HUBS.forEach((h, i) => {
    h.i = i;
    h.right = h.leaves.filter((w) => w.startsWith(h.h));
    h.left = h.leaves.filter((w) => !w.startsWith(h.h));
    h.fresh = h.leaves.filter((w) => WORDS.get(w).l === 2).length;
  });
  const LINKED = new Set(HUBS.flatMap((h) => h.word ? [h.h, ...h.leaves] : h.leaves));

  const POS = { "名": "n.", "动": "v.", "形": "adj.", "副": "adv.", "代": "pron.", "数": "num.", "量": "m.", "介": "prep.", "连": "conj.", "助": "part.", "叹": "interj.", "前缀": "prefix", "后缀": "suffix", "数量": "num.+m." };
  const posLine = (pos) => (pos || []).map((p) => POS[p] || p).join(" ");

  /** Join syllables the way pinyin is written: nǎ + r → nǎr, nǚ + ér → nǚ'ér. */
  function pyHTML(sylls, mark) {
    return sylls.map((s, i) => {
      const ap = i > 0 && s !== "r" && /^[aeoāáǎàēéěèōóǒò]/.test(s) ? "'" : "";
      return ap + (mark && mark[i] ? `<b>${s}</b>` : s);
    }).join("");
  }
  const pyText = (sylls) => pyHTML(sylls).replace(/<\/?b>/g, "");
  const hubPy = (h) => h.h.length > 1 ? pyText(h.py.split(" ")) : h.py.split(" ").join(" · ");

  /** Positions of the hub inside a word. */
  function hubMask(w, h) {
    const chars = Array.from(w), m = chars.map(() => false);
    if (h.length === 1) chars.forEach((c, i) => { if (c === h) m[i] = true; });
    else { const i = w.indexOf(h); if (i >= 0) for (let k = 0; k < h.length; k++) m[i + k] = true; }
    return m;
  }

  /** Split a word into runs: the hub, links to other graphs, plain characters. */
  function runs(w, h) {
    const chars = Array.from(w), mask = hubMask(w, h);
    const tag = chars.map((c, i) => (mask[i] ? { t: "hub" } : null));
    for (const wh of WORD_HUBS) {
      if (wh === h) continue;
      const i = w.indexOf(wh);
      if (i < 0 || tag.slice(i, i + wh.length).some(Boolean)) continue;
      for (let k = 0; k < wh.length; k++) tag[i + k] = { t: "link", to: wh };
    }
    chars.forEach((c, i) => { if (!tag[i]) tag[i] = HUB.has(c) && c !== h ? { t: "link", to: c } : { t: "plain" }; });
    const out = [];
    chars.forEach((c, i) => {
      const last = out[out.length - 1], g = tag[i];
      if (last && last.t === g.t && (g.t !== "link" || last.to === g.to) && g.t !== "plain") last.s += c;
      else out.push({ t: g.t, to: g.to, s: c });
    });
    return out;
  }

  /** Other graphs reachable from this one, with the words that lead there. */
  function neighbours(h) {
    const map = new Map();
    h.leaves.forEach((w) => runs(w, h.h).forEach((r) => {
      if (r.t !== "link") return;
      if (!map.has(r.to)) map.set(r.to, []);
      if (!map.get(r.to).includes(w)) map.get(r.to).push(w);
    }));
    return [...map.entries()].map(([to, via]) => ({ hub: HUB.get(to), via })).sort((a, b) => b.via.length - a.via.length || a.hub.i - b.hub.i);
  }

  const href = (h) => `#/vocab/${encodeURIComponent(h)}`;
  const NEW_TAG = `<i class="vg-new" title="New in HSK 2 (not in HSK 1)">新</i>`;

  /* ---------------- fan ---------------- */
  /**
   * @param {object} h   hub
   * @param {object} o
   *   size     'sm' | 'md' | 'lg'
   *   rows     compact rows: pinyin and meaning beside the word (for big families)
   *   links    link the hub and partner characters to their graphs (default true)
   *   ink      draw the hub with the brush (needs stroke data) instead of text
   *   speak    add a listen button to each word
   *   leaves   subset of words to show (default all)
   *   mask     quiz mode: blank out the hub everywhere
   *   ask      quiz mode: the word whose meaning is asked
   *   noEn     hide every meaning
   */
  function fan(h, o) {
    o = Object.assign({ size: "sm", links: true, ink: false, speak: false }, o || {});
    const pick = o.leaves ? (w) => o.leaves.includes(w) : () => true;
    const left = h.left.filter(pick), right = h.right.filter(pick);
    let k = 0;
    const leaf = (w, side) => {
      const e = WORDS.get(w), mask = hubMask(w, h.h);
      const word = runs(w, h.h).map((r) => {
        if (r.t === "hub") return o.mask ? Array.from(r.s).map(() => `<b class="vg-h vg-blank" aria-label="missing character">？</b>`).join("") : `<b class="vg-h">${r.s}</b>`;
        if (r.t === "link" && o.links) return `<a class="vg-link" href="${href(r.to)}" title="Open the graph of ${r.to}">${r.s}</a>`;
        return `<span class="vg-p">${r.s}</span>`;
      }).join("");
      const py = o.mask ? pyHTML(e.py.map((s, i) => (mask[i] ? "＿" : s)), mask) : pyHTML(e.py, mask);
      const asked = o.ask === w;
      return `<div class="vg-leaf${asked ? " is-asked" : ""}" data-w="${w}" data-side="${side}" style="--k:${k++}">
        <span class="py vg-py"><span>${py}</span>${o.speak ? App.speakBtn(w, pyText(e.py)) : ""}</span>
        <span class="han vg-w">${word}${e.l === 2 ? NEW_TAG : ""}</span>
        <span class="vg-en">${asked ? "?" : o.noEn ? "" : e.en}</span>
      </div>`;
    };
    const L = left.map((w) => leaf(w, "l")).join(""), R = right.map((w) => leaf(w, "r")).join("");
    const hubInner = o.mask
      ? `<span class="vg-hub-ch vg-hub-q han">？</span>`
      : o.ink
        ? `<span class="vg-hub-ch vg-hub-ink" data-chars="${h.h}">${Array.from(h.h).map(() => `<span class="vg-ink-cell"></span>`).join("")}</span>`
        : o.links ? `<a class="vg-hub-ch han" href="${href(h.h)}" title="Open the graph of ${h.h}">${h.h}</a>` : `<span class="vg-hub-ch han">${h.h}</span>`;
    const el = html(`<div class="vg-fan vg-${o.size}${o.rows ? " vg-rows" : ""}${left.length ? "" : " no-left"}${right.length ? "" : " no-right"}" data-hub="${h.h}">
      <svg class="vg-arrows" aria-hidden="true"></svg>
      ${left.length ? `<div class="vg-side is-left">${L}</div>` : ""}
      <div class="vg-hub"><span class="py vg-hub-py">${o.mask ? "?" : hubPy(h)}</span>${hubInner}</div>
      ${right.length ? `<div class="vg-side is-right">${R}</div>` : ""}
    </div>`);
    el._n = k;
    // hovering a word lights up its arrow
    el.addEventListener("pointerover", (ev) => { const lf = ev.target.closest(".vg-leaf"); hot(el, lf ? $$(".vg-leaf", el).indexOf(lf) : -1); });
    el.addEventListener("pointerleave", () => hot(el, -1));
    el.addEventListener("focusin", (ev) => { const lf = ev.target.closest(".vg-leaf"); if (lf) hot(el, $$(".vg-leaf", el).indexOf(lf)); });
    watch(el);
    return el;
  }
  function hot(el, i) { $$(".vg-arrow", el).forEach((p, k) => p.classList.toggle("is-hot", k === i)); }

  /**
   * Step-by-step mode: show the first n words of `order` (indices into the
   * fan's words, in the order they should appear); the last one is current.
   * n = null leaves step mode.
   */
  function step(el, order, n) {
    const leaves = $$(".vg-leaf", el), arrows = $$(".vg-arrow", el);
    el.classList.toggle("is-step", n != null);
    const shown = new Set(n == null ? [] : order.slice(0, n)), cur = n ? order[n - 1] : -1;
    leaves.forEach((lf, k) => {
      lf.classList.toggle("is-shown", shown.has(k));
      lf.classList.toggle("is-current", k === cur);
      if (arrows[k]) { arrows[k].classList.toggle("is-shown", shown.has(k)); arrows[k].classList.toggle("is-cur", k === cur); }
    });
    return cur >= 0 ? leaves[cur] : null;
  }

  /** Ink the hub (fan built with ink:true). Resolves when drawn. */
  async function inkHub(el, opts) {
    const box = $(".vg-hub-ink", el); if (!box) return true;
    const cells = $$(".vg-ink-cell", box), chars = Array.from(box.dataset.chars);
    const inks = cells.map((c, i) => { c.replaceChildren(); return App.ink(c, chars[i], { shown: false, label: chars[i] }); });
    if (opts && opts.shown) { inks.forEach((k) => k.showAll()); return true; }
    for (const k of inks) if (!(await k.animate({ speed: (opts && opts.speed) || 1.5, gap: 60 }))) return false;
    return true;
  }

  /* ---------------- arrows ---------------- */
  // Geometry comes from offset* (relative to the fan), so the words' entry transforms don't skew it.
  const box = (n, root) => {
    let x = 0, y = 0, e = n;
    while (e && e !== root) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
    return { x, y, w: n.offsetWidth, h: n.offsetHeight };
  };
  function measure(el) {
    if (!el.isConnected || !el.offsetWidth) return null;
    const hub = $(".vg-hub-ch", el); if (!hub) return null;
    const hb = box(hub, el);
    const big = el.classList.contains("vg-lg") ? 1 : el.classList.contains("vg-md") ? 0.8 : 0.6;
    const pad = 8 * big;
    const cx = hb.x + hb.w / 2, cy = hb.y + hb.h / 2;
    const lines = $$(".vg-leaf", el).map((lf) => {
      const b = box(lf, el), w = $(".vg-w", lf), wb = w ? box(w, el) : b;
      const toRight = b.x + b.w / 2 > cx;
      const sx = toRight ? hb.x + hb.w + pad : hb.x - pad;
      // aim at the characters, not the whole block (a long meaning can be wider than the word)
      const ex = toRight ? wb.x - pad * 1.2 : wb.x + wb.w + pad * 1.2;
      const ey = wb.y + wb.h / 2;
      return { sx, sy: cy, ex, ey };
    });
    return { W: el.offsetWidth, H: el.offsetHeight, lines, head: 9 * big + 3 };
  }
  function paint(el, g) {
    const svg = $(".vg-arrows", el); if (!svg || !g) return;
    svg.setAttribute("viewBox", `0 0 ${g.W} ${g.H}`);
    svg.setAttribute("width", g.W); svg.setAttribute("height", g.H);
    const was = $$(".vg-arrow", svg).map((p) => p.classList.contains("is-hot"));
    const leaves = $$(".vg-leaf", el);
    svg.innerHTML = g.lines.map((l, k) => {
      const a = Math.atan2(l.ey - l.sy, l.ex - l.sx), s = g.head, sp = 0.45;
      const h1 = [l.ex - s * Math.cos(a - sp), l.ey - s * Math.sin(a - sp)], h2 = [l.ex - s * Math.cos(a + sp), l.ey - s * Math.sin(a + sp)];
      const f = (n) => n.toFixed(1);
      const lf = leaves[k], st = lf ? (lf.classList.contains("is-shown") ? " is-shown" : "") + (lf.classList.contains("is-current") ? " is-cur" : "") : "";
      return `<path class="vg-arrow${was[k] ? " is-hot" : ""}${st}" pathLength="1" style="--k:${k}" d="M${f(l.sx)} ${f(l.sy)}L${f(l.ex)} ${f(l.ey)}M${f(h1[0])} ${f(h1[1])}L${f(l.ex)} ${f(l.ey)}L${f(h2[0])} ${f(h2[1])}"/>`;
    }).join("");
  }
  let ro = null;
  const fans = new Set();
  function redraw(list) {
    const geo = list.map((el) => [el, measure(el)]); // all reads first …
    geo.forEach(([el, g]) => paint(el, g));          // … then all writes
  }
  function watch(el) {
    fans.add(el);
    if (!ro && "ResizeObserver" in window) ro = new ResizeObserver((ents) => redraw([...new Set(ents.map((e) => e.target.closest(".vg-fan")))].filter(Boolean)));
    if (ro) { ro.observe(el); $$(".vg-side", el).forEach((s) => ro.observe(s)); }
    requestAnimationFrame(() => redraw([el]));
    // forget the fan when the view changes
    App.onCleanup(() => { fans.delete(el); if (ro) { ro.unobserve(el); $$(".vg-side", el).forEach((s) => ro.unobserve(s)); } });
  }
  const live = () => [...fans].filter((f) => f.isConnected);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => redraw(live()));

  /** Draw a fan in: hub ink (if any), then arrows and words. */
  async function play(el, o) {
    el.classList.remove("is-drawn");
    void el.offsetWidth;
    if (!(await inkHub(el, o))) return false;
    if (!el.isConnected) return false;
    redraw([el]);
    requestAnimationFrame(() => el.classList.add("is-drawn"));
    return true;
  }

  /* ---------------- showcase: cycle through a few graphs ---------------- */
  function showcase(host, list, o) {
    o = Object.assign({ size: "md", ink: true, hold: 3800, dots: true }, o || {});
    const alive = App.alive();
    const wrap = html(`<div class="vg-show">
      <div class="vg-show-fan"></div>
      <div class="vg-show-cap"><span class="han"></span><span class="py"></span><span class="vg-show-en"></span></div>
      ${o.dots ? `<div class="stage-dots vg-show-dots">${list.map((h, k) => `<button aria-label="Show ${h.h}" data-k="${k}"></button>`).join("")}</div>` : ""}
    </div>`);
    host.appendChild(wrap);
    const slot = $(".vg-show-fan", wrap), cap = $(".vg-show-cap", wrap), dots = $$(".vg-show-dots button", wrap);
    let i = 0, run = 0;
    dots.forEach((d) => d.addEventListener("click", () => { i = +d.dataset.k; loop(); }));
    const loop = async () => {
      const my = ++run, ok = () => alive() && my === run;
      while (ok()) {
        const h = list[i];
        dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
        cap.classList.remove("is-on");
        const f = fan(h, { size: o.size, ink: o.ink, links: false });
        slot.replaceChildren(f);
        $(".han", cap).textContent = h.h;
        $(".py", cap).textContent = hubPy(h);
        $(".vg-show-en", cap).textContent = h.en;
        await sleep(120); if (!ok()) return;
        if (!(await play(f, { speed: 1.6 })) || !ok()) return;
        cap.classList.add("is-on");
        await sleep(o.hold + f._n * 90); if (!ok()) return;
        if (!App.reduceMotion()) {
          await f.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(-6px)" }], { duration: 260, fill: "forwards" }).finished.catch(() => {});
          if (!ok()) return;
        }
        i = (i + 1) % list.length;
      }
    };
    App.whenVisible(host, loop);
    App.onCleanup(() => { run++; });
    return wrap;
  }

  /* ---------------- progress ---------------- */
  const st = () => { const s = App.store.state; s.vocab = s.vocab || {}; s.vocab.seen = s.vocab.seen || {}; return s.vocab; };
  const seen = (h) => !!st().seen[h];
  const markSeen = (h) => { if (!seen(h)) { st().seen[h] = Date.now(); App.store.save(); } };
  const recordQuiz = (score, total) => {
    const q = (st().quiz = st().quiz || { best: 0, tries: 0 });
    q.tries++; q.last = score; q.total = total; q.best = Math.max(q.best, score); q.at = Date.now(); App.store.save();
  };
  const stats = () => ({ hubs: HUBS.length, seen: HUBS.filter((h) => seen(h.h)).length, quiz: st().quiz || null });

  App.vocab = { V, WORDS, HUBS, HUB, LINKED, POS, posLine, pyHTML, pyText, hubPy, plain, runs, neighbours, href, NEW_TAG, fan, step, play, inkHub, redraw, showcase, seen, markSeen, recordQuiz, stats, shuffle };
})();
