// Pure statistics helpers shared by widgets, calculators and tests. No dependencies.

/* ---------- descriptive ---------- */
export const sum = (a) => a.reduce((s, x) => s + x, 0);
export const mean = (a) => sum(a) / a.length;
export const sorted = (a) => [...a].sort((x, y) => x - y);

export function median(a) {
  const s = sorted(a), n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

export function modes(a) {
  const f = new Map();
  a.forEach((x) => f.set(x, (f.get(x) || 0) + 1));
  const max = Math.max(...f.values());
  if (max === 1) return [];
  return [...f.entries()].filter(([, c]) => c === max).map(([x]) => x).sort((x, y) => x - y);
}

export const sumSq = (a) => { const m = mean(a); return sum(a.map((x) => (x - m) ** 2)); };
export const popVariance = (a) => sumSq(a) / a.length;
export const sampleVariance = (a) => sumSq(a) / (a.length - 1);
export const popSD = (a) => Math.sqrt(popVariance(a));
export const sampleSD = (a) => Math.sqrt(sampleVariance(a));
export const range = (a) => Math.max(...a) - Math.min(...a);
export const cv = (a) => (sampleSD(a) / mean(a)) * 100;

/**
 * Quartile / percentile by method:
 *  'halves'  – median of lower/upper half, median excluded when n is odd (class practice-problem docx)
 *  'nplus1'  – position p(n+1) with linear interpolation (class handwritten notes; Excel QUARTILE.EXC, Minitab)
 *  'linear'  – position 1+p(n-1) with interpolation (NumPy default, Excel QUARTILE.INC)
 */
export function quantile(a, p, method = 'nplus1') {
  const s = sorted(a), n = s.length;
  if (method === 'halves') {
    if (p === 0.5) return median(s);
    const lower = s.slice(0, Math.floor(n / 2));
    const upper = s.slice(Math.ceil(n / 2));
    return p < 0.5 ? median(lower) : median(upper);
  }
  const pos = method === 'linear' ? 1 + p * (n - 1) : p * (n + 1);
  if (pos <= 1) return s[0];
  if (pos >= n) return s[n - 1];
  const lo = Math.floor(pos), frac = pos - lo;
  return s[lo - 1] + frac * (s[lo] - s[lo - 1]);
}

export function fiveNumber(a, method = 'halves') {
  const s = sorted(a);
  return { min: s[0], q1: quantile(s, 0.25, method), median: quantile(s, 0.5, method), q3: quantile(s, 0.75, method), max: s[s.length - 1] };
}

export function outlierFences(a, method = 'halves') {
  const f = fiveNumber(a, method), iqr = f.q3 - f.q1;
  const lower = f.q1 - 1.5 * iqr, upper = f.q3 + 1.5 * iqr;
  return { ...f, iqr, lower, upper, outliers: a.filter((x) => x < lower || x > upper) };
}

export const zScore = (x, mu, sigma) => (x - mu) / sigma;

export function skewness(a) { // population (moment) skewness
  const m = mean(a), n = a.length, s = popSD(a);
  return sum(a.map((x) => ((x - m) / s) ** 3)) / n;
}
export function kurtosis(a) { // population (non-excess) kurtosis
  const m = mean(a), n = a.length, s = popSD(a);
  return sum(a.map((x) => ((x - m) / s) ** 4)) / n;
}

export function covariance(x, y, sample = true) {
  const mx = mean(x), my = mean(y);
  return sum(x.map((v, i) => (v - mx) * (y[i] - my))) / (sample ? x.length - 1 : x.length);
}
export const correlation = (x, y) => covariance(x, y) / (sampleSD(x) * sampleSD(y));

export function regression(x, y) {
  const mx = mean(x), my = mean(y);
  const b1 = sum(x.map((v, i) => (v - mx) * (y[i] - my))) / sum(x.map((v) => (v - mx) ** 2));
  const b0 = my - b1 * mx;
  const ssRes = sum(x.map((v, i) => (y[i] - (b0 + b1 * v)) ** 2));
  const ssTot = sum(y.map((v) => (v - my) ** 2));
  return { b0, b1, ssRes, ssTot, r2: 1 - ssRes / ssTot };
}

/* ---------- special functions ---------- */
export function lgamma(x) { // Lanczos
  const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

export function erf(x) { // Abramowitz-Stegun 7.1.26 is too coarse; use series/continued fraction via gamma
  const ax = Math.abs(x);
  const r = ax === 0 ? 0 : gammaP(0.5, ax * ax);
  return x < 0 ? -r : r;
}

// regularized lower incomplete gamma P(a, x)
export function gammaP(a, x) {
  if (x <= 0) return 0;
  if (x < a + 1) {
    let ap = a, del = 1 / a, s = del;
    for (let n = 0; n < 500; n++) { ap += 1; del *= x / ap; s += del; if (Math.abs(del) < Math.abs(s) * 1e-15) break; }
    return s * Math.exp(-x + a * Math.log(x) - lgamma(a));
  }
  let b = x + 1 - a, c = 1 / 1e-300, d = 1 / b, h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a); b += 2;
    d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return 1 - Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
}

// regularized incomplete beta I_x(a, b)
export function betaI(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  const cf = (xx, aa, bb) => {
    let qab = aa + bb, qap = aa + 1, qam = aa - 1, c = 1, d = 1 - qab * xx / qap;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    d = 1 / d; let h = d;
    for (let m = 1; m <= 500; m++) {
      const m2 = 2 * m;
      let aaa = m * (bb - m) * xx / ((qam + m2) * (aa + m2));
      d = 1 + aaa * d; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = 1 + aaa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; h *= d * c;
      aaa = -(aa + m) * (qab + m) * xx / ((aa + m2) * (qap + m2));
      d = 1 + aaa * d; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = 1 + aaa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; const del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-15) break;
    }
    return h;
  };
  return x < (a + 1) / (a + b + 2) ? bt * cf(x, a, b) / a : 1 - bt * cf(1 - x, b, a) / b;
}

