export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-10 text-center text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">BuildAI Pro</p>
        <p className="mt-1">AI-Powered intelligent planning for modern construction projects</p>
        <p className="mt-3 text-xs">Powered by advanced algorithms · © {new Date().getFullYear()} BuildAI Pro. All rights reserved.</p>
      </div>
    </footer>
  );
}
