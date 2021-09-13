import { useEffect, useState } from "react";

import { MemoryRouter } from "./MemoryRouter";

export const useMemoryRouter = (singletonRouter: MemoryRouter) => {
  const [router, setRouter] = useState(() => MemoryRouter.snapshot(singletonRouter));

  useEffect(() => {
    const handleRouteChange = () => {
      // Ensure the reference changes each render:
      setRouter(MemoryRouter.snapshot(singletonRouter));
    };

    singletonRouter.events.on("routeChangeComplete", handleRouteChange);
    return () => singletonRouter.events.off("routeChangeComplete", handleRouteChange);
  }, [singletonRouter]);

  return router;
};
