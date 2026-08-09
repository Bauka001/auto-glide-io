import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Calendar, Fuel, Gauge, MapPin, MessageCircle, Scale, Settings2, Truck } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useCompare } from "@/lib/compare";
import { useI18n } from "@/lib/i18n";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { money, monthlyPayment, num } from "@/lib/cars";
import { bodyTypes, carTitle, colorLabel, conditions, drives, optionLabel, steerings } from "@/lib/car-spec";
import { rowToCar, recordCarView } from "@/lib/catalog";
import { getPublicCar } from "@/lib/catalog.functions";

export const Route = createFileRoute("/cars/$carId")({
  loader: async ({ params }) => {
    const row = await getPublicCar({ data: { id: params.carId } });
    if (!row) throw notFound();
    return { car: rowToCar(row) };
  },

  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Car not found — AutoHub" }, { name: "robots", content: "noindex" }] };
    }
    const { car } = loaderData;
    const title = `${car.year} ${car.brand} ${car.model} — ${money(car.price)} | AutoHub`;
    const description = `${car.year} ${car.brand} ${car.model}, ${num(car.mileage)} km. From ${money(monthlyPayment(car.price))}/mo with online credit and home delivery.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CarDetail,
});

function CarDetail() {
  const { car } = Route.useLoaderData();
  const { t, lang } = useI18n();
  const compare = useCompare();

  useEffect(() => {
    void recordCarView(car.id).catch(() => {});
  }, [car.id]);

  const specs = [
    { icon: Calendar, label: t("cmp.year"), value: String(car.year) },
    { icon: Gauge, label: t("cmp.mileage"), value: `${num(car.mileage)} km` },
    { icon: Settings2, label: t("cmp.engine"), value: car.engine },
    { icon: Fuel, label: t("cmp.fuel"), value: car.fuel },
    { icon: Settings2, label: t("cmp.trans"), value: car.transmission },
    { icon: MapPin, label: t("cmp.city"), value: car.city },
    { icon: Settings2, label: t("f.body"), value: optionLabel(bodyTypes, car.bodyType, lang) },
    { icon: Settings2, label: t("f.drive"), value: optionLabel(drives, car.drive, lang) },
    { icon: Settings2, label: t("spec.volume"), value: (car.engineVolume ?? 0).toFixed(1) },
    { icon: Settings2, label: t("f.color"), value: colorLabel(car.color, lang) },
    { icon: Settings2, label: t("f.steering"), value: optionLabel(steerings, car.steering, lang) },
    { icon: Settings2, label: t("f.condition"), value: optionLabel(conditions, car.condition, lang) },
    ...(car.generation ? [{ icon: Settings2, label: t("spec.generation"), value: car.generation }] : []),
    ...(car.trim ? [{ icon: Settings2, label: t("spec.trim"), value: car.trim }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-6">
        <Link to="/cars" className="text-sm text-muted-foreground hover:text-foreground">
          ← {t("cars.all")}
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-3xl bg-muted">
              <img
                src={car.image}
                alt={`${car.brand} ${car.model}`}
                width={1280}
                height={854}
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="overflow-hidden rounded-2xl bg-muted">
                  <img
                    src={car.image}
                    alt={`${car.brand} ${car.model} view ${i + 2}`}
                    loading="lazy"
                    width={1280}
                    height={854}
                    className="aspect-[3/2] w-full object-cover opacity-90"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {car.category}
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{carTitle(car)}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {car.year} · {num(car.mileage)} km
            </p>

            <div className="mt-5 rounded-3xl border border-border p-5">
              <p className="text-3xl font-semibold">{money(car.price)}</p>
              <p className="mt-1 text-sm text-primary">
                {money(monthlyPayment(car.price))}
                {t("cars.from")} · 60 · 20% · 21% ГЭСВ
              </p>
              <div className="mt-4 space-y-2">
                <Button asChild className="h-12 w-full rounded-2xl text-base">
                  <Link to="/credit" search={{ carId: car.id }}>
                    {t("car.credit")}
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="h-12 w-full rounded-2xl text-base">
                  <Link to="/chat" search={{ carId: car.id }}>
                    <MessageCircle className="h-4 w-4" /> {t("car.chat")}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 w-full rounded-2xl text-base">
                  <Link to="/delivery" search={{ carId: car.id }}>
                    <Truck className="h-4 w-4" /> {t("car.delivery")}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="h-12 w-full rounded-2xl text-base"
                  onClick={() => {
                    const ok = compare.toggle(car.id);
                    if (!ok) toast.error(t("cmp.full"));
                    else toast.success(compare.has(car.id) ? t("cmp.removed") : t("cmp.added"));
                  }}
                >
                  <Scale className="h-4 w-4" /> {t("cmp.add")}
                </Button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {specs.map((s) => (
                <div key={s.label} className="rounded-2xl bg-muted p-4">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <p className="mt-2 text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-sm font-medium">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
