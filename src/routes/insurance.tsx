import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { money } from "@/lib/cars";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/insurance")({
  head: () => ({
    meta: [
      { title: "Car insurance — MTPL and CASCO online — AutoHub" },
      {
        name: "description",
        content:
          "Calculate MTPL (ОГПО) and CASCO (КАСКО) prices in seconds and buy your policy online.",
      },
      { property: "og:title", content: "Car insurance online — AutoHub" },
      { property: "og:description", content: "MTPL and CASCO calculators with instant purchase." },
    ],
  }),
  component: InsurancePage,
});

function InsurancePage() {
  const { t } = useI18n();
  const [price, setPrice] = useState("30000");
  const [age, setAge] = useState("30");
  const [exp, setExp] = useState("5");

  const p = Number(price) || 0;
  const a = Number(age) || 30;
  const e = Number(exp) || 0;
  const ageFactor = a < 25 ? 1.4 : a < 35 ? 1.1 : 1;
  const expFactor = e < 2 ? 1.3 : e < 6 ? 1.1 : 0.95;

  const ogpo = Math.round(90 * ageFactor * expFactor);
  const kasko = Math.round(p * 0.045 * ageFactor * expFactor);

  const Fields = (
    <div className="mt-5 grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="price">{t("ins.carPrice")}</Label>
        <Input
          id="price"
          inputMode="numeric"
          value={price}
          onChange={(ev) => setPrice(ev.target.value)}
          className="h-12 rounded-2xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="age">{t("ins.age")}</Label>
        <Input
          id="age"
          inputMode="numeric"
          value={age}
          onChange={(ev) => setAge(ev.target.value)}
          className="h-12 rounded-2xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="exp">{t("ins.exp")}</Label>
        <Input
          id="exp"
          inputMode="numeric"
          value={exp}
          onChange={(ev) => setExp(ev.target.value)}
          className="h-12 rounded-2xl"
        />
      </div>
    </div>
  );

  const Result = ({ value }: { value: number }) => (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-primary/30 bg-primary/10 p-5">
      <div>
        <p className="text-xs text-muted-foreground">{t("ins.result")}</p>
        <p className="text-3xl font-semibold tracking-tight">{money(value)}</p>
      </div>
      <Button
        className="h-12 rounded-2xl px-6"
        onClick={() => toast.success(t("ins.bought"))}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {t("ins.buy")}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{t("ins.title")}</h1>
        </div>

        <Tabs defaultValue="ogpo" className="mt-8">
          <TabsList className="rounded-2xl">
            <TabsTrigger value="ogpo" className="rounded-xl">
              {t("ins.ogpo")}
            </TabsTrigger>
            <TabsTrigger value="kasko" className="rounded-xl">
              {t("ins.kasko")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ogpo" className="rounded-3xl border border-border bg-card p-5">
            {Fields}
            <Result value={ogpo} />
          </TabsContent>
          <TabsContent value="kasko" className="rounded-3xl border border-border bg-card p-5">
            {Fields}
            <Result value={kasko} />
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}
