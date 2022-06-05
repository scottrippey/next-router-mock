describe(`next version ${require("next/package.json").version}`, () => {
  describe("import paths are valid", () => {
    it("next-router-mock/dynamic-routes", () => {
      require("../../dynamic-routes");
    });
    it("next-router-mock/dynamic-routes/next-11", () => {
      require("../../dynamic-routes/next-11");
    });
    it("next-router-mock/MemoryRouterProvider/next-11", () => {
      require("../../MemoryRouterProvider/next-11");
    });
  });
});
