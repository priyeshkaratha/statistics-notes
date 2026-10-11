// Generated from verified runs (NumPy 2.0, SciPy 1.13, pandas 2.3, scikit-learn 1.6, matplotlib). Every printed output below is real.
const PROG = {
 "e13": {
  "code": "import numpy as np\n\nmarks = [62, 70, 75, 75, 81, 84, 90, 93]\nprint(\"Mean =\", np.mean(marks))",
  "out": "Mean = 78.75"
 },
 "e14": {
  "code": "import numpy as np\nimport pandas as pd\n\nnp.random.seed(42)                                  # reproducible\narr = np.random.randint(40, 100, size=10)            # 10 integer marks in [40, 99]\nprint(\"NumPy sample:\", arr)\n\ndf = pd.DataFrame({\n    \"student\": range(1, 9),\n    \"gender\":  [\"F\", \"M\", \"F\", \"M\", \"F\", \"M\", \"F\", \"M\"],\n    \"marks\":   [62, 70, 75, 75, 81, 84, 90, 93],\n})\nprint(df)",
  "out": "NumPy sample: [78 91 68 54 82 47 60 78 97 58]\n   student gender  marks\n0        1      F     62\n1        2      M     70\n2        3      F     75\n3        4      M     75\n4        5      F     81\n5        6      M     84\n6        7      F     90\n7        8      M     93"
 },
 "e15": {
  "code": "import numpy as np\nimport pandas as pd\n\ndata = [4, 7, 8, 10, 12, 15, 18, 21]\nq1 = np.percentile(data, 25)\nq3 = np.percentile(data, 75)\nprint(\"Q1 =\", q1, \" Q3 =\", q3, \" IQR =\", q3 - q1)\n\n# pandas gives the same numbers (also linear interpolation)\ns = pd.Series(data)\nprint(\"pandas:\", s.quantile(0.25), s.quantile(0.75))",
  "out": "Q1 = 7.75  Q3 = 15.75  IQR = 8.0\npandas: 7.75 15.75"
 },
 "e16": {
  "code": "import numpy as np\n\ndata = np.array([10, 20, 30, 40, 50])\nprint(\"Mean               :\", np.mean(data))\nprint(\"Median             :\", np.median(data))\nprint(\"Sample std (ddof=1):\", np.std(data, ddof=1))\nprint(\"Population std     :\", np.std(data))",
  "out": "Mean               : 30.0\nMedian             : 30.0\nSample std (ddof=1): 15.811388300841896\nPopulation std     : 14.142135623730951"
 },
 "e17": {
  "code": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"id\":    range(1, 13),\n    \"group\": [\"A\"]*8 + [\"B\"]*4,          # 8 in A (67%), 4 in B (33%)\n    \"score\": [55, 60, 62, 65, 70, 72, 75, 80, 50, 58, 66, 90],\n})\n\n# simple random sampling: every row has the same chance\nsrs = df.sample(n=6, random_state=1)\nprint(\"Simple random sample:\")\nprint(srs)\n\n# stratified sampling: take 50% of every group\nstrat = df.groupby(\"group\", group_keys=False).sample(frac=0.5, random_state=1)\nprint(\"Stratified sample (50% of each group):\")\nprint(strat)\nprint(strat[\"group\"].value_counts())",
  "out": "Simple random sample:\n    id group  score\n2    3     A     62\n3    4     A     65\n4    5     A     70\n10  11     B     66\n1    2     A     60\n6    7     A     75\nStratified sample (50% of each group):\n    id group  score\n7    8     A     80\n2    3     A     62\n1    2     A     60\n6    7     A     75\n11  12     B     90\n10  11     B     66\ngroup\nA    4\nB    2\nName: count, dtype: int64"
 },
 "e17b": {
  "code": "import pandas as pd\nfrom sklearn.model_selection import train_test_split\n\ndf = pd.DataFrame({\n    \"id\":    range(1, 13),\n    \"group\": [\"A\"]*8 + [\"B\"]*4,\n    \"score\": [55, 60, 62, 65, 70, 72, 75, 80, 50, 58, 66, 90],\n})\n\nsample, rest = train_test_split(df, train_size=6, stratify=df[\"group\"], random_state=1)\nprint(sample.sort_values(\"id\"))\nprint(sample[\"group\"].value_counts())",
  "out": "    id group  score\n1    2     A     60\n2    3     A     62\n6    7     A     75\n7    8     A     80\n10  11     B     66\n11  12     B     90\ngroup\nA    4\nB    2\nName: count, dtype: int64"
 },
 "e18": {
  "code": "import numpy as np\nimport matplotlib.pyplot as plt\n\nmarks = np.array([62, 70, 75, 75, 81, 84, 90, 93])\n\nplt.figure(figsize=(8, 3.5))\nplt.subplot(1, 2, 1)\nplt.hist(marks, bins=4, edgecolor=\"black\")\nplt.xlabel(\"Marks\")\nplt.ylabel(\"Frequency\")\nplt.title(\"Histogram\")\n\nplt.subplot(1, 2, 2)\nplt.boxplot(marks)\nplt.ylabel(\"Marks\")\nplt.title(\"Boxplot\")\n\nplt.tight_layout()\nplt.show()\ncounts, edges = np.histogram(marks, bins=4)\nprint(\"bin counts:\", counts, \" bin edges:\", edges)\nprint(\"boxplot five numbers:\", np.percentile(marks, [0, 25, 50, 75, 100]))",
  "out": "bin counts: [1 3 2 2]  bin edges: [62.   69.75 77.5  85.25 93.  ]\nboxplot five numbers: [62.   73.75 78.   85.5  93.  ]"
 },
 "e19": {
  "code": "import numpy as np\nfrom scipy import stats\n\nx = np.array([1, 2, 3, 4, 5])\ny = np.array([2, 4, 5, 8, 10])\n\nprint(\"Covariance matrix:\")\nprint(np.cov(x, y))\nprint(\"Cov(x, y) =\", np.cov(x, y)[0, 1])\nprint(\"Correlation matrix:\")\nprint(np.corrcoef(x, y))\nr, p = stats.pearsonr(x, y)\nprint(\"Pearson r =\", r, \" p-value =\", p)",
  "out": "Covariance matrix:\n[[ 2.5  5. ]\n [ 5.  10.2]]\nCov(x, y) = 5.0\nCorrelation matrix:\n[[1.         0.99014754]\n [0.99014754 1.        ]]\nPearson r = 0.9901475429766744  p-value = 0.0011722164447168701"
 },
 "e20": {
  "code": "from scipy.stats import binom, norm\n\n# Binomial: coin tossed 5 times, P(exactly 3 heads)\nprint(\"P(X=3)  =\", binom.pmf(3, n=5, p=0.5))\nprint(\"P(X<=3) =\", binom.cdf(3, n=5, p=0.5))\nprint(\"P(X>=3) =\", binom.sf(2, n=5, p=0.5))\n\n# Normal: X ~ N(100, 15^2)\nprint(\"P(X<=120)    =\", norm.cdf(120, loc=100, scale=15))\nprint(\"P(85<X<115)  =\", norm.cdf(115, 100, 15) - norm.cdf(85, 100, 15))\nprint(\"95th percentile =\", norm.ppf(0.95, loc=100, scale=15))",
  "out": "P(X=3)  = 0.31249999999999994\nP(X<=3) = 0.8125\nP(X>=3) = 0.5\nP(X<=120)    = 0.9087887802741321\nP(85<X<115)  = 0.6826894921370859\n95th percentile = 124.67280440427209"
 },
 "e21": {
  "code": "import numpy as np\nfrom scipy import stats\n\ndata = np.array([48, 51, 52, 49, 50, 53, 47, 52])\nmu0, alpha = 50, 0.05\n\nt_stat, p_value = stats.ttest_1samp(data, popmean=mu0)\nprint(\"t =\", t_stat, \" p-value =\", p_value)\nif p_value <= alpha:\n    print(\"Reject H0: mean differs from\", mu0)\nelse:\n    print(\"Fail to reject H0: no evidence the mean differs from\", mu0)",
  "out": "t = 0.3333333333333333  p-value = 0.7486445487540937\nFail to reject H0: no evidence the mean differs from 50"
 },
 "e21b": {
  "code": "from scipy import stats\n\na = [23, 25, 28, 30, 27]\nb = [30, 33, 35, 31, 36]\nt_stat, p_value = stats.ttest_ind(a, b)          # two independent samples, equal variance\nprint(\"t =\", t_stat, \" p-value =\", p_value)\nt2, p2 = stats.ttest_ind(a, b, equal_var=False)  # Welch version\nprint(\"Welch t =\", t2, \" p-value =\", p2)",
  "out": "t = -3.8523472987446135  p-value = 0.004861332717292459\nWelch t = -3.852347298744614  p-value = 0.004892418027067103"
 },
 "e22": {
  "code": "import numpy as np\n\nA = np.array([[1, 2],\n              [3, 4]])\nB = np.array([[2, 0],\n              [1, 5]])\nC = A @ B                 # same as np.dot(A, B) or np.matmul(A, B)\nprint(C)\nprint(\"Element-wise A*B (different!):\")\nprint(A * B)",
  "out": "[[ 4 10]\n [10 20]]\nElement-wise A*B (different!):\n[[ 2  0]\n [ 3 20]]"
 },
 "e23": {
  "code": "import numpy as np\n\nA = np.array([[4, 1],\n              [2, 3]], dtype=float)\nvalues, vectors = np.linalg.eig(A)\nprint(\"Eigenvalues:\", values)\nprint(\"Eigenvectors (columns):\")\nprint(vectors)",
  "out": "Eigenvalues: [5. 2.]\nEigenvectors (columns):\n[[ 0.70710678 -0.4472136 ]\n [ 0.70710678  0.89442719]]"
 },
 "e24": {
  "code": "import numpy as np\nfrom sklearn.decomposition import PCA\n\nX = np.array([[2.5, 2.4],\n              [0.5, 0.7],\n              [2.2, 2.9],\n              [1.9, 2.2],\n              [3.1, 3.0]])\n\npca = PCA(n_components=1)\nZ = pca.fit_transform(X)                       # centres the data itself\nprint(\"PC1 direction:\", pca.components_[0])\nprint(\"Explained variance ratio:\", pca.explained_variance_ratio_)\nprint(\"Scores (projected data):\")\nprint(Z.ravel())",
  "out": "PC1 direction: [0.72474155 0.68902082]\nExplained variance ratio: [0.96989047]\nScores (projected data):\n[ 0.44362444 -2.17719404  0.57071239 -0.12902465  1.29188186]"
 },
 "e25": {
  "code": "from scipy import stats\n\ng1 = [8, 9, 10]\ng2 = [11, 12, 13]\ng3 = [14, 15, 16]\nF, p = stats.f_oneway(g1, g2, g3)\nprint(\"F =\", F, \" p-value =\", p)\nprint(\"Reject H0 (means differ)\" if p <= 0.05 else \"Fail to reject H0\")",
  "out": "F = 27.0  p-value = 0.0010000000000000002\nReject H0 (means differ)"
 },
 "p01": {
  "code": "import numpy as np\nfrom scipy import stats\n\ndata = np.array([10, 12, 12, 14, 15, 17, 20])\nprint(\"Mean:\", np.mean(data))\nprint(\"Median:\", np.median(data))\nprint(\"Mode:\", stats.mode(data, keepdims=False).mode)\nprint(\"Range:\", np.max(data) - np.min(data))\nprint(\"Sample variance:\", np.var(data, ddof=1))\nprint(\"Sample standard deviation:\", np.std(data, ddof=1))",
  "out": "Mean: 14.285714285714286\nMedian: 14.0\nMode: 12\nRange: 10\nSample variance: 11.57142857142857\nSample standard deviation: 3.401680257083045"
 },
 "p02": {
  "code": "import pandas as pd\n\nscores = pd.Series([62, 70, 75, 75, 81, 84, 90, 93])\nprint(scores.describe())",
  "out": "count     8.000000\nmean     78.750000\nstd      10.333717\nmin      62.000000\n25%      73.750000\n50%      78.000000\n75%      85.500000\nmax      93.000000\ndtype: float64"
 },
 "p03": {
  "code": "import numpy as np\n\ndata = np.array([4, 7, 8, 10, 12, 15, 18, 21])\nq1 = np.percentile(data, 25)\nq3 = np.percentile(data, 75)\niqr = q3 - q1\nprint(\"Q1:\", q1)\nprint(\"Q3:\", q3)\nprint(\"IQR:\", iqr)",
  "out": "Q1: 7.75\nQ3: 15.75\nIQR: 8.0"
 },
 "p04": {
  "code": "import numpy as np\n\nx = np.array([1, 2, 3, 4, 5])\ny = np.array([2, 4, 5, 8, 10])\nprint(\"Covariance matrix:\")\nprint(np.cov(x, y))\nprint(\"Correlation matrix:\")\nprint(np.corrcoef(x, y))",
  "out": "Covariance matrix:\n[[ 2.5  5. ]\n [ 5.  10.2]]\nCorrelation matrix:\n[[1.         0.99014754]\n [0.99014754 1.        ]]"
 },
 "p05": {
  "code": "from scipy.stats import bernoulli\n\np = 0.7\nprint(\"P(X=1):\", bernoulli.pmf(1, p))\nprint(\"P(X=0):\", bernoulli.pmf(0, p))",
  "out": "P(X=1): 0.7\nP(X=0): 0.29999999999999993"
 },
 "p06": {
  "code": "from scipy.stats import bernoulli\n\nsample = bernoulli.rvs(p=0.6, size=20, random_state=1)\nprint(sample)\nprint(\"Number of successes:\", sample.sum())",
  "out": "[1 0 1 1 1 1 1 1 1 1 1 0 1 0 1 0 1 1 1 1]\nNumber of successes: 16"
 },
 "p07": {
  "code": "from scipy.stats import binom\n\nn = 5\np = 0.6\nx = 3\nprob = binom.pmf(x, n, p)\nprint(\"P(X=3) =\", prob)",
  "out": "P(X=3) = 0.3455999999999999"
 },
 "p08": {
  "code": "from scipy.stats import binom\n\nn, p = 10, 0.4\nprint(\"P(X <= 3):\", binom.cdf(3, n, p))\nprint(\"P(X >= 3):\", binom.sf(2, n, p))  # P(X > 2)",
  "out": "P(X <= 3): 0.3822806015999999\nP(X >= 3): 0.8327102464"
 },
 "p09": {
  "code": "from scipy.stats import binom\n\nn, p = 6, 0.5\nfor x in range(n + 1):\n    print(x, round(binom.pmf(x, n, p), 4))",
  "out": "0 0.0156\n1 0.0938\n2 0.2344\n3 0.3125\n4 0.2344\n5 0.0938\n6 0.0156"
 },
 "p10": {
  "code": "from scipy.stats import poisson\n\nlam = 4\nprint(\"P(X=3):\", poisson.pmf(3, mu=lam))",
  "out": "P(X=3): 0.19536681481316454"
 },
 "p11": {
  "code": "from scipy.stats import poisson\n\nlam = 3\nprint(\"P(X <= 2):\", poisson.cdf(2, mu=lam))\nprint(\"P(X > 2):\", poisson.sf(2, mu=lam))",
  "out": "P(X <= 2): 0.4231900811268435\nP(X > 2): 0.5768099188731565"
 },
 "p12": {
  "code": "from scipy.stats import norm\n\nmu, sigma = 100, 15\nprint(norm.cdf(120, loc=mu, scale=sigma))",
  "out": "0.9087887802741321"
 },
 "p13": {
  "code": "from scipy.stats import norm\n\nmu, sigma = 100, 15\nprob = norm.cdf(115, mu, sigma) - norm.cdf(85, mu, sigma)\nprint(prob)",
  "out": "0.6826894921370859"
 },
 "p14": {
  "code": "from scipy.stats import norm\n\nvalue = norm.ppf(0.95, loc=100, scale=15)\nprint(value)",
  "out": "124.67280440427209"
 },
 "p15": {
  "code": "import numpy as np\nimport matplotlib.pyplot as plt\nfrom scipy.stats import norm\n\nx = np.linspace(-4, 4, 200)\ny = norm.pdf(x, loc=0, scale=1)\nplt.plot(x, y)\nplt.xlabel(\"x\")\nplt.ylabel(\"Density\")\nplt.title(\"Standard Normal Distribution\")\nplt.show()\nprint(\"plotted\", len(x), \"points; peak density\", round(y.max(), 4))",
  "out": "plotted 200 points; peak density 0.3989"
 },
 "p16": {
  "code": "import numpy as np\nfrom scipy.stats import norm\n\nxbar = 50\nsigma = 8\nn = 64\nconfidence = 0.95\nalpha = 1 - confidence\nz = norm.ppf(1 - alpha/2)\nse = sigma / np.sqrt(n)\nlower = xbar - z * se\nupper = xbar + z * se\nprint(\"z =\", z, \" SE =\", se)\nprint(\"95% CI:\", (lower, upper))",
  "out": "z = 1.959963984540054  SE = 1.0\n95% CI: (np.float64(48.04003601545995), np.float64(51.95996398454005))"
 },
 "p17": {
  "code": "import numpy as np\nfrom scipy.stats import t\n\ndata = np.array([18, 20, 21, 19, 22, 20, 23, 21])\nn = len(data)\nxbar = np.mean(data)\ns = np.std(data, ddof=1)\nalpha = 0.05\ncritical = t.ppf(1 - alpha/2, df=n-1)\nse = s / np.sqrt(n)\nci = (xbar - critical*se, xbar + critical*se)\nprint(\"Mean:\", xbar)\nprint(\"s =\", s, \" t critical =\", critical)\nprint(\"95% CI:\", ci)",
  "out": "Mean: 20.5\ns = 1.6035674514745464  t critical = 2.3646242515927844\n95% CI: (np.float64(19.159384061322843), np.float64(21.840615938677157))"
 },
 "p18": {
  "code": "import numpy as np\nfrom scipy.stats import norm\n\nxbar, sigma, n = 102, 12, 36\nalpha = 0.05\nz = norm.ppf(1 - alpha)\nse = sigma / np.sqrt(n)\nlower = xbar - z * se\nprint(\"z =\", z)\nprint(\"95% lower confidence bound:\", lower)\nprint(\"Interval: (\", lower, \", infinity)\")",
  "out": "z = 1.644853626951472\n95% lower confidence bound: 98.71029274609705\nInterval: ( 98.71029274609705 , infinity)"
 },
 "p19": {
  "code": "import numpy as np\nfrom scipy.stats import norm\n\nxbar, sigma, n = 48, 10, 25\nalpha = 0.05\nz = norm.ppf(1 - alpha)\nupper = xbar + z * sigma/np.sqrt(n)\nprint(\"95% upper confidence bound:\", upper)",
  "out": "95% upper confidence bound: 51.28970725390295"
 },
 "p20": {
  "code": "import numpy as np\nfrom scipy.stats import norm\n\nsuccesses = 240\nn = 400\nphat = successes / n\nalpha = 0.05\nz = norm.ppf(1 - alpha/2)\nse = np.sqrt(phat * (1 - phat) / n)\nci = (phat - z*se, phat + z*se)\nprint(\"p-hat:\", phat)\nprint(\"SE =\", se)\nprint(\"95% CI:\", ci)",
  "out": "p-hat: 0.6\nSE = 0.02449489742783178\n95% CI: (np.float64(0.5519908832364468), np.float64(0.6480091167635531))"
 },
 "p21": {
  "code": "import numpy as np\nfrom scipy.stats import norm\n\nmu0 = 500\nxbar = 496\nsigma = 20\nn = 100\nalpha = 0.05\nz = (xbar - mu0) / (sigma / np.sqrt(n))\np_value = 2 * norm.sf(abs(z))\nprint(\"z =\", z)\nprint(\"p-value =\", p_value)\nprint(\"Decision:\", \"Reject H0\" if p_value <= alpha else \"Fail to reject H0\")",
  "out": "z = -2.0\np-value = 0.045500263896358396\nDecision: Reject H0"
 },
 "p22": {
  "code": "import numpy as np\nfrom scipy.stats import norm\n\nmu0, xbar, sigma, n = 50, 52, 8, 64\nalpha = 0.05\nz = (xbar - mu0) / (sigma / np.sqrt(n))\np_value = norm.sf(z)\nprint(\"z =\", z)\nprint(\"p-value =\", p_value)\nprint(\"Decision:\", \"Reject H0\" if p_value <= alpha else \"Fail to reject H0\")",
  "out": "z = 2.0\np-value = 0.022750131948179198\nDecision: Reject H0"
 },
 "p23": {
  "code": "import numpy as np\nfrom scipy.stats import norm\n\nmu0, xbar, sigma, n = 1000, 970, 90, 36\nalpha = 0.05\nz = (xbar - mu0) / (sigma / np.sqrt(n))\np_value = norm.cdf(z)\nprint(\"z =\", z)\nprint(\"p-value =\", p_value)\nprint(\"Decision:\", \"Reject H0\" if p_value <= alpha else \"Fail to reject H0\")",
  "out": "z = -2.0\np-value = 0.022750131948179198\nDecision: Reject H0"
 },
 "p24": {
  "code": "import numpy as np\nfrom scipy.stats import norm\n\nmu0, xbar, sigma, n = 500, 496, 20, 100\nalpha = 0.05\nz = (xbar - mu0) / (sigma / np.sqrt(n))\ncritical = norm.ppf(1 - alpha/2)\nprint(\"z =\", z)\nprint(\"Critical values =\", (-critical, critical))\nif z < -critical or z > critical:\n    print(\"Reject H0\")\nelse:\n    print(\"Fail to reject H0\")",
  "out": "z = -2.0\nCritical values = (np.float64(-1.959963984540054), np.float64(1.959963984540054))\nReject H0"
 },
 "p25": {
  "code": "import numpy as np\nfrom scipy.stats import norm\n\nmu0, xbar, sigma, n = 50, 52, 8, 64\nalpha = 0.05\nz = (xbar - mu0) / (sigma / np.sqrt(n))\ncritical = norm.ppf(1 - alpha)\nprint(\"z =\", z)\nprint(\"Critical value =\", critical)\nprint(\"Decision:\", \"Reject H0\" if z > critical else \"Fail to reject H0\")",
  "out": "z = 2.0\nCritical value = 1.644853626951472\nDecision: Reject H0"
 },
 "p26": {
  "code": "import numpy as np\nfrom scipy.stats import ttest_1samp\n\ndata = np.array([48, 51, 52, 49, 50, 53, 47, 52])\nmu0 = 50\nresult = ttest_1samp(data, popmean=mu0)\nprint(\"t statistic:\", result.statistic)\nprint(\"Two-sided p-value:\", result.pvalue)",
  "out": "t statistic: 0.3333333333333333\nTwo-sided p-value: 0.7486445487540937"
 },
 "p27": {
  "code": "import numpy as np\nfrom scipy.stats import chisquare\n\nobserved = np.array([18, 22, 27, 33])\nexpected = np.array([25, 25, 25, 25])\nchi2, p = chisquare(f_obs=observed, f_exp=expected)\nprint(\"Chi-square:\", chi2)\nprint(\"p-value:\", p)",
  "out": "Chi-square: 5.04\np-value: 0.16889147065779933"
 },
 "p28": {
  "code": "import numpy as np\nfrom scipy.stats import chi2_contingency\n\nobserved = np.array([[30, 20],\n                     [20, 30]])\nchi2, p, dof, expected = chi2_contingency(observed, correction=False)\nprint(\"Chi-square:\", chi2)\nprint(\"p-value:\", p)\nprint(\"Degrees of freedom:\", dof)\nprint(\"Expected counts:\")\nprint(expected)",
  "out": "Chi-square: 4.0\np-value: 0.045500263896358445\nDegrees of freedom: 1\nExpected counts:\n[[25. 25.]\n [25. 25.]]"
 },
 "p29": {
  "code": "from scipy.stats import f_oneway\n\nA = [8, 9, 10]\nB = [11, 12, 13]\nC = [14, 15, 16]\nF, p = f_oneway(A, B, C)\nprint(\"F statistic:\", F)\nprint(\"p-value:\", p)",
  "out": "F statistic: 27.0\np-value: 0.0010000000000000002"
 },
 "p30": {
  "code": "import numpy as np\n\nv = np.array([2, 1])\nA = np.array([[1, 2],\n              [3, 4]])\nprint(\"Vector:\", v)\nprint(\"Matrix:\")\nprint(A)\nprint(\"Shape of A:\", A.shape)",
  "out": "Vector: [2 1]\nMatrix:\n[[1 2]\n [3 4]]\nShape of A: (2, 2)"
 },
 "p31": {
  "code": "import numpy as np\n\nu = np.array([2, 1])\nv = np.array([3, -2])\nprint(\"u + v =\", u + v)\nprint(\"2u =\", 2*u)\nprint(\"Dot product =\", np.dot(u, v))\nprint(\"Norm of u =\", np.linalg.norm(u))",
  "out": "u + v = [ 5 -1]\n2u = [4 2]\nDot product = 4\nNorm of u = 2.23606797749979"
 },
 "p32": {
  "code": "import numpy as np\n\nA = np.array([[1, 2], [3, 4]])\nB = np.array([[2, 0], [1, 5]])\nprint(\"A + B:\")\nprint(A + B)\nprint(\"A @ B:\")\nprint(A @ B)\nprint(\"Transpose of A:\")\nprint(A.T)\nprint(\"A * B (element-wise, NOT the matrix product):\")\nprint(A * B)",
  "out": "A + B:\n[[3 2]\n [4 9]]\nA @ B:\n[[ 4 10]\n [10 20]]\nTranspose of A:\n[[1 3]\n [2 4]]\nA * B (element-wise, NOT the matrix product):\n[[ 2  0]\n [ 3 20]]"
 },
 "p33": {
  "code": "import numpy as np\n\nA = np.array([[4, 2],\n              [1, 3]], dtype=float)\nprint(\"Determinant:\", np.linalg.det(A))\nprint(\"Inverse:\")\nprint(np.linalg.inv(A))\nprint(\"Rank:\", np.linalg.matrix_rank(A))",
  "out": "Determinant: 10.000000000000002\nInverse:\n[[ 0.3 -0.2]\n [-0.1  0.4]]\nRank: 2"
 },
 "p34": {
  "code": "import numpy as np\n\nA = np.array([[1, 2, 3],\n              [2, 4, 6],\n              [1, 1, 1]])\nprint(\"Rank =\", np.linalg.matrix_rank(A))",
  "out": "Rank = 2"
 },
 "p35": {
  "code": "import numpy as np\n\nA = np.array([[4, 1],\n              [2, 3]], dtype=float)\neigenvalues, eigenvectors = np.linalg.eig(A)\nprint(\"Eigenvalues:\")\nprint(eigenvalues)\nprint(\"Eigenvectors (stored as columns):\")\nprint(eigenvectors)",
  "out": "Eigenvalues:\n[5. 2.]\nEigenvectors (stored as columns):\n[[ 0.70710678 -0.4472136 ]\n [ 0.70710678  0.89442719]]"
 },
 "p36": {
  "code": "import numpy as np\n\nA = np.array([[4, 1],\n              [2, 3]], dtype=float)\nlam = 5\nv = np.array([1, 1], dtype=float)\nprint(\"Av =\", A @ v)\nprint(\"lambda*v =\", lam * v)\nprint(\"Equal?\", np.allclose(A @ v, lam*v))",
  "out": "Av = [5. 5.]\nlambda*v = [5. 5.]\nEqual? True"
 },
 "p37": {
  "code": "import numpy as np\n\nv = np.array([2, 3])\nS = np.array([[2, 0],\n              [0, 0.5]])\nprint(\"Scaled vector:\", S @ v)",
  "out": "Scaled vector: [4.  1.5]"
 },
 "p38": {
  "code": "import numpy as np\n\ntheta = np.deg2rad(90)\nR = np.array([[np.cos(theta), -np.sin(theta)],\n              [np.sin(theta),  np.cos(theta)]])\nv = np.array([1, 0])\nprint(\"Raw R @ v:\", R @ v)\nprint(\"Rotated vector:\", np.round(R @ v, 10))",
  "out": "Raw R @ v: [6.123234e-17 1.000000e+00]\nRotated vector: [0. 1.]"
 },
 "p39": {
  "code": "import numpy as np\n\nP = np.array([[1, 0],\n              [0, 0]])\nv = np.array([3, 4])\nprint(\"Projection:\", P @ v)",
  "out": "Projection: [3 0]"
 },
 "p40": {
  "code": "import numpy as np\n\nu = np.array([1, 1], dtype=float)\nu = u / np.linalg.norm(u)\nP = np.outer(u, u)\nv = np.array([3, 1], dtype=float)\nprint(\"Projection matrix:\")\nprint(P)\nprint(\"Projected vector:\", P @ v)",
  "out": "Projection matrix:\n[[0.5 0.5]\n [0.5 0.5]]\nProjected vector: [2. 2.]"
 },
 "p41": {
  "code": "import numpy as np\n\nT = np.array([[1, 0],\n              [0, -1]])\nv = np.array([2, -3])\nprint(\"Reflected vector:\", T @ v)",
  "out": "Reflected vector: [2 3]"
 },
 "p42": {
  "code": "import numpy as np\n\nv = np.array([1, 2], dtype=float)\nS = np.array([[2, 0],\n              [0, 1]])\ntheta = np.deg2rad(90)\nR = np.array([[np.cos(theta), -np.sin(theta)],\n              [np.sin(theta),  np.cos(theta)]])\nresult = R @ S @ v\nprint(\"Final vector:\", np.round(result, 10))",
  "out": "Final vector: [-2.  2.]"
 },
 "p43": {
  "code": "import numpy as np\n\nX = np.array([[2, 1],\n              [3, 2],\n              [4, 3]], dtype=float)\n\n# 1. Center\nmean = X.mean(axis=0)\nXc = X - mean\n# 2. Covariance\nC = np.cov(Xc, rowvar=False)\n# 3. Eigenvalues/eigenvectors\nvalues, vectors = np.linalg.eigh(C)\n# 4. Sort descending\norder = np.argsort(values)[::-1]\nvalues = values[order]\nvectors = vectors[:, order]\n# 5. First principal component\npc1 = vectors[:, 0]\nscores = Xc @ pc1\n\nprint(\"Mean:\", mean)\nprint(\"Centered data:\")\nprint(Xc)\nprint(\"Covariance:\")\nprint(C)\nprint(\"Eigenvalues:\", values)\nprint(\"PC1:\", pc1)\nprint(\"PC1 scores:\", scores)\nprint(\"Explained variance ratio:\", values / values.sum())",
  "out": "Mean: [3. 2.]\nCentered data:\n[[-1. -1.]\n [ 0.  0.]\n [ 1.  1.]]\nCovariance:\n[[1. 1.]\n [1. 1.]]\nEigenvalues: [2. 0.]\nPC1: [0.70710678 0.70710678]\nPC1 scores: [-1.41421356  0.          1.41421356]\nExplained variance ratio: [1. 0.]"
 },
 "p44": {
  "code": "import numpy as np\nfrom sklearn.decomposition import PCA\n\nX = np.array([[2, 1],\n              [3, 2],\n              [4, 3]], dtype=float)\npca = PCA(n_components=1)\nZ = pca.fit_transform(X)\nprint(\"PC direction:\", pca.components_)\nprint(\"Transformed data:\")\nprint(Z)\nprint(\"Explained variance:\", pca.explained_variance_)\nprint(\"Explained variance ratio:\", pca.explained_variance_ratio_)",
  "out": "PC direction: [[0.70710678 0.70710678]]\nTransformed data:\n[[-1.41421356]\n [ 0.        ]\n [ 1.41421356]]\nExplained variance: [2.]\nExplained variance ratio: [1.]"
 },
 "p45": {
  "code": "import numpy as np\nfrom sklearn.decomposition import PCA\n\nX = np.array([[2.5, 2.4],\n              [0.5, 0.7],\n              [2.2, 2.9],\n              [1.9, 2.2],\n              [3.1, 3.0]])\npca = PCA(n_components=2)\nZ = pca.fit_transform(X)\nprint(\"Principal component directions:\")\nprint(pca.components_)\nprint(\"Explained variance ratios:\")\nprint(pca.explained_variance_ratio_)\nprint(\"Transformed observations:\")\nprint(Z)",
  "out": "Principal component directions:\n[[ 0.72474155  0.68902082]\n [-0.68902082  0.72474155]]\nExplained variance ratios:\n[0.96989047 0.03010953]\nTransformed observations:\n[[ 0.44362444 -0.20099093]\n [-2.17719404 -0.05500992]\n [ 0.57071239  0.36808609]\n [-0.12902465  0.06747325]\n [ 1.29188186 -0.17955849]]"
 },
 "q01": {
  "code": "import numpy as np\n\nd = np.array([12, 15, 11, 19, 14, 18, 13, 17])\nq1, q3 = np.percentile(d, [25, 75])\nprint(\"Mean   :\", np.mean(d))\nprint(\"Median :\", np.median(d))\nprint(\"Sample SD:\", np.std(d, ddof=1))\nprint(\"Q1, Q3 :\", q1, q3, \" IQR:\", q3 - q1)",
  "out": "Mean   : 14.875\nMedian : 14.5\nSample SD: 2.9001231500945415\nQ1, Q3 : 12.75 17.25  IQR: 4.5"
 },
 "q02": {
  "code": "from scipy.stats import binom\n\nn, p = 8, 0.1\nprint(\"P(X=0) :\", binom.pmf(0, n, p))\nprint(\"P(X>=2):\", binom.sf(1, n, p))\nprint(\"P(X<=2):\", binom.cdf(2, n, p))",
  "out": "P(X=0) : 0.4304672099999999\nP(X>=2): 0.18689527000000009\nP(X<=2): 0.9619082099999999"
 },
 "q03": {
  "code": "from scipy.stats import poisson\n\nlam = 2\nprint(\"P(X<=1):\", poisson.cdf(1, lam))\nprint(\"P(X>=2):\", poisson.sf(1, lam))",
  "out": "P(X<=1): 0.40600584970983794\nP(X>=2): 0.5939941502901616"
 },
 "q04": {
  "code": "from scipy.stats import norm\n\nprint(\"P(65<X<75):\", norm.cdf(75, 70, 10) - norm.cdf(65, 70, 10))\nprint(\"25th percentile:\", norm.ppf(0.25, 70, 10))",
  "out": "P(65<X<75): 0.38292492254802624\n25th percentile: 63.255102498039186"
 },
 "q05": {
  "code": "import numpy as np\nfrom scipy import stats\n\nm = np.array([5.1, 4.9, 5.3, 5.0, 5.2, 4.8])\nxbar, se = m.mean(), stats.sem(m)          # sem uses ddof=1\nlow, high = stats.t.interval(0.95, df=len(m) - 1, loc=xbar, scale=se)\nprint(\"mean =\", xbar, \" SE =\", se)\nprint(f\"95% CI = ({low:.4f}, {high:.4f})\")",
  "out": "mean = 5.05  SE = 0.07637626158259732\n95% CI = (4.8537, 5.2463)"
 },
 "q06": {
  "code": "from scipy.stats import binom\n\n# WRONG: sf(3) is P(X > 3), not P(X >= 3)\nprint(\"wrong  :\", binom.sf(3, 10, 0.4))\n# RIGHT: P(X >= 3) = sf(3 - 1)\nprint(\"correct:\", binom.sf(2, 10, 0.4))",
  "out": "wrong  : 0.6177193984000001\ncorrect: 0.8327102464"
 },
 "q07": {
  "code": "from scipy.stats import f_oneway\n\nA = [5, 7, 9]\nB = [6, 8, 10]\nC = [9, 11, 13]\nF, p = f_oneway(A, B, C)\nprint(\"F =\", F, \" p-value =\", p)\nprint(\"Reject H0\" if p <= 0.05 else \"Fail to reject H0\")",
  "out": "F = 3.25  p-value = 0.11059199999999998\nFail to reject H0"
 },
 "q08": {
  "code": "import numpy as np\n\nA = np.array([[1, 2, 3],\n              [4, 5, 6]])        # 2 x 3\nB = np.array([[1, 0],\n              [0, 1],\n              [2, 2]])           # 3 x 2\nC = A @ B                        # inner sizes 3 and 3 match -> (2 x 2)\nprint(C)\nprint(\"shape:\", C.shape)",
  "out": "[[ 7  8]\n [16 17]]\nshape: (2, 2)"
 },
 "q09": {
  "code": "from scipy.stats import chisquare, chi2\n\nobserved = [8, 12, 9, 11, 10, 10]        # 60 rolls of a die\nchi2_stat, p = chisquare(observed)       # default: equal expected counts (10 each)\nprint(\"chi-square =\", chi2_stat, \" p-value =\", p)\nprint(\"critical value (df=5, 5%):\", chi2.ppf(0.95, df=5))",
  "out": "chi-square = 1.0  p-value = 0.9625657732472964\ncritical value (df=5, 5%): 11.070497693516351"
 },
 "q10": {
  "code": "import numpy as np\nfrom scipy.stats import chi2_contingency\n\nobserved = np.array([[30, 20],\n                     [20, 30]])\nchi2_default, p_default, dof, _ = chi2_contingency(observed)                    # Yates correction ON for 2x2\nchi2_plain, p_plain, _, _ = chi2_contingency(observed, correction=False)\nprint(\"with correction   :\", chi2_default, p_default)\nprint(\"without correction:\", chi2_plain, p_plain)",
  "out": "with correction   : 3.24 0.0718606382258515\nwithout correction: 4.0 0.045500263896358445"
 },
 "t01": {
  "code": "import numpy as np\nfrom scipy import stats\n\ndata = np.array([5, 7, 7, 8, 10, 12])\nprint(\"Mean:\", np.mean(data))\nprint(\"Median:\", np.median(data))\nprint(\"Mode:\", stats.mode(data, keepdims=False).mode)\nprint(\"Sample variance:\", np.var(data, ddof=1))\nprint(\"Sample SD:\", np.std(data, ddof=1))",
  "out": "Mean: 8.166666666666666\nMedian: 7.5\nMode: 7\nSample variance: 6.166666666666666\nSample SD: 2.48327740429189"
 },
 "t02": {
  "code": "from scipy.stats import bernoulli\n\np = 0.8\nprint(\"P(X=1):\", bernoulli.pmf(1, p))\nprint(\"P(X=0):\", bernoulli.pmf(0, p))\ntrials = bernoulli.rvs(p, size=10, random_state=7)\nprint(\"10 simulated trials:\", trials, \" successes:\", trials.sum())",
  "out": "P(X=1): 0.8\nP(X=0): 0.19999999999999993\n10 simulated trials: [1 1 1 1 0 1 1 1 1 1]  successes: 9"
 },
 "t03": {
  "code": "from scipy.stats import binom\n\nn, p = 12, 0.3\nprint(\"P(X=4) :\", binom.pmf(4, n, p))\nprint(\"P(X<=4):\", binom.cdf(4, n, p))\nprint(\"P(X>=5):\", binom.sf(4, n, p))   # = 1 - cdf(4)",
  "out": "P(X=4) : 0.23113969609499996\nP(X<=4): 0.7236554695300002\nP(X>=5): 0.2763445304699998"
 },
 "t04": {
  "code": "from scipy.stats import poisson\n\nlam = 2.5\nprint(\"P(X=0) :\", poisson.pmf(0, lam))\nprint(\"P(X<=3):\", poisson.cdf(3, lam))\nprint(\"P(X>3) :\", poisson.sf(3, lam))",
  "out": "P(X=0) : 0.0820849986238988\nP(X<=3): 0.7575761331330662\nP(X>3) : 0.2424238668669339"
 },
 "t05": {
  "code": "from scipy.stats import norm\n\nmu, sigma = 70, 10\nprint(\"P(X<60)      :\", norm.cdf(60, mu, sigma))\nprint(\"P(60<X<80)   :\", norm.cdf(80, mu, sigma) - norm.cdf(60, mu, sigma))\nprint(\"90th percentile:\", norm.ppf(0.90, mu, sigma))",
  "out": "P(X<60)      : 0.15865525393145707\nP(60<X<80)   : 0.6826894921370859\n90th percentile: 82.815515655446"
 },
 "t06": {
  "code": "import numpy as np\nfrom scipy.stats import norm\n\nxbar, sigma, n = 80, 12, 100\nz = norm.ppf(1 - 0.01/2)          # 99% two-sided -> alpha/2 = 0.005\nse = sigma / np.sqrt(n)\nprint(\"z =\", z, \" SE =\", se)\nprint(\"99% CI:\", (xbar - z*se, xbar + z*se))",
  "out": "z = 2.5758293035489004  SE = 1.2\n99% CI: (np.float64(76.90900483574131), np.float64(83.09099516425869))"
 },
 "t07": {
  "code": "import numpy as np\nfrom scipy.stats import norm\n\nxbar, sigma, n = 40, 6, 36\nz = norm.ppf(0.95)                # one-sided -> all 5% in one tail\nlower = xbar - z * sigma/np.sqrt(n)\nprint(\"z =\", z)\nprint(\"95% lower bound:\", lower, \" -> interval (\", lower, \", infinity)\")",
  "out": "z = 1.644853626951472\n95% lower bound: 38.35514637304853  -> interval ( 38.35514637304853 , infinity)"
 },
 "t08": {
  "code": "import numpy as np\nfrom scipy.stats import norm\n\nx, n = 180, 300\nphat = x / n\nz = norm.ppf(0.975)\nse = np.sqrt(phat*(1 - phat)/n)\nprint(\"p-hat =\", phat, \" SE =\", se)\nprint(\"95% CI:\", (phat - z*se, phat + z*se))",
  "out": "p-hat = 0.6  SE = 0.0282842712474619\n95% CI: (np.float64(0.5445638470260129), np.float64(0.655436152973987))"
 },
 "t09": {
  "code": "import numpy as np\nfrom scipy.stats import norm\n\nmu0, xbar, sigma, n, alpha = 25, 27, 8, 64, 0.05\nz = (xbar - mu0) / (sigma/np.sqrt(n))\np_value = 2 * norm.sf(abs(z))\nzc = norm.ppf(1 - alpha/2)\nprint(\"z =\", z)\nprint(\"p-value =\", p_value, \"->\", \"reject H0\" if p_value <= alpha else \"do not reject H0\")\nprint(\"critical values = +/-\", zc, \"->\", \"reject H0\" if abs(z) > zc else \"do not reject H0\")",
  "out": "z = 2.0\np-value = 0.045500263896358396 -> reject H0\ncritical values = +/- 1.959963984540054 -> reject H0"
 },
 "t10": {
  "code": "import numpy as np\nfrom scipy.stats import norm\n\nmu0, xbar, sigma, n, alpha = 100, 96, 10, 25, 0.05\nz = (xbar - mu0) / (sigma/np.sqrt(n))\np_value = norm.cdf(z)             # left-tailed\nzc = norm.ppf(alpha)              # negative critical value\nprint(\"z =\", z, \" p-value =\", p_value)\nprint(\"critical value =\", zc, \"->\", \"reject H0\" if z < zc else \"do not reject H0\")",
  "out": "z = -2.0  p-value = 0.022750131948179198\ncritical value = -1.6448536269514729 -> reject H0"
 },
 "t11": {
  "code": "import numpy as np\n\nA = np.array([[2, 1],\n              [5, 3]], dtype=float)\nprint(\"det  =\", np.linalg.det(A))\nprint(\"inv  =\")\nprint(np.linalg.inv(A))\nprint(\"rank =\", np.linalg.matrix_rank(A))\nprint(\"check A @ inv(A):\")\nprint(np.round(A @ np.linalg.inv(A), 10))",
  "out": "det  = 1.0000000000000002\ninv  =\n[[ 3. -1.]\n [-5.  2.]]\nrank = 2\ncheck A @ inv(A):\n[[ 1.  0.]\n [-0.  1.]]"
 },
 "t12": {
  "code": "import numpy as np\n\nA = np.array([[2, 1],\n              [1, 2]], dtype=float)\nvalues, vectors = np.linalg.eig(A)\nprint(\"eigenvalues:\", values)\nprint(\"eigenvectors (columns):\")\nprint(vectors)\n# verify the first eigenpair: A v = lambda v\nv0 = vectors[:, 0]\nprint(\"A @ v0      =\", A @ v0)\nprint(\"lambda * v0 =\", values[0] * v0)\nprint(\"allclose?\", np.allclose(A @ v0, values[0] * v0))",
  "out": "eigenvalues: [3. 1.]\neigenvectors (columns):\n[[ 0.70710678 -0.70710678]\n [ 0.70710678  0.70710678]]\nA @ v0      = [2.12132034 2.12132034]\nlambda * v0 = [2.12132034 2.12132034]\nallclose? True"
 },
 "t13": {
  "code": "import numpy as np\n\ntheta = np.deg2rad(45)\nR = np.array([[np.cos(theta), -np.sin(theta)],\n              [np.sin(theta),  np.cos(theta)]])\nv = np.array([2, 0])\nprint(\"Rotated:\", R @ v)",
  "out": "Rotated: [1.41421356 1.41421356]"
 },
 "t14": {
  "code": "import numpy as np\n\nv = np.array([4, 2], dtype=float)\nu = np.array([1, 1], dtype=float)\nu = u / np.linalg.norm(u)         # unit vector along [1, 1]\nP = np.outer(u, u)                # projection matrix u u^T\nprint(\"P =\")\nprint(P)\nprint(\"projection of [4,2]:\", P @ v)\nprint(\"same by formula (v.u)u:\", (v @ u) * u)",
  "out": "P =\n[[0.5 0.5]\n [0.5 0.5]]\nprojection of [4,2]: [3. 3.]\nsame by formula (v.u)u: [3. 3.]"
 },
 "t15": {
  "code": "import numpy as np\n\nT = np.array([[-1, 0],\n              [ 0, 1]])           # reflection across the y-axis\nv = np.array([-3, 5])\nprint(\"Reflected:\", T @ v)",
  "out": "Reflected: [3 5]"
 },
 "t16": {
  "code": "import numpy as np\nfrom sklearn.decomposition import PCA\n\nX = np.array([[1, 1], [2, 2], [3, 3], [4, 4]], dtype=float)\n\n# manual\nXc = X - X.mean(axis=0)\nC = np.cov(Xc, rowvar=False)\nvalues, vectors = np.linalg.eigh(C)\norder = np.argsort(values)[::-1]\nvalues, vectors = values[order], vectors[:, order]\nprint(\"Covariance:\")\nprint(C)\nprint(\"Manual eigenvalues:\", np.round(values, 10))\nprint(\"Manual explained ratio:\", np.round(values / values.sum(), 10))\nprint(\"Manual PC1 (up to sign):\", vectors[:, 0])\n\n# scikit-learn\npca = PCA(n_components=2).fit(X)\nprint(\"sklearn explained variance:\", np.round(pca.explained_variance_, 10))\nprint(\"sklearn explained ratio   :\", np.round(pca.explained_variance_ratio_, 10))\nprint(\"sklearn PC1:\", pca.components_[0])",
  "out": "Covariance:\n[[1.66666667 1.66666667]\n [1.66666667 1.66666667]]\nManual eigenvalues: [3.33333333 0.        ]\nManual explained ratio: [1. 0.]\nManual PC1 (up to sign): [0.70710678 0.70710678]\nsklearn explained variance: [3.33333333 0.        ]\nsklearn explained ratio   : [1. 0.]\nsklearn PC1: [0.70710678 0.70710678]"
 },
 "x01": {
  "code": "import numpy as np\nfrom scipy import stats\n\ndata = np.array([10, 12, 12, 14, 15, 17, 20])\nq1, q3 = np.percentile(data, [25, 75])\nprint(\"Q1, Q3:\", q1, q3)\nprint(\"mean/median/sd:\", data.mean(), np.median(data), data.std(ddof=1))\nprint(\"skew:\", stats.skew(data), \" kurtosis (excess):\", stats.kurtosis(data))\nprint(\"trimmed mean 10%:\", stats.trim_mean(data, 0.1))",
  "out": "Q1, Q3: 12.0 16.0\nmean/median/sd: 14.285714285714286 14.0 3.401680257083045\nskew: 0.4771296892664072  kurtosis (excess): -0.8032566173855606\ntrimmed mean 10%: 14.285714285714286"
 },
 "x02": {
  "code": "import numpy as np\n\n# quartile conventions on the same data\ndata = [4, 7, 8, 10, 12, 15, 18, 21]\nfor method in [\"linear\", \"lower\", \"higher\", \"midpoint\", \"nearest\", \"weibull\"]:\n    print(f\"{method:9s}\", np.percentile(data, [25, 75], method=method))",
  "out": "linear    [ 7.75 15.75]\nlower     [ 7 15]\nhigher    [ 8 18]\nmidpoint  [ 7.5 16.5]\nnearest   [ 8 15]\nweibull   [ 7.25 17.25]"
 },
 "x03": {
  "code": "import pandas as pd\n\ndf = pd.DataFrame({\"score\": [62, 70, 75, 75, 81, 84, 90, 93],\n                   \"hours\": [2, 3, 4, 4, 5, 6, 7, 8]})\nprint(df.describe())\nprint(df.corr())\nprint(df.cov())",
  "out": "           score    hours\ncount   8.000000  8.00000\nmean   78.750000  4.87500\nstd    10.333717  2.03101\nmin    62.000000  2.00000\n25%    73.750000  3.75000\n50%    78.000000  4.50000\n75%    85.500000  6.25000\nmax    93.000000  8.00000\n          score     hours\nscore  1.000000  0.992069\nhours  0.992069  1.000000\n            score      hours\nscore  106.785714  20.821429\nhours   20.821429   4.125000"
 }
};

