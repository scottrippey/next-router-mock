import React from "react";
import { MemoryRouter } from "./MemoryRouter";
import { useMemoryRouter } from "./useMemoryRouter";
import { withMemoryRouter, WithRouterProps } from "./withMemoryRouter";
import { NextComponentType, NextPageContext } from "next";

// Export extra mock APIs:
export { useMemoryRouter } from "./useMemoryRouter";
export { MemoryRouter, BaseRouter, Url } from "./MemoryRouter";

export const memoryRouter = new MemoryRouter();
memoryRouter.async = true;
export default memoryRouter;

export const useRouter = () => {
  return useMemoryRouter(memoryRouter);
};

export const withRouter = <P extends WithRouterProps, C = NextPageContext>(
  ComposedComponent: NextComponentType<C, any, P>
) => {
  return withMemoryRouter(useRouter, ComposedComponent);
};

// Export the same interface as `next/dist/shared/lib/router-context`
// This is a workaround for `next/link` v12.2, since it no longer uses the `useRouter` hook.
// Instead, we can use a context that has the default value set to our mock:
export const RouterContext = React.createContext(memoryRouter);
