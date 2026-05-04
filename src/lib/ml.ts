// Smart Build AI — ML utilities
// Linear Regression: predicts construction cost from area, floors, location & quality
// Genetic Algorithm: optimizes material/quality/timeline mix to hit a target budget

import { LOCATIONS, type CalcInput, calculate } from "./construction";

// ---------------- Synthetic training set ----------------
// Realistic-ish samples (area, floors, locMult, qualityMult) -> totalCost (₹).
// In production this would come from real historical projects.
interface Sample {
  x: [number, number, number, number]; // [area, floors, locMult, qMult]
  y: number;
}

function buildTrainingSet(): Sample[] {
  const samples: Sample[] = [];
  const areas = [400, 600, 800, 1000, 1200, 1500, 1800, 2200, 2800, 3500];
  const floorsArr = [1, 2, 3, 4];
  const locs = LOCATIONS.map((l) => l.cost_multiplier);
  const quals = [0.85, 1.0, 1.3];
  for (const a of areas) {
    for (const f of floorsArr) {
      for (const lm of locs) {
        for (const q of quals) {
          // Ground truth model with mild noise
          const base = a * f * 1500 * lm * q + a * f * 500 * lm; // material+labor-ish
          const overhead = base * 0.1;
          const noise = (Math.random() - 0.5) * 0.04 * base;
          samples.push({ x: [a, f, lm, q], y: base + overhead + noise });
        }
      }
    }
  }
  return samples;
}

// ---------------- Linear Regression (multivariate, normal equation) ----------------
// theta = (XᵀX)⁻¹ Xᵀ y    — solved with Gauss-Jordan on a 5x5 matrix.

function transpose(m: number[][]): number[][] {
  return m[0].map((_, i) => m.map((r) => r[i]));
}
function matMul(a: number[][], b: number[][]): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < a.length; i++) {
    out[i] = [];
    for (let j = 0; j < b[0].length; j++) {
      let s = 0;
      for (let k = 0; k < b.length; k++) s += a[i][k] * b[k][j];
      out[i][j] = s;
    }
  }
  return out;
}
function invert(m: number[][]): number[][] {
  const n = m.length;
  const a = m.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let i = 0; i < n; i++) {
    let piv = a[i][i];
    if (Math.abs(piv) < 1e-12) {
      for (let r = i + 1; r < n; r++) {
        if (Math.abs(a[r][i]) > 1e-12) {
          [a[i], a[r]] = [a[r], a[i]];
          piv = a[i][i];
          break;
        }
      }
    }
    for (let j = 0; j < 2 * n; j++) a[i][j] /= piv;
    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const f = a[r][i];
      for (let j = 0; j < 2 * n; j++) a[r][j] -= f * a[i][j];
    }
  }
  return a.map((r) => r.slice(n));
}

export interface RegressionModel {
  theta: number[]; // [bias, w_area, w_floors, w_loc, w_qual]
  r2: number;
  samples: number;
}

let _model: RegressionModel | null = null;

export function trainRegression(): RegressionModel {
  if (_model) return _model;
  const data = buildTrainingSet();
  const X = data.map((s) => [1, ...s.x]); // bias + 4 features
  const y = data.map((s) => [s.y]);
  const Xt = transpose(X);
  const theta = matMul(invert(matMul(Xt, X)), matMul(Xt, y)).map((r) => r[0]);

  // R²
  const meanY = y.reduce((s, r) => s + r[0], 0) / y.length;
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < X.length; i++) {
    const pred = X[i].reduce((s, v, k) => s + v * theta[k], 0);
    ssRes += (y[i][0] - pred) ** 2;
    ssTot += (y[i][0] - meanY) ** 2;
  }
  const r2 = 1 - ssRes / ssTot;
  _model = { theta, r2, samples: data.length };
  return _model;
}

export function predictCost(input: CalcInput): { predicted: number; model: RegressionModel } {
  const model = trainRegression();
  const loc = LOCATIONS.find((l) => l.key === input.location) ?? LOCATIONS[0];
  const qMult = input.quality === "premium" ? 1.3 : input.quality === "economy" ? 0.85 : 1.0;
  const numFloors = input.floors.toUpperCase().includes("+")
    ? parseInt(input.floors.split("+")[1] || "0", 10) + 1
    : parseInt(input.floors, 10) || 1;
  const x = [1, input.built_up_area, numFloors, loc.cost_multiplier, qMult];
  const predicted = Math.max(0, x.reduce((s, v, k) => s + v * model.theta[k], 0));
  return { predicted, model };
}

