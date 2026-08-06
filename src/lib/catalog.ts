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
