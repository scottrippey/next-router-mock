import React from "react";
import type { NextComponentType, NextPageContext } from "next";
import type { BaseContext } from "next/dist/shared/lib/utils";
import type { NextRouter } from "next/router";

// This is a (very slightly) modified version of https://github.com/vercel/next.js/blob/canary/packages/next/client/with-router.tsx

import type { MemoryRouterSnapshot } from "./MemoryRouter";

export type WithRouterProps = {
  router: NextRouter;
};

export type ExcludeRouterProps<P> = Pick<P, Exclude<keyof P, keyof WithRouterProps>>;

export function withMemoryRouter<P extends WithRouterProps, C extends BaseContext = NextPageContext>(
  useRouter: () => MemoryRouterSnapshot,
  ComposedComponent: NextComponentType<C, any, P>
): NextComponentType<C, any, ExcludeRouterProps<P>> {
  function WithRouterWrapper(props: any): JSX.Element {
    return <ComposedComponent router={useRouter()} {...props} />;
  }

  WithRouterWrapper.getInitialProps = ComposedComponent.getInitialProps;
  // This is needed to allow checking for custom getInitialProps in _app
  WithRouterWrapper.origGetInitialProps = (ComposedComponent as any).origGetInitialProps;
  if (process.env.NODE_ENV !== "production") {
    const name = ComposedComponent.displayName || ComposedComponent.name || "Unknown";
    WithRouterWrapper.displayName = `withRouter(${name})`;
  }

  return WithRouterWrapper;
}
