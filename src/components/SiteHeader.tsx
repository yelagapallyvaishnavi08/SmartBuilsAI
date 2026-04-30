import { Link } from "@tanstack/react-router";
import { HardHat } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/calculator", label: "Calculator" },
  { to: "/features", label: "Features" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
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
        <Link
          to="/calculator"
          className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition-transform hover:-translate-y-0.5 md:inline-block"
        >
          Start Planning
        </Link>
      </div>
    </header>
  );
}
