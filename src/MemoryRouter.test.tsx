import { MemoryRouter } from "./MemoryRouter";
import { createDynamicRouteParser } from "./dynamic-routes/next-12";

describe("MemoryRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  [{ async: false }, { async: true }].forEach(({ async }) => {
    describe(async ? "async mode" : "sync mode", () => {
      const memoryRouter = new MemoryRouter();
      memoryRouter.async = async;

      it("should start empty", async () => {
        expect(memoryRouter).toMatchObject({
          asPath: "",
          pathname: "",
          query: {},
          locale: undefined,
        });
      });
      it("pushing URLs should update the route", async () => {
        await memoryRouter.push(`/one/two/three`);

        expect(memoryRouter).toMatchObject({
          asPath: "/one/two/three",
          pathname: "/one/two/three",
          query: {},
        });

        await memoryRouter.push(`/one/two/three?four=4&five=`);

        expect(memoryRouter).toMatchObject({
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

        it("should provide the 'shallow' value", async () => {
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
        expect(memoryRouter).toMatchObject({
          asPath: "/one",
          pathname: "/one",
          query: {},
        });

        await memoryRouter.push({
          pathname: "/one/two/three",
          query: { four: "4", five: "" },
        });
        expect(memoryRouter).toMatchObject({
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
        expect(memoryRouter).toMatchObject({
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
        expect(memoryRouter).toMatchObject({
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
        expect(memoryRouter).toMatchObject({
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
        expect(memoryRouter).toMatchObject({
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
        expect(memoryRouter).toMatchObject({
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
        expect(memoryRouter).toMatchObject({
          asPath: "/one/two/three/four",
          pathname: "/one/two/[[...slug]]",
          query: {},
        });
        await memoryRouter.push({
          pathname: "/one/two/[[...slug]]",
          query: {},
        });
        expect(memoryRouter).toMatchObject({
          asPath: "/one/two",
          pathname: "/one/two/[[...slug]]",
          query: {},
        });
      });
      it("push the locale", async () => {
        await memoryRouter.push("/", undefined, { locale: "en" });
        expect(memoryRouter).toMatchObject({
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

      it("trailing slashes are removed", async () => {
        memoryRouter.setCurrentUrl("/path/");
        expect(memoryRouter).toMatchObject({
          asPath: "/path",
          pathname: "/path",
        });
      });

      it("a single slash is preserved", async () => {
        memoryRouter.setCurrentUrl("/");
        expect(memoryRouter).toMatchObject({
          asPath: "/",
          pathname: "/",
        });
      });

      it("correctly uses default as param", async () => {
        memoryRouter.setCurrentUrl("/path?queryParam=123");
        expect(memoryRouter).toMatchObject({
          asPath: "/path?queryParam=123",
          pathname: "/path",
          query: { queryParam: "123" },
        });
      });

      it("uses as path param over href path param", async () => {
        const unregisterParser = memoryRouter.useParser(createDynamicRouteParser(["/path/[testParam]"]));

        memoryRouter.setCurrentUrl("/path/123", "/path/456");
        expect(memoryRouter).toMatchObject({
          asPath: "/path/456",
          pathname: "/path/[testParam]",
          query: {
            testParam: "456",
          },
        });

        // Cleanup
        unregisterParser();
      });

      it.each([
        ["/path?queryParam=123", "/path", { asPath: "/path", pathname: "/path", query: { queryParam: "123" } }],
        [
          "/path?queryParam=123",
          { pathname: "/path" },
          { asPath: "/path", pathname: "/path", query: { queryParam: "123" } },
        ],
        [
          "/path?queryParam=123",
          "/path?differentQueryParam=456",
          { asPath: "/path?differentQueryParam=456", pathname: "/path", query: { queryParam: "123" } },
        ],
        [
          "/path?queryParam=123",
          { pathname: "/path", query: { differentQueryParam: "456" } },
          { asPath: "/path?differentQueryParam=456", pathname: "/path", query: { queryParam: "123" } },
        ],
      ])("uses href query if as path equals href path", async (url, as, expectedResult) => {
        memoryRouter.setCurrentUrl(url, as);
        expect(memoryRouter).toMatchObject(expectedResult);
      });

      it.each([
        "/differentPath?differentQueryParam=456",
        { pathname: "/differentPath", query: { differentQueryParam: "456" } },
      ])("uses as path query if as path does not equal href path", async (as) => {
        memoryRouter.setCurrentUrl("/path?queryParam=123", as);
        expect(memoryRouter).toMatchObject({
          asPath: "/differentPath?differentQueryParam=456",
          pathname: "/differentPath",
          query: { differentQueryParam: "456" },
        });
      });

      it.each([
        ["/path", "/path#hash", { asPath: "/path#hash", pathname: "/path", hash: "#hash" }],
        ["/path", { pathname: "/path", hash: "#hash" }, { asPath: "/path#hash", pathname: "/path", hash: "#hash" }],
        ["/path#originalHash", "/path#hash", { asPath: "/path#hash", pathname: "/path", hash: "#hash" }],
        ["/path", { pathname: "/path", hash: "#hash" }, { asPath: "/path#hash", pathname: "/path", hash: "#hash" }],
        ["/path#originalHash", "/path", { asPath: "/path", pathname: "/path", hash: "" }],
        ["/path", { pathname: "/path" }, { asPath: "/path", pathname: "/path", hash: "" }],
        ["/path#originalHash", "/differentPath", { asPath: "/differentPath", pathname: "/differentPath", hash: "" }],
        ["/path", { pathname: "/differentPath" }, { asPath: "/differentPath", pathname: "/differentPath", hash: "" }],
        [
          "/path#originalHash",
          "/differentPath#hash",
          { asPath: "/differentPath#hash", pathname: "/differentPath", hash: "#hash" },
        ],
        [
          "/path",
          { pathname: "/differentPath", hash: "#hash" },
          { asPath: "/differentPath#hash", pathname: "/differentPath", hash: "#hash" },
        ],
      ])("hash from as param overwrites hash from path", async (url, as, expectedResult) => {
        memoryRouter.setCurrentUrl(url, as);

        expect(memoryRouter).toMatchObject(expectedResult);
      });

      it("should allow deconstruction of push and replace", async () => {
        const { push, replace } = memoryRouter;
        await push("/one");
        expect(memoryRouter).toMatchObject({ asPath: "/one" });
        await replace("/two");
        expect(memoryRouter).toMatchObject({ asPath: "/two" });
      });

      it("should allow push with no path, just a query", async () => {
        await memoryRouter.push("/path");

        await memoryRouter.push({ query: { id: "42" } });

        expect(memoryRouter.asPath).toEqual("/path?id=42");
      });

      it("hashes are preserved", async () => {
        memoryRouter.setCurrentUrl("/path#hash");
        expect(memoryRouter).toMatchObject({
          asPath: "/path#hash",
          pathname: "/path",
          hash: "#hash",
        });

        memoryRouter.setCurrentUrl("/path?key=value#hash");
        expect(memoryRouter).toMatchObject({
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
