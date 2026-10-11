import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, Controls, Seg, Btn, Readouts, Readout } from '../kit/controls.jsx';

// Data-driven: every example result below was produced by running the call in Python (NumPy 2.0, SciPy 1.13, scikit-learn 1.6).
const DATA = [
  {"cat": "Descriptive", "want": "Find the mean", "fn": "np.mean", "call": "np.mean(x)", "res": "14.2857", "note": ""},
  {"cat": "Descriptive", "want": "Find the median", "fn": "np.median", "call": "np.median(x)", "res": "14.0", "note": ""},
  {"cat": "Descriptive", "want": "Find the mode", "fn": "stats.mode", "call": "stats.mode(x, keepdims=False).mode", "res": "12", "note": "NumPy has no mode function. keepdims=False gives a plain number."},
  {"cat": "Descriptive", "want": "Find the range (max - min)", "fn": "np.max, np.min", "call": "np.max(x) - np.min(x)", "res": "10", "note": ""},
  {"cat": "Descriptive", "want": "Find the sample variance (divide by n-1)", "fn": "np.var(ddof=1)", "call": "np.var(x, ddof=1)", "res": "11.5714", "note": "Default ddof=0 is the POPULATION variance."},
  {"cat": "Descriptive", "want": "Find the sample standard deviation", "fn": "np.std(ddof=1)", "call": "np.std(x, ddof=1)", "res": "3.4017", "note": "ddof=1 means divide by n-1."},
  {"cat": "Descriptive", "want": "Find the population standard deviation", "fn": "np.std", "call": "np.std(x)", "res": "3.1493", "note": "Divides by n (ddof=0)."},
  {"cat": "Descriptive", "want": "Find Q1 and Q3", "fn": "np.percentile", "call": "np.percentile(x, [25, 75])", "res": "[12., 16.]", "note": "Linear interpolation: may differ from median-of-halves."},
  {"cat": "Descriptive", "want": "Find any percentile (e.g. 60th)", "fn": "np.percentile", "call": "np.percentile(x, 60)", "res": "14.6", "note": "Use q between 0 and 100. np.quantile uses 0 to 1."},
  {"cat": "Descriptive", "want": "Find the IQR directly", "fn": "stats.iqr", "call": "stats.iqr(x)", "res": "4.0", "note": "Same linear convention as np.percentile."},
  {"cat": "Descriptive", "want": "Get the five-number summary", "fn": "np.percentile", "call": "np.percentile(x, [0, 25, 50, 75, 100])", "res": "[10., 12., 14., 16., 20.]", "note": ""},
  {"cat": "Descriptive", "want": "Get count, mean, SD, quartiles in one go", "fn": "pd.Series.describe", "call": "pd.Series(x).describe()", "res": null, "note": "Its std is the SAMPLE SD (ddof=1)."},
  {"cat": "Descriptive", "want": "Measure skewness", "fn": "stats.skew", "call": "stats.skew(x)", "res": "0.4771", "note": "Positive = long right tail."},
  {"cat": "Descriptive", "want": "Measure kurtosis (excess)", "fn": "stats.kurtosis", "call": "stats.kurtosis(x)", "res": "-0.8033", "note": "Normal has excess kurtosis 0."},
  {"cat": "Descriptive", "want": "Standardise values into z-scores", "fn": "stats.zscore", "call": "stats.zscore(x, ddof=1)", "res": "[-1.2599, -0.6719, -0.6719, -0.084 ,  0.21  ,  0.7979,  1.6798]", "note": "Default ddof=0; use ddof=1 for sample SD."},
  {"cat": "Descriptive", "want": "Compute a trimmed mean", "fn": "stats.trim_mean", "call": "stats.trim_mean(x, 0.1)", "res": "14.2857", "note": "Cuts the given proportion from each end."},
  {"cat": "Covariance & correlation", "want": "Find the covariance matrix of two variables", "fn": "np.cov", "call": "np.cov(x5, y5)", "res": "[[ 2.5,  5. ],\n [ 5. , 10.2]]", "note": "Sample covariance (n-1). Off-diagonal entry is Cov(x,y)."},
  {"cat": "Covariance & correlation", "want": "Find the correlation matrix", "fn": "np.corrcoef", "call": "np.corrcoef(x5, y5)", "res": "[[1.    , 0.9901],\n [0.9901, 1.    ]]", "note": ""},
  {"cat": "Covariance & correlation", "want": "Get Pearson r with its p-value", "fn": "stats.pearsonr", "call": "stats.pearsonr(x5, y5)", "res": "statistic=0.9901, pvalue=0.0012", "note": ""},
  {"cat": "Covariance & correlation", "want": "Fit a straight line (slope, intercept, r)", "fn": "stats.linregress", "call": "stats.linregress(x5, y5)", "res": null, "note": "Result has .slope .intercept .rvalue .pvalue .stderr."},
  {"cat": "Distributions", "want": "P(X = x) for a Bernoulli trial", "fn": "bernoulli.pmf", "call": "bernoulli.pmf(1, 0.7)", "res": "0.7", "note": ""},
  {"cat": "Distributions", "want": "Simulate Bernoulli trials", "fn": "bernoulli.rvs", "call": "bernoulli.rvs(p=0.6, size=20, random_state=1)", "res": "[1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1]", "note": ""},
  {"cat": "Distributions", "want": "Exact binomial probability P(X = k)", "fn": "binom.pmf", "call": "binom.pmf(3, n=5, p=0.6)", "res": "0.3456", "note": ""},
  {"cat": "Distributions", "want": "Binomial P(X <= k)", "fn": "binom.cdf", "call": "binom.cdf(3, 10, 0.4)", "res": "0.3823", "note": ""},
  {"cat": "Distributions", "want": "Binomial P(X >= k)", "fn": "binom.sf(k-1)", "call": "binom.sf(2, 10, 0.4)", "res": "0.8327", "note": "sf(k) is P(X > k), so P(X >= 3) = sf(2)."},
  {"cat": "Distributions", "want": "Binomial P(a <= X <= b)", "fn": "binom.cdf", "call": "binom.cdf(5, 10, 0.4) - binom.cdf(2, 10, 0.4)", "res": "0.6665", "note": "This is P(3 <= X <= 5): subtract cdf(a-1) from cdf(b)."},
  {"cat": "Distributions", "want": "Exact Poisson probability P(X = k)", "fn": "poisson.pmf", "call": "poisson.pmf(3, mu=4)", "res": "0.1954", "note": "The rate is called mu in SciPy."},
  {"cat": "Distributions", "want": "Poisson P(X <= k)", "fn": "poisson.cdf", "call": "poisson.cdf(2, mu=3)", "res": "0.4232", "note": ""},
  {"cat": "Distributions", "want": "Poisson P(X > k)", "fn": "poisson.sf", "call": "poisson.sf(2, mu=3)", "res": "0.5768", "note": ""},
  {"cat": "Distributions", "want": "Normal P(X <= x)", "fn": "norm.cdf", "call": "norm.cdf(120, loc=100, scale=15)", "res": "0.9088", "note": "scale is the standard deviation, not the variance."},
  {"cat": "Distributions", "want": "Normal P(a < X < b)", "fn": "norm.cdf", "call": "norm.cdf(115, 100, 15) - norm.cdf(85, 100, 15)", "res": "0.6827", "note": ""},
  {"cat": "Distributions", "want": "Normal P(X > x)", "fn": "norm.sf", "call": "norm.sf(120, 100, 15)", "res": "0.0912", "note": ""},
  {"cat": "Distributions", "want": "Find the value with a given area to its left (percentile)", "fn": "norm.ppf", "call": "norm.ppf(0.95, loc=100, scale=15)", "res": "124.6728", "note": "ppf is the inverse of cdf."},
  {"cat": "Distributions", "want": "Normal density height (for a plot)", "fn": "norm.pdf", "call": "norm.pdf(0, loc=0, scale=1)", "res": "0.3989", "note": "A density, not a probability."},
  {"cat": "Distributions", "want": "Critical z for a two-sided 95% test", "fn": "norm.ppf", "call": "norm.ppf(0.975)", "res": "1.96", "note": "Use 1 - alpha/2."},
  {"cat": "Distributions", "want": "Critical t value", "fn": "t.ppf", "call": "t.ppf(0.975, df=7)", "res": "2.3646", "note": "df = n - 1 for one sample."},
  {"cat": "Distributions", "want": "Chi-square critical value", "fn": "chi2.ppf", "call": "chi2.ppf(0.95, df=3)", "res": "7.8147", "note": "Right-tail critical value at alpha = 0.05."},
  {"cat": "Distributions", "want": "F critical value (ANOVA)", "fn": "f.ppf", "call": "f.ppf(0.95, dfn=2, dfd=6)", "res": "5.1433", "note": "dfn = k-1, dfd = N-k."},
  {"cat": "Confidence intervals", "want": "z confidence interval for a mean (sigma known)", "fn": "norm.interval", "call": "norm.interval(0.95, loc=50, scale=8/np.sqrt(64))", "res": "(48.04, 51.96)", "note": "scale = standard error = sigma / sqrt(n)."},
  {"cat": "Confidence intervals", "want": "t confidence interval for a mean (sigma unknown)", "fn": "t.interval", "call": "t.interval(0.95, df=7, loc=np.mean(data), scale=stats.sem(data))", "res": "(19.1594, 21.8406)", "note": "stats.sem uses ddof=1."},
  {"cat": "Confidence intervals", "want": "Standard error of the mean from data", "fn": "stats.sem", "call": "stats.sem(data)", "res": "0.5669", "note": ""},
  {"cat": "Confidence intervals", "want": "One-sided 95% lower bound for a mean", "fn": "norm.ppf", "call": "50 - norm.ppf(0.95) * 8/np.sqrt(64)", "res": "48.3551", "note": "Use 1 - alpha, not 1 - alpha/2."},
  {"cat": "Confidence intervals", "want": "Confidence interval for a proportion", "fn": "norm.interval", "call": "norm.interval(0.95, loc=0.6, scale=np.sqrt(0.6*0.4/400))", "res": "(0.552, 0.648)", "note": "Wald interval, SE = sqrt(p(1-p)/n)."},
  {"cat": "Hypothesis tests", "want": "Two-sided z-test p-value", "fn": "norm.sf", "call": "2 * norm.sf(abs(-2.0))", "res": "0.0455", "note": "Double the tail beyond |z|."},
  {"cat": "Hypothesis tests", "want": "Left-tailed z-test p-value", "fn": "norm.cdf", "call": "norm.cdf(-2.0)", "res": "0.0228", "note": ""},
  {"cat": "Hypothesis tests", "want": "Right-tailed z-test p-value", "fn": "norm.sf", "call": "norm.sf(2.0)", "res": "0.0228", "note": ""},
  {"cat": "Hypothesis tests", "want": "One-sample t-test", "fn": "stats.ttest_1samp", "call": "stats.ttest_1samp(data, popmean=20)", "res": "statistic=0.8819, pvalue=0.4071", "note": "Add alternative=\"greater\" or \"less\" for one-sided."},
  {"cat": "Hypothesis tests", "want": "Two independent samples t-test", "fn": "stats.ttest_ind", "call": "stats.ttest_ind(a, b)", "res": "statistic=-3.8523, pvalue=0.0049", "note": "equal_var=False gives the Welch test."},
  {"cat": "Hypothesis tests", "want": "Paired t-test (before/after)", "fn": "stats.ttest_rel", "call": "stats.ttest_rel(a, b)", "res": "statistic=-4.5714, pvalue=0.0102", "note": ""},
  {"cat": "Hypothesis tests", "want": "Chi-square goodness of fit", "fn": "stats.chisquare", "call": "stats.chisquare(f_obs=obs, f_exp=exp)", "res": "statistic=5.04, pvalue=0.1689", "note": "Expected counts must add up to the observed total."},
  {"cat": "Hypothesis tests", "want": "Chi-square test of independence", "fn": "stats.chi2_contingency", "call": "stats.chi2_contingency(table, correction=False)", "res": "(4.0, 0.0455, 1.0)", "note": "Returns (chi2, p, dof, expected). correction=False matches hand calculation."},
  {"cat": "Hypothesis tests", "want": "One-way ANOVA", "fn": "stats.f_oneway", "call": "stats.f_oneway(g1, g2, g3)", "res": "statistic=27.0, pvalue=0.001", "note": "One list per group."},
  {"cat": "NumPy linear algebra", "want": "Create a vector or matrix", "fn": "np.array", "call": "np.array([[1, 2], [3, 4]])", "res": "[[1, 2],\n [3, 4]]", "note": ""},
  {"cat": "NumPy linear algebra", "want": "Check the shape", "fn": ".shape", "call": "A.shape", "res": "(2, 2)", "note": ""},
  {"cat": "NumPy linear algebra", "want": "Add matrices", "fn": "+", "call": "A + B", "res": "[[3, 2],\n [4, 9]]", "note": ""},
  {"cat": "NumPy linear algebra", "want": "Multiply matrices (row by column)", "fn": "@ / np.matmul", "call": "A @ B", "res": "[[ 4, 10],\n [10, 20]]", "note": "A * B is element-wise, NOT matrix multiplication."},
  {"cat": "NumPy linear algebra", "want": "Transpose", "fn": ".T", "call": "A.T", "res": "[[1, 3],\n [2, 4]]", "note": ""},
  {"cat": "NumPy linear algebra", "want": "Dot product of two vectors", "fn": "np.dot", "call": "np.dot(np.array([2, 1]), np.array([3, -2]))", "res": "4", "note": ""},
  {"cat": "NumPy linear algebra", "want": "Length (norm) of a vector", "fn": "np.linalg.norm", "call": "np.linalg.norm(v)", "res": "5.0", "note": ""},
  {"cat": "NumPy linear algebra", "want": "Determinant", "fn": "np.linalg.det", "call": "np.linalg.det(A)", "res": "-2.0", "note": "Floating point: you may see -2.0000000000000004."},
  {"cat": "NumPy linear algebra", "want": "Inverse", "fn": "np.linalg.inv", "call": "np.linalg.inv(A)", "res": "[[-2. ,  1. ],\n [ 1.5, -0.5]]", "note": "Raises LinAlgError if det = 0."},
  {"cat": "NumPy linear algebra", "want": "Rank", "fn": "np.linalg.matrix_rank", "call": "np.linalg.matrix_rank(A)", "res": "2", "note": ""},
  {"cat": "NumPy linear algebra", "want": "Solve A x = b", "fn": "np.linalg.solve", "call": "np.linalg.solve(A, np.array([5, 6]))", "res": "[-4. ,  4.5]", "note": "Better than inv(A) @ b."},
  {"cat": "NumPy linear algebra", "want": "Eigenvalues and eigenvectors (any square matrix)", "fn": "np.linalg.eig", "call": "np.linalg.eig(S)", "res": "[3., 1.]", "note": "Returns (eigenvalues, eigenvectors); result shows the eigenvalues. Eigenvectors are the COLUMNS of the second output."},
  {"cat": "NumPy linear algebra", "want": "Eigenvalues of a symmetric matrix (sorted)", "fn": "np.linalg.eigh", "call": "np.linalg.eigh(S)", "res": "[1., 3.]", "note": "Result shows the eigenvalues, in ascending order. Use for covariance matrices."},
  {"cat": "NumPy linear algebra", "want": "Projection matrix onto a unit vector", "fn": "np.outer", "call": "np.outer(u, u)", "res": "[[0.5, 0.5],\n [0.5, 0.5]]", "note": "P = u u^T. Normalise u first."},
  {"cat": "NumPy linear algebra", "want": "Rotation by theta (matrix)", "fn": "np.cos / np.sin", "call": "np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])", "res": null, "note": "th = np.deg2rad(degrees). Counter-clockwise."},
  {"cat": "NumPy linear algebra", "want": "Check two arrays are equal up to rounding", "fn": "np.allclose", "call": "np.allclose(0.1 + 0.2, 0.3)", "res": "True", "note": "Use this, not ==, for floats."},
  {"cat": "NumPy linear algebra", "want": "Round tiny values like 6e-17 to zero", "fn": "np.round", "call": "np.round(np.array([6.1e-17, 1.0]), 10)", "res": "[0., 1.]", "note": ""},
  {"cat": "NumPy linear algebra", "want": "Identity matrix", "fn": "np.eye", "call": "np.eye(2)", "res": "[[1., 0.],\n [0., 1.]]", "note": ""},
  {"cat": "PCA", "want": "Centre the data", "fn": "X - X.mean(axis=0)", "call": "X - X.mean(axis=0)", "res": "[[ 0.46,  0.16],\n [-1.54, -1.54],\n [ 0.16,  0.66],\n [-0.14, -0.04],\n [ 1.06,  0.76]]", "note": "Subtract each column mean."},
  {"cat": "PCA", "want": "Covariance matrix of features (columns)", "fn": "np.cov(rowvar=False)", "call": "np.cov(X - X.mean(axis=0), rowvar=False)", "res": "[[0.938 , 0.8405],\n [0.8405, 0.853 ]]", "note": "rowvar=False because variables are in columns."},
  {"cat": "PCA", "want": "PCA with scikit-learn", "fn": "PCA", "call": "PCA(n_components=1).fit_transform(X)", "res": "[ 0.4436, -2.1772,  0.5707, -0.129 ,  1.2919]", "note": "Centres the data itself. Sign of a PC may flip."},
  {"cat": "PCA", "want": "Proportion of variance explained", "fn": "PCA.explained_variance_ratio_", "call": "PCA(n_components=2).fit(X).explained_variance_ratio_", "res": "[0.9699, 0.0301]", "note": ""},
  {"cat": "PCA", "want": "Principal directions", "fn": "PCA.components_", "call": "PCA(n_components=2).fit(X).components_", "res": "[[ 0.7247,  0.689 ],\n [-0.689 ,  0.7247]]", "note": "Each ROW is a principal component here."},
  {"cat": "Sampling & plots", "want": "Reproducible random numbers", "fn": "np.random.seed", "call": "np.random.seed(42)", "res": null, "note": "Call once before generating random data."},
  {"cat": "Sampling & plots", "want": "Random integers (e.g. marks)", "fn": "np.random.randint", "call": "np.random.randint(40, 100, size=10)", "res": null, "note": "Upper limit is excluded."},
  {"cat": "Sampling & plots", "want": "Random normal sample", "fn": "np.random.normal", "call": "np.random.normal(loc=70, scale=10, size=100)", "res": null, "note": ""},
  {"cat": "Sampling & plots", "want": "Simple random sample of values", "fn": "np.random.choice", "call": "np.random.choice(x, size=3, replace=False)", "res": null, "note": "replace=False means no repeats."},
  {"cat": "Sampling & plots", "want": "Random sample of DataFrame rows", "fn": "df.sample", "call": "df.sample(n=3, random_state=1)", "res": null, "note": "Use frac=0.5 for a proportion."},
  {"cat": "Sampling & plots", "want": "Stratified sample (same fraction per group)", "fn": "groupby().sample", "call": "df.groupby(\"g\", group_keys=False).sample(frac=0.5, random_state=1)", "res": null, "note": "Needs pandas 1.1 or newer."},
  {"cat": "Sampling & plots", "want": "Stratified split with sklearn", "fn": "train_test_split", "call": "train_test_split(df, train_size=0.5, stratify=df[\"g\"], random_state=1)", "res": null, "note": "stratify= keeps group proportions."},
  {"cat": "Sampling & plots", "want": "Draw a histogram", "fn": "plt.hist", "call": "plt.hist(x, bins=5, edgecolor=\"black\")", "res": null, "note": "Follow with plt.show()."},
  {"cat": "Sampling & plots", "want": "Draw a boxplot", "fn": "plt.boxplot", "call": "plt.boxplot(x)", "res": null, "note": "Whiskers use 1.5 x IQR; points beyond are outliers."},
  {"cat": "Sampling & plots", "want": "Draw a scatter plot", "fn": "plt.scatter", "call": "plt.scatter(x5, y5)", "res": null, "note": ""}
];

