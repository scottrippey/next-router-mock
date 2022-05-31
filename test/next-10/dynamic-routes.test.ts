describe(`next version ${require("next/package.json").version}`, () => {
  describe("dynamic-routes", () => {
    it("paths are valid", () => {
      require("../../dynamic-routes/next-10");
    });
  });
});
