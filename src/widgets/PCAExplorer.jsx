import React, { useState, useRef } from 'react';
import { Card, Controls, Btn, Seg, Slider, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot } from '../kit/plot.jsx';
import { pca2 } from '../lib/linalg.js';
import { seededRandom, randNormal } from '../lib/stats.js';

const W = 410, H = 400, M = { t: 12, r: 12, b: 34, l: 44 };
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const sdOf = (a) => { const m = a.reduce((s, v) => s + v, 0) / a.length; return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / Math.max(1, a.length - 1)); };

function cloud(rho, seed, n = 30) {
  const rng = seededRandom(seed), out = [];
  for (let i = 0; i < n; i++) {
    const z1 = randNormal(rng), z2 = randNormal(rng);
    out.push([clamp(5 + 1.5 * z1, 0.3, 9.7), clamp(5 + 1.5 * (rho * z1 + Math.sqrt(1 - rho * rho) * z2), 0.3, 9.7)]);
  }
  return out;
}
const PRE = {
  three: { label: 'Source: (2,1),(3,2),(4,3)', pts: () => [[2, 1], [3, 2], [4, 3]] },
  five: { label: 'Five-point (sklearn) set', pts: () => [[2.5, 2.4], [0.5, 0.7], [2.2, 2.9], [1.9, 2.2], [3.1, 3.0]] },
};

