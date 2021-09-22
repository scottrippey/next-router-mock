import { MemoryRouter } from "./MemoryRouter";
import { useMemoryRouter } from "./useMemoryRouter";
import { ComponentWithRouter, withMemoryRouter, WithRouterProps } from "./withMemoryRouter";

export { useMemoryRouter } from "./useMemoryRouter";
export { MemoryRouter, BaseRouter, Url } from "./MemoryRouter";

export const memoryRouter = new MemoryRouter();
memoryRouter.async = true;
export default memoryRouter;

export const useRouter = () => {
  return useMemoryRouter(memoryRouter);
};

export const withRouter = <TProps extends WithRouterProps>(ComposedComponent: ComponentWithRouter<TProps>) => {
  return withMemoryRouter(useRouter, ComposedComponent);
};
