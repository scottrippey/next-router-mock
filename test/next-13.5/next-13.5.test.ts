// TODO: Officially support Next 13
// Validate our types are exported correctly:
import type { createDynamicRouteParser } from "../../dynamic-routes";
import type { createDynamicRouteParser as _ } from "../../dynamic-routes/next-13";
import type { MemoryRouterProvider } from "../../MemoryRouterProvider";
import type { MemoryRouterProvider as __ } from "../../MemoryRouterProvider/next-13.5";

describe(`next version ${require("next/package.json").version}`, () => {
  describe("automatic and explicit import paths are valid", () => {
    it("next-router-mock/dynamic-routes", () => {
      require("../../dynamic-routes");
    });
    it("next-router-mock/dynamic-routes/next-13", () => {
      require("../../dynamic-routes/next-13");
    });
    it("next-router-mock/MemoryRouterProvider", () => {
      require("../../MemoryRouterProvider");
    });
    it("next-router-mock/MemoryRouterProvider/next-13", () => {
      require("../../MemoryRouterProvider/next-13");
    });
  });
});
