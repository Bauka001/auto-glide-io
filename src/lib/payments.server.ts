import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { deliveryPrice, etaDate, type TariffId } from "@/lib/delivery-tariffs";

type Client = SupabaseClient<Database>;

export type DeliveryOrderInput = {
  carId: string | null;
  tariff: TariffId;
  fromCity: string;
  toCity: string;
  address: string;
  distanceKm: number;
  insurance: boolean;
  date: string | null;
};

/**
 * Creates the request + pending payment + shipment triple.
 * The price is always recomputed on the server — never trusted from the client.
 */
export async function createDeliveryOrderFor(
  supabase: Client,
  userId: string,
  input: DeliveryOrderInput,
) {
  const price = deliveryPrice(input.tariff, input.distanceKm, input.insurance);

  const { data: request, error: reqErr } = await supabase
    .from("requests")
    .insert({
      user_id: userId,
      type: "delivery",
      car_id: input.carId,
      details: {
        tariff: input.tariff,
        distance: input.distanceKm,
        insurance: input.insurance,
        price,
        from_city: input.fromCity,
        to_city: input.toCity,
        address: input.address,
        date: input.date,
      } as never,
    })
    .select("id")
    .single();
  if (reqErr) throw reqErr;

  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      request_id: request.id,
      car_id: input.carId,
      purpose: "delivery",
      amount: price,
      currency: "KZT",
      provider: "mock",
      details: { tariff: input.tariff, distance_km: input.distanceKm } as never,
    })
    .select("id")
    .single();
  if (payErr) throw payErr;

  const { data: shipment, error: shipErr } = await supabase
    .from("shipments")
    .insert({
      user_id: userId,
      request_id: request.id,
      car_id: input.carId,
      payment_id: payment.id,
      tariff: input.tariff,
      from_city: input.fromCity,
      to_city: input.toCity,
      distance_km: Math.round(input.distanceKm),
      price,
      eta_date: etaDate(input.tariff),
    })
    .select("id")
    .single();
  if (shipErr) throw shipErr;

  return { requestId: request.id, paymentId: payment.id, shipmentId: shipment.id, amount: price };
}

/** Marks a payment as settled and moves the linked shipment/request forward. */
export async function settlePayment(
  admin: Client,
  paymentId: string,
  outcome: "paid" | "failed",
  providerRef: string,
) {
  const { data: payment, error } = await admin
    .from("payments")
    .select("id,status,request_id")
    .eq("id", paymentId)
    .maybeSingle();
  if (error) throw error;
  if (!payment) throw new Error("payment_not_found");
  if (payment.status === "paid") return { status: "paid" as const };

  const { error: upErr } = await admin
    .from("payments")
    .update({ status: outcome, provider_ref: providerRef })
    .eq("id", paymentId);
  if (upErr) throw upErr;

  if (outcome === "paid") {
    await admin.from("shipments").update({ status: "paid" }).eq("payment_id", paymentId);
    if (payment.request_id) {
      await admin.from("requests").update({ status: "in_review" }).eq("id", payment.request_id);
    }
  }
  return { status: outcome };
}
