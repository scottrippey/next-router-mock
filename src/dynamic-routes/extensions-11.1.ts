import { UrlObject, MemoryRouter } from "../MemoryRouter";
import { getRouteMatcher, getRouteRegex, getSortedRoutes, isDynamicRoute } from "next/dist/shared/lib/router/utils";
import { normalizePagePath } from "next/dist/server/normalize-page-path";
import "./path-parser";

/*

  These lines left blank
  so that formatting will be
  identical to ./extensions-10.ts

*/

declare module "../MemoryRouter" {
  interface MemoryRouter {
    registerPaths(paths: string[]): void;
  }
}

/**
 * Register URL paths with the router; this can include any static and dynamic paths your app might use.
 * Any provided dynamic paths will have their slugs parsed and added to the ParsedUrlQuery on the router
 * when a route is pushed.
 */
MemoryRouter.prototype.registerPaths = function (paths: string[]) {
  this.setPathParser(createPathParserFromPaths(paths));
};

const createPathParserFromPaths = (paths: string[]) => {
  const matchers = getSortedRoutes(paths.map((path) => normalizePagePath(path))).map((path: string) => ({
    pathname: path,
    match: getRouteMatcher(getRouteRegex(path)),
  }));

  return (url: UrlObject): UrlObject => {
    const pathname = url.pathname ?? "";
    const isDynamic = isDynamicRoute(pathname);
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

export {};
