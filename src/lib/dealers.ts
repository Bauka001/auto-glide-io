import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { rowToCar } from "@/lib/catalog";
import type { Car } from "@/lib/cars";

export type Dealer = {
  id: string;
  ownerId: string;
  name: string;
  slug: string | null;
  city: string;
  address: string;
  phone: string;
  about: string;
  logoUrl: string | null;
  coverUrl: string | null;
  hours: string;
  isVerified: boolean;
  lat: number | null;
  lng: number | null;
};

export type DealerStat = Dealer & { cars: number; rating: number; reviews: number };

const COLS =
  "id,owner_id,name,slug,city,address,phone,about,logo_url,cover_url,hours,is_verified,lat,lng";

type Row = {
  id: string;
  owner_id: string;
  name: string;
  slug: string | null;
  city: string;
  address: string;
  phone: string;
  about: string;
  logo_url: string | null;
  cover_url: string | null;
  hours: string;
  is_verified: boolean;
  lat: number | null;
  lng: number | null;
};

function map(r: Row): Dealer {
  return {
    id: r.id,
    ownerId: r.owner_id,
    name: r.name,
    slug: r.slug,
    city: r.city,
    address: r.address,
    phone: r.phone,
    about: r.about,
    logoUrl: r.logo_url,
    coverUrl: r.cover_url,
    hours: r.hours,
    isVerified: r.is_verified,
    lat: r.lat,
    lng: r.lng,
  };
}

/** All active salons with their listing count and review rating. */
export function useDealers() {
  return useQuery({
    queryKey: ["dealers", "list"],
    queryFn: async (): Promise<DealerStat[]> => {
      const [d, c, rv] = await Promise.all([
        supabase.from("dealers").select(COLS).order("is_verified", { ascending: false }),
        supabase
          .from("cars")
          .select("dealer_id")
          .eq("is_published", true)
          .eq("status", "available"),
        supabase.from("dealer_reviews").select("dealer_id,rating"),
      ]);
      if (d.error) throw d.error;
      const cars = (c.data ?? []) as { dealer_id: string | null }[];
      const reviews = (rv.data ?? []) as { dealer_id: string; rating: number }[];
      return ((d.data ?? []) as Row[]).map((row) => {
        const mine = reviews.filter((x) => x.dealer_id === row.id);
        const rating = mine.length
          ? Math.round((mine.reduce((s, x) => s + x.rating, 0) / mine.length) * 10) / 10
          : 0;
        return {
          ...map(row),
          cars: cars.filter((x) => x.dealer_id === row.id).length,
          rating,
          reviews: mine.length,
        };
      });
    },
  });
}

export function useDealer(idOrSlug?: string) {
  return useQuery({
    queryKey: ["dealers", "one", idOrSlug],
    enabled: Boolean(idOrSlug),
    queryFn: async (): Promise<Dealer | null> => {
      const isUuid = /^[0-9a-f-]{36}$/i.test(idOrSlug ?? "");
      const { data, error } = await supabase
        .from("dealers")
        .select(COLS)
        .eq(isUuid ? "id" : "slug", idOrSlug!)
        .maybeSingle();
      if (error) throw error;
      return data ? map(data as Row) : null;
    },
  });
}

export function useDealerCars(dealerId?: string) {
  return useQuery({
    queryKey: ["dealers", "cars", dealerId],
    enabled: Boolean(dealerId),
    queryFn: async (): Promise<Car[]> => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("dealer_id", dealerId!)
        .eq("is_published", true)
        .eq("status", "available")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as never[]).map((r) => rowToCar(r));
    },
  });
}

export type Review = {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export function useDealerReviews(dealerId?: string) {
  return useQuery({
    queryKey: ["dealers", "reviews", dealerId],
    enabled: Boolean(dealerId),
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("dealer_reviews")
        .select("id,user_id,rating,comment,created_at")
        .eq("dealer_id", dealerId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as {
        id: string;
        user_id: string;
        rating: number;
        comment: string;
        created_at: string;
      }[]).map((r) => ({
        id: r.id,
        userId: r.user_id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
      }));
    },
  });
}

export function useUpsertReview(dealerId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { rating: number; comment: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("auth");
      const { error } = await supabase.from("dealer_reviews").upsert(
        {
          dealer_id: dealerId!,
          user_id: auth.user.id,
          rating: input.rating,
          comment: input.comment,
        },
        { onConflict: "dealer_id,user_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["dealers"] });
    },
  });
}

/** The salon owned by the signed-in dealer (may not exist yet). */
export function useMyDealer(ownerId?: string) {
  return useQuery({
    queryKey: ["dealers", "mine", ownerId],
    enabled: Boolean(ownerId),
    queryFn: async (): Promise<Dealer | null> => {
      const { data, error } = await supabase
        .from("dealers")
        .select(COLS)
        .eq("owner_id", ownerId!)
        .maybeSingle();
      if (error) throw error;
      return data ? map(data as Row) : null;
    },
  });
}

export function useSaveDealer(ownerId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Dealer> & { name: string }) => {
      const slug =
        input.slug ||
        input.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") ||
        null;
      const payload = {
        owner_id: ownerId!,
        name: input.name,
        slug,
        city: input.city ?? "",
        address: input.address ?? "",
        phone: input.phone ?? "",
        about: input.about ?? "",
        logo_url: input.logoUrl ?? null,
        cover_url: input.coverUrl ?? null,
        hours: input.hours ?? "09:00-19:00",
      };
      const { error } = await supabase.from("dealers").upsert(payload, { onConflict: "owner_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["dealers"] });
    },
  });
}
