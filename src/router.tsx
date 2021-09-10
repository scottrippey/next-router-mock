import { useEffect, useState } from "react";

import { MemoryRouter } from "./MemoryRouter";

// Default export a singleton:
const memoryRouter = new MemoryRouter();
export default memoryRouter;

// Overrides the useRouter hook:
export const useRouter = () => {
  const [router, setRouter] = useState(memoryRouter);
  const [, rerender] = useState<object>();

  useEffect(() => {
    const handleRouteChange = () => {
      // Clone the (mutable) memoryRouter, to ensure we trigger an update
      setRouter({ ...memoryRouter });
    };

    const handleRouteStart = () => {
      rerender({});
    };

    memoryRouter.events.on("routeChangeStart", handleRouteStart);
    memoryRouter.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      memoryRouter.events.off("routeChangeStart", handleRouteStart);
      memoryRouter.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  return router;
};
