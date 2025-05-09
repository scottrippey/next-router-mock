import { useState, useEffect, useMemo } from "react";
import { MemoryRouter } from "../MemoryRouter";
import singletonRouter from "../index";
import type * as NextNav from "next/navigation";

function useSnapshot<T>(makeSnapshot: (r: MemoryRouter, prev: T | null) => T): T {
  const [snapshot, setSnapshot] = useState(() => makeSnapshot(singletonRouter, null));

  useEffect(() => {
    // To ensure we don't call setRouter after unmounting:
    let isMounted = true;

    const handleRouteChange = () => {
      if (!isMounted) return;

      // Ensure the reference changes each render:
      setSnapshot((prev) => makeSnapshot(singletonRouter, prev));
    };

    singletonRouter.events.on("routeChangeComplete", handleRouteChange);
    singletonRouter.events.on("hashChangeComplete", handleRouteChange);
    return () => {
      isMounted = false;
      singletonRouter.events.off("routeChangeComplete", handleRouteChange);
      singletonRouter.events.off("hashChangeComplete", handleRouteChange);
    };
  }, []);

  return snapshot;
}

export const useRouter: typeof NextNav.useRouter = () => {
  // All these methods are static, and never trigger a rerender:
  return useMemo(
    () => ({
      push: (url, options) => singletonRouter.push(url),
      replace: (url, options) => singletonRouter.replace(url),
      refresh: singletonRouter.reload,
      prefetch: singletonRouter.prefetch,
      back: singletonRouter.back,
      forward: singletonRouter.forward,
    }),
    []
  );
};

export const useSearchParams: typeof NextNav.useSearchParams = () => {
  return useSnapshot((r, prev) => {
    const query = r.internal.query;
    debugger;
    // Build the search params from the query object:
    const newSearchParams = new URLSearchParams();
    Object.keys(query).forEach((key) => {
      const value = query[key];
      if (Array.isArray(value)) {
        value.forEach((val) => newSearchParams.append(key, val));
      } else if (value !== undefined) {
        newSearchParams.append(key, value);
      }
    });

    // Prevent rerendering if the query is the same:
    if (prev && newSearchParams.toString() === prev.toString()) {
      return prev;
    }
    return newSearchParams as NextNav.ReadonlyURLSearchParams;
  });
};

export const usePathname: typeof NextNav.usePathname = () => {
  return useSnapshot((r) => r.pathname);
};

export const useParams: typeof NextNav.useParams = <T extends ReturnType<typeof NextNav.useParams>>() => {
  return useSnapshot((r) => r.internal.routeParams as T);
};

export const useSelectedLayoutSegment: typeof NextNav.useSelectedLayoutSegment = () =>
  useSnapshot((r) => r.internal.selectedLayoutSegment);
export const useSelectedLayoutSegments: typeof NextNav.useSelectedLayoutSegments = () =>
  useSnapshot((r) => r.internal.selectedLayoutSegments);
