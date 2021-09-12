import { MemoryRouter } from "./MemoryRouter";
import { useMemoryRouter } from "./useMemoryRouter";

export { useMemoryRouter } from "./useMemoryRouter";
export { MemoryRouter, BaseRouter } from "./MemoryRouter";

export const memoryRouter = new MemoryRouter();
memoryRouter.async = true;
export default memoryRouter;

export const useRouter = () => {
  return useMemoryRouter(memoryRouter);
};
