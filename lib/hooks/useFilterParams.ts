"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const get = useCallback(
    (key: string) => params.get(key) ?? "",
    [params],
  );

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  const toggleBool = useCallback(
    (key: string) => {
      const next = new URLSearchParams(params.toString());
      if (next.get(key) === "1") next.delete(key);
      else next.set(key, "1");
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  const clearAll = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  return { get, setParam, toggleBool, clearAll };
}
