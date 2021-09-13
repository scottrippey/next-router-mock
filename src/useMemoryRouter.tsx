import { useEffect, useState } from "react";

import { MemoryRouter } from "./MemoryRouter";

export type MemoryRouterEventHandlers = {
  onRouteChange?: (url: string, options: { shallow: boolean }) => void;
  onRouteChangeStart?: (url: string, options: { shallow: boolean }) => void;
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

  useEffect(() => {
    if (!eventHandlers) return;
    const { onRouteChange, onRouteChangeStart, onPush, onReplace } = eventHandlers;
    if (!(onRouteChange || onRouteChangeStart || onPush || onReplace)) return;

    if (onRouteChangeStart) singletonRouter.events.on("routeChangeStart", onRouteChangeStart);
    if (onRouteChange) singletonRouter.events.on("routeChangeComplete", onRouteChange);
    if (onPush) singletonRouter.events.on("NEXT_ROUTER_MOCK:push", onPush);
    if (onReplace) singletonRouter.events.on("NEXT_ROUTER_MOCK:replace", onReplace);
    return () => {
      if (onRouteChangeStart) singletonRouter.events.off("routeChangeStart", onRouteChangeStart);
      if (onRouteChange) singletonRouter.events.off("routeChangeComplete", onRouteChange);
      if (onPush) singletonRouter.events.off("NEXT_ROUTER_MOCK:push", onPush);
      if (onReplace) singletonRouter.events.off("NEXT_ROUTER_MOCK:replace", onReplace);
    };
  }, [
    singletonRouter.events,
    eventHandlers?.onRouteChange,
    eventHandlers?.onRouteChangeStart,
    eventHandlers?.onPush,
    eventHandlers?.onReplace,
  ]);

  return router;
};
