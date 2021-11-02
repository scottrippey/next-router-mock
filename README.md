
# `next-router-mock`

An implementation of the Next.js Router that keeps the state of the "URL" in memory (does not read or write to the
address bar).  Useful in **tests** and **Storybook**. Inspired
by [`react-router > MemoryRouter`](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/MemoryRouter.md)
.

Tested with NextJS v10 and v11.

Install via NPM: `npm install --save-dev next-router-mock`


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Quick Start](#quick-start)
- [Usage with Jest](#usage-with-jest)
- [Usage with Storybook](#usage-with-storybook)
    - [`MemoryRouterProvider` compatibility with Next 10](#memoryrouterprovider-compatibility-with-next-10)
- [Sync vs Async](#sync-vs-async)
- [Supported Features](#supported-features)
  - [Not yet supported](#not-yet-supported)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Quick Start

For unit tests, the `next-router-mock` module can be used as a drop-in replacement for `next/router`. It exports both a default (singleton) router and
the `useRouter` hook.  Example:
```jsx
jest.mock('next/router', () => require('next-router-mock'))
```

For Storybook, you can use `<MemoryRouterProvider>` to wrap your stories.  Example:
```jsx
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider';
addDecorator(Story => <MemoryRouterProvider><Story /></MemoryRouterProvider>);
```

# Usage with Jest

Simply drop-in the `next-router-mock` like this:

```jsx
jest.mock('next/router', () => require('next-router-mock'));
// or this:
jest.mock('next/dist/client/router', () => require('next-router-mock'));
```

> Note: it's better to mock `next/dist/client/router` instead of  `next/router`, because both `next/router` and `next/link` depend directly on this nested path. It's also perfectly fine to mock both.

Here's a full working example:

```jsx
import singletonRouter, { useRouter } from 'next/router';
import NextLink from 'next/link';
import { render, act, fireEvent, screen, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import mockRouter from 'next-router-mock';

// This is all you need:
jest.mock('next/dist/client/router', () => require('next-router-mock'));

describe('next-router-mock', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl("/initial");
  });

  it('supports `push` and `replace` methods', () => {
    singletonRouter.push('/foo?bar=baz');
    expect(singletonRouter).toMatchObject({
      asPath: '/foo?bar=baz',
      pathname: '/foo',
      query: { bar: 'baz' },
    });
  });

  it('supports URL objects with templates', () => {
    singletonRouter.push({
      pathname: '/[id]/foo',
      query: { id: '123', bar: 'baz' },
    });
    expect(singletonRouter).toMatchObject({
      asPath: '/123/foo?bar=baz',
      pathname: '/[id]/foo',
      query: { bar: 'baz' },
    });
  });

  it('mocks useRouter', () => {
    const { result } = renderHook(() => useRouter());
    expect(result.current).toMatchObject({ asPath: "" });
    act(() => {
      result.current.push("/example");
    });
    expect(result.current).toMatchObject({ asPath: "/example" })
  });

  it('works with next/link', () => {
    render(<NextLink href="/example?foo=bar"><a>Example Link</a></NextLink>);
    fireEvent.click(screen.getByText('Example Link'));
    expect(singletonRouter).toMatchObject({ asPath: '/example?foo=bar' });
  });
});
```

# Usage with Storybook

For Storybook, we use a Context-based approach to supply the mocks. You can globally wrap all stories by adding this to `storybook/preview.js`:

```jsx
import { addDecorator } from "@storybook/react";
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider';

addDecorator((Story) => <MemoryRouterProvider><Story/></MemoryRouterProvider>);
```

You can also wrap individual stories with the provider, allowing you to customize the properties:

```jsx
export const ExampleStory = () => (
  <MemoryRouterProvider url="/initial-url">
    <NextLink href="/example"><a>Example Link</a></NextLink>
  </MemoryRouterProvider>
);
```


The `MemoryRouterProvider` has the following optional properties:

- `url` (`string` or `object`) sets the current route's URL to a string or URL object
- `async` enables async mode, if necessary (see section below for details)
- Events:
  - `onPush(url, { shallow })`
  - `onReplace(url, { shallow })`
  - `onRouteChangeStart(url, { shallow })`
  - `onRouteChangeComplete(url, { shallow })`

Full Example:

```jsx
export const ExampleStory = () => (
  <MemoryRouterProvider
    url="/initial"
    async
    onPush={action('push')}
    onReplace={action('replace')}
    onRouteChangeStart={action('routeChangeStart')}
    onRouteChangeComplete={action('routeChangeComplete')}
  >
    <NextLink href="/example"><a>Example Link</a></NextLink>
  </MemoryRouterProvider>
);
```

### `MemoryRouterProvider` compatibility with Next 10

The above examples work with Next `v11.1.0` or higher.   

If you are using Next `v10.*` or `v11.0.*`, simply use the following import instead:
```js
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider/next-10';
```


# Dynamic Routes

To mock Next's dynamic routing behavior, you will need to import the optional extensions and register any static or dynamic routes you use in your application (or just those that are relevant for the code under test).

```typescript
import mockRouter from "next-router-mock";
import "next-router-mock/dynamic-routes";

mockRouter.registerPaths([
  "/example/static/path",
  "/example/[dynamic]/path",
  "/example/[...catchAll]/path"
]);
```

For Next 10 support, use
```typescript
import "next-router-mock/dynamic-routes/next-10";
```

# Sync vs Async

By default, `next-router-mock` handles route changes synchronously. This is convenient for testing, and works for most
use-cases.  
However, Next normally handles route changes asynchronously, and in certain cases you might actually rely on that
behavior. If that's the case, you can use `next-router-mock/async`. Tests will need to account for the async behavior
too; for example:

```jsx
it('next/link can be tested too', async () => {
  render(<NextLink href="/example?foo=bar"><a>Example Link</a></NextLink>);
  fireEvent.click(screen.getByText('Example Link'));
  await waitFor(() => {
    expect(singletonRouter).toMatchObject({
      asPath: '/example?foo=bar',
      pathname: '/example',
      query: { foo: 'bar' },
    });
  });
});
```

# Supported Features

- `useRouter()`
- `withRouter(Component)`
- `router.push(url, as, options)`
- `router.replace(url, as, options)`
- `router.pathname`
- `router.asPath`
- `router.query`
- Works with `next/link` (see Jest notes)
- `router.events` supports:
  - `routeChangeStart(url, { shallow })`
  - `routeChangeComplete(url, { shallow })`

## Not yet supported

PRs welcome!  
These fields just have default values; these methods do nothing.

- `router.isReady`
- `router.route`
- `router.basePath`
- `router.isFallback`
- `router.isLocaleDomain`
- `router.locale`
- `router.locales`
- `router.defaultLocale`
- `router.domainLocales`
- `router.prefetch()`
- `router.back()`
- `router.beforePopState(cb)`
- `router.reload()`
- `router.events` not implemented:
  - `routeChangeError`
  - `beforeHistoryChange`
  - `hashChangeStart`
  - `hashChangeComplete`

