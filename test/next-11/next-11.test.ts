// Validate our types are exported correctly:
import type { memoryRouter } from "next-router-mock";
import type { memoryRouter as ___ } from "next-router-mock/async";
import type { createDynamicRouteParser } from "next-router-mock/dynamic-routes";
import type { createDynamicRouteParser as _ } from "next-router-mock/dynamic-routes/next-11";
import type { MemoryRouterProvider } from "next-router-mock/MemoryRouterProvider";
import type { MemoryRouterProvider as __ } from "next-router-mock/MemoryRouterProvider/next-11";

describe(`next version ${require("next/package.json").version}`, () => {
  describe("automatic and explicit import paths are valid", () => {
    it("next-router-mock/dynamic-routes", () => {
      require("next-router-mock/dynamic-routes");
    });
    it("next-router-mock/dynamic-routes/next-11", () => {
      require("next-router-mock/dynamic-routes/next-11");
    });
    it("next-router-mock/MemoryRouterProvider", () => {
      require("next-router-mock/MemoryRouterProvider");
    });
    it("next-router-mock/MemoryRouterProvider/next-11", () => {
      require("next-router-mock/MemoryRouterProvider/next-11");
    });
  });
});
