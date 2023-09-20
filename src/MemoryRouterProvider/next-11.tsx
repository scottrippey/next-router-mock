// NOTE: this path works with Next v11.1.0 through v13.4.0+
// @ts-ignore
import { RouterContext } from "next/dist/shared/lib/router-context";
import { factory } from "./MemoryRouterProvider";

export const MemoryRouterProvider = factory({ RouterContext });
