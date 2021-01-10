import { useEffect, useState } from "react";

import { MemoryRouter } from "./MemoryRouter";

// Create a singleton:
export let memoryRouter = new MemoryRouter();

// Default export the singleton:
export { memoryRouter as router };
export default memoryRouter;

// Overrides the useRouter hook:
export const useRouter = () => {
  const [router, setRouter] = useState(memoryRouter);

  useEffect(() => {
    const handleRouteChange = () => {
      // Clone the (mutable) memoryRouter, to ensure we trigger an update
      setRouter({ ...memoryRouter });
    };
    memoryRouter.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      memoryRouter.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  return router;
};
