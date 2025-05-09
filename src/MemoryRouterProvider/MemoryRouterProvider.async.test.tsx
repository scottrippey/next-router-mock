import React from "react";
import { useRouter } from "next/router";
import NextLink, { LinkProps } from "next/link";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { MemoryRouterProvider } from "./index";
import { default as singletonRouter } from "../async";

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
      <MemoryRouterProvider async>
        <TestLink />
      </MemoryRouterProvider>
    );
    expect(screen.getByText(`Current route: "/initial"`)).toBeDefined();
  });

  it("using the singleton router should update the URL", async () => {
    render(
      <MemoryRouterProvider async>
        <TestLink />
      </MemoryRouterProvider>
    );

    // Navigate:
    expect(screen.getByText(`Current route: "/initial"`)).toBeDefined();
    await act(async () => await singletonRouter.push("/new-route"));
    await waitFor(() => expect(screen.getByText(`Current route: "/new-route"`)).toBeDefined());
  });

  it("clicking a link should navigate to the new URL", async () => {
    render(
      <MemoryRouterProvider async>
        <TestLink />
      </MemoryRouterProvider>
    );
    expect(screen.getByText(`Current route: "/initial"`)).toBeDefined();
    fireEvent.click(screen.getByText(`Current route: "/initial"`));
    await waitFor(() => expect(screen.getByText(`Current route: "/test"`)).toBeDefined());
  });

  describe("url", () => {
    it("an initial URL can be supplied", () => {
      render(
        <MemoryRouterProvider url="/example" async>
          <TestLink />
        </MemoryRouterProvider>
      );
      expect(screen.getByText(`Current route: "/example"`)).toBeDefined();
    });

    it("an initial URL Object can be supplied", () => {
      render(
        <MemoryRouterProvider url={{ pathname: "/example", query: { foo: "bar" } }} async>
          <TestLink />
        </MemoryRouterProvider>
      );
      expect(screen.getByText(`Current route: "/example?foo=bar"`)).toBeDefined();
    });
  });

  describe("events", () => {
    const eventHandlers = {
      onPush: jest.fn(),
      onReplace: jest.fn(),
      onRouteChangeStart: jest.fn(),
      onRouteChangeComplete: jest.fn(),
    };
    beforeEach(async () => {
      jest.clearAllMocks();
    });
    it("clicking a link should trigger the correct event handlers", async () => {
      render(
        <MemoryRouterProvider url="/initial" async {...eventHandlers}>
          <TestLink />
        </MemoryRouterProvider>
      );
      fireEvent.click(screen.getByText(`Current route: "/initial"`));
      await waitFor(() => expect(screen.getByText(`Current route: "/test"`)).not.toBeNull());
      expect(eventHandlers.onPush).toHaveBeenCalledWith("/test", { shallow: false });
      expect(eventHandlers.onReplace).not.toHaveBeenCalled();
      expect(eventHandlers.onRouteChangeStart).toHaveBeenCalledWith("/test", { shallow: false });
      expect(eventHandlers.onRouteChangeComplete).toHaveBeenCalledWith("/test", { shallow: false });
    });
    it("a 'replace' link triggers the correct handlers too", async () => {
      render(
        <MemoryRouterProvider url="/initial" async {...eventHandlers}>
          <TestLink replace />
        </MemoryRouterProvider>
      );
      fireEvent.click(screen.getByText(`Current route: "/initial"`));
      await waitFor(() => expect(screen.getByText(`Current route: "/test"`)).not.toBeNull());
      expect(eventHandlers.onPush).not.toHaveBeenCalledWith("/test", { shallow: false });
      expect(eventHandlers.onReplace).toHaveBeenCalled();
      expect(eventHandlers.onRouteChangeStart).toHaveBeenCalledWith("/test", { shallow: false });
      expect(eventHandlers.onRouteChangeComplete).toHaveBeenCalledWith("/test", { shallow: false });
    });
  });
});
