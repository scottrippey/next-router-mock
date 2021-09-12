import mitt, { MittEmitter } from "./lib/mitt";
import { parse as parseUrl, UrlWithParsedQuery } from "url";
import { stringify as stringifyQueryString, ParsedUrlQuery } from "querystring";

import type { NextRouter } from "next/router";

/**
 * Creates a URL from a pathname + query.
 * Injects query params into the URL slugs, the same way that next/router does.
 */
function getRouteAsPath(pathname: string, query: ParsedUrlQuery) {
  const remainingQuery = { ...query };

  // Replace slugs, and remove them from the `query`
  let asPath = pathname.replace(
    /\[(.+?)]/g,
    ($0, slug: keyof ParsedUrlQuery) => {
      const value = remainingQuery[slug]!;
      delete remainingQuery[slug];

      return encodeURIComponent(String(value));
    }
  );

  // Append remaining query as a querystring, if needed:
  const qs = stringifyQueryString(remainingQuery);

  if (qs) asPath = `${asPath}?${qs}`;

  return asPath;
}

type UrlObject = {
  pathname: UrlWithParsedQuery["pathname"];
  query?: UrlWithParsedQuery["query"];
};
type Url = string | UrlObject;

// interface not exported by the package next/router
interface TransitionOptions {
  shallow?: boolean;
  locale?: string | false;
  scroll?: boolean;
}

type SupportedEventTypes = "routeChangeStart" | "routeChangeComplete";

/**
 * A base implementation of NextRouter that does nothing; all methods throw.
 */
export abstract class BaseRouter implements NextRouter {
  isReady = true;
  route = "";
  pathname = "";
  query = {} as ParsedUrlQuery;
  asPath = "";
  basePath = "";
  isFallback = false;
  events: MittEmitter<SupportedEventTypes> = mitt();
  locale: string | undefined = undefined;
  locales: string[] = [];

  abstract push(
    url: Url,
    as?: Url,
    options?: TransitionOptions
  ): Promise<boolean>;
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
 *
 * Currently only supports the `push` and `replace` methods.
 * TODO: Implement more methods!
 */
export class MemoryRouter extends BaseRouter {
  static clone(original: MemoryRouter): MemoryRouter {
    return Object.assign(new MemoryRouter(), original);
  }

  /**
   *
   */
  public async = false;

  push(url: Url, as?: Url, options?: TransitionOptions) {
    return this._setCurrentUrl(url, as, options);
  }

  replace(url: Url, as?: Url, options?: TransitionOptions) {
    return this._setCurrentUrl(url, as, options);
  }

  /**
   * Sets the current Memory route to the specified url, synchronously.
   */
  public setCurrentUrl(url: Url) {
    void this._setCurrentUrl(url, undefined, undefined, false); // (ignore the returned promise)
  }

  private async _setCurrentUrl(
    url: Url,
    as?: Url,
    options?: TransitionOptions,
    async = this.async
  ) {
    // Parse the URL if needed:
    const urlObject = typeof url === "string" ? parseUrl(url, true) : url;

    const shallow = options?.shallow || false;
    const pathname = urlObject.pathname || "";
    const query = urlObject.query || {};
    const asPath = getRouteAsPath(pathname, query);

    this.events.emit("routeChangeStart", asPath, { shallow });

    // Simulate the async nature of this method
    if (async) await new Promise((resolve) => setImmediate(resolve));

    this.pathname = pathname;
    this.query = query;
    this.asPath = asPath;
    if (options?.locale) {
      this.locale = options.locale;
    }

    this.events.emit("routeChangeComplete", this.asPath, { shallow });

    return true;
  }
}
