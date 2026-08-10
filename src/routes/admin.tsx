import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { money, num } from "@/lib/cars";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { statusLabels, typeLabels, type RequestStatus } from "@/lib/requests";
import {
  useAdminCars,
  useAdminRequests,
  useAdminUsers,
  useSetRole,
  useTogglePublished,
} from "@/lib/admin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — AutoHub" },
      {
        name: "description",
        content: "AutoHub administrator overview: users, dealer roles, listings and all service requests.",
      },
      { property: "og:title", content: "Admin panel — AutoHub" },
      { property: "og:description", content: "Manage users, dealers, listings and requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const statuses: RequestStatus[] = ["submitted", "in_review", "approved", "rejected", "completed"];

function AdminPage() {
  const { t, lang } = useI18n();
  const { user, isAdmin, loading } = useAuth();
  const qc = useQueryClient();
  const enabled = Boolean(user) && isAdmin;

  const { data: users = [] } = useAdminUsers(enabled);
  const { data: requests = [] } = useAdminRequests(enabled);
  const { data: cars = [] } = useAdminCars(enabled);
  const setRole = useSetRole();
  const togglePublished = useTogglePublished();
  const [q, setQ] = useState("");

  const updateStatus = useMutation({
    mutationFn: async (input: { id: string; status: RequestStatus }) => {
      const { error } = await supabase
        .from("requests")
        .update({ status: input.status })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "requests"] });
      void qc.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) =>
      [u.email, u.fullName, u.phone].some((v) => (v ?? "").toLowerCase().includes(s)),
    );
  }, [users, q]);

  const dealers = users.filter((u) => u.roles.includes("dealer")).length;

  if (!loading && (!user || !isAdmin)) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-md px-5 py-24 text-center">
          <h1 className="text-lg font-semibold">{t("adm.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {user ? t("adm.noAccess") : t("auth.needLogin")}
          </p>
          {!user && (
            <Button asChild className="mt-4 rounded-2xl">
              <Link to="/auth" search={{ next: "/admin" }}>
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
        <h1 className="text-2xl font-semibold tracking-tight">{t("adm.title")}</h1>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="rounded-2xl">
            <TabsTrigger value="overview" className="rounded-xl">
              {t("adm.overview")}
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl">
              {t("adm.users")}
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-xl">
              {t("adm.requests")}
            </TabsTrigger>
            <TabsTrigger value="cars" className="rounded-xl">
              {t("adm.cars")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: t("adm.totalUsers"), value: num(users.length) },
                { label: t("adm.totalDealers"), value: num(dealers) },
                { label: t("adm.totalCars"), value: num(cars.length) },
                { label: t("adm.totalReq"), value: num(requests.length) },
              ].map((s) => (
                <div key={s.label} className="rounded-3xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">{s.value}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-5 space-y-3">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("adm.search")}
              className="h-12 rounded-2xl"
            />
            {filtered.map((u) => (
              <div key={u.id} className="space-y-3 rounded-2xl border border-border p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.fullName ?? u.email ?? u.id}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.email}
                    {u.phone ? ` · ${u.phone}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {u.roles.map((r) => (
                      <span
                        key={r}
                        className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["dealer", "admin"] as const).map((role) => {
                    const has = u.roles.includes(role);
                    return (
                      <Button
                        key={role}
                        size="sm"
                        variant={has ? "secondary" : "default"}
                        className="rounded-full text-xs"
                        disabled={setRole.isPending}
                        onClick={() =>
                          setRole.mutate(
                            { userId: u.id, role, grant: !has },
                            {
                              onSuccess: () => toast.success(t("adm.roleUpdated")),
                              onError: (e) => toast.error((e as Error).message),
                            },
                          )
                        }
                      >
                        {has ? t("adm.revoke") : t("adm.grant")} ·{" "}
                        {role === "dealer" ? t("adm.dealerRole") : t("adm.adminRole")}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="requests" className="mt-5 space-y-3">
            {requests.length === 0 ? (
              <div className="rounded-3xl border border-border p-10 text-center text-sm text-muted-foreground">
                {t("pro.empty")}
              </div>
            ) : (
              requests.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {r.car ? `${r.car.brand} ${r.car.model}` : typeLabels[r.type][lang]}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {typeLabels[r.type][lang]} ·{" "}
                      {new Date(r.created_at).toISOString().slice(0, 10)} · {t("adm.client")}:{" "}
                      {users.find((u) => u.id === r.userId)?.email ?? r.userId.slice(0, 8)}
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

          <TabsContent value="cars" className="mt-5 space-y-3">
            {cars.map((c) => (
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
                    {c.year} · {c.city} · {money(c.price)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={c.isPublished ? "secondary" : "default"}
                  className="shrink-0 rounded-full text-xs"
                  disabled={togglePublished.isPending}
                  onClick={() => togglePublished.mutate({ id: c.id, value: !c.isPublished })}
                >
                  {t("adm.published")}: {c.isPublished ? "✓" : "—"}
                </Button>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}
