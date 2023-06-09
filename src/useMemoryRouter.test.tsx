import { useEffect, useRef } from "react";
import { act, renderHook } from "@testing-library/react";

import { MemoryRouter, MemoryRouterSnapshot } from "./MemoryRouter";
import { useMemoryRouter } from "./useMemoryRouter";

export function useRouterTests(singletonRouter: MemoryRouter, useRouter: () => MemoryRouterSnapshot) {
  it("the useRouter hook only returns a snapshot of the singleton router", async () => {
    const { result } = renderHook(() => useRouter());

    expect(result.current).not.toBe(singletonRouter);
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
  });

  it('"push" will cause a rerender with the new route', async () => {
    const { result } = renderHook(() => useRouter());

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
  });

  it('changing just the "hash" will cause a rerender', async () => {
    const { result } = renderHook(() => useRouter());

    await act(async () => {
      await result.current.push("/foo");
      await result.current.push("/foo#bar");
    });
    const expected = {
      asPath: "/foo#bar",
      pathname: "/foo",
      hash: "#bar",
    };
    expect(singletonRouter).toMatchObject(expected);
    expect(result.current).toMatchObject(expected);
  });

  it('calling "push" multiple times will rerender with the correct route', async () => {
    const { result } = renderHook(() => useRouter());

    // Push using the router instance:
    await act(async () => {
      result.current.push("/one");
      result.current.push("/two");
      await result.current.push("/three");
    });

    expect(result.current).toMatchObject({
      asPath: "/three",
    });

    // Push using the singleton router:
    await act(async () => {
      singletonRouter.push("/four");
      singletonRouter.push("/five");
      await singletonRouter.push("/six");
    });
    expect(result.current).toMatchObject({
      asPath: "/six",
    });

    // Push using the router instance (again):
    await act(async () => {
      result.current.push("/seven");
      result.current.push("/eight");
      await result.current.push("/nine");
    });

    expect(result.current).toMatchObject({
      asPath: "/nine",
    });
  });

  it("the singleton and the router instances can be used interchangeably", async () => {
    const { result } = renderHook(() => useRouter());
    await act(async () => {
      await result.current.push("/one");
    });
    expect(result.current).toMatchObject({ asPath: "/one" });
    expect(result.current).toMatchObject(singletonRouter);

    await act(async () => {
      await result.current.push("/two");
    });
    expect(result.current).toMatchObject({ asPath: "/two" });
    expect(result.current).toMatchObject(singletonRouter);

    await act(async () => {
      await singletonRouter.push("/three");
    });
    expect(result.current).toMatchObject({ asPath: "/three" });
    expect(result.current).toMatchObject(singletonRouter);
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
