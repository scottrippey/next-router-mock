import mitt, { MittEmitter } from "./lib/mitt";
import { parse as parseUrl, UrlWithParsedQuery } from "url";
import { stringify as stringifyQueryString, ParsedUrlQuery } from "querystring";

import type { NextRouter, RouterEvent } from "next/router";
import {getRouteMatcher, getRouteRegex} from "next/dist/shared/lib/router/utils";

/**
 * Creates a URL from a pathname + query.
 * Injects query params into the URL slugs, the same way that next/router does.
 */
function getRouteAsPath(pathname: string, query: ParsedUrlQuery) {
  const remainingQuery = { ...query };

  // Replace slugs, and remove them from the `query`
  let asPath = pathname.replace(/\[(.+?)]/g, ($0, slug: keyof ParsedUrlQuery) => {
    const value = remainingQuery[slug]!;
    delete remainingQuery[slug];

    return encodeURIComponent(String(value));
  });

  // Append remaining query as a querystring, if needed:
  const qs = stringifyQueryString(remainingQuery);

  if (qs) asPath = `${asPath}?${qs}`;

  return asPath;
}

type UrlObject = {
  pathname: UrlWithParsedQuery["pathname"];
  query?: UrlWithParsedQuery["query"];
};
export type Url = string | UrlObject;

// interface not exported by the package next/router
interface TransitionOptions {
  shallow?: boolean;
  locale?: string | false;
  scroll?: boolean;
}

type SupportedEventTypes =
  | "routeChangeStart"
  | "routeChangeComplete"
  | "NEXT_ROUTER_MOCK:push"
  | "NEXT_ROUTER_MOCK:replace";

/**
 * A base implementation of NextRouter that does nothing; all methods throw.
 */
export abstract class BaseRouter implements NextRouter {
  isReady = true;
  route = "";
  pathname = "";
  query: NextRouter["query"] = {};
  asPath = "";
  basePath = "";
  isFallback = false;
  isPreview = false;
  pathParser: (url: string) => ParsedUrlQuery = (url: string) => ({});

  isLocaleDomain = false;
  locale: NextRouter["locale"] = undefined;
  locales: NextRouter["locales"] = [];
  defaultLocale?: NextRouter["defaultLocale"];
  domainLocales?: NextRouter["domainLocales"];

  events: MittEmitter<SupportedEventTypes | RouterEvent> = mitt();

  abstract push(url: Url, as?: Url, options?: TransitionOptions): Promise<boolean>;
  abstract replace(url: Url): Promise<boolean>;
  back() {
    // Do nothing
  }
  beforePopState() {
    // Do nothing
  }
  async prefetch(): Promise<void> {
    // Do nothing
  }
  reload() {
    // Do nothing
  }
}

/**
 * An implementation of NextRouter that does not change the URL, but just stores the current route in memory.
 */
export class MemoryRouter extends BaseRouter {
  static snapshot(original: MemoryRouter): Readonly<MemoryRouter> {
    return Object.assign(new MemoryRouter(), original);
  }

  constructor(initialUrl?: Url, async?: boolean) {
    super();
    if (initialUrl) this.setCurrentUrl(initialUrl);
    if (async) this.async = async;
  }

  /**
   * When enabled, there will be a short delay between calling `push` and when the router is updated.
   * This is used to simulate Next's async behavior.
   * However, for most tests, it is more convenient to leave this off.
   */
  public async = false;

  push(url: Url, as?: Url, options?: TransitionOptions) {
    return this._setCurrentUrl(url, as, options, "push");
  }

  replace(url: Url, as?: Url, options?: TransitionOptions) {
    return this._setCurrentUrl(url, as, options, "replace");
  }

  /**
   * Sets the current Memory route to the specified url, synchronously.
   */
  public setCurrentUrl(url: Url) {
    void this._setCurrentUrl(url, undefined, undefined, "set", false); // (ignore the returned promise)
  }

  /**
   * Provide a function to parse additional variables out of the URL path. These variables will be merged
   * with any variables parsed from the query string, with query string variables taking precedence in the case
   * of a collision.
   */
  public setPathParser(parser: (url: string) => ParsedUrlQuery) {
    this.pathParser = parser;
  }

  public registerPaths = (paths: string[]) => this.setPathParser(this._createPathParserFromPatterns(paths))

  private _createPathParserFromPatterns(paths: string[]) {
    const matchers = paths.map(path => getRouteMatcher(getRouteRegex(path)))
    return (url: string) => {
      const matcher = matchers.find(matcher => !!matcher(url))
      const match = matcher ? matcher(url) : false
      return (match ? match : {})
    }
  }

  private _setCurrentUrl = async (
    url: Url,
    as?: Url,
    options?: TransitionOptions,
    source?: "push" | "replace" | "set",

    async = this.async
  ) => {
    // Parse the URL if needed:
    const urlObject = typeof url === "string" ? parseUrl(url, true) : url;
    const baseQuery = urlObject.query || {};
    urlObject.query = {...this.pathParser(urlObject.pathname ?? ""), ...urlObject.query};

    const shallow = options?.shallow || false;
    const pathname = urlObject.pathname || "";
    const query = urlObject.query || {};
    const asPath = getRouteAsPath(pathname, baseQuery);

    this.events.emit("routeChangeStart", asPath, { shallow });

    // Simulate the async nature of this method
    if (async) await new Promise((resolve) => setTimeout(resolve, 0));

    this.pathname = pathname;
    this.query = query;
    this.asPath = asPath;
    if (options?.locale) {
      this.locale = options.locale;
    }

    this.events.emit("routeChangeComplete", this.asPath, { shallow });

    const eventName =
      source === "push" ? "NEXT_ROUTER_MOCK:push" : source === "replace" ? "NEXT_ROUTER_MOCK:replace" : undefined;
    if (eventName) this.events.emit(eventName, this.asPath, { shallow });

    return true;
  };
}
