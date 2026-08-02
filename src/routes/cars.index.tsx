import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { CarCard } from "@/components/car-card";
import { Slider } from "@/components/ui/slider";
import { brands, cars, categories, money } from "@/lib/cars";

type CarSearch = {
  q?: string | undefined;
  brand?: string | undefined;
  category?: string | undefined;
};

export const Route = createFileRoute("/cars/")({
  validateSearch: (search: Record<string, unknown>): CarSearch => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
    brand: typeof search["brand"] === "string" ? (search["brand"] as string) : undefined,
    category: typeof search["category"] === "string" ? (search["category"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse cars — Motra" },
      {
        name: "description",
        content: "Filter verified cars by price, brand, year and mileage. Monthly payment shown.",
      },
      { property: "og:title", content: "Browse cars — Motra" },
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
  const [brand, setBrand] = useState<string | undefined>(search.brand);
  const [category, setCategory] = useState<string | undefined>(search.category);
  const [maxPrice, setMaxPrice] = useState(70000);
  const [minYear, setMinYear] = useState(2020);
  const [maxMileage, setMaxMileage] = useState(60000);

  const results = useMemo(() => {
    const q = (search.q ?? "").toLowerCase().trim();
    return cars.filter((c) => {
      if (brand && c.brand !== brand) return false;
      if (category && c.category !== category) return false;
      if (c.price > maxPrice) return false;
      if (c.year < minYear) return false;
      if (c.mileage > maxMileage) return false;
      if (q && !`${c.brand} ${c.model} ${c.year} ${c.category}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [brand, category, maxPrice, minYear, maxMileage, search.q]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">All cars</h1>
        <p className="mt-1 text-sm text-muted-foreground">{results.length} cars available</p>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          <Chip active={!brand && !category} onClick={() => (setBrand(undefined), setCategory(undefined))}>
            All
          </Chip>
          {categories.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? undefined : c)}>
              {c}
            </Chip>
          ))}
          {brands.map((b) => (
            <Chip key={b} active={brand === b} onClick={() => setBrand(brand === b ? undefined : b)}>
              {b}
            </Chip>
          ))}
        </div>

        <div className="mt-6 grid gap-4 rounded-3xl bg-muted p-5 sm:grid-cols-3">
          <div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Max price</span>
              <span className="font-medium text-foreground">{money(maxPrice)}</span>
            </div>
            <Slider
              className="mt-3"
              min={10000}
              max={70000}
              step={1000}
              value={[maxPrice]}
              onValueChange={([v]) => setMaxPrice(v ?? maxPrice)}
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min year</span>
              <span className="font-medium text-foreground">{minYear}</span>
            </div>
            <Slider
              className="mt-3"
              min={2018}
              max={2025}
              step={1}
              value={[minYear]}
              onValueChange={([v]) => setMinYear(v ?? minYear)}
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Max mileage</span>
              <span className="font-medium text-foreground">
                {maxMileage.toLocaleString()} km
              </span>
            </div>
            <Slider
              className="mt-3"
              min={0}
              max={60000}
              step={1000}
              value={[maxMileage]}
              onValueChange={([v]) => setMaxMileage(v ?? maxMileage)}
            />
          </div>
        </div>

        {results.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            No cars match these filters.{" "}
            <Link to="/cars" className="text-primary hover:underline" onClick={() => {
              setBrand(undefined);
              setCategory(undefined);
              setMaxPrice(70000);
              setMinYear(2018);
              setMaxMileage(60000);
            }}>
              Reset
            </Link>
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
