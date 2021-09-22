import React, { Component } from "react";
import { NextRouter } from "next/router";
import { act, render, screen } from "@testing-library/react";
import { memoryRouter, withRouter } from "./index";

class TestComponent extends Component<{ router: NextRouter; title?: string }, {}> {
  render() {
    return (
      <span>
        {this.props.title || "Current path"}: "{this.props.router.asPath}"
      </span>
    );
  }

  static getInitialProps() {}
}

const TestComponentWrapper = withRouter(TestComponent);

describe("withRouter", () => {
  beforeEach(() => {
    memoryRouter.setCurrentUrl("/test");
  });

  it("should have access to the current router", async () => {
    render(<TestComponentWrapper />);
    expect(screen.getByText('Current path: "/test"')).toBeDefined();
  });

  it("should respond to updates", () => {
    render(<TestComponentWrapper />);
    act(() => {
      memoryRouter.push("/updated-path");
    });
    expect(screen.getByText('Current path: "/updated-path"')).toBeDefined();
  });

  it("should pass-through extra properties", () => {
    render(<TestComponentWrapper title={"CURRENT PATH"} />);
    expect(screen.getByText('CURRENT PATH: "/test"')).toBeDefined();
  });

  it("should copy the static `getInitialProps` method", () => {
    expect(TestComponentWrapper.getInitialProps).toBe(TestComponent.getInitialProps);
  });
});
