import React from "react";
import { useRouter } from "next/router";
import NextLink, { LinkProps } from "next/link";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { MemoryRouterProvider } from "./next-11";

const TestLink = (linkProps: Partial<LinkProps>) => {
  const router = useRouter();
  return (
    <NextLink href="/test" {...linkProps}>
      <a>Current route: "{router.asPath}"</a>
    </NextLink>
  );
};

describe("MemoryRouterProvider", () => {
  it("should mock the router", () => {
    render(
      <MemoryRouterProvider>
        <TestLink />
      </MemoryRouterProvider>
    );
    expect(screen.getByText(`Current route: ""`)).toBeDefined();
  });

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

  it("clicking a link should navigate to a new page", () => {
    render(
      <MemoryRouterProvider>
        <TestLink />
      </MemoryRouterProvider>
    );
    expect(screen.getByText(`Current route: ""`)).toBeDefined();
    fireEvent.click(screen.getByText(`Current route: ""`));
    expect(screen.getByText(`Current route: "/test"`)).toBeDefined();
  });

  describe("async", () => {
    it("clicking a link should navigate to a new page, asynchronously", async () => {
      render(
        <MemoryRouterProvider async>
          <TestLink />
        </MemoryRouterProvider>
      );
      expect(screen.getByText(`Current route: ""`)).toBeDefined();
      fireEvent.click(screen.getByText(`Current route: ""`));
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
        <MemoryRouterProvider {...eventHandlers}>
          <TestLink />
        </MemoryRouterProvider>
      );
      fireEvent.click(screen.getByText(`Current route: ""`));
      expect(screen.getByText(`Current route: "/test"`)).not.toBeNull();
      expect(eventHandlers.onPush).toHaveBeenCalledWith("/test", { shallow: false });
      expect(eventHandlers.onReplace).not.toHaveBeenCalled();
      expect(eventHandlers.onRouteChangeStart).toHaveBeenCalledWith("/test", { shallow: false });
      expect(eventHandlers.onRouteChangeComplete).toHaveBeenCalledWith("/test", { shallow: false });
    });
    it("a 'replace' link triggers the correct handlers too", () => {
      render(
        <MemoryRouterProvider {...eventHandlers}>
          <TestLink replace />
        </MemoryRouterProvider>
      );
      fireEvent.click(screen.getByText(`Current route: ""`));
      expect(screen.getByText(`Current route: "/test"`)).not.toBeNull();
      expect(eventHandlers.onPush).not.toHaveBeenCalledWith("/test", { shallow: false });
      expect(eventHandlers.onReplace).toHaveBeenCalled();
      expect(eventHandlers.onRouteChangeStart).toHaveBeenCalledWith("/test", { shallow: false });
      expect(eventHandlers.onRouteChangeComplete).toHaveBeenCalledWith("/test", { shallow: false });
    });
  });
});
