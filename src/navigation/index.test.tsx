import { act, renderHook, RenderHookResult } from "@testing-library/react";
import singletonRouter from "../index";
import {
  useRouter,
  useParams,
  usePathname,
  useSearchParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
} from "./index";
import { createDynamicRouteParser } from "../dynamic-routes";

describe("next/navigation", () => {
  beforeEach(() => {
    singletonRouter.reset();
  });

  describe("useRouter", () => {
    const hook = beforeEachRenderHook(() => useRouter());

    it("should be a snapshot of the router", () => {
      expect(Object.keys(hook.result.current)).toEqual([
        //
        "push",
        "replace",
        "refresh",
        "prefetch",
        "back",
        "forward",
      ]);
    });
    it("returns the same object after rerendering", () => {
      const initial = hook.result.current;
      hook.rerender();
      expect(hook.result.current).toBe(initial);
    });
    it("pushing a route does not trigger a rerender", () => {
      const initial = hook.result.current;
      act(() => {
        initial.push("/url");
      });
      expect(hook.result.current).toBe(initial);
    });
  });

  describe("usePathname", () => {
    const hook = beforeEachRenderHook(() => usePathname());
    it("should return the current pathname", () => {
      expect(hook.result.current).toEqual("/");
    });
    it("should update when a new path is pushed", () => {
      act(() => {
        singletonRouter.push("/new-path");
      });

      expect(hook.result.current).toEqual("/new-path");
    });
  });

  describe("useParams", () => {
    beforeEach(() => {
      singletonRouter.useParser(createDynamicRouteParser(["/[one]/[two]"]));
    });
    const hook = beforeEachRenderHook(() => useParams());
    it("should contain the route params", () => {
      expect(hook.result.current).toEqual({});

      act(() => {
        singletonRouter.push("/A/B");
      });

      expect(hook.result.current).toEqual({ one: "A", two: "B" });
    });

    it("should not contain search params", () => {
      expect(hook.result.current).toEqual({});

      act(() => {
        singletonRouter.push("/A/B?one=ONE&two=TWO&three=THREE");
      });

      expect(hook.result.current).toEqual({ one: "A", two: "B" });
    });
  });

  describe("useSearchParams", () => {
    const hook = beforeEachRenderHook(() => useSearchParams());
    it("should contain the search params", () => {
      expect([...hook.result.current.entries()]).toEqual([]);

      act(() => {
        singletonRouter.push("/path?one=1&two=2&three=3");
      });

      expect([...hook.result.current.entries()]).toEqual([
        ["one", "1"],
        ["two", "2"],
        ["three", "3"],
      ]);
    });
  });

  describe("useSelectedLayoutSegment", () => {
    act(() => {
      singletonRouter.push("/segment1/segment2");
    });
    const hook = beforeEachRenderHook(() => useSelectedLayoutSegment());
    it("should show not implemented yet", () => {
      expect(hook.result.current).toEqual("[next-router-mock] Not Yet Implemented");
    });
  });

  describe("useSelectedLayoutSegments", () => {
    act(() => {
      singletonRouter.push("/segment1/segment2");
    });
    const hook = beforeEachRenderHook(() => useSelectedLayoutSegments());
    it("should show not implemented yet", () => {
      expect(hook.result.current).toEqual(["[next-router-mock] Not Yet Implemented"]);
    });
  });
});

function beforeEachRenderHook<T>(render: () => T): RenderHookResult<T, object> {
  const hookResult = {} as any;
  beforeEach(() => {
    const newHookResult = renderHook(render);
    Object.assign(hookResult, newHookResult);
  });
  return hookResult;
}
