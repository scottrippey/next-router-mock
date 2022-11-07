import React from "react";
import { NextComponentType, NextPageContext } from "next";
import { MemoryRouter } from "./MemoryRouter";
import { useMemoryRouter } from "./useMemoryRouter";
import { withMemoryRouter, WithRouterProps } from "./withMemoryRouter";
import { MemoryRouterContext } from "./MemoryRouterContext";

// Export extra mock APIs:
export { useMemoryRouter } from "./useMemoryRouter";
export { MemoryRouter, BaseRouter, Url } from "./MemoryRouter";

export const memoryRouter = new MemoryRouter();
memoryRouter.async = false;
export default memoryRouter;

export const useRouter = () => {
  return React.useContext(MemoryRouterContext) || useMemoryRouter(memoryRouter);
};

export const withRouter = <P extends WithRouterProps, C = NextPageContext>(
  ComposedComponent: NextComponentType<C, any, P>
) => {
  return withMemoryRouter(useRouter, ComposedComponent);
};
