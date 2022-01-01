import { useEffect, useState } from "react";

import { MemoryRouter } from "./MemoryRouter";

export type MemoryRouterEventHandlers = {
  onHashChangeStart?: (url: string, options: { shallow: boolean }) => void;
  onHashChangeComplete?: (url: string, options: { shallow: boolean }) => void;
  onRouteChangeStart?: (url: string, options: { shallow: boolean }) => void;
  onRouteChangeComplete?: (url: string, options: { shallow: boolean }) => void;
  onPush?: (url: string, options: { shallow: boolean }) => void;
  onReplace?: (url: string, options: { shallow: boolean }) => void;
};

export const useMemoryRouter = (singletonRouter: MemoryRouter, eventHandlers?: MemoryRouterEventHandlers) => {
  const [router, setRouter] = useState(() => MemoryRouter.snapshot(singletonRouter));

  // Trigger updates on route changes:
  useEffect(() => {
    // To ensure we don't call setRouter after unmounting:
    let isMounted = true;

    const handleRouteChange = () => {
      if (!isMounted) return;

      // Ensure the reference changes each render:
      setRouter(MemoryRouter.snapshot(singletonRouter));
    };

    singletonRouter.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      isMounted = false;
      singletonRouter.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [singletonRouter]);

  // Subscribe to any eventHandlers:
  useEffect(() => {
    if (!eventHandlers) return;
    const {
      onRouteChangeStart,
      onRouteChangeComplete,
      onHashChangeComplete,
      onHashChangeStart,
      onPush,
      onReplace,
    } = eventHandlers;
    if (onRouteChangeStart) singletonRouter.events.on("routeChangeStart", onRouteChangeStart);
    if (onRouteChangeComplete) singletonRouter.events.on("routeChangeComplete", onRouteChangeComplete);
    if (onHashChangeStart) singletonRouter.events.on("hashChangeStart", onHashChangeStart);
    if (onHashChangeComplete) singletonRouter.events.on("hashChangeComplete", onHashChangeComplete);
    if (onPush) singletonRouter.events.on("NEXT_ROUTER_MOCK:push", onPush);
    if (onReplace) singletonRouter.events.on("NEXT_ROUTER_MOCK:replace", onReplace);
    return () => {
      if (onRouteChangeStart) singletonRouter.events.off("routeChangeStart", onRouteChangeStart);
      if (onRouteChangeComplete) singletonRouter.events.off("routeChangeComplete", onRouteChangeComplete);
      if (onHashChangeStart) singletonRouter.events.off("hashChangeStart", onHashChangeStart);
      if (onHashChangeComplete) singletonRouter.events.off("hashChangeComplete", onHashChangeComplete);
      if (onPush) singletonRouter.events.off("NEXT_ROUTER_MOCK:push", onPush);
      if (onReplace) singletonRouter.events.off("NEXT_ROUTER_MOCK:replace", onReplace);
    };
  }, [
    singletonRouter.events,
    eventHandlers?.onRouteChangeStart,
    eventHandlers?.onRouteChangeComplete,
    eventHandlers?.onHashChangeStart,
    eventHandlers?.onHashChangeComplete,
    eventHandlers?.onPush,
    eventHandlers?.onReplace,
  ]);

  return router;
};
