import type { NextRouter } from "next/router";
import type { UrlObject } from "./MemoryRouter";
import queryString from "querystring";

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
  return queryString.stringify(query);
}
export function objectifyQueryString(query: string): NextRouter["query"] {
  return queryString.parse(query);
}
