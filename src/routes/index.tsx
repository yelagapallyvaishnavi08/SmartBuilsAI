import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Calculator, FileText, Hammer, Sparkles, ShieldCheck, Clock } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import heroImg from "@/assets/hero-construction.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BuildAI Pro — AI-Powered Construction Planning" },
      { name: "description", content: "Plan construction projects with precision. Get worker requirements, timelines, blueprints, and cost analysis in seconds." },
      { property: "og:title", content: "BuildAI Pro — AI-Powered Construction Planning" },
      { property: "og:description", content: "Smart calculations, blueprints, and week-by-week schedules for any project." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Construction site at sunset with crane and blueprint overlay" width={1920} height={1080} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-90" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-28 md:py-40">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Smart construction intelligence
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
              AI-Powered <span className="bg-[image:var(--gradient-accent)] bg-clip-text text-transparent">Construction</span> Planning
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/80 md:text-xl">
              Get accurate worker requirements, realistic timelines, detailed blueprints, and comprehensive cost analysis in seconds.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/calculator" className="group inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-accent)] px-7 py-3.5 text-base font-semibold text-accent-foreground shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5">
                Start Planning Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/features" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/15">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight">Why Choose BuildAI Pro?</h2>
          <p className="mt-4 text-muted-foreground">Comprehensive features designed for modern construction management.</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { icon: Calculator, title: "Smart Calculations", desc: "Algorithms calculate worker requirements, timelines, and costs based on project complexity and constraints." },
            { icon: FileText, title: "Professional Blueprints", desc: "Auto-generated architectural blueprints with room layouts and dimensions for every floor." },
            { icon: Clock, title: "Detailed Schedules", desc: "Comprehensive week-by-week construction schedules from site prep to final handover." },
            { icon: Hammer, title: "Workforce Planning", desc: "Intelligent worker allocation across masons, helpers, steel workers, carpenters, supervisors." },
            { icon: ShieldCheck, title: "Cost Transparency", desc: "Transparent breakdown of labor, materials, and overhead with customizable regional rates." },
            { icon: Sparkles, title: "Real-Time Processing", desc: "Instant calculations and results to support faster, more confident decision-making." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group rounded-2xl border border-border bg-[image:var(--gradient-card)] p-7 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight">How BuildAI Pro Works</h2>
            <p className="mt-4 text-muted-foreground">From project details to execution-ready plans in four steps.</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {[
              ["Enter Project Details", "Provide area, number of floors, timeline, and budget."],
              ["Smart Analysis", "The engine analyzes complexity and generates calculations."],
              ["Get Results", "Receive blueprints, schedules, costs, and workforce needs."],
              ["Execute & Monitor", "Use detailed plans to execute with clear milestones."],
            ].map(([title, desc], i) => (
              <div key={title} className="relative rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
                <span className="text-sm font-bold text-accent">STEP {i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="overflow-hidden rounded-3xl bg-[image:var(--gradient-hero)] px-10 py-16 text-center shadow-[var(--shadow-elegant)] md:px-16 md:py-20">
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Transform Your Construction Planning</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">Save time, reduce costs, and execute projects with confidence.</p>
          <Link to="/calculator" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-accent)] px-7 py-3.5 text-base font-semibold text-accent-foreground shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5">
            Open the Calculator <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
