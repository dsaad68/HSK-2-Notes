/* ==========================================================================
   Learn — the radical atlas: one grid, every card labelled with level & lesson
   ========================================================================== */
(function () {
  "use strict";
  const H = window.HSK;
  const { $, $$, html } = App;

  const FILTERS = [
    { v: "all", label: "All", pos: null },
    { v: "left", label: "Left", pos: ["left"] },
    { v: "right", label: "Right", pos: ["right"] },
    { v: "top", label: "Top", pos: ["top"] },
    { v: "bottom", label: "Bottom", pos: ["bottom"] },
    { v: "wrap", label: "Wraps", pos: ["frame", "wrap-tl", "wrap-bl"] }
  ];
  const LESSON_ZH = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四", "十五"];

  function card(r, delay) {
    const studied = App.store.isStudied(r.id);
    const tags = r.isExtra
      ? `<span class="rad-tag is-level">HSK 2</span><span class="rad-tag">Exam option</span>`
      : `<span class="rad-tag is-level">HSK 2</span><span class="rad-tag">Lesson ${r.lesson} <span class="han">第${LESSON_ZH[r.lesson - 1]}课</span></span>`;
    const c = html(`<a class="rad-card reveal" href="#/learn/${r.id}" style="--d:${delay || 0}ms" aria-label="${r.name} ${r.py}, ${r.en}${r.isExtra ? "" : ", HSK 2 lesson " + r.lesson}">
      <div class="rad-tags">${tags}</div>
      <div class="rad-card-top">
        <div class="glyph-box" style="view-transition-name: rad-${r.id}"></div>
        <div>
          <div class="rad-name">${r.name}</div>
          <div class="rad-py">${r.py}</div>
          <div class="rad-en">${r.en}</div>
        </div>
      </div>
      <div class="rad-card-foot">
        <div class="rad-examples">${r.examples.map((e) => `<span><small>${e.py.split(" ")[0]}</small><b>${e.ch}</b></span>`).join("")}</div>
        <div class="rad-card-meta"><span title="${H.POSITIONS[r.pos].label}">${App.posDiagram(r.pos)}</span>
        <span class="studied-dot${studied ? " is-on" : ""}" title="${studied ? "Studied" : "Not studied yet"}">${App.icon.check}</span></div>
      </div>
    </a>`);
    const k = App.compInk($(".glyph-box", c), r, { grid: "tian" });
    let busy = false;
    c.addEventListener("mouseenter", () => {
      if (busy) return; busy = true;
      k.animate({ speed: 1.8, gap: 80 }).then(() => { busy = false; });
    });
    return c;
  }

  App.views.learn = {
    nav: "learn",
    title: "Learn the radicals",
    render() {
      const st = App.stats();
      const root = html(`<div class="wrap">
        <header class="page-head">
          <span class="eyebrow">学 · Learn</span>
          <h1 class="title-lg">The 30 radicals<span class="zh-sub">偏旁</span></h1>
          <p class="lede">In textbook order. Each card shows its level and lesson. Hover a card to watch it being written, and open it for stroke order, its origin, examples and handwriting practice.</p>
        </header>
        <div class="atlas-bar">
          <div class="filters" role="group" aria-label="Filter by position"></div>
          <div class="atlas-progress"><span>${st.studied} / 30 studied</span><div class="bar-track"><div class="bar-fill" style="width:0%"></div></div></div>
        </div>
        <div class="rad-grid atlas-grid"></div>
        <section class="section">
          <div class="section-head"><div><span class="eyebrow">Also in the exam</span><h2 class="title-md" style="margin-top:10px">8 more components from the answer options</h2></div>
          <p class="muted" style="max-width:440px">These come up as options in the 15 exam sets but aren't among the textbook's 30. They're worth a look too.</p></div>
          <div class="rad-grid extras-grid"></div>
        </section>
      </div>`);

      const grid = $(".atlas-grid", root);
      const filtersEl = $(".filters", root);
      let filter = "all";

      FILTERS.forEach((f) => {
        const n = f.pos ? H.RADICALS.filter((r) => f.pos.includes(r.pos)).length : 30;
        const b = html(`<button class="filter" data-v="${f.v}" aria-pressed="${f.v === filter}">${f.pos ? App.posDiagram(f.pos[0] === "frame" ? "wrap-tl" : f.pos[0]) : App.posDiagram("")}${f.label} <span class="count">${n}</span></button>`);
        b.addEventListener("click", () => { filter = f.v; $$(".filter", filtersEl).forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); });
        filtersEl.appendChild(b);
      });

      const draw = () => {
        const f = FILTERS.find((x) => x.v === filter);
        grid.replaceChildren();
        H.RADICALS.filter((r) => !f.pos || f.pos.includes(r.pos)).forEach((r, i) => grid.appendChild(card(r, (i % 8) * 45)));
        App.reveal(grid);
      };
      draw();

      const ex = $(".extras-grid", root);
      H.EXTRAS.forEach((r, i) => ex.appendChild(card(r, (i % 4) * 60)));

      requestAnimationFrame(() => setTimeout(() => { $(".bar-fill", root).style.width = (st.studied / 30) * 100 + "%"; }, 200));
      return root;
    }
  };
})();
