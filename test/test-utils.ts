import type { MemoryRouter } from "../src/MemoryRouter";

/**
 * Performs a partial equality comparison.
 *
 * This is similar to using `toMatchObject`, but doesn't ignore missing `query: { ... }` values!
 */
export function expectMatch(memoryRouter: MemoryRouter, expected: Partial<MemoryRouter>): void {
  const picked = pick(memoryRouter, Object.keys(expected) as Array<keyof MemoryRouter>);
  try {
    expect(picked).toEqual(expected);
  } catch (err: any) {
    // Ensure stack trace is accurate:
    Error.captureStackTrace(err, expectMatch);
    throw err;
  }
}

function pick<T extends object>(obj: T, keys: Array<keyof T>): T {
  const result = {} as T;
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
}
