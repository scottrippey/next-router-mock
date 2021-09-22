import React from "react";
import type { NextComponentType, NextPageContext } from "next";
import type { NextRouter } from "next/router";

import { MemoryRouter } from "./MemoryRouter";

// A simplified version of the official withRouter types:
export type ComponentWithWrapper = NextComponentType<NextPageContext, any, { router: NextRouter }> & {
  origGetInitialProps?: NextComponentType["getInitialProps"];
};

/**
 * This implementation copied from Next's source
 */
export const withMemoryRouter = (useRouter: () => Readonly<MemoryRouter>, ComposedComponent: ComponentWithWrapper) => {
  function WithRouterWrapper(props: unknown) {
    return <ComposedComponent router={useRouter()} {...props} />;
  }
  WithRouterWrapper.getInitialProps = ComposedComponent.getInitialProps;
  WithRouterWrapper.origGetInitialProps = ComposedComponent.origGetInitialProps;

  if (process.env.NODE_ENV !== "production") {
    const name = ComposedComponent.displayName || ComposedComponent.name || "Unknown";
    WithRouterWrapper.displayName = `withRouter(${name})`;
  }

  return WithRouterWrapper;
};
