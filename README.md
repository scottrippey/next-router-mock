
# `next-router-mock`

An implementation of the Next.js Router that keeps the state of the "URL" in memory (does not read or write to the
address bar).  Useful in **tests** and **Storybook**. 
Inspired by [`react-router > MemoryRouter`](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/MemoryRouter.md).

Works with NextJS v10, v11, and v12.

Install via NPM: `npm install --save-dev next-router-mock`


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Usage with Jest](#usage-with-jest)
    - [A fully working Jest example](#a-fully-working-jest-example)
- [Usage with Storybook](#usage-with-storybook)
    - [A fully working Storybook example](#a-fully-working-storybook-example)
- [Dynamic Routes](#dynamic-routes)
- [Sync vs Async](#sync-vs-async)
- [Supported Features](#supported-features)
  - [Not yet supported](#not-yet-supported)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Usage with Jest

For unit tests, the `next-router-mock` module can be used as a drop-in replacement for `next/router`:

```js
jest.mock('next/router', () => require('next-router-mock'));
```

If you want to mock `next/link`, you should also include this mock:

```js
jest.mock('next/dist/client/router', () => require('next-router-mock'));
```

### A fully working Jest example

```jsx
import singletonRouter, { useRouter } from 'next/router';
import NextLink from 'next/link';
import { render, act, fireEvent, screen, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import mockRouter from 'next-router-mock';


jest.mock('next/router', () => require('next-router-mock'));
// This is needed for mocking 'next/link':
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
    const { result } = renderHook(() => {
      return useRouter();
    });
    expect(result.current).toMatchObject({ asPath: "/initial" });
    act(() => {
      result.current.push("/example");
    });
    expect(result.current).toMatchObject({ asPath: "/example" })
  });

  it('works with next/link', () => {
    render(
      <NextLink href="/example?foo=bar"><a>Example Link</a></NextLink>
    );
    fireEvent.click(screen.getByText('Example Link'));
    expect(singletonRouter).toMatchObject({ asPath: '/example?foo=bar' });
  });
});
```


# Usage with Storybook

For Storybook, you can use `<MemoryRouterProvider>` to wrap your stories.
You can **globally** wrap all stories by adding this to `storybook/preview.js`:

```jsx
import { addDecorator } from "@storybook/react";
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider';

addDecorator((Story) => <MemoryRouterProvider><Story/></MemoryRouterProvider>);
```

You can also wrap **individual** stories with the `<MemoryRouterProvider>`, allowing you to customize the properties:

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


### A fully working Storybook example

```jsx
// example.story.jsx
import NextLink from 'next/link';
import { action } from '@storybook/addon-actions';

import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider';

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

# Dynamic Routes

By default, `next-router-mock` does not know about your dynamic routes (eg. files like `/pages/[id].js`).
To test code that uses dynamic routes, you must add the routes manually, like so:

```typescript
import mockRouter from "next-router-mock";
import { createDynamicRouteParser } from "next-router-mock/dynamic-routes";

mockRouter.useParser(createDynamicRouteParser([
  // These paths should match those found in the `/pages` folder:
  "/[id]",
  "/static/path",
  "/[dynamic]/path",
  "/[...catchAll]/path"
]));

// Example test:
it('should parse dynamic routes', () => {
  mockRouter.push('/FOO');
  expect(mockRouter).toMatchObject({
    pathname: '/[id]',
    query: { id: 'FOO' }
  });
})
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
- `router.push(url, as?, options?)`
- `router.replace(url, as?, options?)`
- `router.pathname`
- `router.asPath`
- `router.query`
- Works with `next/link` (see Jest notes)
- `router.events` supports:
  - `routeChangeStart(url, { shallow })`
  - `routeChangeComplete(url, { shallow })`
  - `hashChangeStart(url, { shallow })`
  - `hashChangeComplete(url, { shallow })`

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

