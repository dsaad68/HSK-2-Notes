/* ==========================================================================
   Vocabulary graphs — data model and the fan renderer
   One hub character in red, its words branching out: words that start with
   the hub go right, words where it comes later go left.
   Two layouts: "columns" (a straight column per side) and "ring" (each side
   bent into half an ellipse, for families too big for a column on screen).
   ========================================================================== */
(function () {
  "use strict";
  const { $, $$, html, sleep, shuffle } = App;
  const V = window.HSK_VOCAB;

  /* ---------------- data ---------------- */
  const WORDS = new Map(V.words.map((w) => [w.w, w]));
  const CHARS = V.chars || {};
  const MARKS = { "ā": "a1", "á": "a2", "ǎ": "a3", "à": "a4", "ē": "e1", "é": "e2", "ě": "e3", "è": "e4", "ī": "i1", "í": "i2", "ǐ": "i3", "ì": "i4",
    "ō": "o1", "ó": "o2", "ǒ": "o3", "ò": "o4", "ū": "u1", "ú": "u2", "ǔ": "u3", "ù": "u4", "ǖ": "v1", "ǘ": "v2", "ǚ": "v3", "ǜ": "v4", "ü": "v0" };
  const TONED = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/g;
  /** "xué" → "xue2" (toneless + tone digit, for sorting) */
  const pyKey = (s) => { let t = "0"; const b = s.replace(TONED, (m) => { t = MARKS[m][1]; return MARKS[m][0]; }); return b + t; };
  const plain = (s) => s.replace(TONED, (m) => MARKS[m][0].replace("v", "u"));

  const HUBS = V.hubs.slice().sort((a, b) => b.leaves.length - a.leaves.length || pyKey(a.py).localeCompare(pyKey(b.py)) || a.id.localeCompare(b.id));
  const HUB = new Map(HUBS.map((h) => [h.id, h]));
  const WORD_HUBS = HUBS.filter((h) => h.h.length > 1);
  const CHAR_HUBS = new Map();
  HUBS.forEach((h, i) => {
    h.i = i;
    h.right = h.leaves.filter((w) => w.startsWith(h.h));
    h.left = h.leaves.filter((w) => !w.startsWith(h.h));
    h.fresh = h.leaves.filter((w) => WORDS.get(w).l === 2).length;
    if (h.h.length === 1) CHAR_HUBS.set(h.h, (CHAR_HUBS.get(h.h) || []).concat(h));
  });
  const LINKED = new Set(HUBS.flatMap((h) => (h.word ? [h.h, ...h.leaves] : h.leaves)));

  /** The graph a character belongs to, given how it is read in this word (觉 jué vs jiào). */
  function hubFor(ch, syl) {
    const list = CHAR_HUBS.get(ch);
    if (!list) return null;
    if (list.length === 1) return list[0];
    return list.find((h) => h.py === syl) || list.find((h) => syl && plain(h.py) === plain(syl)) || list.find((h) => h.id === ch) || list[0];
  }

  const POS = { "名": "n.", "动": "v.", "形": "adj.", "副": "adv.", "代": "pron.", "数": "num.", "量": "m.", "介": "prep.", "连": "conj.", "助": "part.", "叹": "interj.", "前缀": "prefix", "后缀": "suffix", "数量": "num.+m." };
  const posLine = (pos) => (pos || []).map((p) => POS[p] || p).join(" ");

  /** Syllables with a little space between them, so each lines up with its character
      (shàng bān); erhua stays on the syllable before it (nǎr). */
  function pyHTML(sylls, mark) {
    return sylls.map((s, i) => (i > 0 && s !== "r" ? " " : "") + (mark && mark[i] ? `<b>${s}</b>` : s)).join("");
  }
  const pyText = (sylls) => pyHTML(sylls).replace(/<\/?b>/g, "");
  const hubPy = (h) => (h.py === "r" ? "-r" : h.h.length > 1 ? pyText(h.py.split(" ")) : h.py.split(" ").join(" · "));

  /** Positions of the hub inside a word. */
  function hubMask(w, h) {
    const chars = Array.from(w), m = chars.map(() => false);
    if (h.length === 1) chars.forEach((c, i) => { if (c === h) m[i] = true; });
    else { const i = w.indexOf(h); if (i >= 0) for (let k = 0; k < h.length; k++) m[i + k] = true; }
    return m;
  }

  /** Split a word into runs: the hub, links to other graphs, plain characters. */
  function runs(w, hub) {
    const chars = Array.from(w), mask = hubMask(w, hub.h), py = WORDS.get(w).py;
    const tag = chars.map((c, i) => (mask[i] ? { t: "hub" } : null));
    for (const wh of WORD_HUBS) {
      if (wh === hub) continue;
      const i = w.indexOf(wh.h);
      if (i < 0 || tag.slice(i, i + wh.h.length).some(Boolean)) continue;
      for (let k = 0; k < wh.h.length; k++) tag[i + k] = { t: "link", to: wh.id };
    }
    chars.forEach((c, i) => {
      if (tag[i]) return;
      const to = hubFor(c, py[i]);
      tag[i] = to && to !== hub ? { t: "link", to: to.id } : { t: "plain" };
    });
    const out = [];
    chars.forEach((c, i) => {
      const last = out[out.length - 1], g = tag[i];
      if (last && last.t === g.t && g.t !== "plain" && (g.t !== "link" || last.to === g.to)) { last.s += c; last.py.push(py[i]); }
      else out.push({ t: g.t, to: g.to, s: c, py: [py[i]] });
    });
    return out;
  }

  /** Other graphs reachable from this one, with the words that lead there. */
  function neighbours(h) {
    const map = new Map();
    h.leaves.forEach((w) => runs(w, h).forEach((r) => {
      if (r.t !== "link") return;
      if (!map.has(r.to)) map.set(r.to, []);
      if (!map.get(r.to).includes(w)) map.get(r.to).push(w);
    }));
    return [...map.entries()].map(([to, via]) => ({ hub: HUB.get(to), via })).sort((a, b) => b.via.length - a.via.length || a.hub.i - b.hub.i);
  }

  const href = (id) => `#/vocab/${encodeURIComponent(id)}`;
  const NEW_TAG = `<i class="vg-new" title="New in HSK 2 (not in HSK 1)">新</i>`;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

  /* ---------------- fan ---------------- */
  /**
   * @param {object} h   hub
   * @param {object} o
   *   size     'sm' | 'md' | 'lg'
   *   ring     bend each side into half an ellipse; `height` is the space to fill
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
      const word = runs(w, h).map((r) => {
        const data = `data-c="${r.s}" data-py="${esc(pyText(r.py))}"`;
        if (r.t === "hub") return o.mask ? Array.from(r.s).map(() => `<b class="vg-h vg-blank" aria-label="missing character">？</b>`).join("") : `<b class="vg-h">${r.s}</b>`;
        if (r.t === "link" && o.links) return `<a class="vg-link" href="${href(r.to)}" ${data} data-to="${esc(r.to)}">${r.s}</a>`;
        return `<span class="vg-p" ${data}${r.t === "link" ? ` data-to="${esc(r.to)}"` : ""}>${r.s}</span>`;
      }).join("");
      const py = o.mask ? pyHTML(e.py.map((s, i) => (mask[i] ? "＿" : s)), mask) : pyHTML(e.py, mask);
      const asked = o.ask === w;
      return `<div class="vg-leaf${asked ? " is-asked" : ""}" data-w="${w}" data-side="${side}" style="--k:${k++}">
        <span class="py vg-py"><span class="vg-pyt">${py}</span>${o.speak ? App.speakBtn(w, pyText(e.py)) : ""}</span>
        <span class="han vg-w">${word}${e.l === 2 ? NEW_TAG : ""}</span>
        <span class="vg-en">${asked ? "?" : o.noEn ? "" : e.en}</span>
      </div>`;
    };
    const L = left.map((w) => leaf(w, "l")).join(""), R = right.map((w) => leaf(w, "r")).join("");
    const hubInner = o.mask
      ? `<span class="vg-hub-ch vg-hub-q han">？</span>`
      : o.ink
        ? `<span class="vg-hub-ch vg-hub-ink" data-chars="${h.h}">${Array.from(h.h).map(() => `<span class="vg-ink-cell"></span>`).join("")}</span>`
        : o.links ? `<a class="vg-hub-ch han" href="${href(h.id)}" aria-label="Open the graph of ${h.h}">${h.h}</a>` : `<span class="vg-hub-ch han">${h.h}</span>`;
    const cls = ["vg-fan", `vg-${o.size}`, o.ring ? "vg-ring" : "", left.length ? "" : "no-left", right.length ? "" : "no-right"].filter(Boolean).join(" ");
    const el = html(`<div class="${cls}" data-hub="${esc(h.id)}"${o.links ? " data-pop" : ""}>
      <svg class="vg-arrows" aria-hidden="true"></svg>
      ${left.length ? `<div class="vg-side is-left">${L}</div>` : ""}
      <div class="vg-hub"><span class="py vg-hub-py">${o.mask ? "?" : hubPy(h)}</span>${hubInner}</div>
      ${right.length ? `<div class="vg-side is-right">${R}</div>` : ""}
    </div>`);
    el._n = k;
    el._ringH = o.height || 460;
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
    for (const k of inks) if (!(await k.animate({ speed: (opts && opts.speed) || 2, gap: 40 }))) return false;
    return true;
  }

  /* ---------------- ring layout ---------------- */
  // Words that don't fit in a straight column go round the hub on an ellipse.
  //   "half": each side is its own half ellipse (right = words that start with the hub,
  //           left = the rest); only the crowded side gets wider.
  //   "full": one shared ellipse; the start-words stay centred on the right and the
  //           others wrap round the top, left and bottom (for lopsided families).
  // Tried in that order, at full size and then a size down; the first that fits wins.

  /** n points spaced evenly (by arc length) along a curve given as sampled points. */
  function spread(pts, n, offset) {
    const len = [0];
    for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = len[len.length - 1], at = (s) => {
      s = ((s % total) + total) % total;
      let j = 1; while (j < len.length - 1 && len[j] < s) j++;
      const f = (s - len[j - 1]) / ((len[j] - len[j - 1]) || 1);
      return [pts[j - 1][0] + f * (pts[j][0] - pts[j - 1][0]), pts[j - 1][1] + f * (pts[j][1] - pts[j - 1][1])];
    };
    return { total, at };
  }
  /** Half ellipse from top to bottom on one side (dir -1 left, 1 right); n words centred in equal slots. */
  function halfPoints(n, a, b, cx, cy, dir) {
    if (!n) return [];
    const pts = [];
    for (let i = 0; i <= 160; i++) { const t = (Math.PI * i) / 160; pts.push([cx + dir * a * Math.sin(t), cy - b * Math.cos(t)]); }
    const c = spread(pts);
    return Array.from({ length: n }, (_, k) => c.at(((k + 0.5) / n) * c.total));
  }
  /** Whole ellipse: right group centred at 3 o'clock (top→bottom), left group centred at 9 o'clock (top→bottom). */
  function fullPoints(nL, nR, a, b, cx, cy) {
    const pts = [];
    for (let i = 0; i <= 320; i++) { const t = (2 * Math.PI * i) / 320; pts.push([cx + a * Math.cos(t), cy + b * Math.sin(t)]); } // clockwise from 3 o'clock
    const c = spread(pts), s = c.total / (nL + nR);
    const right = Array.from({ length: nR }, (_, k) => c.at(s * (k - (nR - 1) / 2)));
    const left = Array.from({ length: nL }, (_, k) => c.at(c.total / 2 + s * ((nL - 1) / 2 - k)));
    return { left, right };
  }
  const overlaps = (r, s, gap) => r.x < s.x + s.w + gap && s.x < r.x + r.w + gap && r.y < s.y + s.h + gap && s.y < r.y + r.h + gap;
  /** Does the segment (x1,y1)–(x2,y2) pass through box b (shrunk by `inset`)? Liang–Barsky clipping. */
  function segHits(x1, y1, x2, y2, b, inset) {
    const bx = b.x + inset, by = b.y + inset, bw = b.w - 2 * inset, bh = b.h - 2 * inset, dx = x2 - x1, dy = y2 - y1;
    let t0 = 0, t1 = 1;
    for (const [p, q] of [[-dx, x1 - bx], [dx, bx + bw - x1], [-dy, y1 - by], [dy, by + bh - y1]]) {
      if (p === 0) { if (q < 0) return false; continue; }
      const r = q / p;
      if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; }
    }
    return t1 > t0;
  }

  function ringMeasure(el) {
    const hubEl = $(".vg-hub", el), L = $$(".is-left .vg-leaf", el), R = $$(".is-right .vg-leaf", el);
    const size = (n) => ({ w: n.offsetWidth, h: n.offsetHeight });
    const hs = size(hubEl), ls = L.map(size), rs = R.map(size), all = [...ls, ...rs];
    if (!all.length) return null;
    return { hubEl, hs, L, R, ls, rs, itemW: Math.max(...all.map((s) => s.w)), itemH: Math.max(...all.map((s) => s.h)) };
  }

  /** Lay the words out in `mode` with vertical radius b; returns the attempt with the fewest clashes. */
  function ringTry(m, W, mode, b) {
    const { hs, L, R, ls, rs, itemW, itemH } = m, gap = 8;
    const cy = b + itemH / 2 + 6;
    const score = (cx, pl, pr) => {
      const boxes = [...pl.map((p, i) => ({ x: p[0] - ls[i].w / 2, y: p[1] - ls[i].h / 2, w: ls[i].w, h: ls[i].h })),
                     ...pr.map((p, i) => ({ x: p[0] - rs[i].w / 2, y: p[1] - rs[i].h / 2, w: rs[i].w, h: rs[i].h }))];
      const hub = { x: cx - hs.w / 2, y: cy - hs.h / 2, w: hs.w, h: hs.h }, nl = pl.length;
      let badL = 0, badR = 0, badX = 0;
      for (let i = 0; i < boxes.length; i++) {
        if (overlaps(boxes[i], hub, gap + 6)) i < nl ? badL++ : badR++;
        for (let j = i + 1; j < boxes.length; j++) {
          if (!overlaps(boxes[i], boxes[j], gap)) continue;
          if (j < nl) badL++; else if (i >= nl) badR++; else badX++;
        }
        // keep inside the stage
        if (boxes[i].x < 0 || boxes[i].x + boxes[i].w > W) i < nl ? badL++ : badR++;
        // an arrow must not pass over another word
        const tx = boxes[i].x + boxes[i].w / 2, ty = boxes[i].y + boxes[i].h / 2;
        for (let j = 0; j < boxes.length; j++) {
          if (j !== i && segHits(cx, cy, tx, ty, boxes[j], 2)) i < nl ? badL++ : badR++;
        }
      }
      return { cx, cy, b, boxes, badL, badR, badX, bad: badL + badR + badX, H: 2 * b + itemH + 12 };
    };
    let best = null;
    const keep = (r) => { if (!best || r.bad < best.bad) best = r; return !r.bad; };
    if (mode === "full") {
      const aMax = W / 2 - 24; // the inside-the-stage check keeps the outer words in
      for (let a = Math.min(aMax, Math.max(b * 0.9, itemW * 0.8)); a <= aMax + 0.5; a += 14) {
        const cx = W / 2, p = fullPoints(L.length, R.length, a, b, cx, cy);
        if (keep(score(cx, p.left, p.right))) break;
      }
      return best;
    }
    // the outermost word on each side is the one at 3 / 9 o'clock: reserve its width, not the widest word's
    const mid = (arr) => (arr.length ? arr[Math.floor(arr.length / 2)].w : 0);
    const extL = (L.length ? mid(ls) / 2 : hs.w / 2) + 6, extR = (R.length ? mid(rs) / 2 : hs.w / 2) + 6;
    const room = W - extL - extR; // aL + aR may use this much
    const start = (n) => (n ? Math.min(room / (L.length && R.length ? 2 : 1), Math.max(b * 0.85, itemW * 0.7)) : 0);
    let aL = start(L.length), aR = start(R.length);
    for (let guard = 0; guard < 120; guard++) {
      const cx = (W - (aL + extL + aR + extR)) / 2 + aL + extL;
      const r = score(cx, halfPoints(L.length, aL, b, cx, cy, -1), halfPoints(R.length, aR, b, cx, cy, 1));
      if (keep(r)) break;
      const free = room - aL - aR;
      if (free < 1) break;
      // widen only the side that still has clashes
      const gL = L.length && (r.badL || r.badX), gR = R.length && (r.badR || r.badX), step = Math.min(free, 16);
      if (gL && gR) { const wl = L.length / (L.length + R.length); aL += step * wl; aR += step * (1 - wl); }
      else if (gL) aL += step;
      else if (gR) aR += step;
      else break;
    }
    return best;
  }

  function ringLayout(el) {
    const W = el.clientWidth; if (!W) return;
    const b0 = (m) => Math.max(m.hs.h / 2 + m.itemH / 2 + 24, (el._ringH - m.itemH - 12) / 2);
    const run = (cfg) => {
      el.classList.toggle("vg-compact", cfg.compact);
      const m = ringMeasure(el); if (!m) return null;
      return { m, best: ringTry(m, W, cfg.mode, b0(m) * cfg.grow) };
    };
    // Re-use the last choice while it still works (choosing again would resize the words and
    // set off another layout); choose again when the width changes or it stops fitting.
    let r = el._ring && Math.abs(el._ring.W - W) <= 40 ? run(el._ring) : null;
    if (!r || r.best.bad) {
      const tries = [];
      for (const compact of [false, true]) for (const mode of ["half", "full"]) tries.push({ compact, mode, grow: 1 });
      for (let g = 1.15; g <= 1.75; g += 0.15) tries.push({ compact: true, mode: "full", grow: g }, { compact: true, mode: "half", grow: g });
      let pick = null;
      for (const cfg of tries) {
        const x = run(cfg); if (!x) return;
        if (!pick || x.best.bad < pick.x.best.bad) pick = { cfg, x };
        if (!x.best.bad) break;
      }
      if (pick.x !== r) { r = run(pick.cfg); }
      el._ring = Object.assign({ W }, pick.cfg);
    }
    if (r) ringWrite(el, r.m, r.best);
  }

  function ringWrite(el, m, best) {
    const { hubEl, hs } = m, leaves = [...m.L, ...m.R];
    // the first time without transitions, so the words start from their slide-in offset
    const first = !el.classList.contains("is-laid");
    if (first) el.classList.add("vg-nofx");
    el.style.height = best.H + "px";
    hubEl.style.left = best.cx - hs.w / 2 + "px";
    hubEl.style.top = best.cy - hs.h / 2 + "px";
    leaves.forEach((lf, i) => {
      const bx = best.boxes[i];
      lf.style.left = bx.x + "px";
      lf.style.top = bx.y + "px";
      // entry: slide out from the hub
      const dx = best.cx - (bx.x + bx.w / 2), dy = best.cy - (bx.y + bx.h / 2), d = Math.hypot(dx, dy) || 1;
      lf.style.setProperty("--tx", ((dx / d) * 16).toFixed(1) + "px");
      lf.style.setProperty("--ty", ((dy / d) * 16).toFixed(1) + "px");
    });
    el.classList.add("is-laid");
    if (first) { void el.offsetWidth; el.classList.remove("vg-nofx"); }
  }

  /* ---------------- arrows ---------------- */
  // Geometry comes from offset* (relative to the fan), so the words' entry transforms don't skew it.
  const box = (n, root) => {
    let x = 0, y = 0, e = n;
    while (e && e !== root) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
    return { x, y, w: n.offsetWidth, h: n.offsetHeight };
  };
  /** How far along (dx, dy) a ray from (x, y) runs before leaving box b. */
  function exitT(x, y, dx, dy, b) {
    let t = Infinity;
    if (dx > 0) t = Math.min(t, (b.x + b.w - x) / dx); else if (dx < 0) t = Math.min(t, (b.x - x) / dx);
    if (dy > 0) t = Math.min(t, (b.y + b.h - y) / dy); else if (dy < 0) t = Math.min(t, (b.y - y) / dy);
    return Math.max(0, Math.min(1, t));
  }
  const grow = (b, p) => ({ x: b.x - p, y: b.y - p, w: b.w + 2 * p, h: b.h + 2 * p });
  function measure(el) {
    if (!el.isConnected || !el.offsetWidth) return null;
    const ch = $(".vg-hub-ch", el), hubEl = $(".vg-hub", el); if (!ch) return null;
    const ring = el.classList.contains("vg-ring");
    const big = el.classList.contains("vg-lg") ? 1 : el.classList.contains("vg-md") ? 0.8 : 0.6;
    const cb = box(ch, el), hb = grow(box(hubEl, el), 6 * big);
    const cx = cb.x + cb.w / 2, cy = cb.y + cb.h / 2;
    const lines = $$(".vg-leaf", el).map((lf) => {
      if (ring) {
        // ring: from the hub's edge straight towards the word block, stopping at its edge
        const target = box(lf, el), tb = grow(target, 7 * big);
        const tx = target.x + target.w / 2, ty = target.y + target.h / 2, dx = tx - cx, dy = ty - cy;
        const t0 = exitT(cx, cy, dx, dy, hb), t1 = 1 - exitT(tx, ty, -dx, -dy, tb);
        return { sx: cx + dx * t0, sy: cy + dy * t0, ex: cx + dx * t1, ey: cy + dy * t1 };
      }
      // columns: end at the inner edge of the characters, so no arrow crosses another word
      const wb = box($(".vg-w", lf) || lf, el), toRight = wb.x + wb.w / 2 > cx, pad = 8 * big;
      const ex = toRight ? wb.x - pad : wb.x + wb.w + pad, ey = wb.y + wb.h / 2, dx = ex - cx, dy = ey - cy;
      const t0 = exitT(cx, cy, dx, dy, hb);
      return { sx: cx + dx * t0, sy: cy + dy * t0, ex, ey };
    });
    return { W: el.offsetWidth, H: el.offsetHeight, lines, head: 9 * big + 3 };
  }
  function paint(el, g) {
    const svg = $(".vg-arrows", el); if (!svg || !g) return;
    svg.setAttribute("viewBox", `0 0 ${g.W} ${g.H}`);
    svg.setAttribute("width", g.W); svg.setAttribute("height", g.H);
    const f = (n) => n.toFixed(1);
    const ds = g.lines.map((l) => {
      const a = Math.atan2(l.ey - l.sy, l.ex - l.sx), s = g.head, sp = 0.45;
      const h1 = [l.ex - s * Math.cos(a - sp), l.ey - s * Math.sin(a - sp)], h2 = [l.ex - s * Math.cos(a + sp), l.ey - s * Math.sin(a + sp)];
      return `M${f(l.sx)} ${f(l.sy)}L${f(l.ex)} ${f(l.ey)}M${f(h1[0])} ${f(h1[1])}L${f(l.ex)} ${f(l.ey)}L${f(h2[0])} ${f(h2[1])}`;
    });
    const paths = $$(".vg-arrow", svg);
    if (paths.length === ds.length) { paths.forEach((p, k) => { if (p.getAttribute("d") !== ds[k]) p.setAttribute("d", ds[k]); }); return; }
    // first paint: carry the step state over from the words
    const leaves = $$(".vg-leaf", el);
    svg.innerHTML = ds.map((d, k) => {
      const lf = leaves[k], st = lf ? (lf.classList.contains("is-shown") ? " is-shown" : "") + (lf.classList.contains("is-current") ? " is-cur" : "") : "";
      return `<path class="vg-arrow${st}" pathLength="1" style="--k:${k}" d="${d}"/>`;
    }).join("");
  }
  let ro = null, pending = new Set(), raf = 0;
  const fans = new Set();
  /** Lay out (ring) and draw arrows for these fans: reads first, then writes. */
  function redraw(list) {
    list.filter((el) => el.isConnected && el.classList.contains("vg-ring")).forEach(ringLayout);
    const geo = list.map((el) => [el, measure(el)]);
    geo.forEach(([el, g]) => paint(el, g));
  }
  const later = (els) => {
    els.forEach((e) => pending.add(e));
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; const l = [...pending]; pending.clear(); redraw(l); });
  };
  function watch(el) {
    fans.add(el);
    if (!ro && "ResizeObserver" in window) ro = new ResizeObserver((ents) => later([...new Set(ents.map((e) => e.target.closest(".vg-fan")))].filter(Boolean)));
    const parts = () => [el, ...$$(".vg-side", el), ...(el.classList.contains("vg-ring") ? $$(".vg-leaf", el) : [])];
    if (ro) parts().forEach((p) => ro.observe(p));
    later([el]);
    // forget the fan when the view changes
    App.onCleanup(() => { fans.delete(el); if (ro) parts().forEach((p) => ro.unobserve(p)); });
  }
  const live = () => [...fans].filter((f) => f.isConnected);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => later(live()));

  /** Draw a fan in: the hub is inked while the arrows and words grow out of it. */
  function play(el, o) {
    el.classList.remove("is-drawn");
    redraw([el]);
    void el.offsetWidth;
    const inked = inkHub(el, o);
    requestAnimationFrame(() => el.classList.add("is-drawn"));
    return inked;
  }

  /* ---------------- hover card for partner characters ---------------- */
  let pop = null, popT = 0, popFor = null;
  function popEl() {
    if (pop) return pop;
    pop = html(`<div class="vg-pop" role="tooltip" hidden><div class="vg-pop-top"><span class="han vg-pop-c"></span><span class="py vg-pop-py"></span></div><div class="vg-pop-en"></div><div class="vg-pop-go"></div></div>`);
    document.body.appendChild(pop);
    return pop;
  }
  function showPop(t) {
    const c = t.dataset.c, to = t.dataset.to ? HUB.get(t.dataset.to) : null;
    const isLink = t.matches("a.vg-link");
    const meaning = to ? to.en : (WORDS.get(c) || {}).en || (CHARS[c] || [])[1] || "";
    const pos = to ? posLine(to.pos) : c.length === 1 && WORDS.get(c) ? posLine(WORDS.get(c).pos) : "";
    const p = popEl();
    $(".vg-pop-c", p).textContent = c;
    $(".vg-pop-py", p).textContent = t.dataset.py || (CHARS[c] || [])[0] || "";
    $(".vg-pop-en", p).innerHTML = (pos ? `<i>${pos}</i> ` : "") + esc(meaning);
    $(".vg-pop-go", p).innerHTML = to && isLink ? `Click to open its graph · ${to.leaves.length} words ${App.icon.arrow}` : to ? `Has its own graph · ${to.leaves.length} words` : "No graph of its own in HSK 2";
    $(".vg-pop-go", p).classList.toggle("is-link", !!(to && isLink));
    p.hidden = false;
    const r = t.getBoundingClientRect(), pw = p.offsetWidth, ph = p.offsetHeight;
    const above = r.top > ph + 16;
    const x = Math.max(8, Math.min(innerWidth - pw - 8, r.left + r.width / 2 - pw / 2));
    p.style.left = x + "px";
    p.style.top = (above ? r.top - ph - 10 : r.bottom + 10) + "px";
    p.style.setProperty("--ax", r.left + r.width / 2 - x + "px");
    p.classList.toggle("is-below", !above);
    p.classList.remove("is-on"); void p.offsetWidth; p.classList.add("is-on");
    popFor = t;
  }
  function hidePop() { if (pop) { pop.hidden = true; pop.classList.remove("is-on"); } popFor = null; }
  const popTarget = (n) => (n && n.closest ? n.closest(".vg-fan[data-pop] [data-c]") : null);
  document.addEventListener("pointerover", (e) => {
    const t = popTarget(e.target);
    clearTimeout(popT);
    if (t) { if (t !== popFor) popT = setTimeout(() => showPop(t), 110); }
    else if (popFor) popT = setTimeout(hidePop, 90);
  });
  document.addEventListener("focusin", (e) => { const t = popTarget(e.target); if (t) showPop(t); else hidePop(); });
  document.addEventListener("pointerdown", (e) => {
    // touch: a tap on a plain character shows its meaning for a moment
    const t = popTarget(e.target);
    if (t && e.pointerType === "touch" && !t.matches("a")) { showPop(t); clearTimeout(popT); popT = setTimeout(hidePop, 2600); }
  });
  window.addEventListener("scroll", () => { if (popFor) hidePop(); }, { passive: true });
  window.addEventListener("hashchange", hidePop);

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
          await f.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: "forwards" }).finished.catch(() => {});
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
  const seen = (id) => !!st().seen[id];
  const markSeen = (id) => { if (!seen(id)) { st().seen[id] = Date.now(); App.store.save(); } };
  const recordQuiz = (score, total) => {
    const q = (st().quiz = st().quiz || { best: 0, tries: 0 });
    q.tries++; q.last = score; q.total = total; q.best = Math.max(q.best, score); q.at = Date.now(); App.store.save();
  };
  const stats = () => ({ hubs: HUBS.length, seen: HUBS.filter((h) => seen(h.id)).length, quiz: st().quiz || null });

  App.vocab = { V, WORDS, CHARS, HUBS, HUB, LINKED, POS, posLine, pyHTML, pyText, hubPy, plain, runs, neighbours, href, NEW_TAG, fan, step, play, inkHub, redraw, showcase, seen, markSeen, recordQuiz, stats, shuffle, hidePop };
})();
