import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { HardHat, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { getSession, logout, type Session } from "@/lib/auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/calculator", label: "Calculator" },
  { to: "/features", label: "Features" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const routerState = useRouterState();

  useEffect(() => {
    setSession(getSession());
  }, [routerState.location.pathname]);

  const onLogout = () => {
    logout();
    setSession(null);
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-accent)] text-accent-foreground shadow-[var(--shadow-glow)]">
            <HardHat className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Smart Build <span className="text-accent">AI</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "rounded-md px-4 py-2 text-sm font-semibold text-foreground bg-secondary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <>
              <span className="text-sm text-muted-foreground">Hi, <span className="font-semibold text-foreground">{session.name.split(" ")[0]}</span></span>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary">
                Sign in
              </Link>
              <Link
                to="/calculator"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition-transform hover:-translate-y-0.5"
              >
                Start Planning
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