// ---------------- Genetic Algorithm ----------------
// Optimizes [quality, daily_wage, cost_per_sq_yard, days] to hit target budget
// while keeping the plan realistic. Penalizes unrealistic extremes.

export interface GAResult {
  best: {
    quality: NonNullable<CalcInput["quality"]>;
    daily_wage: number;
    cost_per_sq_yard: number;
    days: number;
    total: number;
    fitness: number;
  };
  generations: number;
  populationSize: number;
  history: { gen: number; bestFitness: number; bestTotal: number }[];
  improvementPct: number;
}

interface Gene {
  qIdx: number; // 0=economy 1=standard 2=premium
  wage: number;
  rate: number;
  days: number;
}

const QUALS: NonNullable<CalcInput["quality"]>[] = ["economy", "standard", "premium"];

function evalGene(g: Gene, base: CalcInput, target: number): { total: number; fitness: number } {
  const out = calculate({
    ...base,
    quality: QUALS[g.qIdx],
    daily_wage: g.wage,
    cost_per_sq_yard: g.rate,
    days: g.days,
    workers: undefined,
  });
  const diff = Math.abs(out.cost.total - target) / target;
  // Penalty for excessively cheap finishes when target is high, etc.
  const realismPenalty = g.wage < 350 || g.wage > 1500 ? 0.05 : 0;
  const dayPenalty = g.days < 45 || g.days > 540 ? 0.05 : 0;
  const fitness = 1 / (1 + diff + realismPenalty + dayPenalty);
  return { total: out.cost.total, fitness };
}

function randomGene(base: CalcInput): Gene {
  return {
    qIdx: Math.floor(Math.random() * 3),
    wage: Math.round(400 + Math.random() * 900),
    rate: Math.round(900 + Math.random() * 1800),
    days: Math.round(60 + Math.random() * 360),
  };
}

function crossover(a: Gene, b: Gene): Gene {
  return {
    qIdx: Math.random() < 0.5 ? a.qIdx : b.qIdx,
    wage: Math.random() < 0.5 ? a.wage : b.wage,
    rate: Math.random() < 0.5 ? a.rate : b.rate,
    days: Math.random() < 0.5 ? a.days : b.days,
  };
}
function mutate(g: Gene, rate = 0.2): Gene {
  const out = { ...g };
  if (Math.random() < rate) out.qIdx = Math.floor(Math.random() * 3);
  if (Math.random() < rate) out.wage = Math.max(350, Math.min(1500, out.wage + Math.round((Math.random() - 0.5) * 200)));
  if (Math.random() < rate) out.rate = Math.max(800, Math.min(3000, out.rate + Math.round((Math.random() - 0.5) * 400)));
  if (Math.random() < rate) out.days = Math.max(45, Math.min(540, out.days + Math.round((Math.random() - 0.5) * 60)));
  return out;
}

export function geneticOptimize(base: CalcInput, target: number): GAResult {
  const POP = 40;
  const GENS = 60;
  let pop: Gene[] = Array.from({ length: POP }, () => randomGene(base));
  const history: GAResult["history"] = [];
  const baselineTotal = calculate(base).cost.total;
  let best: { gene: Gene; total: number; fitness: number } | null = null;

  for (let gen = 0; gen < GENS; gen++) {
    const scored = pop.map((g) => ({ g, ...evalGene(g, base, target) }));
    scored.sort((a, b) => b.fitness - a.fitness);
    const top = scored[0];
    if (!best || top.fitness > best.fitness) best = { gene: top.g, total: top.total, fitness: top.fitness };
    history.push({ gen: gen + 1, bestFitness: +top.fitness.toFixed(4), bestTotal: top.total });

    // Elitism + tournament selection
    const elites = scored.slice(0, 6).map((s) => s.g);
    const next: Gene[] = [...elites];
    while (next.length < POP) {
      const a = scored[Math.floor(Math.random() * 12)].g;
      const b = scored[Math.floor(Math.random() * 12)].g;
      next.push(mutate(crossover(a, b)));
    }
    pop = next;
  }

  const baselineDiff = Math.abs(baselineTotal - target);
  const optimizedDiff = Math.abs(best!.total - target);
  const improvementPct = baselineDiff === 0 ? 0 : ((baselineDiff - optimizedDiff) / baselineDiff) * 100;

  return {
    best: {
      quality: QUALS[best!.gene.qIdx],
      daily_wage: best!.gene.wage,
      cost_per_sq_yard: best!.gene.rate,
      days: best!.gene.days,
      total: best!.total,
      fitness: best!.fitness,
    },
    generations: GENS,
    populationSize: POP,
    history,
    improvementPct,
  };
}
