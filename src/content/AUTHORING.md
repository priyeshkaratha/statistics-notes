# Authoring guide (for chapter writers)

Each chapter is ONE plain-JS ES module `src/content/chapters/NN-<id>.js` with `export default {...}`.
**No JSX, no imports in chapter files** (Node validates them with `npm run check`).
Run `node scripts/check-content.mjs <filename-fragment>` often; it parses every `$math$` with KaTeX and checks the schema.

## Inline markup (every string field)
`$x^2$` math (KaTeX; write `\\` for a LaTeX backslash inside JS strings, e.g. `'$\\bar{x}$'`, `'$\\sum (x_i-\\bar{x})^2$'`),
`**bold**`, `*italic*`, `` `code` ``, `\n` line break, `\\$` literal dollar sign (write `'\\\\$5'`; avoid money amounts when you can).
Do NOT put `*` multiplication inside plain text; use `$a \\times b$`.

## Chapter object
```js
export default {
  id: 'central-tendency',      // kebab-case, EXACTLY the id assigned to you
  order: 2, part: 'A',         // part letters: A Foundations, B Probability&Distributions, C Inference, D Groups&Categories, E Modelling&Matrices
  title: 'Mean, Median & Mode',
  short: 'One-line card text for the home page',
  summary: '2-3 sentence lede shown under the title on the first page. Say what the learner can do after the chapter.',
  minutes: 25,
  source: ['Class notes', 'Practice doc'],   // chips: 'Class notes','Definitions doc','Practice doc','Unit 2 Q&A','Probability doc','Extra'
  pages: [ { id: 'what-is-mean', title: 'The mean', blocks: [ ... ] }, ... ],   // 4-7 pages, one idea per page
  formulas: [ { name: 'Sample variance', tex: 's^2=\\frac{\\sum (x_i-\\bar{x})^2}{n-1}', note: 'optional' } ],
  cheat: [ 'exam-ready bullet, may include $math$', ... ],      // 6-10 bullets
  pitfalls: [ { wrong: 'Dividing by n for a sample', right: 'Divide by $n-1$', why: 'optional' } ],  // 3-6
  corrections: [ { where: 'Notes p.7', said: 'what the source says', fix: 'the correct statement/value', why: 'optional' } ],
  mcq: [ { q: '...', options: ['a','b','c','d'], answer: 2, why: 'explanation citing the working' } ],  // 10-14, exactly 4 options, answer = index 0..3, vary the position of the correct answer
  problems: [ { id: 'p1', source: 'Practice doc P3', difficulty: 'easy|medium|hard', marks: 4, q: '...', hint: 'optional', steps: ['step 1','step 2'], answer: 'final answer with units' } ],
  refs: [ { title: 'NIST ...', url: 'https://...', note: 'why useful' } ],
};
```
An automatic last page "Review & practice" shows cheat, formulas, pitfalls, mcq, problems, refs. Don't add it to `pages`.

## Blocks (inside `pages[i].blocks`)
- `{ t:'p', text }` paragraph    - `{ t:'h', text }` sub-heading    - `{ t:'list', items:[..], ordered?:true }`
- `{ t:'formula', title?, tex, note? }` display equation (tex has no `$`)
- `{ t:'def', term, text }` definition card
- `{ t:'callout', kind, title?, text }` kinds: `tip` `exam` `warn` `note` `fix` (correction to the notes) `notes` (from your handwritten notes) `mnemonic` `why`
- `{ t:'table', title?, head:[..], rows:[[..],..] }` cells are strings (inline markup ok)
- `{ t:'example', title?, q, steps:[..], ans }` click-to-reveal worked example (steps are strings)
- `{ t:'steps', title?, items:[{title, text}] }` highlighted process stepper
- `{ t:'compare', left:{title, items:[..]}, right:{title, items:[..]} }`
- `{ t:'widget', name:'MeanBalance', props:{...} }` animated/interactive widget, file `src/widgets/MeanBalance.jsx` (default export React component). Widget file names are PascalCase and unique across the book: prefix nothing, but check `ls src/widgets` before choosing a name.

## Content standards
- Cover EVERYTHING in the transcription files assigned to you, plus deeper explanation (intuition, why the formula works, exam tips) and associated problems. Do not just paraphrase; teach.
- Use the exact numbers/examples from the teacher's notes and Word docs as worked examples (so the student recognises them), but ALL numbers must be correct: recompute with `src/lib/stats.js` or Python/scipy. If the source is wrong, show the correct value, add a `callout kind:'fix'` at the relevant spot AND an entry in `corrections`.
- Every problem from the Word documents assigned to you must appear in `problems` with the source label (e.g. `'Practice doc P7'`, `'Unit 2 Binomial Q2'`) and a verified answer.
- Prefer ≥1 widget per chapter where animation helps (see widget guide); placing a widget right after the text that introduces the idea.
- Every page ends on something the student can remember (a callout `exam`/`mnemonic`, or a formula).
- Quartile convention: the practice docx uses median-of-halves (excluding the median when n is odd); the class notes use position p(n+1) with interpolation; NumPy default is linear. Always say which convention a number uses.
- Written problems and MCQs should mirror the exam style: short numeric calculation questions, definitions, interpretations, "state the conclusion in words".
- Refs: only real URLs you are confident exist at the root/known paths of NIST (itl.nist.gov/div898/handbook), OpenStax (openstax.org), Penn State (online.stat.psu.edu), Khan Academy, SciPy docs (docs.scipy.org), Wikipedia, Stat Trek, Statistics How To, Seeing Theory (seeing-theory.brown.edu). A separate agent verifies links; never invent deep paths.
