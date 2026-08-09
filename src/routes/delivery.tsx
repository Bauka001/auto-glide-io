import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Truck } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n, type Key } from "@/lib/i18n";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Car delivery to your door — AutoHub" },
      {
        name: "description",
        content: "Order home delivery for your car and track every step of the way in real time.",
      },
      { property: "og:title", content: "Car delivery — AutoHub" },
      { property: "og:description", content: "Order delivery and track the status live." },
    ],
  }),
  component: DeliveryPage,
});

const stages: Key[] = ["del.s1", "del.s2", "del.s3", "del.s4"];

function DeliveryPage() {
  const { t } = useI18n();
  const [ordered, setOrdered] = useState(false);
  const [stage, setStage] = useState(1);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-10">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15">
            <Truck className="h-5 w-5 text-primary" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{t("del.title")}</h1>
        </div>

        <form
          className="mt-8 space-y-4 rounded-3xl border border-border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            setOrdered(true);
            toast.success(t("del.order"));
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="city">{t("del.city")}</Label>
            <Input id="city" className="h-12 rounded-2xl" placeholder="Almaty" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">{t("del.address")}</Label>
            <Input id="address" className="h-12 rounded-2xl" placeholder="Abay ave. 10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">{t("del.date")}</Label>
            <Input id="date" type="date" className="h-12 rounded-2xl" />
          </div>
          <Button type="submit" className="h-12 w-full rounded-2xl">
            {t("del.order")}
          </Button>
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
