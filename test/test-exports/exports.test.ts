import router, { useRouter } from "next/router";
import { memoryRouter, MemoryRouter } from "../..";
import { createDynamicRouteParser } from "../../dynamic-routes";
import { MemoryRouterProvider } from "../../MemoryRouterProvider";

jest.mock("next/router", () => require("../.."));

describe("exports", () => {
  it("next/router should be exported correctly", () => {
    expect(router).toBeInstanceOf(MemoryRouter);
    expect(router).toBe(memoryRouter);
    expect(useRouter).toBeInstanceOf(Function);
  });
  describe("next-router-mock/dynamic-routes", () => {
    it("should be exported correctly", () => {
      expect(createDynamicRouteParser).toBeInstanceOf(Function);
    });
  });
  describe("next-router-mock/MemoryRouterProvider", () => {
    it("should be exported correctly", () => {
      expect(MemoryRouterProvider).toBeInstanceOf(Function);
    });
  });
});
