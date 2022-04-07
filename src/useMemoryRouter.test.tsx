import "@testing-library/jest-dom"
import React from 'react';
import { useEffect, useRef } from "react";
import { act, renderHook } from "@testing-library/react-hooks";

import { MemoryRouter } from "./MemoryRouter";
import { useMemoryRouter } from "./useMemoryRouter";
import { render } from "@testing-library/react";

export function useRouterTests(singletonRouter: MemoryRouter, useRouter: () => Readonly<MemoryRouter>) {
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

    await act(async () => {
      await result.current.push("/foo?bar=baz");
    });

    expect(result.current).toEqual(singletonRouter);
    expect(result.current).toMatchObject({
      asPath: "/foo?bar=baz",
      pathname: "/foo",
      query: { bar: "baz" },
    });

    // Ensure only 2 renders happened:
    expect(result.all).toHaveLength(2);
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

  it("should preserve the router's reference, but trigger a re-render", async () => {
    singletonRouter.setCurrentUrl("/page");

    function TestComponent() {
      const router = useRouter();

      // This should not result in an infinite loop
      useEffect(() => {
        router.replace("/page?foo=bar");
      }, [router]);

      return (
        <div>{router.asPath}</div>
      )
    }

    const { findByText } = render(<TestComponent />);

    expect(await findByText('/page?foo=bar')).toBeInTheDocument();
  })
}

describe("useMemoryRouter", () => {
  const singletonRouter = new MemoryRouter();
  const useRouter = () => useMemoryRouter(singletonRouter);
  useRouterTests(singletonRouter, useRouter);
});
