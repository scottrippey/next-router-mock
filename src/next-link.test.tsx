import React from "react";
import NextLink from "next/link";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import memoryRouter from "./index";
import { MemoryRouterProvider } from "./MemoryRouterProvider";

jest.mock("next/dist/client/router", () => require("./index"));

const wrapper = (props: { children: React.ReactNode }) => <MemoryRouterProvider {...props} />;

describe("next/link", () => {
  describe("clicking a link will mock navigate", () => {
    it("to a href", async () => {
      render(<NextLink href="/example?foo=bar">Example Link</NextLink>, { wrapper });
      fireEvent.click(screen.getByText("Example Link"));
      await waitFor(() => {
        expect(memoryRouter).toMatchObject({
          asPath: "/example?foo=bar",
          pathname: "/example",
          query: { foo: "bar" },
        });
      });
    });

    it("to a URL object", async () => {
      render(<NextLink href={{ pathname: "/example", query: { foo: "bar" } }}>Example Link</NextLink>, { wrapper });
      fireEvent.click(screen.getByText("Example Link"));
      await waitFor(() => {
        expect(memoryRouter).toMatchObject({
          asPath: "/example?foo=bar",
          pathname: "/example",
          query: { foo: "bar" },
        });
      });
    });

    it("supports multivalued query properties", async () => {
      render(<NextLink href={{ pathname: "/example", query: { foo: ["bar", "baz"] } }}>Next Link</NextLink>, {
        wrapper,
      });
      fireEvent.click(screen.getByText("Next Link"));
      await waitFor(() => {
        expect(memoryRouter).toMatchObject({
          asPath: "/example?foo=bar&foo=baz",
          pathname: "/example",
          query: { foo: ["bar", "baz"] },
        });
      });
    });
  });
});
