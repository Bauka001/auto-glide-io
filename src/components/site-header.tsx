import { Link } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Menu, Moon, Scale, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { langs, useI18n, type Key } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useCompare } from "@/lib/compare";

const navItems: { to: string; key: Key }[] = [
  { to: "/cars", key: "nav.cars" },
  { to: "/ai-chat", key: "nav.ai" },
  { to: "/insurance", key: "nav.insurance" },
  { to: "/finance", key: "nav.finance" },
  { to: "/delivery", key: "nav.delivery" },
];

export function SiteHeader() {
  const { lang, setLang, t } = useI18n();
  const { user, profile, isDealer, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const compare = useCompare();
  const current = langs.find((l) => l.code === lang)?.label ?? "RU";


  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-6">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              M
            </span>
            <span className="text-base font-semibold tracking-tight">AutoHub</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "text-foreground font-medium" }}
                className="transition-colors hover:text-foreground"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {compare.ids.length > 0 && (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="rounded-full px-3 text-xs font-semibold"
            >
              <Link to="/compare">
                <Scale className="mr-1.5 h-3.5 w-3.5" />
                {compare.ids.length}
              </Link>
            </Button>
          )}
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full"
            aria-label={theme === "dark" ? t("theme.light") : t("theme.dark")}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="secondary" className="rounded-full px-3 text-xs font-semibold">
                {current}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-28 rounded-2xl">
              {langs.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onSelect={() => setLang(l.code)}
                  className="rounded-xl text-sm"
                >
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="secondary" className="rounded-full">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48 rounded-2xl">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-medium">
                    {profile?.full_name ?? user.email}
                  </p>
                  {profile?.full_name && (
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl text-sm">
                  <Link to="/profile">{t("nav.profile")}</Link>
                </DropdownMenuItem>
                {isDealer && (
                  <DropdownMenuItem asChild className="rounded-xl text-sm">
                    <Link to="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t("dash.title")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onSelect={() => void signOut()}
                  className="rounded-xl text-sm text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("auth.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="rounded-full px-4 text-xs font-semibold">
              <Link to="/auth">{t("auth.signin")}</Link>
            </Button>
          )}


          <DropdownMenu>
            <DropdownMenuTrigger asChild className="lg:hidden">
              <Button size="icon" variant="secondary" className="rounded-full">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44 rounded-2xl">
              {navItems.map((item) => (
                <DropdownMenuItem key={item.to} asChild className="rounded-xl text-sm">
                  <Link to={item.to}>{t(item.key)}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild className="rounded-xl text-sm">
                <Link to="/compare">{t("cmp.title")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl text-sm">
                <Link to="/chat">{t("nav.dealer")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl text-sm">
                <Link to="/dashboard">{t("nav.dealers")}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} AutoHub</span>
        <span>Қазақша · Русский · English</span>
      </div>
    </footer>
  );
}
