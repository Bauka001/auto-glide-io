import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const COLS =
  "id,brand,model,year,price,mileage,engine,fuel,transmission,category,city,image_key,image_url,owner_id,is_published";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getPublicCar = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: row } = await publicClient()
      .from("cars")
      .select(COLS)
      .eq("id", data.id)
      .eq("is_published", true)
      .maybeSingle();
    return row ?? null;
  });

export const listPublicCars = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient()
    .from("cars")
    .select(COLS)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  return data ?? [];
});
