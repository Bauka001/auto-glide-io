import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { imageKeyList, money } from "@/lib/cars";
import { fetchMyCars } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  statusLabels,
  typeLabels,
  useMyRequests,
  useUpdateRequestStatus,
  type RequestStatus,
} from "@/lib/requests";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dealer dashboard — AutoHub" },
      {
        name: "description",
        content: "Add cars, publish listings and manage credit and delivery requests in one place.",
      },
      { property: "og:title", content: "Dealer dashboard — AutoHub" },
      { property: "og:description", content: "Manage your listings and incoming requests." },
    ],
  }),
  component: Dashboard,
});

const statuses: RequestStatus[] = ["submitted", "in_review", "approved", "rejected", "completed"];

function Dashboard() {
  const { t, lang } = useI18n();
  const { user, isDealer, loading } = useAuth();
  const qc = useQueryClient();
  const updateStatus = useUpdateRequestStatus();
  const { data: requests = [] } = useMyRequests(Boolean(user) && isDealer);
  const { data: myCars = [] } = useQuery({
    queryKey: ["cars", "mine", user?.id],
    enabled: Boolean(user) && isDealer,
    queryFn: () => fetchMyCars(user!.id),
  });

  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "2024",
    price: "",
    mileage: "0",
    city: "Almaty",
    category: "Sedan",
    imageKey: imageKeyList[0] as string,
    imageUrl: "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const dealerRequests = requests.filter((r) => r.car);

  async function addCar(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("cars").insert({
      owner_id: user.id,
      brand: form.brand,
      model: form.model,
      year: Number(form.year),
      price: Number(form.price),
      mileage: Number(form.mileage),
      city: form.city,
      category: form.category,
      image_key: form.imageUrl ? null : form.imageKey,
      image_url: form.imageUrl || null,
      engine: "",
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("dash.add"));
    setForm((f) => ({ ...f, brand: "", model: "", price: "" }));
    void qc.invalidateQueries({ queryKey: ["cars"] });
  }

  if (!loading && (!user || !isDealer)) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-md px-5 py-24 text-center">
          <p className="text-sm text-muted-foreground">
            {user ? t("dash.noAccess") : t("auth.needLogin")}
          </p>
          {!user && (
            <Button asChild className="mt-4 rounded-2xl">
              <Link to="/auth" search={{ next: "/dashboard" }}>
                {t("auth.signin")}
              </Link>
            </Button>
          )}
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t("dash.title")}</h1>

        <Tabs defaultValue="requests" className="mt-6">
          <TabsList className="rounded-2xl">
            <TabsTrigger value="requests" className="rounded-xl">
              {t("dash.requests")}
            </TabsTrigger>
            <TabsTrigger value="add" className="rounded-xl">
              {t("dash.add")}
            </TabsTrigger>
            <TabsTrigger value="listings" className="rounded-xl">
              {t("dash.myCars")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-5 space-y-3">
            {dealerRequests.length === 0 ? (
              <div className="rounded-3xl border border-border p-10 text-center text-sm text-muted-foreground">
                {t("pro.empty")}
              </div>
            ) : (
              dealerRequests.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {r.car?.brand} {r.car?.model}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {typeLabels[r.type][lang]} ·{" "}
                      {new Date(r.created_at).toISOString().slice(0, 10)}
                    </p>
                  </div>
                  <select
                    value={r.status}
                    onChange={(e) =>
                      updateStatus.mutate({ id: r.id, status: e.target.value as RequestStatus })
                    }
                    className="shrink-0 rounded-full bg-muted px-3 py-1.5 text-xs font-medium"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {statusLabels[s][lang]}
                      </option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="add" className="mt-5">
            <form className="space-y-4 rounded-3xl border border-border p-5" onSubmit={addCar}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" required value={form.brand} onChange={set("brand")} className="h-12 rounded-2xl" placeholder="Aurora" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" required value={form.model} onChange={set("model")} className="h-12 rounded-2xl" placeholder="EV Sedan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" inputMode="numeric" value={form.year} onChange={set("year")} className="h-12 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" required inputMode="numeric" value={form.price} onChange={set("price")} className="h-12 rounded-2xl" placeholder="32900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage</Label>
                  <Input id="mileage" inputMode="numeric" value={form.mileage} onChange={set("mileage")} className="h-12 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={form.city} onChange={set("city")} className="h-12 rounded-2xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Photo URL</Label>
                <Input
                  id="imageUrl"
                  value={form.imageUrl}
                  onChange={set("imageUrl")}
                  className="h-12 rounded-2xl"
                  placeholder="https://…"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {imageKeyList.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, imageKey: k, imageUrl: "" }))}
                      className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                        !form.imageUrl && form.imageKey === k
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="h-12 w-full rounded-2xl">
                {t("dash.add")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="listings" className="mt-5 space-y-3">
            {myCars.length === 0 ? (
              <div className="rounded-3xl border border-border p-10 text-center text-sm text-muted-foreground">
                {t("pro.empty")}
              </div>
            ) : (
              myCars.map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border p-3"
                >
                  <img
                    src={c.image}
                    alt={`${c.brand} ${c.model}`}
                    loading="lazy"
                    width={1280}
                    height={854}
                    className="h-12 w-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {c.brand} {c.model}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.year} · {c.city}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">{money(c.price)}</span>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}
