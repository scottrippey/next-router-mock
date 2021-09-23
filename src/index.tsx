import { MemoryRouter } from "./MemoryRouter";
import { useMemoryRouter } from "./useMemoryRouter";
import { withMemoryRouter, WithRouterProps } from "./withMemoryRouter";
import { NextComponentType, NextPageContext } from "next";

export { useMemoryRouter } from "./useMemoryRouter";
export { MemoryRouter, BaseRouter, Url } from "./MemoryRouter";

export const memoryRouter = new MemoryRouter();
memoryRouter.async = false;
export default memoryRouter;

export const useRouter = () => {
  return useMemoryRouter(memoryRouter);
};

export const withRouter = <P extends WithRouterProps, C = NextPageContext>(
  ComposedComponent: NextComponentType<C, any, P>
) => {
  return withMemoryRouter(useRouter, ComposedComponent);
};
