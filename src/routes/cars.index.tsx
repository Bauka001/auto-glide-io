import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Link2, Scale, Search } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { CarCard } from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { categories, money, num } from "@/lib/cars";
import { brandsOf, useCars } from "@/lib/catalog";
import { useCompare } from "@/lib/compare";
import { useI18n } from "@/lib/i18n";

const DEFAULTS = { maxPrice: 40000000, minYear: 2018, maxMileage: 60000 };

type CarSearch = {
  q?: string | undefined;
  brand?: string | undefined;
  category?: string | undefined;
  maxPrice?: number | undefined;
  minYear?: number | undefined;
  maxMileage?: number | undefined;
};

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
const numOf = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && v !== "" && v !== null && v !== undefined ? n : undefined;
};

export const Route = createFileRoute("/cars/")({
  validateSearch: (search: Record<string, unknown>): CarSearch => ({
    q: str(search["q"]),
    brand: str(search["brand"]),
    category: str(search["category"]),
    maxPrice: numOf(search["maxPrice"]),
    minYear: numOf(search["minYear"]),
    maxMileage: numOf(search["maxMileage"]),
  }),
  head: () => ({
    meta: [
      { title: "Көліктер каталогы — AutoHub" },
      {
        name: "description",
        content:
          "Filter verified cars by price, brand, year and mileage. Monthly payment in tenge shown on every card.",
      },
      { property: "og:title", content: "Browse cars — AutoHub" },
      {
        property: "og:description",
        content: "Filter verified cars by price, brand, year and mileage.",
      },
    ],
  }),
  component: CarsPage,
});

function Chip({
  active,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function CarsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/cars/" });
  const { t } = useI18n();
  const compare = useCompare();
  const { data: cars = [], isLoading } = useCars();
  const brands = useMemo(() => brandsOf(cars), [cars]);

  const q = search.q ?? "";
  const brand = search.brand;
  const category = search.category;
  const maxPrice = search.maxPrice ?? DEFAULTS.maxPrice;
  const minYear = search.minYear ?? DEFAULTS.minYear;
  const maxMileage = search.maxMileage ?? DEFAULTS.maxMileage;

  const [term, setTerm] = useState(q);
  const [focused, setFocused] = useState(false);

  const patch = (next: Partial<CarSearch>) =>
    void navigate({
      search: ((prev: CarSearch) => ({ ...prev, ...next })) as never,
      replace: true,
    });

  const suggestions = useMemo(() => {
    const s = term.trim().toLowerCase();
    if (!s) return [];
    const labels = new Set<string>();
    for (const c of cars) {
      for (const label of [c.brand, `${c.brand} ${c.model}`, c.category]) {
        if (label.toLowerCase().includes(s)) labels.add(label);
      }
    }
    return [...labels].slice(0, 6);
  }, [cars, term]);

  const results = useMemo(() => {
    const needle = q.toLowerCase().trim();
    return cars.filter((c) => {
      if (brand && c.brand !== brand) return false;
      if (category && c.category !== category) return false;
      if (c.price > maxPrice) return false;
      if (c.year < minYear) return false;
      if (c.mileage > maxMileage) return false;
      if (
        needle &&
        !`${c.brand} ${c.model} ${c.year} ${c.category}`.toLowerCase().includes(needle)
      )
        return false;
      return true;
    });
  }, [cars, brand, category, maxPrice, minYear, maxMileage, q]);

  const reset = () =>
    void navigate({
      search: {} as never,
      replace: true,
    });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("cars.all")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {results.length} {t("cars.count")}
            </p>
          </div>
          <Button
            variant="secondary"
            className="rounded-2xl"
            onClick={() => {
              void navigator.clipboard.writeText(window.location.href);
              toast.success(t("cars.linkCopied"));
            }}
          >
            <Link2 className="mr-2 h-4 w-4" />
            {t("cars.share")}
          </Button>
        </div>

        <form
          className="relative mt-5"
          onSubmit={(e) => {
            e.preventDefault();
            setFocused(false);
            patch({ q: term.trim() || undefined });
          }}
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 150)}
            placeholder={t("cars.searchPh")}
            className="h-12 rounded-2xl pl-11"
          />
          {focused && suggestions.length > 0 && (
            <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover shadow-lg">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onMouseDown={() => {
                      setTerm(s);
                      setFocused(false);
                      patch({ q: s });
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          <Chip
            active={!brand && !category}
            onClick={() => patch({ brand: undefined, category: undefined })}
          >
            {t("home.all")}
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c}
              active={category === c}
              onClick={() => patch({ category: category === c ? undefined : c })}
            >
              {c}
            </Chip>
          ))}
          {brands.map((b) => (
            <Chip
              key={b}
              active={brand === b}
              onClick={() => patch({ brand: brand === b ? undefined : b })}
            >
              {b}
            </Chip>
          ))}
        </div>

        <div className="mt-6 grid gap-4 rounded-3xl bg-muted p-5 sm:grid-cols-3">
          <div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("cars.maxPrice")}</span>
              <span className="font-medium text-foreground">{money(maxPrice)}</span>
            </div>
            <Slider
              className="mt-3"
              min={2000000}
              max={40000000}
              step={500000}
              value={[maxPrice]}
              onValueChange={([v]) => patch({ maxPrice: v ?? maxPrice })}
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("cars.minYear")}</span>
              <span className="font-medium text-foreground">{minYear}</span>
            </div>
            <Slider
              className="mt-3"
              min={2018}
              max={2025}
              step={1}
              value={[minYear]}
              onValueChange={([v]) => patch({ minYear: v ?? minYear })}
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("cars.maxMileage")}</span>
              <span className="font-medium text-foreground">{num(maxMileage)} km</span>
            </div>
            <Slider
              className="mt-3"
              min={0}
              max={60000}
              step={1000}
              value={[maxMileage]}
              onValueChange={([v]) => patch({ maxMileage: v ?? maxMileage })}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            {t("cars.noMatch")}{" "}
            <button type="button" onClick={reset} className="text-primary hover:underline">
              {t("cars.reset")}
            </button>
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </main>

      {compare.ids.length > 0 && (
        <div className="pointer-events-none sticky bottom-24 z-30 flex justify-center px-5 lg:bottom-6">
          <Button asChild className="pointer-events-auto h-12 rounded-2xl px-5 shadow-lg">
            <Link to="/compare">
              <Scale className="mr-2 h-4 w-4" />
              {t("cmp.open")} ({compare.ids.length})
            </Link>
          </Button>
        </div>
      )}
      <SiteFooter />
    </div>
  );
}
