import type { NextRouter, RouterEvent } from "next/router";
import { createMemoryHistory, type MemoryHistory } from "history";
import mitt, { MittEmitter } from "./lib/mitt";
import { parseUrl, parseQueryString, stringifyQueryString } from "./urls";

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
  | "NEXT_ROUTER_MOCK:replace"
  /** Emitted when 'router.back' is called */
  | "NEXT_ROUTER_MOCK:back";

type RouterState = {
  asPath: string;
  pathname: string;
  query: NextRouter["query"];
  hash: string;
  locale?: string | false | undefined;
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

  _history: MemoryHistory = createMemoryHistory();

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
  abstract replace(url: Url): Promise<boolean>;
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
   * This method was removed in v0.7.0.
   * It has been replaced with "mockRouter.useParser(createDynamicRouteParser(...))"
   * See the README for more details on upgrading.
   * @deprecated
   */
  registerPaths: { ["This method has been replaced"]: "See the README for more details on upgrading" } = (() => {
    throw new Error(`
       This method was removed in v0.7.0.
       It has been replaced with "mockRouter.useParser(createDynamicRouteParser(...))"
       See the README for more details on upgrading.
    `);
  }) as any;

  useParser(parser: (urlObject: UrlObjectComplete) => void) {
    this.events.on("NEXT_ROUTER_MOCK:parse", parser);
    return () => this.events.off("NEXT_ROUTER_MOCK:parse", parser);
  }

  push = (url: Url, as?: Url, options?: TransitionOptions) => {
    return this._setCurrentUrl(url, as, options, "push");
  };

  replace = (url: Url, as?: Url, options?: TransitionOptions) => {
    return this._setCurrentUrl(url, as, options, "replace");
  };

  back = () => {
    this._back();
  };

  /**
   * Sets the current MemoryHistory.
   */
  public setCurrentHistory = (history: MemoryHistory) => {
    this._history = history;
    this.setCurrentUrl(history.location.pathname + history.location.search + history.location.hash);
  };

  /**
   * Returns the current MemoryHistory.
   * history.state property represents the previous location's state in MemoryHistory.
   */
  get history() {
    return {
      ...this._history,
      createHref(to) {
        throw new Error("You cannot use history.createHref() because it is a stateless.");
      },
      push(to, state) {
        throw new Error("You cannot use history.push() because it is a stateless.");
      },
      replace(to, state) {
        throw new Error("You cannot use history.replace() because it is a stateless.");
      },
      go(delta) {
        throw new Error("You cannot use history.go() because it is a stateless.");
      },
      back() {
        throw new Error("You cannot use history.back() because it is a stateless.");
      },
      forward() {
        throw new Error("You cannot use history.forward() because it is a stateless.");
      },
      listen() {
        throw new Error("You cannot use history.listen() because it is a stateless.");
      },
      block(blocker) {
        throw new Error("You cannot use history.block() because it is a stateless.");
      },
    } satisfies MemoryHistory;
  }

  /**
   * Store the current MemoryHistory state to history.state for the next location.
   */
  private _updateHistory(source?: "push" | "replace" | "back" | "set") {
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

  private set _state(state: RouterState) {
    this.asPath = state.asPath;
    this.pathname = state.pathname;
    this.query = state.query;
    this.hash = state.hash;
    if (state.locale) this.locale = state.locale;
  }

  private _updateState(asPath: string, route: UrlObjectComplete, locale: TransitionOptions["locale"]) {
    this._state = {
      asPath,
      pathname: route.pathname,
      query: { ...route.query, ...route.routeParams },
      hash: route.hash,
      locale,
    };
  }

  private _getPreviousState() {
    const state = this._history.location.state as RouterState;
    return {
      asPath: state.asPath,
      pathname: state.pathname,
      query: state.query,
      hash: state.hash,
      locale: state.locale,
    };
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
    source?: "push" | "replace" | "set",
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

    // Store the current state as the previous state. (must be called before "_updateState"!!!)
    this._updateHistory(source);

    // Update this instance:
    this._updateState(asPath, newRoute, options?.locale);

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

  private _back() {
    const previousState = this._getPreviousState();
    this.events.emit("routeChangeStart", previousState.asPath);
    this._state = previousState;
    this._updateHistory("back");
    this.events.emit("routeChangeComplete", previousState.asPath);
    this.events.emit("NEXT_ROUTER_MOCK:back", previousState.asPath);
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
