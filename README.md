# COSMOS LAB — The Mathematical Universe

## Frontier Questions — foundational physics & the limits of explanation

Interactive lab: **https://cosmos-lab-v3.vercel.app/frontier.html**

Ten real computational toy models, animated diagrams and model-specific measurement plots:

1. **Quantum vacuum, not absolute nothing** — normalized harmonic oscillator ground-state Wigner samples; the physical vacuum presupposes quantum laws.
2. **Tunnelling and cosmological analogy** — rectangular Schrödinger barrier transmission. This does *not* generate a Universe.
3. **Inflation-inspired slow-roll** — scalar potential, evolving φ, H and e-folds; chosen initial conditions and law are presupposed.
4. **Why these laws?** — all 256 elementary cellular automaton rules and row Shannon entropy; behavior is conditional on the rule.
5. **Correlation geometry analogy** — equilibrium 1D Ising spin-chain correlations and d_eff(r)=−ln(C(r)); not emergent quantum spacetime.
6. **Schwarzschild–Compton crossover** — dimensionless gravitational and quantum length comparison, not a quantum-gravity theory.
7. **Generalized uncertainty toy** — β-modified uncertainty relation (speculative); unknown whether physical minimal length exists.
8. **Gauge unification** — Standard Model one-loop inverse gauge couplings in SU(5) hypercharge normalization; optional hypothetical changes in beta-function coefficients above 10¹⁰ GeV; excludes gravity and threshold/two-loop effects.
9. **Laws without repeated intervention** — two Rule-110 universes with the same initial state; click to perturb one; does not decide any theological question.
10. **Entropy and time's arrow** — biased initial positions and randomized particle mixing; not a microscopic derivation of irreversibility.

Scientific reference context: [Stanford Encyclopedia of Philosophy — Philosophy of Cosmology](https://plato.stanford.edu/entries/cosmology/); [CERN lecture on gauge coupling unification](https://indico.cern.ch/event/84560/attachments/1075209/1533472/eberl_PiP10.pdf); [PTEP 2016 on running gauge couplings](https://academic.oup.com/ptep/article/2016/4/043B02/2461130).

**Controls:** parameter sliders, play/pause, one numerical step, reseed, click on the visualizer, CSV/JSON/PNG export and shareable initial-setup URLs. An interactive philosophy panel compares physical explanation, theistic interpretation, naturalism and agnosticism without assigning fake likelihoods. A "What is nothing?" selector explicitly prevents attempting to simulate absolute nothing.

**Validation:** \`node tests/frontier_smoke.cjs\`. UI code and numeric engine are separate: \`frontier.js\`, \`frontier-core.js\`, \`frontier.html\`, \`frontier.css\`. Front-end executes locally in the browser, with no external data transmission from this lab.

The unanswered questions remain **unanswered**. A successful toy simulation establishes only what follows from a chosen model; it cannot derive its own ontological assumptions from nonexistence.


## Toy Universe — 15 playable scientific models

Live: **[cosmos-lab-v3.vercel.app/toybox.html](https://cosmos-lab-v3.vercel.app/toybox.html)**. The models are standalone, browser-run approximations. Nothing is sent to a remote computation service.

### Worlds

1. Wave Universe — finite-difference 2D wave pulses and obstacles.
2. Heat Diffusion — stable explicit diffusion and injection of positive/negative heat.
3. Game of Life — editable B3/S23 cellular automata.
4. Langton's Ant — discrete ant turns and binary tile flips.
5. Sandpile Avalanches — bounded finite-pass Abelian sandpile simulation.
6. Percolation Threshold — seeded site percolation and edge-connected cluster finding.
7. Flocking Intelligence — simplified Boids-type agents with alignment, cohesion and separation.
8. Field Architect — softened electrostatic charges with passive animated tracer paths.
9. Synchronization — Kuramoto oscillator network with mean-field coherence.
10. Hénon Attractor — nonlinear quadratic map and attractor trajectories.
11. Epidemic Networks — synthetic stochastic SIR on fixed spatial contact graph (not a forecast).
12. Orbital Architect — test particles around a stationary central mass, velocity Verlet.
13. Fourier Composer — moving sum of configurable harmonics.
14. Crystal Growth — diffusion-limited aggregation on a bounded lattice.
15. Newton Fractal — basins of attraction for Newton's method on `z³−1`.

### Play controls

- Click/tap the physics canvas to inject a disturbance, charge, grain, infected node, trajectory, or starting point; actions depend on the selected model.
- Hold Shift or right-click for alternate controls; on mobile, use the **ALT ACTION** toggle.
- Pause, resume, step one tick, reset, reseed, change simulation speed and adjust model parameters within bounded ranges.
- The lower graph measures a model-specific numerical statistic; **SAVE RUN** stores up to 15 run records in this browser's local storage and **COMPARE SAVED RUN** draws the saved run in dashed white against the current cyan trace.
- Export CSV, JSON or a composite PNG; copy an initial-setup URL. A URL reproduces parameters and seeded initialization, **not** manual canvas interactions.
- `toy-core.js` holds the portable seeded numerical engines. `toybox.js` and `toybox.css` render the workspace; `tests/toy_smoke.cjs` and `.github/workflows/toy-validation.yml` check the package.

### Scientific limitations

Simplified and normalized toy systems. Some use finite grids, discrete time, softening, imposed constraints and approximate boundary conditions; they are not experimental measurements or rigorous numerical convergence guarantees. Interaction and plotted metrics are numerical estimates. A stochastic agent model is not a medical or epidemiological forecast. "Newton fractal" displays convergence under chosen iterations and finite precision, not infinite zoom.


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
