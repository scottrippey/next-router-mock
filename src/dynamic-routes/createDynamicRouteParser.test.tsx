import { MemoryRouter } from "../MemoryRouter";
import { createDynamicRouteParser } from "./next-12";
import { expectMatch } from "../../test/test-utils";

describe("dynamic routes", () => {
  let memoryRouter: MemoryRouter;
  beforeEach(() => {
    memoryRouter = new MemoryRouter();
  });

  it("when dynamic path registered will parse variables from slug", () => {
    memoryRouter.useParser(createDynamicRouteParser(["/entity/[id]/attribute/[name]", "/[...slug]"]));

    memoryRouter.push("/entity/101/attribute/everything");
    expectMatch(memoryRouter, {
      pathname: "/entity/[id]/attribute/[name]",
      asPath: "/entity/101/attribute/everything",
      query: {
        id: "101",
        name: "everything",
      },
    });
  });

  it("when catch-all dynamic path registered will parse variables from slug", () => {
    memoryRouter.useParser(createDynamicRouteParser(["/entity/[id]/attribute/[name]", "/[...slug]"]));

    memoryRouter.push("/one/two/three");
    expectMatch(memoryRouter, {
      pathname: "/[...slug]",
      asPath: "/one/two/three",
      query: {
        slug: ["one", "two", "three"],
      },
    });
  });

  it("when no dynamic path matches, will not parse query from slug", () => {
    memoryRouter.useParser(createDynamicRouteParser(["/entity/[id]/attribute/[name]"]));

    memoryRouter.push("/one/two/three");
    expectMatch(memoryRouter, {
      pathname: "/one/two/three",
      asPath: "/one/two/three",
      query: {},
    });
  });

  it("when both dynamic and static path matches, will use static path", () => {
    memoryRouter.useParser(createDynamicRouteParser(["/entity/[id]", "/entity/list"]));

    memoryRouter.push("/entity/list");
    expectMatch(memoryRouter, {
      pathname: "/entity/list",
      asPath: "/entity/list",
      query: {},
    });
  });

  it("when query param matches path param, path param will take precedence", () => {
    memoryRouter.useParser(createDynamicRouteParser(["/entity/[id]"]));

    memoryRouter.push("/entity/100?id=500");

    expectMatch(memoryRouter, {
      asPath: "/entity/100?id=500",
      pathname: "/entity/[id]",
      query: { id: "100" },
    });
  });

  it("when slug passed in pathname, pathname should be set to route and asPath interpolated from query", () => {
    memoryRouter.useParser(createDynamicRouteParser(["/entity/[id]"]));

    memoryRouter.push({ pathname: "/entity/[id]", query: { id: "42" } });

    expectMatch(memoryRouter, {
      pathname: "/entity/[id]",
      asPath: "/entity/42",
      query: { id: "42" },
    });
  });

  it("when slug passed in pathname with additional query params, asPath should have query string", () => {
    memoryRouter.useParser(createDynamicRouteParser(["/entity/[id]"]));

    memoryRouter.push({ pathname: "/entity/[id]", query: { id: "42", filter: "abc" } });

    expectMatch(memoryRouter, {
      pathname: "/entity/[id]",
      asPath: "/entity/42?filter=abc",
      query: { id: "42", filter: "abc" },
    });
  });

  it("will properly interpolate catch-all routes from the pathname", () => {
    memoryRouter.useParser(createDynamicRouteParser(["/[...slug]"]));

    memoryRouter.push({ pathname: "/[...slug]", query: { slug: ["one", "two", "three"] } });

    expectMatch(memoryRouter, {
      pathname: "/[...slug]",
      asPath: "/one/two/three",
      query: { slug: ["one", "two", "three"] },
    });
  });

  it("with dynamic routes, will properly generate asPath when passed in query dictionary", () => {
    memoryRouter.useParser(createDynamicRouteParser(["/entity/[id]"]));

    memoryRouter.push({ pathname: "/entity/100", query: { filter: "abc", max: "1000" } });

    expectMatch(memoryRouter, {
      pathname: "/entity/[id]",
      asPath: "/entity/100?filter=abc&max=1000",
      query: { id: "100", filter: "abc", max: "1000" },
    });
  });

  it("will properly interpolate optional catch-all routes from the pathname", () => {
    memoryRouter.useParser(createDynamicRouteParser(["/one/two/[[...slug]]"]));

    memoryRouter.push("/one/two/three/four");

    expectMatch(memoryRouter, {
      pathname: "/one/two/[[...slug]]",
      asPath: "/one/two/three/four",
      query: { slug: ["three", "four"] },
    });
  });

  it("will match route with optional catch-all omitted", () => {
    memoryRouter.useParser(createDynamicRouteParser(["/entity/[id]/[[...slug]]"]));

    memoryRouter.push("/entity/42");

    expectMatch(memoryRouter, {
      pathname: "/entity/[id]/[[...slug]]",
      asPath: "/entity/42",
      query: { id: "42" },
    });
  });

  describe('the "as" parameter', () => {
    beforeEach(() => {
      memoryRouter.useParser(createDynamicRouteParser(["/path/[testParam]"]));
    });
    it('uses "as" path param with a dynamic route', async () => {
      memoryRouter.push("/path/[testParam]", "/path/456");
      expectMatch(memoryRouter, {
        asPath: "/path/456",
        pathname: "/path/[testParam]",
        query: {
          testParam: "456",
        },
      });
    });
    it('uses "as" path param over "url" path param', async () => {
      // This actually doesn't work well in Next, it forces a page refresh
      memoryRouter.push("/path/123", "/path/456");
      expectMatch(memoryRouter, {
        asPath: "/path/456",
        pathname: "/path/[testParam]",
        query: {
          testParam: "456",
        },
      });
    });
    it("merges the real query params with the route params", () => {
      memoryRouter.push(
        {
          pathname: "/path/[testParam]",
          query: { param: "href" },
        },
        "/path/456"
      );
      expectMatch(memoryRouter, {
        asPath: "/path/456",
        pathname: "/path/[testParam]",
        query: {
          param: "href",
          testParam: "456",
        },
      });
    });
  });

  it("hashes are preserved", async () => {
    memoryRouter.useParser(createDynamicRouteParser(["/entity/[id]"]));

    memoryRouter.setCurrentUrl("/entity/42#hash");
    expectMatch(memoryRouter, {
      asPath: "/entity/42#hash",
      pathname: "/entity/[id]",
      hash: "#hash",
    });

    memoryRouter.setCurrentUrl("/entity/42?key=value#hash");
    expectMatch(memoryRouter, {
      asPath: "/entity/42?key=value#hash",
      pathname: "/entity/[id]",
      query: { key: "value", id: "42" },
      hash: "#hash",
    });
  });
});
