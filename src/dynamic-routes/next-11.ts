import { getRouteMatcher } from "next/dist/shared/lib/router/utils/route-matcher";
import { getRouteRegex } from "next/dist/shared/lib/router/utils/route-regex";
import {
  getSortedRoutes,
  isDynamicRoute,
  //
} from "next/dist/shared/lib/router/utils";
// @ts-expect-error
import { normalizePagePath } from "next/dist/server/normalize-page-path";

import { factory } from "./createDynamicRouteParser";

export const createDynamicRouteParser = factory({
  getSortedRoutes,
  getRouteMatcher,
  getRouteRegex,
  isDynamicRoute,
  normalizePagePath,
});
