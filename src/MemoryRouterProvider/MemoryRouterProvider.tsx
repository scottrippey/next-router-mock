import React, { FC, ReactNode, useMemo } from "react";

import { useMemoryRouter, MemoryRouter, Url, default as singletonRouter } from "../index";
import { default as asyncSingletonRouter } from "../async";
import { MemoryRouterEventHandlers } from "../useMemoryRouter";
import { MemoryRouterContext } from "../MemoryRouterContext";
import { MemoryHistory } from "history";

type AbstractedNextDependencies = Pick<
  typeof import("next/dist/shared/lib/router-context.shared-runtime"),
  "RouterContext"
>;

export type MemoryRouterProviderProps = {
  /**
   * The initial URL to render.
   */
  url?: Url;
  async?: boolean;
  history?: MemoryHistory;
  children?: ReactNode;
} & MemoryRouterEventHandlers;

export function factory(dependencies: AbstractedNextDependencies) {
  const { RouterContext } = dependencies;

  const MemoryRouterProvider: FC<MemoryRouterProviderProps> = ({ children, url, async, history, ...eventHandlers }) => {
    const memoryRouter = useMemo(() => {
      if (typeof url !== "undefined") {
        // If the `url` was specified, we'll use an "isolated router" instead of the singleton.
        return new MemoryRouter(url, async, undefined);
      }
      if (typeof history !== "undefined") {
        return new MemoryRouter(url, async, history);
      }
      // Normally we'll just use the singleton:
      return async ? asyncSingletonRouter : singletonRouter;
    }, [url, async, history]);

    const routerSnapshot = useMemoryRouter(memoryRouter, eventHandlers);

    return (
      <MemoryRouterContext.Provider value={routerSnapshot}>
        <RouterContext.Provider value={routerSnapshot}>{children}</RouterContext.Provider>
      </MemoryRouterContext.Provider>
    );
  };

  return MemoryRouterProvider;
}
