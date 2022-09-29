import React from "react";
import { useMemoryRouter } from "./useMemoryRouter";
import { withMemoryRouter, WithRouterProps } from "./withMemoryRouter";
import { NextComponentType, NextPageContext } from "next";

import { MemoryRouter, BaseRouter, Url } from "./MemoryRouter";

const memoryRouter = new MemoryRouter();
memoryRouter.async = true;

const useRouter = () => {
  return useMemoryRouter(memoryRouter);
};

const withRouter = <P extends WithRouterProps, C = NextPageContext>(
  ComposedComponent: NextComponentType<C, any, P>
) => {
  return withMemoryRouter(useRouter, ComposedComponent);
};

// Export the same interfaces as `next/router`:
export default memoryRouter;
export { useRouter, withRouter };
// Export the same interface as `next/dist/shared/lib/router-context`
// This is a workaround for `next/link` v12.2, since it no longer uses the `useRouter` hook.
// Instead, we will export a context that has the default value set to our mock:
export const RouterContext = React.createContext(memoryRouter);

// Export extra mock stuff:
export { memoryRouter, useMemoryRouter, MemoryRouter, BaseRouter, Url };
