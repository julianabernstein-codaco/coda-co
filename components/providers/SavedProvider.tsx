"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// What can be saved. Both are referenced by their public slug (the same id
// used in URLs and cart entries), never the private cuid.
export type SavedKind = "product" | "vendor";

interface SavedEntry {
  kind: SavedKind;
  slug: string;
}

interface SavedContextType {
  saved: SavedEntry[];
  count: number;
  // False until localStorage has been read on mount. Consumers that render
  // saved state (e.g. the /saved page) wait on this to avoid flashing an
  // empty state during hydration.
  hydrated: boolean;
  isSaved: (kind: SavedKind, slug: string) => boolean;
  toggle: (kind: SavedKind, slug: string) => void;
}

const SavedContext = createContext<SavedContextType | null>(null);

const STORAGE_KEY = "coda-saved";

function sameEntry(e: SavedEntry, kind: SavedKind, slug: string) {
  return e.kind === kind && e.slug === slug;
}

// Client-only, localStorage-backed wishlist. Deliberately mirrors
// CartProvider: there's no saved-items table (see docs/data-model-evolution
// for the eventual account-synced version), so saves live in the browser.
export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<SavedEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSaved(JSON.parse(stored));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  const isSaved = useCallback(
    (kind: SavedKind, slug: string) => saved.some((e) => sameEntry(e, kind, slug)),
    [saved],
  );

  const toggle = useCallback((kind: SavedKind, slug: string) => {
    setSaved((prev) =>
      prev.some((e) => sameEntry(e, kind, slug))
        ? prev.filter((e) => !sameEntry(e, kind, slug))
        : [...prev, { kind, slug }],
    );
  }, []);

  const count = saved.length;

  return (
    <SavedContext.Provider value={{ saved, count, hydrated, isSaved, toggle }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