function invert(cdf, p, lo, hi) { // monotone increasing cdf
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (cdf(mid) < p) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/* ---------- normal ---------- */
export const normPdf = (x, mu = 0, sigma = 1) => Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
export const normCdf = (x, mu = 0, sigma = 1) => 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)));
export const normPpf = (p, mu = 0, sigma = 1) => mu + sigma * invert((z) => normCdf(z), p, -40, 40);

/* ---------- discrete ---------- */
export const logChoose = (n, k) => lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1);
export const choose = (n, k) => Math.round(Math.exp(logChoose(n, k)));
export function binomPmf(k, n, p) {
  if (k < 0 || k > n) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  return Math.exp(logChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
}
export const binomCdf = (k, n, p) => { let s = 0; for (let i = 0; i <= Math.min(k, n); i++) s += binomPmf(i, n, p); return Math.min(1, s); };
export const poisPmf = (k, lam) => (k < 0 ? 0 : Math.exp(-lam + k * Math.log(lam) - lgamma(k + 1)));
export const poisCdf = (k, lam) => { let s = 0; for (let i = 0; i <= k; i++) s += poisPmf(i, lam); return Math.min(1, s); };

/* ---------- chi-square, t, F ---------- */
export const chi2Pdf = (x, k) => (x <= 0 ? 0 : Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.log(2) - lgamma(k / 2)));
export const chi2Cdf = (x, k) => gammaP(k / 2, x / 2);
export const chi2Ppf = (p, k) => invert((x) => chi2Cdf(x, k), p, 0, 2000);
export const chi2Critical = (alpha, k) => chi2Ppf(1 - alpha, k);

export const tPdf = (x, v) => Math.exp(lgamma((v + 1) / 2) - lgamma(v / 2)) / Math.sqrt(v * Math.PI) * (1 + x * x / v) ** (-(v + 1) / 2);
export const tCdf = (x, v) => { const ib = betaI(v / (v + x * x), v / 2, 0.5); return x >= 0 ? 1 - 0.5 * ib : 0.5 * ib; };
export const tPpf = (p, v) => invert((x) => tCdf(x, v), p, -500, 500);
export const tCritical = (alpha, v, twoTailed = true) => tPpf(1 - (twoTailed ? alpha / 2 : alpha), v);

