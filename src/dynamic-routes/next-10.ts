import {
  getRouteMatcher,
  getRouteRegex,
  getSortedRoutes,
  isDynamicRoute,
  // @ts-expect-error
} from "next/dist/next-server/lib/router/utils";
// @ts-expect-error
import { normalizePagePath } from "next/dist/next-server/server/normalize-page-path";

import { factory } from "./createDynamicRouteParser";

export const createDynamicRouteParser = factory({
  getSortedRoutes,
  getRouteMatcher,
  getRouteRegex,
  isDynamicRoute,
  normalizePagePath,
});
