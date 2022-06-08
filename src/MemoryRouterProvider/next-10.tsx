// NOTE: this path works with Next v10-v11.0.1
// @ts-expect-error
import { RouterContext } from "next/dist/next-server/lib/router-context";
import { factory } from "./MemoryRouterProvider";

export const MemoryRouterProvider = factory({ RouterContext });
