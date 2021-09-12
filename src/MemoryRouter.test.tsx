import { MemoryRouter } from "./MemoryRouter";

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

      describe("routeChangeStart and routeChangeComplete events", () => {
        const routeChangeStart = jest.fn();
        const routeChangeComplete = jest.fn();
        beforeAll(() => {
          memoryRouter.events.on("routeChangeStart", routeChangeStart);
          memoryRouter.events.on("routeChangeComplete", routeChangeComplete);
        });
        afterAll(() => {
          memoryRouter.events.off("routeChangeStart", routeChangeStart);
          memoryRouter.events.off("routeChangeComplete", routeChangeComplete);
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

        if (async) {
          it("should both be triggered in the correct async order", async () => {
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
    });
  });
});
