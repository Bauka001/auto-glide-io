import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { imageFor } from "@/lib/cars";

export type RequestType = "credit" | "delivery" | "insurance";
export type RequestStatus = "submitted" | "in_review" | "approved" | "rejected" | "completed";

export type ServiceRequest = {
  id: string;
  type: RequestType;
  status: RequestStatus;
  created_at: string;
  car_id: string | null;
  details: Record<string, unknown>;
  car?: { id: string; brand: string; model: string; image: string } | null;
};

const SELECT =
  "id,type,status,created_at,car_id,details,cars(id,brand,model,image_key,image_url)";

type Raw = {
  id: string;
  type: RequestType;
  status: RequestStatus;
  created_at: string;
  car_id: string | null;
  details: Record<string, unknown> | null;
  cars: {
    id: string;
    brand: string;
    model: string;
    image_key: string | null;
    image_url: string | null;
  } | null;
};

function map(r: Raw): ServiceRequest {
  return {
    id: r.id,
    type: r.type,
    status: r.status,
    created_at: r.created_at,
    car_id: r.car_id,
    details: r.details ?? {},
    car: r.cars
      ? {
          id: r.cars.id,
          brand: r.cars.brand,
          model: r.cars.model,
          image: imageFor(r.cars.image_key, r.cars.image_url),
        }
      : null,
  };
}

export function useMyRequests(enabled: boolean) {
  return useQuery({
    queryKey: ["requests", "mine"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select(SELECT)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as Raw[]).map(map);
    },
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      type: RequestType;
      carId?: string | null;
      details: Record<string, unknown>;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("not_authenticated");
      const { error } = await supabase.from("requests").insert({
        user_id: uid,
        type: input.type,
        car_id: input.carId ?? null,
        details: input.details as never,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });
}

export function useUpdateRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RequestStatus }) => {
      const { error } = await supabase.from("requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });
}

export const statusLabels: Record<RequestStatus, { kk: string; ru: string; en: string }> = {
  submitted: { kk: "Жіберілді", ru: "Отправлено", en: "Submitted" },
  in_review: { kk: "Қаралуда", ru: "На рассмотрении", en: "In review" },
  approved: { kk: "Мақұлданды", ru: "Одобрено", en: "Approved" },
  rejected: { kk: "Қабылданбады", ru: "Отклонено", en: "Rejected" },
  completed: { kk: "Аяқталды", ru: "Завершено", en: "Completed" },
};

export const typeLabels: Record<RequestType, { kk: string; ru: string; en: string }> = {
  credit: { kk: "Несие", ru: "Кредит", en: "Credit" },
  delivery: { kk: "Жеткізу", ru: "Доставка", en: "Delivery" },
  insurance: { kk: "Сақтандыру", ru: "Страхование", en: "Insurance" },
};
