import { useEffect, useRef } from "react";
import { act, renderHook } from "@testing-library/react-hooks";

import { MemoryRouter } from "./MemoryRouter";
import { useMemoryRouter } from "./useMemoryRouter";

export function useRouterTests(singletonRouter: MemoryRouter, useRouter: () => Readonly<MemoryRouter>) {
  it("the useRouter hook initially returns the same instance of the router", async () => {
    const { result } = renderHook(() => useRouter());

    expect(result.current).toBe(singletonRouter);
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

    const useRouterWithPrevious = () => {
      const { asPath } = useRouter();
      const previousAsPath = usePrevious(asPath);

      return [previousAsPath, asPath];
    };

    // Set initial state:
    singletonRouter.setCurrentUrl("/foo");

    const { result } = renderHook(() => useRouterWithPrevious());

    expect(result.current).toEqual([undefined, "/foo"]);

    await act(async () => {
      await singletonRouter.push("/foo?bar=baz");
    });

    expect(result.current).toEqual(["/foo", "/foo?bar=baz"]);
    expect(result.all).toHaveLength(2);
  });

  it('"push" will cause a rerender with the new route', async () => {
    const { result } = renderHook(() => useRouter());

    expect(result.current).toBe(singletonRouter);

    await act(async () => {
      await result.current.push("/foo?bar=baz");
    });

    expect(result.current).not.toBe(singletonRouter);
    expect(result.current).toEqual(singletonRouter);
    expect(result.current).toMatchObject({
      asPath: "/foo?bar=baz",
      pathname: "/foo",
      query: { bar: "baz" },
    });

    // Ensure only 2 renders happened:
    expect(result.all).toHaveLength(2);
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
  const singletonRouter = new MemoryRouter();
  const useRouter = () => useMemoryRouter(singletonRouter);
  useRouterTests(singletonRouter, useRouter);
});
