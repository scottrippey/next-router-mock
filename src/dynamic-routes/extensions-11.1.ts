import {
  getRouteMatcher,
  getRouteRegex,
  getSortedRoutes,
  isDynamicRoute,
  //
} from "next/dist/shared/lib/router/utils";
//
import { normalizePagePath } from "next/dist/server/normalize-page-path";

import { defineRegisterPaths } from "./MemoryRouter.registerPaths";

defineRegisterPaths({
  getSortedRoutes,
  getRouteMatcher,
  getRouteRegex,
  isDynamicRoute,
  normalizePagePath,
});
