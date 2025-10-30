import type { NextRouter, RouterEvent } from "next/router";
import mitt, { MittEmitter } from "./lib/mitt";
import { parseUrl, parseQueryString, stringifyQueryString } from "./urls";
import { createMemoryHistory, MemoryHistory } from "history";

export type Url = string | UrlObject;
export type UrlObject = {
  pathname?: string | null | undefined;
  query?: NextRouter["query"];
  hash?: string;
  search?: string;
};
export type UrlObjectComplete = {
  pathname: string;
  query: NextRouter["query"];
  hash: string;
  // While parsing, keep the routeParams separate from the query.
  // We'll merge them at the end.
  routeParams: NextRouter["query"];
};

// interface not exported by the package next/router
interface TransitionOptions {
  shallow?: boolean;
  locale?: string | false;
  scroll?: boolean;
}

type InternalEventTypes =
  /** Allows custom parsing logic */
  | "NEXT_ROUTER_MOCK:parse"
  /** Emitted when 'router.push' is called */
  | "NEXT_ROUTER_MOCK:push"
  /** Emitted when 'router.replace' is called */
  | "NEXT_ROUTER_MOCK:replace";

type RouterState = {
  asPath: string;
  pathname: string;
  query: NextRouter["query"];
  hash: string;
  locale?: string;
};

/**
 * A base implementation of NextRouter that does nothing; all methods throw.
 */
export abstract class BaseRouter implements NextRouter {
  pathname = "/";
  query: NextRouter["query"] = {};
  asPath = "/";
  /**
   * The `hash` property is NOT part of NextRouter.
   * It is only supplied as part of next-router-mock, for the sake of testing
   */
  hash = "";

  _history: MemoryHistory | null = null;

  // These are constant:
  isReady = true;
  basePath = "";
  isFallback = false;
  isPreview = false;
  isLocaleDomain = false;
  locale: NextRouter["locale"] = undefined;
  locales: NextRouter["locales"] = [];
  defaultLocale?: NextRouter["defaultLocale"];
  domainLocales?: NextRouter["domainLocales"];

  events: MittEmitter<RouterEvent | InternalEventTypes> = mitt();

  abstract push(url: Url, as?: Url, options?: TransitionOptions): Promise<boolean>;
  abstract replace(url: Url, as?: Url, options?: TransitionOptions): Promise<boolean>;
  abstract back(): void;

  forward() {
    // Not implemented
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

  // Keep route and pathname values in sync
  get route() {
    return this.pathname;
  }
}

export type MemoryRouterSnapshot = Readonly<MemoryRouter>;

/**
 * An implementation of NextRouter that does not change the URL, but just stores the current route in memory.
 */
export class MemoryRouter extends BaseRouter {
  static snapshot(original: MemoryRouter): MemoryRouterSnapshot {
    return Object.assign(new MemoryRouter(), original);
  }

  constructor(initialUrl?: Url, async?: boolean, history?: MemoryHistory) {
    super();
    if (initialUrl) this.setCurrentUrl(initialUrl);
    if (async) this.async = async;
    if (history) this.setCurrentHistory(history);
  }

  /**
   * When enabled, there will be a short delay between calling `push` and when the router is updated.
   * This is used to simulate Next's async behavior.
   * However, for most tests, it is more convenient to leave this off.
   */
  public async = false;

  /**
   * Store extra metadata, needed to support App Router (next/navigation)
   */
  public internal = {
    query: {} as NextRouter["query"],
    routeParams: {} as NextRouter["query"],
    selectedLayoutSegment: "[next-router-mock] Not Yet Implemented",
    selectedLayoutSegments: ["[next-router-mock] Not Yet Implemented"],
  };

  /**
   * Removes all event handlers, and sets the current URL back to default.
   * This will clear dynamic parsers, too.
   */
  public reset() {
    this.events = mitt();
    this.setCurrentUrl("/");
  }

  public useParser(parser: (urlObject: UrlObjectComplete) => void) {
    this.events.on("NEXT_ROUTER_MOCK:parse", parser);
    return () => this.events.off("NEXT_ROUTER_MOCK:parse", parser);
  }

  push = (url: Url, as?: Url, options?: TransitionOptions) => {
    return this._setCurrentUrl(url, as, options, "push");
  };

  replace = (url: Url, as?: Url, options?: TransitionOptions) => {
    return this._setCurrentUrl(url, as, options, "replace");
  };

  back = (): void => {
    if (this.history === null) {
      throw Error("Please provide a history instance with setCurrentHistory");
    }
    this.setCurrentUrl(this.history.location.pathname + this.history.location.search + this.history.location.hash);
  };

  public setCurrentHistory = (history: MemoryHistory) => {
    this._history = history;
    this.setCurrentUrl(history.location.pathname + history.location.search + history.location.hash);
  };

  get history() {
    return this._history;
  }

  /**
   * Store the current MemoryHistory state to history.state for the next location.
   */
  private _updateHistory(source?: "push" | "replace" | "set" | "back") {
    if (this._history === null) {
      throw Error("Please provide a history instance with setCurrentHistory");
      return;
    }
    switch (source) {
      case "push":
        this._history.push(this._state.asPath, this._state);
        break;
      case "replace":
        this._history.replace(this._state.asPath, this._state);
        break;
      case "set":
        this._history = createMemoryHistory({ initialEntries: [this._state.asPath] });
        break;
      case "back":
        this._history.back();
        break;
    }
  }

