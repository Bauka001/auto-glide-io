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
import { useCreateRequest } from "@/lib/requests";
import { money } from "@/lib/cars";

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
      { property: "og:description", content: "Choose a delivery plan, pay online and track the status live." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeliveryPage,
});

const stages: Key[] = ["del.s1", "del.s2", "del.s3", "del.s4"];

type Plan = { id: string; name: Key; desc: Key; base: number; perKm: number };

const plans: Plan[] = [
  { id: "standard", name: "del.standard", desc: "del.standardD", base: 120, perKm: 0.45 },
  { id: "express", name: "del.express", desc: "del.expressD", base: 250, perKm: 0.75 },
  { id: "vip", name: "del.vip", desc: "del.vipD", base: 480, perKm: 1.2 },
];

const INSURANCE_FEE = 90;

function DeliveryPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const createRequest = useCreateRequest();
  const [ordered, setOrdered] = useState(false);
  const [stage, setStage] = useState(1);

  const [planId, setPlanId] = useState("standard");
  const [distance, setDistance] = useState(300);
  const [insure, setInsure] = useState(true);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");

  const plan = plans.find((p) => p.id === planId)!;
  const total = useMemo(
    () => Math.round(plan.base + plan.perKm * distance + (insure ? INSURANCE_FEE : 0)),
    [plan, distance, insure],
  );

  async function submit() {
    try {
      await createRequest.mutateAsync({
        type: "delivery",
        details: { plan: plan.id, distance, insurance: insure, price: total, city, address, date },
      });
      setOrdered(true);
      toast.success(t("del.paid"));
    } catch {
      toast.error(t("auth.needLogin"));
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
                {money(p.base)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  + {money(p.perKm)}/km
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
                onChange={(e) => setDistance(Math.max(0, Number(e.target.value)))}
                className="h-12 rounded-2xl"
              />
            </div>
          </div>

          <label className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
            <span className="text-sm">
              {t("del.insuranceAdd")}
              <span className="ml-2 text-xs text-muted-foreground">+{money(INSURANCE_FEE)}</span>
            </span>
            <input
              type="checkbox"
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
                <span>{money(INSURANCE_FEE)}</span>
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
              disabled={createRequest.isPending}
              className="h-12 w-full rounded-2xl"
            >
              {t("del.pay")} · {money(total)}
            </Button>
          ) : (
            <Button asChild className="h-12 w-full rounded-2xl">
              <Link to="/auth">{t("auth.needLogin")}</Link>
            </Button>
          )}
        </form>

        {ordered && (
          <section className="mt-8 animate-fade-in rounded-3xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">{t("del.track")}</h2>
            <ol className="mt-5 space-y-5">
              {stages.map((s, i) => (
                <li key={s} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${
                      i <= stage
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i <= stage ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span
                    className={`text-sm ${i <= stage ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {t(s)}
                  </span>
                </li>
              ))}
            </ol>
            <Button
              variant="secondary"
              className="mt-5 h-11 w-full rounded-2xl"
              disabled={stage >= stages.length - 1}
              onClick={() => setStage((s) => Math.min(s + 1, stages.length - 1))}
            >
              {t("del.track")}
            </Button>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
