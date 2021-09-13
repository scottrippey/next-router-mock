import { MemoryRouter } from "./MemoryRouter";
import { useMemoryRouter } from "./useMemoryRouter";

export { useMemoryRouter } from "./useMemoryRouter";
export { MemoryRouter, BaseRouter, Url } from "./MemoryRouter";

export const memoryRouter = new MemoryRouter();
memoryRouter.async = false;
export default memoryRouter;

export const useRouter = () => {
  return useMemoryRouter(() => memoryRouter);
};
