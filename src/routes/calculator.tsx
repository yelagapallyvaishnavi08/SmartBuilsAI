import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  calculate,
  formatINR,
  LOCATIONS,
  type CalcInput,
  type CalcResult,
  type FloorPlan,
  type Suggestion,
} from "@/lib/construction";
import {
  Calculator as CalcIcon,
  Users,
  Clock,
  Wallet,
  Package,
  LayoutGrid,
  ListChecks,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Info,
  PiggyBank,
} from "lucide-react";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Calculator — Smart Build AI" },
      {
        name: "description",
        content:
          "Location-based estimates, AI suggestions, budget comparison, advanced blueprints and visual analytics for any construction project.",
      },
    ],
  }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const [form, setForm] = useState<CalcInput>({
    built_up_area: 1000,
    floors: "G+2",
    days: undefined,
    workers: undefined,
    daily_wage: 500,
    cost_per_sq_yard: 1500,
    location: "hyderabad",
    quality: "standard",
    budget: undefined,
  });
  const [result, setResult] = useState<CalcResult | null>(null);

  const update = <K extends keyof CalcInput>(k: K, v: CalcInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(calculate(form));
    setTimeout(
      () => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-[image:var(--gradient-hero)] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/90">
            <CalcIcon className="h-3.5 w-3.5 text-accent" /> Smart Project Planner
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Plan Your Project
          </h1>
          <p className="mt-3 max-w-2xl text-white/80">
            Location-aware estimates, AI suggestions, budget comparison, advanced blueprints and visual analytics — all in one place.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <form
          onSubmit={onSubmit}
          className="grid gap-6 rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold">Project Details</h2>
            <p className="text-sm text-muted-foreground">Required fields marked with *</p>
          </div>

          <Field label="Built-up Area (Sq. Yards) *">
            <input
              required
              type="number"
              min={1}
              value={form.built_up_area}
              onChange={(e) => update("built_up_area", Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Floors (e.g. G+2, G+3) *">
            <input
              required
              type="text"
              value={form.floors}
              onChange={(e) => update("floors", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Location / City *">
            <select
              className="input"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            >
              {LOCATIONS.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.name} ({l.region}) — ×{l.cost_multiplier.toFixed(2)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Construction Quality *">
            <select
              className="input"
              value={form.quality}
              onChange={(e) => update("quality", e.target.value as CalcInput["quality"])}
            >
              <option value="economy">Economy — basic finishes</option>
              <option value="standard">Standard — balanced</option>
              <option value="premium">Premium — high-end finishes</option>
            </select>
          </Field>

          <Field label="Construction Days (Optional)">
            <input
              type="number"
              min={1}
              placeholder="e.g. 90"
              value={form.days ?? ""}
              onChange={(e) =>
                update("days", e.target.value ? Number(e.target.value) : undefined)
              }
              className="input"
            />
          </Field>
          <Field label="No. of Workers (Optional)">
            <input
              type="number"
              min={1}
              placeholder="e.g. 50"
              value={form.workers ?? ""}
              onChange={(e) =>
                update("workers", e.target.value ? Number(e.target.value) : undefined)
              }
              className="input"
            />
          </Field>

          <Field label="Daily Wage per Worker (₹) *">
            <input
              required
              type="number"
              min={1}
              value={form.daily_wage}
              onChange={(e) => update("daily_wage", Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Cost per Sq. Yard (₹) *">
            <input
              required
              type="number"
              min={1}
              value={form.cost_per_sq_yard}
              onChange={(e) => update("cost_per_sq_yard", Number(e.target.value))}
              className="input"
            />
          </Field>

          <Field label="Target Budget (₹) — Optional">
            <input
              type="number"
              min={0}
              placeholder="e.g. 2500000"
              value={form.budget ?? ""}
              onChange={(e) =>
                update("budget", e.target.value ? Number(e.target.value) : undefined)
              }
              className="input"
            />
          </Field>
          <div className="flex items-end">
            <p className="text-xs text-muted-foreground">
              Wages & material rates are auto-adjusted by city and quality multipliers.
            </p>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-[image:var(--gradient-accent)] px-6 py-3.5 text-base font-semibold text-accent-foreground shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
            >
              Calculate Smart Plan
            </button>
          </div>
        </form>

        {result && <Results result={result} />}
      </section>

      <SiteFooter />

      <style>{`
        .input { width: 100%; border-radius: 0.6rem; border: 1px solid var(--color-border); background: var(--color-background); padding: 0.65rem 0.85rem; font-size: 0.9rem; outline: none; transition: border-color .15s, box-shadow .15s; color: var(--color-foreground); }
        .input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-accent) 25%, transparent); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function Results({ result }: { result: CalcResult }) {
  const { workers, timeline, cost, materials, blueprint, schedule, assumptions, location, suggestions, budget } = result;
  return (
    <div id="results" className="mt-12 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-bold tracking-tight">Smart Project Plan</h2>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium">
          <MapPin className="h-3.5 w-3.5 text-accent" /> {location.name}, {location.region} · {assumptions.quality} quality
        </span>
      </div>

      {/* Stat strip */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Users />} label="Total Workers" value={workers.total.toString()} />
        <Stat
          icon={<Clock />}
          label="Duration"
          value={`${timeline.days} days`}
          sub={`${timeline.weeks} weeks · ${timeline.months} months`}
        />
        <Stat
          icon={<Wallet />}
          label="Total Cost"
          value={formatINR(cost.total)}
          sub={`${formatINR(cost.per_sq_yard)} / sq yd`}
        />
        <Stat icon={<Package />} label="Steel Required" value={`${materials.steel_tons} tons`} />
      </div>

      {/* Budget comparison */}
      {budget && <BudgetCard budget={budget} />}

      {/* AI suggestions */}
      <SuggestionsCard suggestions={suggestions} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cost donut + breakdown */}
        <Card title="Cost Breakdown" icon={<Wallet className="h-5 w-5" />}>
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <CostDonut breakdown={cost.breakdown} total={cost.total} />
            <div className="flex-1 space-y-3">
              {cost.breakdown.map((b) => (
                <div key={b.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="h-3 w-3 rounded-sm" style={{ background: b.color }} />
                      {b.label}
                    </span>
                    <span className="font-semibold">{formatINR(b.value)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between rounded-xl bg-[image:var(--gradient-hero)] p-4 text-white">
            <span className="text-sm font-medium">Total Cost</span>
            <span className="text-2xl font-bold">{formatINR(cost.total)}</span>
          </div>
        </Card>

        {/* Workers */}
        <Card title="Workers & Labor" icon={<Users className="h-5 w-5" />}>
          <KV
            rows={[
              ["Total Workers Required", workers.total],
              ["Total Labour Days", workers.total_labour_days],
              ["Masons", workers.masons],
              ["Helpers", workers.helpers],
              ["Steel Workers", workers.steel_workers],
              ["Carpenters", workers.carpenters],
              ["Supervisors", workers.supervisors],
            ]}
          />
        </Card>

        {/* Materials with bar viz */}
        <Card title="Materials Required" icon={<Package className="h-5 w-5" />}>
          <MaterialBars
            items={[
              { label: "Steel", value: materials.steel_tons, max: materials.steel_tons * 1.2, unit: "tons" },
              { label: "Cement", value: materials.cement_bags, max: materials.cement_bags * 1.2, unit: "bags" },
              { label: "Sand", value: materials.sand_tons, max: materials.sand_tons * 1.2, unit: "tons" },
              { label: "Bricks", value: materials.bricks, max: materials.bricks * 1.2, unit: "" },
              { label: "Water", value: materials.water_liters, max: materials.water_liters * 1.2, unit: "L" },
            ]}
          />
        </Card>

        {/* Assumptions */}
        <Card title="Assumptions & Pricing" icon={<ListChecks className="h-5 w-5" />}>
          <KV
            rows={[
              ["Floors", `${assumptions.floors_str} (${assumptions.num_floors} levels)`],
              ["Quality Tier", assumptions.quality.toUpperCase()],
              ["Adjusted Daily Wage", formatINR(assumptions.daily_wage)],
              ["Adjusted Material Rate", `${formatINR(assumptions.cost_per_sq_yard)} / sq yd`],
              ["Location Factor", `×${location.cost_multiplier.toFixed(2)} cost · ×${location.wage_multiplier.toFixed(2)} wage`],
            ]}
          />
        </Card>
      </div>

      {/* Advanced Blueprint */}
      <Card title="Advanced Architectural Blueprint" icon={<LayoutGrid className="h-5 w-5" />}>
        <div className="space-y-10">
          {blueprint.map((floor) => (
            <BlueprintFloor key={floor.name} floor={floor} />
          ))}
          <p className="text-xs text-muted-foreground">
            Total Built-up Area: {result.input.built_up_area} Sq. Yards × {assumptions.num_floors} floors · Drawn to scale
          </p>
        </div>
      </Card>

      {/* Schedule with Gantt-style bars */}
      <Card title="Construction Schedule" icon={<Clock className="h-5 w-5" />}>
        <GanttSchedule schedule={schedule} />
      </Card>
    </div>
  );
}

// ---------- Budget comparison ----------
function BudgetCard({ budget }: { budget: NonNullable<CalcResult["budget"]> }) {
  const colorMap = {
    under: "oklch(0.65 0.15 160)",
    on: "oklch(0.74 0.16 60)",
    over: "oklch(0.6 0.22 27)",
  } as const;
  const Icon = budget.status === "over" ? TrendingUp : budget.status === "under" ? TrendingDown : Target;
  const barPct = Math.min(150, (budget.estimated / budget.budget) * 100);
  return (
    <div className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
      <div className="mb-5 flex items-center gap-2">
        <PiggyBank className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-semibold">Budget Comparison</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Mini label="Your Budget" value={formatINR(budget.budget)} />
        <Mini label="Smart Estimate" value={formatINR(budget.estimated)} />
        <Mini
          label={budget.status === "over" ? "Over Budget" : budget.status === "under" ? "Under Budget" : "On Budget"}
          value={`${budget.variance >= 0 ? "+" : ""}${formatINR(budget.variance)}`}
          color={colorMap[budget.status]}
        />
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>Budget {formatINR(budget.budget)}</span>
          <span>+50%</span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full"
            style={{ width: `${(barPct / 150) * 100}%`, background: colorMap[budget.status] }}
          />
          <div className="absolute top-0 h-full w-px bg-foreground/40" style={{ left: `${(100 / 150) * 100}%` }} />
        </div>
      </div>
      <p className="mt-4 flex items-start gap-2 rounded-xl bg-secondary/60 p-4 text-sm">
        <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
        <span>{budget.message}</span>
      </p>
    </div>
  );
}

// ---------- Suggestions ----------
function SuggestionsCard({ suggestions }: { suggestions: Suggestion[] }) {
  const meta = {
    saving: { icon: PiggyBank, color: "oklch(0.65 0.15 160)", bg: "oklch(0.95 0.04 160)" },
    warning: { icon: AlertTriangle, color: "oklch(0.6 0.22 27)", bg: "oklch(0.96 0.05 27)" },
    tip: { icon: Lightbulb, color: "oklch(0.74 0.16 60)", bg: "oklch(0.96 0.06 60)" },
    info: { icon: Info, color: "oklch(0.5 0.14 250)", bg: "oklch(0.95 0.03 250)" },
  } as const;
  return (
    <div className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-semibold">AI-Driven Suggestions</h3>
        <span className="ml-auto text-xs text-muted-foreground">{suggestions.length} insights</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {suggestions.map((s, i) => {
          const m = meta[s.type];
          const Icon = m.icon;
          return (
            <div
              key={i}
              className="rounded-xl border border-border p-4"
              style={{ background: m.bg }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: m.color, color: "white" }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{s.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/75">{s.detail}</p>
                  {s.impact && (
                    <span className="mt-2 inline-block rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold" style={{ color: m.color }}>
                      {s.impact}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Cost donut ----------
function CostDonut({ breakdown, total }: { breakdown: CalcResult["cost"]["breakdown"]; total: number }) {
  const size = 160;
  const r = 60;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.92 0.012 245)" strokeWidth={22} />
        {breakdown.map((b, i) => {
          const len = (b.pct / 100) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={b.color}
              strokeWidth={22}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total</span>
        <span className="text-base font-bold">{formatINR(total)}</span>
      </div>
    </div>
  );
}

// ---------- Material bars ----------
function MaterialBars({ items }: { items: { label: string; value: number; max: number; unit: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">{it.label}</span>
            <span className="font-mono text-xs font-semibold">
              {it.value.toLocaleString("en-IN")} {it.unit}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-[image:var(--gradient-accent)]"
              style={{ width: `${Math.min(100, (it.value / it.max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Advanced blueprint floor ----------
function BlueprintFloor({ floor }: { floor: FloorPlan }) {
  // Render at ~520px wide
  const renderW = 520;
  const scale = renderW / floor.totalWidth;
  const renderH = floor.totalHeight * scale;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">{floor.name}</h4>
      <div className="overflow-x-auto rounded-xl border-2 border-primary/20 bg-[oklch(0.98_0.005_240)] p-4">
        <svg
          width={renderW}
          height={renderH}
          viewBox={`0 0 ${floor.totalWidth} ${floor.totalHeight}`}
          style={{ display: "block" }}
        >
          {/* outer wall */}
          <rect
            x={0}
            y={0}
            width={floor.totalWidth}
            height={floor.totalHeight}
            fill="white"
            stroke="oklch(0.24 0.06 255)"
            strokeWidth={0.6}
          />
          {floor.rooms.map((r, i) => (
            <g key={i}>
              <rect
                x={r.x}
                y={r.y}
                width={r.width}
                height={r.height}
                fill={r.color}
                stroke="oklch(0.24 0.06 255)"
                strokeWidth={0.3}
              />
              {/* Door — small arc on bottom edge */}
              {r.hasDoor && (
                <line
                  x1={r.x + r.width * 0.4}
                  y1={r.y + r.height}
                  x2={r.x + r.width * 0.6}
                  y2={r.y + r.height}
                  stroke="white"
                  strokeWidth={0.8}
                />
              )}
              {/* Window — line on top edge */}
              {r.hasWindow && (
                <line
                  x1={r.x + r.width * 0.3}
                  y1={r.y}
                  x2={r.x + r.width * 0.7}
                  y2={r.y}
                  stroke="oklch(0.5 0.14 250)"
                  strokeWidth={0.6}
                  strokeDasharray="0.6 0.4"
                />
              )}
              <text
                x={r.x + r.width / 2}
                y={r.y + r.height / 2 - 0.5}
                textAnchor="middle"
                fontSize={Math.min(1.6, r.width * 0.12)}
                fontWeight="700"
                fill="oklch(0.18 0.04 250)"
              >
                {r.short}
              </text>
              <text
                x={r.x + r.width / 2}
                y={r.y + r.height / 2 + 1.4}
                textAnchor="middle"
                fontSize={Math.min(1.2, r.width * 0.09)}
                fill="oklch(0.4 0.03 250)"
              >
                {r.width.toFixed(1)}'×{r.height.toFixed(1)}'
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <Legend swatch="oklch(0.85 0.06 60)" label="Bedroom" />
        <Legend swatch="oklch(0.86 0.05 160)" label="Living/Hall" />
        <Legend swatch="oklch(0.88 0.07 90)" label="Kitchen" />
        <Legend swatch="oklch(0.85 0.05 220)" label="Bathroom" />
        <Legend swatch="oklch(0.92 0.03 145)" label="Balcony" />
        <span className="ml-auto">— window · ◖ door</span>
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm border border-border" style={{ background: swatch }} />
      {label}
    </span>
  );
}

// ---------- Gantt schedule ----------
function GanttSchedule({ schedule }: { schedule: CalcResult["schedule"] }) {
  const totalWeeks = Math.max(...schedule.map((s) => s.week + s.duration_weeks - 1));
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="mb-2 flex text-[10px] text-muted-foreground" style={{ paddingLeft: "180px" }}>
          {Array.from({ length: totalWeeks }, (_, i) => (
            <div key={i} className="flex-1 text-center">
              W{i + 1}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {schedule.map((s) => {
            const leftPct = ((s.week - 1) / totalWeeks) * 100;
            const widthPct = (s.duration_weeks / totalWeeks) * 100;
            return (
              <div key={s.title} className="flex items-center gap-3">
                <div className="w-[180px] flex-shrink-0">
                  <div className="text-sm font-semibold">{s.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Week {s.week} · {s.duration_weeks}w
                  </div>
                </div>
                <div className="relative h-9 flex-1 rounded-md bg-secondary/60">
                  <div
                    className="absolute top-1 bottom-1 rounded bg-[image:var(--gradient-accent)] shadow-sm"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    title={s.tasks.join(" · ")}
                  >
                    <span className="absolute inset-0 flex items-center justify-center truncate px-2 text-[10px] font-semibold text-accent-foreground">
                      {s.tasks[0]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Generic UI ----------
function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-[image:var(--gradient-card)] p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="text-accent">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Mini({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-bold" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-accent">{icon}</span>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function KV({ rows }: { rows: [string, string | number][] }) {
  return (
    <dl className="divide-y divide-border">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between py-2.5">
          <dt className="text-sm text-muted-foreground">{k}</dt>
          <dd className="text-sm font-semibold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
