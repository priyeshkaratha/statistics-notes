import React, { useEffect, useMemo, useState } from 'react';
import { Card, Controls, Seg, Slider, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot, linePath } from '../kit/plot.jsx';

const FNS = {
  sq: { label: 'x²', f: (x) => x * x, d: (x) => 2 * x, xd: [-5, 5], yd: [0, 25], x0: 4, eta: 0.1, etaMax: 1.3, fmin: 0, quad: true },
  quad: { label: 'x²−4x+3', f: (x) => x * x - 4 * x + 3, d: (x) => 2 * x - 4, xd: [-3, 7], yd: [-2, 24], x0: 6, eta: 0.1, etaMax: 1.3, fmin: -1, quad: true },
  well: { label: 'double well', f: (x) => 0.25 * x ** 4 - x * x + 0.3 * x, d: (x) => x ** 3 - 2 * x + 0.3, xd: [-2.6, 2.6], yd: [-2, 4], x0: 2.2, eta: 0.1, etaMax: 0.8, fmin: -1.2, quad: false },
};
// numerical global minimum of the double-well (for the "excess loss" readout)
FNS.well.fmin = Math.min(...Array.from({ length: 2001 }, (_, i) => FNS.well.f(-2.6 + (5.2 * i) / 2000)));
const MAXK = 60;

