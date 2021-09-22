import React from "react";
import type { NextComponentType, NextPageContext } from "next";
import type { NextRouter } from "next/router";

import { MemoryRouter } from "./MemoryRouter";

// A simplified version of the official withRouter types:
export type WithRouterProps = { router: NextRouter };
export type ComponentWithRouter<Props extends WithRouterProps> = NextComponentType<NextPageContext, any, Props> & {
  origGetInitialProps?: NextComponentType["getInitialProps"];
};

/**
 * This implementation mostly copied from Next's source
 */
export const withMemoryRouter = <TProps extends WithRouterProps>(
  useRouter: () => Readonly<MemoryRouter>,
  ComposedComponent: ComponentWithRouter<TProps>
) => {
  function WithRouterWrapper(props: Omit<TProps, "router">) {
    return <ComposedComponent router={useRouter()} {...(props as any)} />;
  }
  WithRouterWrapper.getInitialProps = ComposedComponent.getInitialProps;
  WithRouterWrapper.origGetInitialProps = ComposedComponent.origGetInitialProps;

  if (process.env.NODE_ENV !== "production") {
    const name = ComposedComponent.displayName || ComposedComponent.name || "Unknown";
    WithRouterWrapper.displayName = `withRouter(${name})`;
  }

  return WithRouterWrapper;
};
