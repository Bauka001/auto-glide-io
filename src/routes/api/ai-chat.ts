import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

type ChatMessage = { role: "user" | "assistant"; content: string };

export type AiCar = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  city: string;
  category: string;
  transmission: string;
  fuel: string;
  image_key: string | null;
  image_url: string | null;
};

const SYSTEM = `You are AutoHub AI, an automotive assistant for a car marketplace in Kazakhstan.
All prices are in Kazakhstani tenge (₸). Current market rates: NBK base rate 16.75%,
car loan effective rate ~21% for new cars and ~28% for used, leasing ~20%, installments 0% up to 24 months,
MTPL (ОГПО) around 21 000 ₸ per year, CASCO around 3.5% of the car value per year.
You help users choose a car and answer questions about credit, installments, leasing, insurance and delivery.

When the user is looking for a car, ALWAYS call the search_cars tool first and base your answer on its
results only — never invent listings. After the tool returns, briefly describe the best matches
(the app renders clickable cards for them automatically, so do not paste links or repeat every spec).
If nothing matches, say so and suggest loosening the budget or filters.
Always reply in the same language the user writes in (Kazakh, Russian or English).
Be concise, friendly and practical.`;

const searchTool = {
  type: "function",
  function: {
    name: "search_cars",
    description:
      "Search published car listings in the AutoHub catalog. Prices are in tenge (₸).",
    parameters: {
      type: "object",
      properties: {
        query: { type: ["string", "null"], description: "Free text: brand, model or keyword" },
        category: {
          type: ["string", "null"],
          description: "One of: SUV, Sedan, Electric, Hatchback, Coupe",
        },
        max_price: { type: ["number", "null"], description: "Maximum price in tenge" },
        min_year: { type: ["number", "null"], description: "Oldest acceptable model year" },
        transmission: { type: ["string", "null"], description: "e.g. Automatic, Manual" },
        fuel: { type: ["string", "null"], description: "e.g. Petrol, Diesel, Electric, Hybrid" },
        limit: { type: ["number", "null"], description: "Max results, default 4" },
      },
      required: ["query", "category", "max_price", "min_year", "transmission", "fuel", "limit"],
      additionalProperties: false,
    },
  },
} as const;

type SearchArgs = {
  query?: string | null;
  category?: string | null;
  max_price?: number | null;
  min_year?: number | null;
  transmission?: string | null;
  fuel?: string | null;
  limit?: number | null;
};

async function searchCars(args: SearchArgs): Promise<AiCar[]> {
  const url = process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"];
  const key =
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return [];
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  let q = supabase
    .from("cars")
    .select(
      "id,brand,model,year,price,mileage,city,category,transmission,fuel,image_key,image_url",
    )
    .eq("is_published", true);

  if (args.category) q = q.ilike("category", args.category);
  if (typeof args.max_price === "number") q = q.lte("price", Math.round(args.max_price));
  if (typeof args.min_year === "number") q = q.gte("year", Math.round(args.min_year));
  if (args.transmission) q = q.ilike("transmission", `%${args.transmission}%`);
  if (args.fuel) q = q.ilike("fuel", `%${args.fuel}%`);
  if (args.query) {
    const term = args.query.replace(/[%,]/g, " ").trim();
    if (term) q = q.or(`brand.ilike.%${term}%,model.ilike.%${term}%,category.ilike.%${term}%`);
  }

  const limit = Math.min(Math.max(Math.round(args.limit ?? 4), 1), 6);
  const { data, error } = await q.order("price", { ascending: true }).limit(limit);
  if (error) return [];
  return (data ?? []) as AiCar[];
}

export const Route = createFileRoute("/api/ai-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: ChatMessage[] };
        const history = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
        if (history.length === 0) {
          return new Response(JSON.stringify({ error: "messages required" }), { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response(JSON.stringify({ error: "AI is not configured" }), { status: 500 });
        }

        const messages: Record<string, unknown>[] = [
          { role: "system", content: SYSTEM },
          ...history,
        ];
        let cars: AiCar[] = [];

        const call = async () =>
          fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages,
              tools: [searchTool],
            }),
          });

        // Up to two rounds: one tool call, then the final answer.
        for (let round = 0; round < 2; round++) {
          const res = await call();
          if (!res.ok) {
            const detail = await res.text();
            return new Response(JSON.stringify({ error: detail.slice(0, 300) }), {
              status: res.status,
              headers: { "Content-Type": "application/json" },
            });
          }
          const data = (await res.json()) as {
            choices?: {
              message?: {
                content?: string;
                tool_calls?: { id: string; function: { name: string; arguments: string } }[];
              };
            }[];
          };
          const message = data.choices?.[0]?.message;
          const toolCalls = message?.tool_calls ?? [];

          if (toolCalls.length > 0) {
            messages.push({
              role: "assistant",
              content: message?.content ?? "",
              tool_calls: toolCalls,
            });
            for (const tc of toolCalls) {
              let args: SearchArgs = {};
              try {
                args = JSON.parse(tc.function.arguments || "{}") as SearchArgs;
              } catch {
                args = {};
              }
              const found = tc.function.name === "search_cars" ? await searchCars(args) : [];
              cars = [...cars, ...found].filter(
                (c, i, all) => all.findIndex((x) => x.id === c.id) === i,
              );
              messages.push({
                role: "tool",
                tool_call_id: tc.id,
                content: JSON.stringify(found),
              });
            }
            continue;
          }

          return new Response(JSON.stringify({ reply: message?.content ?? "", cars }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ reply: "", cars }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
