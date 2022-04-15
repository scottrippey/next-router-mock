import { MemoryRouter } from "./MemoryRouter";
import "./dynamic-routes/extensions-11.1";

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

      describe("dynamic paths", () => {
        it("when dynamic path registered will parse variables from slug", async () => {
          memoryRouter.registerPaths(["/entity/[id]/attribute/[name]", "/[...slug]"]);

          await memoryRouter.push("/entity/101/attribute/everything");
          expect(memoryRouter).toMatchObject({
            pathname: "/entity/[id]/attribute/[name]",
            asPath: "/entity/101/attribute/everything",
            query: {
              id: "101",
              name: "everything",
            },
          });
        });

        it("when catch-all dynamic path registered will parse variables from slug", async () => {
          memoryRouter.registerPaths(["/entity/[id]/attribute/[name]", "/[...slug]"]);

          await memoryRouter.push("/one/two/three");
          expect(memoryRouter).toMatchObject({
            pathname: "/[...slug]",
            asPath: "/one/two/three",
            query: {
              slug: ["one", "two", "three"],
            },
          });
        });

        it("when no dynamic path matches, will not parse query from slug", async () => {
          memoryRouter.registerPaths(["/entity/[id]/attribute/[name]"]);

          await memoryRouter.push("/one/two/three");
          expect(memoryRouter).toMatchObject({
            pathname: "/one/two/three",
            asPath: "/one/two/three",
            query: {},
          });
        });

        it("when both dynamic and static path matches, will use static path", async () => {
          memoryRouter.registerPaths(["/entity/[id]", "/entity/list"]);

          await memoryRouter.push("/entity/list");
          expect(memoryRouter).toMatchObject({
            pathname: "/entity/list",
            asPath: "/entity/list",
            query: {},
          });
        });

        it("when query param matches path param, path param will take precedence", async () => {
          memoryRouter.registerPaths(["/entity/[id]"]);

          await memoryRouter.push("/entity/100?id=500");

          expect(memoryRouter).toMatchObject({
            pathname: "/entity/[id]",
            query: { id: "100" },
            asPath: "/entity/100?id=500",
          });
        });

        it("when slug passed in pathname, pathname should be set to route and asPath interpolated from query", async () => {
          memoryRouter.registerPaths(["/entity/[id]"]);

          await memoryRouter.push({ pathname: "/entity/[id]", query: { id: "42" } });

          expect(memoryRouter).toMatchObject({
            pathname: "/entity/[id]",
            asPath: "/entity/42",
            query: { id: "42" },
          });
        });

        it("when slug passed in pathname with additional query params, asPath should have query string", async () => {
          memoryRouter.registerPaths(["/entity/[id]"]);

          await memoryRouter.push({ pathname: "/entity/[id]", query: { id: "42", filter: "abc" } });

          expect(memoryRouter).toMatchObject({
            pathname: "/entity/[id]",
            asPath: "/entity/42?filter=abc",
            query: { id: "42", filter: "abc" },
          });
        });

        it("will properly interpolate catch-all routes from the pathname", async () => {
          memoryRouter.registerPaths(["/[...slug]"]);

          await memoryRouter.push({ pathname: "/[...slug]", query: { slug: ["one", "two", "three"] } });

          expect(memoryRouter).toMatchObject({
            pathname: "/[...slug]",
            asPath: "/one/two/three",
            query: { slug: ["one", "two", "three"] },
          });
        });

        it("with dynamic routes, will properly generate asPath when passed in query dictionary", async () => {
          memoryRouter.registerPaths(["/entity/[id]"]);

          await memoryRouter.push({ pathname: "/entity/100", query: { filter: "abc", max: "1000" } });

          expect(memoryRouter).toMatchObject({
            pathname: "/entity/[id]",
            asPath: "/entity/100?filter=abc&max=1000",
            query: { id: "100", filter: "abc", max: "1000" },
          });
        });

        it("will properly interpolate optional catch-all routes from the pathname", async () => {
          memoryRouter.registerPaths(["/one/two/[[...slug]]"]);

          await memoryRouter.push("/one/two/three/four");

          expect(memoryRouter).toMatchObject({
            pathname: "/one/two/[[...slug]]",
            asPath: "/one/two/three/four",
            query: { slug: ["three", "four"] },
          });
        });

        it("will match route with optional catch-all omitted", async () => {
          memoryRouter.registerPaths(["/entity/[id]/[[...slug]]"]);

          await memoryRouter.push("/entity/42");

          expect(memoryRouter).toMatchObject({
            pathname: "/entity/[id]/[[...slug]]",
            asPath: "/entity/42",
            query: { id: "42" },
          });
        });
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

      const testCases = ["(without parser)", "(with parser)"] as const;
      it.each(testCases)("hashes are preserved %s", async (withParser) => {
        if (withParser === "(with parser)") {
          memoryRouter.registerPaths(["/path"]);
        } else {
          memoryRouter.pathParser = undefined;
        }

        memoryRouter.setCurrentUrl("/path#hash");
        expect(memoryRouter).toMatchObject({
          asPath: "/path#hash",
          pathname: "/path",
        });

        memoryRouter.setCurrentUrl("/path?key=value#hash");
        expect(memoryRouter).toMatchObject({
          asPath: "/path?key=value#hash",
          pathname: "/path",
          query: { key: "value" },
        });
      });
    });
  });
});
