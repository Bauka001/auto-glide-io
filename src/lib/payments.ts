import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createDeliveryOrder, confirmPayment } from "@/lib/payments.functions";
import type { TariffId } from "@/lib/delivery-tariffs";
import type { Lang } from "@/lib/i18n";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type ShipmentStatus =
  | "created"
  | "paid"
  | "preparing"
  | "in_transit"
  | "arrived"
  | "delivered"
  | "cancelled";

export const shipmentStages: ShipmentStatus[] = [
  "paid",
  "preparing",
  "in_transit",
  "arrived",
  "delivered",
];

export const shipmentLabels: Record<ShipmentStatus, Record<Lang, string>> = {
  created: { kk: "Төлем күтілуде", ru: "Ожидает оплаты", en: "Awaiting payment" },
  paid: { kk: "Төленді", ru: "Оплачено", en: "Paid" },
  preparing: { kk: "Дайындалуда", ru: "Подготовка", en: "Preparing" },
  in_transit: { kk: "Жолда", ru: "В пути", en: "In transit" },
  arrived: { kk: "Қалаға жетті", ru: "Прибыло в город", en: "Arrived" },
  delivered: { kk: "Жеткізілді", ru: "Доставлено", en: "Delivered" },
  cancelled: { kk: "Болдырылмады", ru: "Отменено", en: "Cancelled" },
};

export const paymentLabels: Record<PaymentStatus, Record<Lang, string>> = {
  pending: { kk: "Күтілуде", ru: "Ожидает", en: "Pending" },
  paid: { kk: "Төленді", ru: "Оплачено", en: "Paid" },
  failed: { kk: "Сәтсіз", ru: "Ошибка", en: "Failed" },
  refunded: { kk: "Қайтарылды", ru: "Возврат", en: "Refunded" },
};

export type Shipment = {
  id: string;
  status: ShipmentStatus;
  tariff: string;
  from_city: string;
  to_city: string;
  distance_km: number;
  price: number;
  eta_date: string | null;
  courier_name: string;
  courier_phone: string;
  created_at: string;
  car_id: string | null;
};

export type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  purpose: string;
  created_at: string;
};

export function useMyShipments(enabled: boolean) {
  return useQuery({
    queryKey: ["shipments", "mine"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select(
          "id,status,tariff,from_city,to_city,distance_km,price,eta_date,courier_name,courier_phone,created_at,car_id",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Shipment[];
    },
  });
}

export function useMyPayments(enabled: boolean) {
  return useQuery({
    queryKey: ["payments", "mine"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("id,amount,currency,status,purpose,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Payment[];
    },
  });
}

export type CheckoutInput = {
  carId?: string | null;
  tariff: TariffId;
  fromCity?: string;
  toCity: string;
  address?: string;
  distanceKm: number;
  insurance: boolean;
  date?: string | null;
};

/** Creates the order, then captures the payment through the provider. */
export function useDeliveryCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CheckoutInput) => {
      const order = await createDeliveryOrder({
        data: {
          carId: input.carId ?? null,
          tariff: input.tariff,
          fromCity: input.fromCity ?? "",
          toCity: input.toCity,
          address: input.address ?? "",
          distanceKm: input.distanceKm,
          insurance: input.insurance,
          date: input.date || null,
        },
      });
      await confirmPayment({ data: { paymentId: order.paymentId } });
      return order;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["shipments"] });
      void qc.invalidateQueries({ queryKey: ["payments"] });
      void qc.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export function useUpdateShipmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ShipmentStatus }) => {
      const { error } = await supabase.from("shipments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["shipments"] }),
  });
}

export const shipmentStatuses: ShipmentStatus[] = [
  "created",
  "paid",
  "preparing",
  "in_transit",
  "arrived",
  "delivered",
  "cancelled",
];

/** Admin-wide shipment list (RLS restricts this to administrators). */
export function useAllShipments(enabled: boolean) {
  return useQuery({
    queryKey: ["shipments", "all"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select(
          "id,status,tariff,from_city,to_city,distance_km,price,eta_date,courier_name,courier_phone,created_at,car_id",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Shipment[];
    },
  });
}
