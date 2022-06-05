describe(`next version ${require("next/package.json").version}`, () => {
  describe("import paths are valid", () => {
    it("next-router-mock/dynamic-routes", () => {
      require("../../dynamic-routes");
    });
    it("next-router-mock/dynamic-routes/next-12", () => {
      require("../../dynamic-routes/next-12");
    });
    it("next-router-mock/MemoryRouterProvider", () => {
      require("../../MemoryRouterProvider");
    });
    it("next-router-mock/MemoryRouterProvider/next-12", () => {
      require("../../MemoryRouterProvider/next-12");
    });
  });
});
