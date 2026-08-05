import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const KEY = "motra.favorites";

const FavContext = createContext<{
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}>({ ids: [], toggle: () => {}, has: () => false });

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      window.localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ ids, toggle, has: (id: string) => ids.includes(id) }),
    [ids, toggle],
  );
  return <FavContext.Provider value={value}>{children}</FavContext.Provider>;
}

export const useFavorites = () => useContext(FavContext);
