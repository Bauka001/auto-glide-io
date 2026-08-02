import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cars, money } from "@/lib/cars";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dealer dashboard — Motra" },
      {
        name: "description",
        content: "Add cars, upload photos and manage credit and delivery requests in one place.",
      },
      { property: "og:title", content: "Dealer dashboard — Motra" },
      { property: "og:description", content: "Manage your listings and incoming requests." },
    ],
  }),
  component: Dashboard,
});

const requests = [
  { id: 1, name: "A. Rivera", car: "Aurora EV Sedan", type: "Credit", status: "New" },
  { id: 2, name: "M. Chen", car: "Northline X7 Premium", type: "Delivery", status: "In review" },
  { id: 3, name: "S. Petrova", car: "Civo Compact", type: "Credit", status: "Approved" },
];

function Dashboard() {
  const [photos, setPhotos] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dealer dashboard</h1>

        <Tabs defaultValue="requests" className="mt-6">
          <TabsList className="rounded-2xl">
            <TabsTrigger value="requests" className="rounded-xl">
              Requests
            </TabsTrigger>
            <TabsTrigger value="add" className="rounded-xl">
              Add car
            </TabsTrigger>
            <TabsTrigger value="listings" className="rounded-xl">
              Listings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-5 space-y-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.type} · {r.car}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {r.status}
                </span>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="add" className="mt-5">
            <form
              className="space-y-4 rounded-3xl border border-border p-5"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Car submitted for review");
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" className="h-12 rounded-2xl" placeholder="Aurora" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" className="h-12 rounded-2xl" placeholder="EV Sedan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" inputMode="numeric" className="h-12 rounded-2xl" placeholder="2024" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" inputMode="numeric" className="h-12 rounded-2xl" placeholder="32900" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photos">Photos</Label>
                <label
                  htmlFor="photos"
                  className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ImagePlus className="h-5 w-5" />
                  {photos.length ? `${photos.length} photo(s) selected` : "Upload photos"}
                </label>
                <input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    setPhotos(Array.from(e.target.files ?? []).map((f) => f.name))
                  }
                />
              </div>

              <Button type="submit" className="h-12 w-full rounded-2xl">
                Publish listing
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="listings" className="mt-5 space-y-3">
            {cars.slice(0, 4).map((c) => (
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
                  <p className="text-xs text-muted-foreground">{c.year}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold">{money(c.price)}</span>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}
