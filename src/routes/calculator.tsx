import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { calculate, formatINR, type CalcInput, type CalcResult } from "@/lib/construction";
import { Calculator as CalcIcon, Users, Clock, Wallet, Package, LayoutGrid, ListChecks } from "lucide-react";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Calculator — BuildAI Pro" },
      { name: "description", content: "Calculate workers, timeline, costs, materials, blueprint, and weekly schedule for your construction project." },
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
  });
  const [result, setResult] = useState<CalcResult | null>(null);

  const update = <K extends keyof CalcInput>(k: K, v: CalcInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(calculate(form));
    setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-[image:var(--gradient-hero)] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/90"><CalcIcon className="h-3.5 w-3.5 text-accent" /> Project Calculator</span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">Plan Your Project</h1>
          <p className="mt-3 max-w-2xl text-white/80">Enter your project parameters to receive a comprehensive plan: workers, timeline, costs, materials, blueprints, and weekly schedule.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <form onSubmit={onSubmit} className="grid gap-6 rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold">Project Details</h2>
            <p className="text-sm text-muted-foreground">Required fields marked with *</p>
          </div>

          <Field label="Built-up Area (Sq. Yards) *">
            <input required type="number" min={1} value={form.built_up_area}
              onChange={(e) => update("built_up_area", Number(e.target.value))}
              className="input" />
          </Field>
          <Field label="Floors (e.g. G+2, G+3) *">
            <input required type="text" value={form.floors}
              onChange={(e) => update("floors", e.target.value)}
              className="input" />
          </Field>
          <Field label="Construction Days (Optional)">
            <input type="number" min={1} placeholder="e.g. 90" value={form.days ?? ""}
              onChange={(e) => update("days", e.target.value ? Number(e.target.value) : undefined)}
              className="input" />
          </Field>
          <Field label="No. of Workers (Optional)">
            <input type="number" min={1} placeholder="e.g. 50" value={form.workers ?? ""}
              onChange={(e) => update("workers", e.target.value ? Number(e.target.value) : undefined)}
              className="input" />
          </Field>
          <Field label="Daily Wage per Worker (₹) *">
            <input required type="number" min={1} value={form.daily_wage}
              onChange={(e) => update("daily_wage", Number(e.target.value))}
              className="input" />
          </Field>
          <Field label="Cost per Sq. Yard (₹) *">
            <input required type="number" min={1} value={form.cost_per_sq_yard}
              onChange={(e) => update("cost_per_sq_yard", Number(e.target.value))}
              className="input" />
          </Field>

          <div className="md:col-span-2">
            <button type="submit" className="w-full rounded-xl bg-[image:var(--gradient-accent)] px-6 py-3.5 text-base font-semibold text-accent-foreground shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5">
              Calculate Project
            </button>
          </div>
        </form>

        {result && <Results result={result} />}
      </section>

      <SiteFooter />

      <style>{`
        .input { width: 100%; border-radius: 0.6rem; border: 1px solid var(--color-border); background: var(--color-background); padding: 0.65rem 0.85rem; font-size: 0.9rem; outline: none; transition: border-color .15s, box-shadow .15s; }
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
  const { workers, timeline, cost, materials, blueprint, schedule, assumptions } = result;
  return (
    <div id="results" className="mt-12 space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Project Plan</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Users />} label="Total Workers" value={workers.total.toString()} />
        <Stat icon={<Clock />} label="Duration" value={`${timeline.days} days`} sub={`${timeline.weeks} weeks · ${timeline.months} months`} />
        <Stat icon={<Wallet />} label="Total Cost" value={formatINR(cost.total)} sub={`${formatINR(cost.per_sq_yard)} / sq yd`} />
        <Stat icon={<Package />} label="Steel Required" value={`${materials.steel_tons} tons`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Workers & Labor" icon={<Users className="h-5 w-5" />}>
          <KV rows={[
            ["Total Workers Required", workers.total],
            ["Total Labour Days", workers.total_labour_days],
            ["Masons", workers.masons],
            ["Helpers", workers.helpers],
            ["Steel Workers", workers.steel_workers],
            ["Carpenters", workers.carpenters],
            ["Supervisors", workers.supervisors],
          ]} />
        </Card>

        <Card title="Cost Breakdown" icon={<Wallet className="h-5 w-5" />}>
          <KV rows={[
            ["Labor Cost", formatINR(cost.labor)],
            ["Material Cost", formatINR(cost.material)],
            ["Overhead (10%)", formatINR(cost.overhead)],
            ["Cost per Sq. Yard", formatINR(cost.per_sq_yard)],
          ]} />
          <div className="mt-4 flex items-center justify-between rounded-xl bg-[image:var(--gradient-hero)] p-4 text-white">
            <span className="text-sm font-medium">Total Cost</span>
            <span className="text-2xl font-bold">{formatINR(cost.total)}</span>
          </div>
        </Card>

        <Card title="Materials Required" icon={<Package className="h-5 w-5" />}>
          <KV rows={[
            ["Steel", `${materials.steel_tons} tons`],
            ["Cement Bags", `${materials.cement_bags.toLocaleString()} bags`],
            ["Sand", `${materials.sand_tons.toLocaleString()} tons`],
            ["Water", `${materials.water_liters.toLocaleString()} L`],
          ]} />
        </Card>

        <Card title="Assumptions" icon={<ListChecks className="h-5 w-5" />}>
          <KV rows={[
            ["Floors", `${assumptions.floors_str} (${assumptions.num_floors} levels)`],
            ["Daily Wage", formatINR(assumptions.daily_wage)],
            ["Material Rate", `${formatINR(assumptions.cost_per_sq_yard)} / sq yd`],
          ]} />
        </Card>
      </div>

      {/* Blueprint */}
      <Card title="Architectural Blueprint" icon={<LayoutGrid className="h-5 w-5" />}>
        <div className="space-y-8">
          {blueprint.map((floor) => (
            <div key={floor.name}>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">{floor.name}</h4>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {floor.rooms.map((r) => (
                  <div key={r.short} className="rounded-xl border-2 border-dashed border-primary/30 bg-secondary/40 p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-primary">{r.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{r.short}</div>
                    <div className="mt-2 text-sm font-mono font-semibold">{r.width}' × {r.height}'</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Total Area: {result.input.built_up_area} Sq. Yards · Scale 1:100</p>
        </div>
      </Card>

      {/* Schedule */}
      <Card title="Construction Schedule" icon={<Clock className="h-5 w-5" />}>
        <ol className="relative space-y-5 border-l-2 border-border pl-6">
          {schedule.map((s) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full bg-[image:var(--gradient-accent)] text-[10px] font-bold text-accent-foreground">{s.week}</span>
              <div className="text-xs font-semibold uppercase tracking-wider text-accent">Week {s.week}</div>
              <div className="text-base font-semibold">{s.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.tasks.join(" · ")}</div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
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

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
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
