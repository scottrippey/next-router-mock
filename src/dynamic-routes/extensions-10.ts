import {
  getRouteMatcher,
  getRouteRegex,
  getSortedRoutes,
  isDynamicRoute,
  // @ts-ignore
} from "next/dist/next-server/lib/router/utils";
// @ts-ignore
import { normalizePagePath } from "next/dist/next-server/server/normalize-page-path";

import { defineRegisterPaths } from "./MemoryRouter.registerPaths";

defineRegisterPaths({
  getSortedRoutes,
  getRouteMatcher,
  getRouteRegex,
  isDynamicRoute,
  normalizePagePath,
});