const CATS = ['All', 'Descriptive', 'Covariance & correlation', 'Distributions', 'Confidence intervals', 'Hypothesis tests', 'NumPy linear algebra', 'PCA', 'Sampling & plots'];
const CAT_SHORT = { 'Covariance & correlation': 'Cov & corr', 'Confidence intervals': 'CI', 'Hypothesis tests': 'Tests', 'NumPy linear algebra': 'Linear algebra', 'Sampling & plots': 'Sampling & plots' };

const DATA_USED = [
  'x = np.array([10, 12, 12, 14, 15, 17, 20])',
  'x5 = [1, 2, 3, 4, 5];  y5 = [2, 4, 5, 8, 10]',
  'data = np.array([18, 20, 21, 19, 22, 20, 23, 21])',
  'A = [[1, 2], [3, 4]];  B = [[2, 0], [1, 5]];  S = [[2, 1], [1, 2]]',
  'X = [[2.5, 2.4], [0.5, 0.7], [2.2, 2.9], [1.9, 2.2], [3.1, 3.0]]',
  'g1 = [8, 9, 10];  g2 = [11, 12, 13];  g3 = [14, 15, 16]',
  'obs = [18, 22, 27, 33];  exp = [25, 25, 25, 25];  table = [[30, 20], [20, 30]]',
  'a = [23, 25, 28, 30, 27];  b = [30, 33, 35, 31, 36]',
];

