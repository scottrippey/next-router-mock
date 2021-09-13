import { useEffect, useState } from "react";

import { MemoryRouter } from "./MemoryRouter";

export type MemoryRouterEventHandlers = {
  onRouteChange?: (url: string, options: { shallow: boolean }) => void;
  onRouteChangeStart?: (url: string, options: { shallow: boolean }) => void;
  onPush?: (url: string, options: { shallow: boolean }) => void;
  onReplace?: (url: string, options: { shallow: boolean }) => void;
};

export const useMemoryRouter = (initialRouter: () => MemoryRouter, eventHandlers?: MemoryRouterEventHandlers) => {
  const [router, setRouter] = useState(initialRouter);

  // Trigger updates on route changes:
  useEffect(() => {
    const handleRouteChange = () => {
      // Clone the (mutable) memoryRouter, to ensure we trigger an update
      setRouter((r) => MemoryRouter.clone(r));
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [
    // Events is a singleton, shared by all clones, so this should never actually change:
    router.events,
  ]);

  useEffect(() => {
    if (!eventHandlers) return;
    const { onRouteChange, onRouteChangeStart, onPush, onReplace } = eventHandlers;
    if (!(onRouteChange || onRouteChangeStart || onPush || onReplace)) return;

    if (onRouteChangeStart) router.events.on("routeChangeStart", onRouteChangeStart);
    if (onRouteChange) router.events.on("routeChangeComplete", onRouteChange);
    if (onPush) router.events.on("NEXT_ROUTER_MOCK:push", onPush);
    if (onReplace) router.events.on("NEXT_ROUTER_MOCK:replace", onReplace);
    return () => {
      if (onRouteChangeStart) router.events.off("routeChangeStart", onRouteChangeStart);
      if (onRouteChange) router.events.off("routeChangeComplete", onRouteChange);
      if (onPush) router.events.off("NEXT_ROUTER_MOCK:push", onPush);
      if (onReplace) router.events.off("NEXT_ROUTER_MOCK:replace", onReplace);
    };
  }, [
    router.events,
    eventHandlers?.onRouteChange,
    eventHandlers?.onRouteChangeStart,
    eventHandlers?.onPush,
    eventHandlers?.onReplace,
  ]);

  return router;
};
