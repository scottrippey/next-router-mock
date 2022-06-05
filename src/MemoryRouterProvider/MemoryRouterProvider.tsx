import React, { FC, ReactNode, useMemo } from "react";

import { useMemoryRouter, MemoryRouter, Url } from "../index";
import { MemoryRouterEventHandlers } from "../useMemoryRouter";

type AbstractedNextDependencies = {
  RouterContext: typeof import("next/dist/shared/lib/router-context").RouterContext;
};

export type MemoryRouterProviderProps = {
  /** The initial URL to render */
  url?: Url;
  async?: boolean;
  children?: ReactNode;
} & MemoryRouterEventHandlers;

export function factory(dependencies: AbstractedNextDependencies) {
  const { RouterContext } = dependencies;

  const MemoryRouterProvider: FC<MemoryRouterProviderProps> = ({ children, url, async, ...eventHandlers }) => {
    const singletonRouter = useMemo(() => new MemoryRouter(url, async), []);
    const router = useMemoryRouter(singletonRouter, eventHandlers);
    return <RouterContext.Provider value={router}>{children}</RouterContext.Provider>;
  };

  return MemoryRouterProvider;
}
