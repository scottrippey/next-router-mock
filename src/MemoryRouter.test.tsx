import { MemoryRouter } from "./MemoryRouter";

describe("MemoryRouter", () => {
  const memoryRouter = new MemoryRouter();
  function currentRoute() {
    const { pathname, query, asPath } = memoryRouter;

    return { pathname, query, asPath };
  }

  it("should start empty", () => {
    expect(currentRoute()).toMatchInlineSnapshot(`
      Object {
        "asPath": "",
        "pathname": "",
        "query": Object {},
      }
    `);
  });
  it("pushing URLs should update the route", () => {
    memoryRouter.push(`/one/two/three`);
    expect(currentRoute()).toMatchInlineSnapshot(`
      Object {
        "asPath": "/one/two/three",
        "pathname": "/one/two/three",
        "query": Object {},
      }
    `);

    memoryRouter.push(`/one/two/three?four=4&five=`);
    expect(currentRoute()).toMatchInlineSnapshot(`
      Object {
        "asPath": "/one/two/three?four=4&five=",
        "pathname": "/one/two/three",
        "query": Object {
          "five": "",
          "four": "4",
        },
      }
    `);
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
    expect(currentRoute()).toMatchInlineSnapshot(`
      Object {
        "asPath": "/one",
        "pathname": "/one",
        "query": Object {},
      }
    `);

    memoryRouter.push({
      pathname: "/one/two/three",
      query: { four: "4", five: "" },
    });
    expect(currentRoute()).toMatchInlineSnapshot(`
      Object {
        "asPath": "/one/two/three?four=4&five=",
        "pathname": "/one/two/three",
        "query": Object {
          "five": "",
          "four": "4",
        },
      }
    `);
  });
  it("pushing UrlObjects should inject slugs", () => {
    memoryRouter.push({ pathname: "/one/[id]", query: { id: "two" } });
    expect(currentRoute()).toMatchInlineSnapshot(`
      Object {
        "asPath": "/one/two",
        "pathname": "/one/[id]",
        "query": Object {
          "id": "two",
        },
      }
    `);

    memoryRouter.push({ pathname: "/one/[id]/three", query: { id: "two" } });
    expect(currentRoute()).toMatchInlineSnapshot(`
      Object {
        "asPath": "/one/two/three",
        "pathname": "/one/[id]/three",
        "query": Object {
          "id": "two",
        },
      }
    `);

    memoryRouter.push({
      pathname: "/one/[id]/three",
      query: { id: "two", four: "4" },
    });
    expect(currentRoute()).toMatchInlineSnapshot(`
      Object {
        "asPath": "/one/two/three?four=4",
        "pathname": "/one/[id]/three",
        "query": Object {
          "four": "4",
          "id": "two",
        },
      }
    `);
    memoryRouter.push({
      pathname: "/one/[id]/three/[four]",
      query: { id: "two", four: "4" },
    });
    expect(currentRoute()).toMatchInlineSnapshot(`
      Object {
        "asPath": "/one/two/three/4",
        "pathname": "/one/[id]/three/[four]",
        "query": Object {
          "four": "4",
          "id": "two",
        },
      }
    `);
  });
});
