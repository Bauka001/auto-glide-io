import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createDeliveryOrderFor, settlePayment } from "@/lib/payments.server";
import { tariffIds } from "@/lib/delivery-tariffs";

export const createDeliveryOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        carId: z.string().uuid().nullable().default(null),
        tariff: z.enum(tariffIds as [string, ...string[]]),
        fromCity: z.string().max(80).default(""),
        toCity: z.string().min(1).max(80),
        address: z.string().max(200).default(""),
        distanceKm: z.number().min(10).max(5000),
        insurance: z.boolean().default(false),
        date: z.string().max(20).nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) =>
    createDeliveryOrderFor(context.supabase, context.userId, {
      ...data,
      tariff: data.tariff as never,
    }),
  );

/** Mock provider capture. Replace the body with a real provider charge when keys are added. */
export const confirmPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ paymentId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: owned } = await context.supabase
      .from("payments")
      .select("id")
      .eq("id", data.paymentId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!owned) throw new Error("payment_not_found");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return settlePayment(supabaseAdmin, data.paymentId, "paid", `mock_${Date.now()}`);
  });
