import { useRouterTests } from "./useMemoryRouter.test";

import router, { MemoryRouter, useRouter, withRouter } from "./async";

describe("next-overridable-hook/async", () => {
  it("should export a default router", () => {
    expect(router).toBeInstanceOf(MemoryRouter);
    expect(useRouter).toBeInstanceOf(Function);
    expect(withRouter).toBeInstanceOf(Function);
  });

  describe("useRouter", () => {
    useRouterTests(router, useRouter);
  });
});
