import { Link } from "@tanstack/react-router";
import { Bot, Heart, Home, MessageSquare, User } from "lucide-react";
import { useI18n, type Key } from "@/lib/i18n";

const items: { to: string; icon: typeof Home; key: Key | null }[] = [
  { to: "/", icon: Home, key: null },
  { to: "/favorites", icon: Heart, key: "cars.favorites" },
  { to: "/ai-chat", icon: Bot, key: "nav.ai" },
  { to: "/chat", icon: MessageSquare, key: "chat.nav" },
  { to: "/profile", icon: User, key: "nav.profile" },
];

export function MobileTabBar() {
  const { t } = useI18n();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-between gap-1 px-2 py-2">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <Link
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{
                className: "text-primary [&>span:first-child]:bg-primary/12",
              }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="group flex min-h-11 flex-col items-center gap-1 rounded-2xl py-1 text-[10px] font-medium transition-colors"
            >
              <span className="grid h-8 w-12 place-items-center rounded-full transition-all duration-200 group-active:scale-95">
                <item.icon className="h-[18px] w-[18px]" />
              </span>
              <span className="truncate leading-none">
                {item.key ? t(item.key) : "AutoHub"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
