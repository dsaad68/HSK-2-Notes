/* ==========================================================================
   Landing page — the five parts of the notes
   ========================================================================== */
(function () {
  "use strict";
  const H = window.HSK;
  const { $, $$, html, sleep } = App;
  const pad = (n) => String(n).padStart(2, "0");

  App.views.hub = {
    section: "hub",
    nav: "",
    title: "",
    render() {
      const S = window.HSK_SECTIONS;
      const rs = App.stats(), xs = App.expr.stats();
      const meta = {
        expressions: `<div class="toc-meta">
            <span class="chip chip-accent">${xs.lessons} lessons</span><span class="chip">${App.expr.ALL.length} expressions</span>
            <span class="toc-prog"><i style="--w:${((xs.tried / xs.lessons) * 100).toFixed(1)}%"></i></span><span class="toc-prog-l">${xs.tried}/${xs.lessons} lessons tried${xs.perfect ? ` · ${xs.perfect} perfect` : ""}</span>
          </div>`,
        radicals: `<div class="toc-meta">
            <span class="chip chip-accent">30 radicals</span><span class="chip">15 exam sets</span>
            <span class="toc-prog"><i style="--w:${((rs.studied / 30) * 100).toFixed(1)}%"></i></span><span class="toc-prog-l">${rs.studied}/30 studied · ${rs.setsDone}/15 sets done</span>
          </div>`
      };
      const live = S.filter((s) => s.status === "live");
      const root = html(`<div class="page-hub">
        <section class="hero wrap hub-hero">
          <div class="hero-grid">
            <div class="hero-copy">
              <span class="eyebrow">HSK 2 · 二级 · Version 3.0</span>
              <h1 class="title-xl">HSK 2, <em>one piece</em> at a time.</h1>
              <p class="lede">Study notes for the HSK 2 exam, built from your textbook pages and practice exams. Each part has animated lessons and practice questions, so you can pick a part and start.</p>
              <div class="btn-row">
                ${live.map((s, k) => `<a class="btn${k === 0 ? " btn-primary" : ""}" href="${s.href}">${s.en}${k === 0 ? " " + App.icon.arrow : ""}</a>`).join("")}
              </div>
              <div class="hero-stats">
                <div><b>${S.length}</b><span>parts · 部分</span></div>
                <div><b>${live.length}</b><span>ready now</span></div>
                <div><b>${App.expr.ALL.length + 30}</b><span>words &amp; radicals</span></div>
              </div>
            </div>
            <div class="hub-stage card" aria-label="The five parts, written stroke by stroke">
              <div class="hub-cell"></div>
              <div class="hub-cap"><span class="hub-cap-n"></span><span class="han hub-cap-zh"></span><span class="py hub-cap-py"></span><span class="hub-cap-en"></span><span class="hub-cap-st"></span></div>
              <div class="hub-tabs" role="tablist" aria-label="Parts">
                ${S.map((s) => `<button role="tab" class="${s.status === "live" ? "is-live" : ""}" aria-label="${s.en}"><span class="han">${s.glyph}</span><small>${pad(s.n)}</small></button>`).join("")}
              </div>
            </div>
          </div>
        </section>

        <section class="section wrap">
          <div class="section-head reveal">
            <div><span class="eyebrow">Contents · 目录</span><h2 class="title-lg" style="margin-top:12px">Five parts of HSK 2</h2></div>
            <p class="muted" style="max-width:420px">${live.length} parts are ready. The others are on their way and will appear here.</p>
          </div>
          <ol class="hub-toc">
            ${S.map((s, k) => s.status === "live" ? `
            <li class="reveal" style="--d:${k * 60}ms">
              <a class="toc-row card is-live" href="${s.href}" data-id="${s.id}">
                <span class="toc-n">${pad(s.n)}</span>
                <span class="toc-seal han" aria-hidden="true">${s.glyph}</span>
                <div class="toc-body">
                  <div class="toc-zh"><span class="han">${s.zh}</span><span class="py">${s.py}</span></div>
                  <h3 class="title-md">${s.en}</h3>
                  <p>${s.desc}</p>
                  ${meta[s.id] || ""}
                  <span class="toc-cta">${s.cta} ${App.icon.arrow}</span>
                </div>
                <div class="toc-vis" aria-hidden="true"></div>
              </a>
            </li>` : `
            <li class="reveal" style="--d:${k * 60}ms">
              <div class="toc-row card is-soon" aria-disabled="true">
                <span class="toc-n">${pad(s.n)}</span>
                <span class="toc-seal han" aria-hidden="true">${s.glyph}</span>
                <div class="toc-body">
                  <div class="toc-zh"><span class="han">${s.zh}</span><span class="py">${s.py}</span></div>
                  <h3 class="title-md">${s.en}</h3>
                  <p>${s.desc}</p>
                </div>
                <span class="chip toc-soon">Coming soon</span>
              </div>
            </li>`).join("")}
          </ol>
        </section>
      </div>`);
      this.root = root;
      return root;
    },

    mounted() {
      const root = this.root;
      this.stage($(".hub-stage", root));
      const xv = $('.toc-row[data-id="expressions"] .toc-vis', root);
      if (xv) {
        const pick = ["茶杯", "雨衣", "火车站", "钱包", "运动服"].map((w) => App.expr.ALL.find((e) => e.w === w));
        App.expr.showcase(xv, pick, { builder: { cell: 40, rcell: 54 }, hold: 2200 });
      }
      const rv = $('.toc-row[data-id="radicals"] .toc-vis', root);
      if (rv) this.radicals(rv);
    },

    /* Hero: write each part's character with the brush, one after another. */
    stage(el) {
      const alive = App.alive();
      const S = window.HSK_SECTIONS;
      const cell = $(".hub-cell", el), tabs = $$(".hub-tabs button", el);
      const cap = $(".hub-cap", el);
      let i = 2, run = 0; // start on Expressions
      tabs.forEach((t, k) => t.addEventListener("click", () => { i = k; loop(); }));
      const loop = async () => {
        const my = ++run;
        const ok = () => alive() && my === run;
        while (ok()) {
          const s = S[i];
          tabs.forEach((t, k) => { t.classList.toggle("is-on", k === i); t.setAttribute("aria-selected", k === i); });
          cap.classList.remove("is-on");
          cell.replaceChildren();
          const k = App.ink(cell, s.glyph, { grid: "mi", shown: false, label: s.glyph });
          $(".hub-cap-n", cap).textContent = pad(s.n);
          $(".hub-cap-zh", cap).textContent = s.zh;
          $(".hub-cap-py", cap).textContent = s.py;
          $(".hub-cap-en", cap).textContent = s.en;
          const st = $(".hub-cap-st", cap);
          st.textContent = s.status === "live" ? "Ready" : "Coming soon";
          st.className = "hub-cap-st " + (s.status === "live" ? "is-live" : "");
          await sleep(200); if (!ok()) return;
          cap.classList.add("is-on");
          if (!(await k.animate({ speed: 1.15, gap: 110 })) || !ok()) return;
          await sleep(2000); if (!ok()) return;
          i = (i + 1) % S.length;
        }
      };
      App.whenVisible(el, loop);
      App.onCleanup(() => { run++; });
    },

    /* Radicals row: characters drawn with their radical in red. */
    radicals(host) {
      const alive = App.alive();
      const list = H.SHOWCASE;
      const box = html(`<div class="toc-ink"><div class="toc-ink-cell"></div><div class="toc-ink-cap"><span class="han"></span><small></small></div></div>`);
      host.appendChild(box);
      const cell = $(".toc-ink-cell", box), cap = $(".toc-ink-cap", box);
      let i = 0, run = 0;
      const loop = async () => {
        const my = ++run;
        const ok = () => alive() && my === run;
        while (ok()) {
          const s = list[i];
          cell.replaceChildren();
          cap.classList.remove("is-on");
          const k = App.ink(cell, s.ch, { grid: "mi", shown: false, highlight: s.rad, label: s.ch });
          $(".han", cap).textContent = s.ch;
          $("small", cap).textContent = `${s.py} · ${s.en}`;
          if (!(await k.animate({ speed: 1.7, gap: 70 })) || !ok()) return;
          cap.classList.add("is-on");
          await sleep(1700); if (!ok()) return;
          i = (i + 1) % list.length;
        }
      };
      App.whenVisible(host, loop);
      App.onCleanup(() => { run++; });
    }
  };
})();
