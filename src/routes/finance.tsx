import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { money } from "@/lib/cars";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Car financing — loan, installments, leasing — AutoHub" },
      {
        name: "description",
        content:
          "Compare a car loan, interest-free installments and leasing, then apply online in minutes.",
      },
      { property: "og:title", content: "Car financing — AutoHub" },
      { property: "og:description", content: "Loan, installments and leasing calculators." },
    ],
  }),
  component: FinancePage,
});

const plans = [
  { id: "credit", rate: 0.14, key: "fin.credit" as const, terms: [12, 24, 36, 60] },
  { id: "install", rate: 0, key: "fin.install" as const, terms: [6, 12, 24] },
  { id: "leasing", rate: 0.1, key: "fin.leasing" as const, terms: [24, 36, 48] },
];

function FinancePage() {
  const { t } = useI18n();
  const [price, setPrice] = useState("30000");
  const [down, setDown] = useState("6000");
  const [term, setTerm] = useState(36);

  const principal = Math.max(0, (Number(price) || 0) - (Number(down) || 0));

  const monthly = (rate: number) => {
    if (rate === 0) return Math.round(principal / term);
    const r = rate / 12;
    return Math.round((principal * r) / (1 - Math.pow(1 + r, -term)));
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15">
            <Wallet className="h-5 w-5 text-primary" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{t("fin.title")}</h1>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fprice">{t("fin.price")}</Label>
            <Input
              id="fprice"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fdown">{t("fin.down")}</Label>
            <Input
              id="fdown"
              inputMode="numeric"
              value={down}
              onChange={(e) => setDown(e.target.value)}
              className="h-12 rounded-2xl"
            />
          </div>
        </div>

        <Tabs defaultValue="credit" className="mt-8">
          <TabsList className="rounded-2xl">
            {plans.map((p) => (
              <TabsTrigger key={p.id} value={p.id} className="rounded-xl">
                {t(p.key)}
              </TabsTrigger>
            ))}
          </TabsList>

          {plans.map((p) => (
            <TabsContent
              key={p.id}
              value={p.id}
              className="rounded-3xl border border-border bg-card p-5"
            >
              <p className="text-sm text-muted-foreground">{t("fin.term")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.terms.map((m) => (
                  <button
                    key={m}
                    onClick={() => setTerm(m)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      term === m
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-primary/30 bg-primary/10 p-5">
                <div>
                  <p className="text-xs text-muted-foreground">{t("fin.monthly")}</p>
                  <p className="text-3xl font-semibold tracking-tight">
                    {money(monthly(p.terms.includes(term) ? p.rate : p.rate))}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.rate === 0 ? "0%" : `${Math.round(p.rate * 100)}% APR`} ·{" "}
                    {p.terms.includes(term) ? term : p.terms[0]} mo
                  </p>
                </div>
                <Button
                  className="h-12 rounded-2xl px-6"
                  onClick={() => toast.success(t("fin.apply"))}
                >
                  {t("fin.apply")}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}
