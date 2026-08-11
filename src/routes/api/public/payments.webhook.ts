import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { settlePayment } from "@/lib/payments.server";

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PAYMENT_WEBHOOK_SECRET"];
        if (!secret) return new Response("Not configured", { status: 503 });

        const body = await request.text();
        const signature = request.headers.get("x-payment-signature") ?? "";
        const expected = createHmac("sha256", secret).update(body).digest("hex");
        const sig = Buffer.from(signature);
        const exp = Buffer.from(expected);
        if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: { payment_id?: string; status?: string; provider_ref?: string };
        try {
          payload = JSON.parse(body);
        } catch {
          return new Response("Bad payload", { status: 400 });
        }
        if (!payload.payment_id || (payload.status !== "paid" && payload.status !== "failed")) {
          return new Response("Bad payload", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await settlePayment(
          supabaseAdmin,
          payload.payment_id,
          payload.status,
          payload.provider_ref ?? "",
        );
        return new Response("ok");
      },
    },
  },
});
