# COSMOS LAB — The Mathematical Universe

## COSMOS ∞ Unified Hub — 41 searchable models in 8 workspaces

**Entry:** https://cosmos-lab-v3.vercel.app/hub.html (after deployment).

The hub is a **unified research directory**, not a replacement for or automatic coupling of the numerical engines. It links the eight existing scientific workspaces (Atlas, Visual Studio, Research Observatory, Chaos Forge, Toy Universe, Frontier Questions, Quantum Gravity Playground, Reality Engine). It provides a curated entry from foundational questions and 41 *verified*, directly linked model URLs: 15 Toy Universe + 13 Frontier Questions + 3 Quantum Gravity + 10 Reality Engine. The additional four workspaces are included as full pages.

Catalog is checked against each source core; the portal contains text search, exact lab filters and a random experiment selector. Each playable model deep-links using the target engine's existing `model` URL parameter. No model is claimed to have independently solved a theoretical physics problem; every toy retains its existing limitations.

Files: `hub.html`, `hub.css`, `hub.js`, `hub-catalog.js`, `tests/hub-smoke.cjs`, `.github/workflows/hub-validation.yml`.


## COSMOS ∞ — Reality Engine (10 interactive modules)

Entry: **https://cosmos-lab-v3.vercel.app/reality.html** (after production deployment).

The Reality Engine integrates with the previous Atlas, Visual Studio, Observatory, Chaos Forge, Toy Universe (15 models), Frontier Questions (13 models) and Quantum Gravity Playground (3 models). These existing modules are not replaced or removed.

