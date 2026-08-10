import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Bot, ChevronRight, Filter, Search, ShieldCheck, Truck, Wallet } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { CarCard } from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories } from "@/lib/cars";
import { useCars } from "@/lib/catalog";

import { useI18n, type Key } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AutoHub — Buy a car online with AI, credit, insurance and delivery" },
      {
        name: "description",
        content:
          "Browse verified cars, chat with an AI assistant, get credit or leasing, buy MTPL and CASCO insurance, and have your car delivered.",
      },
      { property: "og:title", content: "AutoHub — Buy a car online" },
      {
        property: "og:description",
        content: "AI assistant, online credit, insurance and home delivery in one app.",
      },
    ],
  }),
  component: Home,
});

const promos: { to: string; icon: typeof Bot; title: Key; desc: Key; cta: Key; gradient: string }[] = [
  {
    to: "/finance",
    icon: Wallet,
    title: "promo.credit.title",
    desc: "promo.credit.desc",
    cta: "promo.credit.cta",
    gradient: "from-blue-600/20 to-indigo-500/10",
  },
  {
    to: "/delivery",
    icon: Truck,
    title: "promo.delivery.title",
    desc: "promo.delivery.desc",
    cta: "promo.delivery.cta",
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  {
    to: "/ai-chat",
    icon: Bot,
    title: "promo.ai.title",
    desc: "promo.ai.desc",
    cta: "promo.ai.cta",
    gradient: "from-violet-500/20 to-purple-500/10",
  },
  {
    to: "/insurance",
    icon: ShieldCheck,
    title: "promo.insurance.title",
    desc: "promo.insurance.desc",
    cta: "promo.insurance.cta",
    gradient: "from-amber-500/20 to-orange-500/10",
  },
];

function Home() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [promoIdx, setPromoIdx] = useState(0);

  const { data: cars = [] } = useCars();
  const featured = cars.slice(0, 4);

  useEffect(() => {
    const id = setInterval(() => {
      setPromoIdx((i) => (i + 1) % promos.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const active = promos[promoIdx]!;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5">
        <section className="py-12 sm:py-20">
          <form
            className="flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-card p-2"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/cars", search: { q: q || undefined } });
            }}
          >
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-xl">
              <Search className="h-4 w-4" />
            </Button>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("home.searchPh")}
              className="h-10 flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
            />
            <Link
              to="/cars"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Filter className="h-4 w-4" />
            </Link>
          </form>

          <h1 className="mt-8 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            {t("home.title1")}
            <br />
            <span className="text-muted-foreground">{t("home.title2")}</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground">{t("home.sub")}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">{t("home.promos")}</h2>
          <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card">
            <Link
              key={active.to}
              to={active.to}
              className="group relative flex h-40 items-center justify-between overflow-hidden px-6 transition-all duration-500"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${active.gradient} opacity-70 transition-all duration-500`}
              />
              <div className="relative flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15">
                  <active.icon className="h-6 w-6 text-primary" />
                </span>
                <div>
                  <h3 className="text-base font-semibold">{t(active.title)}</h3>
                  <p className="max-w-[16rem] text-sm text-muted-foreground sm:max-w-md">{t(active.desc)}</p>
                </div>
              </div>
              <span className="relative flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
                {t(active.cta)} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
            <div className="relative z-10 flex justify-center gap-1.5 bg-card py-3">
              {promos.map((p, i) => (
                <button
                  key={p.to}
                  onClick={() => setPromoIdx(i)}
                  aria-label={`${t("home.promos")} ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === promoIdx ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="pt-14">
          <h2 className="text-lg font-semibold tracking-tight">{t("home.categories")}</h2>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {categories.map((c) => (
              <Link
                key={c}
                to="/cars"
                search={{ category: c }}
                className="shrink-0 rounded-full bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {c}
              </Link>
            ))}
          </div>
        </section>

        <section className="pt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">{t("home.featured")}</h2>
            <Link
              to="/cars"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {t("home.all")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
