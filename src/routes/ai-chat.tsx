import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bot, Lightbulb, ListFilter, Send } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/ai-chat")({
  head: () => ({
    meta: [
      { title: "AI car assistant — Motra" },
      {
        name: "description",
        content:
          "Ask the Motra AI assistant about cars, credit, leasing, CASCO and MTPL insurance in Kazakh, Russian or English.",
      },
      { property: "og:title", content: "AI car assistant — Motra" },
      {
        property: "og:description",
        content: "Personal AI consultant for choosing a car and financing it.",
      },
    ],
  }),
  component: AiChatPage,
});

type Msg = { id: number; role: "user" | "assistant"; content: string };

function AiChatPage() {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const ask = async (prompt: string) => {
    if (!prompt.trim() || loading) return;
    const next: Msg[] = [...messages, { id: Date.now(), role: "user", content: prompt.trim() }];
    setMessages(next);
    setText("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.reply || data.error || "…",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, role: "assistant", content: "Network error. Try again." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const quick = [
    {
      icon: ListFilter,
      label: t("ai.pick"),
      prompt:
        lang === "kk"
          ? "Маған 20 000 доллар бюджетке отбасылық көлік таңдап беріңіз."
          : lang === "en"
            ? "Help me pick a family car with a $20,000 budget."
            : "Подбери семейный автомобиль с бюджетом 20 000 долларов.",
    },
    {
      icon: Bot,
      label: t("ai.ask"),
      prompt:
        lang === "kk"
          ? "КАСКО мен ОГПО айырмашылығы неде?"
          : lang === "en"
            ? "What is the difference between CASCO and MTPL?"
            : "Чем отличается КАСКО от ОГПО?",
    },
    {
      icon: Lightbulb,
      label: t("ai.tips"),
      prompt:
        lang === "kk"
          ? "Автонесие алу бойынша 5 кеңес беріңіз."
          : lang === "en"
            ? "Give me 5 tips for taking a car loan."
            : "Дай 5 советов по автокредиту.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6">
        {messages.length === 0 && (
          <div className="animate-fade-in py-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15">
              <Bot className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">{t("ai.title")}</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{t("ai.sub")}</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {quick.map((q) => (
                <button
                  key={q.label}
                  onClick={() => ask(q.prompt)}
                  className="rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50"
                >
                  <q.icon className="h-4 w-4 text-primary" />
                  <p className="mt-2 text-sm font-medium">{q.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex animate-fade-in ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-3xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="animate-pulse rounded-3xl bg-card px-4 py-2.5 text-sm text-muted-foreground">
                {t("ai.thinking")}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </main>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(text);
        }}
        className="sticky bottom-0 border-t border-border bg-background/90 backdrop-blur-xl"
      >
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2 px-5 py-3">
          <Input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("ai.ph")}
            className="h-12 rounded-2xl"
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading}
            className="h-12 w-12 shrink-0 rounded-2xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
