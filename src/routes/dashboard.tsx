import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { imageKeyList, money, num } from "@/lib/cars";
import {
  bodyTypes,
  colors,
  conditions,
  drives,
  fuels,
  steerings,
  transmissions,
  carTitle,
} from "@/lib/car-spec";

import { fetchMyCars, useDealerStats } from "@/lib/catalog";
import { normalizeVin, validateVin } from "@/lib/vin";
import { SalonForm } from "@/components/salon-form";
import { useMyDealer } from "@/lib/dealers";
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
  const { data: stats } = useDealerStats(user?.id, isDealer);
  const { data: mySalon } = useMyDealer(isDealer ? user?.id : undefined);

  const [form, setForm] = useState({
    brand: "",
    model: "",
    generation: "",
    trim: "",
    year: "2024",
    price: "",
    mileage: "0",
    city: "Almaty",
    category: "Sedan",
    bodyType: "sedan",
    fuel: "Petrol",
    transmission: "Automatic",
    drive: "front",
    engineVolume: "2.0",
    color: "white",
    steering: "left",
    condition: "used",
    customs: true,
    vin: "",
    imageKey: imageKeyList[0] as string,
    imageUrl: "",
  });
  const [uploading, setUploading] = useState(false);
  const vinError = form.vin.length > 0 ? validateVin(form.vin) : null;
  const vinMsg =
    vinError === "length"
      ? t("vin.length")
      : vinError === "chars"
        ? t("vin.chars")
        : vinError === "checksum"
          ? t("vin.checksum")
          : t("vin.ok");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const pick = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from("car-photos").upload(path, file, { contentType: file.type });
    if (up.error) {
      setUploading(false);
      toast.error(up.error.message);
      return;
    }
    const signed = await supabase.storage.from("car-photos").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    setUploading(false);
    if (signed.error || !signed.data) {
      toast.error(signed.error?.message ?? "error");
      return;
    }
    setForm((f) => ({ ...f, imageUrl: signed.data.signedUrl }));
    toast.success(t("dash.photoOk"));
  }


  const dealerRequests = requests.filter((r) => r.car);

  async function addCar(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("cars").insert({
      owner_id: user.id,
      dealer_id: mySalon?.id ?? null,
      brand: form.brand,
      model: form.model,
      generation: form.generation,
      trim: form.trim,
      year: Number(form.year),
      price: Number(form.price),
      mileage: Number(form.mileage),
      city: form.city,
      category: form.category,
      body_type: form.bodyType,
      fuel: form.fuel,
      transmission: form.transmission,
      drive: form.drive,
      engine_volume: Number(form.engineVolume),
      color: form.color,
      steering: form.steering,
      condition: form.condition,
      customs_cleared: form.customs,
      vin: form.vin || null,
      image_key: form.imageUrl ? null : form.imageKey,
      image_url: form.imageUrl || null,
      engine: "",
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("dash.add"));
    setForm((f) => ({ ...f, brand: "", model: "", price: "", vin: "" }));
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

        <Tabs defaultValue="stats" className="mt-6">
          <TabsList className="rounded-2xl">
            <TabsTrigger value="stats" className="rounded-xl">
              {t("dash.stats")}
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-xl">
              {t("dash.requests")}
            </TabsTrigger>
            <TabsTrigger value="add" className="rounded-xl">
              {t("dash.add")}
            </TabsTrigger>
            <TabsTrigger value="listings" className="rounded-xl">
              {t("dash.myCars")}
            </TabsTrigger>
            <TabsTrigger value="salon" className="rounded-xl">
              {t("dlr.mySalon")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="salon" className="mt-5">
            <SalonForm />
          </TabsContent>

          <TabsContent value="stats" className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: t("dash.views"), value: num(stats?.views ?? 0) },
                { label: t("dash.reqCount"), value: num(stats?.requests ?? 0) },
                { label: t("dash.approved"), value: num(stats?.approved ?? 0) },
                { label: t("dash.conv"), value: `${stats?.conversion ?? 0}%` },
              ].map((s2) => (
                <div key={s2.label} className="rounded-3xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">{s2.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">{s2.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-border p-5">
              <p className="text-sm font-medium">{t("dash.topCars")}</p>
              <div className="mt-3 space-y-2">
                {(stats?.top ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("pro.empty")}</p>
                ) : (
                  stats?.top.map((row) => (
                    <div
                      key={row.car.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
                    >
                      <p className="truncate text-sm">
                        {row.car.brand} {row.car.model}
                      </p>
                      <span className="shrink-0 text-sm font-semibold text-primary">
                        {num(row.views)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

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
                  <Label htmlFor="brand">{t("dash.brand")}</Label>
                  <Input id="brand" required value={form.brand} onChange={set("brand")} className="h-12 rounded-2xl" placeholder="Aurora" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">{t("dash.model")}</Label>
                  <Input id="model" required value={form.model} onChange={set("model")} className="h-12 rounded-2xl" placeholder="EV Sedan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">{t("dash.year")}</Label>
                  <Input id="year" inputMode="numeric" value={form.year} onChange={set("year")} className="h-12 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">{t("dash.price")}</Label>
                  <Input id="price" required inputMode="numeric" value={form.price} onChange={set("price")} className="h-12 rounded-2xl" placeholder="15500000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">{t("dash.mileage")}</Label>
                  <Input id="mileage" inputMode="numeric" value={form.mileage} onChange={set("mileage")} className="h-12 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">{t("dash.city")}</Label>
                  <Input id="city" value={form.city} onChange={set("city")} className="h-12 rounded-2xl" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="generation">{t("spec.generation")}</Label>
                  <Input id="generation" value={form.generation} onChange={set("generation")} className="h-12 rounded-2xl" placeholder="XV70" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trim">{t("spec.trim")}</Label>
                  <Input id="trim" value={form.trim} onChange={set("trim")} className="h-12 rounded-2xl" placeholder="Comfort" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineVolume">{t("spec.volume")}</Label>
                  <Input id="engineVolume" inputMode="decimal" value={form.engineVolume} onChange={set("engineVolume")} className="h-12 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vin">{t("spec.vin")}</Label>
                  <Input
                    id="vin"
                    value={form.vin}
                    onChange={(e) => setForm((f) => ({ ...f, vin: normalizeVin(e.target.value) }))}
                    maxLength={17}
                    aria-invalid={Boolean(vinError)}
                    className="h-12 rounded-2xl font-mono uppercase"
                  />
                  {form.vin.length > 0 && (
                    <p className={`text-xs ${vinError ? "text-destructive" : "text-primary"}`}>
                      {vinMsg}
                    </p>

                  )}
                </div>

                {(
                  [
                    ["bodyType", "f.body", bodyTypes],
                    ["fuel", "f.fuel", fuels],
                    ["transmission", "f.trans", transmissions],
                    ["drive", "f.drive", drives],
                    ["steering", "f.steering", steerings],
                    ["condition", "f.condition", conditions],
                  ] as const
                ).map(([key, labelKey, options]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{t(labelKey)}</Label>
                    <select
                      id={key}
                      value={form[key]}
                      onChange={pick(key)}
                      className="h-12 w-full rounded-2xl border border-border bg-background px-3 text-sm"
                    >
                      {options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o[lang]}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <div className="space-y-2">
                  <Label htmlFor="color">{t("f.color")}</Label>
                  <select
                    id="color"
                    value={form.color}
                    onChange={pick("color")}
                    className="h-12 w-full rounded-2xl border border-border bg-background px-3 text-sm"
                  >
                    {colors.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o[lang]}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-3 self-end rounded-2xl border border-border px-3 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.customs}
                    onChange={(e) => setForm((f) => ({ ...f, customs: e.target.checked }))}
                    className="h-4 w-4 accent-primary"
                  />
                  {t("f.customs")}
                </label>
              </div>


              <div className="space-y-2">
                <Label>{t("dash.photo")}</Label>
                {form.imageUrl ? (
                  <div className="space-y-2">
                    <img
                      src={form.imageUrl}
                      alt={t("dash.photo")}
                      className="h-44 w-full rounded-2xl border border-border object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-full rounded-2xl"
                      onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                    >
                      {t("dash.photoRemove")}
                    </Button>
                  </div>
                ) : (
                  <label className="flex h-28 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                    <input
                      id="imageUrl"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={uploadPhoto}
                    />
                    {uploading ? t("dash.photoUploading") : t("dash.photoUpload")}
                  </label>
                )}
                

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
                    <p className="truncate text-sm font-medium">{carTitle(c)}</p>
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
