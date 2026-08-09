import { createFileRoute, Link } from "@tanstack/react-router";
import { Scale, X } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { money, monthlyPayment, num } from "@/lib/cars";
import { useCars } from "@/lib/catalog";
import { useCompare } from "@/lib/compare";
import { useI18n, type Key } from "@/lib/i18n";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Көліктерді салыстыру — AutoHub" },
      {
        name: "description",
        content:
          "Compare up to three cars side by side: price, monthly payment, year, mileage, engine and transmission.",
      },
      { property: "og:title", content: "Compare cars — AutoHub" },
      {
        property: "og:description",
        content: "Up to three cars side by side with monthly payments in tenge.",
      },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { t } = useI18n();
  const { ids, remove, clear } = useCompare();
  const { data: cars = [], isLoading } = useCars();
  const selected = ids
    .map((id) => cars.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const rows: { key: Key; value: (c: (typeof selected)[number]) => string }[] = [
    { key: "cmp.price", value: (c) => money(c.price) },
    { key: "cmp.monthly", value: (c) => money(monthlyPayment(c.price)) },
    { key: "cmp.year", value: (c) => String(c.year) },
    { key: "cmp.mileage", value: (c) => `${num(c.mileage)} km` },
    { key: "cmp.engine", value: (c) => c.engine || "—" },
    { key: "cmp.fuel", value: (c) => c.fuel || "—" },
    { key: "cmp.trans", value: (c) => c.transmission || "—" },
    { key: "cmp.category", value: (c) => c.category },
    { key: "cmp.city", value: (c) => c.city },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15">
              <Scale className="h-5 w-5 text-primary" />
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">{t("cmp.title")}</h1>
          </div>
          {selected.length > 0 && (
            <Button variant="secondary" className="rounded-2xl" onClick={clear}>
              {t("cmp.clear")}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="mt-8 h-64 animate-pulse rounded-3xl bg-muted" />
        ) : selected.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">{t("cmp.empty")}</p>
            <Button asChild className="mt-5 rounded-2xl">
              <Link to="/cars">{t("cars.all")}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[520px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="w-28 p-0" />
                  {selected.map((c) => (
                    <th key={c.id} className="p-2 align-top">
                      <div className="relative overflow-hidden rounded-2xl border border-border bg-card text-left">
                        <button
                          type="button"
                          aria-label={t("cmp.clear")}
                          onClick={() => remove(c.id)}
                          className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/70 backdrop-blur"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <Link to="/cars/$carId" params={{ carId: c.id }}>
                          <img
                            src={c.image}
                            alt={`${c.brand} ${c.model}`}
                            loading="lazy"
                            width={1280}
                            height={854}
                            className="aspect-[3/2] w-full object-cover"
                          />
                          <p className="truncate p-3 text-sm font-semibold">
                            {c.brand} {c.model}
                          </p>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <td className="border-t border-border py-3 pr-2 align-top text-xs text-muted-foreground">
                      {t(row.key)}
                    </td>
                    {selected.map((c) => (
                      <td
                        key={c.id}
                        className="border-t border-border px-2 py-3 align-top font-medium"
                      >
                        {row.value(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