export default function GradientDescentViz() {
  const [key, setKey] = useState('sq');
  const [x0, setX0] = useState(FNS.sq.x0);
  const [eta, setEta] = useState(FNS.sq.eta);
  const [k, setK] = useState(0);
  const [play, setPlay] = useState(false);
  const F = FNS[key];

  const path = useMemo(() => {
    const xs = [x0];
    for (let i = 0; i < MAXK; i++) { const x = xs[i]; const nx = x - eta * F.d(x); xs.push(Number.isFinite(nx) && Math.abs(nx) < 1e9 ? nx : Infinity); if (!Number.isFinite(nx) || Math.abs(nx) >= 1e9) break; }
    return xs;
  }, [key, x0, eta]); // eslint-disable-line react-hooks/exhaustive-deps
  const kk = Math.min(k, path.length - 1);
  const shown = path.slice(0, kk + 1);
  const xk = shown[kk];
  const diverged = !Number.isFinite(xk) || Math.abs(xk) > 1e6;
  const gk = diverged ? Infinity : F.d(xk), fk = diverged ? Infinity : F.f(xk);
  const excess = shown.map((x) => (Number.isFinite(x) ? F.f(x) - F.fmin : Infinity));
  const finished = diverged || Math.abs(gk) < 1e-3 || kk >= MAXK;

  useEffect(() => {
    if (!play) return undefined;
    if (finished) { setPlay(false); return undefined; }
    const id = setInterval(() => setK((v) => v + 1), 420);
    return () => clearInterval(id);
  }, [play, finished]);

  const reset = (nk, nx, ne) => { setPlay(false); setK(0); if (nx !== undefined) setX0(nx); if (ne !== undefined) setEta(ne); if (nk) setKey(nk); };
  const pick = (nk) => reset(nk, FNS[nk].x0, FNS[nk].eta);

  let status = 'start', tone = '';
  if (diverged || (kk >= 2 && excess[kk] > excess[kk - 1] + 1e-9 && excess[kk - 1] > excess[kk - 2] + 1e-9)) { status = 'DIVERGING'; tone = 'bad'; }
  else if (Math.abs(gk) < 1e-3) { status = 'converged'; tone = 'good'; }
  else if (kk >= 2 && (shown[kk] - shown[kk - 1]) * (shown[kk - 1] - shown[kk - 2]) < 0) { status = Math.abs(excess[kk] - excess[kk - 1]) < 1e-9 ? 'cycling forever' : 'oscillating'; tone = 'warn'; }
  else if (kk >= 1) { status = 'descending'; tone = 'good'; }
  const factor = 1 - 2 * eta;

  const curve = Array.from({ length: 241 }, (_, i) => { const x = F.xd[0] + ((F.xd[1] - F.xd[0]) * i) / 240; return [x, F.f(x)]; });
  const e0 = Math.max(excess[0], 1e-6);

  return (
    <Card title="Gradient descent: roll a ball downhill with step size η" foot="The update is $x\leftarrow x-\eta f'(x)$. On $f=x^2$ each step multiplies $x$ by $1-2\eta$: shrink if $|1-2\eta|<1$, zig-zag if it is negative, blow up if it is below $-1$.">
      <Controls>
        <div><div className="slider-label">Function</div><Seg options={Object.entries(FNS).map(([v, o]) => ({ value: v, label: o.label }))} value={key} onChange={pick} label="function" /></div>
        <Slider label="Start x₀" value={x0} onChange={(v) => reset(null, v)} min={F.xd[0] + 0.3} max={F.xd[1] - 0.3} step={0.1} fmt={(v) => f(v, 1)} />
        <Slider label="Learning rate η" value={eta} onChange={(v) => reset(null, undefined, v)} min={0.01} max={F.etaMax} step={0.01} fmt={(v) => f(v, 2)} />
      </Controls>
      <Plot h={270} xDomain={F.xd} yDomain={F.yd} xLabel="x" yLabel="f(x)" ariaLabel="Gradient descent iterates on a curve">
        {({ x, y, iw, ih }) => {
          const pts = shown.map((px) => (Number.isFinite(px) ? [x(Math.max(-1e4, Math.min(1e4, px))), y(F.f(Math.max(-1e4, Math.min(1e4, px))))] : null)).filter(Boolean);
          return (
            <g>
              <clipPath id="gdv-clip"><rect width={iw} height={ih} /></clipPath>
              <g clipPath="url(#gdv-clip)">
                <path d={linePath(curve.map(([a, b]) => [x(a), y(b)]))} fill="none" stroke="var(--ink)" strokeWidth="2" opacity="0.75" />
                {pts.length > 1 && <path d={linePath(pts)} fill="none" stroke="var(--c2)" strokeWidth="1.5" strokeDasharray="4 3" />}
                {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 7 : 4} fill={i === pts.length - 1 ? 'var(--c1)' : 'var(--c2)'} fillOpacity={i === pts.length - 1 ? 1 : 0.55} stroke="var(--surface)" strokeWidth="1.5" />)}
              </g>
              {diverged && <text x={iw / 2} y={ih / 2} textAnchor="middle" className="lbl" fill="var(--c2)">iterates have left the picture</text>}
            </g>
          );
        }}
      </Plot>
      <Plot h={130} m={{ t: 8, r: 16, b: 30, l: 44 }} xDomain={[0, Math.max(10, kk)]} yDomain={[0, e0 * 1.3]} xLabel="iteration k" yLabel="f(x)−f*" ariaLabel="Excess loss against iteration">
        {({ x, y, iw, ih }) => (
          <g>
            <clipPath id="gdv-clip2"><rect width={iw} height={ih} /></clipPath>
            <g clipPath="url(#gdv-clip2)">
              <path d={linePath(excess.map((e, i) => [x(i), y(Number.isFinite(e) ? Math.min(e, e0 * 50) : e0 * 50)]))} fill="none" stroke="var(--c3)" strokeWidth="2" />
              {excess.map((e, i) => <circle key={i} cx={x(i)} cy={y(Number.isFinite(e) ? Math.min(e, e0 * 50) : e0 * 50)} r="3" fill="var(--c3)" />)}
            </g>
          </g>
        )}
      </Plot>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0' }}>
        <Btn kind="primary" onClick={() => setPlay((p) => !p)} disabled={finished && !play}>{play ? 'Pause' : 'Play'}</Btn>
        <Btn onClick={() => { setPlay(false); setK((v) => Math.min(v + 1, MAXK)); }} disabled={finished}>Step</Btn>
        <Btn kind="ghost" onClick={() => reset()}>Reset</Btn>
        <Btn onClick={() => reset(null, undefined, 1.1)} disabled={!F.quad}>Try η = 1.1</Btn>
      </div>
      <Readouts>
        <Readout label="iteration k" value={kk} />
        <Readout label="x_k" value={diverged ? '∞' : f(xk, 4)} />
        <Readout label="f(x_k)" value={diverged ? '∞' : f(fk, 4)} />
        <Readout label="f′(x_k)" value={diverged ? '∞' : f(gk, 4)} />
        {F.quad && <Readout label="factor 1−2η" value={f(factor, 2)} tone={Math.abs(factor) < 1 ? 'good' : Math.abs(factor) === 1 ? 'warn' : 'bad'} />}
        <Readout label="status" value={status} tone={tone} />
      </Readouts>
      {key === 'well' && <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '6px 0 0' }}>Non-convex: starting at the right slides into the shallower valley (local minimum); start on the left of the hump to reach the deeper (global) one.</p>}
    </Card>
  );
}