  private get _state(): RouterState {
    return {
      asPath: this.asPath,
      pathname: this.pathname,
      query: this.query,
      hash: this.hash,
      locale: this.locale,
    };
  }

  private _updateState(asPath: string, route: UrlObjectComplete, locale: TransitionOptions["locale"]) {
    this.asPath = asPath;
    this.pathname = route.pathname;
    this.query = { ...route.query, ...route.routeParams };
    this.hash = route.hash;
    if (locale) this.locale = locale;
  }

  /**
   * Sets the current Memory route to the specified url, synchronously.
   */
  public setCurrentUrl = (url: Url, as?: Url) => {
    // (ignore the returned promise)
    void this._setCurrentUrl(url, as, undefined, "set", false);
  };

  private async _setCurrentUrl(
    url: Url,
    as?: Url,
    options?: TransitionOptions,
    source?: "push" | "replace" | "set" | "back",
    async = this.async
  ) {
    // Parse the URL if needed:
    const newRoute = parseUrlToCompleteUrl(url, this.pathname);
    // Optionally apply dynamic routes (can mutate routes)
    this.events.emit("NEXT_ROUTER_MOCK:parse", newRoute);

    let asPath: string;
    if (as === undefined || as === null) {
      asPath = getRouteAsPath(newRoute);
    } else {
      const asRoute = parseUrlToCompleteUrl(as, this.pathname);
      this.events.emit("NEXT_ROUTER_MOCK:parse", asRoute);

      asPath = getRouteAsPath(asRoute);

      // "as" hash and route params always take precedence:
      newRoute.hash = asRoute.hash;
      newRoute.routeParams = asRoute.routeParams;
    }

    const shallow = options?.shallow || false;

    // Fire "start" event:
    const triggerHashChange = shouldTriggerHashChange(this, newRoute);
    if (triggerHashChange) {
      this.events.emit("hashChangeStart", asPath, { shallow });
    } else {
      this.events.emit("routeChangeStart", asPath, { shallow });
    }

    // Simulate the async nature of this method
    if (async) await new Promise((resolve) => setTimeout(resolve, 0));

    // Update this instance:
    if (this.history) {
      this._updateHistory(source);
    }
    this._updateState(asPath, newRoute, options?.locale);
    this.internal.query = newRoute.query;
    this.internal.routeParams = newRoute.routeParams;

    // Fire "complete" event:
    if (triggerHashChange) {
      this.events.emit("hashChangeComplete", this.asPath, { shallow });
    } else {
      this.events.emit("routeChangeComplete", this.asPath, { shallow });
    }

    // Fire internal events:
    const eventName =
      source === "push" ? "NEXT_ROUTER_MOCK:push" : source === "replace" ? "NEXT_ROUTER_MOCK:replace" : undefined;
    if (eventName) this.events.emit(eventName, this.asPath, { shallow });

    return true;
  }
}

/**
 * Normalizes the url or urlObject into a UrlObjectComplete.
 */
function parseUrlToCompleteUrl(url: Url, currentPathname: string): UrlObjectComplete {
  const parsedUrl = typeof url === "object" ? url : parseUrl(url);

  const queryFromSearch = parsedUrl.search ? parseQueryString(parsedUrl.search) : undefined;
  const query = queryFromSearch ?? parsedUrl.query ?? {};

  return {
    pathname: normalizeTrailingSlash(parsedUrl.pathname ?? currentPathname),
    query,
    hash: parsedUrl.hash || "",
    routeParams: {},
  };
}

/**
 * Creates a URL from a pathname + query.
 * Injects query params into the URL slugs, the same way that next/router does.
 */
function getRouteAsPath({ pathname, query, hash, routeParams }: UrlObjectComplete) {
  const remainingQuery = { ...query };

  // Replace slugs, and remove them from the `query`
  let asPath = pathname.replace(/\[{1,2}(.+?)]{1,2}/g, ($0, slug: string) => {
    if (slug.startsWith("...")) slug = slug.replace("...", "");

    let value = routeParams[slug];
    if (!value) {
      // Pop the slug value from the query:
      value = remainingQuery[slug]!;
      delete remainingQuery[slug];
    }

    if (Array.isArray(value)) {
      return value.map((v) => encodeURIComponent(v)).join("/");
    }
    return value !== undefined ? encodeURIComponent(String(value)) : "";
  });

  // Remove any trailing slashes; this can occur if there is no match for a catch-all slug ([[...slug]])
  asPath = normalizeTrailingSlash(asPath);

  // Append remaining query as a querystring, if needed:
  const qs = stringifyQueryString(remainingQuery);

  if (qs) asPath += `?${qs}`;
  if (hash) asPath += hash;

  return asPath;
}

function normalizeTrailingSlash(path: string) {
  return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path || "/";
}

function shouldTriggerHashChange(current: MemoryRouter, newRoute: Pick<MemoryRouter, "hash" | "query" | "pathname">) {
  const isHashChange = current.hash !== newRoute.hash;
  const isQueryChange = stringifyQueryString(current.query) !== stringifyQueryString(newRoute.query);
  const isRouteChange = isQueryChange || current.pathname !== newRoute.pathname;

  /**
   * Try to replicate NextJs routing behaviour:
   *
   * /foo       -> routeChange
   * /foo#baz   -> hashChange
   * /foo#baz   -> hashChange
   * /foo       -> hashChange
   * /foo       -> routeChange
   * /bar#fuz   -> routeChange
   */
  return !isRouteChange && (isHashChange || newRoute.hash);
}
