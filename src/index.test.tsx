import { useRouterTests } from "./useMemoryRouter.test";

import router, { MemoryRouter, useRouter, withRouter } from "./index";

describe("next-overridable-hook", () => {
  it("should export a default router", () => {
    expect(router).toBeInstanceOf(MemoryRouter);
    expect(useRouter).toBeInstanceOf(Function);
    expect(withRouter).toBeInstanceOf(Function);
  });

  it("the router should have several default properties set", () => {
    expect(router).toEqual({
      // Ignore these:
      events: expect.any(Object),
      async: expect.any(Boolean),
      push: expect.any(Function),
      replace: expect.any(Function),
      setCurrentUrl: expect.any(Function),
      registerPaths: expect.any(Function),
      // Ensure the router has exactly these properties:
      asPath: "",
      basePath: "",
      hash: "",
      isFallback: false,
      isLocaleDomain: false,
      isPreview: false,
      isReady: true,
      locale: undefined,
      locales: [],
      pathname: "",
      query: {},
      route: "",
    });
  });

  describe("useRouter", () => {
    useRouterTests(router, useRouter);
  });
});
