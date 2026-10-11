import React, { useState, useEffect, useMemo } from 'react';
import { Card, Controls, Seg, Btn, Readouts, Readout } from '../kit/controls.jsx';

/* ---------- exact fractions [num, den] ---------- */
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const fr = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return [n / g, d / g]; };
const add = (a, b) => fr(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const mul = (a, b) => fr(a[0] * b[0], a[1] * b[1]);
const neg = (a) => [-a[0], a[1]];
const inv = (a) => fr(a[1], a[0]);
const isZ = (a) => a[0] === 0;
const isOne = (a) => a[0] === 1 && a[1] === 1;
const show = (a) => (a[1] === 1 ? String(a[0]) : `${a[0]}/${a[1]}`);
const fac = (a) => (isOne(a) ? '' : a[1] === 1 && a[0] > 0 ? `${a[0]}·` : `(${show(a)})·`);
const parseFr = (s) => {
  const t = String(s).trim();
  if (!t) return [0, 1];
  if (t.includes('/')) { const [p, q] = t.split('/').map(Number); return Number.isFinite(p) && Number.isFinite(q) && q !== 0 ? fr(Math.round(p), Math.round(q)) : [0, 1]; }
  const v = Number(t);
  if (!Number.isFinite(v)) return [0, 1];
  const dec = (t.split('.')[1] || '').length, k = Math.min(dec, 4), s10 = 10 ** k;
  return fr(Math.round(v * s10), s10);
};

/* ---------- step-by-step Gauss / Gauss-Jordan ---------- */
function buildSteps(M0, mode, ncoef) {
  let A = M0.map((r) => r.map((x) => [...x]));
  const m = A.length, pivots = [], steps = [];
  const snap = (desc, hl = []) => steps.push({ desc, mat: A.map((r) => r.map((x) => [...x])), pivots: pivots.map((p) => [...p]), hl });
  snap('Start: the matrix you entered.');
  let r = 0;
  for (let c = 0; c < ncoef && r < m; c++) {
    let p = -1;
    for (let i = r; i < m; i++) if (!isZ(A[i][c])) { p = i; break; }
    if (p < 0) { snap(`Column ${c + 1}: nothing non-zero at or below row ${r + 1}, so no pivot here. Move right.`); continue; }
    if (p !== r) { [A[r], A[p]] = [A[p], A[r]]; snap(`R${r + 1} ↔ R${p + 1}: bring a non-zero entry into the pivot position.`, [r, p]); }
    if (mode === 'rref' && !isOne(A[r][c])) {
      const k = inv(A[r][c]); A[r] = A[r].map((x) => mul(x, k));
      snap(`R${r + 1} ← ${fac(k) || ''}R${r + 1}: make the pivot 1.`, [r]);
    }
    pivots.push([r, c]);
    for (let i = r + 1; i < m; i++) {
      if (isZ(A[i][c])) continue;
      const q = mul(A[i][c], inv(A[r][c])), s = q[0] < 0;
      const qa = s ? neg(q) : q;
      A[i] = A[i].map((x, j) => add(x, mul(neg(q), A[r][j])));
      snap(`R${i + 1} ← R${i + 1} ${s ? '+' : '−'} ${fac(qa)}R${r + 1}: zero out column ${c + 1} below the pivot.`, [i, r]);
    }
    r++;
  }
  if (mode === 'rref') {
    for (let k = pivots.length - 1; k >= 0; k--) {
      const [pr, pc] = pivots[k];
      for (let i = 0; i < pr; i++) {
        if (isZ(A[i][pc])) continue;
        const q = A[i][pc], s = q[0] < 0, qa = s ? neg(q) : q;
        A[i] = A[i].map((x, j) => add(x, mul(neg(q), A[pr][j])));
        snap(`R${i + 1} ← R${i + 1} ${s ? '+' : '−'} ${fac(qa)}R${pr + 1}: clear column ${pc + 1} above the pivot.`, [i, pr]);
      }
    }
  }
  snap(mode === 'rref' ? 'Done: reduced row echelon form (every pivot is 1 and alone in its column).' : 'Done: row echelon form (zeros below each pivot, pivots step to the right).');
  return { steps, pivots, rank: pivots.length };
}

const PRE = [
  { n: '3×3 full rank', r: 3, c: 3, aug: false, v: [[1, 2, 3], [2, 5, 3], [1, 0, 8]] },
  { n: '3×3 rank 2', r: 3, c: 3, aug: false, v: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] },
  { n: 'Source Ex. 4', r: 3, c: 3, aug: false, v: [[1, 2, 3], [2, 4, 6], [1, 1, 1]] },
  { n: 'System, unique', r: 3, c: 4, aug: true, v: [[1, 1, 1, 6], [2, 3, 1, 11], [1, 1, 2, 9]] },
  { n: 'System, infinite', r: 3, c: 4, aug: true, v: [[1, 2, 3, 6], [2, 4, 6, 12], [1, 1, 1, 3]] },
  { n: 'System, none', r: 3, c: 4, aug: true, v: [[1, 2, 3, 6], [2, 4, 6, 13], [1, 1, 1, 3]] },
];
const cellStyle = { width: 52, height: 34, textAlign: 'center', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--surface)', color: 'var(--ink)', font: '600 15px var(--mono)' };
const pad = (v, R, C) => Array.from({ length: R }, (_, i) => Array.from({ length: C }, (_, j) => (v[i] && v[i][j] !== undefined ? String(v[i][j]) : '0')));
const Dim = ({ label, value, onChange, lo, hi }) => (
  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--ink2)' }}>{label}
    <select value={value} onChange={(e) => onChange(+e.target.value)} style={{ width: 'auto', padding: '4px 6px' }} aria-label={label}>
      {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((v) => <option key={v} value={v}>{v}</option>)}
    </select>
  </label>
);

