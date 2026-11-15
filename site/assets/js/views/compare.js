/* ==========================================================================
   Compare — easily-confused radicals side by side, differences pulsing
   ========================================================================== */
(function () {
  "use strict";
  const H = window.HSK;
  const { $, $$, html } = App;

  App.views.compare = {
    nav: "compare",
    title: "Compare lookalikes",
    render() {
      const root = html(`<div class="wrap">
        <header class="page-head">
          <span class="eyebrow">辨 · Compare</span>
          <h1 class="title-lg">Spot the difference<span class="zh-sub">形近偏旁</span></h1>
          <p class="lede">Most wrong answers in Part I come from radicals that look alike. Here they are side by side, with the strokes that tell them apart pulsing in red.</p>
        </header>
        <div class="compare-list" style="margin:30px 0 60px"></div>
      </div>`);
      const list = $(".compare-list", root);

      H.LOOKALIKES.forEach((L, n) => {
        const card = html(`<article class="card cmp reveal" style="--d:${(n % 2) * 70}ms">
          <div class="cmp-head"><h3>${L.title}</h3><button class="btn btn-sm btn-ghost" data-replay>${App.icon.replay} Replay</button></div>
          <div class="cmp-body"></div>
          <div class="cmp-hint">${App.icon.bulb}<div>${L.hint}</div></div>
        </article>`);
        const body = $(".cmp-body", card);
        const glyphs = [];
        L.ids.forEach((id, j) => {
          const c = App.comp(id);
          const ex = L.ex[j];
          const exIdx = (c.examples.find((e) => e.ch === ex) || c.examples[0]).idx;
          const item = html(`<a class="cmp-item" href="#/learn/${id}">
            <div class="cmp-glyph"></div>
            <span class="count">${c.src[1].length} strokes</span>
            <div class="nm">${c.name}</div>
            <div class="en">${c.en}</div>
            <div class="ex"><div class="ex-mini"></div><span style="font-size:12.5px;color:var(--ink-3)">${H.POSITIONS[c.pos].label}</span></div>
          </a>`);
          const diff = (L.diff[id] || []).map((k) => c.src[1][k]);
          const g = App.compInk($(".cmp-glyph", item), c, { grid: "tian", highlight: diff, shown: false });
          glyphs.push(g);
          App.ink($(".ex-mini", item), ex, { highlight: exIdx });
          body.appendChild(item);
        });
        const play = () => glyphs.forEach((g, i) => App.later(() => g.animate({ speed: 1.3, gap: 160 }), i * 180));
        $("[data-replay]", card).addEventListener("click", play);
        App.whenVisible(card, play);
        list.appendChild(card);
      });
      return root;
    }
  };
})();
