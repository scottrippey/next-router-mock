import React from "react";
import NextLink from "next/link";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import MockRouter from "./useRouter";

jest.mock("next/dist/client/router", () => require("./useRouter"));

describe("next/link", () => {
  describe("clicking a link will mock navigate", () => {
    it("to a href", async () => {
      render(<NextLink href="/example?foo=bar">Example Link</NextLink>);
      fireEvent.click(screen.getByText("Example Link"));
      await waitFor(() => {
        expect(MockRouter).toMatchObject({
          asPath: "/example?foo=bar",
          pathname: "/example",
          query: { foo: "bar" },
        });
      });
    });

    it("to a URL object", async () => {
      render(
        <NextLink href={{ pathname: "/example", query: { foo: "bar" } }}>
          Example Link
        </NextLink>
      );
      fireEvent.click(screen.getByText("Example Link"));
      await waitFor(() => {
        expect(MockRouter).toMatchObject({
          asPath: "/example?foo=bar",
          pathname: "/example",
          query: { foo: "bar" },
        });
      });
    });
  });
});
