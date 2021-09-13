import { useEffect, useRef } from "react";
import { act, renderHook } from "@testing-library/react-hooks";

import { MemoryRouter } from "./MemoryRouter";
import { useMemoryRouter } from "./useMemoryRouter";

export function useRouterTests(
  router: MemoryRouter,
  useRouter: () => MemoryRouter
) {
  it("the useRouter hook initially returns the same instance of the router", async () => {
    const { result } = renderHook(() => useRouter());

    expect(result.current).toBe(router);
  });

  it("will allow capturing previous route values in hooks with routing events", async () => {
    // see: https://github.com/streamich/react-use/blob/master/src/usePrevious.ts
    const usePrevious = function <T>(value: T): T | undefined {
      const previous = useRef<T>();

      useEffect(() => {
        previous.current = value;
      });

      return previous.current;
    };

    const renderSpy = jest.fn();

    const useRouterWithPrevious = () => {
      const { asPath } = useRouter();
      const previousAsPath = usePrevious(asPath);

      useEffect(() => {
        renderSpy();
      });

      return [previousAsPath, asPath];
    };

    // Set initial state:
    router.setCurrentUrl("/foo");

    const { result } = renderHook(() => useRouterWithPrevious());

    expect(result.current).toEqual([undefined, "/foo"]);

    await act(async () => {
      await router.push("/foo?bar=baz");
    });

    expect(result.current).toEqual(["/foo", "/foo?bar=baz"]);
    expect(result.all).toHaveLength(2);

    await act(async () => {
      await router.push("/foo?joe=doe");
    });

    expect(result.current).toEqual(["/foo?bar=baz", "/foo?joe=doe"]);
    expect(result.all).toHaveLength(3);
    // Only 3 changes have happened to the router,
    // so the spy should be called exactly 3 times.
    expect(renderSpy).toHaveBeenCalledTimes(3);
  });

  it('"push" will cause a rerender with the new route', async () => {
    const renderSpy = jest.fn();

    const { result } = renderHook(() => {
      const router = useRouter();
      // track how many times the hook does a render pass
      // by spying on a `useEffect` with no dependencies
      useEffect(() => {
        renderSpy();
      });

      return router;
    });

    expect(result.current).toBe(router);

    await act(async () => {
      await result.current.push("/foo?bar=baz");
    });

    expect(result.current).toEqual(router);
    expect(result.current).toMatchObject({
      asPath: "/foo?bar=baz",
      pathname: "/foo",
      query: { bar: "baz" }
    });

    // Ensure only 2 renders happened:
    expect(result.all).toHaveLength(2);

    await act(async () => {
      await result.current.push("/foo?joe=doe");
    });

    expect(result.current).toEqual(router);
    expect(result.current).toMatchObject({
      asPath: "/foo?joe=doe",
      pathname: "/foo",
      query: { joe: "doe" }
    });

    expect(result.all).toHaveLength(3);
    // Only 3 changes have happened to the router,
    // so the spy should be called exactly 3 times.
    expect(renderSpy).toHaveBeenCalledTimes(3);
  });

  it("support the locales and locale properties", async () => {
    const { result } = renderHook(() => useRouter());
    expect(result.current.locale).toBe(undefined);
    expect(result.current.locales).toEqual([]);

    await act(async () => {
      await result.current.push("/", undefined, { locale: "en" });
    });
    expect(result.current.locale).toBe("en");
  });
}

describe("useMemoryRouter", () => {
  const router = new MemoryRouter();
  const useRouter = () => useMemoryRouter(router);
  useRouterTests(router, useRouter);
});
