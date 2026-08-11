import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "motra.favorites";

function readLocal(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

const FavContext = createContext<{
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}>({ ids: [], toggle: () => {}, has: () => false });

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Load local ids first, then merge with the account when signed in.
  useEffect(() => {
    setIds(readLocal());

    let cancelled = false;

    async function sync(uid: string | null) {
      if (cancelled) return;
      setUserId(uid);
      if (!uid) return;

      const local = readLocal();
      const { data } = await supabase.from("favorites").select("car_id").eq("user_id", uid);
      const remote = (data ?? []).map((r) => r.car_id as string);

      const missing = local.filter((id) => !remote.includes(id));
      if (missing.length > 0) {
        await supabase
          .from("favorites")
          .upsert(
            missing.map((car_id) => ({ user_id: uid, car_id })),
            { onConflict: "user_id,car_id" },
          );
      }
      const merged = [...new Set([...remote, ...local])];
      if (cancelled) return;
      writeLocal(merged);
      setIds(merged);
    }

    void supabase.auth.getUser().then(({ data }) => sync(data.user?.id ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") void sync(session?.user.id ?? null);
      if (event === "SIGNED_OUT") setUserId(null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setIds((prev) => {
        const remove = prev.includes(id);
        const next = remove ? prev.filter((x) => x !== id) : [...prev, id];
        writeLocal(next);
        if (userId) {
          if (remove) {
            void supabase.from("favorites").delete().eq("user_id", userId).eq("car_id", id);
          } else {
            void supabase
              .from("favorites")
              .upsert({ user_id: userId, car_id: id }, { onConflict: "user_id,car_id" });
          }
        }
        return next;
      });
    },
    [userId],
  );

  const value = useMemo(
    () => ({ ids, toggle, has: (id: string) => ids.includes(id) }),
    [ids, toggle],
  );
  return <FavContext.Provider value={value}>{children}</FavContext.Provider>;
}

export const useFavorites = () => useContext(FavContext);
