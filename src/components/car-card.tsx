import { Link } from "@tanstack/react-router";
import { type Car, money, monthlyPayment } from "@/lib/cars";

export function CarCard({ car }: { car: Car }) {
  return (
    <Link
      to="/cars/$carId"
      params={{ carId: car.id }}
      className="group block overflow-hidden rounded-3xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.25)]"
    >
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
          {car.year} · {car.mileage.toLocaleString()} km · {car.city}
        </p>
        <p className="pt-1 text-xs font-medium text-primary">
          from {money(monthlyPayment(car.price))}/mo
        </p>
      </div>
    </Link>
  );
}
