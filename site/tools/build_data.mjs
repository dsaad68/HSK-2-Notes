#!/usr/bin/env node
/**
 * Builds site/assets/js/data/hanzi-data.js from Make Me a Hanzi
 * (https://github.com/skishore/makemeahanzi — graphics.txt + dictionary.txt).
 *
 * Usage:  node site/tools/build_data.mjs /path/to/makemeahanzi
 *
 * It also verifies that every stroke-index list in content.js lines up with
 * Make Me a Hanzi's component decomposition, so the highlighted / missing
 * parts of each character are exactly the radical.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, "..");
const mmah = process.argv[2];
if (!mmah) { console.error("usage: build_data.mjs <makemeahanzi dir>"); process.exit(1); }

// ---- load content.js in a sandbox -----------------------------------------
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(site, "assets/js/data/content.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(site, "assets/js/data/course.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(site, "assets/js/data/expressions.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(site, "assets/js/data/sections.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(site, "assets/js/data/vocab.js"), "utf8"), ctx);
const H = ctx.window.HSK;
const C = ctx.window.HSK_COURSE;
const E = ctx.window.HSK_EXPR;
const SECTIONS = ctx.window.HSK_SECTIONS;
const VOCAB = ctx.window.HSK_VOCAB;

// ---- collect every character we draw with strokes ---------------------------
const need = new Set();
const add = (s) => { for (const c of s || "") if (/\p{Script=Han}|[⺀-⿟]/u.test(c)) need.add(c); };
for (const r of [...H.RADICALS, ...H.EXTRAS]) {
  add(r.src[0]); add(r.from.ch); add(r.glyph);
  for (const e of r.examples) { add(e.ch); add(e.word); }
}
for (const s of H.SETS) for (const q of s.qs) add(q.word);
add(H.EXAMPLE_Q.word);
for (const s of H.SHOWCASE) add(s.ch);
for (const l of H.LOOKALIKES) l.ex.forEach(add);
// course
C.PICTOGRAPHS.forEach((p) => add(p.ch));
C.POINTERS.forEach((p) => { add(p.ch); add(p.base); });
C.PUZZLES.forEach((p) => { add(p.ch); p.parts.forEach((x) => add(x.t)); });
add("森");
C.FAMILIES.forEach((fam) => { add(fam.sound); fam.members.forEach((m) => add(m.ch)); });
C.SHAPES.forEach((s) => add(s.full));
C.TRAPS.forEach((t) => add(t.ch));
["妈", "马"].forEach(add);
// expressions: every new word is written stroke by stroke; landing page section glyphs
E.LESSONS.forEach((L) => L.items.forEach((e) => { add(e.w); e.from.forEach((s) => add(s.w)); }));
SECTIONS.forEach((s) => add(s.glyph));
// vocabulary graphs: every hub character is drawn with the brush
VOCAB.hubs.forEach((h) => add(h.h));

// ---- stream the big source files -------------------------------------------
async function scan(file, fn) {
  const rl = readline.createInterface({ input: fs.createReadStream(path.join(mmah, file)) });
  for await (const line of rl) { if (line.trim()) fn(JSON.parse(line)); }
}
const G = {}, D = {};
await scan("graphics.txt", (o) => { if (need.has(o.character)) G[o.character] = o; });
await scan("dictionary.txt", (o) => { if (need.has(o.character)) D[o.character] = o; });

const missing = [...need].filter((c) => !G[c]);
console.log(`characters: ${need.size}, with strokes: ${Object.keys(G).length}`);
if (missing.length) console.log("no stroke data (font fallback):", missing.join(" "));

// ---- verify stroke-index lists against component matches -------------------
let problems = 0;
function verify(label, ch, idx) {
  const g = G[ch], d = D[ch];
  if (!g) { console.warn(`✗ ${label}: no data for ${ch}`); problems++; return; }
  const n = g.strokes.length;
  if (idx.some((i) => i < 0 || i >= n)) { console.warn(`✗ ${label}: ${ch} has ${n} strokes, idx ${idx}`); problems++; return; }
  if (!d || !d.matches) return;
  const top = d.matches.map((m) => (m && m.length ? m[0] : null));
  const inside = new Set(idx.map((i) => top[i]));
  const outside = new Set(top.filter((_, i) => !idx.includes(i)));
  const ok = inside.size === 1 && !inside.has(null) && ![...inside].some((v) => outside.has(v));
  if (!ok) {
    const fuzzy = inside.size === 1 && ![...inside].some((v) => v !== null && outside.has(v));
    console.warn(`${fuzzy ? "~" : "✗"} ${label}: ${ch} ${d.decomposition} idx=[${idx}] top=[${top.map((t) => (t === null ? "·" : t)).join("")}]`);
    if (!fuzzy) problems++;
  }
}
for (const r of [...H.RADICALS, ...H.EXTRAS]) {
  verify(`${r.id}.src`, r.src[0], r.src[1]);
  for (const e of r.examples) verify(`${r.id}.example`, e.ch, e.idx);
}
for (const s of H.SETS) for (const q of s.qs) verify(`set${s.n}.q${q.no}`, q.word[q.t], q.miss);
verify("example", H.EXAMPLE_Q.word[H.EXAMPLE_Q.t], H.EXAMPLE_Q.miss);
for (const s of H.SHOWCASE) verify(`showcase.${s.ch}`, s.ch, s.rad);

// Check exam answers resolve to the option whose component matches `miss` length.
const comps = Object.fromEntries([...H.RADICALS, ...H.EXTRAS].map((r) => [r.id, r]));
for (const s of H.SETS) {
  const letters = s.qs.map((q) => q.ans).sort().join("");
  if (letters !== "ABC") { console.warn(`✗ set${s.n}: answers ${letters} are not a permutation of ABC`); problems++; }
  for (const q of s.qs) {
    const comp = comps[s.opts[q.ans]];
    if (!comp) { console.warn(`✗ set${s.n}.q${q.no}: unknown component ${s.opts[q.ans]}`); problems++; continue; }
    if (comp.src[1].length !== q.miss.length) {
      console.warn(`✗ set${s.n}.q${q.no}: ${comp.glyph} has ${comp.src[1].length} strokes but miss has ${q.miss.length}`); problems++;
    }
  }
}
console.log(problems ? `${problems} problem(s)` : "all stroke mappings verified ✓");

// ---- emit compact data -------------------------------------------------------
// g: top-level component of each stroke ("0011" = first two strokes belong to
// component 0, the rest to component 1; "-" = unassigned).
const out = {};
for (const c of Object.keys(G).sort()) {
  out[c] = { s: G[c].strokes, m: G[c].medians };
  const m = D[c] && D[c].matches;
  if (m && m.some((x) => x && x.length)) out[c].g = m.map((x) => (x && x.length ? String(x[0]) : "-")).join("");
}
const banner = `/* Stroke outlines & medians from Make Me a Hanzi (Arphic Public License).\n   Generated by site/tools/build_data.mjs — do not edit by hand. */\n`;
const file = path.join(site, "assets/js/data/hanzi-data.js");
fs.writeFileSync(file, `${banner}window.HANZI_DATA=${JSON.stringify(out)};\n`);
console.log(`wrote ${path.relative(process.cwd(), file)} (${(fs.statSync(file).size / 1024).toFixed(0)} KB)`);
process.exit(problems ? 2 : 0);
