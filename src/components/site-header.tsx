import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-6">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              M
            </span>
            <span className="text-base font-semibold tracking-tight">Motra</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
            <Link to="/cars" activeProps={{ className: "text-foreground font-medium" }}>
              Cars
            </Link>
            <Link to="/credit" activeProps={{ className: "text-foreground font-medium" }}>
              Credit
            </Link>
            <Link to="/dashboard" activeProps={{ className: "text-foreground font-medium" }}>
              Dealers
            </Link>
          </nav>
        </div>
        <Button size="sm" variant="secondary" className="rounded-full px-4">
          Log in
        </Button>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Motra</span>
        <span>Buy a car online. Delivered to your door.</span>
      </div>
    </footer>
  );
}
