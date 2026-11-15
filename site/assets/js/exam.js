/* ==========================================================================
   Exam engine — shared by the home demo, exam sets and challenge mode
   ========================================================================== */
(function () {
  "use strict";
  const { $, html, sleep } = App;
  const icon = App.icon;

  /** A/B/C/D option tile with the component drawn in the middle. */
  function optionButton(letter, comp, extraClass) {
    const b = html(`<button class="opt ${extraClass || ""}" data-letter="${letter}" aria-label="Option ${letter}: ${comp.name}, ${comp.en}">
      <span class="opt-letter">${letter}</span><span class="opt-glyph"></span></button>`);
    b.comp = comp;
    b.ink = App.compInk($(".opt-glyph", b), comp, {});
    return b;
  }

  /** Row of 田字格 cells with pinyin. If `miss` is given, character `t` is drawn without those strokes. */
  function wordTiles(word, py, t, miss, opts) {
    opts = opts || {};
    const el = html(`<div class="word"${opts.cell ? ` style="--cell:${opts.cell}px"` : ""}></div>`);
    const out = { el, cells: [] };
    Array.from(word).forEach((ch, k) => {
      const cell = html(`<div class="cell"><div class="cell-py py">${py[k] || ""}</div><div class="cell-ch"></div></div>`);
      const box = $(".cell-ch", cell);
      el.appendChild(cell);
      if (k === t && miss) {
        cell.classList.add("is-target");
        const d = Ink.data(ch);
        const keep = Ink.range(d.s.length).filter((i) => !miss.includes(i));
        const ink = App.ink(box, ch, { strokes: keep, grid: "cross", label: "incomplete character" });
        const b = Ink.bbox(d, miss), pad = 30;
        const pct = (v) => Math.max(0, Math.min(100, (v / 1024) * 100)).toFixed(2) + "%";
        // Like the real paper, the gap is invisible until the learner asks for a hint.
        const gap = html(`<div class="gap${opts.showGap ? "" : " is-concealed"}" aria-hidden="true"><span class="gap-q">?</span></div>`);
        Object.assign(gap.style, { left: pct(b.x0 - pad), top: pct(b.y0 - pad), width: pct(b.w + 2 * pad), height: pct(b.h + 2 * pad) });
        // Put the "?" at the centroid of the missing strokes (e.g. bottom-left for 辶).
        let sx = 0, sy = 0, n = 0;
        miss.forEach((i) => d.m[i].forEach((p) => { sx += p[0]; sy += 900 - p[1]; n++; }));
        const q = $(".gap-q", gap);
        q.style.left = (((sx / n - (b.x0 - pad)) / (b.w + 2 * pad)) * 100).toFixed(1) + "%";
        q.style.top = (((sy / n - (b.y0 - pad)) / (b.h + 2 * pad)) * 100).toFixed(1) + "%";
        box.appendChild(gap);
        const slot = html(`<div class="slot"></div>`);
        box.appendChild(slot);
        Object.assign(out, { target: ink, targetCell: cell, box, gap, slot, ch, miss, gapRect: { cx: b.cx, cy: b.cy, w: b.w, h: b.h } });
      } else {
        App.ink(box, ch, { grid: "cross" });
      }
      out.cells.push(cell);
    });
    return out;
  }

  /** One numbered question row (or the 例如 example row). */
  function questionRow(q, opts) {
    opts = opts || {};
    const ex = !!opts.example;
    const row = html(`<div class="qrow${ex ? " is-example" : ""}" data-no="${q.no}" ${ex ? "" : 'tabindex="0" role="button"'} aria-label="${ex ? "Example" : "Question " + q.no}">
        <div class="qno">${ex ? "例如" : q.no + "."}</div>
        <div class="q-word"></div>
        <div class="q-meta">${!ex && opts.hint !== false ? `<button class="hint-btn" type="button" aria-pressed="false" title="Show where the missing piece goes (H)">${icon.bulb}<span>Hint</span></button>` : ""}<div class="en">${q.en}</div></div>
        <div class="ans-box" aria-live="polite"></div>
        <div class="hint-line"></div>
        <div class="explain"><div><div class="explain-inner"></div></div></div>
      </div>`);
    const tiles = wordTiles(q.word, q.py, q.t, q.miss, { cell: opts.cell });
    $(".q-word", row).appendChild(tiles.el);
    const ctx = { row, tiles, q, ans: $(".ans-box", row), hint: $(".hint-line", row), explain: $(".explain-inner", row) };
    const hb = $(".hint-btn", row);
    if (hb) {
      ctx.toggleHint = (on) => setHint(tiles, hb, on);
      hb.addEventListener("click", () => ctx.toggleHint());
    }
    return ctx;
  }

  /** Reveal (or conceal again) where the missing piece goes, for one question only. */
  function setHint(tiles, btn, on) {
    if (!tiles.gap) return;
    const show = on === undefined ? tiles.gap.classList.contains("is-concealed") : on;
    tiles.gap.classList.toggle("is-concealed", !show);
    if (btn) {
      btn.setAttribute("aria-pressed", show);
      btn.querySelector("span").textContent = show ? "Hide hint" : "Hint";
    }
    if (show && !App.reduceMotion()) tiles.gap.animate([{ transform: "scale(0.85)", opacity: 0 }, { transform: "scale(1.06)", opacity: 1, offset: 0.6 }, { transform: "none", opacity: 1 }], { duration: 450, easing: "cubic-bezier(.34,1.56,.64,1)" });
    App.sfx.tick();
  }

  /** Put a component into the gap (no animation). exact = it is the true answer. */
  function fillSlot(tiles, comp, exact, tone) {
    tiles.slot.replaceChildren();
    tiles.slot.className = "slot is-" + (tone || "correct");
    if (!comp) { tiles.gap.classList.remove("is-hidden"); return null; }
    tiles.gap.classList.add("is-hidden");
    if (exact) return App.ink(tiles.slot, tiles.ch, { strokes: tiles.miss, highlight: tiles.miss });
    return App.ink(tiles.slot, comp.src[0], { strokes: comp.src[1], fit: "rect", rect: tiles.gapRect, highlight: comp.src[1] });
  }

  /**
   * Fly a component from an element (option glyph / drag ghost) into the gap.
   * Resolves with the overlay once it has landed (caller decides what happens next).
   */
  async function fly(fromEl, tiles, comp, exact, tone) {
    const to = tiles.box.getBoundingClientRect();
    const from = fromEl.getBoundingClientRect();
    const ov = html(`<div class="flight${tone === "neutral" ? " is-neutral" : ""}"></div>`);
    Object.assign(ov.style, { left: to.left + "px", top: to.top + "px", width: to.width + "px", height: to.height + "px" });
    document.body.appendChild(ov);
    const src = exact ? tiles.ch : comp.src[0];
    const idx = exact ? tiles.miss : comp.src[1];
    const k = App.ink(ov, src, exact ? { strokes: idx } : { strokes: idx, fit: "rect", rect: tiles.gapRect });
    const g = k.svg.querySelector(".ink-fit");
    const tf = (f) => `translate(${f.tx.toFixed(2)}px, ${f.ty.toFixed(2)}px) scale(${f.s.toFixed(4)})`;
    const fin = k.fit, start = Ink.fitFor(Ink.data(src), idx, { fit: "center" });
    g.removeAttribute("transform");
    g.style.transform = tf(fin);
    tiles.gap.classList.add("is-hidden");
    if (App.reduceMotion()) return ov;
    const sx = from.width / to.width;
    const dx = from.left - to.left, dy = from.top - to.top;
    const lift = Math.min(150, Math.abs(dx) * 0.22 + 70);
    const dur = 760, easing = "cubic-bezier(.5,.02,.2,1)";
    const a = ov.animate([
      { transform: `translate(${dx}px, ${dy}px) scale(${sx})` },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - lift}px) scale(${((sx + 1) / 2) * 1.18}) rotate(-4deg)`, offset: 0.5 },
      { transform: "none" }
    ], { duration: dur, easing });
    g.animate([{ transform: tf(start) }, { transform: tf(start), offset: 0.3 }, { transform: tf(fin) }], { duration: dur, easing, fill: "forwards" });
    await a.finished.catch(() => {});
    return ov;
  }

  function bloom(tiles) {
    const b = html(`<div class="bloom"></div>`);
    tiles.box.appendChild(b);
    setTimeout(() => b.remove(), 950);
  }

  async function fallAway(ov) {
    if (!ov.isConnected) return;
    if (!App.reduceMotion()) {
      await ov.animate([
        { transform: "none", opacity: 1 },
        { transform: "translate(6px, -10px) rotate(-6deg)", opacity: 1, offset: 0.2 },
        { transform: "translate(26px, 110px) rotate(24deg)", opacity: 0 }
      ], { duration: 650, easing: "cubic-bezier(.55,0,.8,.3)", fill: "forwards" }).finished.catch(() => {});
    }
    ov.remove();
  }

  function stamp(ansEl, letter, cls) {
    ansEl.className = "ans-box";
    ansEl.textContent = letter || "";
    if (!letter) return;
    void ansEl.offsetWidth;
    ansEl.className = "ans-box is-filled" + (cls ? " " + cls : "");
  }

  function shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }

  /** Fill the explanation panel: [radical] + [rest] = [character] + why/sound. */
  function fillExplain(ctx, comp) {
    const q = ctx.q, ch = q.word[q.t];
    const d = Ink.data(ch);
    const keep = Ink.range(d.s.length).filter((i) => !q.miss.includes(i));
    ctx.explain.innerHTML = `
      <div class="eq" aria-hidden="true"><div class="eq-g"></div><span class="op">+</span><div class="eq-g"></div><span class="op">=</span><div class="eq-g is-full"></div></div>
      <div class="explain-text">
        <span class="han" style="font-size:1.35em">${ch}</span> <b class="py" style="color:var(--accent)">${q.py[q.t]}</b> · ${q.chEn}
        ${App.speakBtn(q.word)}
        <div>${q.why}</div>
        ${q.sound ? `<div class="snd">${icon.speaker}<span>Sound hint: ${q.sound}</span></div>` : ""}
        ${comp && !comp.isExtra ? `<div style="margin-top:6px"><a href="#/learn/${comp.id}" style="font-size:13.5px;color:var(--accent);font-weight:600">Study ${comp.name} →</a></div>` : ""}
      </div>`;
    const gs = ctx.explain.querySelectorAll(".eq-g");
    App.ink(gs[0], ch, { strokes: q.miss, fit: "center", highlight: q.miss });
    App.ink(gs[1], ch, { strokes: keep, fit: "center" });
    App.ink(gs[2], ch, { highlight: q.miss });
  }

  function hintFor(q, comp) {
    const ch = q.word[q.t];
    if (comp.id === "ten") return `${icon.bulb}<span>D (十) only belongs to the example 什么. It is never the answer to a real question.</span>`;
    const src = comp.from.ch === comp.glyph || comp.from.ch === comp.name ? `means “${comp.from.en}”` : `comes from <span class="han">${comp.from.ch}</span> “${comp.from.en}”`;
    return `${icon.bulb}<span>Not this one: <span class="han">${comp.name}</span> ${src}. Think about <span class="han">${q.word}</span> “${q.en}”. Which meaning does <b class="py">${q.py[q.t]}</b> need?</span>`;
  }

  /**
   * Pointer drag for an option tile. Calls onDrop(rowEl, ghostEl) or onClick().
   * Keyboard activation (Enter/Space) also calls onClick().
   */
  function enableDrag(btn, opts) {
    btn.addEventListener("click", (e) => { if (e.detail === 0) opts.onClick(); });
    btn.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || btn.disabled) return;
      const sx = e.clientX, sy = e.clientY;
      let dragging = false, ghost = null, over = null;
      try { btn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      const move = (ev) => {
        if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) {
          dragging = true;
          ghost = html(`<div class="opt-drag-ghost"></div>`);
          App.compInk(ghost, btn.comp, {});
          document.body.appendChild(ghost);
          btn.classList.add("is-dragging");
        }
        if (!dragging) return;
        ghost.style.left = ev.clientX + "px"; ghost.style.top = ev.clientY + "px";
        const at = document.elementFromPoint(ev.clientX, ev.clientY);
        const row = at && at.closest(opts.dropSelector || ".qrow:not(.is-example)");
        if (row !== over) { over && over.classList.remove("is-drop"); over = row; over && over.classList.add("is-drop"); }
      };
      const end = (ev, cancelled) => {
        btn.removeEventListener("pointermove", move);
        btn.removeEventListener("pointerup", up);
        btn.removeEventListener("pointercancel", cancel);
        btn.classList.remove("is-dragging");
        if (dragging) {
          over && over.classList.remove("is-drop");
          if (over && !cancelled) { opts.onDrop(over, ghost).finally(() => ghost.remove()); }
          else ghost.remove();
        } else if (!cancelled) opts.onClick();
      };
      const up = (ev) => end(ev, false);
      const cancel = (ev) => end(ev, true);
      btn.addEventListener("pointermove", move);
      btn.addEventListener("pointerup", up);
      btn.addEventListener("pointercancel", cancel);
    });
  }

  App.exam = { optionButton, wordTiles, questionRow, setHint, fillSlot, fly, bloom, fallAway, stamp, shake, fillExplain, hintFor, enableDrag, sleep };
})();
