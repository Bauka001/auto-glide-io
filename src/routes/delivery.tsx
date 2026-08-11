import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Truck } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n, type Key } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { money } from "@/lib/cars";
import {
  deliveryPrice,
  deliveryTariffs,
  TRANSIT_INSURANCE_FEE,
  type TariffId,
} from "@/lib/delivery-tariffs";
import {
  shipmentLabels,
  shipmentStages,
  useDeliveryCheckout,
  useMyShipments,
} from "@/lib/payments";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Paid car delivery to your door — AutoHub" },
      {
        name: "description",
        content:
          "Order paid car delivery: standard, express or VIP enclosed carrier. See the price instantly and track every step.",
      },
      { property: "og:title", content: "Paid car delivery — AutoHub" },
      {
        property: "og:description",
        content: "Choose a delivery plan, pay online and track the status live.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeliveryPage,
});

type Plan = { id: TariffId; name: Key; desc: Key };

const plans: Plan[] = [
  { id: "standard", name: "del.standard", desc: "del.standardD" },
  { id: "express", name: "del.express", desc: "del.expressD" },
  { id: "vip", name: "del.vip", desc: "del.vipD" },
];

function DeliveryPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const checkout = useDeliveryCheckout();
  const { data: shipments = [] } = useMyShipments(Boolean(user));

  const [planId, setPlanId] = useState<TariffId>("standard");
  const [distance, setDistance] = useState(300);
  const [insure, setInsure] = useState(true);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");

  const plan = deliveryTariffs[planId];
  const total = useMemo(
    () => deliveryPrice(planId, distance, insure),
    [planId, distance, insure],
  );

  async function submit() {
    try {
      await checkout.mutateAsync({
        tariff: planId,
        toCity: city,
        address,
        distanceKm: distance,
        insurance: insure,
        date,
      });
      toast.success(t("del.paid"));
    } catch {
      toast.error(t("del.payFail"));
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15">
            <Truck className="h-5 w-5 text-primary" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{t("del.title")}</h1>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{t("del.payNote")}</p>

        <section className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold">{t("del.tariff")}</h2>
          {plans.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={p.id === planId}
              onClick={() => setPlanId(p.id)}
              className={`flex w-full items-center justify-between rounded-3xl border p-4 text-left transition-colors ${
                p.id === planId ? "border-primary bg-primary/10" : "border-border bg-card"
              }`}
            >
              <span>
                <span className="block text-sm font-semibold">{t(p.name)}</span>
                <span className="block text-xs text-muted-foreground">{t(p.desc)}</span>
              </span>
              <span className="text-sm font-semibold">
                {money(deliveryTariffs[p.id].base)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  + {money(deliveryTariffs[p.id].perKm)}/км
                </span>
              </span>
            </button>
          ))}
        </section>

        <form
          className="mt-6 space-y-4 rounded-3xl border border-border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="city">{t("del.city")}</Label>
            <Input
              id="city"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-12 rounded-2xl"
              placeholder="Almaty"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">{t("del.address")}</Label>
            <Input
              id="address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-12 rounded-2xl"
              placeholder="Abay ave. 10"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">{t("del.date")}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">{t("del.distance")}</Label>
              <Input
                id="distance"
                type="number"
                min={10}
                max={5000}
                value={distance}
                onChange={(e) => setDistance(Math.max(10, Number(e.target.value)))}
                className="h-12 rounded-2xl"
              />
            </div>
          </div>

          <label className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
            <span className="text-sm">
              {t("del.insuranceAdd")}
              <span className="ml-2 text-xs text-muted-foreground">
                +{money(TRANSIT_INSURANCE_FEE)}
              </span>
            </span>
            <input
              type="checkbox"
              aria-label={t("del.insuranceAdd")}
              checked={insure}
              onChange={(e) => setInsure(e.target.checked)}
              className="h-5 w-5 accent-[hsl(var(--primary))]"
            />
          </label>

          <div className="space-y-1.5 rounded-2xl border border-border p-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{t("del.base")}</span>
              <span>{money(plan.base)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>
                {t("del.perKm")} × {distance}
              </span>
              <span>{money(plan.perKm * distance)}</span>
            </div>
            {insure && (
              <div className="flex justify-between text-muted-foreground">
                <span>{t("del.insuranceAdd")}</span>
                <span>{money(TRANSIT_INSURANCE_FEE)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-semibold">
              <span>{t("del.total")}</span>
              <span>{money(total)}</span>
            </div>
          </div>

          {user ? (
            <Button
              type="submit"
              disabled={checkout.isPending}
              className="h-12 w-full rounded-2xl"
            >
              {t("del.pay")} · {money(total)}
            </Button>
          ) : (
            <Button asChild className="h-12 w-full rounded-2xl">
              <Link to="/auth" search={{ next: "/delivery" }}>
                {t("auth.needLogin")}
              </Link>
            </Button>
          )}
        </form>

        {user && shipments.length > 0 && (
          <section className="mt-8 space-y-4">
            <h2 className="text-sm font-semibold">{t("del.myShipments")}</h2>
            {shipments.map((s) => {
              const index = shipmentStages.indexOf(s.status);
              return (
                <article
                  key={s.id}
                  className="animate-fade-in rounded-3xl border border-border bg-card p-5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold">
                      {s.to_city || "—"}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {s.distance_km} км
                      </span>
                    </p>
                    <p className="text-sm font-semibold">{money(s.price)}</p>
                  </div>
                  {s.eta_date && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("del.eta")}: {s.eta_date}
                    </p>
                  )}
                  {s.courier_name && (
                    <p className="text-xs text-muted-foreground">
                      {t("del.courier")}: {s.courier_name} {s.courier_phone}
                    </p>
                  )}
                  <ol className="mt-5 space-y-4">
                    {shipmentStages.map((stage, i) => (
                      <li key={stage} className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${
                            index >= i
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index >= i ? <Check className="h-3.5 w-3.5" /> : i + 1}
                        </span>
                        <span
                          className={`text-sm ${
                            index >= i ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {shipmentLabels[stage][lang]}
                        </span>
                      </li>
                    ))}
                  </ol>
                </article>
              );
            })}
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
