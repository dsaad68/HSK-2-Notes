/* ==========================================================================
   Ink — an SVG brush-stroke renderer for Chinese characters
   Uses Make Me a Hanzi outlines (clip) + medians (brush path).
   Data space: 1024 × 1024, y-up, baseline at 900 → screen Y = 900 − y.
   ========================================================================== */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const BRUSH = 200;          // brush width in data units (covers the widest strokes)
  const EXTEND = BRUSH / 2;   // extend the brush path backward so stroke heads are fully covered
  let UID = 0;

  const reduceMotion = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  const data = (ch) => (window.HANZI_DATA && window.HANZI_DATA[ch]) || null;
  const range = (n) => Array.from({ length: n }, (_, i) => i);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Easing for a brush: quick press, steady pull, gentle lift.
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) * 0.6 + t * 0.4;

  /** Bounding box (screen coords) of a set of strokes. */
  function bbox(d, idx) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const i of idx) {
      const nums = d.s[i].match(/-?\d+(?:\.\d+)?/g);
      for (let k = 0; k + 1 < nums.length; k += 2) {
        const x = +nums[k], y = 900 - +nums[k + 1];
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  }

  /** Fit transform: maps screen coords of the glyph into the 1024 box. */
  function fitFor(d, idx, opts) {
    if (opts && opts.fit === "rect") {
      // Fit strokes inside a target rectangle (screen coords): used to drop a
      // foreign component into the gap left by a missing one.
      const b = bbox(d, idx), r = opts.rect;
      let s = Math.min(r.w / Math.max(b.w, 1), r.h / Math.max(b.h, 1)) * (opts.fill || 0.96);
      s = Math.min(s, opts.maxScale || 1.15);
      return { s, tx: r.cx - s * b.cx, ty: r.cy - s * b.cy };
    }
    if (!opts || opts.fit !== "center") return { s: 1, tx: 0, ty: 0 };
    const b = bbox(d, idx);
    const fill = opts.fill || 0.74;
    let s = (1024 * fill) / Math.max(b.w, b.h, 1);
    s = Math.min(opts.maxScale || 1.25, Math.max(opts.minScale || 0.5, s));
    return { s, tx: 512 - s * b.cx, ty: 512 - s * b.cy };
  }

  /** Polyline helpers for medians (data coords). */
  function extendStart(pts, dist) {
    if (pts.length < 2) return pts.slice();
    const [a, b] = pts;
    const dx = a[0] - b[0], dy = a[1] - b[1];
    const len = Math.hypot(dx, dy) || 1;
    return [[a[0] + (dx / len) * dist, a[1] + (dy / len) * dist], ...pts];
  }
  function polyLen(pts) {
    let L = 0;
    for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return L;
  }
  function pointAt(pts, dist) {
    let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (acc + seg >= dist) {
        const t = seg ? (dist - acc) / seg : 0;
        return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
      }
      acc += seg;
    }
    return pts[pts.length - 1];
  }
  const polyPath = (pts) => "M " + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L ");

  /**
   * Transform stroke data so a subset of strokes is centered/scaled (for Hanzi Writer quizzes).
   * Returns { strokes, medians } in data coords.
   */
  function transformData(ch, idx, opts) {
    const d = data(ch);
    const f = fitFor(d, idx, Object.assign({ fit: "center" }, opts));
    // screen: X = s*x + tx ; Y = s*(900-y) + ty  →  data y' = 900 - Y
    const fx = (x) => +(f.s * x + f.tx).toFixed(1);
    const fy = (y) => +(900 - (f.s * (900 - y) + f.ty)).toFixed(1);
    return {
      strokes: idx.map((i) => d.s[i].replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g, (m, a, b) => fx(+a) + " " + fy(+b))),
      medians: idx.map((i) => d.m[i].map((p) => [fx(p[0]), fy(p[1])]))
    };
  }

  /* ------------------------------------------------------------------------
     InkChar
     ---------------------------------------------------------------------- */
  class InkChar {
    /**
     * @param {HTMLElement} host
     * @param {string} ch
     * @param {object} o
     *   strokes   indices to include (default: all)
     *   highlight indices drawn in the accent colour
     *   fit       'native' | 'center'
     *   grid      'tian' | 'mi' | 'box' | 'none'
     *   ghost     show faint outline of included strokes
     *   numbers   show stroke-order numbers while drawing
     *   shown     initial state: true = fully drawn, false = empty
     *   label     aria-label
     */
    constructor(host, ch, o) {
      this.host = host;
      this.ch = ch;
      this.o = Object.assign({ fit: "native", grid: "none", ghost: false, numbers: false, shown: true, highlight: [] }, o || {});
      this.d = data(ch);
      this.id = "ink" + ++UID;
      this.token = 0;
      this.visible = new Set();
      if (!this.d) { this._fallback(); return; }
      this.idx = this.o.strokes ? this.o.strokes.slice() : range(this.d.s.length);
      this.fit = fitFor(this.d, this.o.fitStrokes || this.idx, this.o);
      this._build();
      if (this.o.shown) this.showAll(); else this.hideAll();
    }

    _fallback() {
      // Character without stroke data: render as text (still centred in the box).
      const svg = el("svg", { viewBox: "0 0 1024 1024", class: "ink ink--text", role: "img", "aria-label": this.o.label || this.ch });
      this._grid(svg);
      const t = el("text", { x: 512, y: 540, "text-anchor": "middle", "dominant-baseline": "middle", class: "ink-fallback" }, svg);
      t.textContent = this.ch;
      this.svg = svg;
      this.host.appendChild(svg);
      this.idx = [];
    }

    _grid(svg) {
      const g = this.o.grid;
      if (!g || g === "none") return;
      const gg = el("g", { class: "ink-grid" }, svg);
      const p = 6;
      if (g !== "cross") el("rect", { x: p, y: p, width: 1024 - 2 * p, height: 1024 - 2 * p, class: "ink-grid-box" }, gg);
      if (g === "tian" || g === "mi" || g === "cross") {
        el("line", { x1: p, y1: 512, x2: 1024 - p, y2: 512, class: "ink-grid-dash" }, gg);
        el("line", { x1: 512, y1: p, x2: 512, y2: 1024 - p, class: "ink-grid-dash" }, gg);
      }
      if (g === "mi") {
        el("line", { x1: p, y1: p, x2: 1024 - p, y2: 1024 - p, class: "ink-grid-dash" }, gg);
        el("line", { x1: 1024 - p, y1: p, x2: p, y2: 1024 - p, class: "ink-grid-dash" }, gg);
      }
    }

    _build() {
      const { s, tx, ty } = this.fit;
      const svg = el("svg", { viewBox: "0 0 1024 1024", class: "ink", role: "img", "aria-label": this.o.label || this.ch });
      this._grid(svg);
      const defs = el("defs", null, svg);
      const fitG = el("g", { class: "ink-fit", transform: `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})` }, svg);
      const flip = el("g", { transform: "translate(0 900) scale(1 -1)" }, fitG);
      this.ghostG = el("g", { class: "ink-ghosts" }, flip);
      this.strokeG = el("g", { class: "ink-strokes" }, flip);
      this.tip = el("g", { class: "ink-tip" }, flip);
      el("circle", { r: 74, class: "ink-tip-halo" }, this.tip);
      el("circle", { r: 24, class: "ink-tip-core" }, this.tip);
      this.numG = el("g", { class: "ink-nums" }, svg);

      this.parts = {};
      const hl = new Set(this.o.highlight);
      const hl2 = new Set(this.o.highlight2 || []);
      for (const i of this.idx) {
        const outline = this.d.s[i];
        el("path", { d: outline, class: "ink-ghost" + (hl.has(i) ? " is-hl" : "") }, this.ghostG);
        const cp = el("clipPath", { id: `${this.id}-c${i}` }, defs);
        el("path", { d: outline }, cp);
        const pts = extendStart(this.d.m[i], EXTEND);
        const L = polyLen(pts) + BRUSH / 2;
        const brush = el("path", {
          d: polyPath(pts),
          class: "ink-brush" + (hl.has(i) ? " is-hl" : hl2.has(i) ? " is-hl2" : ""),
          "clip-path": `url(#${this.id}-c${i})`,
          "stroke-dasharray": `${L.toFixed(1)} ${L.toFixed(1)}`,
          "stroke-dashoffset": L.toFixed(1)
        }, this.strokeG);
        this.parts[i] = { brush, pts, L };
      }
      if (!this.o.ghost) this.ghostG.style.display = "none";
      this.svg = svg;
      this.host.appendChild(svg);
    }

    /** Screen-space point for data point (used for stroke numbers & overlays). */
    toScreen(x, y) {
      const { s, tx, ty } = this.fit;
      return [s * x + tx, s * (900 - y) + ty];
    }

    setGhost(on) { if (this.ghostG) this.ghostG.style.display = on ? "" : "none"; this.o.ghost = on; }
    setNumbers(on) { this.o.numbers = on; if (!on && this.numG) this.numG.replaceChildren(); else this._renderNumbers(); }

    setHighlight(list) {
      const hl = new Set(list || []);
      this.o.highlight = [...hl];
      for (const i of this.idx) this.parts[i].brush.classList.toggle("is-hl", hl.has(i));
      this.ghostG && [...this.ghostG.children].forEach((g, k) => g.classList.toggle("is-hl", hl.has(this.idx[k])));
    }

    _set(i, frac) {
      const p = this.parts[i];
      if (!p) return;
      p.brush.style.visibility = frac <= 0 ? "hidden" : "visible";
      p.brush.setAttribute("stroke-dashoffset", (p.L * (1 - frac)).toFixed(1));
      if (frac >= 1) this.visible.add(i); else this.visible.delete(i);
    }

    show(list) { (list || this.idx).forEach((i) => this._set(i, 1)); this._renderNumbers(); }
    hide(list) { (list || this.idx).forEach((i) => this._set(i, 0)); this._renderNumbers(); }
    showAll() { this.stop(); this.show(this.idx); }
    hideAll() { this.stop(); this.hide(this.idx); }

    /** Show strokes [0..n) in drawing order, instantly. */
    showUpTo(n, order) {
      this.stop();
      const ord = order || this.idx;
      ord.forEach((i, k) => this._set(i, k < n ? 1 : 0));
      this._renderNumbers();
    }

    stop() {
      this.token++;
      if (this.tip) this.tip.classList.remove("is-on");
    }

    _renderNumbers() {
      if (!this.numG) return;
      this.numG.replaceChildren();
      if (!this.o.numbers) return;
      let n = 0;
      for (const i of this.idx) {
        n++;
        if (!this.visible.has(i) && !(this._drawing === i)) continue;
        const m = this.d.m[i];
        const [x, y] = this.toScreen(m[0][0], m[0][1]);
        const [x2, y2] = this.toScreen((m[1] || m[0])[0], (m[1] || m[0])[1]);
        const dx = x - x2, dy = y - y2, len = Math.hypot(dx, dy) || 1;
        const bx = x + (dx / len) * 46, by = y + (dy / len) * 46;
        const g = el("g", { class: "ink-num" + (this.o.highlight.includes(i) ? " is-hl" : ""), transform: `translate(${bx.toFixed(1)} ${by.toFixed(1)})` }, this.numG);
        el("circle", { r: 40 }, g);
        const t = el("text", { "text-anchor": "middle", "dominant-baseline": "central", y: 2 }, g);
        t.textContent = n;
      }
    }

    /** Animate one stroke. Resolves false if cancelled. */
    async drawStroke(i, opts) {
      const p = this.parts[i];
      if (!p) return true;
      const token = this.token;
      const speed = (opts && opts.speed) || 1;
      const dur = reduceMotion() ? 120 : Math.max(240, 150 + p.L * 0.62) / speed;
      const tipOn = !(opts && opts.tip === false);
      this._drawing = i;
      this._renderNumbers();
      if (tipOn) this.tip.classList.add("is-on");
      this.tip.classList.toggle("is-hl", this.o.highlight.includes(i));
      const t0 = performance.now();
      await new Promise((resolve) => {
        const frame = (now) => {
          if (token !== this.token) return resolve();
          const t = Math.min(1, (now - t0) / dur);
          const e = ease(t);
          this._set(i, e);
          if (tipOn) {
            const [x, y] = pointAt(p.pts, Math.max(0, Math.min(p.L - BRUSH / 2, e * p.L - BRUSH / 4)));
            this.tip.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
          }
          if (t < 1) requestAnimationFrame(frame); else resolve();
        };
        requestAnimationFrame(frame);
      });
      this._drawing = null;
      if (token !== this.token) return false;
      this._set(i, 1);
      this.tip.classList.remove("is-on");
      if (opts && opts.onStroke) opts.onStroke(i);
      return true;
    }

    /**
     * Animate strokes in order.
     * opts: { strokes, speed, gap, clear, onStroke(i, k), onStart(i,k), startDelay }
     */
    async animate(opts) {
      this.stop();
      return this._run(opts || {}, this.token);
    }

    async _run(opts, token) {
      if (!this.d) return true;
      const list = opts.strokes || this.idx;
      const speed = opts.speed || 1;
      if (opts.clear !== false) this.hide(list);
      if (opts.startDelay) { await sleep(opts.startDelay); if (token !== this.token) return false; }
      for (let k = 0; k < list.length; k++) {
        if (token !== this.token) return false;
        opts.onStart && opts.onStart(list[k], k);
        const ok = await this.drawStroke(list[k], { speed, tip: opts.tip });
        if (!ok || token !== this.token) return false;
        opts.onStroke && opts.onStroke(list[k], k);
        if (k < list.length - 1) {
          await sleep((reduceMotion() ? 40 : (opts.gap != null ? opts.gap : 140)) / speed);
        }
      }
      this._renderNumbers();
      return token === this.token;
    }

    /** Loop the animation until stopped. */
    async loop(opts) {
      opts = opts || {};
      this.stop();
      const token = this.token;
      while (token === this.token) {
        const ok = await this._run(opts, token);
        if (!ok) return;
        await sleep(opts.hold || 1600);
        if (token !== this.token) return;
        opts.onLoop && opts.onLoop();
      }
    }

    destroy() { this.stop(); this.svg && this.svg.remove(); }
  }

  /* Convenience: render a static glyph and return the instance. */
  function glyph(host, ch, opts) { return new InkChar(host, ch, Object.assign({ shown: true }, opts)); }

  /* Component glyph (radical extracted from its source character, centred). */
  function component(host, comp, opts) {
    return new InkChar(host, comp.src[0], Object.assign({ strokes: comp.src[1], fit: "center", shown: true }, opts));
  }

  /** Top-level components of a character as stroke-index groups, e.g. 明 → [[0..3],[4..7]]. */
  function groups(ch) {
    const d = data(ch);
    if (!d || !d.g) return null;
    const out = {};
    Array.from(d.g).forEach((c, i) => { const k = c === "-" ? "z" : c; (out[k] = out[k] || []).push(i); });
    return Object.keys(out).sort().map((k) => out[k]);
  }

  window.Ink = { InkChar, glyph, component, data, bbox, fitFor, transformData, range, sleep, reduceMotion, groups };
})();
