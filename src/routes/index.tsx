import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Bot,
  Car,
  MessageSquare,
  Search,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { CarCard } from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories } from "@/lib/cars";
import { brandsOf, useCars } from "@/lib/catalog";

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

const services: { to: string; icon: typeof Car; title: Key; desc: Key }[] = [
  { to: "/cars", icon: Car, title: "nav.cars", desc: "svc.cars.d" },
  { to: "/ai-chat", icon: Bot, title: "nav.ai", desc: "svc.ai.d" },
  { to: "/chat", icon: MessageSquare, title: "nav.dealer", desc: "svc.dealer.d" },
  { to: "/insurance", icon: ShieldCheck, title: "nav.insurance", desc: "svc.insurance.d" },
  { to: "/finance", icon: Wallet, title: "nav.finance", desc: "svc.finance.d" },
  { to: "/delivery", icon: Truck, title: "nav.delivery", desc: "svc.delivery.d" },
];

function Home() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [q, setQ] = useState("");

  const { data: cars = [] } = useCars();
  const featured = cars.slice(0, 4);
  const brands = brandsOf(cars);


  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5">
        <section className="py-12 sm:py-20">
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            {t("home.title1")}
            <br />
            <span className="text-muted-foreground">{t("home.title2")}</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground">{t("home.sub")}</p>

          <form
            className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-card p-2"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/cars", search: { q: q || undefined } });
            }}
          >
            <Search className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("home.searchPh")}
              className="h-10 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
            />
            <Button type="submit" className="h-10 shrink-0 rounded-xl px-5">
              {t("home.search")}
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {brands.map((b) => (
              <Link
                key={b}
                to="/cars"
                search={{ brand: b }}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {b}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">{t("home.services")}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="group rounded-3xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40"
              >
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/15">
                  <s.icon className="h-5 w-5 text-primary" />
                </span>
                <h3 className="mt-4 text-sm font-semibold">{t(s.title)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(s.desc)}</p>
              </Link>
            ))}
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
