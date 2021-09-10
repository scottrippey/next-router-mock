import { act, renderHook } from "@testing-library/react-hooks";
import router, { useRouter } from "./router";
import { MemoryRouter } from "./MemoryRouter";
import { useEffect, useRef } from "react";

describe("router", () => {
  it("should export a default router", () => {
    expect(router).toBeInstanceOf(MemoryRouter);
  });

  describe("useRouter", () => {
    it("the useRouter hook should return the same instance of the router", async () => {
      const { result } = renderHook(() => useRouter());

      expect(result.current).toBe(router);
    });

    it("will allow capturing previous route values in hooks with routing events", async () => {
      const mockOnRouteChange = jest.fn();

      // see: https://github.com/streamich/react-use/blob/master/src/usePrevious.ts
      const usePrevious = function <T>(value: T): T | undefined {
        const previous = useRef<T>();

        useEffect(() => {
          previous.current = value;
        });

        return previous.current;
      };

      const useRouterWithPrevious = () => {
        const { asPath, events } = useRouter();
        const previousAsPath = usePrevious(asPath);

        useEffect(() => {
          const handleRouteChangeComplete = (nextUrl: string) =>
            mockOnRouteChange(previousAsPath, nextUrl);

          events.on("routeChangeComplete", handleRouteChangeComplete);

          return () => {
            events.off("routeChangeComplete", handleRouteChangeComplete);
          };
        }, [previousAsPath, events]);

        return router;
      };

      // Push initial state
      await router.push('/foo');

      const { result } = renderHook(() => useRouterWithPrevious());

      await act(async () => {
        await result.current.push("/foo?bar=baz");
      });

      expect(mockOnRouteChange).toHaveBeenCalledWith("/foo", "/foo?bar=baz");
    });

    it('"push" will cause a rerender on routeChangeComplete with the new route', async () => {
      const { result } = renderHook(() => useRouter());

      expect(result.current).toBe(router);

      await act(async () => {
        await result.current.push("/foo?bar=baz");
      });

      expect(result.current).not.toBe(router);
      expect(result.current).toMatchObject({
        asPath: "/foo?bar=baz",
        pathname: "/foo",
        query: { bar: "baz" },
      });
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
  });
});