export const fPdf = (x, d1, d2) => (x <= 0 ? 0 : Math.exp(0.5 * (d1 * Math.log(d1 * x) + d2 * Math.log(d2) - (d1 + d2) * Math.log(d1 * x + d2)) - Math.log(x) - (lgamma(d1 / 2) + lgamma(d2 / 2) - lgamma((d1 + d2) / 2))));
export const fCdf = (x, d1, d2) => (x <= 0 ? 0 : betaI(d1 * x / (d1 * x + d2), d1 / 2, d2 / 2));
export const fPpf = (p, d1, d2) => invert((x) => fCdf(x, d1, d2), p, 0, 1e5);
export const fCritical = (alpha, d1, d2) => fPpf(1 - alpha, d1, d2);

/* ---------- inference helpers ---------- */
export const zCritical = (confidence) => normPpf(1 - (1 - confidence) / 2);

export function ciMeanZ(xbar, sigma, n, confidence = 0.95) {
  const me = zCritical(confidence) * sigma / Math.sqrt(n);
  return { lower: xbar - me, upper: xbar + me, me };
}
export function ciMeanT(xbar, s, n, confidence = 0.95) {
  const me = tCritical(1 - confidence, n - 1) * s / Math.sqrt(n);
  return { lower: xbar - me, upper: xbar + me, me };
}
export function ciProportion(x, n, confidence = 0.95) {
  const p = x / n, me = zCritical(confidence) * Math.sqrt(p * (1 - p) / n);
  return { p, lower: p - me, upper: p + me, me };
}

export function chiSquareGof(observed, expected) {
  const stat = sum(observed.map((o, i) => (o - expected[i]) ** 2 / expected[i]));
  const df = observed.length - 1;
  return { stat, df, p: 1 - chi2Cdf(stat, df) };
}

export function chiSquareIndependence(table) {
  const rows = table.map(sum), cols = table[0].map((_, j) => sum(table.map((r) => r[j]))), N = sum(rows);
  const expected = table.map((r, i) => r.map((_, j) => rows[i] * cols[j] / N));
  const stat = sum(table.map((r, i) => sum(r.map((o, j) => (o - expected[i][j]) ** 2 / expected[i][j]))));
  const df = (table.length - 1) * (table[0].length - 1);
  return { stat, df, expected, rows, cols, N, p: 1 - chi2Cdf(stat, df) };
}

export function oneWayAnova(groups) {
  const all = groups.flat(), N = all.length, k = groups.length, grand = mean(all);
  const ssb = sum(groups.map((g) => g.length * (mean(g) - grand) ** 2));
  const ssw = sum(groups.map((g) => sumSq(g)));
  const dfb = k - 1, dfw = N - k, msb = ssb / dfb, msw = ssw / dfw, F = msb / msw;
  return { grand, ssb, ssw, sst: ssb + ssw, dfb, dfw, msb, msw, F, p: 1 - fCdf(F, dfb, dfw), groupMeans: groups.map(mean) };
}

export function oneSampleT(data, mu0) {
  const n = data.length, xbar = mean(data), s = sampleSD(data), t = (xbar - mu0) / (s / Math.sqrt(n)), df = n - 1;
  return { n, xbar, s, t, df, pTwo: 2 * (1 - tCdf(Math.abs(t), df)) };
}

/* ---------- matrices ---------- */
export const matMul = (A, B) => A.map((r) => B[0].map((_, j) => sum(r.map((v, k) => v * B[k][j]))));
export const transpose = (A) => A[0].map((_, j) => A.map((r) => r[j]));
export const det2 = ([[a, b], [c, d]]) => a * d - b * c;
export function inverse2(M) {
  const d = det2(M);
  if (d === 0) return null;
  const [[a, b], [c, e]] = M;
  return [[e / d, -b / d], [-c / d, a / d]];
}

/* ---------- misc ---------- */
export function seededRandom(seed = 1) { // mulberry32
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function randNormal(rng = Math.random, mu = 0, sigma = 1) {
  const u = 1 - rng(), v = rng();
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
