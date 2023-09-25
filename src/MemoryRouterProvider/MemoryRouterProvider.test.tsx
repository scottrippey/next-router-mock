import React from "react";
import { useRouter } from "next/router";
import NextLink, { LinkProps } from "next/link";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { MemoryRouterProvider } from "./index";
import { default as singletonRouter } from "../index";

const TestLink = (linkProps: Partial<LinkProps>) => {
  const router = useRouter();
  return (
    <NextLink href="/test" {...linkProps}>
      Current route: "{router.asPath}"
    </NextLink>
  );
};

describe("MemoryRouterProvider", () => {
  beforeEach(() => {
    singletonRouter.setCurrentUrl("/initial");
  });

  it("should provide a router", () => {
    render(
      <MemoryRouterProvider>
        <TestLink />
      </MemoryRouterProvider>
    );
    expect(screen.getByText(`Current route: "/initial"`)).toBeDefined();
  });

  it("using the singleton router should update the URL", () => {
    render(
      <MemoryRouterProvider>
        <TestLink />
      </MemoryRouterProvider>
    );

    // Navigate:
    expect(screen.getByText(`Current route: "/initial"`)).toBeDefined();
    act(() => {
      singletonRouter.push("/new-route");
    });
    expect(screen.getByText(`Current route: "/new-route"`)).toBeDefined();
  });

  it("clicking a link should navigate to the new URL", () => {
    render(
      <MemoryRouterProvider>
        <TestLink />
      </MemoryRouterProvider>
    );
    expect(screen.getByText(`Current route: "/initial"`)).toBeDefined();
    fireEvent.click(screen.getByText(`Current route: "/initial"`));
    expect(screen.getByText(`Current route: "/test"`)).toBeDefined();
  });

  describe("url", () => {
    it("an initial URL can be supplied", () => {
      render(
        <MemoryRouterProvider url="/example">
          <TestLink />
        </MemoryRouterProvider>
      );
      expect(screen.getByText(`Current route: "/example"`)).toBeDefined();
    });

    it("an initial URL Object can be supplied", () => {
      render(
        <MemoryRouterProvider url={{ pathname: "/example", query: { foo: "bar" } }}>
          <TestLink />
        </MemoryRouterProvider>
      );
      expect(screen.getByText(`Current route: "/example?foo=bar"`)).toBeDefined();
    });
  });

  describe("async", () => {
    it("clicking a link should navigate to the new URL, asynchronously", async () => {
      render(
        <MemoryRouterProvider url="/initial" async>
          <TestLink />
        </MemoryRouterProvider>
      );
      expect(screen.getByText(`Current route: "/initial"`)).toBeDefined();
      fireEvent.click(screen.getByText(`Current route: "/initial"`));
      expect(screen.queryByText(`Current route: "/test"`)).toBeNull();
      await waitFor(() => expect(screen.queryByText(`Current route: "/test"`)).not.toBeNull());
    });
  });

  describe("events", () => {
    const eventHandlers = {
      onPush: jest.fn(),
      onReplace: jest.fn(),
      onRouteChangeStart: jest.fn(),
      onRouteChangeComplete: jest.fn(),
    };
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it("clicking a link should trigger the correct event handlers", () => {
      render(
        <MemoryRouterProvider url="/initial" {...eventHandlers}>
          <TestLink />
        </MemoryRouterProvider>
      );
      fireEvent.click(screen.getByText(`Current route: "/initial"`));
      expect(screen.getByText(`Current route: "/test"`)).not.toBeNull();
      expect(eventHandlers.onPush).toHaveBeenCalledWith("/test", { shallow: false });
      expect(eventHandlers.onReplace).not.toHaveBeenCalled();
      expect(eventHandlers.onRouteChangeStart).toHaveBeenCalledWith("/test", { shallow: false });
      expect(eventHandlers.onRouteChangeComplete).toHaveBeenCalledWith("/test", { shallow: false });
    });
    it("a 'replace' link triggers the correct handlers too", () => {
      render(
        <MemoryRouterProvider url="/initial" {...eventHandlers}>
          <TestLink replace />
        </MemoryRouterProvider>
      );
      fireEvent.click(screen.getByText(`Current route: "/initial"`));
      expect(screen.getByText(`Current route: "/test"`)).not.toBeNull();
      expect(eventHandlers.onPush).not.toHaveBeenCalledWith("/test", { shallow: false });
      expect(eventHandlers.onReplace).toHaveBeenCalled();
      expect(eventHandlers.onRouteChangeStart).toHaveBeenCalledWith("/test", { shallow: false });
      expect(eventHandlers.onRouteChangeComplete).toHaveBeenCalledWith("/test", { shallow: false });
    });
  });
});
