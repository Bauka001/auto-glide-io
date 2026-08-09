import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const KEY = "autohub.compare";
export const MAX_COMPARE = 3;

const CompareContext = createContext<{
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
}>({
  ids: [],
  has: () => false,
  toggle: () => false,
  remove: () => {},
  clear: () => {},
});

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next: string[]) => {
    setIds(next);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const value = useMemo(
    () => ({
      ids,
      has: (id: string) => ids.includes(id),
      /** Returns false when the list is already full. */
      toggle: (id: string) => {
        if (ids.includes(id)) {
          persist(ids.filter((x) => x !== id));
          return true;
        }
        if (ids.length >= MAX_COMPARE) return false;
        persist([...ids, id]);
        return true;
      },
      remove: (id: string) => persist(ids.filter((x) => x !== id)),
      clear: () => persist([]),
    }),
    [ids, persist],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  return useContext(CompareContext);
}
