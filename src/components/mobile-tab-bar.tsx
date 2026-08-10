import { Link } from "@tanstack/react-router";
import { Bot, Car, Home, MessageSquare, User } from "lucide-react";
import { useI18n, type Key } from "@/lib/i18n";

const items: { to: string; icon: typeof Car; key: Key | null }[] = [
  { to: "/", icon: Home, key: null },
  { to: "/cars", icon: Car, key: "nav.cars" },
  { to: "/ai-chat", icon: Bot, key: "nav.ai" },
  { to: "/chat", icon: MessageSquare, key: "chat.nav" },
  { to: "/profile", icon: User, key: "nav.profile" },
];

export function MobileTabBar() {
  const { t } = useI18n();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <Link
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{item.key ? t(item.key) : "AutoHub"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
