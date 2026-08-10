import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, Link2, List, Scale, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { CarCard } from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { num, type Car } from "@/lib/cars";
import {
  bodyTypes,
  colors,
  conditions,
  drives,
  fuels,
  steerings,
  transmissions,
  type Option,
} from "@/lib/car-spec";
import { brandsOf, useCars } from "@/lib/catalog";
import { useCompare } from "@/lib/compare";
import { useI18n, type Key } from "@/lib/i18n";

type CarSearch = {
  q?: string | undefined;
  brand?: string | undefined;
  model?: string | undefined;
  gen?: string | undefined;
  mode?: string | undefined;
  priceFrom?: number | undefined;
  priceTo?: number | undefined;
  yearFrom?: number | undefined;
  yearTo?: number | undefined;
  mileageFrom?: number | undefined;
  mileageTo?: number | undefined;
  body?: string | undefined;
  fuel?: string | undefined;
  trans?: string | undefined;
  drive?: string | undefined;
  volFrom?: number | undefined;
  volTo?: number | undefined;
  color?: string | undefined;
  city?: string | undefined;
  steering?: string | undefined;
  condition?: string | undefined;
  customs?: string | undefined;
  sort?: string | undefined;
  view?: string | undefined;
  category?: string | undefined;
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
    model: str(search["model"]),
    gen: str(search["gen"]),
    mode: str(search["mode"]),
    priceFrom: numOf(search["priceFrom"]),
    priceTo: numOf(search["priceTo"]),
    yearFrom: numOf(search["yearFrom"]),
    yearTo: numOf(search["yearTo"]),
    mileageFrom: numOf(search["mileageFrom"]),
    mileageTo: numOf(search["mileageTo"]),

    body: str(search["body"]),
    fuel: str(search["fuel"]),
    trans: str(search["trans"]),
    drive: str(search["drive"]),
    volFrom: numOf(search["volFrom"]),
    volTo: numOf(search["volTo"]),
    color: str(search["color"]),
    city: str(search["city"]),
    steering: str(search["steering"]),
    condition: str(search["condition"]),
    customs: str(search["customs"]),
    sort: str(search["sort"]),
    view: str(search["view"]),
    category: str(search["category"]),
  }),
  head: () => ({
    meta: [
      { title: "Көліктер каталогы — AutoHub" },
      {
        name: "description",
        content:
          "Filter verified cars by brand, model, body type, engine, drive and price. Monthly payment in tenge on every listing.",
      },
      { property: "og:title", content: "Browse cars — AutoHub" },
      {
        property: "og:description",
        content: "Detailed car filters: brand, model, body, engine, drive, colour and price.",
      },
    ],
  }),
  component: CarsPage,
});

const csv = (v?: string) => (v ? v.split(",").filter(Boolean) : []);
const toggleIn = (list: string[], v: string) =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

const SAVED_KEY = "autohub.saved-searches";
type SavedSearch = { name: string; search: string };

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function sortCars(list: Car[], sort: string) {
  const arr = [...list];
  switch (sort) {
    case "priceAsc":
      return arr.sort((a, b) => a.price - b.price);
    case "priceDesc":
      return arr.sort((a, b) => b.price - a.price);
    case "mileage":
      return arr.sort((a, b) => a.mileage - b.mileage);
    case "year":
      return arr.sort((a, b) => b.year - a.year);
    default:
      return arr;
  }
}

function CarsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/cars/" });
  const { t, lang } = useI18n();
  const compare = useCompare();
  const { data: cars = [], isLoading } = useCars();
  const brands = useMemo(() => brandsOf(cars), [cars]);

  const q = search.q ?? "";
  const view = search.view === "list" ? "list" : "grid";
  const sort = search.sort ?? "new";
  const body = csv(search.body);
  const fuel = csv(search.fuel);
  const trans = csv(search.trans);
  const gens = csv(search.gen);
  const onlyNew = search.mode !== "all";


  const [term, setTerm] = useState(q);
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<SavedSearch[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_KEY);
      if (raw) setSaved(JSON.parse(raw) as SavedSearch[]);
    } catch {
      /* ignore */
    }
  }, []);

  const patch = (next: Partial<CarSearch>) =>
    void navigate({
      search: ((prev: CarSearch) => ({ ...prev, ...next })) as never,
      replace: true,
    });

  const models = useMemo(
    () =>
      [...new Set(cars.filter((c) => !search.brand || c.brand === search.brand).map((c) => c.model))],
    [cars, search.brand],
  );

  const generations = useMemo(() => {
    if (!search.model) return [];
    return [
      ...new Set(
        cars
          .filter(
            (c) =>
              c.model === search.model && (!search.brand || c.brand === search.brand) && c.generation,
          )
          .map((c) => c.generation as string),
      ),
    ];
  }, [cars, search.brand, search.model]);

  const cities = useMemo(() => [...new Set(cars.map((c) => c.city).filter(Boolean))], [cars]);


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
    const filtered = cars.filter((c) => {
      if (onlyNew && c.condition !== "new") return false;
      if (search.brand && c.brand !== search.brand) return false;
      if (search.model && c.model !== search.model) return false;
      if (gens.length && !gens.includes(c.generation ?? "")) return false;
      if (search.category && c.category !== search.category) return false;
      if (search.priceFrom !== undefined && c.price < search.priceFrom) return false;
      if (search.priceTo !== undefined && c.price > search.priceTo) return false;
      if (search.yearFrom !== undefined && c.year < search.yearFrom) return false;
      if (search.yearTo !== undefined && c.year > search.yearTo) return false;
      if (!onlyNew && search.mileageFrom !== undefined && c.mileage < search.mileageFrom)
        return false;
      if (!onlyNew && search.mileageTo !== undefined && c.mileage > search.mileageTo) return false;

      if (body.length && !body.includes(c.bodyType ?? "")) return false;
      if (fuel.length && !fuel.includes(c.fuel)) return false;
      if (trans.length && !trans.includes(c.transmission)) return false;
      if (search.drive && c.drive !== search.drive) return false;
      if (search.volFrom !== undefined && (c.engineVolume ?? 0) < search.volFrom) return false;
      if (search.volTo !== undefined && (c.engineVolume ?? 0) > search.volTo) return false;
      if (search.color && c.color !== search.color) return false;
      if (search.city && c.city !== search.city) return false;
      if (search.steering && c.steering !== search.steering) return false;
      if (search.condition && c.condition !== search.condition) return false;
      if (search.customs === "1" && !c.customsCleared) return false;
      if (
        needle &&
        !`${c.brand} ${c.model} ${c.year} ${c.category} ${c.trim ?? ""}`
          .toLowerCase()
          .includes(needle)
      )
        return false;
      return true;
    });
    return sortCars(filtered, sort);
  }, [cars, search, q, sort, onlyNew, gens.join(","), body.join(","), fuel.join(","), trans.join(",")]);

  const activeCount = [
    search.brand,
    search.model,
    search.category,
    search.priceFrom,
    search.priceTo,
    search.yearFrom,
    search.yearTo,
    search.mileageTo,
    search.body,
    search.fuel,
    search.trans,
    search.drive,
    search.volFrom,
    search.volTo,
    search.color,
    search.city,
    search.steering,
    search.condition,
    search.customs,
  ].filter((v) => v !== undefined && v !== "").length;

  const reset = () => void navigate({ search: {} as never, replace: true });

  const saveSearch = () => {
    const name = `${search.brand ?? t("cars.all")}${search.model ? ` ${search.model}` : ""} · ${results.length}`;
    const next = [
      { name, search: window.location.search },
      ...saved.filter((s) => s.search !== window.location.search),
    ].slice(0, 8);
    setSaved(next);
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    toast.success(t("f.savedOk"));
  };

  const MultiChips = ({
    options,
    values,
    onToggle,
  }: {
    options: Option[];
    values: string[];
    onToggle: (v: string) => void;
  }) => (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o.value} active={values.includes(o.value)} onClick={() => onToggle(o.value)}>
          {o[lang]}
        </Chip>
      ))}
    </div>
  );

  const Selector = ({
    value,
    options,
    onChange,
    placeholder,
  }: {
    value: string | undefined;
    options: { value: string; label: string }[];
    onChange: (v: string | undefined) => void;
    placeholder: string;
  }) => (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || undefined)}
      className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );

  const numInput = (
    key: keyof CarSearch,
    placeholder: string,
    value: number | undefined,
  ) => (
    <Input
      inputMode="numeric"
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(e) => patch({ [key]: e.target.value ? Number(e.target.value) : undefined })}
      className="h-11 rounded-2xl"
    />
  );

  const filterBody = (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("f.brand")}>
          <Selector
            value={search.brand}
            placeholder={t("f.any")}
            options={brands.map((b) => ({ value: b, label: b }))}
            onChange={(v) => patch({ brand: v, model: undefined })}
          />
        </Field>
        <Field label={t("f.model")}>
          <Selector
            value={search.model}
            placeholder={t("f.any")}
            options={models.map((m) => ({ value: m, label: m }))}
            onChange={(v) => patch({ model: v })}
          />
        </Field>
      </div>

      <Field label={`${t("f.priceFrom")} — ${t("f.priceTo")}`}>
        <div className="grid grid-cols-2 gap-3">
          {numInput("priceFrom", "2 000 000", search.priceFrom)}
          {numInput("priceTo", "40 000 000", search.priceTo)}
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`${t("f.yearFrom")} — ${t("f.yearTo")}`}>
          <div className="grid grid-cols-2 gap-3">
            {numInput("yearFrom", "2015", search.yearFrom)}
            {numInput("yearTo", "2026", search.yearTo)}
          </div>
        </Field>
        <Field label={t("f.mileageTo")}>{numInput("mileageTo", "100000", search.mileageTo)}</Field>
      </div>

      <Field label={t("f.body")}>
        <MultiChips
          options={bodyTypes}
          values={body}
          onToggle={(v) => patch({ body: toggleIn(body, v).join(",") || undefined })}
        />
      </Field>

      <Field label={t("f.fuel")}>
        <MultiChips
          options={fuels}
          values={fuel}
          onToggle={(v) => patch({ fuel: toggleIn(fuel, v).join(",") || undefined })}
        />
      </Field>

      <Field label={t("f.trans")}>
        <MultiChips
          options={transmissions}
          values={trans}
          onToggle={(v) => patch({ trans: toggleIn(trans, v).join(",") || undefined })}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("f.drive")}>
          <Selector
            value={search.drive}
            placeholder={t("f.any")}
            options={drives.map((d) => ({ value: d.value, label: d[lang] }))}
            onChange={(v) => patch({ drive: v })}
          />
        </Field>
        <Field label={`${t("f.volFrom")} — ${t("f.volTo")}`}>
          <div className="grid grid-cols-2 gap-3">
            {numInput("volFrom", "1.0", search.volFrom)}
            {numInput("volTo", "5.0", search.volTo)}
          </div>
        </Field>
      </div>

      <Field label={t("f.color")}>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-label={c[lang]}
              title={c[lang]}
              onClick={() => patch({ color: search.color === c.value ? undefined : c.value })}
              className={`h-8 w-8 rounded-full border-2 transition-all ${
                search.color === c.value ? "border-primary scale-110" : "border-border"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </Field>

      <details className="rounded-2xl border border-border p-4">
        <summary className="cursor-pointer text-sm font-medium">{t("f.all")}</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={t("f.city")}>
            <Selector
              value={search.city}
              placeholder={t("f.any")}
              options={cities.map((c) => ({ value: c, label: c }))}
              onChange={(v) => patch({ city: v })}
            />
          </Field>
          <Field label={t("f.steering")}>
            <Selector
              value={search.steering}
              placeholder={t("f.any")}
              options={steerings.map((s) => ({ value: s.value, label: s[lang] }))}
              onChange={(v) => patch({ steering: v })}
            />
          </Field>
          <Field label={t("f.condition")}>
            <Selector
              value={search.condition}
              placeholder={t("f.any")}
              options={conditions.map((s) => ({ value: s.value, label: s[lang] }))}
              onChange={(v) => patch({ condition: v })}
            />
          </Field>
          <label className="flex items-center gap-3 self-end rounded-2xl border border-border px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={search.customs === "1"}
              onChange={(e) => patch({ customs: e.target.checked ? "1" : undefined })}
              className="h-4 w-4 accent-primary"
            />
            {t("f.customs")}
          </label>
        </div>
      </details>

      <div className="flex gap-2">
        <Button variant="secondary" className="h-11 flex-1 rounded-2xl" onClick={reset}>
          {t("f.clear")}
        </Button>
        <Button className="h-11 flex-1 rounded-2xl" onClick={() => setOpen(false)}>
          {t("f.show")} ({results.length})
        </Button>
      </div>
    </div>
  );

  const sortOptions: { value: string; key: Key }[] = [
    { value: "new", key: "f.sortNew" },
    { value: "priceAsc", key: "f.sortPriceAsc" },
    { value: "priceDesc", key: "f.sortPriceDesc" },
    { value: "mileage", key: "f.sortMileage" },
    { value: "year", key: "f.sortYear" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("cars.all")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {num(results.length)} {t("cars.count")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="rounded-2xl" onClick={saveSearch}>
              <Star className="mr-2 h-4 w-4" />
              {t("f.save")}
            </Button>
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

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button className="h-11 rounded-2xl">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {t("f.filters")}
                {activeCount > 0 && (
                  <span className="ml-2 rounded-full bg-primary-foreground px-2 py-0.5 text-xs font-semibold text-primary">
                    {activeCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>{t("f.filters")}</SheetTitle>
              </SheetHeader>
              <div className="mx-auto w-full max-w-2xl pb-8 pt-4">{filterBody}</div>
            </SheetContent>
          </Sheet>

          <select
            value={sort}
            onChange={(e) => patch({ sort: e.target.value === "new" ? undefined : e.target.value })}
            className="h-11 rounded-2xl border border-border bg-background px-3 text-sm"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.key)}
              </option>
            ))}
          </select>

          <div className="flex overflow-hidden rounded-2xl border border-border">
            <button
              type="button"
              aria-label={t("f.grid")}
              onClick={() => patch({ view: undefined })}
              className={`grid h-11 w-11 place-items-center ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={t("f.list")}
              onClick={() => patch({ view: "list" })}
              className={`grid h-11 w-11 place-items-center ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {activeCount > 0 && (
            <Button variant="ghost" className="h-11 rounded-2xl" onClick={reset}>
              <X className="mr-1 h-4 w-4" />
              {t("f.clear")}
            </Button>
          )}
        </div>

        {saved.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <span className="shrink-0 self-center text-xs text-muted-foreground">
              {t("f.saved")}:
            </span>
            {saved.map((s) => (
              <a
                key={s.search}
                href={`/cars${s.search}`}
                className="shrink-0 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {s.name}
              </a>
            ))}
          </div>
        )}

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <Chip active={!search.brand} onClick={() => patch({ brand: undefined, model: undefined })}>
            {t("home.all")}
          </Chip>
          {brands.map((b) => (
            <Chip
              key={b}
              active={search.brand === b}
              onClick={() =>
                patch({ brand: search.brand === b ? undefined : b, model: undefined })
              }
            >
              {b}
            </Chip>
          ))}
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
          <div
            className={
              view === "list"
                ? "mt-6 space-y-3"
                : "mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {results.map((car) => (
              <CarCard key={car.id} car={car} view={view} />
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
