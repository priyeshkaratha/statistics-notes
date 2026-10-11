// Small-matrix linear algebra helpers (arrays of rows). No dependencies.
import { mean, transpose, matMul } from './stats.js';

export const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
export const norm = (v) => Math.sqrt(dot(v, v));
export const matVec = (A, v) => A.map((r) => dot(r, v));
export const trace = (A) => A.reduce((s, r, i) => s + r[i], 0);
export const rot = (deg) => { const t = (deg * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t); return [[c, -s], [s, c]]; };
export const proj = (deg) => { const t = (deg * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t); return [[c * c, s * c], [s * c, s * s]]; };
export const refl = (deg) => { const t = (2 * deg * Math.PI) / 180; return [[Math.cos(t), Math.sin(t)], [Math.sin(t), -Math.cos(t)]]; };

/** Eigen-decomposition of a real 2x2. Returns { values, vectors (unit, one per value), complex } sorted by value desc. */
export function eig2([[a, b], [c, d]]) {
  const tr = a + d, det = a * d - b * c, disc = tr * tr / 4 - det;
  if (disc < -1e-12) return { complex: true, values: [], vectors: [] };
  const sq = Math.sqrt(Math.max(disc, 0)), values = [tr / 2 + sq, tr / 2 - sq];
  const vec = (l) => {
    let v;
    if (Math.abs(b) > 1e-12) v = [b, l - a];
    else if (Math.abs(c) > 1e-12) v = [l - d, c];
    else v = Math.abs(l - a) < 1e-12 ? [1, 0] : [0, 1];
    const n = norm(v); return v.map((x) => x / n);
  };
  let vectors = values.map(vec);
  if (sq < 1e-12 && Math.abs(b) < 1e-12 && Math.abs(c) < 1e-12) vectors = [[1, 0], [0, 1]];
  return { complex: false, values, vectors };
}

/** Reduced row echelon form with partial pivoting tolerance. Returns { rref, rank, pivots }. */
export function rref(M, tol = 1e-10) {
  const A = M.map((r) => [...r]), m = A.length, n = A[0].length, pivots = [];
  let row = 0;
  for (let col = 0; col < n && row < m; col++) {
    let p = row;
    for (let i = row + 1; i < m; i++) if (Math.abs(A[i][col]) > Math.abs(A[p][col])) p = i;
    if (Math.abs(A[p][col]) < tol) continue;
    [A[row], A[p]] = [A[p], A[row]];
    const pv = A[row][col]; A[row] = A[row].map((x) => x / pv);
    for (let i = 0; i < m; i++) if (i !== row) { const f = A[i][col]; A[i] = A[i].map((x, j) => x - f * A[row][j]); }
    pivots.push(col); row++;
  }
  const clean = A.map((r) => r.map((x) => (Math.abs(x) < tol ? 0 : x)));
  return { rref: clean, rank: pivots.length, pivots };
}
export const rank = (M) => rref(M).rank;

/** PCA for n x 2 data with sample covariance (n-1). */
export function pca2(X) {
  const n = X.length, mx = mean(X.map((r) => r[0])), my = mean(X.map((r) => r[1]));
  const Xc = X.map(([x, y]) => [x - mx, y - my]);
  const C = matMul(transpose(Xc), Xc).map((r) => r.map((v) => v / (n - 1)));
  const { values, vectors } = eig2(C), tot = values[0] + values[1];
  return { means: [mx, my], Xc, C, values, vectors, ratio: values.map((v) => v / tot), scores: Xc.map((r) => vectors.map((v) => dot(r, v))) };
}
