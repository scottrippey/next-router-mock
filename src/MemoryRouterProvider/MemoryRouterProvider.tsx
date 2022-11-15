import React, { FC, ReactNode, useMemo } from "react";

import { useMemoryRouter, MemoryRouter, Url } from "../index";
import { MemoryRouterEventHandlers } from "../useMemoryRouter";
import { MemoryRouterContext } from "../MemoryRouterContext";

type AbstractedNextDependencies = Pick<typeof import("next/dist/shared/lib/router-context"), "RouterContext">;

export type MemoryRouterProviderProps = {
  /** The initial URL to render */
  url?: Url;
  async?: boolean;
  children?: ReactNode;
} & MemoryRouterEventHandlers;

export function factory(dependencies: AbstractedNextDependencies) {
  const { RouterContext } = dependencies;

  const MemoryRouterProvider: FC<MemoryRouterProviderProps> = ({ children, url, async, ...eventHandlers }) => {
    const memoryRouter = useMemo(() => new MemoryRouter(url, async), []);
    const router = useMemoryRouter(memoryRouter, eventHandlers);
    return (
      <MemoryRouterContext.Provider value={router}>
        <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
      </MemoryRouterContext.Provider>
    );
  };

  return MemoryRouterProvider;
}
