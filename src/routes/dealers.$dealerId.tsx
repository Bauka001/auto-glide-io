import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, Clock, MapPin, Phone, Star, Store } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarCard } from "@/components/car-card";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useDealer, useDealerCars, useDealerReviews, useUpsertReview } from "@/lib/dealers";

export const Route = createFileRoute("/dealers/$dealerId")({
  head: () => ({
    meta: [
      { title: "Dealership profile — AutoHub" },
      {
        name: "description",
        content: "Dealership inventory, working hours, contacts and verified customer reviews.",
      },
      { property: "og:title", content: "Dealership profile — AutoHub" },
      { property: "og:description", content: "Inventory, contacts and reviews." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DealerPage,
});

function DealerPage() {
  const { dealerId } = Route.useParams();
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: dealer, isLoading } = useDealer(dealerId);
  const { data: cars = [] } = useDealerCars(dealer?.id);
  const { data: reviews = [] } = useDealerReviews(dealer?.id);
  const upsert = useUpsertReview(dealer?.id);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  if (!isLoading && !dealer) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-md px-5 py-24 text-center">
          <p className="text-sm text-muted-foreground">{t("dlr.empty")}</p>
          <Button asChild className="mt-4 rounded-2xl">
            <Link to="/dealers">{t("dlr.nav")}</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-8">
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="h-32 bg-muted">
            {dealer?.coverUrl && (
              <img
                src={dealer.coverUrl}
                alt={dealer.name}
                className="h-32 w-full object-cover"
                loading="lazy"
              />
            )}
          </div>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 p-5">
            {dealer?.logoUrl ? (
              <img
                src={dealer.logoUrl}
                alt={dealer.name}
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/15">
                <Store className="h-7 w-7 text-primary" />
              </span>
            )}
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 truncate text-xl font-semibold tracking-tight">
                {dealer?.name ?? "…"}
                {dealer?.isVerified && <BadgeCheck className="h-5 w-5 shrink-0 text-primary" />}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {avg || "—"} (
                  {reviews.length})
                </span>
                {dealer?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {dealer.city}
                  </span>
                )}
                {dealer?.hours && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {dealer.hours}
                  </span>
                )}
                {dealer?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {dealer.phone}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="cars" className="mt-6">
          <TabsList className="rounded-2xl">
            <TabsTrigger value="cars" className="rounded-xl">
              {t("dlr.cars")} ({cars.length})
            </TabsTrigger>
            <TabsTrigger value="about" className="rounded-xl">
              {t("dlr.about")}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-xl">
              {t("dlr.reviews")} ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cars" className="mt-5">
            {cars.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card p-10 text-center">
                <p className="text-sm text-muted-foreground">{t("pro.empty")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cars.map((c) => (
                  <CarCard key={c.id} car={c} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-5 space-y-3">
            <div className="rounded-3xl border border-border bg-card p-5 text-sm">
              <p className="whitespace-pre-line text-muted-foreground">{dealer?.about || "—"}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">{t("dlr.address")}</dt>
                  <dd className="mt-0.5 font-medium">{dealer?.address || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("dlr.phone")}</dt>
                  <dd className="mt-0.5 font-medium">{dealer?.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("dlr.hours")}</dt>
                  <dd className="mt-0.5 font-medium">{dealer?.hours || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("dlr.city")}</dt>
                  <dd className="mt-0.5 font-medium">{dealer?.city || "—"}</dd>
                </div>
              </dl>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-5 space-y-3">
            {user ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  upsert.mutate(
                    { rating, comment },
                    {
                      onSuccess: () => {
                        toast.success(t("dlr.reviewSaved"));
                        setComment("");
                      },
                      onError: (err: unknown) =>
                        toast.error(err instanceof Error ? err.message : "error"),
                    },
                  );
                }}
                className="rounded-3xl border border-border bg-card p-5"
              >
                <p className="text-sm font-medium">{t("dlr.writeReview")}</p>
                <div className="mt-3 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-label={`${n}`}
                      onClick={() => setRating(n)}
                      className="p-1"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          n <= rating ? "fill-primary text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t("dlr.comment")}
                  className="mt-3 h-12 rounded-2xl"
                />
                <Button type="submit" className="mt-3 rounded-2xl" disabled={upsert.isPending}>
                  {t("dlr.save")}
                </Button>
              </form>
            ) : (
              <div className="rounded-3xl border border-border bg-card p-5 text-center">
                <p className="text-sm text-muted-foreground">{t("auth.needLogin")}</p>
                <Button asChild className="mt-3 rounded-2xl">
                  <Link to="/auth">{t("auth.signin")}</Link>
                </Button>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card p-10 text-center">
                <p className="text-sm text-muted-foreground">{t("dlr.noReviews")}</p>
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{t("adm.client")}</p>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {r.rating}
                    </span>
                  </div>
                  {r.comment && <p className="mt-1.5 text-sm text-muted-foreground">{r.comment}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.createdAt).toISOString().slice(0, 10)}
                  </p>
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
