import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { PitchDeck } from "@/components/pitch-deck";

const searchSchema = z.object({
  slide: z.coerce.number().int().min(1).max(11).catch(1),
  print: z.coerce.boolean().catch(false),
});

export const Route = createFileRoute("/pitch")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "AutoHub Investor Pitch Deck — Kazakhstan" },
      { name: "description", content: "AutoHub онлайн автосалон платформасының 11 слайдтық инвесторлық питч-дегі." },
      { property: "og:title", content: "AutoHub Investor Pitch Deck" },
      { property: "og:description", content: "Қазақстандағы көлік саудасын толық онлайн ағынға біріктіретін AutoHub платформасы." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PitchPage,
});

function PitchPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/pitch" });
  return <PitchDeck current={search.slide} printMode={search.print} onNavigate={(slide) => void navigate({ search: { ...search, slide }, replace: true })} />;
}