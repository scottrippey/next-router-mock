import type { NextRouter } from "next/router";
import type { UrlObject } from "./MemoryRouter";

export function parseUrl(url: string): UrlObject {
  const base = "https://base.com"; // base can be anything
  const parsed = new URL(url, base);
  const query = Object.fromEntries(
    Array.from(parsed.searchParams.keys()).map((key) => {
      const values = parsed.searchParams.getAll(key);
      return [key, values.length === 1 ? values[0] : values];
    })
  );
  return {
    pathname: parsed.pathname,
    hash: parsed.hash,
    query,
  };
}
export function stringifyQueryString(query: NextRouter["query"]): string {
  const params = new URLSearchParams();
  Object.keys(query).forEach((key) => {
    const values = query[key];
    for (const value of Array.isArray(values) ? values : [values]) {
      params.append(key, value!);
    }
  });
  return params.toString();
}
