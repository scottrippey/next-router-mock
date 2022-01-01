import mitt, { MittEmitter } from "./lib/mitt";
import { parse as parseUrl, UrlWithParsedQuery } from "url";
import { stringify as stringifyQueryString, ParsedUrlQuery } from "querystring";

import type { NextRouter, RouterEvent } from "next/router";

/**
 * Creates a URL from a pathname + query.
 * Injects query params into the URL slugs, the same way that next/router does.
 */
function getRouteAsPath(pathname: string, query: ParsedUrlQuery, hash: string | null | undefined) {
  const remainingQuery = { ...query };

  // Replace slugs, and remove them from the `query`
  let asPath = pathname.replace(/\[{1,2}(.+?)]{1,2}/g, ($0, slug: string) => {
    if (slug.startsWith("...")) slug = slug.replace("...", "");

    const value = remainingQuery[slug]!;
    delete remainingQuery[slug];
    if (Array.isArray(value)) {
      return value.map((v) => encodeURIComponent(v)).join("/");
    }
    return value !== undefined ? encodeURIComponent(String(value)) : "";
  });

  // Remove any trailing slashes; this can occur if there is no match for a catch-all slug ([[...slug]])
  asPath = removeTrailingSlash(asPath);

  // Append remaining query as a querystring, if needed:
  const qs = stringifyQueryString(remainingQuery);

  if (qs) asPath += `?${qs}`;
  if (hash) asPath += hash;

  return asPath;
}

export type UrlObject = {
  pathname: UrlWithParsedQuery["pathname"];
  query?: UrlWithParsedQuery["query"];
  hash?: UrlWithParsedQuery["hash"];
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
  hash = "";
  query: NextRouter["query"] = {};
  asPath = "";
  basePath = "";
  isFallback = false;
  isPreview = false;
  pathParser: ((url: UrlObject) => UrlObject) | undefined = undefined;

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

  private _setCurrentUrl = async (
    url: Url,
    as?: Url,
    options?: TransitionOptions,
    source?: "push" | "replace" | "set",

    async = this.async
  ) => {
    // Parse the URL if needed:
    const baseUrlObject = typeof url === "string" ? parseUrl(url, true) : url;
    const baseQuery = baseUrlObject.query || {};
    const urlObject = this.pathParser ? this.pathParser(baseUrlObject) : baseUrlObject;

    const shallow = options?.shallow || false;
    const pathname = removeTrailingSlash(urlObject.pathname || "");
    const query = urlObject.query || {};
    const hash = urlObject.hash || "";
    const asPath = getRouteAsPath(baseUrlObject.pathname ?? "", baseQuery, hash);

    const isHashChange = this.hash !== hash;
    const isQueryChange = stringifyQueryString(this.query) !== stringifyQueryString(query);
    const isRouteChange = isQueryChange || this.pathname !== pathname;
    const isOnlyHashChange = isHashChange && !isRouteChange;

    if (isOnlyHashChange) {
      this.events.emit("hashChangeStart", asPath, { shallow });
    } else {
      this.events.emit("routeChangeStart", asPath, { shallow });
    }

    // Simulate the async nature of this method
    if (async) await new Promise((resolve) => setTimeout(resolve, 0));

    this.pathname = pathname;
    this.query = query;
    this.asPath = asPath;
    this.hash = hash;
    if (options?.locale) {
      this.locale = options.locale;
    }

    if (isOnlyHashChange) {
      this.events.emit("hashChangeComplete", this.asPath, { shallow });
    } else {
      this.events.emit("routeChangeComplete", this.asPath, { shallow });
    }

    const eventName =
      source === "push" ? "NEXT_ROUTER_MOCK:push" : source === "replace" ? "NEXT_ROUTER_MOCK:replace" : undefined;
    if (eventName) this.events.emit(eventName, this.asPath, { shallow });

    return true;
  };
}

function removeTrailingSlash(path: string) {
  return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
}
