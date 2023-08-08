import { Search } from "./Search";

jest.mock("next/router", () => jest.requireActual("next-router-mock"));

describe("Search", () => {
  it("TODO add tests", () => {
    expect(typeof Search).toBe("function");
  });
});
