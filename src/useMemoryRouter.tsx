import { useEffect, useState } from "react";

import { MemoryRouter } from "./MemoryRouter";

export const useMemoryRouter = (initialRouter: MemoryRouter) => {
  const [router, setRouter] = useState(initialRouter);

  useEffect(() => {
    const handleRouteChange = () => {
      // Clone the (mutable) memoryRouter, to ensure we trigger an update
      setRouter((r) => MemoryRouter.clone(r));
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [
    // Events is a singleton, shared by all clones, so this should never actually change:
    router.events,
  ]);

  return router;
};
