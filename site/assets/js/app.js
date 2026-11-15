/* ==========================================================================
   App core — router, store, speech, sound, overlays, shared builders
   ========================================================================== */
(function () {
  "use strict";

  const H = window.HSK;
  const App = (window.App = { views: {} });

  /* ---------------- utilities ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const html = (s) => { const t = document.createElement("template"); t.innerHTML = s.trim(); return t.content.firstElementChild; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  Object.assign(App, { $, $$, html, sleep, shuffle, reduceMotion, cssVar });

  /* ---------------- icons (stroke icons, 24px grid) ---------------- */
  const P = (d, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra || ""}>${d}</svg>`;
  App.icon = {
    play: P('<path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none"/>'),
    pause: P('<rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/>'),
    prev: P('<path d="M15 6l-6 6 6 6"/>'),
    next: P('<path d="M9 6l6 6-6 6"/>'),
    replay: P('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.5v4h4"/>'),
    speaker: P('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
    back: P('<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>'),
    arrow: P('<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>'),
    check: P('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    x: P('<path d="M6 6l12 12M18 6L6 18"/>'),
    bulb: P('<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>'),
    sun: P('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>'),
    moon: P('<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>'),
    soundOn: P('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a7.5 7.5 0 0 1 0 11"/>', 'class="on"') + P('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/>', 'class="off"'),
    numbers: P('<circle cx="12" cy="12" r="8.5"/><path d="M10.5 9l2-1.5V16"/>'),
    eye: P('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
    pen: P('<path d="M4 20l1-4.5L16 4.5a2.1 2.1 0 0 1 3 3L8 18.5z"/><path d="M14 6.5l3 3"/>'),
    flame: P('<path d="M12 21c4 0 6.5-2.6 6.5-6.2 0-3.9-3-6.2-4.3-9.8-.4 2.7-1.8 4.3-3.2 5-.3-1.6-1-2.9-2-3.8C8.3 9 5.5 11 5.5 14.8 5.5 18.4 8 21 12 21z" fill="currentColor" stroke="none"/>'),
    image: P('<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5L6 19.5"/>'),
    spark: P('<path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" fill="currentColor" stroke="none"/><path d="M19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z" fill="currentColor" stroke="none"/>'),
    target: P('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'),
    shuffle: P('<path d="M3 7h3.5c2 0 3.2 1 4.5 3l2 4c1.3 2 2.5 3 4.5 3H21"/><path d="M18 14l3 3-3 3"/><path d="M3 17h3.5c1.4 0 2.4-.5 3.3-1.4M14.2 8.4c.9-.9 1.9-1.4 3.3-1.4H21"/><path d="M18 4l3 3-3 3"/>'),
    reset: P('<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3 3.5V8h4.5"/>')
  };

  /* ---------------- components registry ---------------- */
  const COMPS = {};
  [...H.RADICALS, ...H.EXTRAS].forEach((c, i) => { COMPS[c.id] = c; c.isExtra = i >= H.RADICALS.length; });
  App.comp = (id) => COMPS[id];
  App.comps = COMPS;
  App.lookalikesOf = (id) => {
    const g = H.LOOKALIKES.filter((l) => l.ids.includes(id));
    return [...new Set(g.flatMap((l) => l.ids))].filter((x) => x !== id);
  };
  // Questions in the 15 exam sets whose answer is this component
  App.examRefs = (id) => {
    const out = [];
    for (const s of H.SETS) for (const q of s.qs) if (s.opts[q.ans] === id) out.push({ set: s.n, q });
    return out;
  };

  /* ---------------- store ---------------- */
  const KEY = "hsk2-radicals-v1";
  const blank = () => ({ v: 1, studied: {}, sets: {}, comp: {}, course: {}, settings: { theme: null, sound: true, speed: 1, atlas: "lessons", examMode: "learn" } });
  let state = blank();
  try { const raw = localStorage.getItem(KEY); if (raw) state = Object.assign(blank(), JSON.parse(raw)); state.settings = Object.assign(blank().settings, state.settings); } catch (e) { /* storage unavailable */ }
  // Keep several open tabs in sync (otherwise one tab would overwrite another's progress).
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY || !e.newValue) return;
    try { state = Object.assign(blank(), JSON.parse(e.newValue)); state.settings = Object.assign(blank().settings, state.settings); } catch (err) { /* ignore */ }
  });
  let saveT = 0;
  App.store = {
    get state() { return state; },
    save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }, 120); },
    setting(k, v) { if (v === undefined) return state.settings[k]; state.settings[k] = v; this.save(); return v; },
    studied(id) { if (!state.studied[id]) { state.studied[id] = Date.now(); this.save(); } },
    isStudied(id) { return !!state.studied[id]; },
    recordComp(id, ok) { const c = (state.comp[id] = state.comp[id] || { s: 0, c: 0 }); c.s++; if (ok) c.c++; this.save(); },
    recordSet(n, score, mode) {
      const s = (state.sets[n] = state.sets[n] || { best: 0, tries: 0 });
      s.tries++; s.last = score; s.best = Math.max(s.best, score); s.mode = mode; s.at = Date.now(); this.save();
    },
    reset() { state = blank(); this.save(); }
  };

  /* ---------------- theme ---------------- */
  function applyTheme() {
    const t = state.settings.theme;
    if (t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme");
  }
  App.isDark = () => {
    const t = state.settings.theme;
    return t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  applyTheme();

  /* ---------------- speech ---------------- */
  let voices = [];
  const loadVoices = () => { voices = (window.speechSynthesis && speechSynthesis.getVoices()) || []; };
  if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  App.speak = (text, btn) => {
    if (!window.speechSynthesis) { App.toast("Speech isn't available in this browser"); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN"; u.rate = 0.78;
    const v = voices.find((v) => /zh[-_]CN/i.test(v.lang)) || voices.find((v) => /^zh/i.test(v.lang));
    if (v) u.voice = v;
    if (btn) { btn.classList.add("is-speaking"); u.onend = u.onerror = () => btn.classList.remove("is-speaking"); }
    speechSynthesis.speak(u);
  };
  App.speakBtn = (text, label) => `<button class="speak" data-say="${text}" aria-label="Pronounce ${label || text}" title="Listen">${App.icon.speaker}</button>`;
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-say]");
    if (b) { e.preventDefault(); e.stopPropagation(); App.speak(b.dataset.say, b.classList.contains("speak") ? b : null); }
  });

  /* ---------------- sound effects (synthesised, no files) ---------------- */
  let actx = null;
  const audio = () => {
    if (!state.settings.sound) return null;
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); } catch (e) { return null; }
    return actx;
  };
  function tone(f, t, dur, type, gain) {
    const c = audio(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine"; o.frequency.value = f;
    const t0 = c.currentTime + (t || 0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.07, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function knock(t, gain) {
    const c = audio(); if (!c) return;
    const len = 0.06, buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    f.type = "bandpass"; f.frequency.value = 1400; f.Q.value = 2.5; g.gain.value = gain || 0.25;
    s.buffer = buf; s.connect(f).connect(g).connect(c.destination); s.start(c.currentTime + (t || 0));
  }
  App.sfx = {
    correct() { knock(0, 0.2); tone(784, 0.02, 0.22, "sine", 0.06); tone(1175, 0.09, 0.38, "sine", 0.05); },
    wrong() { tone(220, 0, 0.18, "triangle", 0.06); tone(165, 0.09, 0.3, "triangle", 0.055); },
    stamp() { knock(0, 0.35); tone(130, 0, 0.14, "sine", 0.09); },
    tick() { knock(0, 0.1); },
    win() { [523, 587, 659, 784, 880, 1047].forEach((f, i) => tone(f, i * 0.085, 0.5, "sine", 0.05)); knock(0, 0.15); }
  };

  /* ---------------- toast / lightbox ---------------- */
  App.toast = (msg) => {
    const root = $(".toast-root"); if (!root) return;
    const t = html(`<div class="toast">${msg}</div>`);
    root.appendChild(t); setTimeout(() => t.remove(), 2700);
  };
  App.lightbox = (src, caption) => {
    const lb = html(`<div class="lightbox" role="dialog" aria-modal="true" aria-label="${caption}">
      <button class="close" aria-label="Close">${App.icon.x}</button>
      <figure><img src="${src}" alt="${caption}"><figcaption>${caption}</figcaption></figure></div>`);
    const close = () => { lb.remove(); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.closest(".close")) close(); });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(lb);
    $(".close", lb).focus();
  };

  /* ---------------- ink burst celebration ---------------- */
  App.burst = (x, y, power) => {
    if (reduceMotion()) return;
    const cv = document.createElement("canvas");
    cv.className = "burst";
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    document.body.appendChild(cv);
    const ctx = cv.getContext("2d"); ctx.scale(dpr, dpr);
    const colors = [cssVar("--accent"), cssVar("--ink"), cssVar("--gold"), cssVar("--accent-2")];
    const n = Math.round(70 * (power || 1));
    const ps = Array.from({ length: n }, () => {
      const a = Math.random() * Math.PI * 2, sp = 3 + Math.random() * 10 * (power || 1);
      return { x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 4, r: 1.5 + Math.random() * 5.5, c: colors[(Math.random() * colors.length) | 0], life: 1, decay: 0.008 + Math.random() * 0.012, sq: Math.random() < 0.35 };
    });
    const splats = Array.from({ length: 5 }, (_, i) => ({ x: x + (Math.random() - 0.5) * 120, y: y + (Math.random() - 0.5) * 80, r: 0, R: 30 + Math.random() * 50, c: colors[i % 2], life: 1 }));
    const step = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      let alive = false;
      for (const s of splats) {
        if (s.life <= 0) continue; alive = true;
        s.r += (s.R - s.r) * 0.12; s.life -= 0.022;
        ctx.globalAlpha = Math.max(0, s.life) * 0.12; ctx.fillStyle = s.c;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      for (const p of ps) {
        if (p.life <= 0) continue; alive = true;
        p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.28; p.x += p.vx; p.y += p.vy; p.life -= p.decay;
        ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.c;
        if (p.sq) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.vx * 0.2); ctx.fillRect(-p.r, -p.r * 0.45, p.r * 2, p.r * 0.9); ctx.restore(); }
        else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
      }
      if (alive) requestAnimationFrame(step); else cv.remove();
    };
    requestAnimationFrame(step);
  };
  App.burstAt = (elOrRect, power) => {
    const r = elOrRect.getBoundingClientRect ? elOrRect.getBoundingClientRect() : elOrRect;
    App.burst(r.left + r.width / 2, r.top + r.height / 2, power);
  };

  /* ---------------- per-view scope (auto cleanup on navigation) ---------------- */
  let scope = { inks: [], timers: [], cleanups: [], keys: [] };
  App.ink = (host, ch, opts) => { const k = new Ink.InkChar(host, ch, opts); scope.inks.push(k); return k; };
  App.compInk = (host, comp, opts) => App.ink(host, comp.src[0], Object.assign({ strokes: comp.src[1], fit: "center", label: comp.name }, opts));
  App.later = (fn, ms) => { const t = setTimeout(fn, ms); scope.timers.push(t); return t; };
  App.onCleanup = (fn) => scope.cleanups.push(fn);
  App.onKey = (fn) => { scope.keys.push(fn); };
  App.alive = () => { const s = scope; return () => s === scope; };
  function clearScope() {
    scope.inks.forEach((k) => k.stop());
    scope.timers.forEach(clearTimeout);
    scope.cleanups.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    $$(".flight, .opt-drag-ghost").forEach((n) => n.remove());
    scope = { inks: [], timers: [], cleanups: [], keys: [] };
  }
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target && e.target.matches && e.target.matches("input, textarea, select")) return;
    if ($(".lightbox")) return;
    for (const fn of scope.keys) if (fn(e) === true) { e.preventDefault(); break; }
  });

  /* ---------------- reveal-on-scroll ---------------- */
  const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); en.target.dispatchEvent(new CustomEvent("reveal")); }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }) : null;
  App.reveal = (root) => {
    $$(".reveal", root).forEach((n) => { if (io) io.observe(n); else n.classList.add("is-in"); });
  };
  /** Run fn once when el scrolls into view. */
  App.whenVisible = (el, fn) => {
    if (!("IntersectionObserver" in window)) return fn();
    const ob = new IntersectionObserver((ents) => { if (ents.some((e) => e.isIntersecting)) { ob.disconnect(); fn(); } }, { threshold: 0.25 });
    ob.observe(el); App.onCleanup(() => ob.disconnect());
  };

  /* ---------------- shared builders ---------------- */
  // Position diagram (40×40)
  const ZONES = {
    left: '<rect class="zone" x="3" y="3" width="14" height="34" rx="2"/>',
    right: '<rect class="zone" x="23" y="3" width="14" height="34" rx="2"/>',
    top: '<rect class="zone" x="3" y="3" width="34" height="13" rx="2"/>',
    bottom: '<rect class="zone" x="3" y="26" width="34" height="11" rx="2"/>',
    frame: '<path class="zone" d="M3 3H37V37H30V10H10V37H3Z"/>',
    "wrap-tl": '<path class="zone" d="M3 3H37V11H11V37H3Z"/>',
    "wrap-bl": '<path class="zone" d="M3 3H11V29H37V37H3Z"/>'
  };
  App.posDiagram = (pos, cls) => `<svg class="pos-diagram ${cls || ""}" viewBox="0 0 40 40" aria-hidden="true">
    <rect class="frame" x="3" y="3" width="34" height="34" rx="3"/>
    <path class="cross" d="M20 3V37M3 20H37"/>${ZONES[pos] || ""}</svg>`;

  // Progress ring
  App.ring = (pct, label, cls) => {
    const C = 2 * Math.PI * 40;
    return `<div class="ring ${cls || ""}" data-pct="${pct}"><svg viewBox="0 0 100 100"><circle class="track" cx="50" cy="50" r="40"/>
      <circle class="bar" cx="50" cy="50" r="40" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}"/></svg><b><span class="ring-v">${label}</span></b></div>`;
  };
  App.animateRings = (root) => {
    $$(".ring", root).forEach((r) => {
      const C = 2 * Math.PI * 40, pct = +r.dataset.pct;
      App.whenVisible(r, () => requestAnimationFrame(() => { $(".bar", r).style.strokeDashoffset = (C * (1 - Math.max(0, Math.min(1, pct)))).toFixed(1); }));
    });
  };

  // Segmented control with sliding pill
  App.seg = (root, onChange) => {
    const pill = document.createElement("span"); pill.className = "seg-pill"; root.prepend(pill);
    const btns = $$("button", root);
    const place = () => { const b = btns.find((x) => x.getAttribute("aria-pressed") === "true") || btns[0]; pill.style.left = b.offsetLeft + "px"; pill.style.width = b.offsetWidth + "px"; };
    btns.forEach((b) => b.addEventListener("click", () => { btns.forEach((x) => x.setAttribute("aria-pressed", x === b)); place(); onChange && onChange(b.dataset.v); }));
    requestAnimationFrame(place); setTimeout(place, 300);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    return { place };
  };

  App.stats = () => {
    const studied = H.RADICALS.filter((r) => state.studied[r.id]).length;
    const setsDone = Object.keys(state.sets).length;
    const perfect = Object.values(state.sets).filter((s) => s.best === 3).length;
    let seen = 0, correct = 0;
    Object.values(state.comp).forEach((c) => { seen += c.s; correct += c.c; });
    const lessons = Object.keys(state.course || {}).length;
    return { studied, setsDone, perfect, seen, correct, acc: seen ? correct / seen : 0, lessons };
  };

  /* ---------------- router ---------------- */
  const ROUTES = [
    [/^\/?$/, "home"],
    [/^\/course\/?$/, "course"],
    [/^\/learn\/?$/, "learn"],
    [/^\/learn\/([\w-]+)\/?$/, "radical"],
    [/^\/compare\/?$/, "compare"],
    [/^\/practice\/?$/, "practice"],
    [/^\/practice\/(\d+)\/?$/, "set"],
    [/^\/challenge\/?$/, "challenge"]
  ];
  let first = true, currentKey = "";
  function route() {
    const path = decodeURIComponent(location.hash.replace(/^#/, "")) || "/";
    let name = "home", params = [];
    for (const [re, n] of ROUTES) { const m = path.match(re); if (m) { name = n; params = m.slice(1); break; } }
    const view = App.views[name];
    if (!view) return;
    const key = name + ":" + params.join("/");
    if (key === currentKey) return;
    currentKey = key;
    const swap = () => {
      clearScope();
      const main = $("#view");
      let node;
      try { node = view.render.apply(view, params); }
      catch (err) { console.error(err); node = html(`<div class="wrap page-head"><h1 class="title-lg">Something went wrong</h1><p class="lede">${err.message}</p></div>`); }
      main.replaceChildren(node);
      window.scrollTo(0, 0);
      $$(".nav a").forEach((a) => a.classList.toggle("is-active", a.dataset.nav === view.nav));
      document.title = (view.title ? (typeof view.title === "function" ? view.title.apply(view, params) : view.title) + " · " : "") + "偏旁 Radicals — HSK 2 Writing";
      App.reveal(main);
      App.animateRings(main);
      view.mounted && view.mounted.apply(view, params);
    };
    if (!first && document.startViewTransition && !reduceMotion()) document.startViewTransition(swap);
    else swap();
    first = false;
  }
  App.go = (hash) => { if (location.hash === hash) route(); else location.hash = hash; };
  App.refresh = () => { currentKey = ""; route(); };

  /* ---------------- chrome ---------------- */
  function initChrome() {
    const themeBtn = $("#theme-btn"), soundBtn = $("#sound-btn");
    const syncTheme = () => { themeBtn.innerHTML = App.isDark() ? App.icon.sun : App.icon.moon; themeBtn.setAttribute("aria-label", App.isDark() ? "Switch to light theme" : "Switch to dark theme"); };
    themeBtn.addEventListener("click", () => { state.settings.theme = App.isDark() ? "light" : "dark"; App.store.save(); applyTheme(); syncTheme(); });
    syncTheme();
    const syncSound = () => { soundBtn.setAttribute("aria-pressed", !!state.settings.sound); soundBtn.setAttribute("aria-label", state.settings.sound ? "Mute sound effects" : "Unmute sound effects"); };
    soundBtn.innerHTML = App.icon.soundOn;
    soundBtn.addEventListener("click", () => { state.settings.sound = !state.settings.sound; App.store.save(); syncSound(); if (state.settings.sound) App.sfx.tick(); });
    syncSound();
    const rp = $("#reset-progress");
    if (rp) {
      let armed = 0;
      rp.addEventListener("click", () => {
        if (!armed) { armed = setTimeout(() => { armed = 0; rp.textContent = "Reset progress"; }, 3000); rp.textContent = "Click again to erase all progress"; return; }
        clearTimeout(armed); armed = 0; rp.textContent = "Reset progress";
        App.store.reset(); App.toast("Progress reset"); App.refresh();
      });
    }
    const tb = $(".topbar");
    const onScroll = () => tb.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initChrome();
    window.addEventListener("hashchange", route);
    route();
  });
})();
