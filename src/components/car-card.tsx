import { Link } from "@tanstack/react-router";
import { Heart, Scale } from "lucide-react";
import { toast } from "sonner";
import { type Car, money, monthlyPayment, num } from "@/lib/cars";
import { useFavorites } from "@/lib/favorites";
import { useCompare } from "@/lib/compare";
import { useI18n } from "@/lib/i18n";

export function CarCard({ car }: { car: Car }) {
  const { has, toggle } = useFavorites();
  const compare = useCompare();
  const { t } = useI18n();
  const fav = has(car.id);
  const inCompare = compare.has(car.id);

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40">
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
        <button
          type="button"
          aria-label={t("cars.favorites")}
          onClick={() => toggle(car.id)}
          className="grid h-9 w-9 place-items-center rounded-full bg-background/70 backdrop-blur transition-colors hover:bg-background"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${fav ? "fill-primary text-primary" : "text-muted-foreground"}`}
          />
        </button>
        <button
          type="button"
          aria-label={t("cmp.add")}
          onClick={() => {
            const ok = compare.toggle(car.id);
            if (!ok) toast.error(t("cmp.full"));
            else toast.success(inCompare ? t("cmp.removed") : t("cmp.added"));
          }}
          className="grid h-9 w-9 place-items-center rounded-full bg-background/70 backdrop-blur transition-colors hover:bg-background"
        >
          <Scale
            className={`h-4 w-4 transition-colors ${inCompare ? "text-primary" : "text-muted-foreground"}`}
          />
        </button>
      </div>
      <Link to="/cars/$carId" params={{ carId: car.id }} className="block">
        <div className="aspect-[3/2] overflow-hidden bg-muted">
          <img
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            loading="lazy"
            width={1280}
            height={854}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <div className="space-y-1 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate text-sm font-semibold">
              {car.brand} {car.model}
            </h3>
            <span className="shrink-0 text-sm font-semibold">{money(car.price)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {car.year} · {num(car.mileage)} km · {car.city}
          </p>
          <p className="pt-1 text-xs font-medium text-primary">
            {money(monthlyPayment(car.price))}
            {t("cars.from")}
          </p>
        </div>
      </Link>
    </div>
  );
}