function copyText(text) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(() => true, () => false);
    }
  } catch (e) { /* fall through */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand && document.execCommand('copy');
    document.body.removeChild(ta);
    return Promise.resolve(!!ok);
  } catch (e) { return Promise.resolve(false); }
}

export default function PythonFunctionFinder() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [limit, setLimit] = useState(8);
  const [copied, setCopied] = useState(-1);
  const [failed, setFailed] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const rows = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return DATA.map((d, i) => ({ ...d, i })).filter((d) => {
      if (cat !== 'All' && d.cat !== cat) return false;
      const hay = `${d.want} ${d.fn} ${d.call} ${d.note} ${d.cat}`.toLowerCase().replace(/\s+/g, '');
      return words.every((w) => hay.includes(w));
    });
  }, [q, cat]);
  const shown = rows.slice(0, limit);

  const doCopy = (d) => {
    copyText(d.call).then((ok) => {
      setFailed(!ok); setCopied(ok ? d.i : -1);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => { setCopied(-1); setFailed(false); }, 1600);
    });
  };

  const pick = (v) => { setCat(v); setLimit(8); };
  return (
    <Card title="Python function finder: I want to…" tag="Look-up" foot="**Match the verb to the function**: describe the job (percentile, P(X≥k), eigenvalues, one-way ANOVA…) and read off the call. Every result shown was produced by running the call.">
      <Controls>
        <label className="numlist">
          <span>{'Search (try “variance”, “P(X>=”, “eigen”, “stratified”)'}</span>
          <input type="search" value={q} placeholder="type what you want to do" aria-label="Search functions" onChange={(e) => { setQ(e.target.value); setLimit(8); }} />
        </label>
      </Controls>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '6px 0 10px' }}>
        {CATS.map((c) => (
          <button key={c} type="button" aria-pressed={c === cat} onClick={() => pick(c)}
            style={{ padding: '5px 11px', borderRadius: 99, border: '1px solid var(--line)', background: c === cat ? 'var(--brand)' : 'var(--surface)', color: c === cat ? 'var(--brand-ink)' : 'var(--ink2)', font: 'inherit', fontSize: 13, cursor: 'pointer', minHeight: 32 }}>
            {CAT_SHORT[c] || c}
          </button>
        ))}
      </div>
      <div className="table-wrap" style={{ margin: '8px 0' }}>
        <table>
          <thead><tr><th style={{ minWidth: 150 }}>I want to…</th><th>Function and example call</th><th style={{ width: 84 }}>Copy</th></tr></thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={3} style={{ color: 'var(--muted)' }}>Nothing matches. Try a shorter word such as “mean”, “cdf”, “rank”.</td></tr>}
            {shown.map((d) => (
              <tr key={d.i}>
                <td><b>{d.want}</b><div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{d.cat}</div></td>
                <td>
                  <div style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{d.fn}</div>
                  <code style={{ display: 'inline-block', margin: '3px 0', wordBreak: 'break-word' }}>{d.call}</code>
                  {d.res && <div style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--c3)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{'→ '}{d.res}</div>}
                  {d.note && <div style={{ fontSize: 13, color: 'var(--ink2)', marginTop: 3 }}>{d.note}</div>}
                </td>
                <td><Btn kind="ghost" onClick={() => doCopy(d)} aria-label={`Copy ${d.call}`}>{copied === d.i ? 'Copied' : 'Copy'}</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {failed && <div style={{ fontSize: 13, color: 'var(--c2)' }}>Copy is blocked in this browser: select the code with the mouse and copy it by hand.</div>}
      <Readouts>
        <Readout label="Matches" value={`${rows.length} of ${DATA.length}`} />
        <Readout label="Showing" value={String(shown.length)} />
      </Readouts>
      <Controls>
        {rows.length > limit && <Btn kind="primary" onClick={() => setLimit(limit + 10)}>Show 10 more</Btn>}
        {limit > 8 && <Btn kind="ghost" onClick={() => setLimit(8)}>Collapse</Btn>}
      </Controls>
      <details style={{ marginTop: 8, fontSize: 13 }}>
        <summary style={{ cursor: 'pointer', color: 'var(--ink2)' }}>Sample data behind the shown results</summary>
        <pre style={{ margin: '6px 0 0', padding: 10, background: 'var(--surface2)', borderRadius: 8, overflowX: 'auto', fontSize: 12 }}>{`import numpy as np; from scipy import stats\nfrom scipy.stats import norm, binom, poisson, bernoulli, t, chi2, f\n` + DATA_USED.join('\n')}</pre>
      </details>
    </Card>
  );
}
