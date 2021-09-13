import { useEffect, useReducer } from "react";

import { MemoryRouter } from "./MemoryRouter";

export const useMemoryRouter = (router: MemoryRouter) => {
  // const [router, setRouter] = useState(initialRouter);
  const [, force] = useReducer((x) => !x, false);

  useEffect(() => {
    const handleRouteChange = () => force();

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [
    // Events is a singleton, shared by all clones, so this should never actually change:
    router.events
  ]);

  return router;
};
