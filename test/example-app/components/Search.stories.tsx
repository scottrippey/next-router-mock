import { MemoryRouterProvider } from "../../../src/MemoryRouterProvider/next-13";
import { Search } from "./Search";

export default {
  title: "components / Search",
};

export const WithDecorator = () => <Search />;
WithDecorator.decorators = [
  (Story) => (
    <MemoryRouterProvider>
      <Story />
    </MemoryRouterProvider>
  ),
];
