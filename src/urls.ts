import type { NextRouter } from "next/router";
import type { UrlObject } from "./MemoryRouter";

export function parseUrl(url: string): UrlObject {
  const base = "https://base.com"; // base can be anything
  const parsed = new URL(url, base);
  const query = Object.fromEntries(parsed.searchParams);
  return {
    pathname: parsed.pathname,
    hash: parsed.hash,
    query,
  };
}
export function stringifyQueryString(query: NextRouter["query"]): string {
  return new URLSearchParams(query as Record<string, string>).toString();
}
