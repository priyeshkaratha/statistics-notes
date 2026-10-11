import React, { useState } from 'react';
import { Card, Seg, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { chi2Cdf, chi2Critical } from '../lib/stats.js';

const PRESETS = {
  happy: { label: 'Happiness vs income (2x3)', t: [[245, 354, 243], [98, 220, 140]], rows: ['Happy', 'Unsatisfied'], cols: ['Low', 'Moderate', 'High'] },
  malaria: { label: 'Malaria (2x2)', t: [[93, 51], [68, 40]], rows: ['Heterozygous', 'Homozygous'], cols: ['Infected', 'Not infected'] },
  strong: { label: 'Strong link (2x2)', t: [[50, 10], [10, 50]], rows: ['Group 1', 'Group 2'], cols: ['Yes', 'No'] },
};

const css = `
.ct-wrap{overflow-x:auto}
.ct-table{border-collapse:separate;border-spacing:4px;margin:8px auto;font-size:14px}
.ct-table th{font-weight:600;font-size:12.5px;color:var(--ink2);padding:2px 6px}
.ct-cell{min-width:92px;height:62px;border-radius:10px;text-align:center;border:1px solid var(--line);transition:background .35s ease;position:relative;vertical-align:middle}
.ct-cell input{width:70px;text-align:center;font:600 16px var(--mono);padding:4px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--ink)}
.ct-cell b{font:600 16px var(--mono);color:var(--ink)}
.ct-cell small{display:block;font-size:10.5px;color:var(--muted);margin-top:1px}
.ct-tot{font:600 13px var(--mono);color:var(--ink2);text-align:center}
.ct-bar{height:6px;border-radius:3px;margin-top:4px;transition:width .4s ease}
`;

export default function ContingencyTable({ preset = 'happy' }) {
  const init = PRESETS[preset] || PRESETS.happy;
  const [t, setT] = useState(init.t.map((r) => [...r]));
  const [names, setNames] = useState({ rows: init.rows, cols: init.cols });
  const [view, setView] = useState('all');
  const [alpha, setAlpha] = useState(0.05);
  const r = t.length, c = t[0].length;

  const load = (k) => { const p = PRESETS[k]; setT(p.t.map((x) => [...x])); setNames({ rows: p.rows, cols: p.cols }); };
  const resize = (nr, nc) => {
    setT((old) => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => (old[i] && old[i][j] !== undefined ? old[i][j] : 20))));
    setNames((n) => ({ rows: Array.from({ length: nr }, (_, i) => n.rows[i] || `Row ${i + 1}`), cols: Array.from({ length: nc }, (_, j) => n.cols[j] || `Col ${j + 1}`) }));
  };
  const setCell = (i, j, v) => setT((old) => old.map((row, a) => row.map((x, b) => (a === i && b === j ? Math.max(0, Math.min(9999, Math.round(v) || 0)) : x))));

  const rowT = t.map((row) => row.reduce((s, x) => s + x, 0));
  const colT = t[0].map((_, j) => t.reduce((s, row) => s + row[j], 0));
  const N = rowT.reduce((s, x) => s + x, 0);
  const valid = N > 0 && rowT.every((x) => x > 0) && colT.every((x) => x > 0);
  const E = t.map((row, i) => row.map((_, j) => (valid ? rowT[i] * colT[j] / N : 0)));
  const C = t.map((row, i) => row.map((o, j) => (valid ? (o - E[i][j]) ** 2 / E[i][j] : 0)));
  const stat = C.flat().reduce((s, x) => s + x, 0);
  const df = (r - 1) * (c - 1);
  const p = valid ? 1 - chi2Cdf(stat, df) : NaN;
  const crit = chi2Critical(alpha, df);
  const reject = valid && stat > crit;
  const cmax = Math.max(1, ...C.flat());
  const small = valid && E.flat().some((e) => e < 5);

  const heat = (v) => `color-mix(in srgb, var(--c2) ${Math.round(Math.min(1, v / cmax) * 55)}%, var(--surface2))`;

  return (
    <Card title="Contingency table: observed, expected, contribution" foot="Each cell's heat is (O−E)²/E: the hottest cells are where the data disagree most with independence. χ² is the sum of the heat.">
      <style>{css}</style>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
        {Object.entries(PRESETS).map(([k, p0]) => <Btn key={k} kind="ghost" onClick={() => load(k)}>{p0.label}</Btn>)}
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', fontSize: 13, color: 'var(--ink2)' }}>
        <span>Rows <Seg options={[2, 3, 4]} value={r} onChange={(v) => resize(v, c)} label="rows" /></span>
        <span>Columns <Seg options={[2, 3, 4]} value={c} onChange={(v) => resize(r, v)} label="columns" /></span>
        <span>Show <Seg options={[{ value: 'all', label: 'O + E' }, { value: 'obs', label: 'Observed' }, { value: 'exp', label: 'Expected' }, { value: 'con', label: '(O−E)²/E' }]} value={view} onChange={setView} label="view" /></span>
        <span>α <Seg options={[{ value: 0.1, label: '0.10' }, { value: 0.05, label: '0.05' }, { value: 0.01, label: '0.01' }]} value={alpha} onChange={setAlpha} label="alpha" /></span>
      </div>
      <div className="ct-wrap">
        <table className="ct-table">
          <thead><tr><th />{t[0].map((_, j) => <th key={j}>{names.cols[j]}</th>)}<th>Total</th></tr></thead>
          <tbody>
            {t.map((row, i) => (
              <tr key={i}>
                <th style={{ textAlign: 'right' }}>{names.rows[i]}</th>
                {row.map((o, j) => (
                  <td key={j} className="ct-cell" style={{ background: heat(C[i][j]) }}>
                    {(view === 'all' || view === 'obs') && <input type="number" min="0" max="9999" aria-label={`Observed ${names.rows[i]} ${names.cols[j]}`} value={o} onChange={(e) => setCell(i, j, parseFloat(e.target.value))} />}
                    {view === 'exp' && <b>{f(E[i][j], 2)}</b>}
                    {view === 'con' && <b>{f(C[i][j], 3)}</b>}
                    {view === 'all' && <small>E = {f(E[i][j], 2)}</small>}
                    {view === 'obs' && <small>observed</small>}
                    {view === 'exp' && <small>(row × col) / N</small>}
                    {view === 'con' && <small>O {o} vs E {f(E[i][j], 1)}</small>}
                    <div className="ct-bar" style={{ width: `${valid ? Math.min(100, C[i][j] / cmax * 100) : 0}%`, background: 'var(--c2)' }} />
                  </td>
                ))}
                <td className="ct-tot">{rowT[i]}</td>
              </tr>
            ))}
            <tr><th style={{ textAlign: 'right' }}>Total</th>{colT.map((x, j) => <td key={j} className="ct-tot">{x}</td>)}<td className="ct-tot">{N}</td></tr>
          </tbody>
        </table>
      </div>
      {!valid && <p style={{ color: 'var(--c2)', fontSize: 13.5 }}>Every row and column needs at least one observation, otherwise expected counts are zero.</p>}
      {small && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Warning: some expected counts are below 5, so the chi-square approximation is unreliable.</p>}
      <Readouts>
        <Readout label="χ² statistic" value={valid ? f(stat, 4) : '—'} />
        <Readout label="df = (r−1)(c−1)" value={`${df}`} />
        <Readout label={`critical (α=${alpha})`} value={f(crit, 3)} />
        <Readout label="p-value" value={valid ? (p < 0.0001 ? '< 0.0001' : f(p, 4)) : '—'} tone={!valid ? '' : reject ? 'bad' : 'good'} />
        <Readout label="decision" value={!valid ? '—' : reject ? 'Reject H0: dependent' : 'Fail to reject: independent'} tone={!valid ? '' : reject ? 'bad' : 'good'} />
      </Readouts>
    </Card>
  );
}
