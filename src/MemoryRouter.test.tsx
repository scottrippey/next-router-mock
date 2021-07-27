import { MemoryRouter } from "./MemoryRouter";

describe("MemoryRouter", () => {
  const memoryRouter = new MemoryRouter();

  it("should start empty", () => {
    expect(memoryRouter).toMatchObject({
      asPath: "",
      pathname: "",
      query: {},
      locale: undefined,
    })
  });
  it("pushing URLs should update the route", () => {
    memoryRouter.push(`/one/two/three`);

    expect(memoryRouter).toMatchObject({
      asPath: "/one/two/three",
      pathname: "/one/two/three",
      query: {},
    })

    memoryRouter.push(`/one/two/three?four=4&five=`);
    expect(memoryRouter).toMatchObject({
      asPath: "/one/two/three?four=4&five=",
      pathname: "/one/two/three",
      query: {
        five: "",
        four: "4",
      },
    });
  });
  it("pushing should trigger the routeChangeComplete event", () => {
    const routeChangeComplete = jest.fn();
    memoryRouter.events.on("routeChangeComplete", routeChangeComplete);

    memoryRouter.push(`/one`);
    expect(routeChangeComplete).toHaveBeenCalledTimes(1);
    memoryRouter.push(`/one/two`);
    expect(routeChangeComplete).toHaveBeenCalledTimes(2);
    memoryRouter.push({ pathname: `/one/two/three` });
    expect(routeChangeComplete).toHaveBeenCalledTimes(3);

    memoryRouter.events.off("routeChangeComplete", routeChangeComplete);
  });

  it("pushing UrlObjects should update the route", () => {
    memoryRouter.push({ pathname: "/one" });
    expect(memoryRouter).toMatchObject({
        asPath: "/one",
        pathname: "/one",
        query: {},
    });

    memoryRouter.push({
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
  it("pushing UrlObjects should inject slugs", () => {
    memoryRouter.push({ pathname: "/one/[id]", query: { id: "two" } });
    expect(memoryRouter).toMatchObject({
        asPath: "/one/two",
        pathname: "/one/[id]",
        query: {
          id: "two",
        }
    });

    memoryRouter.push({ pathname: "/one/[id]/three", query: { id: "two" } });
    expect(memoryRouter).toMatchObject({
        asPath: "/one/two/three",
        pathname: "/one/[id]/three",
        query: {
          id: "two",
        },
    });

    memoryRouter.push({
      pathname: "/one/[id]/three",
      query: { id: "two", four: "4" },
    });
    expect(memoryRouter).toMatchObject({
        asPath: "/one/two/three?four=4",
        pathname: "/one/[id]/three",
        query:  {
          four: "4",
          id: "two",
        },
    });
    memoryRouter.push({
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
  it("push the locale", () => {
    memoryRouter.push("/", undefined, { locale: "en" });
    expect(memoryRouter).toMatchObject({
        locale: "en",
    });
  })

  it('should support the locales property', () => {
    expect(memoryRouter.locales).toEqual([ ]);
  });
});
