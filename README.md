# COSMOS LAB — The Mathematical Universe

## Chaos Forge — interactive nonlinear mathematics

Launch **[/chaos.html](https://cosmos-lab-v3.vercel.app/chaos.html)** (or `/chaos`).

- Live logistic-map bifurcation diagram: click the plot to change the parameter `r`.
- Finite-time Lyapunov spectrum `λ(r)`, with separate stable and sensitive regimes.
- Moving cobweb iteration, two nearby orbits, and log-scale separation graph.
- Presets for fixed point, period-2, period-4, onset of chaos, chaotic regimes.
- Pause, resume, single-step, adjustable speed, initial condition and perturbation.
- Export current numerical histories as CSV; capture all graphs in one PNG; share parameterized experiment URLs.
- Pure numerical module `chaos-core.js`, UI `chaos.js`, stylesheet `chaos.css` and `tests/chaos_smoke.cjs`.
- Automated GitHub Actions checks in `.github/workflows/chaos-validation.yml`.

Finite-time Lyapunov values and approximate orbit periods depend on sample length, numerical precision and initialization. **Chaos is deterministic; no physical or quantum discovery is claimed.** This module uses no external data or third-party runtime dependencies.

### Further research ideas

- Dedicated ODE/PDE solver with numerical error control.
- Parameter sweeps run in Web Workers to keep the interface responsive.
- Versioned experiment notebooks, side-by-side comparisons, convergence plots.
- Properly sourced observed datasets and explicit distinctions between simulations and measurements.


A standalone, browser-based mathematical research workbench, prepared for GitHub and Vercel. New visual identity includes a real tab favicon (`assets/favicon.ico`, `assets/icon-64.png`), Android/PWA icons, and a manifest.

## Visual Research Studio 4.0

Visit `/studio.html` or `/studio` for ten **animated, interactive** physical and mathematical experiments with live analytical time-series graphs, sliders, pause, speed, step and restart.

- Lorenz attractor, nonlinear double pendulum and softened N-body gravity (RK4 and velocity Verlet).
- Wave interference, analytic free Gaussian quantum packet and Bloch-sphere precession.
- Gray–Scott reaction–diffusion, 2D Ising Metropolis Monte Carlo, flat wCDM expansion and chaotic advection.
- Experiment snapshots and CSV exports, local saved configurations, conceptual theory graph.
- Local pixel image analysis: RGB histograms and Sobel edge maps. No image data is uploaded to the application server. Pixel analysis is not scientific chart calibration or image classification.
- `studio-engine.js` keeps mathematical simulation routines separate from drawing code; `studio.js` and `studio.css` contain rendering and interface styles.
- `tests/studio_smoke.cjs` validates finite numerical output and selected conserved quantities.

Every model uses simplified or normalized conditions. Numerical convergence and energy drift checks are not experimental confirmation. The original 301-expression Atlas and 11 original workbench methods remain available.

## Current features

- A source-controlled catalog of 301 explicitly specified real-valued mathematical expressions spanning 31 categories. Every entry has formula, domain, two parameters, and a statement of approximation/meaning.
- Eleven executable experiment types: function explorer, numerical differentiation, trapezoidal integration, bisection root finding, RK4 differential equations, seeded Monte Carlo quadrature, grid-plus-golden-section minimization, Lorenz dynamics, SIR compartment dynamics, quantum two-level probability density and discrete Fourier transform.
- Seven-curve parameter sweeps, responsive 2D plots, finite-value checks, local experiment journal, JSON and CSV export.
- Safe, restricted expression parser. No `eval`, `new Function` or arbitrary Python/JavaScript execution.
- Responsive interface, dark favicon, PWA manifest.

## Running locally

This site is intentionally dependency-free. From the project directory:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/`.

## Publishing to GitHub

Create a new **empty** repository named `cosmos-lab` in your GitHub account. Do not initialize with a README, as this ZIP already contains one. Then run from this directory:

```bash
git init
git add .
git commit -m "Create COSMOS LAB scientific workbench v3"
git branch -M main
git remote add origin https://github.com/mariodinakus/cosmos-lab.git
git push -u origin main
```

Alternatively use GitHub's **Upload files** interface to drag these project files into the new repository. Keep the file paths and subfolders intact.

## Vercel

Import your GitHub repository in Vercel using **Other** framework, leave the build command empty and use root directory `./`. The repository is a zero-build static site. On every push, Vercel can automatically deploy the updated content.

**Important:** The existing live `cosmos-lab` Vercel project is an independent deployment. Do not point its production domain at this package without first comparing functionality and retaining a backup. This repository-ready implementation was rebuilt as a self-contained project; it does not claim to contain the original deployed application's complete source.

## Scientific honesty

Models are simplified and often normalized. They are educational/numerical experiments, not established experimental validations. Finiteness checks **do not** verify the physical correctness of equations. RK4 step-doubling differences are rough convergence indicators, not rigorous global error estimates; Monte Carlo intervals are approximate. The explicit SIR compartments are toy model outputs, not epidemiological forecasts. Optimizer provides an approximate candidate and is not a proof of global minimum. The catalog deliberately names and documents approximations rather than pretending to solve unsolved mathematics.

## Tests

`node tests/smoke.cjs` checks that model entries, domains, descriptions and IDs are consistent, that every input expression can be parsed/evaluated with the actual browser engine (when an optional browser driver is installed), and that favicon assets are present. No third-party dependencies are needed for basic checks.

## Files

- `index.html` — main responsive UI
- `app.js` — AST-style safe parser, solvers, chart, experiments and journal
- `models.js` — generated catalog
- `build_models.py` — reproducible model catalog generation
- `styles.css` — site design
- `assets` — favicons, PWA images
- `manifest.webmanifest`, `vercel.json` — deployment settings
- `tests/smoke.cjs` — metadata validation

- `studio.html` — animated physics and image analysis UI
- `studio.css`, `studio.js`, `studio-engine.js` — visual studio styles, interactivity and physics engine
- `tests/studio_smoke.cjs` — simulation numerical smoke tests

## Research Observatory 4.1

Open `/observatory.html` or `/observatory` for four synchronized animated physics systems (Lorenz, gravitational N-body, free quantum Gaussian and Ising), each with live numerical traces, pause/step/speed, and PNG capture. Includes a bounded flat wCDM/ΛCDM model comparator with uploaded CSV `z,value,sigma`, weighted χ² fitting, residuals, parameter likelihood heatmaps, normalized distance and lookback-time integrals. A QR polynomial family (degrees 1–4) compares empirical candidates using AICc, with a numerical assumption inspector, Planck-scale logarithmic ruler and local research notebook with JSON export. The default dataset is **synthetic** and not real measurements. Mathematical model fits are not discoveries or observational confirmation. Test with `node tests/observatory_smoke.cjs`.
