import { act, renderHook } from "@testing-library/react-hooks";
import router, { useRouter } from "./router";
import { MemoryRouter } from "./MemoryRouter";

describe("router", () => {
  it("should export a default router", () => {
    expect(router).toBeInstanceOf(MemoryRouter);
  });

  describe("useRouter", () => {
    it("the useRouter hook should return the same instance of the router", async () => {
      const { result } = renderHook(() => useRouter());

      expect(result.current).toBe(router);
    });

    it('"push" will cause a rerender with the new route', async () => {
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
