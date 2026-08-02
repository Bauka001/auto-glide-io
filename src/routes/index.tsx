import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Search, ShieldCheck, Truck, Wallet } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { CarCard } from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brands, cars, categories } from "@/lib/cars";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Motra — Buy a car online with credit and home delivery" },
      {
        name: "description",
        content:
          "Browse verified cars, get approved for credit in minutes, and have your car delivered to your door.",
      },
      { property: "og:title", content: "Motra — Buy a car online" },
      {
        property: "og:description",
        content: "Verified cars, online credit approval, and free home delivery.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const featured = cars.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5">
        <section className="py-12 sm:py-20">
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            Buy your next car
            <br />
            <span className="text-muted-foreground">entirely online.</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground">
            Verified cars, credit approval in minutes, delivery to your door.
          </p>

          <form
            className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-[0_2px_20px_-12px_rgba(0,0,0,0.3)]"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/cars", search: { q: q || undefined } });
            }}
          >
            <Search className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Brand, model, year or price"
              className="h-10 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
            />
            <Button type="submit" className="h-10 shrink-0 rounded-xl px-5">
              Search
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

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Wallet, title: "Credit in 5 minutes", text: "Online decision, no paperwork." },
            { icon: Truck, title: "Home delivery", text: "Free within your city." },
            { icon: ShieldCheck, title: "Verified history", text: "Every car inspected." },
          ].map((f) => (
            <div key={f.title} className="rounded-3xl bg-muted p-5">
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>

        <section className="pt-14">
          <h2 className="text-lg font-semibold tracking-tight">Categories</h2>
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
            <h2 className="text-lg font-semibold tracking-tight">Featured cars</h2>
            <Link
              to="/cars"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              All cars <ArrowRight className="h-4 w-4" />
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
