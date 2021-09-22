import { MemoryRouter } from "./MemoryRouter";
import { useMemoryRouter } from "./useMemoryRouter";
import { ComponentWithWrapper, withMemoryRouter } from "./withMemoryRouter";

export { useMemoryRouter } from "./useMemoryRouter";
export { MemoryRouter, BaseRouter, Url } from "./MemoryRouter";

export const memoryRouter = new MemoryRouter();
memoryRouter.async = false;
export default memoryRouter;

export const useRouter = () => {
  return useMemoryRouter(memoryRouter);
};

export const withRouter = (ComposedComponent: ComponentWithWrapper) => {
  return withMemoryRouter(useRouter, ComposedComponent);
};
