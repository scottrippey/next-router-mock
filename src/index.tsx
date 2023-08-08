import React from "react";
import type { NextComponentType, NextPageContext } from "next";
import type { BaseContext } from "next/dist/shared/lib/utils";
import { MemoryRouter } from "./MemoryRouter";
import { useMemoryRouter } from "./useMemoryRouter";
import { withMemoryRouter, WithRouterProps } from "./withMemoryRouter";
import { MemoryRouterContext } from "./MemoryRouterContext";

// Export extra mock APIs:
export { useMemoryRouter } from "./useMemoryRouter";
export { MemoryRouter, BaseRouter, Url } from "./MemoryRouter";

// Export the singleton:
export const memoryRouter = new MemoryRouter();
memoryRouter.async = false;
export default memoryRouter;

// Export the `useRouter` hook:
export const useRouter = () => {
  return (
    React.useContext(MemoryRouterContext) || // Allow <MemoryRouterProvider> to override the singleton, if needed
    useMemoryRouter(memoryRouter)
  );
};

// Export the `withRouter` HOC:
export const withRouter = <P extends WithRouterProps, C extends BaseContext = NextPageContext>(
  ComposedComponent: NextComponentType<C, any, P>
) => {
  return withMemoryRouter(useRouter, ComposedComponent);
};
