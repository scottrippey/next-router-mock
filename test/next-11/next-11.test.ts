// Validate our types are exported correctly:
import type { createDynamicRouteParser } from "../../dynamic-routes";
import type { createDynamicRouteParser as _ } from "../../dynamic-routes/next-11";
import type { MemoryRouterProvider } from "../../MemoryRouterProvider";
import type { MemoryRouterProvider as __ } from "../../MemoryRouterProvider/next-11";

describe(`next version ${require("next/package.json").version}`, () => {
  describe("automatic and explicit import paths are valid", () => {
    it("next-router-mock/dynamic-routes", () => {
      require("../../dynamic-routes");
    });
    it("next-router-mock/dynamic-routes/next-11", () => {
      require("../../dynamic-routes/next-11");
    });
    it("next-router-mock/MemoryRouterProvider", () => {
      require("../../MemoryRouterProvider");
    });
    it("next-router-mock/MemoryRouterProvider/next-11", () => {
      require("../../MemoryRouterProvider/next-11");
    });
  });
});
