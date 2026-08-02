import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCar, money } from "@/lib/cars";

export const Route = createFileRoute("/chat")({
  validateSearch: (search: Record<string, unknown>): { carId?: string | undefined } => ({
    carId: typeof search["carId"] === "string" ? (search["carId"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Chat with the dealer — Motra" },
      {
        name: "description",
        content: "Message the dealer about a car, credit terms or delivery — securely in-app.",
      },
      { property: "og:title", content: "Chat with the dealer — Motra" },
      { property: "og:description", content: "Secure in-app messaging with verified dealers." },
    ],
  }),
  component: ChatPage,
});

type Msg = { id: number; from: "me" | "dealer"; text: string };

function ChatPage() {
  const { carId } = Route.useSearch();
  const car = carId ? getCar(carId) : undefined;
  const [messages, setMessages] = useState<Msg[]>([
    { id: 1, from: "dealer", text: "Hi! Thanks for your interest. How can I help?" },
  ]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const mine: Msg = { id: Date.now(), from: "me", text: text.trim() };
    setMessages((m) => [...m, mine]);
    setText("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          from: "dealer",
          text: "Got it — I'll check and confirm within a few minutes.",
        },
      ]);
    }, 900);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {car && (
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 border-b border-border px-5 py-3">
          <img
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            loading="lazy"
            width={1280}
            height={854}
            className="h-12 w-16 rounded-xl object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {car.brand} {car.model}
            </p>
            <p className="text-xs text-muted-foreground">{money(car.price)} · Verified dealer</p>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-2xl flex-1 space-y-3 px-5 py-6">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex animate-fade-in ${m.from === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-3xl px-4 py-2.5 text-sm ${
                m.from === "me"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </main>

      <form
        onSubmit={send}
        className="sticky bottom-0 border-t border-border bg-background/90 backdrop-blur-xl"
      >
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2 px-5 py-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a message"
            className="h-12 rounded-2xl"
          />
          <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-2xl">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="pb-3 text-center text-xs text-muted-foreground">
          Contact details stay private until the deal is confirmed.
        </p>
      </form>
    </div>
  );
}
