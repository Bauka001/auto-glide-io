import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BadgeCheck, MapPin, Search, Star, Store } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { useDealers } from "@/lib/dealers";
import { useI18n } from "@/lib/i18n";
import { num } from "@/lib/cars";

export const Route = createFileRoute("/dealers/")({
  head: () => ({
    meta: [
      { title: "Car dealerships in Kazakhstan — AutoHub" },
      {
        name: "description",
        content:
          "Browse verified AutoHub car dealerships, see their inventory, ratings and customer reviews.",
      },
      { property: "og:title", content: "Car dealerships — AutoHub" },
      { property: "og:description", content: "Verified salons, inventory and reviews." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DealersPage,
});

function DealersPage() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const { data: dealers = [], isLoading } = useDealers();

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return dealers;
    return dealers.filter(
      (d) => d.name.toLowerCase().includes(term) || d.city.toLowerCase().includes(term),
    );
  }, [dealers, q]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t("dlr.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("dlr.sub")}</p>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("dlr.searchPh")}
            className="h-12 rounded-2xl pl-11"
          />
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">{t("dlr.empty")}</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {list.map((d) => (
              <Link
                key={d.id}
                to="/dealers/$dealerId"
                params={{ dealerId: d.slug ?? d.id }}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-3xl border border-border bg-card p-4 transition-colors hover:border-primary/60"
              >
                {d.logoUrl ? (
                  <img
                    src={d.logoUrl}
                    alt={d.name}
                    loading="lazy"
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                ) : (
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15">
                    <Store className="h-6 w-6 text-primary" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                    {d.name}
                    {d.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {d.city || "—"}
                  </p>
                  <p className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      {d.rating || "—"} ({num(d.reviews)})
                    </span>
                    <span>
                      {t("dlr.cars")}: {num(d.cars)}
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
