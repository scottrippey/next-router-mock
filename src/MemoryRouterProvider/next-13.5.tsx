// NOTE: this path works with Next v13.5.0+
//
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";
import { factory } from "./MemoryRouterProvider";

export const MemoryRouterProvider = factory({ RouterContext });
