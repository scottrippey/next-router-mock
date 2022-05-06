import {
  getRouteMatcher,
  getRouteRegex,
  getSortedRoutes,
  isDynamicRoute,
  //
} from "next/dist/shared/lib/router/utils";
// @ts-ignore
import { normalizePagePath } from "next/dist/shared/lib/page-path/normalize-page-path";

import { defineRegisterPaths } from "./MemoryRouter.registerPaths";

defineRegisterPaths({
  getSortedRoutes,
  getRouteMatcher,
  getRouteRegex,
  isDynamicRoute,
  normalizePagePath,
});