export default function RowReducer() {
  const [R, setR] = useState(3), [C, setC] = useState(3), [aug, setAug] = useState(false);
  const [cells, setCells] = useState(pad(PRE[0].v, 3, 3));
  const [mode, setMode] = useState('rref');
  const [k, setK] = useState(0), [play, setPlay] = useState(false);
  const ncoef = aug ? C - 1 : C;
  const result = useMemo(() => buildSteps(cells.map((r) => r.map(parseFr)), mode, ncoef), [cells, mode, ncoef]);
  const { steps } = result, last = steps.length - 1, st = steps[Math.min(k, last)];
  useEffect(() => {
    if (!play) return undefined;
    const id = setInterval(() => setK((s) => { if (s >= last) { setPlay(false); return s; } return s + 1; }), 1200);
    return () => clearInterval(id);
  }, [play, last]);
  const reset = () => { setK(0); setPlay(false); };
  const resize = (r, c) => { setR(r); setC(c); setCells((M) => pad(M, r, c)); reset(); };
  const preset = (p) => { setR(p.r); setC(p.c); setAug(p.aug); setCells(pad(p.v, p.r, p.c)); reset(); };
  const edit = (i, j, v) => { setCells((M) => M.map((row, a) => row.map((x, b) => (a === i && b === j ? v : x)))); reset(); };
  const fin = steps[last].mat;
  const piv = new Set(st.pivots.map(([a, b]) => `${a},${b}`));
  const rankA = result.rank;
  let sys = '';
  if (aug) {
    const bad = fin.some((row) => row.slice(0, ncoef).every(isZ) && !isZ(row[ncoef]));
    sys = bad ? 'No solution (inconsistent)' : rankA === ncoef ? 'Unique solution' : `Infinitely many (${ncoef - rankA} free)`;
  }
  const atEnd = k >= last;
  const cols = `repeat(${C}, 52px)`;
  return (
    <Card title="Row reduction, one elementary operation at a time" foot="Every step is a legal row operation, so the solutions never change. **Rank = number of pivots = non-zero rows** at the end.">
      <Controls>
        <Dim label="Rows" value={R} lo={2} hi={4} onChange={(v) => resize(v, C)} />
        <Dim label="Columns" value={C} lo={2} hi={5} onChange={(v) => resize(R, v)} />
        <Seg label="Augmented" options={[{ value: false, label: 'Plain matrix' }, { value: true, label: 'Last column = RHS' }]} value={aug} onChange={(v) => { setAug(v); reset(); }} />
        <Seg label="Target form" options={[{ value: 'ref', label: 'Echelon (REF)' }, { value: 'rref', label: 'Reduced (RREF)' }]} value={mode} onChange={(v) => { setMode(v); reset(); }} />
      </Controls>
      <Controls>{PRE.map((p) => <Btn key={p.n} kind="ghost" onClick={() => preset(p)}>{p.n}</Btn>)}</Controls>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, alignItems: 'flex-start', margin: '8px 0' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Your matrix (edit any entry; fractions like 1/2 allowed)</div>
          <div style={{ display: 'inline-grid', gridTemplateColumns: cols, gap: 4, padding: '6px 10px', borderLeft: '3px solid var(--c1)', borderRight: '3px solid var(--c1)', borderRadius: 6 }}>
            {cells.map((row, i) => row.map((v, j) => (
              <input key={`${i}-${j}`} style={{ ...cellStyle, ...(aug && j === C - 1 ? { borderLeft: '3px solid var(--c4)' } : {}) }} value={v} inputMode="decimal" aria-label={`row ${i + 1} column ${j + 1}`} onChange={(e) => edit(i, j, e.target.value)} />
            )))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Current state (step {Math.min(k, last)} of {last}). Green = pivot</div>
          <div style={{ display: 'inline-grid', gridTemplateColumns: cols, gap: 4, padding: '6px 10px', borderLeft: '3px solid var(--ink)', borderRight: '3px solid var(--ink)', borderRadius: 6 }}>
            {st.mat.map((row, i) => row.map((v, j) => {
              const isP = piv.has(`${i},${j}`), hot = st.hl.includes(i);
              return <div key={`${i}-${j}`} style={{ width: 52, height: 34, display: 'grid', placeItems: 'center', border: '1px solid var(--line)', borderRadius: 6, font: '600 14px var(--mono)', background: isP ? 'color-mix(in srgb, var(--c3) 38%, transparent)' : hot ? 'color-mix(in srgb, var(--c4) 24%, transparent)' : 'var(--surface)', color: 'var(--ink)', ...(aug && j === C - 1 ? { borderLeft: '3px solid var(--c4)' } : {}), transition: 'background .25s' }}>{show(v)}</div>;
            }))}
          </div>
        </div>
      </div>
      <div style={{ minHeight: 44, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 10, fontFamily: 'var(--mono)', fontSize: 14, margin: '8px 0' }} aria-live="polite">{st.desc}</div>
      <Controls>
        <Btn kind="primary" onClick={() => { if (atEnd) setK(0); setPlay((v) => !v); }}>{play ? 'Pause' : atEnd ? 'Replay' : 'Play'}</Btn>
        <Btn kind="ghost" disabled={k <= 0} onClick={() => { setPlay(false); setK((s) => Math.max(0, s - 1)); }}>Back</Btn>
        <Btn kind="ghost" disabled={atEnd} onClick={() => { setPlay(false); setK((s) => Math.min(last, s + 1)); }}>Next step</Btn>
        <Btn kind="ghost" onClick={() => { setPlay(false); setK(last); }}>Show result</Btn>
        <Btn kind="ghost" onClick={reset}>Reset</Btn>
      </Controls>
      <Readouts>
        <Readout label="Step" value={`${Math.min(k, last)} / ${last}`} />
        <Readout label="Pivots so far" value={st.pivots.length ? st.pivots.map(([a, b]) => `(${a + 1},${b + 1})`).join(' ') : 'none'} />
        <Readout label={aug ? 'Rank of coefficient part' : 'Rank'} value={atEnd ? rankA : `${st.pivots.length} so far`} tone={atEnd ? 'good' : ''} />
        {aug && atEnd && <Readout label="System" value={sys} tone={sys.startsWith('No') ? 'bad' : 'good'} />}
        {atEnd && !aug && <Readout label="Full rank?" value={rankA === Math.min(R, C) ? 'yes' : 'no (rank-deficient)'} tone={rankA === Math.min(R, C) ? 'good' : 'warn'} />}
      </Readouts>
    </Card>
  );
}
