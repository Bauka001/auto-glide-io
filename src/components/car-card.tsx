import { Link } from "@tanstack/react-router";
import { Heart, Scale } from "lucide-react";
import { toast } from "sonner";
import { type Car, money, monthlyPayment, num } from "@/lib/cars";
import { carTitle } from "@/lib/car-spec";
import { useFavorites } from "@/lib/favorites";
import { useCompare } from "@/lib/compare";
import { useI18n } from "@/lib/i18n";

function useCardActions(car: Car) {
  const { has, toggle } = useFavorites();
  const compare = useCompare();
  const { t } = useI18n();
  const fav = has(car.id);
  const inCompare = compare.has(car.id);
  const onCompare = () => {
    const ok = compare.toggle(car.id);
    if (!ok) toast.error(t("cmp.full"));
    else toast.success(inCompare ? t("cmp.removed") : t("cmp.added"));
  };
  return { fav, inCompare, toggle, onCompare, t };
}

function Actions({ car, className }: { car: Car; className?: string }) {
  const { fav, inCompare, toggle, onCompare, t } = useCardActions(car);
  return (
    <div className={`z-10 flex flex-col gap-2 ${className ?? ""}`}>
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
        onClick={onCompare}
        className="grid h-9 w-9 place-items-center rounded-full bg-background/70 backdrop-blur transition-colors hover:bg-background"
      >
        <Scale
          className={`h-4 w-4 transition-colors ${inCompare ? "text-primary" : "text-muted-foreground"}`}
        />
      </button>
    </div>
  );
}

export function CarCard({ car, view = "grid" }: { car: Car; view?: "grid" | "list" }) {
  const { t } = useI18n();
  const specs = `${car.year} · ${num(car.mileage)} km · ${car.city}`;

  if (view === "list") {
    return (
      <div className="group relative flex gap-3 overflow-hidden rounded-3xl border border-border bg-card p-3 transition-colors hover:border-primary/40 sm:gap-4">
        <Link
          to="/cars/$carId"
          params={{ carId: car.id }}
          className="flex min-w-0 flex-1 gap-3 sm:gap-4"
        >
          <div className="h-24 w-32 shrink-0 overflow-hidden rounded-2xl bg-muted sm:h-28 sm:w-44">
            <img
              src={car.image}
              alt={carTitle(car)}
              loading="lazy"
              width={1280}
              height={854}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="truncate text-sm font-semibold">{carTitle(car)}</h3>
            <p className="text-sm font-semibold">{money(car.price)}</p>
            <p className="text-xs text-muted-foreground">{specs}</p>
            <p className="text-xs font-medium text-primary">
              {money(monthlyPayment(car.price))}
              {t("cars.from")}
            </p>
          </div>
        </Link>
        <Actions car={car} />
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40">
      <Actions car={car} className="absolute right-3 top-3" />
      <Link to="/cars/$carId" params={{ carId: car.id }} className="block">
        <div className="aspect-[3/2] overflow-hidden bg-muted">
          <img
            src={car.image}
            alt={carTitle(car)}
            loading="lazy"
            width={1280}
            height={854}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <div className="space-y-1 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate text-sm font-semibold">{carTitle(car)}</h3>
            <span className="shrink-0 text-sm font-semibold">{money(car.price)}</span>
          </div>
          <p className="text-xs text-muted-foreground">{specs}</p>
          <p className="pt-1 text-xs font-medium text-primary">
            {money(monthlyPayment(car.price))}
            {t("cars.from")}
          </p>
        </div>
      </Link>
    </div>
  );
}
