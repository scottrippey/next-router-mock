import { useEffect, useRef } from "react";
import { act, renderHook } from "@testing-library/react-hooks";

import { useMemoryRouter } from "./useMemoryRouter";
import { MemoryRouter } from "./MemoryRouter";

describe("router", () => {
  [{ async: false }, { async: true }].forEach(({ async }) => {
    describe(async ? "async mode" : "sync mode", () => {
      const router = new MemoryRouter();
      router.async = async;
      const useRouter = () => {
        return useMemoryRouter(router);
      };

      it("should export a default router", () => {
        expect(router).toBeInstanceOf(MemoryRouter);
      });

      describe("useRouter", () => {
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

          const useRouterWithPrevious = () => {
            const { asPath } = useRouter();
            const previousAsPath = usePrevious(asPath);

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
        });

        it('"push" will cause a rerender with the new route', async () => {
          const { result } = renderHook(() => useRouter());

          expect(result.current).toBe(router);

          await act(async () => {
            await result.current.push("/foo?bar=baz");
          });

          expect(result.current).not.toBe(router);
          expect(result.current).toEqual(router);
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
      });
    });
  });
});