const NB = '\u00a0';
// For problem solutions (no code block there): one `code` span per line, indentation kept with non-breaking spaces.
const fmt = (key) => String(PROG[key].code).split('\n').map((l) => {
  const t = l.replace(/\s+$/, '');
  if (t.trim() === '') return '';
  return '`' + t.replace(/^ +/, (m) => NB.repeat(m.length)).replace(/ {2,}/g, (m) => NB.repeat(m.length)) + '`';
}).join('\n');
// Moves each MCQ's correct option to a chosen position so answers are spread over A-D.
const place = (qs, targets) => qs.map((q, i) => { const t = targets[i % targets.length]; if (q.answer === t) return q; const o = [...q.options]; [o[q.answer], o[t]] = [o[t], o[q.answer]]; return { ...q, options: o, answer: t }; });
const code = (key, title) => ({ t: 'code', lang: 'python', title: title, code: PROG[key].code.replace(/\s+$/, ''), output: PROG[key].out.replace(/\s+$/, '') });
// A full program: heading, goal, then the code block with its real printed output.
const prog = (key, title, goal) => [{ t: 'h', text: title }, { t: 'p', text: '**Goal.** ' + goal }, code(key)];

export default {
  id: 'python-lab',
  order: 23,
  part: 'G',
  title: 'Python Lab: SciPy, NumPy & Pandas Programs',
  short: 'All 45 lab programs, the 16 practice tasks and the ESA Section C practical answers, with real printed output.',
  summary: 'Every statistics, probability, linear algebra and PCA program from the lab sheet, with the indentation restored, the output actually run, and a hand check of each number. After this chapter you can pick the right SciPy, NumPy or pandas call for a question and write a mark-sized exam answer for each ESA practical (Q13 to Q25).',
  minutes: 90,
  source: ['Practice doc', 'Extra'],
  pages: [
    {
      id: 'setup-descriptive',
      title: 'Setup & descriptive statistics',
      blocks: [
        { t: 'p', text: 'The ESA has a **practical section** (Section C, Q13 to Q25, 2 to 5 marks each) where you write short Python programs. You are not asked to invent algorithms. You are asked to **pick the right library call, feed it the data, and print a labelled result**. This chapter is built around that: every program from the lab sheet is shown with its indentation restored, the **real printed output**, and a hand check so you know the number is right.' },
        { t: 'h', text: 'The five libraries' },
        { t: 'table', head: ['Library', 'Used for', 'Import line'], rows: [
          ['NumPy', 'Arrays, matrices, linear algebra, mean and variance', '`import numpy as np`'],
          ['Pandas', 'Tabular data and descriptive statistics', '`import pandas as pd`'],
          ['SciPy stats', 'Distributions, confidence intervals, hypothesis tests', '`from scipy import stats`'],
          ['Matplotlib', 'Simple plots (histogram, boxplot, density curve)', '`import matplotlib.pyplot as plt`'],
          ['scikit-learn', 'PCA (and `train_test_split` for stratified samples)', '`from sklearn.decomposition import PCA`'],
        ] },
        { t: 'p', text: 'Install once (not needed in most lab machines): `pip install numpy pandas scipy matplotlib scikit-learn`. Then start every program with the imports it uses.' },
        { t: 'callout', kind: 'tip', title: 'How each program in this chapter is laid out', text: '**Goal** (what is being computed), then the **code**, then the **printed output** in the output panel under the code. Beneath it, a short **what to notice** and a hand check. Type the code yourself at least once: reading it is not the same as being able to write it in an exam.' },
        { t: 'callout', kind: 'warn', title: 'Outputs depend on versions only in their look', text: 'The printed outputs here were produced with NumPy 2.0, SciPy 1.13, pandas 2.3 and scikit-learn 1.6. **NumPy 2 prints numbers inside a tuple as `np.float64(48.04...)`** (you will see this for confidence intervals printed as a tuple). With NumPy 1.x the same line shows plain `48.04...`. The numbers are identical; only the wrapper differs. Random simulations (`rvs`) can also give a different 0/1 string on another SciPy version, so never copy a simulated string into an answer.' },
        { t: 'callout', kind: 'exam', title: 'Remember', text: 'Import first, name your data, call the library function, **print with a label**. A bare number with no label loses marks in a written practical.' },
      ],
    },
    {
      id: 'descriptive-programs',
      title: 'Descriptive statistics (Programs 1 to 4)',
      blocks: [
        { t: 'p', text: 'These four programs compute the numbers from the descriptive-statistics chapters: centre, spread, quartiles, and the relationship between two variables.' },
        ...prog('p01', 'Program 1: mean, median, mode, variance and SD', 'Compute basic descriptive statistics for one dataset.'),
        { t: 'callout', kind: 'why', title: 'What to notice', text: '`ddof=1` makes NumPy divide by $n-1$ (**sample** variance and SD). Without it NumPy divides by $n$ (**population**). `np.var(data)` here would give $69.43/7=9.918$ instead of $11.571$. And `keepdims=False` in `stats.mode` returns a plain number; without it older SciPy versions return arrays.' },
        { t: 'example', title: 'Hand check of Program 1', q: 'Verify the printed mean, variance and SD for 10, 12, 12, 14, 15, 17, 20.',
          steps: ['Sum $=100$, $n=7$, so mean $=100/7=14.2857$. Median is the 4th of 7 sorted values: **14**. The value 12 appears twice: mode **12**. Range $=20-10=10$.',
            'Squared deviations from 14.2857: $18.367,\\ 5.224,\\ 5.224,\\ 0.082,\\ 0.510,\\ 7.367,\\ 32.653$. Their sum is $69.429$.',
            'Sample variance $=69.429/(7-1)=11.571$, and sample SD $=\\sqrt{11.571}=3.4017$. Both match the output.'],
          ans: 'Mean 14.2857, median 14, mode 12, range 10, $s^2=11.5714$, $s=3.4017$.' },
        ...prog('p02', 'Program 2: summary with pandas', 'Generate count, mean, SD, quartiles, min and max in one call.'),
        { t: 'table', title: 'Reading `describe()`', head: ['Row', 'Meaning', 'Check for 62, 70, 75, 75, 81, 84, 90, 93'], rows: [
          ['count', 'Number of values', '8'],
          ['mean', 'Arithmetic mean', '$630/8=78.75$'],
          ['std', '**Sample** SD (divides by $n-1$)', '$10.3337$'],
          ['min, max', 'Smallest and largest', '62 and 93'],
          ['25%, 50%, 75%', 'Q1, median, Q3 using **linear interpolation**', '73.75, 78, 85.5'],
        ] },
        { t: 'p', text: 'The 25% row uses position $0.25\\times(n-1)=0.25\\times 7=1.75$ in the sorted list (counting from 0): that lies three quarters of the way from 70 (position 1) to 75 (position 2), so $70+0.75\\times 5=73.75$. This is the same method as `np.percentile`, which is why the next program and `describe()` always agree.' },
        ...prog('p03', 'Program 3: quartiles and IQR', 'Find Q1, Q3 and the interquartile range.'),
        { t: 'callout', kind: 'warn', title: 'Quartile convention warning: NumPy is not the class method', text: 'For 4, 7, 8, 10, 12, 15, 18, 21 NumPy gives **Q1 = 7.75, Q3 = 15.75, IQR = 8**. Your class notes and the practice document give different numbers for the same data, because there is no single universal definition of a quartile. See the table below. In the exam, **say which convention you are using**; if the question says "write Python code", NumPy’s answer is the expected output.' },
        { t: 'table', title: 'Same data (4, 7, 8, 10, 12, 15, 18, 21, $n=8$), three conventions', head: ['Method', 'How the position is found', 'Q1', 'Q3', 'IQR'], rows: [
          ['NumPy / pandas default (`linear`)', 'position $p(n-1)$ counting from 0, interpolate', '7.75', '15.75', '8'],
          ['Median of halves (practice document)', 'median of lower four 4,7,8,10 and upper four 12,15,18,21', '7.5', '16.5', '9'],
          ['Class notes, $p(n+1)$ (NumPy `method="weibull"`)', 'position $p(n+1)$ counting from 1, interpolate: $2.25$ and $6.75$', '7.25', '17.25', '10'],
        ] },
        { t: 'p', text: 'You can ask NumPy for each convention with the `method` argument. The real output on the same data:' },
        code('x02'),
        { t: 'p', text: 'Read the table: `linear` is the default (7.75, 15.75), `weibull` reproduces the class-notes $(n+1)p$ answer (7.25, 17.25), and `midpoint` happens to equal median-of-halves here (7.5, 16.5). For the chapter on quartiles by hand, see /ch/quartiles-boxplot/0.' },
        ...prog('p04', 'Program 4: covariance and correlation', 'Measure how two numerical variables vary together.'),
        { t: 'callout', kind: 'why', title: 'What to notice', text: '`np.cov(x, y)` returns a **2 by 2 matrix**: the diagonal holds the variances ($2.5$ and $10.2$) and the off-diagonal entry is the covariance ($5.0$). `np.corrcoef` returns the matrix of correlations: the diagonal is always 1 and the off-diagonal is $r=0.9901$. To get a single number, index it: `np.corrcoef(x, y)[0, 1]`.' },
        { t: 'example', title: 'Hand check of Program 4', q: 'x = 1, 2, 3, 4, 5 and y = 2, 4, 5, 8, 10. Verify Cov(x, y) and r.',
          steps: ['$\\bar{x}=3$, $\\bar{y}=29/5=5.8$.', '$\\sum (x_i-\\bar{x})(y_i-\\bar{y})=(-2)(-3.8)+(-1)(-1.8)+0+(1)(2.2)+(2)(4.2)=7.6+1.8+0+2.2+8.4=20$. Sample covariance $=20/4=5$.', '$s_x^2=10/4=2.5$ and $s_y^2=40.8/4=10.2$.', '$r=\\dfrac{5}{\\sqrt{2.5\\times 10.2}}=\\dfrac{5}{5.0498}=0.9901$.'],
          ans: 'Cov = 5, $r=0.9901$: a very strong positive linear relationship.' },
        { t: 'h', text: 'Three more descriptive helpers' },
        code('x01'),
        { t: 'p', text: '`stats.skew` measures asymmetry (positive = long right tail; 0.477 here, mildly right-skewed) and `stats.kurtosis` gives **excess** kurtosis (0 for a normal curve; $-0.80$ means flatter than normal). `stats.trim_mean(data, 0.1)` drops 10% from each end; with 7 values, $0.1\\times7=0.7$ rounds down to 0 values, so it equals the ordinary mean.' },
        { t: 'callout', kind: 'exam', title: 'Remember', text: '`np.std(x, ddof=1)` = sample SD. `describe()` std is already sample. **`np.percentile` and pandas `quantile` give Q1 = 7.75, Q3 = 15.75 for the standard example**; the median-of-halves answer is 7.5 and 16.5.' },
      ],
    },
    {
      id: 'distributions',
      title: 'Bernoulli, binomial & Poisson (Programs 5 to 11)',
      blocks: [
        { t: 'p', text: 'For a **discrete** distribution, `pmf` gives $P(X=x)$ and `cdf` gives $P(X\\le x)$. For a **continuous** distribution, `pdf` is a *density* (not the probability at one exact point), while `cdf` still gives $P(X\\le x)$. Interval probabilities come from **subtracting cdf values**.' },
        { t: 'table', title: 'Which SciPy object?', head: ['Distribution', 'Typical situation', 'SciPy object'], rows: [
          ['Bernoulli', 'One success/failure trial', '`stats.bernoulli`'],
          ['Binomial', 'Number of successes in $n$ independent Bernoulli trials', '`stats.binom`'],
          ['Poisson', 'Count of events in a fixed interval with rate $\\lambda$', '`stats.poisson`'],
          ['Normal', 'Continuous bell-shaped model with mean $\\mu$ and SD $\\sigma$', '`stats.norm`'],
        ] },
        { t: 'h', text: 'The four-method cheat table' },
        { t: 'table', head: ['Method', 'Gives', 'Use it for', 'Example (Binomial $n=10$, $p=0.4$)'], rows: [
          ['`pmf(k, ...)`', '$P(X=k)$', 'exactly $k$ (discrete only)', '`binom.pmf(3, 10, 0.4)`'],
          ['`cdf(k, ...)`', '$P(X\\le k)$', 'at most $k$; areas to the left', '`binom.cdf(3, 10, 0.4)`'],
          ['`sf(k, ...)`', '$P(X>k)=1-\\text{cdf}(k)$', 'more than $k$; areas to the right', '`binom.sf(3, 10, 0.4)`'],
          ['`ppf(q, ...)`', 'the value $x$ with $P(X\\le x)=q$', 'percentiles and critical values (inverse of cdf)', '`binom.ppf(0.5, 10, 0.4)`'],
        ] },
        { t: 'callout', kind: 'mnemonic', title: 'The sf(k-1) trick', text: '**`sf(k)` means $P(X>k)$ (strictly more).** So $P(X\\ge k)=P(X>k-1)=$ `sf(k-1)`. "At least 3" is `sf(2)`, not `sf(3)`. For continuous distributions there is no difference, because single points have probability zero. The same trick converts any "from a to b" question: $P(a\\le X\\le b)=\\text{cdf}(b)-\\text{cdf}(a-1)$ for integers.' },
        ...prog('p05', 'Program 5: Bernoulli pmf', 'Find the probabilities for a single success/failure trial with $p=0.7$.'),
        { t: 'p', text: 'A Bernoulli variable takes 1 with probability $p$ and 0 with probability $1-p=0.3$. (`0.29999999999999993` is just floating-point arithmetic for $1-0.7$; round it to 0.3.)' },
        ...prog('p06', 'Program 6: generate Bernoulli observations', 'Simulate 20 trials with $p=0.6$.'),
        { t: 'callout', kind: 'why', title: 'What to notice', text: '`rvs` means "random variates". `random_state=1` fixes the seed so the run is repeatable. Here we happened to get 16 successes; the long-run average would be $20\\times0.6=12$. Simulation results vary with the seed, so a written answer should describe the method, not quote the exact string.' },
        ...prog('p07', 'Program 7: exact binomial probability', 'Find $P(X=3)$ for $n=5$ and $p=0.6$.'),
        { t: 'example', title: 'Hand check of Program 7', q: 'Verify $P(X=3)$ for $X\\sim\\text{Binomial}(5, 0.6)$.',
          steps: ['$P(X=3)=\\binom{5}{3}(0.6)^3(0.4)^2$.', '$\\binom{5}{3}=10$, $(0.6)^3=0.216$, $(0.4)^2=0.16$.', '$10\\times0.216\\times0.16=0.3456$ (the output shows 0.3455999999999999: floating-point noise).'],
          ans: '$P(X=3)=0.3456$.' },
        ...prog('p08', 'Program 8: binomial cumulative probabilities', 'Find $P(X\\le3)$ and $P(X\\ge3)$ for $n=10$, $p=0.4$.'),
        { t: 'example', title: 'Why sf(2) is P(X >= 3)', q: 'Check Program 8 by hand: show $P(X\\ge3)=$ `binom.sf(2, 10, 0.4)` $=0.8327$.',
          steps: ['The values of $X$ are 0, 1, ..., 10. "At least 3" is everything except 0, 1, 2.', '$P(X\\ge 3)=1-P(X\\le 2)=1-$ `binom.cdf(2, 10, 0.4)`.', '`binom.cdf(2, 10, 0.4)` $=0.0060+0.0403+0.1209=0.1673$, so $1-0.1673=0.8327$.', 'That is exactly `binom.sf(2, 10, 0.4)`, because `sf(2)` $=P(X>2)=P(X\\ge3)$. Using `sf(3)` would give $0.6177$ (that is $P(X\\ge 4)$): a very common slip.'],
          ans: '$P(X\\le3)=0.3823$ and $P(X\\ge3)=0.8327$.' },
        ...prog('p09', 'Program 9: binomial probability table', 'Print $P(X=x)$ for every possible $x$ when $n=6$, $p=0.5$.'),
        { t: 'p', text: 'The loop body is **indented** (four spaces): in Python, indentation is the syntax. These are $\\binom{6}{x}/64$, i.e. $1,6,15,20,15,6,1$ divided by 64, and they add to 1. `round(..., 4)` limits each value to four decimals.' },
        ...prog('p10', 'Program 10: Poisson exact probability', 'If $\\lambda=4$ events per hour, find $P(X=3)$.'),
        { t: 'p', text: 'Check: $P(X=3)=\\dfrac{e^{-4}4^3}{3!}=\\dfrac{0.018316\\times64}{6}=0.19537$. In SciPy the rate is the argument `mu`, so `poisson.pmf(3, mu=lam)`.' },
        ...prog('p11', 'Program 11: Poisson at most / more than', 'Find $P(X\\le2)$ and $P(X>2)$ when $\\lambda=3$.'),
        { t: 'p', text: 'Check: $P(X\\le 2)=e^{-3}(1+3+4.5)=0.049787\\times8.5=0.4232$, and the complement is $1-0.4232=0.5768$. `cdf` and `sf` always add to 1.' },
        { t: 'callout', kind: 'exam', title: 'Remember', text: 'Exactly: `pmf`. At most: `cdf`. More than: `sf`. At least $k$: **`sf(k-1)`**. Poisson rate is `mu=`. Binomial arguments are `(k, n, p)` in that order.' },
      ],
    },
    {
      id: 'normal-python',
      title: 'The normal distribution (Programs 12 to 15)',
      blocks: [
        { t: 'p', text: '`norm` takes `loc` (the mean $\\mu$) and `scale` (the **standard deviation** $\\sigma$, not the variance). If a question says $N(100, 15^2)$ then `scale=15`, not 225. Positional arguments work too: `norm.cdf(120, 100, 15)`.' },
        ...prog('p12', 'Program 12: normal cdf', 'For $X\\sim N(100,15^2)$ find $P(X\\le120)$.'),
        { t: 'p', text: 'Check: $z=(120-100)/15=1.333$, and $\\Phi(1.333)=0.9088$.' },
        ...prog('p13', 'Program 13: normal interval probability', 'Find $P(85<X<115)$ when $\\mu=100$ and $\\sigma=15$.'),
        { t: 'p', text: 'Check: $85$ and $115$ are exactly $\\mu\\pm\\sigma$, so this is the "68" of the 68-95-99.7 rule: $0.6827$. The pattern is always **upper cdf minus lower cdf**.' },
        ...prog('p14', 'Program 14: a normal quantile', 'Find the 95th percentile of $N(100,15^2)$.'),
        { t: 'p', text: '`ppf` (percent point function) is the **inverse** of `cdf`: you give the left-tail area, it gives the value. Check: $100+1.6449\\times15=124.67$.' },
        ...prog('p15', 'Program 15: plot a normal density', 'Plot a simple standard normal density curve.'),
        { t: 'p', text: 'In the lab the last line is `plt.show()`, which opens a window with the bell curve; the extra `print` line is only there so you can see something in the text output. `np.linspace(-4, 4, 200)` makes 200 evenly spaced x-values, and `norm.pdf` evaluates the curve at each. The peak height is $1/\\sqrt{2\\pi}=0.3989$. Remember that this height is a **density**, not a probability.' },
        { t: 'example', title: 'Predict the output', q: 'For $X\\sim N(70,10^2)$, which is bigger: `norm.cdf(80, 70, 10)` or `norm.sf(80, 70, 10)`? Roughly what are they?',
          steps: ['$z=(80-70)/10=1$.', '`cdf` is the area to the left of $z=1$: $0.8413$. `sf` is the area to the right: $0.1587$.', 'They add to 1.'],
          ans: '`cdf` $=0.8413$ is bigger; `sf` $=0.1587$.' },
        { t: 'callout', kind: 'warn', title: 'Common slips', text: '(1) `scale` is the SD, not the variance. (2) `pdf` is not a probability. (3) `norm.cdf(115) - norm.cdf(85)` needs the *same* `loc` and `scale` in both calls. (4) `ppf` takes an area between 0 and 1, never a percentage like 95.' },
      ],
    },
    {
      id: 'confidence-intervals',
      title: 'Confidence intervals (Programs 16 to 20)',
      blocks: [
        { t: 'p', text: 'Every confidence interval in Python is the same three lines: **find the critical value with `ppf`, compute the standard error, then estimate $\\pm$ critical $\\times$ SE**. Only the critical value and the SE change between the cases.' },
        { t: 'table', head: ['Case', 'Critical value', 'Standard error', 'Interval'], rows: [
          ['Mean, $\\sigma$ known (z)', '`norm.ppf(1 - alpha/2)`', '$\\sigma/\\sqrt{n}$', '$\\bar{x}\\pm z\\cdot SE$'],
          ['Mean, $\\sigma$ unknown (t)', '`t.ppf(1 - alpha/2, df=n-1)`', '$s/\\sqrt{n}$ with `ddof=1`', '$\\bar{x}\\pm t\\cdot SE$'],
          ['One-sided lower bound', '`norm.ppf(1 - alpha)`', '$\\sigma/\\sqrt{n}$', '$(\\bar{x}-z\\cdot SE,\\ \\infty)$'],
          ['One-sided upper bound', '`norm.ppf(1 - alpha)`', '$\\sigma/\\sqrt{n}$', '$(-\\infty,\\ \\bar{x}+z\\cdot SE)$'],
          ['Proportion (Wald)', '`norm.ppf(1 - alpha/2)`', '$\\sqrt{\\hat p(1-\\hat p)/n}$', '$\\hat p\\pm z\\cdot SE$'],
        ] },
        { t: 'callout', kind: 'mnemonic', title: 'alpha/2 for two-sided, alpha for one-sided', text: 'Two-sided 95%: 2.5% is left in *each* tail, so look up `1 - 0.05/2 = 0.975`. One-sided 95%: all 5% sits in *one* tail, so look up `1 - 0.05 = 0.95`. Using 0.975 for a one-sided bound is the most common slip in this topic.' },
        ...prog('p16', 'Program 16: two-sided CI for a mean, σ known', 'Compute a 95% z confidence interval ($\\bar{x}=50$, $\\sigma=8$, $n=64$).'),
        { t: 'p', text: 'Check: $SE=8/\\sqrt{64}=1$, $z_{0.975}=1.96$, so $50\\pm1.96=(48.04,\\ 51.96)$. The `np.float64(...)` wrapper is the NumPy 2 display style mentioned in the setup page.' },
        ...prog('p17', 'Program 17: two-sided CI for a mean, σ unknown', 'Use the $t$ distribution and the sample SD.'),
        { t: 'example', title: 'Hand check of Program 17', q: 'Data: 18, 20, 21, 19, 22, 20, 23, 21. Verify the 95% CI.',
          steps: ['$n=8$, sum $=164$, $\\bar{x}=20.5$.', 'Squared deviations: $6.25,\\ 0.25,\\ 0.25,\\ 2.25,\\ 2.25,\\ 0.25,\\ 6.25,\\ 0.25$; sum $=18$. $s^2=18/7=2.5714$, $s=1.6036$.', '$SE=1.6036/\\sqrt8=0.5669$. With $df=7$ the critical value is $t_{0.975,7}=2.3646$.', 'Margin $=2.3646\\times0.5669=1.3406$. Interval $=20.5\\pm1.3406=(19.159,\\ 21.841)$.'],
          ans: '95% CI for $\\mu$: $(19.16,\\ 21.84)$.' },
        { t: 'callout', kind: 'why', title: 'What to notice', text: '`np.std(data, ddof=1)` is essential: with `ddof=0` the SD would be too small and the interval too narrow. The critical value uses `df=n-1`, and the $t$ value (2.365) is larger than $z$ (1.96) because estimating $\\sigma$ adds uncertainty.' },
        ...prog('p18', 'Program 18: one-sided lower CI for a mean', 'Compute a 95% lower confidence bound with known $\\sigma$ ($\\bar{x}=102$, $\\sigma=12$, $n=36$).'),
        { t: 'p', text: 'Check: $SE=12/6=2$, $z_{0.95}=1.645$, lower bound $=102-3.29=98.71$. Interpretation: we are 95% confident that $\\mu$ is **at least 98.71**; there is no upper limit, so the interval is $(98.71,\\ \\infty)$.' },
        ...prog('p19', 'Program 19: one-sided upper CI for a mean', 'Compute a 95% upper confidence bound ($\\bar{x}=48$, $\\sigma=10$, $n=25$).'),
        { t: 'p', text: 'Check: $SE=10/5=2$, upper bound $=48+1.645\\times2=51.29$. We are 95% confident that $\\mu$ is **at most 51.29**.' },
        ...prog('p20', 'Program 20: two-sided CI for a proportion', 'Use the introductory normal (Wald) interval for 240 successes in 400.'),
        { t: 'p', text: 'Check: $\\hat p=0.6$, $SE=\\sqrt{0.6\\times0.4/400}=0.02449$, margin $=1.96\\times0.02449=0.0480$, so the interval is $(0.552,\\ 0.648)$. Note that we use $\\hat p$ itself in the standard error because the true $p$ is unknown.' },
        { t: 'callout', kind: 'tip', title: 'A one-line alternative: norm.interval and t.interval', text: '`norm.interval(0.95, loc=xbar, scale=sigma/np.sqrt(n))` returns the same two-sided z interval in one call, and `t.interval(0.95, df=n-1, loc=xbar, scale=stats.sem(data))` does the t interval. The first argument is the **confidence level (0.95), not alpha**. Writing the three-line version is safer in an exam because it shows your method.' },
        { t: 'callout', kind: 'exam', title: 'Remember', text: '**ppf, SE, then $\\pm$.** Two-sided uses `1 - alpha/2`, one-sided uses `1 - alpha`; unknown $\\sigma$ means `t.ppf` with `df=n-1` and `ddof=1`.' },
      ],
    },
    {
      id: 'hypothesis-python',
      title: 'Hypothesis tests for a mean (Programs 21 to 26)',
      blocks: [
        { t: 'p', text: 'The lab sheet tests a mean three ways (two-sided, right-tailed, left-tailed) and two methods (p-value and rejection region). The procedure is always: compute the test statistic, find the p-value or critical value, compare with $\\alpha=0.05$, state the decision.' },
        { t: 'formula', title: 'z test statistic ($\\sigma$ known)', tex: 'z=\\frac{\\bar{x}-\\mu_0}{\\sigma/\\sqrt{n}}' },
        { t: 'table', title: 'p-value and critical value by type of test', head: ['Alternative $H_1$', 'p-value', 'Critical value(s)', 'Reject $H_0$ when'], rows: [
          ['$\\mu\\ne\\mu_0$ (two-sided)', '`2 * norm.sf(abs(z))`', '$\\pm$ `norm.ppf(1 - alpha/2)`', '$|z|>1.96$'],
          ['$\\mu>\\mu_0$ (right-tailed)', '`norm.sf(z)`', '`norm.ppf(1 - alpha)`', '$z>1.645$'],
          ['$\\mu<\\mu_0$ (left-tailed)', '`norm.cdf(z)`', '`norm.ppf(alpha)` (negative)', '$z<-1.645$'],
        ] },
        { t: 'callout', kind: 'mnemonic', title: 'Direction decides the function', text: '**Left tail: `cdf(z)`. Right tail: `sf(z)`. Two tails: double the tail beyond $|z|$.** Reject when the p-value is $\\le\\alpha$.' },
        ...prog('p21', 'Program 21: two-sided z test, p-value approach', 'Test $H_0:\\mu=500$ against $H_1:\\mu\\ne500$ ($\\bar{x}=496$, $\\sigma=20$, $n=100$).'),
        { t: 'p', text: 'Check: $z=(496-500)/(20/10)=-2$. Tail beyond $|z|=2$ is $0.02275$, doubled $=0.0455$. Since $0.0455\\le0.05$ we **reject $H_0$**: there is evidence the mean differs from 500. (At $\\alpha=0.01$ the same data would not be significant.)' },
        ...prog('p22', 'Program 22: right-tailed z test, p-value approach', 'Test $H_0:\\mu=50$ against $H_1:\\mu>50$ ($\\bar{x}=52$, $\\sigma=8$, $n=64$).'),
        { t: 'p', text: 'Check: $z=2/(8/8)=2$, p-value $=P(Z>2)=0.02275$, reject.' },
        ...prog('p23', 'Program 23: left-tailed z test, p-value approach', 'Test $H_0:\\mu=1000$ against $H_1:\\mu<1000$ ($\\bar{x}=970$, $\\sigma=90$, $n=36$).'),
        { t: 'p', text: 'Check: $z=-30/(90/6)=-2$, p-value $=P(Z<-2)=0.02275$, reject. Note the p-values of 22 and 23 are the same because the situation is the mirror image.' },
        ...prog('p24', 'Program 24: two-sided z test, rejection region', 'Compare $z$ with $\\pm z_{\\alpha/2}$ using the numbers of Program 21.'),
        { t: 'p', text: 'This is the same test as Program 21 done the other way: $z=-2$ lies outside $(-1.96,\\ 1.96)$, so reject. The `if / else` needs **indentation**: the two `print` lines are indented under their `if` and `else`. Both methods always agree.' },
        ...prog('p25', 'Program 25: one-sided z test, rejection region', 'Right-tailed example with the numbers of Program 22.'),
        { t: 'p', text: 'Critical value $z_{0.95}=1.645$; $z=2>1.645$, so reject. The one-sided critical value uses `1 - alpha`.' },
        ...prog('p26', 'Program 26: one-sample t test with SciPy', 'Test a mean when $\\sigma$ is unknown using the raw sample data.'),
        { t: 'example', title: 'Hand check of Program 26', q: 'Data 48, 51, 52, 49, 50, 53, 47, 52; test $H_0:\\mu=50$. Verify $t$ and the decision.',
          steps: ['$n=8$, sum $=402$, $\\bar{x}=50.25$.', 'Squared deviations: $5.0625,\\ 0.5625,\\ 3.0625,\\ 1.5625,\\ 0.0625,\\ 7.5625,\\ 10.5625,\\ 3.0625$; sum $=31.5$, so $s^2=31.5/7=4.5$, $s=2.1213$.', '$SE=2.1213/\\sqrt8=0.75$ and $t=(50.25-50)/0.75=0.3333$ with $df=7$.', 'The two-sided p-value is $0.7486\\gg0.05$: **fail to reject $H_0$**. The data are consistent with a mean of 50.'],
          ans: '$t=0.333$, $p=0.749$: do not reject $H_0$.' },
        { t: 'callout', kind: 'tip', title: 'One-sided t tests', text: '`ttest_1samp` is two-sided by default. For $H_1:\\mu>\\mu_0$ use `ttest_1samp(data, popmean=mu0, alternative="greater")`; for $H_1:\\mu<\\mu_0$ use `alternative="less"`. For this data the "greater" p-value would be half of 0.7486, i.e. $0.3743$.' },
        { t: 'callout', kind: 'warn', title: 'Wording of the conclusion', text: '"Fail to reject $H_0$" is **not** "$H_0$ is true". Say: "there is not enough evidence at the 5% level to conclude that the mean differs from 50." Always finish with a sentence in words.' },
        { t: 'callout', kind: 'exam', title: 'Remember', text: 'z test: $\\sigma$ known, `norm`. t test: $\\sigma$ unknown, `ttest_1samp` (raw data) or `t.cdf/sf` (summary numbers). **p-value $\\le\\alpha$ means reject.**' },
      ],
    },
    {
      id: 'chisq-anova-python',
      title: 'Chi-square & ANOVA (Programs 27 to 29)',
      blocks: [
        { t: 'p', text: 'These three programs are the "bonus practice" of the lab sheet. In all three, SciPy returns a **test statistic and a p-value**; you compare the p-value with $\\alpha$ exactly as before.' },
        ...prog('p27', 'Program 27: chi-square goodness of fit', 'Compare observed counts with equal expected counts.'),
        { t: 'example', title: 'Hand check of Program 27', q: 'Observed 18, 22, 27, 33; expected 25 each. Verify $\\chi^2$ and decide at 5%.',
          steps: ['$\\chi^2=\\sum\\frac{(O-E)^2}{E}=\\frac{49}{25}+\\frac{9}{25}+\\frac{4}{25}+\\frac{64}{25}=1.96+0.36+0.16+2.56=5.04$.', '$df=k-1=4-1=3$; critical value $\\chi^2_{0.05,3}=7.815$.', '$5.04<7.815$, equivalently $p=0.1689>0.05$: fail to reject.'],
          ans: '$\\chi^2=5.04$, $p=0.169$: the counts are consistent with equal expected frequencies.' },
        ...prog('p28', 'Program 28: chi-square test of independence', 'Test association in a 2 by 2 contingency table.'),
        { t: 'p', text: 'Expected counts come from (row total $\\times$ column total)/grand total: here every row and column total is 50 and the grand total is 100, so each expected count is $50\\times50/100=25$. $\\chi^2=4\\times\\frac{(5)^2}{25}=4$, $df=(2-1)(2-1)=1$, and since $4>3.841$ (critical value) we reject independence: $p=0.0455$.' },
        { t: 'callout', kind: 'warn', title: 'correction=False matters for a 2 by 2 table', text: 'By default `chi2_contingency` applies **Yates’ continuity correction** when $df=1$ (every 2 by 2 table). That subtracts 0.5 from each $|O-E|$ and changes the answer. The same table gives $\\chi^2=3.24$, $p=0.0719$ with the default (not significant at 5%) but $\\chi^2=4.00$, $p=0.0455$ with `correction=False` (significant). Hand calculation in class uses no correction, so write `correction=False` to match.' },
        code('q10'),
        { t: 'p', text: '`chi2_contingency` returns four things: the statistic, the p-value, the degrees of freedom and the **table of expected counts**. For a table with $r$ rows and $c$ columns, $df=(r-1)(c-1)$.' },
        ...prog('p29', 'Program 29: one-way ANOVA', 'Compare the means of three independent groups.'),
        { t: 'example', title: 'Hand check of Program 29', q: 'Groups A = 8, 9, 10; B = 11, 12, 13; C = 14, 15, 16. Verify $F=27$.',
          steps: ['Group means $9,\\ 12,\\ 15$; grand mean $=12$.', 'Between-group sum of squares $SSB=3[(9-12)^2+(12-12)^2+(15-12)^2]=3\\times18=54$, $df=k-1=2$, so $MSB=27$.', 'Within-group: each group has deviations $-1,0,1$, so $SSW=2+2+2=6$, $df=N-k=9-3=6$, so $MSW=1$.', '$F=MSB/MSW=27$. The 5% critical value is $F_{0.05,2,6}=5.143$, and $p=0.001$: reject $H_0$ (all means equal).'],
          ans: '$F=27$, $p=0.001$: at least one group mean differs.' },
        { t: 'callout', kind: 'tip', title: 'Two sample t and paired t', text: 'For **two** groups use `stats.ttest_ind(a, b)` (independent samples, equal variances assumed; add `equal_var=False` for Welch) or `stats.ttest_rel(a, b)` (paired). For three or more groups use `f_oneway`. Example: `a = [23, 25, 28, 30, 27]`, `b = [30, 33, 35, 31, 36]` gives $t=-3.852$, $p=0.0049$ (Welch: $p=0.0049$).' },
        { t: 'callout', kind: 'exam', title: 'Remember', text: '`chisquare(f_obs, f_exp)` for goodness of fit. `chi2_contingency(table, correction=False)` for independence (4 outputs). `f_oneway(g1, g2, g3)` for ANOVA (one list per group). Reject when $p\\le\\alpha$.' },
      ],
    },
    {
      id: 'numpy-linalg',
      title: 'NumPy linear algebra (Programs 30 to 36)',
      blocks: [
        { t: 'p', text: 'In NumPy a **vector** is a 1-D array and a **matrix** is a 2-D array (a list of rows). Everything in this page is a one- or two-line call, but each call has a classic trap, flagged below.' },
        { t: 'table', title: 'Operation to NumPy call', head: ['I want...', 'NumPy', 'Trap'], rows: [
          ['$u+v$, $2u$', '`u + v`, `2*u`', 'Arrays add element by element'],
          ['Dot product $u\\cdot v$', '`np.dot(u, v)` or `u @ v`', 'Gives a number, not a vector'],
          ['Length $\\|u\\|$', '`np.linalg.norm(u)`', 'Not `len(u)`, which is the number of entries'],
          ['Matrix product $AB$', '`A @ B`', '`A * B` is **element-wise**'],
          ['Transpose $A^T$', '`A.T`', 'No brackets'],
          ['Determinant', '`np.linalg.det(A)`', 'Floating-point noise: 10.000000000000002'],
          ['Inverse', '`np.linalg.inv(A)`', 'Raises an error if $\\det A=0$'],
          ['Rank', '`np.linalg.matrix_rank(A)`', 'Counts independent rows, tolerant of rounding'],
          ['Eigenvalues and vectors', '`np.linalg.eig(A)`', 'Eigenvectors are the **columns**'],
        ] },
        ...prog('p30', 'Program 30: vectors and matrices', 'Create a vector and a 2 by 2 matrix and look at their shape.'),
        { t: 'p', text: '`A.shape` is `(2, 2)`: (rows, columns). A 1-D vector `v` has shape `(2,)`. The display also shows the matrix laid out in rows, which makes typing errors easy to spot.' },
        ...prog('p31', 'Program 31: vector operations', 'Add vectors, scale a vector, take a dot product and a length.'),
        { t: 'example', title: 'Hand check of Program 31', q: 'For $u=(2,1)$ and $v=(3,-2)$ verify each printed line.',
          steps: ['$u+v=(2+3,\\ 1-2)=(5,\\ -1)$ and $2u=(4,2)$.', '$u\\cdot v=2\\cdot3+1\\cdot(-2)=6-2=4$.', '$\\|u\\|=\\sqrt{2^2+1^2}=\\sqrt5=2.2360679\\ldots$'],
          ans: '$(5,-1)$, $(4,2)$, $4$ and $\\sqrt5\\approx2.2361$.' },
        ...prog('p32', 'Program 32: matrix addition, product and transpose', 'Use two 2 by 2 matrices; the last line shows the most common mistake on purpose.'),
        { t: 'example', title: 'Hand check of $AB$ in Program 32', q: 'Verify $A@B$ for $A=\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}$ and $B=\\begin{pmatrix}2&0\\\\1&5\\end{pmatrix}$.',
          steps: ['Entry (row $i$, column $j$) = row $i$ of $A$ dotted with column $j$ of $B$.', '(1,1): $1\\cdot2+2\\cdot1=4$. (1,2): $1\\cdot0+2\\cdot5=10$.', '(2,1): $3\\cdot2+4\\cdot1=10$. (2,2): $3\\cdot0+4\\cdot5=20$.', 'Element-wise `A * B` is different: $(1\\cdot2,\\ 2\\cdot0;\\ 3\\cdot1,\\ 4\\cdot5)=(2,0;\\ 3,20)$.'],
          ans: '$AB=\\begin{pmatrix}4&10\\\\10&20\\end{pmatrix}$ and $A*B=\\begin{pmatrix}2&0\\\\3&20\\end{pmatrix}$.' },
        { t: 'callout', kind: 'warn', title: '@ versus *', text: '**`@` is the matrix product; `*` multiplies matching entries.** An exam question that says "matrix multiplication" needs `@` (or `np.dot` / `np.matmul`). Also remember $AB\\ne BA$ in general: here `B @ A` is different from `A @ B`.' },
        ...prog('p33', 'Program 33: determinant, inverse and rank', 'Analyse a 2 by 2 matrix.'),
        { t: 'example', title: 'Hand check of Program 33', q: 'Verify the determinant and inverse of $A=\\begin{pmatrix}4&2\\\\1&3\\end{pmatrix}$.',
          steps: ['$\\det A=4\\cdot3-2\\cdot1=10$ (NumPy shows 10.000000000000002).', '$A^{-1}=\\dfrac1{\\det A}\\begin{pmatrix}3&-2\\\\-1&4\\end{pmatrix}=\\begin{pmatrix}0.3&-0.2\\\\-0.1&0.4\\end{pmatrix}$.', 'Since $\\det A\\ne0$, $A$ is invertible and its rank is 2 (full rank).'],
          ans: '$\\det A=10$, $A^{-1}$ as printed, rank 2.' },
        ...prog('p34', 'Program 34: rank of a 3 by 3 matrix', 'Find how many rows are truly independent.'),
        { t: 'callout', kind: 'why', title: 'What to notice', text: 'For exams, also know **row reduction by hand** (Chapter 18); `matrix_rank` is just the simple library-based check of the same count of pivots.' },
        { t: 'p', text: 'The second row is exactly twice the first row, so it adds no new information; the third row $(1,1,1)$ is independent of the first. Hence **rank 2**, less than 3, so the matrix is singular ($\\det=0$) and has no inverse.' },
        ...prog('p35', 'Program 35: eigenvalues and eigenvectors', 'Find $\\lambda$ and $v$ with $Av=\\lambda v$.'),
        { t: 'example', title: 'Hand check of Program 35', q: 'Find the eigenvalues and eigenvectors of $A=\\begin{pmatrix}4&1\\\\2&3\\end{pmatrix}$.',
          steps: ['Characteristic equation: $\\lambda^2-(\\text{trace})\\lambda+\\det=\\lambda^2-7\\lambda+10=0$, so $\\lambda=5$ or $\\lambda=2$.', 'For $\\lambda=5$: $(A-5I)v=0$ gives $-x+y=0$, so $v\\propto(1,1)$. Normalised: $(0.7071,\\ 0.7071)$.', 'For $\\lambda=2$: $2x+y=0$, so $v\\propto(-1,2)$. Normalised: $(-0.4472,\\ 0.8944)$.', 'NumPy stores each eigenvector as a **column**: column 0 is for $\\lambda=5$ and column 1 for $\\lambda=2$ (the order of eigenvalues follows the output array, not necessarily sorted).'],
          ans: '$\\lambda=5$ with $(1,1)/\\sqrt2$, and $\\lambda=2$ with $(-1,2)/\\sqrt5$.' },
        { t: 'callout', kind: 'warn', title: 'Eigenvectors are columns, and the sign is arbitrary', text: 'The first eigenvector is `eigenvectors[:, 0]` (the first **column**), not `eigenvectors[0]` (the first row). Also, $v$ and $-v$ are equally valid eigenvectors, so another computer may print the opposite signs. For a **symmetric** matrix (such as a covariance matrix) prefer `np.linalg.eigh`, which returns real eigenvalues in ascending order.' },
        ...prog('p36', 'Program 36: verify an eigenpair', 'Check that $v=(1,1)$ really satisfies $Av=5v$.'),
        { t: 'p', text: '$Av=(4+1,\\ 2+3)=(5,5)=5\\cdot(1,1)$. `np.allclose` tests equality **up to rounding**, which is safer than `==` for decimals. This is the best way to double-check an eigenvalue answer in the exam.' },
        { t: 'callout', kind: 'exam', title: 'Remember', text: '`@` is matrix multiplication; `eig` returns `(values, vectors)` with vectors in **columns**; `det`, `inv`, `matrix_rank` live in `np.linalg`. Check an eigenpair with `np.allclose(A @ v, lam * v)`.' },
      ],
    },
    {
      id: 'numpy-transformations',
      title: 'Matrix transformations (Programs 37 to 42)',
      blocks: [
        { t: 'p', text: 'A 2 by 2 matrix acts on a vector by `M @ v` and moves it: stretches it, rotates it, projects it onto a line, or reflects it. Every program here is "build the matrix, multiply it by the vector, print".' },
        { t: 'table', head: ['Transformation', 'Matrix', 'Effect on $v=(x,y)$'], rows: [
          ['Scaling by $s_x,s_y$', '$\\begin{pmatrix}s_x&0\\\\0&s_y\\end{pmatrix}$', '$(s_xx,\\ s_yy)$'],
          ['Rotation by $\\theta$ (anticlockwise)', '$\\begin{pmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{pmatrix}$', 'turns $v$ by $\\theta$, same length'],
          ['Projection onto the x-axis', '$\\begin{pmatrix}1&0\\\\0&0\\end{pmatrix}$', '$(x,\\ 0)$'],
          ['Projection onto the line of unit vector $u$', '$P=uu^T$', 'the component of $v$ along $u$'],
          ['Reflection in the x-axis', '$\\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}$', '$(x,\\ -y)$'],
        ] },
        ...prog('p37', 'Program 37: scaling', 'Stretch the x-direction by 2 and shrink the y-direction by half.'),
        { t: 'p', text: '$S v=(2\\cdot2,\\ 0.5\\cdot3)=(4,\\ 1.5)$. NumPy prints `[4.  1.5]` because one entry is non-integer.' },
        ...prog('p38', 'Program 38: rotation by 90 degrees', 'Rotate $(1,0)$ anticlockwise.'),
        { t: 'callout', kind: 'why', title: 'Why np.round?', text: '$\\cos90^\\circ$ is exactly 0 mathematically, but the computer stores $\\pi/2$ approximately and returns `6.123234e-17` (about $6\\times10^{-17}$). That is rounding noise, not a real component. Rounding to 10 places cleans it up and gives the exact answer $(0,1)$: the x-axis vector has turned onto the y-axis. Also, angles must be in **radians**: `np.deg2rad(90)`.' },
        ...prog('p39', 'Program 39: projection onto the x-axis', 'Drop the y-component.'),
        { t: 'p', text: '$P v=(1\\cdot3+0\\cdot4,\\ 0)=(3,0)$. The vector $(3,4)$ casts a "shadow" of length 3 on the x-axis.' },
        ...prog('p40', 'Program 40: projection onto a line', 'Project $v=(3,1)$ onto the line along $(1,1)$ with $P=uu^T$.'),
        { t: 'example', title: 'Hand check of Program 40', q: 'Show that $P=uu^T$ projects $(3,1)$ onto $y=x$ and gives $(2,2)$.',
          steps: ['$u=(1,1)/\\sqrt2$, a **unit** vector. Then $uu^T=\\dfrac12\\begin{pmatrix}1&1\\\\1&1\\end{pmatrix}=\\begin{pmatrix}0.5&0.5\\\\0.5&0.5\\end{pmatrix}$.', '$Pv=(0.5\\cdot3+0.5\\cdot1,\\ 0.5\\cdot3+0.5\\cdot1)=(2,2)$.', 'Cross-check with the formula $(u\\cdot v)u$: $u\\cdot v=4/\\sqrt2$, times $u$ gives $(4/2)(1,1)=(2,2)$.'],
          ans: 'Projection matrix $\\begin{pmatrix}0.5&0.5\\\\0.5&0.5\\end{pmatrix}$; projected vector $(2,2)$.' },
        { t: 'callout', kind: 'warn', title: 'Normalise before using uu^T', text: 'The projection formula $P=uu^T$ needs $\\|u\\|=1$. Skipping `u = u / np.linalg.norm(u)` would give $\\begin{pmatrix}1&1\\\\1&1\\end{pmatrix}$ and double the answer to $(4,4)$.' },
        ...prog('p41', 'Program 41: reflection', 'Reflect $(2,-3)$ in the x-axis.'),
        { t: 'p', text: '$Tv=(2,\\ -(-3))=(2,3)$: the sign of the y-coordinate flips.' },
        ...prog('p42', 'Program 42: combining transformations', 'Scale first, then rotate by 90 degrees.'),
        { t: 'example', title: 'Why the order is R @ S @ v', q: 'Verify the final vector for $v=(1,2)$.',
          steps: ['Scaling first: $Sv=(2\\cdot1,\\ 1\\cdot2)=(2,2)$.', 'Rotation by 90 degrees: $(x,y)\\mapsto(-y,\\ x)$, so $(2,2)\\mapsto(-2,\\ 2)$.', 'In `R @ S @ v` the matrix **nearest to $v$ acts first**, so read it right to left.'],
          ans: '$(-2,\\ 2)$.' },
        { t: 'callout', kind: 'warn', title: 'Order matters', text: '`S @ R @ v` (rotate, then scale) gives a different result: rotating $(1,2)$ gives $(-2,1)$, then scaling gives $(-4,1)$. Matrix multiplication is not commutative.' },
        { t: 'callout', kind: 'exam', title: 'Remember', text: 'Transformation = matrix times vector (`M @ v`). Rotation needs radians and often `np.round`. Projection onto a line: normalise $u$ then `np.outer(u, u)`. Combined: rightmost matrix acts first.' },
      ],
    },
    {
      id: 'pca-python',
      title: 'PCA in Python (Programs 43 to 45)',
      blocks: [
        { t: 'p', text: '**Principal component analysis** finds the direction in which the data vary most. It is the eigenvector with the largest eigenvalue of the **covariance matrix**. Program 43 does it by hand-style NumPy; Programs 44 and 45 use scikit-learn and must agree with it.' },
        { t: 'steps', title: 'The five PCA steps', items: [
          { title: 'Centre', text: 'Subtract each column mean: `Xc = X - X.mean(axis=0)`.' },
          { title: 'Covariance matrix', text: '`C = np.cov(Xc, rowvar=False)` (columns are variables, so `rowvar=False`).' },
          { title: 'Eigen-decompose', text: '`values, vectors = np.linalg.eigh(C)`.' },
          { title: 'Sort descending', text: '`order = np.argsort(values)[::-1]`, then reorder the values and the **columns** of `vectors`.' },
          { title: 'Project', text: 'Scores `= Xc @ pc1`; explained variance ratio `= values / values.sum()`.' },
        ] },
        ...prog('p43', 'Program 43: PCA step by step', 'Do PCA on three perfectly collinear points (2,1), (3,2), (4,3).'),
        { t: 'example', title: 'Hand check of Program 43', q: 'Verify the covariance matrix, eigenvalues and scores.',
          steps: ['Means $(3,2)$; centred rows $(-1,-1),\\ (0,0),\\ (1,1)$.', 'Each variance is $(1+0+1)/(3-1)=1$, and the covariance is $(1+0+1)/2=1$, so $C=\\begin{pmatrix}1&1\\\\1&1\\end{pmatrix}$.', 'Trace $=2$, $\\det=0$, so $\\lambda^2-2\\lambda=0$ and $\\lambda=2$ or $0$. Eigenvector for 2: $(1,1)/\\sqrt2$.', 'Scores $=\\text{Xc}\\cdot pc_1=(-\\sqrt2,\\ 0,\\ \\sqrt2)=(-1.4142,\\ 0,\\ 1.4142)$.', 'Explained variance ratio $=(2/2,\\ 0/2)=(1,0)$: **all** the variance is on PC1 because the points lie on one straight line.'],
          ans: 'PC1 $=(0.7071,0.7071)$, $\\lambda=(2,0)$, ratio $(100\\%,0\\%)$.' },
        ...prog('p44', 'Program 44: PCA with scikit-learn', 'Same data, two lines of code.'),
        { t: 'p', text: '`PCA` centres the data automatically. `fit_transform` returns the scores, `components_` holds the directions as **rows** (the opposite of `eig`, where they are columns), `explained_variance_` the eigenvalues of the sample covariance matrix, and `explained_variance_ratio_` the proportion of the total. The results are identical to Program 43.' },
        ...prog('p45', 'Program 45: PCA with two components', 'Run PCA on five points and keep both components.'),
        { t: 'example', title: 'Hand check of Program 45', q: 'Verify the explained variance ratio of 0.9699 for PC1.',
          steps: ['Means: $\\bar x=2.04$, $\\bar y=2.24$.', 'Covariance matrix (divide by $n-1=4$): $C=\\begin{pmatrix}0.938&0.8405\\\\0.8405&0.853\\end{pmatrix}$.', 'Trace $=1.791$, $\\det=0.938\\cdot0.853-0.8405^2=0.0937$. Solve $\\lambda^2-1.791\\lambda+0.0937=0$: $\\lambda_1=1.7371$, $\\lambda_2=0.0539$.', 'Ratio of PC1 $=1.7371/1.791=0.9699$ (96.99%), PC2 $=0.0539/1.791=0.0301$.', 'The PC1 direction is $(0.7247,\\ 0.6890)$: both variables increase together.'],
          ans: 'PC1 explains about 97.0% of the variance; PC2 about 3.0%.' },
        { t: 'callout', kind: 'warn', title: 'Signs and shapes', text: '(1) A principal direction and its negative are equivalent, so another run (or `eigh` instead of scikit-learn) may print $(-0.7247,\\ -0.6890)$ and flip the sign of every score. (2) `np.cov` needs `rowvar=False` for data with variables in columns, otherwise it treats each row as a variable. (3) `np.linalg.eigh` returns eigenvalues in **ascending** order, so reverse them to get PC1 first. (4) `PCA(n_components=1)` keeps only one score column.' },
        { t: 'callout', kind: 'tip', title: 'How many components to keep?', text: 'Print `pca.explained_variance_ratio_` and keep enough components to reach a target such as 90% or 95% of the total variance. Here PC1 alone already explains 97%, so the data can be reduced from two numbers per point to one with little loss.' },
        { t: 'callout', kind: 'exam', title: 'Remember', text: 'PCA = centre, covariance, eigen-decomposition, sort, project. scikit-learn: `PCA(n_components=k).fit_transform(X)`; `components_` are rows; ratios add to 1 (when all components are kept).' },
      ],
    },
    {
      id: 'practice-tasks',
      title: 'The 16 short practice tasks',
      blocks: [
        { t: 'p', text: 'These sixteen tasks are the closest thing to an exam paper in the lab sheet. Each is shown with **complete, run code, the real printed output and a one-line hand check**. Try to write the code yourself first, then compare. Tasks 1 to 5 cover descriptive statistics and distributions; 6 to 10 cover intervals and tests; 11 to 15 cover linear algebra; 16 covers PCA.' },
        { t: 'callout', kind: 'tip', title: 'A routine that works every time', text: '(1) Import what you need. (2) Put the given numbers in named variables. (3) Call the function. (4) `print` with a label. Write the label so a marker can read your answer without hunting for it.' },
        { t: 'h', text: 'Task 1: mean, median, mode, sample variance and SD of [5, 7, 7, 8, 10, 12]' },
        code('t01'),
        { t: 'p', text: 'Hand check: sum $=49$, mean $=49/6=8.1667$; median $=(7+8)/2=7.5$; mode $=7$ (appears twice); squared deviations add to $30.833$, so $s^2=30.833/5=6.1667$ and $s=2.4833$.' },
        { t: 'h', text: 'Task 2: Bernoulli with p = 0.8: P(X=1), P(X=0) and 10 simulated trials' },
        code('t02'),
        { t: 'p', text: 'Hand check: $P(X=1)=p=0.8$ and $P(X=0)=1-p=0.2$ (the printed 0.19999999999999993 is floating-point noise). The simulated trials depend on the seed and SciPy version; the expected number of successes is $10\\times0.8=8$.' },
        { t: 'h', text: 'Task 3: Binomial(12, 0.3): P(X=4), P(X≤4), P(X≥5)' },
        code('t03'),
        { t: 'p', text: 'Hand check: $P(X=4)=\\binom{12}{4}(0.3)^4(0.7)^8=495\\times0.0081\\times0.057648=0.2311$. The cumulative $P(X\\le4)=0.7237$, and $P(X\\ge5)=1-0.7237=0.2763$, written as `sf(4)` because **$P(X\\ge5)=P(X>4)$**.' },
        { t: 'h', text: 'Task 4: Poisson(2.5): P(X=0), P(X≤3), P(X>3)' },
        code('t04'),
        { t: 'p', text: 'Hand check: $P(X=0)=e^{-2.5}=0.0821$. $P(X\\le3)=e^{-2.5}(1+2.5+3.125+2.6042)=0.082085\\times9.2292=0.7576$. $P(X>3)=1-0.7576=0.2424$, which is `sf(3)` exactly (no minus-one needed for "more than").' },
        { t: 'h', text: 'Task 5: N(70, 10²): P(X<60), P(60<X<80), 90th percentile' },
        code('t05'),
        { t: 'p', text: 'Hand check: $z=-1$ gives $0.1587$; $60$ and $80$ are $\\mu\\pm1\\sigma$ so the interval probability is $0.6827$; the 90th percentile is $70+1.2816\\times10=82.82$.' },
        { t: 'h', text: 'Task 6: 99% two-sided z interval, x̄ = 80, σ = 12, n = 100' },
        code('t06'),
        { t: 'p', text: 'Hand check: $SE=12/10=1.2$, $z_{0.995}=2.5758$, margin $=3.091$, so the interval is $(76.91,\\ 83.09)$. A higher confidence level gives a **wider** interval than the 95% one ($80\\pm2.352$).' },
        { t: 'h', text: 'Task 7: 95% lower confidence bound, x̄ = 40, σ = 6, n = 36' },
        code('t07'),
        { t: 'p', text: 'Hand check: $SE=6/6=1$, one-sided $z_{0.95}=1.645$, lower bound $=40-1.645=38.355$. Interval $(38.355,\\ \\infty)$.' },
        { t: 'h', text: 'Task 8: 95% proportion interval, 180 successes out of 300' },
        code('t08'),
        { t: 'p', text: 'Hand check: $\\hat p=0.6$, $SE=\\sqrt{0.6\\times0.4/300}=0.02828$, margin $=1.96\\times0.02828=0.0554$, interval $(0.5446,\\ 0.6554)$.' },
        { t: 'h', text: 'Task 9: two-sided z test, H₀: μ = 25, x̄ = 27, σ = 8, n = 64 (both approaches)' },
        code('t09'),
        { t: 'p', text: 'Hand check: $z=2/(8/8)=2$; p-value $=2\\times0.02275=0.0455\\le0.05$ and $|z|=2>1.96$. **Both methods reject $H_0$.**' },
        { t: 'h', text: 'Task 10: left-tailed z test, H₀: μ = 100 vs H₁: μ < 100, x̄ = 96, σ = 10, n = 25' },
        code('t10'),
        { t: 'p', text: 'Hand check: $z=-4/(10/5)=-2$; p-value $=\\Phi(-2)=0.02275$; the critical value is $-1.645$ and $-2<-1.645$, so reject $H_0$.' },
        { t: 'h', text: 'Task 11: determinant, inverse and rank of [[2, 1], [5, 3]]' },
        code('t11'),
        { t: 'p', text: 'Hand check: $\\det=2\\cdot3-1\\cdot5=1$, $A^{-1}=\\begin{pmatrix}3&-1\\\\-5&2\\end{pmatrix}$, rank 2. The final check `A @ inv(A)` should be the identity matrix; `-0.` is just a negative zero from rounding.' },
        { t: 'h', text: 'Task 12: eigenvalues and eigenvectors of [[2, 1], [1, 2]], verify one eigenpair' },
        code('t12'),
        { t: 'p', text: 'Hand check: $\\lambda^2-4\\lambda+3=0$ gives $\\lambda=3,1$. For $\\lambda=3$, $v\\propto(1,1)$; for $\\lambda=1$, $v\\propto(1,-1)$. Verification: $A(1,1)/\\sqrt2=(3,3)/\\sqrt2=3\\cdot v$.' },
        { t: 'h', text: 'Task 13: rotate [2, 0] by 45 degrees' },
        code('t13'),
        { t: 'p', text: 'Hand check: $R v=(2\\cos45^\\circ,\\ 2\\sin45^\\circ)=(\\sqrt2,\\sqrt2)=(1.4142,\\ 1.4142)$; the length is still 2.' },
        { t: 'h', text: 'Task 14: project [4, 2] onto the direction [1, 1]' },
        code('t14'),
        { t: 'p', text: 'Hand check: $v\\cdot u=(4+2)/\\sqrt2$; times $u$ gives $\\dfrac{6}{2}(1,1)=(3,3)$. The matrix method and the formula $(v\\cdot u)u$ agree.' },
        { t: 'h', text: 'Task 15: reflect [-3, 5] across the y-axis' },
        code('t15'),
        { t: 'p', text: 'Hand check: reflection in the y-axis flips the sign of $x$ only: $(-3,5)\\mapsto(3,5)$. (Reflection in the x-axis would use $\\mathrm{diag}(1,-1)$ instead.)' },
        { t: 'h', text: 'Task 16: PCA of [[1, 1], [2, 2], [3, 3], [4, 4]], manual and scikit-learn' },
        code('t16'),
        { t: 'p', text: 'Hand check: the points lie exactly on the line $y=x$. Each variance is $5/3=1.6667$ and so is the covariance, so $C=1.6667\\begin{pmatrix}1&1\\\\1&1\\end{pmatrix}$ with eigenvalues $3.3333$ and $0$. Both methods give explained variance ratios $(1,\\ 0)$: **PC1 explains 100%**, because there is no variation off the line.' },
        { t: 'callout', kind: 'exam', title: 'Remember', text: 'A task answer = import, named inputs, one library call, labelled print. When two methods are asked for (p-value and critical value; manual and scikit-learn), print **both** and state that they agree.' },
      ],
    },
    {
      id: 'esa-practicals',
      title: 'ESA Section C: ready-to-write answers (Q13 to Q25)',
      blocks: [
        { t: 'p', text: 'Section C of the sample ESA paper is **"Write Python code to..."** questions worth 2, 4 or 5 marks. Below, each question has an answer you can reproduce from memory, with the code that was actually run, its real output, and a one-line explanation. The code is deliberately short: examiners reward correct library calls, correct arguments and a labelled print, not clever programs.' },
        { t: 'table', title: 'What the marks pay for', head: ['Marks', 'Typical split', 'So write'], rows: [
          ['2 (Q13, Q14)', 'import + data (1), correct call and print (1)', '3 to 4 lines'],
          ['4 (Q15)', 'import (1), data (1), two correct calls (1 each)', '6 to 7 lines, both quartiles printed'],
          ['5 (Q16 to Q25)', 'imports (1), data (1), main computation (2), labelled output or one-line conclusion (1)', '8 to 12 lines'],
        ] },
        { t: 'callout', kind: 'tip', title: 'The 30-second plan for any Section C question', text: 'Write the import line(s) first (1 mark nearly always). Put the data in a named variable. Make the one key call. `print` it with a label. If a decision is asked for (Q21, Q25), finish with an `if p <= alpha` line.' },

        { t: 'h', text: 'Q13 (2 marks): compute the mean' },
        code('e13'),
        { t: 'p', text: '`np.mean` adds the values and divides by $n$: $630/8=78.75$.' },

        { t: 'h', text: 'Q14 (2 marks): create a sample' },
        code('e14'),
        { t: 'p', text: 'Either answer earns the marks: a NumPy random sample (`np.random.seed` makes it repeatable) or a small pandas DataFrame typed in by hand. The DataFrame is reused for stratified sampling below. "Sample" here just means a small dataset in Python; do not write more than the question needs.' },

        { t: 'h', text: 'Q15 (4 marks): first and third quartile' },
        code('e15'),
        { t: 'p', text: '`np.percentile(data, 25)` and `np.percentile(data, 75)` give the quartiles; pandas `quantile(0.25)` agrees. Both use **linear interpolation**: position $0.25\\times(8-1)=1.75$ lies between 7 and 8, so $Q_1=7+0.75=7.75$.' },
        { t: 'callout', kind: 'warn', title: 'Q1 = 7.75 here, but 7.5 or 7.25 in your class notes', text: 'For 4, 7, 8, 10, 12, 15, 18, 21 the three common conventions give different quartiles: **NumPy 7.75 and 15.75** (linear), median-of-halves **7.5 and 16.5**, and the class-notes $(n+1)p$ method **7.25 and 17.25**. For a *Python code* question, the value your code prints is the answer; write a comment such as `# linear interpolation (NumPy default)`. For a *by-hand* question, use the class method. See the quartile chapter at /ch/quartiles-boxplot/0 for the hand methods, and the descriptive page above for the `method=` argument that reproduces each.' },

        { t: 'h', text: 'Q16 (5 marks): mean, median and standard deviation' },
        code('e16'),
        { t: 'p', text: 'Mean and median are both 30. The **sample** SD divides by $n-1$: $\\sqrt{1000/4}=15.811$. Printing the population SD as well ($\\sqrt{1000/5}=14.142$) shows you know the difference, but state which one the question wants; for a "dataset" that is a sample, `ddof=1`.' },

        { t: 'h', text: 'Q17 (5 marks): random sampling and stratified sampling' },
        code('e17'),
        { t: 'p', text: '**Simple random sampling:** `df.sample(n=6)` gives every row an equal chance. **Stratified sampling:** group by the stratum (`group`) and sample the *same fraction* from each group, so both groups stay represented in the same proportions as in the population (8:4 becomes 4:2). The `value_counts` line proves it.' },
        { t: 'callout', kind: 'warn', title: 'Which rows you get depends on the pandas version', text: 'The set of rows chosen with `random_state=1` can differ between pandas or NumPy versions, so do not memorise it. What is guaranteed is the **structure**: 6 rows in total, and for stratified sampling exactly 4 from group A and 2 from group B. In an exam, describe this rather than quoting the printed rows.' },
        { t: 'p', text: 'A second accepted way to stratify uses scikit-learn, where `stratify=` keeps the group proportions:' },
        code('e17b'),

        { t: 'h', text: 'Q18 (5 marks): histogram and boxplot' },
        code('e18'),
        { t: 'p', text: '`plt.hist(data, bins=4)` draws the histogram; `plt.boxplot(data)` draws the box (Q1, median, Q3) with whiskers. `plt.subplot(1, 2, k)` puts them side by side, and `plt.show()` displays the window. Label axes and add a title: those are marks. The printed lines (bin counts and the five numbers) are optional extras that prove what the picture shows: bin width $(93-62)/4=7.75$, counts $1,3,2,2$.' },
        { t: 'callout', kind: 'note', title: 'Marking-friendly minimum', text: 'If you are short of time, `plt.hist(marks)`, `plt.show()`, `plt.boxplot(marks)`, `plt.show()` with the two imports is a valid answer; the axes labels and titles are the finishing touches.' },

        { t: 'h', text: 'Q19 (5 marks): correlation and covariance' },
        code('e19'),
        { t: 'p', text: '`np.cov` returns a 2 by 2 **matrix** with variances on the diagonal and Cov$(x,y)=5$ off the diagonal. `np.corrcoef` gives $r=0.9901$ in the same layout. `stats.pearsonr` returns $r$ and its p-value in one call. Interpretation line: "strong positive linear relationship". The same numbers can come from pandas with `df.cov()` and `df.corr()`:' },
        code('x03'),

        { t: 'h', text: 'Q20 (5 marks): binomial and normal distributions' },
        code('e20'),
        { t: 'p', text: 'Binomial$(5,0.5)$: $P(X=3)=10/32=0.3125$, $P(X\\le3)=26/32=0.8125$, and $P(X\\ge3)=$ `sf(2)` $=16/32=0.5$. Normal$(100,15^2)$: $P(X\\le120)=\\Phi(1.333)=0.9088$, $P(85<X<115)=0.6827$, 95th percentile $=100+1.645\\times15=124.67$. The `scale` is the SD (15), not 225.' },

        { t: 'h', text: 'Q21 (5 marks): hypothesis testing with SciPy' },
        code('e21'),
        { t: 'p', text: '`ttest_1samp` returns the t statistic and a two-sided p-value. Hand check: $\\bar x=50.25$, $s=2.1213$, $t=0.25/0.75=0.333$, $p=0.749>0.05$, so **fail to reject $H_0$**. The `if/else` line is the conclusion in words, which the mark scheme almost always includes. For two independent samples use `ttest_ind`:' },
        code('e21b'),
        { t: 'p', text: 'Here $p=0.0049<0.05$, so the group means differ. Add `equal_var=False` for the Welch test (it gives nearly the same $p$ here).' },
        { t: 'callout', kind: 'tip', title: 'Choosing the test in one line', text: 'One mean against a number: `ttest_1samp`. Two independent groups: `ttest_ind`. Paired before/after: `ttest_rel`. Counts versus expected: `chisquare`. Two categorical variables: `chi2_contingency`. Three or more means: `f_oneway`.' },

        { t: 'h', text: 'Q22 (5 marks): matrix multiplication with NumPy' },
        code('e22'),
        { t: 'p', text: '`A @ B` (equivalently `np.dot(A, B)` or `np.matmul(A, B)`) is the matrix product: entry (1,1) $=1\\cdot2+2\\cdot1=4$. Mention the shape rule: $(m\\times n)(n\\times p)\\to(m\\times p)$. A non-square example:' },
        code('q08'),
        { t: 'p', text: 'A $2\\times3$ times a $3\\times2$ gives $2\\times2$. For example entry (1,1) $=1\\cdot1+2\\cdot0+3\\cdot2=7$.' },

        { t: 'h', text: 'Q23 (5 marks): eigenvalues and eigenvectors' },
        code('e23'),
        { t: 'p', text: 'Characteristic equation $\\lambda^2-7\\lambda+10=0$ gives $\\lambda=5,2$. The eigenvectors are the **columns** of the second output: $(0.7071,0.7071)$ for $\\lambda=5$ and $(-0.4472,0.8944)$ for $\\lambda=2$. A good extra line is `np.allclose(A @ v, lam * v)`.' },

        { t: 'h', text: 'Q24 (5 marks): PCA' },
        code('e24'),
        { t: 'p', text: 'Import `PCA`, build the data matrix (rows = observations, columns = variables), call `fit_transform`, then print the direction, the explained variance ratio and the scores. Reading the result: PC1 points along $(0.725,0.689)$ and carries **97.0%** of the variance, so one component is enough. If the question asks for the *steps*, list: centre, covariance, eigen-decomposition, sort, project (see the PCA page).' },

        { t: 'h', text: 'Q25 (5 marks): one-way ANOVA' },
        code('e25'),
        { t: 'p', text: '`stats.f_oneway(g1, g2, g3)` takes one list per group and returns $F$ and $p$. Here the group means are 9, 12 and 15 with very little spread inside each group, so $F=MSB/MSW=27/1=27$ and $p=0.001<0.05$: **reject $H_0$**, at least one mean differs. The last line prints the decision.' },
        { t: 'callout', kind: 'exam', title: 'Last-minute checklist for Section C', text: 'Imports present. `ddof=1` where "sample SD" is wanted. `@` not `*`. `sf(k-1)` for "at least $k$". Eigenvectors are columns. A labelled `print` on every result. For tests, an `if p <= alpha` conclusion.' },
      ],
    },
    {
      id: 'function-reference',
      title: 'Function reference & lab tips',
      blocks: [
        { t: 'p', text: 'Use this page as the last thing you read before the practical. First the quick reference from the lab sheet, then the **function finder**: type what you want to do (for example "at least", "eigen", "stratified") and it shows the call, a worked example and the result, with a copy button.' },
        { t: 'table', title: 'Quick function reference', head: ['Task', 'Function'], rows: [
          ['Mean', '`np.mean(x)`'],
          ['Median', '`np.median(x)`'],
          ['Sample SD', '`np.std(x, ddof=1)`'],
          ['Mode', '`stats.mode(x, keepdims=False)`'],
          ['Covariance', '`np.cov(x, y)`'],
          ['Correlation', '`np.corrcoef(x, y)`'],
          ['Bernoulli', '`stats.bernoulli.pmf` / `rvs`'],
          ['Binomial', '`stats.binom.pmf` / `cdf` / `sf`'],
          ['Poisson', '`stats.poisson.pmf` / `cdf` / `sf`'],
          ['Normal', '`stats.norm.pdf` / `cdf` / `sf` / `ppf`'],
          ['One-sample t test', '`stats.ttest_1samp`'],
          ['Chi-square goodness of fit', '`stats.chisquare`'],
          ['Chi-square independence', '`stats.chi2_contingency`'],
          ['One-way ANOVA', '`stats.f_oneway`'],
          ['Matrix product', '`A @ B`'],
          ['Determinant', '`np.linalg.det(A)`'],
          ['Inverse', '`np.linalg.inv(A)`'],
          ['Rank', '`np.linalg.matrix_rank(A)`'],
          ['Eigenpairs', '`np.linalg.eig(A)` / `eigh(A)`'],
          ['Norm', '`np.linalg.norm(v)`'],
          ['PCA', '`sklearn.decomposition.PCA`'],
        ] },
        { t: 'widget', name: 'PythonFunctionFinder' },
        { t: 'h', text: 'Lab tips, with the reason behind each' },
        { t: 'list', items: [
          '**Always import the library before using a function.** A `NameError` on the first line costs the whole question.',
          '**Use `ddof=1` for a sample variance or SD.** NumPy’s default divides by $n$ (population); pandas `std()` already divides by $n-1$.',
          '**PMF is for exact probabilities of a discrete variable; CDF is cumulative.** Continuous variables have `pdf` (a density, not a probability).',
          '**For $P(X\\ge k)$ in a discrete distribution use `sf(k-1)`.** `sf(k)` is strictly "more than $k$".',
          '**For continuous interval probabilities, subtract CDF values:** upper minus lower.',
          '**Two-sided z test: double the one-tail probability beyond $|z|$.** Left-tailed: `norm.cdf(z)`. Right-tailed: `norm.sf(z)`.',
          '**Use `@`, not `*`, for matrix multiplication.**',
          '**Eigenvectors from `np.linalg.eig` are columns,** and their signs are arbitrary.',
          '**Centre the data before manual covariance-based PCA.** Standardise (divide by the SD) first when the variables are on very different scales.',
          '**Tiny values such as `6.12e-17` are numerical zero.** Use `np.round` to display and `np.allclose` to compare.',
        ] },
        { t: 'compare', left: { title: 'Population versions (divide by n)', items: ['`np.std(x)`, `np.var(x)` (default `ddof=0`)', '`np.cov(x, y, ddof=0)`', 'Use only when the data are the whole population'] },
          right: { title: 'Sample versions (divide by n - 1)', items: ['`np.std(x, ddof=1)`, `np.var(x, ddof=1)`', '`np.cov(x, y)` (default is already $n-1$)', 'pandas `describe()`, `.std()`, `.var()`, `.cov()`', 'Use for any dataset that is a sample'] } },
        { t: 'callout', kind: 'exam', title: 'Remember', text: 'Know these four cold: **`ddof=1`**, **`sf(k-1)`**, **`@`**, **eigenvectors in columns**. Most lost marks in the practical come from one of them.' },
      ],
    },
  ],
  formulas: [
    { name: 'Sample variance and SD (ddof=1)', tex: 's^2=\\frac{\\sum(x_i-\\bar x)^2}{n-1},\\quad s=\\sqrt{s^2}', note: '`np.var(x, ddof=1)`, `np.std(x, ddof=1)`' },
    { name: 'P(X at least k), discrete', tex: 'P(X\\ge k)=P(X>k-1)=\\text{sf}(k-1)=1-\\text{cdf}(k-1)', note: '`dist.sf(k-1, ...)`' },
    { name: 'Interval between two values (continuous)', tex: 'P(a<X<b)=F(b)-F(a)', note: '`norm.cdf(b, mu, sd) - norm.cdf(a, mu, sd)`' },
    { name: 'z confidence interval', tex: '\\bar x\\pm z_{\\alpha/2}\\dfrac{\\sigma}{\\sqrt n}', note: '`z = norm.ppf(1 - alpha/2)`; one-sided uses `norm.ppf(1 - alpha)`' },
    { name: 't confidence interval', tex: '\\bar x\\pm t_{\\alpha/2,\\,n-1}\\dfrac{s}{\\sqrt n}', note: '`t.ppf(1 - alpha/2, df=n-1)`' },
    { name: 'Proportion interval', tex: '\\hat p\\pm z_{\\alpha/2}\\sqrt{\\dfrac{\\hat p(1-\\hat p)}{n}}' },
    { name: 'z test statistic', tex: 'z=\\dfrac{\\bar x-\\mu_0}{\\sigma/\\sqrt n}', note: 'two-sided p = `2*norm.sf(abs(z))`; left `norm.cdf(z)`; right `norm.sf(z)`' },
    { name: 'Chi-square statistic', tex: '\\chi^2=\\sum\\dfrac{(O-E)^2}{E},\\quad df_{\\text{GOF}}=k-1,\\ df_{\\text{indep}}=(r-1)(c-1)' },
    { name: 'One-way ANOVA', tex: 'F=\\dfrac{MSB}{MSW}=\\dfrac{SSB/(k-1)}{SSW/(N-k)}' },
    { name: 'Matrix product shape', tex: '(m\\times n)(n\\times p)=m\\times p', note: '`A @ B`' },
    { name: 'Eigenpair check', tex: 'Av=\\lambda v', note: '`np.allclose(A @ v, lam * v)`' },
    { name: 'Projection onto a unit vector', tex: 'P=uu^T,\\quad Pv=(u\\cdot v)\\,u', note: '`np.outer(u, u)`' },
    { name: 'PCA', tex: 'C=\\dfrac{X_c^TX_c}{n-1},\\quad \\text{ratio}_i=\\dfrac{\\lambda_i}{\\sum\\lambda_j}', note: 'centre first; scores `Xc @ pc1`' },
  ],
  cheat: [
    '**Imports first:** `numpy as np`, `pandas as pd`, `from scipy import stats`, `matplotlib.pyplot as plt`, `sklearn.decomposition.PCA`.',
    '**Sample SD = `np.std(x, ddof=1)`.** pandas `describe()` and `.std()` are already sample. `np.var` and `np.std` default to the population.',
    '**Distribution methods:** `pmf` exact, `cdf` at most, `sf` more than, `ppf` inverse. At least $k$ = **`sf(k-1)`**.',
    '**Normal:** `norm.cdf(x, mu, sigma)`; `scale` is the SD, not the variance. Interval = cdf(upper) minus cdf(lower). `ppf` takes a probability between 0 and 1.',
    '**Intervals:** two-sided `ppf(1 - alpha/2)`, one-sided `ppf(1 - alpha)`; unknown $\\sigma$: `t.ppf(..., df=n-1)` and `ddof=1`.',
    '**Tests:** p-value $\\le\\alpha$ means reject. Left tail `cdf`, right tail `sf`, two-sided doubles. Tests: `ttest_1samp`, `ttest_ind`, `chisquare`, `chi2_contingency(correction=False)`, `f_oneway`.',
    '**Linear algebra:** `@` is the matrix product; `np.linalg.det / inv / matrix_rank / eig / norm`. Eigenvectors are **columns**, signs are arbitrary.',
    '**Rotation** needs radians (`np.deg2rad`) and `np.round` to clean $6\\times10^{-17}$. Projection onto a line: normalise $u$, then `np.outer(u, u) @ v`. Combined transformations act right to left.',
    '**PCA:** centre, covariance (`rowvar=False`), `eigh`, sort descending, project. scikit-learn `PCA(n_components=k).fit_transform(X)`; `components_` are rows; ratios sum to 1.',
    '**Quartiles in NumPy:** linear interpolation gives Q1 = 7.75 and Q3 = 15.75 for 4, 7, 8, 10, 12, 15, 18, 21 (class notes: 7.25 and 17.25; median of halves: 7.5 and 16.5). Always say which.',
  ],
  pitfalls: [
    { wrong: '`binom.sf(3, 10, 0.4)` for $P(X\\ge3)$', right: '`binom.sf(2, 10, 0.4)`', why: '`sf(k)` is $P(X>k)$, so "at least 3" needs `sf(3-1)`.' },
    { wrong: '`np.std(data)` for a sample SD', right: '`np.std(data, ddof=1)`', why: 'The default divides by $n$ (population SD), which is too small for a sample.' },
    { wrong: '`A * B` for a matrix product', right: '`A @ B`', why: '`*` multiplies matching entries; it is not matrix multiplication.' },
    { wrong: '`eigenvectors[0]` as the first eigenvector', right: '`eigenvectors[:, 0]`', why: '`eig` stores the eigenvectors as columns.' },
    { wrong: '`norm.cdf(x, 100, 225)` for $N(100,15^2)$', right: '`norm.cdf(x, 100, 15)`', why: '`scale` is the standard deviation, not the variance.' },
    { wrong: '`norm.ppf(0.975)` for a one-sided 95% bound', right: '`norm.ppf(0.95)`', why: 'One-sided puts all 5% in one tail; only two-sided uses $\\alpha/2$.' },
    { wrong: 'Reading a 2 by 2 `chi2_contingency` result as the hand value', right: 'Use `correction=False` to match the hand calculation', why: 'The default Yates correction gives 3.24 instead of 4.00 for [[30,20],[20,30]].' },
    { wrong: 'Copying a simulated string (`rvs`) or random sample into the answer', right: 'Describe the method; the output varies with seed and version', why: 'Only the structure (sample size, group counts) is guaranteed.' },
  ],
  corrections: [],
  mcq: place([
    { q: 'For $X\\sim\\text{Binomial}(10, 0.4)$ which call gives $P(X\\ge3)$?',
      options: ['`binom.sf(3, 10, 0.4)`', '`binom.sf(2, 10, 0.4)`', '`binom.cdf(3, 10, 0.4)`', '`binom.pmf(3, 10, 0.4)`'], answer: 1,
      why: '`sf(k)` is $P(X>k)$, so $P(X\\ge3)=P(X>2)=$ `sf(2)` $=0.8327$. `sf(3)` is $P(X\\ge4)=0.6177$; `cdf(3)` is $P(X\\le3)$; `pmf(3)` is exactly 3.' },
    { q: 'What does `np.std([2, 4, 4, 4, 5, 5, 7, 9])` print?',
      options: ['2.138', '4.0', '2.0', '2.236'], answer: 2,
      why: 'No `ddof`, so NumPy divides by $n=8$: mean 5, squared deviations add to 32, variance $32/8=4$, SD $=2.0$. With `ddof=1` it would be $\\sqrt{32/7}=2.138$.' },
    { q: 'With $A=\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}$ and $B=\\begin{pmatrix}2&0\\\\1&5\\end{pmatrix}$, what does `A * B` return?',
      options: ['[[4, 10], [10, 20]]', '[[2, 0], [3, 20]]', '[[3, 2], [4, 9]]', 'A shape error'], answer: 1,
      why: '`*` multiplies matching entries: $1\\cdot2,\\ 2\\cdot0;\\ 3\\cdot1,\\ 4\\cdot5$. The matrix product `A @ B` is [[4, 10], [10, 20]].' },
    { q: 'For $X\\sim N(100,10^2)$, roughly what does `norm.cdf(110, 100, 10)` return?',
      options: ['0.1587', '0.6827', '0.9772', '0.8413'], answer: 3,
      why: '$z=(110-100)/10=1$ and $\\Phi(1)=0.8413$. 0.1587 is the right tail `sf`; 0.6827 is the area within one SD of the mean.' },
    { q: 'Which line gives the critical value for a 95% **one-sided** z interval?',
      options: ['`norm.ppf(0.975)`', '`norm.ppf(0.95)`', '`norm.ppf(0.05)`', '`norm.cdf(0.95)`'], answer: 1,
      why: 'One-sided: all 5% is in one tail, so look up 0.95 to get 1.645. 0.975 (1.96) is for two-sided. `norm.ppf(0.05)` is $-1.645$, the left-tail critical value.' },
    { q: '`values, vectors = np.linalg.eig(A)`. Which expression is the eigenvector for `values[0]`?',
      options: ['`vectors[0]`', '`vectors[:, 0]`', '`vectors.T[1]`', '`values[0] * vectors`'], answer: 1,
      why: '`eig` stores eigenvectors as **columns**, so the first eigenvector is the first column, `vectors[:, 0]`. `vectors[0]` is the first row.' },
    { q: 'For the table `[[30, 20], [20, 30]]`, what does `chi2_contingency(table)` (default arguments) report as the chi-square statistic?',
      options: ['4.00', '3.24', '1.00', '0.0455'], answer: 1,
      why: 'For a 2 by 2 table SciPy applies Yates\u2019 correction by default: each $|O-E|=5$ is reduced to $4.5$, giving $\\chi^2=4\\times4.5^2/25=3.24$ ($p=0.0719$). `correction=False` gives 4.00 ($p=0.0455$); 0.0455 is that p-value.' },
    { q: 'What does `stats.f_oneway(g1, g2, g3)` return?',
      options: ['The group means', 'The F statistic and the p-value', 'Only the p-value', 'The SSB and SSW'], answer: 1,
      why: 'It returns the pair $(F, p)$. For groups 8, 9, 10 / 11, 12, 13 / 14, 15, 16 it is $F=27$, $p=0.001$.' },
    { q: 'The code `R @ np.array([1, 0])` for a 90-degree rotation prints `[6.123234e-17 1.000000e+00]`. How should you read it?',
      options: ['The rotation is wrong', 'It is $(0,1)$; the 6e-17 is rounding noise', 'It is $(6,1)$', 'The angle must be in degrees'], answer: 1,
      why: '$\\cos90^\\circ=0$ exactly, but $\\pi/2$ is stored approximately. The tiny entry is numerical zero; `np.round(..., 10)` shows $(0,1)$. Angles must be in radians, which `np.deg2rad` supplies.' },
    { q: 'A `ttest_1samp` returns $t=0.333$ with $p=0.749$ at $\\alpha=0.05$. What is the correct conclusion?',
      options: ['Reject $H_0$; the mean is 50', 'Fail to reject $H_0$; no evidence the mean differs from the hypothesised value', 'Accept $H_0$ as proven', 'Reject $H_0$ because $t<1$'], answer: 1,
      why: '$p=0.749>0.05$, so we fail to reject $H_0$. That means "not enough evidence", not "proved true".' },
    { q: '`PCA(n_components=1).fit_transform(X)` is applied to a 3 by 2 array `X`. What are the shapes of the result and of `pca.components_`?',
      options: ['(3, 2) and (2, 1)', '(3, 1) and (1, 2)', '(1, 3) and (2, 1)', '(3, 1) and (2, 1)'], answer: 1,
      why: 'Three observations, one score each: `(3, 1)`. `components_` has one **row** per component and one column per original variable: `(1, 2)`.' },
    { q: 'For $X\\sim\\text{Poisson}(2)$, which value does `poisson.sf(1, 2)` return?',
      options: ['0.406', '0.271', '0.594', '0.135'], answer: 2,
      why: '`sf(1)` $=P(X>1)=P(X\\ge2)=1-e^{-2}(1+2)=1-0.406=0.594$. 0.406 is `cdf(1)`, 0.271 is `pmf(1)`, 0.135 is `pmf(0)`.' },
    { q: 'What does `np.percentile([4, 7, 8, 10, 12, 15, 18, 21], 25)` return?',
      options: ['7.25', '7.5', '7.75', '8'], answer: 2,
      why: 'NumPy\u2019s default is linear interpolation at position $0.25\\times7=1.75$: $7+0.75\\times(8-7)=7.75$. 7.25 is the class-notes $(n+1)p$ answer and 7.5 is median of halves.' },
    { q: 'What does `norm.ppf(95)` return?',
      options: ['1.645', '`nan` (the argument must be a probability between 0 and 1)', '95', '0.95'], answer: 1,
      why: '`ppf` is the inverse cdf and expects a probability. 95 is outside $[0,1]$ so SciPy returns `nan`. Use `norm.ppf(0.95)` to get 1.645.' },
    { q: '`df.groupby("group").sample(frac=0.5)` is applied to 12 rows (8 in group A, 4 in group B). How many rows come from each group?',
      options: ['6 from A and 0 from B', '4 from A and 2 from B', '3 from A and 3 from B', 'It depends on the random seed'], answer: 1,
      why: 'Stratified sampling takes the same fraction from every group: 50% of 8 is 4 and 50% of 4 is 2. Which specific rows are chosen depends on the seed, but the counts do not.' },
    { q: 'What happens when you run `np.ones((2, 3)) @ np.ones((2, 3))`?',
      options: ['A (2, 3) matrix of 2s', 'A (2, 2) matrix', 'A `ValueError`: inner dimensions 3 and 2 do not match', 'A (3, 3) matrix'], answer: 2,
      why: '$(2\\times3)(2\\times3)$ needs the inner sizes to match (3 against 2), so NumPy raises a `ValueError`. You would need to transpose one factor.' },
  ], [2, 0, 3, 1, 3, 0, 2, 1, 3, 2, 0, 1, 2, 3, 0, 1]),
  problems: [
    { id: 'p1', source: 'Practice doc Task 1', difficulty: 'easy', marks: 5, q: 'Given the data [5, 7, 7, 8, 10, 12], write Python code to find the mean, median, mode, sample variance and sample standard deviation.',
      hint: 'Mean/median/var/std are in NumPy; the mode is in `scipy.stats`. Use `ddof=1`.',
      steps: [fmt('t01'), 'Hand check: mean $49/6=8.1667$; median $(7+8)/2=7.5$; mode 7; $s^2=30.833/5=6.1667$.'],
      answer: 'Mean 8.1667, median 7.5, mode 7, sample variance 6.1667, sample SD 2.4833.' },
    { id: 'p2', source: 'Practice doc Task 2', difficulty: 'easy', marks: 4, q: 'For a Bernoulli variable with $p=0.8$, find $P(X=1)$, $P(X=0)$ and simulate 10 trials.',
      hint: '`bernoulli.pmf(k, p)` and `bernoulli.rvs(p, size=10)`.',
      steps: [fmt('t02'), '$P(X=1)=p=0.8$; $P(X=0)=1-p=0.2$ (the long decimal is floating-point noise).', 'The simulated list changes with the seed and version; about 8 of the 10 trials should be 1s on average.'],
      answer: '$P(X=1)=0.8$, $P(X=0)=0.2$; simulated trials are a random 0/1 list (one run gave 9 successes).' },
    { id: 'p3', source: 'Practice doc Task 3', difficulty: 'medium', marks: 5, q: 'For $X\\sim\\text{Binomial}(n=12,\\ p=0.3)$ find $P(X=4)$, $P(X\\le4)$ and $P(X\\ge5)$ in Python.',
      hint: '$P(X\\ge5)=P(X>4)=$ `sf(4)`.',
      steps: [fmt('t03'), 'Hand check: $P(X=4)=495\\times0.3^4\\times0.7^8=0.2311$, and $1-0.7237=0.2763$.'],
      answer: '$P(X=4)=0.2311$, $P(X\\le4)=0.7237$, $P(X\\ge5)=0.2763$.' },
    { id: 'p4', source: 'Practice doc Task 4', difficulty: 'medium', marks: 5, q: 'For $X\\sim\\text{Poisson}(\\lambda=2.5)$ find $P(X=0)$, $P(X\\le3)$ and $P(X>3)$.',
      hint: '"More than 3" is exactly `sf(3)`.',
      steps: [fmt('t04'), '$P(X=0)=e^{-2.5}=0.0821$; $P(X\\le3)=e^{-2.5}(1+2.5+3.125+2.6042)=0.7576$; $P(X>3)=1-0.7576=0.2424$.'],
      answer: '$P(X=0)=0.0821$, $P(X\\le3)=0.7576$, $P(X>3)=0.2424$.' },
    { id: 'p5', source: 'Practice doc Task 5', difficulty: 'medium', marks: 5, q: 'For $X\\sim N(70,10^2)$ find $P(X<60)$, $P(60<X<80)$ and the 90th percentile.',
      hint: '`scale` is 10. Interval probability = cdf(80) - cdf(60). Percentile uses `ppf`.',
      steps: [fmt('t05'), '$z=-1$: $\\Phi(-1)=0.1587$. The interval is $\\mu\\pm\\sigma$: $0.6827$. 90th percentile $=70+1.2816\\times10$.'],
      answer: '$0.1587$, $0.6827$ and $82.82$.' },
    { id: 'p6', source: 'Practice doc Task 6', difficulty: 'medium', marks: 5, q: 'Construct a 99% two-sided z confidence interval for $\\mu$ when $\\bar x=80$, $\\sigma=12$, $n=100$.',
      hint: 'Two-sided: `norm.ppf(1 - 0.01/2)`.',
      steps: [fmt('t06'), '$SE=12/10=1.2$, $z=2.5758$, margin $=3.091$.'],
      answer: '99% CI: $(76.91,\\ 83.09)$.' },
    { id: 'p7', source: 'Practice doc Task 7', difficulty: 'medium', marks: 4, q: 'Construct a 95% lower confidence bound for $\\mu$ when $\\bar x=40$, $\\sigma=6$, $n=36$.',
      hint: 'One-sided: `norm.ppf(0.95)`, not 0.975.',
      steps: [fmt('t07'), '$SE=6/6=1$, so lower bound $=40-1.645=38.355$.'],
      answer: 'Lower bound $38.36$; the interval is $(38.36,\\ \\infty)$.' },
    { id: 'p8', source: 'Practice doc Task 8', difficulty: 'medium', marks: 5, q: 'For 180 successes out of 300 trials, construct a 95% two-sided confidence interval for the proportion.',
      hint: '$SE=\\sqrt{\\hat p(1-\\hat p)/n}$ with $\\hat p=0.6$.',
      steps: [fmt('t08'), '$SE=\\sqrt{0.24/300}=0.02828$; margin $=1.96\\times0.02828=0.0554$.'],
      answer: '95% CI for $p$: $(0.545,\\ 0.655)$.' },
    { id: 'p9', source: 'Practice doc Task 9', difficulty: 'medium', marks: 5, q: 'Test $H_0:\\mu=25$ against $H_1:\\mu\\ne25$ with $\\bar x=27$, $\\sigma=8$, $n=64$, using both the p-value and the critical-value approaches at $\\alpha=0.05$.',
      hint: 'Two-sided: double the tail beyond $|z|$.',
      steps: [fmt('t09'), '$z=(27-25)/(8/8)=2$; p-value $=2\\times0.02275=0.0455$; critical $\\pm1.96$.'],
      answer: '$z=2$, $p=0.0455\\le0.05$ and $|z|>1.96$: reject $H_0$ by both methods; the mean differs from 25.' },
    { id: 'p10', source: 'Practice doc Task 10', difficulty: 'medium', marks: 5, q: 'Test $H_0:\\mu=100$ against $H_1:\\mu<100$ with $\\bar x=96$, $\\sigma=10$, $n=25$ at $\\alpha=0.05$.',
      hint: 'Left-tailed: p-value is `norm.cdf(z)`, critical value `norm.ppf(alpha)`.',
      steps: [fmt('t10'), '$z=-4/2=-2$; $p=\\Phi(-2)=0.02275$; critical value $-1.645$.'],
      answer: '$z=-2$, $p=0.0228<0.05$ (and $-2<-1.645$): reject $H_0$; the mean is below 100.' },
    { id: 'p11', source: 'Practice doc Task 11', difficulty: 'easy', marks: 4, q: 'Use NumPy to find the determinant, inverse and rank of $\\begin{pmatrix}2&1\\\\5&3\\end{pmatrix}$.',
      hint: '`np.linalg.det`, `inv`, `matrix_rank`.',
      steps: [fmt('t11'), '$\\det=6-5=1$, and $A^{-1}=\\frac11\\begin{pmatrix}3&-1\\\\-5&2\\end{pmatrix}$.'],
      answer: '$\\det=1$, $A^{-1}=\\begin{pmatrix}3&-1\\\\-5&2\\end{pmatrix}$, rank 2.' },
    { id: 'p12', source: 'Practice doc Task 12', difficulty: 'medium', marks: 5, q: 'Use NumPy to find the eigenvalues and eigenvectors of $\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$ and verify one eigenpair.',
      hint: 'Eigenvectors are the columns; check `A @ v` against `lam * v`.',
      steps: [fmt('t12'), '$\\lambda^2-4\\lambda+3=0$ gives $\\lambda=3,1$; for $\\lambda=3$, $v=(1,1)/\\sqrt2$ and $Av=(3,3)/\\sqrt2=3v$.'],
      answer: '$\\lambda=3$ with $(0.7071,0.7071)$ and $\\lambda=1$ with $(-0.7071,0.7071)$; the verification prints `True`.' },
    { id: 'p13', source: 'Practice doc Task 13', difficulty: 'easy', marks: 4, q: 'Rotate the vector $(2,0)$ by 45 degrees using a rotation matrix.',
      hint: 'Convert degrees to radians with `np.deg2rad`.',
      steps: [fmt('t13'), '$Rv=(2\\cos45^\\circ,\\ 2\\sin45^\\circ)=(\\sqrt2,\\sqrt2)$.'],
      answer: '$(1.4142,\\ 1.4142)$.' },
    { id: 'p14', source: 'Practice doc Task 14', difficulty: 'medium', marks: 4, q: 'Project $(4,2)$ onto the direction $(1,1)$.',
      hint: 'Normalise $u$ first, then $P=uu^T$.',
      steps: [fmt('t14'), '$v\\cdot u=6/\\sqrt2$, times $u$ gives $\\frac62(1,1)=(3,3)$.'],
      answer: 'Projection $(3,3)$.' },
    { id: 'p15', source: 'Practice doc Task 15', difficulty: 'easy', marks: 3, q: 'Reflect the vector $(-3,5)$ across the y-axis.',
      hint: 'Flip the sign of $x$ only.',
      steps: [fmt('t15'), 'The matrix $\\mathrm{diag}(-1,1)$ negates $x$.'],
      answer: '$(3,5)$.' },
    { id: 'p16', source: 'Practice doc Task 16', difficulty: 'hard', marks: 6, q: 'For $X=\\begin{pmatrix}1&1\\\\2&2\\\\3&3\\\\4&4\\end{pmatrix}$ perform PCA manually and with scikit-learn and compare the explained variance ratios.',
      hint: 'Centre, covariance with `rowvar=False`, `eigh`, sort descending.',
      steps: [fmt('t16'), 'Covariance $=\\frac53\\begin{pmatrix}1&1\\\\1&1\\end{pmatrix}$, eigenvalues $3.333$ and $0$.', 'Both methods give the same ratios because the points lie exactly on the line $y=x$.'],
      answer: 'Explained variance ratios $(1,\\ 0)$ for both methods: PC1 $=(0.7071,0.7071)$ explains 100%.' },
    { id: 'p17', source: 'Extra (ESA Q16 style)', difficulty: 'easy', marks: 5, q: 'For the data 12, 15, 11, 19, 14, 18, 13, 17 write code to print the mean, median, sample SD, $Q_1$, $Q_3$ and IQR.',
      hint: '`np.percentile(d, [25, 75])`.',
      steps: [fmt('q01'), 'Sorted: 11, 12, 13, 14, 15, 17, 18, 19. Mean $=119/8=14.875$; median $=(14+15)/2=14.5$.', 'Linear quartiles: $Q_1$ at position 1.75 gives $12.75$; $Q_3$ at position 5.25 gives $17.25$.'],
      answer: 'Mean 14.875, median 14.5, $s=2.900$, $Q_1=12.75$, $Q_3=17.25$, IQR $=4.5$ (NumPy convention).' },
    { id: 'p18', source: 'Extra (ESA Q20 style)', difficulty: 'medium', marks: 5, q: 'A batch of 8 items has each item defective with probability 0.1. Write code for $P(X=0)$, $P(X\\ge2)$ and $P(X\\le2)$.',
      hint: '$P(X\\ge2)=$ `sf(1)`.',
      steps: [fmt('q02'), '$P(X=0)=0.9^8=0.4305$; $P(X\\ge2)=1-0.4305-8(0.1)(0.9)^7=1-0.4305-0.3826=0.1869$; $P(X\\le2)=0.9619$.'],
      answer: '$0.4305$, $0.1869$ and $0.9619$.' },
    { id: 'p19', source: 'Extra (ESA Q20 style)', difficulty: 'easy', marks: 4, q: 'Calls arrive as a Poisson process with mean 2 per minute. Write code for $P(X\\le1)$ and $P(X\\ge2)$ in a minute.',
      hint: 'The two answers add to 1.',
      steps: [fmt('q03'), '$P(X\\le1)=e^{-2}(1+2)=0.4060$ and $P(X\\ge2)=1-0.4060=0.5940$.'],
      answer: '$0.4060$ and $0.5940$.' },
    { id: 'p20', source: 'Extra (ESA Q20 style)', difficulty: 'medium', marks: 4, q: 'For $X\\sim N(70,10^2)$ write code for $P(65<X<75)$ and the 25th percentile.',
      hint: 'cdf(upper) minus cdf(lower); `ppf(0.25, ...)`.',
      steps: [fmt('q04'), '$z=\\pm0.5$ gives $2\\Phi(0.5)-1=0.3829$; $70-0.6745\\times10=63.26$.'],
      answer: '$0.3829$ and $63.26$.' },
    { id: 'p21', source: 'Extra (confidence interval)', difficulty: 'medium', marks: 5, q: 'Six measurements 5.1, 4.9, 5.3, 5.0, 5.2, 4.8 come from a normal population with unknown $\\sigma$. Write code for a 95% confidence interval for the mean.',
      hint: '`stats.sem` for the standard error and `t.interval`.',
      steps: [fmt('q05'), 'Mean $5.05$; $s=0.18708$; $SE=0.07638$; $t_{0.975,5}=2.5706$; margin $=0.1963$.'],
      answer: '95% CI $(4.854,\\ 5.246)$.' },
    { id: 'p22', source: 'Extra (spot the error)', difficulty: 'medium', marks: 3, q: 'A student wants $P(X\\ge3)$ for $X\\sim\\text{Binomial}(10,0.4)$ and writes `binom.sf(3, 10, 0.4)`. Is it right? Fix it.',
      hint: 'What does `sf(3)` mean exactly?',
      steps: [fmt('q06'), '`sf(3)` $=P(X>3)=P(X\\ge4)$, which leaves out $P(X=3)=0.2150$. Indeed $0.6177+0.2150=0.8327$.'],
      answer: 'Wrong. Use `binom.sf(2, 10, 0.4)` $=0.8327$; the student\u2019s value 0.6177 is $P(X\\ge4)$.' },
    { id: 'p23', source: 'Extra (ESA Q25 style)', difficulty: 'medium', marks: 5, q: 'Three machines give A = 5, 7, 9; B = 6, 8, 10; C = 9, 11, 13. Write code to test at 5% whether the mean outputs differ.',
      hint: '`stats.f_oneway(A, B, C)`.',
      steps: [fmt('q07'), 'Group means $7,\\ 8,\\ 11$; $SSB=26$, $MSB=13$; $SSW=24$, $MSW=4$; $F=3.25$ with $(2,6)$ df.', '$p=0.1106>0.05$ (the 5% critical value is $5.143$).'],
      answer: '$F=3.25$, $p=0.111$: fail to reject $H_0$; no evidence that the means differ.' },
    { id: 'p24', source: 'Extra (chi-square GOF)', difficulty: 'medium', marks: 5, q: 'A die is rolled 60 times giving counts 8, 12, 9, 11, 10, 10 for faces 1 to 6. Write code to test whether it is fair at 5%.',
      hint: '`chisquare(observed)` assumes equal expected counts.',
      steps: [fmt('q09'), 'Expected 10 each: $\\chi^2=(4+4+1+1+0+0)/10=1.0$ with $df=5$; critical value $11.07$.'],
      answer: '$\\chi^2=1.0$, $p=0.963$: fail to reject; the counts are consistent with a fair die.' },
    { id: 'p25', source: 'Extra (chi-square independence)', difficulty: 'hard', marks: 5, q: 'For the table [[30, 20], [20, 30]] compute the chi-square test of independence with and without Yates\u2019 correction, and state the decision at 5% for each.',
      hint: 'Use `correction=False` for the uncorrected version.',
      steps: [fmt('q10'), 'Expected counts: every row and column total is 50 and the grand total is 100, so each $E=25$ and each $|O-E|=5$.', 'Without correction: $\\chi^2=4\\times\\dfrac{5^2}{25}=4.00$, $df=1$, $p=0.0455$.', 'With Yates: $4\\times\\dfrac{(5-0.5)^2}{25}=4\\times0.81=3.24$, $p=0.0719$.'],
      answer: 'Uncorrected: $\\chi^2=4.00$, $p=0.0455<0.05$, reject independence. Corrected (SciPy default): $\\chi^2=3.24$, $p=0.0719>0.05$, do not reject. The decision flips, so state which version you used.' },
  ],
  refs: [
    { title: 'SciPy: scipy.stats reference', url: 'https://docs.scipy.org/doc/scipy/reference/stats.html', note: 'All distributions, tests and their arguments' },
    { title: 'SciPy: scipy.stats.binom', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.binom.html', note: 'pmf, cdf, sf, ppf for the binomial' },
    { title: 'NumPy: numpy.percentile', url: 'https://numpy.org/doc/stable/reference/generated/numpy.percentile.html', note: 'The method argument and the quartile conventions' },
    { title: 'NumPy: numpy.linalg.eig', url: 'https://numpy.org/doc/stable/reference/generated/numpy.linalg.eig.html', note: 'Eigenvectors returned as columns' },
    { title: 'pandas: DataFrame.sample', url: 'https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.sample.html', note: 'Random and stratified (with groupby) sampling' },
    { title: 'scikit-learn: PCA', url: 'https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html', note: 'components_, explained_variance_ratio_' },
    { title: 'SciPy: scipy.stats.chi2_contingency', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.chi2_contingency.html', note: 'Yates correction and the four outputs' },
    { title: 'Matplotlib: pyplot.hist', url: 'https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.hist.html', note: 'Histogram bins and options' },
  ],
};
