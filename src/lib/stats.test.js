import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from './stats.js';

const close = (a, b, tol = 1e-4, msg = '') => assert.ok(Math.abs(a - b) <= tol, `${msg} expected ${b}, got ${a}`);

test('descriptive: class sample dataset', () => {
  const d = [4, 5, 12, 15, 6, 8, 7, 8, 10, 9];
  close(S.mean(d), 8.4); close(S.median(d), 8); assert.deepEqual(S.modes(d), [8]);
  close(S.quantile(d, 0.25, 'nplus1'), 5.75); close(S.quantile(d, 0.75, 'nplus1'), 10.5);
  close(S.sampleVariance(d), 10.9333, 1e-3);
});

test('descriptive: practice docx problems', () => {
  assert.deepEqual(Object.values(S.fiveNumber([12, 15, 18, 21, 24, 27, 30, 33, 36], 'halves')), [12, 16.5, 24, 31.5, 36]);
  assert.deepEqual(Object.values(S.fiveNumber([5, 7, 8, 10, 12, 13, 15, 18, 20, 24, 30], 'halves')), [5, 8, 13, 20, 30]);
  close(S.popVariance([2, 4, 4, 4, 5, 5, 7, 9]), 4);
  close(S.sampleVariance([10, 12, 14, 16, 18]), 10);
  close(S.popSD([10, 12, 14, 16, 18]), 2.8284, 1e-3);
  close(S.sampleSD([5, 7, 9, 11]), 2.582, 1e-3);
  assert.deepEqual(S.outlierFences([10, 11, 12, 12, 13, 14, 15, 16, 40], 'halves').outliers, [40]);
  assert.deepEqual(S.outlierFences([22, 23, 25, 26, 27, 28, 30, 31, 32, 33, 50], 'halves').outliers, [50]);
});

test('normal', () => {
  close(S.normCdf(1), 0.841345); close(S.normCdf(1.96), 0.975002, 1e-5);
  close(S.normPpf(0.975), 1.959964, 1e-5); close(S.normPpf(0.95), 1.644854, 1e-5);
  close(S.normCdf(2) - S.normCdf(-1), 0.818595);
});

test('binomial & poisson (Unit 2 docx)', () => {
  close(S.binomPmf(3, 20, 0.12), 0.22421); close(1 - S.binomCdf(4, 6, 0.8), 0.65536);
  close(S.binomPmf(10, 12, 0.85), 0.292358); close(S.binomPmf(8, 8, 0.95), 0.66342);
  close(S.poisPmf(3, 5), 0.140374); close(S.poisPmf(12, 15), 0.082859); close(S.poisPmf(0, 2), 0.135335);
  close(S.poisPmf(6, 8), 0.122138); close(S.poisCdf(1, 1.8), 0.462837); close(S.poisPmf(7, 5), 0.104445);
  close(S.poisPmf(0, 0.6), 0.548812); close(1 - S.poisCdf(4, 3), 0.184737);
});

test('chi-square / t / F critical values', () => {
  close(S.chi2Critical(0.05, 1), 3.8415, 1e-3); close(S.chi2Critical(0.05, 2), 5.9915, 1e-3);
  close(S.chi2Critical(0.05, 3), 7.8147, 1e-3); close(S.chi2Critical(0.05, 4), 9.4877, 1e-3);
  close(S.tCritical(0.05, 24), 2.0639, 1e-3); close(S.tCritical(0.05, 10), 2.2281, 1e-3);
  close(S.fCritical(0.05, 2, 6), 5.1433, 1e-3); close(S.fCritical(0.05, 6, 2), 19.3295, 1e-2);
});

test('chi-square tests (class notes examples)', () => {
  const happy = S.chiSquareIndependence([[245, 354, 243], [98, 220, 140]]);
  close(happy.stat, 9.3720, 1e-3); assert.equal(happy.df, 2);
  const malaria = S.chiSquareIndependence([[93, 51], [68, 40]]);
  close(malaria.stat, 0.0702, 1e-3);
  const gof = S.chiSquareGof([25, 50, 90, 15], [9, 68.4, 99, 3.6]);
  close(gof.stat, 70.31, 1e-2); assert.equal(gof.df, 3);
});

test('anova (class notes example, exact arithmetic)', () => {
  const r = S.oneWayAnova([[5, 7, 6], [8, 9, 6], [6, 5, 4]]);
  close(r.ssb, 10.889, 1e-3); close(r.ssw, 8.6667, 1e-3); close(r.F, 3.769, 1e-3); assert.equal(r.dfb, 2); assert.equal(r.dfw, 6);
});

test('confidence intervals (quiz bank)', () => {
  const ci = S.ciMeanZ(40, 8, 64); close(ci.lower, 38.0405, 1e-3); close(ci.upper, 41.9595, 1e-3);
  close(Math.sqrt(0.6 * 0.4 / 200), 0.03464, 1e-4);
});

test('regression & correlation', () => {
  const x = [1, 2, 3, 4, 5], y = [2, 4, 5, 4, 5];
  const r = S.regression(x, y); close(r.b1, 0.6); close(r.b0, 2.2); close(r.r2, 0.6);
  close(S.correlation(x, y), Math.sqrt(0.6), 1e-6);
});

test('matrices', () => {
  assert.deepEqual(S.matMul([[1, 2], [3, 4]], [[2, 1], [0, 3]]), [[2, 7], [6, 15]]);
  assert.equal(S.det2([[2, 3], [1, 4]]), 5);
});

import * as L from './linalg.js';
test('linalg: eigen, rank, pca (Linear Algebra & PCA notes)', () => {
  const e = L.eig2([[4, 1], [2, 3]]); close(e.values[0], 5); close(e.values[1], 2);
  close(e.vectors[0][0] / e.vectors[0][1], 1); close(e.vectors[1][0] / e.vectors[1][1], -0.5);
  const s = L.eig2([[2, 1], [1, 2]]); close(s.values[0], 3); close(s.values[1], 1);
  const dg = L.eig2([[4, 0], [0, -2]]); close(dg.values[0], 4); close(dg.values[1], -2);
  assert.equal(L.rank([[1, 2, 3], [2, 4, 6], [1, 1, 1]]), 2);
  assert.equal(L.rank([[1, 2, 1], [2, 4, 2], [3, 5, 4]]), 2);
  assert.equal(L.rank([[1, 2, 3], [0, 1, 2], [0, 0, 5]]), 3);
  const p = L.pca2([[2, 1], [3, 2], [4, 3]]); close(p.values[0], 2); close(p.values[1], 0, 1e-9); close(p.ratio[0], 1);
  close(Math.abs(p.scores[2][0]), Math.SQRT2);
  close(L.eig2([[5, 2], [2, 2]]).values[0], 6); close(L.eig2([[5, 2], [2, 2]]).values[1], 1);
  const r = L.matVec(L.rot(90), [1, 0]); close(r[0], 0, 1e-12); close(r[1], 1);
  const q = L.matVec(L.proj(0), [3, 4]); close(q[0], 3); close(q[1], 0, 1e-12);
  close(L.norm([1, -2, 3]), Math.sqrt(14)); close(L.dot([1, -2, 3], [4, 0, -1]), 1);
});
