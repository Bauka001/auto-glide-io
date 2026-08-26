import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { CarCard } from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { useCars } from "@/lib/catalog";
import { useFavorites } from "@/lib/favorites";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Таңдаулы көліктер — AutoHub" },
      {
        name: "description",
        content: "Ұнатқан көліктеріңіз бір жерде: баға, ай сайынғы төлем және сипаттамалары.",
      },
      { property: "og:title", content: "Таңдаулы көліктер — AutoHub" },
      {
        property: "og:description",
        content: "Save cars you like and compare prices and monthly payments in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { t } = useI18n();
  const { ids } = useFavorites();
  const { data: cars = [] } = useCars();
  const favCars = cars.filter((c) => ids.includes(c.id));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/12">
            <Heart className="h-5 w-5 fill-primary text-primary" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("cars.favorites")}</h1>
            <p className="text-sm text-muted-foreground">{favCars.length}</p>
          </div>
        </div>

        {favCars.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <Heart className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-3 text-sm text-muted-foreground">{t("pro.empty")}</p>
            <Button asChild className="mt-5 rounded-2xl">
              <Link to="/cars">{t("nav.cars")}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favCars.map((c) => (
              <CarCard key={c.id} car={c} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
