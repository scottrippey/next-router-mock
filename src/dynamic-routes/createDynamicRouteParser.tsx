import type { UrlObjectComplete } from "../MemoryRouter";

type AbstractedNextDependencies = Pick<
  typeof import("next/dist/shared/lib/router/utils") &
    typeof import("next/dist/shared/lib/page-path/normalize-page-path") &
    typeof import("next/dist/shared/lib/router/utils/route-matcher") &
    typeof import("next/dist/shared/lib/router/utils/route-regex"),
  "getSortedRoutes" | "getRouteMatcher" | "getRouteRegex" | "isDynamicRoute" | "normalizePagePath"
>;

/**
 * The only differences between Next 10/11/12/13 is the import paths,
 * so this "factory" function allows us to abstract these dependencies.
 */
export function factory(dependencies: AbstractedNextDependencies) {
  checkDependencies(dependencies);
  const {
    //
    getSortedRoutes,
    getRouteMatcher,
    getRouteRegex,
    isDynamicRoute,
    normalizePagePath,
  } = dependencies;

  return function createDynamicRouteParser(paths: string[]) {
    const matchers = getSortedRoutes(paths.map((path) => normalizePagePath(path))).map((path: string) => {
      const routeRegex = getRouteRegex(path);
      return {
        pathname: path,
        match: getRouteMatcher(routeRegex),
        regex: routeRegex, // Cache for later use
      };
    });

    return function parser(url: UrlObjectComplete): void {
      const pathname = url.pathname;
      const matcher = matchers.find((matcher) => matcher.match(pathname));

      if (matcher) {
        // Update the route name:
        url.pathname = matcher.pathname;

        // Extract route params from concrete paths
        const routeParams = matcher.match(pathname) || {};

        // For dynamic pathnames, extract route params from query object
        if (isDynamicRoute(pathname)) {
          if (matcher.regex.groups) {
            Object.keys(matcher.regex.groups).forEach((paramName) => {
              const paramValue = url.query[paramName];
              if (paramValue !== undefined) {
                routeParams[paramName] = paramValue;
                delete url.query[paramName];
              }
            });
          }
        }

        url.routeParams = routeParams;
      }
    };
  };
}

/**
 * Check that all these dependencies are properly defined
 */
function checkDependencies(dependencies: Record<string, unknown>) {
  const missingDependencies = Object.keys(dependencies).filter((name) => {
    return !dependencies[name];
  });
  if (missingDependencies.length) {
    throw new Error(
      `next-router-mock/dynamic-routes: the following dependencies are missing: ${JSON.stringify(missingDependencies)}`
    );
  }
}
