describe(`next version ${require("next/package.json").version}`, () => {
  describe("import paths are valid", () => {
    it("next-router-mock/dynamic-routes", () => {
      require("../../dynamic-routes");
    });
    it("next-router-mock/dynamic-routes/next-10", () => {
      require("../../dynamic-routes/next-10");
    });
    it("next-router-mock/MemoryRouterProvider", () => {
      require("../../MemoryRouterProvider");
    });
    it("next-router-mock/MemoryRouterProvider/next-10", () => {
      require("../../MemoryRouterProvider/next-10");
    });
  });
});
