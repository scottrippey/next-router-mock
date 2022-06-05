// NOTE: this path works with Next v11.1.0+
//
import { RouterContext } from "next/dist/shared/lib/router-context";
import { factory } from "./MemoryRouterProvider";

export const MemoryRouterProvider = factory({ RouterContext });
