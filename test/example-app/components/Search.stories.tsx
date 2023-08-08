import { MemoryRouterProvider } from "next-router-mock/MemoryRouterProvider/next-13";
import { Search } from "./Search";

const MemoryRouterDecorator = (Story: React.ComponentType) => (
  <MemoryRouterProvider>
    <Story />
  </MemoryRouterProvider>
);

export default {
  title: "components / Search",
  component: Search,
  decorators: [MemoryRouterDecorator],
};
