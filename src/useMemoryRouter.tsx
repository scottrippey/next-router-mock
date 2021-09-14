import { useEffect, useState } from "react";

import { MemoryRouter } from "./MemoryRouter";

export type MemoryRouterEventHandlers = {
  onRouteChangeStart?: (url: string, options: { shallow: boolean }) => void;
  onRouteChangeComplete?: (url: string, options: { shallow: boolean }) => void;
  onPush?: (url: string, options: { shallow: boolean }) => void;
  onReplace?: (url: string, options: { shallow: boolean }) => void;
};

export const useMemoryRouter = (singletonRouter: MemoryRouter, eventHandlers?: MemoryRouterEventHandlers) => {
  const [router, setRouter] = useState(() => MemoryRouter.snapshot(singletonRouter));

  // Trigger updates on route changes:
  useEffect(() => {
    const handleRouteChange = () => {
      // Ensure the reference changes each render:
      setRouter(MemoryRouter.snapshot(singletonRouter));
    };

    singletonRouter.events.on("routeChangeComplete", handleRouteChange);
    return () => singletonRouter.events.off("routeChangeComplete", handleRouteChange);
  }, [singletonRouter]);

  // Subscribe to any eventHandlers:
  useEffect(() => {
    if (!eventHandlers) return;
    const { onRouteChangeStart, onRouteChangeComplete, onPush, onReplace } = eventHandlers;
    if (!(onRouteChangeStart || onRouteChangeComplete || onPush || onReplace)) return;

    if (onRouteChangeStart) singletonRouter.events.on("routeChangeStart", onRouteChangeStart);
    if (onRouteChangeComplete) singletonRouter.events.on("routeChangeComplete", onRouteChangeComplete);
    if (onPush) singletonRouter.events.on("NEXT_ROUTER_MOCK:push", onPush);
    if (onReplace) singletonRouter.events.on("NEXT_ROUTER_MOCK:replace", onReplace);
    return () => {
      if (onRouteChangeStart) singletonRouter.events.off("routeChangeStart", onRouteChangeStart);
      if (onRouteChangeComplete) singletonRouter.events.off("routeChangeComplete", onRouteChangeComplete);
      if (onPush) singletonRouter.events.off("NEXT_ROUTER_MOCK:push", onPush);
      if (onReplace) singletonRouter.events.off("NEXT_ROUTER_MOCK:replace", onReplace);
    };
  }, [
    singletonRouter.events,
    eventHandlers?.onRouteChangeStart,
    eventHandlers?.onRouteChangeComplete,
    eventHandlers?.onPush,
    eventHandlers?.onReplace,
  ]);

  return router;
};
