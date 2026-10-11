import React, { useState, useEffect } from 'react';
import { Card, Controls, Seg, Btn, Readouts, Readout, f } from '../kit/controls.jsx';

const hi = (c, p = 24) => `color-mix(in srgb, ${c} ${p}%, transparent)`;
const seed = (r, c, off) => Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => String(((i * 2 + j * 3 + off) % 5) + 1)));
const resize = (M, r, c, off) => Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => (M[i] && M[i][j] !== undefined ? M[i][j] : String(((i * 2 + j * 3 + off) % 5) + 1))));
const num = (s) => { const v = Number(s); return Number.isFinite(v) ? v : 0; };

function Dim({ label, value, onChange }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--ink2)' }}>
      {label}
      <select value={value} onChange={(e) => onChange(+e.target.value)} style={{ width: 'auto', padding: '4px 6px' }} aria-label={label}>
        {[1, 2, 3, 4].map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
    </label>
  );
}

function Grid({ M, edit, setCell, hiRow, hiCol, color, cur }) {
  return (
    <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${M[0].length}, 46px)`, gap: 4, padding: '6px 10px', borderLeft: '3px solid var(--ink)', borderRight: '3px solid var(--ink)', borderRadius: 6 }}>
      {M.map((row, i) => row.map((v, j) => {
        const on = (hiRow === i) || (hiCol === j);
        const style = { width: 46, height: 36, textAlign: 'center', border: '1px solid var(--line)', borderRadius: 6, background: on ? hi(color, 30) : 'var(--surface)', color: 'var(--ink)', font: '600 15px var(--mono)', boxShadow: cur && cur[0] === i && cur[1] === j ? `0 0 0 2px ${color}` : 'none', transition: 'background .25s' };
        return edit
          ? <input key={`${i}-${j}`} style={style} value={v} inputMode="decimal" aria-label={`row ${i + 1} column ${j + 1}`} onChange={(e) => setCell(i, j, e.target.value)} />
          : <div key={`${i}-${j}`} style={{ ...style, display: 'grid', placeItems: 'center' }}>{v}</div>;
      }))}
    </div>
  );
}

export default function MatrixMultiply() {
  const [dims, setDims] = useState({ ar: 2, ac: 3, br: 3, bc: 2 });
  const [A, setA] = useState(seed(2, 3, 0)), [B, setB] = useState(seed(3, 2, 1));
  const [order, setOrder] = useState('AB');
  const [step, setStep] = useState(0), [play, setPlay] = useState(false);
  const setDim = (k, v) => {
    const d = { ...dims, [k]: v }; setDims(d); setStep(0); setPlay(false);
    setA((M) => resize(M, d.ar, d.ac, 0)); setB((M) => resize(M, d.br, d.bc, 1));
  };
  const L = order === 'AB' ? A : B, R = order === 'AB' ? B : A;
  const m = L.length, n = L[0].length, p = R.length, q = R[0].length;
  const ok = n === p, total = ok ? m * q : 0;
  const Ln = L.map((r) => r.map(num)), Rn = R.map((r) => r.map(num));
  useEffect(() => {
    if (!play) return undefined;
    const id = setInterval(() => setStep((s) => { if (s >= total) { setPlay(false); return s; } return s + 1; }), 1100);
    return () => clearInterval(id);
  }, [play, total]);
  const cell = (i, j) => Ln[i].reduce((t, v, k) => t + v * Rn[k][j], 0);
  const last = step > 0 && step <= total ? step - 1 : -1;
  const ci = last >= 0 ? Math.floor(last / q) : -1, cj = last >= 0 ? last % q : -1;
  const show = (i, j) => (i * q + j) < step;
  const edit = (setter) => (i, j, v) => { setter((M) => M.map((r, a) => r.map((x, b) => (a === i && b === j ? v : x)))); };
  const terms = ok && last >= 0 ? Ln[ci].map((v, k) => `${f(v)}×${f(Rn[k][cj])}`).join(' + ') : '';
  const tot = last >= 0 ? f(cell(ci, cj)) : '';
  const lbl = () => ({ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 4 });
  const swapNote = order === 'BA' ? ' (you are computing BA)' : '';
  return (
    <Card title="Matrix multiplication, cell by cell" foot="**Row of the left × column of the right**: each output cell is a sum of products; inner dimensions must match, outer ones give the result's order.">
      <Controls>
        <Dim label="A rows" value={dims.ar} onChange={(v) => setDim('ar', v)} /><Dim label="A cols" value={dims.ac} onChange={(v) => setDim('ac', v)} />
        <Dim label="B rows" value={dims.br} onChange={(v) => setDim('br', v)} /><Dim label="B cols" value={dims.bc} onChange={(v) => setDim('bc', v)} />
        <Seg label="Product" options={[{ value: 'AB', label: 'AB' }, { value: 'BA', label: 'BA' }]} value={order} onChange={(v) => { setOrder(v); setStep(0); setPlay(false); }} />
      </Controls>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '10px 0' }}>
        <div><Grid M={L} edit setCell={edit(order === 'AB' ? setA : setB)} hiRow={ok ? ci : -1} color="var(--c1)" /><div style={lbl()}>{order === 'AB' ? 'A' : 'B'} ({m}×{n})</div></div>
        <b style={{ fontSize: 22 }}>×</b>
        <div><Grid M={R} edit setCell={edit(order === 'AB' ? setB : setA)} hiCol={ok ? cj : -1} color="var(--c3)" /><div style={lbl()}>{order === 'AB' ? 'B' : 'A'} ({p}×{q})</div></div>
        <b style={{ fontSize: 22 }}>=</b>
        {ok ? (
          <div><Grid M={Array.from({ length: m }, (_, i) => Array.from({ length: q }, (_, j) => (show(i, j) ? f(cell(i, j)) : '·')))} color="var(--c4)" cur={last >= 0 ? [ci, cj] : null} /><div style={lbl()}>{order} ({m}×{q})</div></div>
        ) : <div style={{ color: 'var(--c2)', fontWeight: 600, maxWidth: 170, fontSize: 14 }}>Undefined: inner dimensions {n} and {p} differ.</div>}
      </div>
      <Controls>
        <Btn kind="primary" disabled={!ok} onClick={() => { if (step >= total) setStep(0); setPlay((v) => !v); }}>{play ? 'Pause' : step >= total && total ? 'Replay' : 'Play'}</Btn>
        <Btn kind="ghost" disabled={!ok || step >= total} onClick={() => { setPlay(false); setStep((s) => s + 1); }}>Step</Btn>
        <Btn kind="ghost" disabled={!ok} onClick={() => { setPlay(false); setStep(total); }}>Show all</Btn>
        <Btn kind="ghost" onClick={() => { setPlay(false); setStep(0); }}>Reset</Btn>
      </Controls>
      <div style={{ minHeight: 44, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 10, fontFamily: 'var(--mono)', fontSize: 14, margin: '8px 0' }}>
        {last >= 0 ? <>Row {ci + 1} of {order === 'AB' ? 'A' : 'B'} · column {cj + 1} of {order === 'AB' ? 'B' : 'A'}{swapNote}: {terms} = <b>{tot}</b></> : ok ? 'Press Play or Step. Edit any entry of A or B first if you like.' : 'Change the dimensions so the inner numbers match.'}
      </div>
      <Readouts>
        <Readout label="Orders" value={`${m}×${n} · ${p}×${q}`} />
        <Readout label="Inner match?" value={ok ? `${n} = ${p} ✓` : `${n} ≠ ${p} ✗`} tone={ok ? 'good' : 'bad'} />
        <Readout label="Result order" value={ok ? `${m}×${q}` : 'undefined'} tone={ok ? '' : 'bad'} />
      </Readouts>
      <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>Switch AB ↔ BA: with 2×3 and 3×2 you get a 2×2 vs a 3×3 result, so AB ≠ BA. Even for two square matrices the entries usually differ.</p>
    </Card>
  );
}
