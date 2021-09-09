import { MemoryRouter } from "./MemoryRouter";

describe("MemoryRouter", () => {
  const memoryRouter = new MemoryRouter();

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

  it("pushing should trigger the routeChangeStart and routeChangeComplete events", async () => {
    const routeChangeStart = jest.fn();
    const routeChangeComplete = jest.fn();
    memoryRouter.events.on("routeChangeStart", routeChangeStart);
    memoryRouter.events.on("routeChangeComplete", routeChangeComplete);

    let promise: Promise<boolean>;

    // Push a URL:
    promise = memoryRouter.push(`/one`);
    expect(routeChangeStart).toHaveBeenCalledTimes(1);
    expect(routeChangeStart).toHaveBeenLastCalledWith("/one", {
      shallow: false,
    });
    expect(routeChangeComplete).toHaveBeenCalledTimes(0);
    await promise;
    expect(routeChangeComplete).toHaveBeenCalledTimes(1);
    expect(routeChangeComplete).toHaveBeenLastCalledWith("/one", {
      shallow: false,
    });

    // Push a URL Object, and use "shallow":
    promise = memoryRouter.push(
      { pathname: "/one/two", query: { foo: "bar" } },
      undefined,
      { shallow: true }
    );
    expect(routeChangeStart).toHaveBeenCalledTimes(2);
    expect(routeChangeStart).toHaveBeenLastCalledWith("/one/two?foo=bar", {
      shallow: true,
    });
    expect(routeChangeComplete).toHaveBeenCalledTimes(1);
    await promise;
    expect(routeChangeComplete).toHaveBeenCalledTimes(2);
    expect(routeChangeComplete).toHaveBeenLastCalledWith("/one/two?foo=bar", {
      shallow: true,
    });

    // Replace this time:
    promise = memoryRouter.replace("/one/two/three");
    expect(routeChangeStart).toHaveBeenCalledTimes(3);
    expect(routeChangeStart).toHaveBeenLastCalledWith("/one/two/three", {
      shallow: false,
    });
    expect(routeChangeComplete).toHaveBeenCalledTimes(2);
    await promise;
    expect(routeChangeComplete).toHaveBeenCalledTimes(3);
    expect(routeChangeComplete).toHaveBeenLastCalledWith("/one/two/three", {
      shallow: false,
    });

    memoryRouter.events.off("routeChangeStart", routeChangeStart);
    memoryRouter.events.off("routeChangeComplete", routeChangeComplete);
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
    await memoryRouter.push({ pathname: "/one/[id]", query: { id: "two" } });
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
