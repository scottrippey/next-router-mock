import { MemoryRouter } from "./MemoryRouter";

describe("MemoryRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  [
    // Test in both sync and async modes:
    { async: false },
    { async: true },
  ].forEach(({ async }) => {
    describe(async ? "async mode" : "sync mode", () => {
      const memoryRouter = new MemoryRouter();
      memoryRouter.async = async;

      it("should start empty", async () => {
        expectMatch(memoryRouter, {
          asPath: "/",
          pathname: "/",
          route: "/",
          query: {},
          locale: undefined,
        });
      });
      it("pushing URLs should update the route", async () => {
        await memoryRouter.push("/one/two/three");

        expectMatch(memoryRouter, {
          asPath: "/one/two/three",
          pathname: "/one/two/three",
          route: "/one/two/three",
          query: {},
        });

        await memoryRouter.push("/one/two/three?four=4&five=");

        expectMatch(memoryRouter, {
          asPath: "/one/two/three?four=4&five=",
          pathname: "/one/two/three",
          query: {
            five: "",
            four: "4",
          },
        });
      });

      describe("events: routeChange and hashChange", () => {
        const routeChangeStart = jest.fn();
        const routeChangeComplete = jest.fn();
        const hashChangeStart = jest.fn();
        const hashChangeComplete = jest.fn();
        beforeAll(() => {
          memoryRouter.events.on("routeChangeStart", routeChangeStart);
          memoryRouter.events.on("routeChangeComplete", routeChangeComplete);
          memoryRouter.events.on("hashChangeStart", hashChangeStart);
          memoryRouter.events.on("hashChangeComplete", hashChangeComplete);
        });
        afterAll(() => {
          memoryRouter.events.off("routeChangeStart", routeChangeStart);
          memoryRouter.events.off("routeChangeComplete", routeChangeComplete);
          memoryRouter.events.off("hashChangeStart", hashChangeStart);
          memoryRouter.events.off("hashChangeComplete", hashChangeComplete);
        });

        it("should both be triggered when pushing a URL", async () => {
          await memoryRouter.push("/one");
          expect(routeChangeStart).toHaveBeenCalledWith("/one", {
            shallow: false,
          });
          expect(routeChangeComplete).toHaveBeenCalledWith("/one", {
            shallow: false,
          });
        });

        it("should trigger only hashEvents for /baz -> /baz#foo", async () => {
          await memoryRouter.push("/baz");
          jest.clearAllMocks();
          await memoryRouter.push("/baz#foo");
          expect(hashChangeStart).toHaveBeenCalledWith("/baz#foo", { shallow: false });
          expect(hashChangeComplete).toHaveBeenCalledWith("/baz#foo", { shallow: false });
          expect(routeChangeStart).not.toHaveBeenCalled();
          expect(routeChangeComplete).not.toHaveBeenCalled();
        });

        it("should trigger only hashEvents for /baz#foo -> /baz#foo", async () => {
          await memoryRouter.push("/baz#foo");
          jest.clearAllMocks();
          await memoryRouter.push("/baz#foo");
          expect(hashChangeStart).toHaveBeenCalledWith("/baz#foo", { shallow: false });
          expect(hashChangeComplete).toHaveBeenCalledWith("/baz#foo", { shallow: false });
          expect(routeChangeStart).not.toHaveBeenCalled();
          expect(routeChangeComplete).not.toHaveBeenCalled();
        });

        it("should trigger only hashEvents for /baz#foo -> /baz#bar", async () => {
          await memoryRouter.push("/baz#foo");
          jest.clearAllMocks();
          await memoryRouter.push("/baz#bar");
          expect(hashChangeStart).toHaveBeenCalledWith("/baz#bar", { shallow: false });
          expect(hashChangeComplete).toHaveBeenCalledWith("/baz#bar", { shallow: false });
          expect(routeChangeStart).not.toHaveBeenCalled();
          expect(routeChangeComplete).not.toHaveBeenCalled();
        });

        it("should trigger only hashEvents for /baz#foo -> /baz", async () => {
          await memoryRouter.push("/baz#foo");
          jest.clearAllMocks();
          await memoryRouter.push("/baz");
          expect(hashChangeStart).toHaveBeenCalledWith("/baz", { shallow: false });
          expect(hashChangeComplete).toHaveBeenCalledWith("/baz", { shallow: false });
          expect(routeChangeStart).not.toHaveBeenCalled();
          expect(routeChangeComplete).not.toHaveBeenCalled();
        });

        it("should trigger only routeEvents for /baz -> /baz", async () => {
          await memoryRouter.push("/baz");
          jest.clearAllMocks();
          await memoryRouter.push("/baz");
          expect(hashChangeStart).not.toHaveBeenCalled();
          expect(hashChangeComplete).not.toHaveBeenCalled();
          expect(routeChangeStart).toHaveBeenCalledWith("/baz", { shallow: false });
          expect(routeChangeComplete).toHaveBeenCalledWith("/baz", { shallow: false });
        });

        it("should trigger only routeEvents for /baz -> /foo#baz", async () => {
          await memoryRouter.push("/baz");
          jest.clearAllMocks();
          await memoryRouter.push("/foo#baz");
          expect(hashChangeStart).not.toHaveBeenCalled();
          expect(hashChangeComplete).not.toHaveBeenCalled();
          expect(routeChangeStart).toHaveBeenCalledWith("/foo#baz", { shallow: false });
          expect(routeChangeComplete).toHaveBeenCalledWith("/foo#baz", { shallow: false });
        });

        if (async) {
          it("routeChange events should be triggered in the correct async order", async () => {
            const promise = memoryRouter.push("/one/two/three");
            expect(routeChangeStart).toHaveBeenCalledWith("/one/two/three", {
              shallow: false,
            });
            expect(routeChangeComplete).not.toHaveBeenCalled();
            await promise;
            expect(routeChangeComplete).toHaveBeenCalledWith("/one/two/three", {
              shallow: false,
            });
          });
          it("hashChange events should be triggered in the correct async order", async () => {
            await memoryRouter.push("/baz");
            jest.clearAllMocks();
            const promise = memoryRouter.push("/baz#foo");
            expect(hashChangeStart).toHaveBeenCalledWith("/baz#foo", {
              shallow: false,
            });
            expect(hashChangeComplete).not.toHaveBeenCalled();
            await promise;
            expect(hashChangeComplete).toHaveBeenCalledWith("/baz#foo", {
              shallow: false,
            });
          });
        }

        it("should be triggered when pushing a URL Object", async () => {
          await memoryRouter.push({
            pathname: "/one/two",
            query: { foo: "bar" },
          });
          expect(routeChangeStart).toHaveBeenCalled();
          expect(routeChangeStart).toHaveBeenCalledWith("/one/two?foo=bar", {
            shallow: false,
          });
          expect(routeChangeComplete).toHaveBeenCalledWith("/one/two?foo=bar", {
            shallow: false,
          });
        });

        it("should be triggered when replacing", async () => {
          await memoryRouter.replace("/one/two/three");
          expect(routeChangeStart).toHaveBeenCalled();
          expect(routeChangeStart).toHaveBeenCalledWith("/one/two/three", {
            shallow: false,
          });
          expect(routeChangeComplete).toHaveBeenCalledWith("/one/two/three", {
            shallow: false,
          });
        });

        it('should provide the "shallow" value', async () => {
          await memoryRouter.push("/test", undefined, { shallow: true });
          expect(routeChangeStart).toHaveBeenCalled();
          expect(routeChangeStart).toHaveBeenCalledWith("/test", {
            shallow: true,
          });
          expect(routeChangeComplete).toHaveBeenCalledWith("/test", {
            shallow: true,
          });
        });
      });

      it("pushing UrlObjects should update the route", async () => {
        await memoryRouter.push({ pathname: "/one" });
        expectMatch(memoryRouter, {
          asPath: "/one",
          pathname: "/one",
          query: {},
        });

        await memoryRouter.push({
          pathname: "/one/two/three",
          query: { four: "4", five: "" },
        });
        expectMatch(memoryRouter, {
          asPath: "/one/two/three?four=4&five=",
          pathname: "/one/two/three",
          query: {
            five: "",
            four: "4",
          },
        });
      });
      it("pushing UrlObjects should inject slugs", async () => {
        await memoryRouter.push({
          pathname: "/one/[id]",
          query: { id: "two" },
        });
        expectMatch(memoryRouter, {
          asPath: "/one/two",
          pathname: "/one/[id]",
          query: {
            id: "two",
          },
        });

        await memoryRouter.push({
          pathname: "/one/[id]/three",
          query: { id: "two" },
        });
        expectMatch(memoryRouter, {
          asPath: "/one/two/three",
          pathname: "/one/[id]/three",
          query: {
            id: "two",
          },
        });

        await memoryRouter.push({
          pathname: "/one/[id]/three",
          query: { id: "two", four: "4" },
        });
        expectMatch(memoryRouter, {
          asPath: "/one/two/three?four=4",
          pathname: "/one/[id]/three",
          query: {
            four: "4",
            id: "two",
          },
        });
        await memoryRouter.push({
          pathname: "/one/[id]/three/[four]",
          query: { id: "two", four: "4" },
        });
        expectMatch(memoryRouter, {
          asPath: "/one/two/three/4",
          pathname: "/one/[id]/three/[four]",
          query: {
            four: "4",
            id: "two",
          },
        });
        await memoryRouter.push({
          pathname: "/one/[...slug]",
          query: { slug: ["two", "three", "four"], filter: "abc" },
        });
        expectMatch(memoryRouter, {
          asPath: "/one/two/three/four?filter=abc",
          pathname: "/one/[...slug]",
          query: {
            slug: ["two", "three", "four"],
            filter: "abc",
          },
        });
        await memoryRouter.push({
          pathname: "/one/two/[[...slug]]",
          query: { slug: ["three", "four"] },
        });
        expectMatch(memoryRouter, {
          asPath: "/one/two/three/four",
          pathname: "/one/two/[[...slug]]",
          query: { slug: ["three", "four"] },
        });
        await memoryRouter.push({
          pathname: "/one/two/[[...slug]]",
          query: {},
        });
        expectMatch(memoryRouter, {
          asPath: "/one/two",
          pathname: "/one/two/[[...slug]]",
          query: {},
        });
      });
      it("push the locale", async () => {
        await memoryRouter.push("/", undefined, { locale: "en" });
        expectMatch(memoryRouter, {
          locale: "en",
        });
      });

      it("should support the locales property", async () => {
        expect(memoryRouter.locales).toEqual([]);
        memoryRouter.locales = ["en", "fr"];
        expect(memoryRouter.locales).toEqual(["en", "fr"]);
      });

      it("prefetch should do nothing", async () => {
        expect(await memoryRouter.prefetch()).toBeUndefined();
      });

      it("trailing slashes are normalized", async () => {
        memoryRouter.setCurrentUrl("/path/");
        expectMatch(memoryRouter, {
          asPath: "/path",
          pathname: "/path",
        });

        memoryRouter.setCurrentUrl("");
        expectMatch(memoryRouter, {
          asPath: "/",
          pathname: "/",
        });
      });

      it("a single slash is preserved", async () => {
        memoryRouter.setCurrentUrl("");
        expectMatch(memoryRouter, {
          asPath: "/",
          pathname: "/",
        });

        memoryRouter.setCurrentUrl("/");
        expectMatch(memoryRouter, {
          asPath: "/",
          pathname: "/",
        });
      });

      it("multiple values can be specified for a query parameter", () => {
        memoryRouter.setCurrentUrl("/url?foo=FOO&foo=BAR");
        expectMatch(memoryRouter, {
          asPath: "/url?foo=FOO&foo=BAR",
          query: {
            foo: ["FOO", "BAR"],
          },
        });

        memoryRouter.setCurrentUrl({ pathname: "/object-notation", query: { foo: ["BAR", "BAZ"] } });
        expectMatch(memoryRouter, {
          asPath: "/object-notation?foo=BAR&foo=BAZ",
          query: { foo: ["BAR", "BAZ"] },
        });
      });

      describe('the "as" parameter', () => {
        it('works fine without "as" param', async () => {
          // Just a sanity check
          await memoryRouter.push("/path?queryParam=123");
          expectMatch(memoryRouter, {
            asPath: "/path?queryParam=123",
            pathname: "/path",
            query: { queryParam: "123" },
          });
        });

        it('works with the "as" param', async () => {
          await memoryRouter.push("/path", "/path?param=as");
          expectMatch(memoryRouter, {
            asPath: "/path?param=as",
            pathname: "/path",
            query: {},
          });

          await memoryRouter.push("/path", { pathname: "/path", query: { param: "as" } });
          expectMatch(memoryRouter, {
            asPath: "/path?param=as",
            pathname: "/path",
            query: {},
          });
        });

        it("the real query is always used", async () => {
          await memoryRouter.push("/path?queryParam=123", "/path");
          expectMatch(memoryRouter, {
            asPath: "/path",
            pathname: "/path",
            query: { queryParam: "123" },
          });

          await memoryRouter.push("/path", "/path?queryParam=123");
          expectMatch(memoryRouter, {
            asPath: "/path?queryParam=123",
            pathname: "/path",
            query: {},
          });

          await memoryRouter.push("/path?queryParam=123", "/path?differentQueryParam=456");
          expectMatch(memoryRouter, {
            asPath: "/path?differentQueryParam=456",
            pathname: "/path",
            query: { queryParam: "123" },
          });

          await memoryRouter.push("/path?queryParam=123", {
            pathname: "/path",
            query: { differentQueryParam: "456" },
          });
          expectMatch(memoryRouter, {
            asPath: "/path?differentQueryParam=456",
            pathname: "/path",
            query: { queryParam: "123" },
          });

          await memoryRouter.push({ pathname: "", query: { queryParam: "123" } }, "");
          expectMatch(memoryRouter, {
            asPath: "/",
            pathname: "/",
            query: { queryParam: "123" },
          });
        });

        it("dynamic paths get correct parameters", async () => {
          await memoryRouter.push("/[[...route]]", "/noe/two/three");
          expectMatch(memoryRouter, {
            asPath: "/one/two/three",
            pathname: "/[[...route]]",
            query: { route: ["one", "two", "three"] },
          });

          await memoryRouter.push({ pathname: "/[[...route]]", query: { param: "href" } }, "/one/two/three");
          expectMatch(memoryRouter, {
            asPath: "/one/two/three",
            pathname: "/[[...route]]",
            query: { param: "href", route: ["one", "two", "three"] },
          });
        });

        describe("when the paths don't match", () => {
          it("as path and query is used", async () => {
            await memoryRouter.push("/path?queryParam=123", "/differentPath?differentQueryParam=456");
            expectMatch(memoryRouter, {
              asPath: "/differentPath?differentQueryParam=456",
              pathname: "/differentPath",
              query: { differentQueryParam: "456" },
            });

            await memoryRouter.push("/path?queryParam=123", {
              pathname: "/differentPath",
              query: { differentQueryParam: "456" },
            });
            expectMatch(memoryRouter, {
              asPath: "/differentPath?differentQueryParam=456",
              pathname: "/differentPath",
              query: { differentQueryParam: "456" },
            });
          });
        });

        it("as param hash overrides href hash", async () => {
          await memoryRouter.push("/path", "/path#hash");
          expectMatch(memoryRouter, {
            asPath: "/path#hash",
            pathname: "/path",
            hash: "#hash",
          });

          await memoryRouter.push("/path", { pathname: "/path", hash: "#hash" });
          expectMatch(memoryRouter, {
            asPath: "/path#hash",
            pathname: "/path",
            hash: "#hash",
          });

          await memoryRouter.push("/path#originalHash", "/path#hash");
          expectMatch(memoryRouter, {
            asPath: "/path#hash",
            pathname: "/path",
            hash: "#hash",
          });

          await memoryRouter.push("/path", { pathname: "/path", hash: "#hash" });
          expectMatch(memoryRouter, { asPath: "/path#hash", pathname: "/path", hash: "#hash" });

          await memoryRouter.push("/path#originalHash", "/path");
          expectMatch(memoryRouter, { asPath: "/path", pathname: "/path", hash: "" });

          await memoryRouter.push("/path", { pathname: "/path" });
          expectMatch(memoryRouter, { asPath: "/path", pathname: "/path", hash: "" });

          await memoryRouter.push("/path#originalHash", "/differentPath");
          expectMatch(memoryRouter, {
            asPath: "/differentPath",
            pathname: "/differentPath",
            hash: "",
          });

          await memoryRouter.push("/path", { pathname: "/differentPath" });
          expectMatch(memoryRouter, {
            asPath: "/differentPath",
            pathname: "/differentPath",
            hash: "",
          });

          await memoryRouter.push("/path#originalHash", "/differentPath#hash");
          expectMatch(memoryRouter, {
            asPath: "/differentPath#hash",
            pathname: "/differentPath",
            hash: "#hash",
          });

          await memoryRouter.push("/path", { pathname: "/differentPath", hash: "#hash" });
          expectMatch(memoryRouter, {
            asPath: "/differentPath#hash",
            pathname: "/differentPath",
            hash: "#hash",
          });
        });
      });

      it("should allow deconstruction of push and replace", async () => {
        const { push, replace } = memoryRouter;
        await push("/one");
        expectMatch(memoryRouter, { asPath: "/one" });
        await replace("/two");
        expectMatch(memoryRouter, { asPath: "/two" });
      });

      it("should allow push with no path, just a query", async () => {
        await memoryRouter.push("/path");

        await memoryRouter.push({ query: { id: "42" } });

        expect(memoryRouter.asPath).toEqual("/path?id=42");
      });

      it("hashes are preserved", async () => {
        memoryRouter.setCurrentUrl("/path#hash");
        expectMatch(memoryRouter, {
          asPath: "/path#hash",
          pathname: "/path",
          hash: "#hash",
        });

        memoryRouter.setCurrentUrl("/path?key=value#hash");
        expectMatch(memoryRouter, {
          asPath: "/path?key=value#hash",
          pathname: "/path",
          query: { key: "value" },
          hash: "#hash",
        });
      });

      it('the "registerPaths" method is deprecated', async () => {
        expect(() => {
          // @ts-expect-error This should have type errors and runtime errors:
          memoryRouter.registerPaths(["path"]);
        }).toThrow("See the README for more details on upgrading.");
      });
    });
  });
});

/**
 * Performs a partial equality comparison.
 *
 * This is similar to using `toMatchObject`, but doesn't ignore missing `query: { ... }` values!
 */
function expectMatch(memoryRouter: MemoryRouter, expected: Partial<MemoryRouter>): void {
  const picked = pick(memoryRouter, Object.keys(expected) as Array<keyof MemoryRouter>);
  try {
    expect(picked).toEqual(expected);
  } catch (err: any) {
    // Ensure stack trace is accurate:
    Error.captureStackTrace(err, expectMatch);
    throw err;
  }
}
function pick<T extends object>(obj: T, keys: Array<keyof T>): T {
  const result = {} as T;
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
}
