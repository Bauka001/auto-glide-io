import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const BASE_URL = "https://auto-glide-io.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

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

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/cars", changefreq: "daily", priority: "0.9" },
          { path: "/dealers", changefreq: "daily", priority: "0.8" },
          { path: "/finance", changefreq: "weekly", priority: "0.7" },
          { path: "/credit", changefreq: "weekly", priority: "0.7" },
          { path: "/insurance", changefreq: "weekly", priority: "0.7" },
          { path: "/delivery", changefreq: "weekly", priority: "0.7" },
          { path: "/compare", changefreq: "weekly", priority: "0.6" },
          { path: "/ai-chat", changefreq: "weekly", priority: "0.6" },
          { path: "/privacy", changefreq: "monthly", priority: "0.4" },
        ];

        const supabase = publicClient();
        const pageSize = 1000;

        for (let offset = 0; ; offset += pageSize) {
          const { data, error } = await supabase
            .from("cars")
            .select("id, slug, updated_at")
            .eq("is_published", true)
            .eq("status", "available")
            .order("id")
            .range(offset, offset + pageSize - 1);
          if (error) throw error;
          entries.push(
            ...data.map((car) => ({
              path: `/cars/${encodeURIComponent(car.slug ?? car.id)}`,
              lastmod: car.updated_at,
              changefreq: "weekly" as const,
              priority: "0.8",
            })),
          );
          if (data.length < pageSize) break;
        }

        for (let offset = 0; ; offset += pageSize) {
          const { data, error } = await supabase
            .from("dealers")
            .select("id, slug, updated_at")
            .eq("is_blocked", false)
            .order("id")
            .range(offset, offset + pageSize - 1);
          if (error) throw error;
          entries.push(
            ...data.map((dealer) => ({
              path: `/dealers/${encodeURIComponent(dealer.slug ?? dealer.id)}`,
              lastmod: dealer.updated_at,
              changefreq: "weekly" as const,
              priority: "0.7",
            })),
          );
          if (data.length < pageSize) break;
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
