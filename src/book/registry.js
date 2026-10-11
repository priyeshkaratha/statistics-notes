import parts from '../content/parts.js';
import { plain } from '../kit/rich.jsx';

const mods = import.meta.glob('../content/chapters/*.js', { eager: true });
export const chapters = Object.values(mods).map((m) => m.default).filter(Boolean).sort((a, b) => a.order - b.order);
export const chapterById = Object.fromEntries(chapters.map((c) => [c.id, c]));
export { parts };

const widgetMods = import.meta.glob('../widgets/*.jsx', { eager: true });
export const widgets = Object.fromEntries(Object.entries(widgetMods).map(([p, m]) => [p.split('/').pop().replace('.jsx', ''), m.default]));

export const pageList = chapters.flatMap((c) => c.pages.map((p, i) => ({ chapter: c, page: p, index: i, path: `/ch/${c.id}/${i}` })).concat([{ chapter: c, page: { id: 'review', title: 'Review & practice' }, index: c.pages.length, path: `/ch/${c.id}/${c.pages.length}`, review: true }]));

export const allMcq = chapters.flatMap((c) => (c.mcq || []).map((q, i) => ({ ...q, id: `${c.id}:${i}`, chapter: c.id, from: 'book' })));
export const allProblems = chapters.flatMap((c) => (c.problems || []).map((p) => ({ ...p, chapter: c.id, uid: `${c.id}:${p.id}` })));
export const allFormulas = chapters.flatMap((c) => (c.formulas || []).map((f) => ({ ...f, chapter: c.id })));
export const allCorrections = chapters.flatMap((c) => (c.corrections || []).map((x) => ({ ...x, chapter: c.id })));

function blockText(b) {
  const bits = [b.text, b.title, b.q, b.ans, b.tex, b.code, ...(b.items || []).map((i) => (typeof i === 'string' ? i : [i.title, i.text, i.q].join(' '))), ...(b.steps || []).map((s) => (typeof s === 'string' ? s : [s.title, s.text].join(' '))), ...(b.rows || []).flat(), ...(b.head || [])];
  return bits.filter(Boolean).map(plain).join(' ');
}
export const searchIndex = chapters.flatMap((c) => c.pages.map((p, i) => ({
  path: `/ch/${c.id}/${i}`, chapter: c.title, title: p.title,
  text: [c.summary, p.title, ...p.blocks.map(blockText)].join(' ').toLowerCase(),
})));
