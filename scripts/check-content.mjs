// Validates chapter content: schema, KaTeX parse of every math snippet, widget names, ids, MCQ shape, links.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import katex from 'katex';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chDir = path.join(root, 'src/content/chapters');
const wDir = path.join(root, 'src/widgets');
const widgets = new Set(fs.existsSync(wDir) ? fs.readdirSync(wDir).filter((f) => f.endsWith('.jsx')).map((f) => f.replace('.jsx', '')) : []);
const only = process.argv[2];
const errors = [], warns = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warns.push(`${where}: ${msg}`);

const BLOCKS = new Set(['p', 'h', 'list', 'formula', 'def', 'callout', 'table', 'example', 'steps', 'widget', 'compare', 'code']);
const CALLOUTS = new Set(['tip', 'exam', 'warn', 'note', 'fix', 'notes', 'mnemonic', 'why']);

function checkTex(where, tex, display) {
  try { katex.renderToString(tex, { throwOnError: true, displayMode: display, strict: 'ignore' }); } catch (e) { err(where, `KaTeX: ${e.message.slice(0, 120)}  in  ${tex.slice(0, 60)}`); }
}
function checkText(where, s) {
  if (s == null) return;
  if (typeof s !== 'string') { err(where, `expected string, got ${typeof s}`); return; }
  for (const m of s.matchAll(/\[\[([^\]|]+)\|([^\]]+)\]\]/g)) xrefs.push([where, m[2]]);
  const t = s.replace(/\\\$/g, '\u0000');
  const n = (t.match(/\$/g) || []).length;
  if (n % 2) err(where, `odd number of $ in: ${s.slice(0, 70)}`);
  for (const m of t.matchAll(/\$([^$]+)\$/g)) checkTex(where, m[1].replace(/\u0000/g, '$'), false);
  if ((t.match(/\*\*/g) || []).length % 2) warn(where, `unbalanced ** in: ${s.slice(0, 60)}`);
}
const xrefs = [];
const arr = (where, v, name) => { if (!Array.isArray(v)) { err(where, `${name} must be an array`); return []; } return v; };

function checkBlock(where, b) {
  if (!b || !BLOCKS.has(b.t)) return err(where, `unknown block type ${b?.t}`);
  switch (b.t) {
    case 'p': case 'h': checkText(where, b.text); if (!b.text) err(where, 'empty text'); break;
    case 'list': arr(where, b.items, 'items').forEach((x, i) => checkText(`${where}.items[${i}]`, x)); break;
    case 'formula': if (!b.tex) err(where, 'formula needs tex'); else checkTex(where, b.tex, true); checkText(where, b.note); checkText(where, b.title); break;
    case 'def': checkText(where, b.term); checkText(where, b.text); if (!b.term || !b.text) err(where, 'def needs term and text'); break;
    case 'callout': if (!CALLOUTS.has(b.kind)) err(where, `bad callout kind ${b.kind}`); checkText(where, b.text); checkText(where, b.title); if (!b.text) err(where, 'callout needs text'); break;
    case 'table': arr(where, b.rows, 'rows').forEach((r, i) => { if (b.head && r.length !== b.head.length) err(`${where}.rows[${i}]`, `row has ${r.length} cells, head has ${b.head.length}`); r.forEach((c) => checkText(where, String(c))); }); (b.head || []).forEach((h) => checkText(where, h)); break;
    case 'example': checkText(where, b.q); if (!b.q) err(where, 'example needs q'); if (!b.ans) err(where, 'example needs ans'); checkText(where, b.ans); arr(where, b.steps, 'steps').forEach((s, i) => checkText(`${where}.steps[${i}]`, typeof s === 'string' ? s : s.text)); if (!b.steps?.length) err(where, 'example needs steps'); break;
    case 'steps': arr(where, b.items, 'items').forEach((s, i) => { checkText(`${where}.items[${i}]`, s.title); checkText(`${where}.items[${i}]`, s.text); if (!s.title) err(where, 'step needs title'); }); break;
    case 'widget': if (!widgets.has(b.name)) err(where, `widget "${b.name}" has no file src/widgets/${b.name}.jsx`); break;
    case 'compare': for (const side of [b.left, b.right]) { if (!side) { err(where, 'compare needs left and right'); continue; } checkText(where, side.title); arr(where, side.items, 'items').forEach((x) => checkText(where, x)); } break;
    case 'code': if (!b.code || typeof b.code !== 'string') err(where, 'code block needs code string'); if (b.output != null && typeof b.output !== 'string') err(where, 'output must be string'); checkText(where, b.title); break;
    default: break;
  }
}

