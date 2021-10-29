import {UrlObject, MemoryRouter} from "../MemoryRouter";
import {getRouteMatcher, getRouteRegex, getSortedRoutes, isDynamicRoute} from "next/dist/shared/lib/router/utils";
import {normalizePagePath} from "next/dist/server/normalize-page-path";
import {interpolateAs} from "next/dist/shared/lib/router/router";
import "./path-parser"

declare module "../MemoryRouter" {
  interface MemoryRouter {
    registerPaths(paths: string[]): void
  }
}

/**
 * Register URL paths with the router; this can include any static and dynamic paths your app might use.
 * Any provided dynamic paths will have their slugs parsed and added to the ParsedUrlQuery on the router
 * when a route is pushed.
 */
MemoryRouter.prototype.registerPaths = function(paths: string[]) {
  this.setPathParser(createPathParserFromPaths(paths))
}

const createPathParserFromPaths = (paths: string[]) => {
  const matchers = getSortedRoutes(paths.map(path => normalizePagePath(path)))
    .map(path => getRouteMatcher(getRouteRegex(path)));

  return (url: UrlObject) => {
    const pathname = url.pathname ?? "";
    const isDynamic = isDynamicRoute(pathname);
    const matcher = matchers.find(matcher => !!matcher(pathname));
    const match = matcher ? matcher(pathname) : false;

    // When pushing to a dynamic route with un-interpolated slugs passed in the pathname, the assumption is that
    // a query dictionary will be provided, so instead of using the match we interpolate the route from
    // the provided query
    const parsedQuery = isDynamic ? url.query : (match ? match : {});
    const asPath = isDynamic ? interpolateAs(pathname, pathname, url.query ?? {}).result : pathname

    return {
      pathname: url.pathname,
      query: {...url.query, ...parsedQuery},
      asPath: asPath
    }
  }
}

export {}
