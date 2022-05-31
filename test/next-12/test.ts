describe(`next version ${require("next/package.json").version}`, () => {
  describe("next-router-mock/dynamic-routes/next-12", () => {
    it("paths are valid", () => {
      require("../../dynamic-routes/next-12");
    });
  });
  describe("next-router-mock/MemoryRouterProvider/next-12", () => {
    it("paths are valid", () => {
      require("../../MemoryRouterProvider/next-12");
    });
  });
});
