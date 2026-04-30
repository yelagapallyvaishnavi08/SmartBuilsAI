import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — BuildAI Pro" },
      { name: "description", content: "Get in touch with the BuildAI Pro team for inquiries, demos, or partnerships." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-[image:var(--gradient-hero)] py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white">Get in Touch</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">Questions, demos, partnerships — we'd love to hear from you.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          {[
            { icon: Mail, label: "Email", value: "hello@buildai.pro" },
            { icon: Phone, label: "Phone", value: "+91 98765 43210" },
            { icon: MapPin, label: "Office", value: "Bengaluru, Karnataka, India" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[image:var(--gradient-accent)] text-accent-foreground"><Icon className="h-5 w-5" /></span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
                <div className="mt-0.5 text-base font-semibold">{value}</div>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="space-y-5 rounded-2xl border border-border bg-[image:var(--gradient-card)] p-8 shadow-[var(--shadow-card)]"
        >
          <h2 className="text-2xl font-semibold">Send a message</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" required />
            <Input label="Email" type="email" required />
          </div>
          <Input label="Subject" required />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Message</span>
            <textarea required rows={5} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/30" />
          </label>
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-accent)] px-6 py-3 font-semibold text-accent-foreground shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5">
            <Send className="h-4 w-4" /> Send Message
          </button>
          {sent && <p className="text-sm font-medium text-accent">Thanks! We'll be in touch shortly.</p>}
        </form>
      </section>

      <SiteFooter />
    </div>
  );
}

function Input({ label, type = "text", required }: { label: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}{required && " *"}</span>
      <input type={type} required={required} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/30" />
    </label>
  );
}
