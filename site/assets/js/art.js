/* ==========================================================================
   Art — renders the origin illustrations and "draws" them line by line
   ========================================================================== */
(function () {
  "use strict";
  const O = () => window.HSK_ORIGINS || {};
  const LINE = ".lroad, .l, .la, .lw, .lk, .lwood, .lpaper, .e, .ea";
  const FILLS = ["fw", "fi", "fp", "fp2", "ff", "ff2", "fe", "fe2", "fm", "fs", "fk", "fb", "fr", "fr2", "fr3", "fn", "fd", "fa", "fiw", "road", "shade", "ef", "tx"];

  /**
   * Build an illustration element.
   * kind: "art" (scene, 160×120) or "early" (ancient form, 100×100)
   * opts.drawn: start fully drawn (no animation)
   */
  function make(id, kind, opts) {
    opts = opts || {};
    const o = O()[id];
    const wrap = document.createElement("div");
    wrap.className = "art-wrap art-" + kind;
    if (!o || !o[kind]) { wrap.classList.add("is-empty"); return wrap; }
    const vb = kind === "art" ? "0 0 160 120" : "0 0 100 100";
    wrap.innerHTML = `<svg class="art ${kind === "early" ? "early" : ""}${opts.drawn ? " is-drawn" : ""}" viewBox="${vb}" role="img" aria-label="${opts.label || id}">${o[kind]}</svg>`;
    const svg = wrap.firstElementChild;
    let i = 0;
    svg.querySelectorAll(LINE).forEach((n) => {
      if (n.classList.contains("ld")) { n.classList.add("fade"); return; }
      // A class (not the camelCase [pathLength] attribute) drives the CSS: Chrome does not
      // reliably restyle SVG children matched only by that attribute when an ancestor class flips.
      n.setAttribute("pathLength", "1");
      n.classList.add("dl");
      n.style.setProperty("--i", i++);
    });
    svg.querySelectorAll("*").forEach((n) => {
      if (FILLS.some((c) => n.classList.contains(c))) n.classList.add("fill");
    });
    svg.style.setProperty("--n", Math.max(1, i));
    if (kind === "early" && o.rotate) svg.classList.add("rotates");
    return wrap;
  }

  /** Play the drawing animation. Resolves when finished. */
  function draw(wrap, speed) {
    const svg = wrap && wrap.querySelector("svg.art");
    if (!svg) return Promise.resolve();
    svg.style.setProperty("--speed", speed || 1);
    svg.classList.remove("is-drawn", "is-rotated");
    void svg.getBoundingClientRect();
    svg.classList.add("is-drawn");
    const n = +svg.style.getPropertyValue("--n") || 1;
    const ms = App.reduceMotion() ? 50 : ((n * 90 + 900) / (speed || 1));
    return new Promise((res) => setTimeout(() => {
      if (svg.classList.contains("rotates")) { svg.classList.add("is-rotated"); setTimeout(res, 900); }
      else res();
    }, ms));
  }

  function reset(wrap) {
    const svg = wrap && wrap.querySelector("svg.art");
    if (svg) svg.classList.remove("is-drawn", "is-rotated");
  }

  App.art = { make, draw, reset, has: (id, kind) => !!(O()[id] && O()[id][kind || "art"]) };
})();
