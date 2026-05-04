import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { login, signUp } from "@/lib/auth";
import { HardHat, Mail, Lock, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Smart Build AI" },
      { name: "description", content: "Sign in or create an account to access your Smart Build AI project planner." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") await signUp(email, name, password);
      else await login(email, password);
      navigate({ to: "/calculator" });
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto flex max-w-md flex-col px-6 py-16">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-accent)] text-accent-foreground shadow-[var(--shadow-glow)]">
            <HardHat className="h-6 w-6" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" ? "Sign in to plan smarter projects." : "Start planning location-aware, AI-optimized builds."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
          {mode === "signup" && (
            <Field label="Full name" icon={<UserIcon className="h-4 w-4" />}>
              <input className="auth-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Builder" />
            </Field>
          )}
          <Field label="Email" icon={<Mail className="h-4 w-4" />}>
            <input className="auth-input" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <Field label="Password" icon={<Lock className="h-4 w-4" />}>
            <input className="auth-input" required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </Field>

          {err && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</div>}

          <button
            disabled={busy}
            type="submit"
            className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button type="button" className="font-semibold text-accent hover:underline" onClick={() => { setErr(null); setMode(mode === "login" ? "signup" : "login"); }}>
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By continuing you agree to our terms. <Link to="/" className="underline">Back home</Link>
        </p>
      </section>
      <SiteFooter />

      <style>{`
        .auth-input { width: 100%; border-radius: 0.6rem; border: 1px solid var(--color-border); background: var(--color-background); padding: 0.65rem 0.85rem 0.65rem 2.25rem; font-size: 0.9rem; outline: none; transition: border-color .15s, box-shadow .15s; color: var(--color-foreground); }
        .auth-input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-accent) 25%, transparent); }
      `}</style>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        {children}
      </div>
    </label>
  );
}
