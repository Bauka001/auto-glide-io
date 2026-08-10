import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { money } from "@/lib/cars";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  useConversation,
  useConversations,
  useMessages,
  useMessagesRealtime,
  useSendMessage,
  useStartConversation,
} from "@/lib/chat";

export const Route = createFileRoute("/chat")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { carId?: string | undefined; c?: string | undefined } => ({
    carId: typeof search["carId"] === "string" ? (search["carId"] as string) : undefined,
    c: typeof search["c"] === "string" ? (search["c"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Chat with the dealer — AutoHub" },
      {
        name: "description",
        content: "Message the dealer about a car, credit terms or delivery — securely in-app.",
      },
      { property: "og:title", content: "Chat with the dealer — AutoHub" },
      { property: "og:description", content: "Secure in-app messaging with verified dealers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { carId, c } = Route.useSearch();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const start = useStartConversation();
  const [error, setError] = useState<string | null>(null);

  // Opening from a car page: reuse or create the thread, then switch to ?c=
  const started = useRef(false);
  useEffect(() => {
    if (!user || c || !carId || started.current) return;
    started.current = true;
    start.mutate(carId, {
      onSuccess: (id) => void navigate({ to: "/chat", search: { c: id }, replace: true }),
      onError: (err: unknown) =>
        setError(err instanceof Error && err.message === "own-car" ? t("chat.ownCar") : null),
    });
  }, [user, c, carId, start, navigate, t]);

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-md px-5 py-24 text-center">
          <p className="text-sm text-muted-foreground">{t("auth.needLogin")}</p>
          <Button asChild className="mt-4 rounded-2xl">
            <Link to="/auth" search={{ next: "/chat" }}>
              {t("auth.signin")}
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-md px-5 py-24 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button asChild variant="secondary" className="mt-4 rounded-2xl">
            <Link to="/chat">{t("chat.inbox")}</Link>
          </Button>
        </main>
      </div>
    );
  }

  return c ? <Thread conversationId={c} /> : <Inbox />;
}

function Inbox() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: list = [], isLoading } = useConversations(Boolean(user));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-5 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t("chat.inbox")}</h1>
        {isLoading ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-border bg-card p-10 text-center">
            <MessageSquare className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">{t("chat.empty")}</p>
            <Button asChild className="mt-4 rounded-2xl">
              <Link to="/cars">{t("nav.cars")}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {list.map((conv) => (
              <Link
                key={conv.id}
                to="/chat"
                search={{ c: conv.id }}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-3xl border border-border bg-card p-3 transition-colors hover:border-primary/60"
              >
                {conv.car && (
                  <img
                    src={conv.car.image}
                    alt={`${conv.car.brand} ${conv.car.model}`}
                    loading="lazy"
                    className="h-14 w-20 rounded-2xl object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {conv.car ? `${conv.car.brand} ${conv.car.model}` : t("chat.title")}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {conv.lastMessage || t("chat.empty")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.id === conv.buyerId ? t("chat.dealer") : t("chat.buyer")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Thread({ conversationId }: { conversationId: string }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: conv } = useConversation(conversationId);
  const { data: messages = [] } = useMessages(conversationId);
  useMessagesRealtime(conversationId);
  const send = useSendMessage(conversationId);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    send.mutate(body);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {conv?.car && (
        <Link
          to="/cars/$carId"
          params={{ carId: conv.car.id }}
          className="mx-auto flex w-full max-w-2xl items-center gap-3 border-b border-border px-5 py-3"
        >
          <img
            src={conv.car.image}
            alt={`${conv.car.brand} ${conv.car.model}`}
            loading="lazy"
            className="h-12 w-16 rounded-xl object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {conv.car.brand} {conv.car.model}
            </p>
            <p className="text-xs text-muted-foreground">
              {money(conv.car.price)} ·{" "}
              {user?.id === conv.buyerId ? t("chat.dealer") : t("chat.buyer")}
            </p>
          </div>
        </Link>
      )}

      <main className="mx-auto w-full max-w-2xl flex-1 space-y-3 px-5 py-6">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">{t("chat.empty")}</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === user?.id;
          return (
            <div
              key={m.id}
              className={`flex animate-fade-in ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-3xl px-4 py-2.5 text-sm ${
                  mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </main>

      <form
        onSubmit={submit}
        className="sticky bottom-0 border-t border-border bg-background/90 backdrop-blur-xl"
      >
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2 px-5 py-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("chat.placeholder")}
            className="h-12 rounded-2xl"
          />
          <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-2xl">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="pb-3 text-center text-xs text-muted-foreground">{t("chat.privacy")}</p>
      </form>
    </div>
  );
}
