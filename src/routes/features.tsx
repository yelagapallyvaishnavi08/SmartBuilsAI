import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Calculator, FileText, Hammer, Sparkles, ShieldCheck, Clock, ArrowRight, TrendingDown, Workflow, Cpu } from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Smart Build AI" },
      { name: "description", content: "Location-based costing, AI suggestions, budget comparison, advanced blueprints, visual analytics and workforce planning." },
    ],
  }),
  component: FeaturesPage,
});

const features = [
  { icon: Calculator, title: "Location-Based Costing", desc: "City-aware material & wage multipliers for 10+ markets — accurate estimates wherever you build." },
  { icon: Sparkles, title: "AI-Driven Suggestions", desc: "Personalized tips for savings, scheduling, crew sizing, sustainability and risk mitigation." },
  { icon: ShieldCheck, title: "Budget Comparison", desc: "Set your target budget and get instant variance analysis with corrective actions." },
  { icon: FileText, title: "Advanced SVG Blueprints", desc: "Scaled floor plans with positioned rooms, doors, windows and accurate dimensions per floor." },
  { icon: Clock, title: "Visual Timeline & Charts", desc: "Cost donut, material bars and Gantt-style schedules for at-a-glance project insight." },
  { icon: Hammer, title: "Workforce Planning", desc: "Smart allocation across masons, helpers, steel workers, carpenters and supervisors." },
];

const benefits = [
  { icon: TrendingDown, title: "Reduce Costs", desc: "Accurate estimations prevent budget overruns and material wastage." },
  { icon: Workflow, title: "Better Planning", desc: "Detailed blueprints and schedules ensure smooth execution." },
  { icon: Cpu, title: "Powered by Algorithms", desc: "Robust calculation engine modeled on real construction practices." },
];

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-[image:var(--gradient-hero)] py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white">Built for Modern Construction</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">Every feature designed to take your project from idea to execution faster.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-[image:var(--gradient-card)] p-7 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Icon className="h-6 w-6" /></span>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-4xl font-bold tracking-tight">Transform Your Construction Planning</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-accent)] text-accent-foreground"><Icon className="h-6 w-6" /></span>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/calculator" className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition-transform hover:-translate-y-0.5">
              Try the Calculator <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