**Ten browser-computed modules:**
1. **Universe Creator:** softened 2D Newtonian N-body with adjustable attraction, an explicitly invented outward term, initial swirl, particle count and click-to-inject clusters; **not** general-relativistic cosmogenesis.
2. **Break the Laws:** explicit Euler vs velocity-Verlet vs exact harmonic oscillator, numerical drift and convergence; failure of an integrator **not** failure of physics.
3. **Real Universe Data:** CSV/TSV import of two numeric columns x,y, with provenance flagged. Demo curves are labeled **synthetic** until a user imports measurements. Sources: [GWOSC](https://gwosc.org/api/), [CERN Open Data](https://opendata.cern.ch/) and [ESA Planck Legacy Archive](https://pla.esac.esa.int/); no claim of automatic remote measurement ingestion.
4. **Theory Tournament:** bounded least-squares comparison of polynomial, fixed-frequency sinusoidal and exponential-basis models with 25% interleaved held-out points, training AICc and held-out RMSE. Does not infer causality or perform prospective time-series validation.
5. **Black Hole Explorer:** integrated Schwarzschild null-geodesic equation using RK4, with impact parameter/closest approach and weak-field estimate. No Kerr rotation, accretion or full image ray tracing.
6. **Quantum Computer Lab:** exact ideal two-qubit state amplitudes and gates H, X, CNOT, Rx, Rz, Bell preparation and seeded projective measurement, with entanglement entropy.
7. **Initial Conditions Machine:** 1D seeded Fourier field, adjustable tilt, damping and arbitrary growth exponent. Not real CMB or a Boltzmann solver.
8. **Equation Discovery:** restricted fixed function library fitted to synthetic or imported two-column data, with held-out error and AICc; not a general symbolic theorem prover.
9. **Emergent Spacetime Arena:** independent pure link-pair graph, exactly computed cut entropy and interactive link changes, **not** derived spacetime or Einstein field equations.
10. **Research Autopilot:** reproducible, **local deterministic parameter sweep** recovering a spring constant from synthetic observations with holdout. This is **not an LLM agent**, does not read papers or work asynchronously.

The common environment includes Play/Pause/Step/Reset, adjustable speed and model parameters, interaction on the numerical canvas, seeded links, local Save A/Compare B where compatible, CSV/JSON/PNG export and responsive Vox-style cyan/white/black UI.

Scientific data ingestion accepts only **a numeric two-column CSV** with 12–3,000 rows (2 MB max input), rejects duplicate x values and does not silently interpret HDF5, FITS or ROOT files. Format and unit checks remain the user's responsibility; an arbitrary CSV is not a verified scientific dataset by itself.

**Validation:** \`node tests/reality-smoke.cjs\`. All computations are local JavaScript and use no remote AI credentials. Main numerical core \`reality-core.js\`, UI \`reality.js\`, page \`reality.html\`, stylesheet \`reality.css\`.


## Quantum Gravity Playground — entanglement, causality and information

**Entry:** https://cosmos-lab-v3.vercel.app/gravity.html — a separate playground linked from the Atlas, Frontier Questions, Toy Universe, Chaos Forge, Studio and Observatory.

This is a collection of **three interactive, finite and explicit toy models**, not a quantum-gravity solver. No model derives Einstein's equations or supplies evidence that spacetime fundamentally arises from entanglement.

### Model 1. Independent entangled links / toy geometry

Each edge (i,j) owns a **separate qubit at each endpoint**, prepared in the pure two-qubit state

\`|ψ_e⟩ = √p_e |00⟩ + √(1−p_e)|11⟩\`.

The global many-qubit state is the **tensor product of pure link states**. For a chosen node partition A, the reduced-state von Neumann entropy is exactly

\`S(A) = Σ_{edges crossing A|not-A} H₂(p_e)\` bits,

where \`H₂(p) = −p log₂(p) − (1−p) log₂(1−p)\`. The UI also computes an **exact combinatorial s–t minimum graph cut** and Dijkstra shortest path for **assigned** edge length \`1/(0.05+H₂(p_e))\`. That length is a **designer-chosen heuristic**, not a gravitational distance.

Click nodes to toggle region A. Click a link or Shift-click to modify its entanglement. Sliders alter the strength, disorder, optional long edges and an **externally driven** link-weight sequence. There is no Hamiltonian dynamics and **no Ryu–Takayanagi identity** between these different graph calculations.

### Model 2. Sprinkled causal order

A finite set of uniformly sampled coordinate events is embedded in **already existing, flat 1+1-dimensional Minkowski spacetime**. Event i precedes j iff \`t_j > t_i\` and \`|x_j−x_i| ≤ c(t_j−t_i)\`. The mathematical simulator counts causal pairs, the longest chain and events in a selected causal interval.

Adjust event density, light-cone slope and spatial extent. Click two visible events to examine a causal interval. *No spacetime is derived from quantum entanglement*: the metric and coordinates are chosen first. These are finite-size order statistics, not a validated causal-set cosmology.

### Model 3. Pure-pair Page-shaped entropy

For an even total \`N\` qubits, construct a **fresh, prescribed pure state** at each radiation count \`k\`. It contains \`min(k,N−k)\` independent entangled pairs crossing the radiation–interior partition and local pure qubits for the rest. Therefore

\`S_R(k) = Σ_{j=1}^{min(k,N−k)} H₂(p_j)\`

is the **exact radiation entropy of this constructed family**, with a symmetric Page-shaped envelope. Vary total qubits, link-state parameters and disorder. Click horizontally to scrub through the radiation count. Compare with a naive monotonic \`k·H₂(p)\` reference (not a Hawking radiation calculation).

**Critical:** these states are explicitly re-paired at each k and are **not** produced by a continuous unitary evaporation Hamiltonian. This model does not solve the black-hole information paradox, derive the semiclassical island formula, or reproduce the exact Page theorem for Haar-random states.

### Shared controls and reproducibility

Play/Pause, Step, Reset, Reseed, speed, presets, direct canvas interaction, live numerical diagnostics, local **Save A / Compare B**, CSV/JSON/PNG exports and seeded initial-setup URL links. Manual canvas edits are **not** replayed from shared initial-setup links.

* Files: \`gravity.html\`, \`gravity.css\`, \`gravity-core.js\`, \`gravity.js\`.
* Tests: \`node tests/gravity_smoke.cjs\` and GitHub Actions \`.github/workflows/gravity-validation.yml\`.
* Scientific context: [Ryu–Takayanagi (2006)](https://arxiv.org/abs/hep-th/0603001); [causal-set review (2019)](https://link.springer.com/article/10.1007/s41114-019-0023-1); [Page, Information in Black Hole Radiation (1993)](https://arxiv.org/abs/hep-th/9306083).


## Frontier Questions — foundational physics & the limits of explanation

Interactive lab: **https://cosmos-lab-v3.vercel.app/frontier.html**

Thirteen real computational toy models, animated diagrams and model-specific measurement plots:

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

11. **Baryogenesis rate equations** — Sakharov-inspired source and washout with CP asymmetry, baryon-number violation and departure from equilibrium. Normalized rates, not measured baryon abundance.
12. **Bell–CHSH correlations** — synthetic polarization-singlet outcomes with four settings, empirical CHSH statistics, prediction and local bound. Sampling is not an experimental test.
13. **Qubit dephasing** — prescribed coherence decay and purity under a pure-dephasing channel; no measurement-collapse claim.

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
