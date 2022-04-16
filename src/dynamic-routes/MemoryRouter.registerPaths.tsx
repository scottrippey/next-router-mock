import { MemoryRouter, UrlObjectComplete } from "../MemoryRouter";

declare module "../MemoryRouter" {
  interface MemoryRouter {
    /**
     * Manually registers the paths in your "pages" folder, including slugs,
     * so that static and dynamic routes are parsed correctly.
     *
     * @example
     * import mockRouter from "next-router-mock";
     * import "next-router-mock/dynamic-routes";
     *
     * mockRouter.registerPaths([
     *   // These paths should match those found in the `/pages` folder:
     *   "/[id]",
     *   "/static/path",
     *   "/[dynamic]/path",
     *   "/[...catchAll]/path"
     * ]);
     *
     */
    registerPaths(paths: string[]): void;
  }
}

// The only difference between Next 10/11 is the import path, so we abstract them:
type AbstractedNextDependencies = Pick<
  typeof import("next/dist/shared/lib/router/utils"),
  "getSortedRoutes" | "getRouteMatcher" | "getRouteRegex" | "isDynamicRoute"
> &
  Pick<typeof import("next/dist/server/normalize-page-path"), "normalizePagePath">;

export function defineRegisterPaths({
  getSortedRoutes,
  getRouteMatcher,
  getRouteRegex,
  isDynamicRoute,
  normalizePagePath,
}: AbstractedNextDependencies) {
  MemoryRouter.prototype.registerPaths = function (paths: string[]) {
    this.pathParser = createPathParserFromPaths(paths);
  };

  const createPathParserFromPaths = (paths: string[]) => {
    const matchers = getSortedRoutes(paths.map((path) => normalizePagePath(path))).map((path: string) => ({
      pathname: path,
      match: getRouteMatcher(getRouteRegex(path)),
    }));

    return (url: UrlObjectComplete): UrlObjectComplete => {
      const pathname = url.pathname ?? "";
      const isDynamic = isDynamicRoute(pathname);
      // @ts-ignore
      const matcher = matchers.find((matcher) => !!matcher.match(pathname));
      const match = matcher ? matcher.match(pathname) : false;

      // When pushing to a dynamic route with un-interpolated slugs passed in the pathname, the assumption is that
      // a query dictionary will be provided, so instead of using the match we interpolate the route from
      // the provided query
      const parsedQuery = isDynamic ? url.query : match ? match : {};

      return {
        ...url,
        pathname: matcher?.pathname ?? pathname,
        query: { ...url.query, ...parsedQuery },
      };
    };
  };
}
