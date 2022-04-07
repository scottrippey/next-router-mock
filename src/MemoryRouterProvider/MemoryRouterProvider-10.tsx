// NOTE: this path works with Next v10-v11.0.1
// @ts-ignore
import { RouterContext } from "next/dist/next-server/lib/router-context";
import React, { FC, useMemo } from "react";

import { useMemoryRouter, MemoryRouter, Url } from "../index";
import { MemoryRouterEventHandlers } from "../useMemoryRouter";
import { ChildRerenderer } from "../utils/ChildRerenderer";

export type MemoryRouterProviderProps = {
  /** The initial URL to render */
  url?: Url;
  async?: boolean;
} & MemoryRouterEventHandlers;

export const MemoryRouterProvider: FC<MemoryRouterProviderProps> = ({ children, url, async, ...eventHandlers }) => {
  const singletonRouter = useMemo(() => new MemoryRouter(url, async), []);
  const router = useMemoryRouter(singletonRouter, eventHandlers);
  return <RouterContext.Provider value={router}><ChildRerenderer>{children}</ChildRerenderer></RouterContext.Provider>;
};
