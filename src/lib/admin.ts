import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { imageFor } from "@/lib/cars";
import type { RequestStatus, RequestType } from "@/lib/requests";

export type AdminUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  roles: string[];
};

export function useAdminUsers(enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "users"],
    enabled,
    queryFn: async (): Promise<AdminUser[]> => {
      const [p, r] = await Promise.all([
        supabase.from("profiles").select("id,full_name,phone,email"),
        supabase.from("user_roles").select("user_id,role"),
      ]);
      if (p.error) throw p.error;
      if (r.error) throw r.error;
      const roles = (r.data ?? []) as { user_id: string; role: string }[];
      return ((p.data ?? []) as {
        id: string;
        full_name: string | null;
        phone: string | null;
        email: string | null;
      }[]).map((row) => ({
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        phone: row.phone,
        roles: roles.filter((x) => x.user_id === row.id).map((x) => x.role),
      }));
    },
  });
}

export function useSetRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { userId: string; role: "dealer" | "admin"; grant: boolean }) => {
      if (input.grant) {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: input.userId, role: input.role });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", input.userId)
          .eq("role", input.role);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export type AdminRequest = {
  id: string;
  type: RequestType;
  status: RequestStatus;
  created_at: string;
  userId: string;
  car: { id: string; brand: string; model: string; image: string } | null;
};

export function useAdminRequests(enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "requests"],
    enabled,
    queryFn: async (): Promise<AdminRequest[]> => {
      const { data, error } = await supabase
        .from("requests")
        .select("id,type,status,created_at,user_id,cars(id,brand,model,image_key,image_url)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as {
        id: string;
        type: RequestType;
        status: RequestStatus;
        created_at: string;
        user_id: string;
        cars: {
          id: string;
          brand: string;
          model: string;
          image_key: string | null;
          image_url: string | null;
        } | null;
      }[]).map((r) => ({
        id: r.id,
        type: r.type,
        status: r.status,
        created_at: r.created_at,
        userId: r.user_id,
        car: r.cars
          ? {
              id: r.cars.id,
              brand: r.cars.brand,
              model: r.cars.model,
              image: imageFor(r.cars.image_key, r.cars.image_url),
            }
          : null,
      }));
    },
  });
}

export type AdminCar = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  city: string;
  isPublished: boolean;
  image: string;
};

export function useAdminCars(enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "cars"],
    enabled,
    queryFn: async (): Promise<AdminCar[]> => {
      const { data, error } = await supabase
        .from("cars")
        .select("id,brand,model,year,price,city,is_published,image_key,image_url")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as {
        id: string;
        brand: string;
        model: string;
        year: number;
        price: number;
        city: string;
        is_published: boolean;
        image_key: string | null;
        image_url: string | null;
      }[]).map((c) => ({
        id: c.id,
        brand: c.brand,
        model: c.model,
        year: c.year,
        price: c.price,
        city: c.city,
        isPublished: c.is_published,
        image: imageFor(c.image_key, c.image_url),
      }));
    },
  });
}

export function useTogglePublished() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; value: boolean }) => {
      const { error } = await supabase
        .from("cars")
        .update({ is_published: input.value })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "cars"] });
      void qc.invalidateQueries({ queryKey: ["cars"] });
    },
  });
}
