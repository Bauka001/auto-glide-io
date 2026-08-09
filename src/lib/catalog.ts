import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type Car, imageFor } from "@/lib/cars";

type Row = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  engine: string;
  fuel: string;
  transmission: string;
  category: string;
  city: string;
  image_key: string | null;
  image_url: string | null;
  owner_id: string | null;
  is_published: boolean;
};

const COLS =
  "id,brand,model,year,price,mileage,engine,fuel,transmission,category,city,image_key,image_url,owner_id,is_published";

export function rowToCar(r: Row): Car {
  return {
    id: r.id,
    brand: r.brand,
    model: r.model,
    year: r.year,
    price: r.price,
    mileage: r.mileage,
    engine: r.engine,
    fuel: r.fuel,
    transmission: r.transmission,
    category: r.category,
    city: r.city,
    image: imageFor(r.image_key, r.image_url),
    ownerId: r.owner_id,
    isPublished: r.is_published,
  };
}

export async function fetchCars(): Promise<Car[]> {
  const { data, error } = await supabase
    .from("cars")
    .select(COLS)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(rowToCar);
}

export async function fetchCar(id: string): Promise<Car | null> {
  const { data, error } = await supabase.from("cars").select(COLS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToCar(data as Row) : null;
}

export async function fetchMyCars(ownerId: string): Promise<Car[]> {
  const { data, error } = await supabase
    .from("cars")
    .select(COLS)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(rowToCar);
}

export function useCars() {
  return useQuery({ queryKey: ["cars"], queryFn: fetchCars, staleTime: 30_000 });
}

export function useCar(id: string | undefined) {
  return useQuery({
    queryKey: ["car", id],
    queryFn: () => fetchCar(id as string),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function brandsOf(cars: Car[]) {
  return [...new Set(cars.map((c) => c.brand))];
}

/** Fire-and-forget view counter used by the car detail page. */
export async function recordCarView(carId: string) {
  const { data: auth } = await supabase.auth.getUser();
  await supabase.from("car_views").insert({ car_id: carId, viewer_id: auth.user?.id ?? null });
}

export type DealerStats = {
  views: number;
  requests: number;
  approved: number;
  conversion: number;
  top: { car: Car; views: number }[];
};

export function useDealerStats(ownerId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["dealer-stats", ownerId],
    enabled: Boolean(ownerId) && enabled,
    queryFn: async (): Promise<DealerStats> => {
      const cars = await fetchMyCars(ownerId as string);
      const ids = cars.map((c) => c.id);
      if (ids.length === 0) {
        return { views: 0, requests: 0, approved: 0, conversion: 0, top: [] };
      }
      const [viewsRes, reqRes] = await Promise.all([
        supabase.from("car_views").select("car_id").in("car_id", ids),
        supabase.from("requests").select("id,status,car_id").in("car_id", ids),
      ]);
      if (viewsRes.error) throw viewsRes.error;
      if (reqRes.error) throw reqRes.error;

      const counts = new Map<string, number>();
      for (const v of viewsRes.data ?? []) {
        counts.set(v.car_id, (counts.get(v.car_id) ?? 0) + 1);
      }
      const views = viewsRes.data?.length ?? 0;
      const requests = reqRes.data?.length ?? 0;
      const approved = (reqRes.data ?? []).filter(
        (r) => r.status === "approved" || r.status === "completed",
      ).length;

      const top = cars
        .map((car) => ({ car, views: counts.get(car.id) ?? 0 }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      return {
        views,
        requests,
        approved,
        conversion: views > 0 ? Math.round((requests / views) * 1000) / 10 : 0,
        top,
      };
    },
  });
}
