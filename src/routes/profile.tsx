import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, FileText, Heart, Settings, User } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarCard } from "@/components/car-card";
import { cars } from "@/lib/cars";
import { useFavorites } from "@/lib/favorites";
import { langs, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Motra profile — requests and favorites" },
      {
        name: "description",
        content:
          "Manage your account, track credit and delivery requests, and keep your favorite cars in one place.",
      },
      { property: "og:title", content: "Your Motra profile" },
      { property: "og:description", content: "Account, requests, favorites and settings." },
    ],
  }),
  component: ProfilePage,
});

const requests = [
  { id: 1, title: "Aurora EV Sedan", type: "Credit", status: "In review" },
  { id: 2, title: "Northline X7 Premium", type: "Delivery", status: "On the way" },
];

function ProfilePage() {
  const { t, lang, setLang } = useI18n();
  const { ids } = useFavorites();
  const [push, setPush] = useState(true);
  const favCars = cars.filter((c) => ids.includes(c.id));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15">
            <User className="h-6 w-6 text-primary" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("pro.title")}</h1>
            <p className="text-sm text-muted-foreground">alex.rivera@motra.app</p>
          </div>
        </div>

        <Tabs defaultValue="requests" className="mt-8">
          <TabsList className="rounded-2xl">
            <TabsTrigger value="requests" className="rounded-xl">
              <FileText className="mr-2 h-4 w-4" />
              {t("pro.orders")}
            </TabsTrigger>
            <TabsTrigger value="fav" className="rounded-xl">
              <Heart className="mr-2 h-4 w-4" />
              {t("pro.fav")}
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl">
              <Settings className="mr-2 h-4 w-4" />
              {t("pro.settings")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-5 space-y-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.type}</p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {r.status}
                </span>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="fav" className="mt-5">
            {favCars.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card p-10 text-center">
                <p className="text-sm text-muted-foreground">{t("pro.empty")}</p>
                <Button asChild variant="secondary" className="mt-4 rounded-2xl">
                  <Link to="/cars">{t("nav.cars")}</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favCars.map((c) => (
                  <CarCard key={c.id} car={c} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{t("pro.push")}</span>
              </div>
              <Switch checked={push} onCheckedChange={setPush} />
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-medium">{t("pro.lang")}</p>
              <div className="mt-3 flex gap-2">
                {langs.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                      lang === l.code
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}