export default function PCAExplorer() {
  const [rho, setRho] = useState(0.8), [seed, setSeed] = useState(11);
  const [pts, setPts] = useState(() => cloud(0.8, 11));
  const [mode, setMode] = useState('centre'), [view, setView] = useState('centred'), [proj, setProj] = useState(false);
  const [k, setK] = useState(1), [drag, setDrag] = useState(-1);
  const frozen = useRef(null);

  const std = mode === 'std', n = pts.length;
  const Q = pts.map(([a, b]) => [a, b * k]);
  const sx = std ? sdOf(Q.map((p) => p[0])) || 1 : 1, sy = std ? sdOf(Q.map((p) => p[1])) || 1 : 1;
  const A = Q.map(([a, b]) => [a / sx, b / sy]);
  const P = n >= 3 ? pca2(A) : null;
  const centred = std || view === 'centred';
  const off = centred && P ? P.means : [0, 0];
  const D = A.map(([a, b]) => [a - off[0], b - off[1]]);
  const mDisp = P ? [P.means[0] - off[0], P.means[1] - off[1]] : [0, 0];
  let v1 = P ? P.vectors[0] : [1, 0], v2 = P ? P.vectors[1] : [0, 1];
  if (v1[0] < 0 || (Math.abs(v1[0]) < 1e-9 && v1[1] < 0)) v1 = v1.map((v) => -v);
  if (v2[1] < 0 || (Math.abs(v2[1]) < 1e-9 && v2[0] < 0)) v2 = v2.map((v) => -v);
  const lam = P ? P.values : [0, 0], tot = lam[0] + lam[1], ratio = tot > 1e-12 ? lam.map((l) => l / tot) : [NaN, NaN];
  const tips = P ? [[v1, lam[0]], [v2, lam[1]]].map(([v, l]) => [[mDisp[0] + 2 * Math.sqrt(l) * v[0], mDisp[1] + 2 * Math.sqrt(l) * v[1]], [mDisp[0] - 2 * Math.sqrt(l) * v[0], mDisp[1] - 2 * Math.sqrt(l) * v[1]]]) : [];

  const live = (() => {
    const all = [...D, ...tips.flat()];
    const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
    const lo = [Math.min(...xs), Math.min(...ys)], hi = [Math.max(...xs), Math.max(...ys)];
    const R = Math.max(hi[0] - lo[0], hi[1] - lo[1], 1e-6) / 2 * 1.12;
    return { c: [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2], R, off, sx, sy };
  })();
  const fr = drag >= 0 && frozen.current ? frozen.current : live;
  const xd = [fr.c[0] - fr.R, fr.c[0] + fr.R], yd = [fr.c[1] - fr.R, fr.c[1] + fr.R];

  const projPts = P ? D.map(([a, b]) => { const t = (a - mDisp[0]) * v1[0] + (b - mDisp[1]) * v1[1]; return [mDisp[0] + t * v1[0], mDisp[1] + t * v1[1]]; }) : [];
  const lost = P ? P.Xc.reduce((s, r) => { const t = r[0] * v1[0] + r[1] * v1[1]; return s + (r[0] - t * v1[0]) ** 2 + (r[1] - t * v1[1]) ** 2; }, 0) : NaN;
  const regen = (r, s) => { setPts(cloud(r, s)); };
  const startDrag = (i, e) => { e.stopPropagation(); frozen.current = live; setDrag(i); e.currentTarget.setPointerCapture(e.pointerId); };
  const sd1 = Math.sqrt(lam[0]), sd2 = Math.sqrt(lam[1]);

  return (
    <Card title="PCA explorer: principal axes, explained variance and projection" foot="PC1 is the long axis of the cloud: the eigenvector of the covariance matrix with the **largest eigenvalue**. Axis half-length is $2\sqrt{\lambda}$; the bars show $\lambda_i/\sum\lambda$.">
      <Controls>
        {Object.entries(PRE).map(([key, p]) => <Btn key={key} kind="ghost" onClick={() => setPts(p.pts())}>{p.label}</Btn>)}
        <Btn kind="ghost" onClick={() => { const s = seed + 1; setSeed(s); regen(rho, s); }}>New random cloud</Btn>
      </Controls>
      <Controls>
        <Slider label="Correlation of random cloud ρ" value={rho} onChange={(v) => { setRho(v); regen(v, seed); }} min={-0.99} max={0.99} step={0.01} fmt={(v) => f(v, 2)} />
        <Slider label="Rescale y units ×" value={k} onChange={setK} min={1} max={10} step={0.5} fmt={(v) => f(v, 1)} />
      </Controls>
      <Controls>
        <Seg label="Scaling" options={[{ value: 'centre', label: 'Centre only (covariance)' }, { value: 'std', label: 'Standardise (correlation)' }]} value={mode} onChange={setMode} />
        <Seg label="View" options={[{ value: 'raw', label: 'Raw view' }, { value: 'centred', label: 'Centred view' }]} value={std ? 'centred' : view} onChange={setView} />
        <Seg label="Projection" options={[{ value: false, label: 'No projection' }, { value: true, label: 'Project onto PC1' }]} value={proj} onChange={setProj} />
      </Controls>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ flex: '2 1 300px', maxWidth: 440 }}>
          <Plot w={W} h={H} m={M} xDomain={xd} yDomain={yd} xFmt={(v) => f(v, 2)} yFmt={(v) => f(v, 2)} ariaLabel="Scatter plot with principal component axes">
            {({ x, y, iw, ih }) => {
              const toData = (e) => {
                const svg = e.currentTarget.ownerSVGElement || e.currentTarget, rc = svg.getBoundingClientRect();
                const dx = x.invert(((e.clientX - rc.left) / rc.width) * W - M.l), dy = y.invert(((e.clientY - rc.top) / rc.height) * H - M.t);
                return [clamp((dx + fr.off[0]) * fr.sx, 0, 10), clamp(((dy + fr.off[1]) * fr.sy) / k, 0, 10)];
              };
              return (
                <g>
                  {xd[0] < 0 && xd[1] > 0 && <line x1={x(0)} x2={x(0)} y1={0} y2={ih} stroke="var(--muted)" strokeDasharray="3 4" />}
                  {yd[0] < 0 && yd[1] > 0 && <line x1={0} x2={iw} y1={y(0)} y2={y(0)} stroke="var(--muted)" strokeDasharray="3 4" />}
                  {proj && P && D.map((p, i) => <line key={`pl${i}`} x1={x(p[0])} y1={y(p[1])} x2={x(projPts[i][0])} y2={y(projPts[i][1])} stroke="var(--c4)" strokeWidth="1.5" strokeDasharray="3 2" />)}
                  {P && tips.map(([a, b], i) => (
                    <g key={`ax${i}`}>
                      <line x1={x(a[0])} y1={y(a[1])} x2={x(b[0])} y2={y(b[1])} stroke={i ? 'var(--c3)' : 'var(--c2)'} strokeWidth={i ? 3 : 4} strokeLinecap="round" />
                      <text x={x(a[0]) + 6} y={y(a[1]) - 6} className="lbl-sm" fill={i ? 'var(--c3)' : 'var(--c2)'}>{i ? 'PC2' : 'PC1'}</text>
                    </g>
                  ))}
                  {proj && P && projPts.map((p, i) => <circle key={`pp${i}`} cx={x(p[0])} cy={y(p[1])} r="3.5" fill="var(--c4)" />)}
                  {P && <circle cx={x(mDisp[0])} cy={y(mDisp[1])} r="5" fill="none" stroke="var(--ink)" strokeWidth="2" />}
                  {D.map(([px, py], i) => (
                    <circle key={i} cx={x(px)} cy={y(py)} r={drag === i ? 8 : 6} fill={i === drag ? 'var(--c4)' : 'var(--c1)'} stroke="var(--surface)" strokeWidth="1.5" style={{ cursor: 'grab', touchAction: 'none' }}
                      onPointerDown={(e) => startDrag(i, e)}
                      onPointerMove={(e) => { if (drag === i && e.currentTarget.hasPointerCapture(e.pointerId)) { const p = toData(e); setPts((q) => q.map((v, j) => (j === i ? p : v))); } }}
                      onPointerUp={() => { setDrag(-1); frozen.current = null; }} />
                  ))}
                </g>
              );
            }}
          </Plot>
          <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>Drag any point. Ring = mean. {std ? 'Showing z-scores (each feature has variance 1).' : view === 'centred' ? 'Showing centred data (X minus the means).' : 'Showing raw data; PCA still works on the centred version.'}</p>
        </div>
        <div style={{ flex: '1 1 200px', minWidth: 200 }}>
          <svg viewBox="0 0 220 170" className="plot" role="img" aria-label="Explained variance bars">
            <line x1="30" y1="130" x2="210" y2="130" className="axis" />
            {[0, 1].map((i) => {
              const r = Number.isFinite(ratio[i]) ? ratio[i] : 0, hh = r * 100, bx = 55 + i * 80;
              return (
                <g key={i}>
                  <rect x={bx} y={130 - hh} width="50" height={hh} fill={i ? 'var(--c3)' : 'var(--c2)'} opacity="0.85" rx="3" />
                  <text x={bx + 25} y={124 - hh} textAnchor="middle" className="lbl-sm">{Number.isFinite(ratio[i]) ? `${f(ratio[i] * 100, 1)}%` : '—'}</text>
                  <text x={bx + 25} y={148} textAnchor="middle" className="tick">{`PC${i + 1}`}</text>
                  <text x={bx + 25} y={163} textAnchor="middle" className="tick">{`λ=${f(lam[i], 3)}`}</text>
                </g>
              );
            })}
            <text x="30" y="14" className="lbl-sm">Explained variance ratio</text>
          </svg>
        </div>
      </div>
      <Readouts>
        <Readout label="Covariance C (n−1)" value={P ? `[${f(P.C[0][0], 3)}, ${f(P.C[0][1], 3)}; ${f(P.C[1][0], 3)}, ${f(P.C[1][1], 3)}]` : '—'} />
        <Readout label="λ₁ , λ₂" value={P ? `${f(lam[0], 4)} , ${f(lam[1], 4)}` : '—'} />
        <Readout label="PC1 (up to sign)" value={P ? `(${f(v1[0], 3)}, ${f(v1[1], 3)})` : '—'} />
        <Readout label="PC1 keeps" value={Number.isFinite(ratio[0]) ? `${f(ratio[0] * 100, 2)}%` : '—'} tone={ratio[0] > 0.9 ? 'good' : 'warn'} />
        <Readout label="Spread along PC1, PC2 (√λ)" value={P ? `${f(sd1, 3)} , ${f(sd2, 3)}` : '—'} />
        <Readout label="Reconstruction error (1 PC)" value={P ? `${f(lost, 4)} = (n−1)λ₂` : '—'} />
      </Readouts>
      <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>Experiments: (1) slide ρ to 0.99: PC1 grabs nearly 100%. (2) ρ near 0: λ₁ ≈ λ₂ and the PC axes become arbitrary. (3) Centre-only mode with y-units ×10: the huge-variance feature hijacks PC1; switch to Standardise and the answer returns to the correlation-based one.</p>
    </Card>
  );
}