const files = fs.readdirSync(chDir).filter((f) => f.endsWith('.js') && (!only || f.includes(only))).sort();
const ids = new Set(), probIds = new Set();
const stats = { chapters: 0, pages: 0, blocks: 0, widgets: 0, mcq: 0, problems: 0, formulas: 0 };
for (const f of files) {
  const mod = await import(pathToFileURL(path.join(chDir, f)).href).catch((e) => { err(f, `import failed: ${e.message}`); return null; });
  const c = mod?.default; if (!c) continue;
  stats.chapters++;
  for (const k of ['id', 'order', 'part', 'title', 'short', 'summary']) if (c[k] == null || c[k] === '') err(f, `missing ${k}`);
  if (ids.has(c.id)) err(f, `duplicate id ${c.id}`); ids.add(c.id);
  if (!/^[a-z0-9-]+$/.test(c.id || '')) err(f, 'id must be kebab-case');
  if (!['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(c.part)) err(f, `bad part ${c.part}`);
  checkText(`${f}.summary`, c.summary); checkText(`${f}.short`, c.short);
  const pages = arr(f, c.pages, 'pages'); if (pages.length < 3) warn(f, `only ${pages.length} pages`);
  const pids = new Set();
  pages.forEach((p, pi) => {
    stats.pages++;
    const w = `${f} page ${pi + 1} "${p.title}"`;
    if (!p.id || pids.has(p.id)) err(w, 'page id missing/duplicate'); pids.add(p.id);
    if (!p.title) err(w, 'page needs title');
    arr(w, p.blocks, 'blocks').forEach((b, bi) => { stats.blocks++; if (b?.t === 'widget') stats.widgets++; checkBlock(`${w} block ${bi + 1} (${b?.t})`, b); });
  });
  arr(f, c.formulas || [], 'formulas').forEach((x, i) => { stats.formulas++; if (!x.name || !x.tex) err(`${f}.formulas[${i}]`, 'needs name and tex'); else checkTex(`${f}.formulas[${i}]`, x.tex, true); checkText(`${f}.formulas[${i}]`, x.note); });
  arr(f, c.cheat || [], 'cheat').forEach((x, i) => checkText(`${f}.cheat[${i}]`, x));
  if ((c.cheat || []).length < 5) warn(f, 'fewer than 5 cheat points');
  arr(f, c.pitfalls || [], 'pitfalls').forEach((x, i) => { checkText(`${f}.pitfalls[${i}]`, x.wrong); checkText(`${f}.pitfalls[${i}]`, x.right); checkText(`${f}.pitfalls[${i}]`, x.why); });
  arr(f, c.corrections || [], 'corrections').forEach((x, i) => { ['where', 'said', 'fix'].forEach((k) => { if (!x[k]) err(`${f}.corrections[${i}]`, `missing ${k}`); checkText(`${f}.corrections[${i}]`, x[k]); }); checkText(`${f}.corrections[${i}]`, x.why); });
  arr(f, c.mcq || [], 'mcq').forEach((q, i) => {
    stats.mcq++; const w = `${f}.mcq[${i + 1}]`;
    checkText(w, q.q); (q.options || []).forEach((o) => checkText(w, o)); checkText(w, q.why);
    if (!Array.isArray(q.options) || q.options.length !== 4) err(w, 'needs exactly 4 options');
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) err(w, 'answer must be 0..3');
    if (!q.why) err(w, 'needs why');
    if (new Set(q.options).size !== (q.options || []).length) err(w, 'duplicate options');
  });
  if ((c.mcq || []).length < 8) warn(f, `only ${(c.mcq || []).length} MCQs (target ≥ 10)`);
  arr(f, c.problems || [], 'problems').forEach((p, i) => {
    stats.problems++; const w = `${f}.problems[${p.id || i}]`;
    if (!p.id || probIds.has(`${c.id}:${p.id}`)) err(w, 'id missing/duplicate'); probIds.add(`${c.id}:${p.id}`);
    for (const k of ['source', 'q', 'answer']) if (!p[k]) err(w, `missing ${k}`);
    if (!Array.isArray(p.steps) || !p.steps.length) err(w, 'needs steps[]');
    checkText(w, p.q); checkText(w, p.answer); checkText(w, p.hint); (p.steps || []).forEach((s) => checkText(w, s));
  });
  arr(f, c.refs || [], 'refs').forEach((r, i) => { if (!/^https:\/\//.test(r.url || '')) err(`${f}.refs[${i}]`, `bad url ${r.url}`); if (!r.title) err(`${f}.refs[${i}]`, 'missing title'); });
  if ((c.refs || []).length < 2) warn(f, 'fewer than 2 refs');
}
if (!only) {
  const plan = (await import(pathToFileURL(path.join(root, 'src/content/plan.js')).href)).default;
  for (const d of plan) for (const it of d.items) { const m = it.link?.match(/^\/ch\/([^/]+)/); if (m && !ids.has(m[1])) err(`plan ${it.id}`, `links to unknown chapter ${m[1]}`); }
}
const pageCount = {};
for (const f of files) { const c = (await import(pathToFileURL(path.join(chDir, f)).href)).default; pageCount[c.id] = c.pages.length; }
if (!only) for (const [where, to] of xrefs) { const m = to.match(/^\/ch\/([^/]+)\/(\d+)$/); if (!m || !(m[1] in pageCount) || +m[2] > pageCount[m[1]]) err(where, `bad xref ${to}`); }
console.log(`Checked ${JSON.stringify(stats)}`);
warns.forEach((w) => console.log('WARN  ' + w));
errors.forEach((e) => console.log('ERROR ' + e));
console.log(errors.length ? `\n${errors.length} error(s)` : '\nOK: no errors');
process.exit(errors.length ? 1 : 0);
