import mockRouter from "../..";
import "../../dynamic-routes/next-12";

describe("dynamic-routes", () => {
  it('should have a valid "registerPaths" method ', () => {
    expect(mockRouter.registerPaths).toBeInstanceOf(Function);
  });
});
