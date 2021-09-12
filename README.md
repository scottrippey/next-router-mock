# `next-router-mock`

An implementation of the Next.js Router that keeps the state of the "URL" in memory (does not read or write to the
address bar). Useful in tests. Inspired
by [`react-router > MemoryRouter`](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/MemoryRouter.md).

# API

`next-router-mock` is a drop-in replacement for `next/router`. It exports both a default (singleton) router and
the `useRouter` hook.

Install via NPM: `npm install --save-dev next-router-mock`

### Jest

Simply drop-in the `next-router-mock` like this:

```js
jest.mock('next/router', () => require('next-router-mock'));
// or this:
jest.mock('next/dist/client/router', () => require('next-router-mock'));
```

> Note: it's better to mock `next/dist/client/router` instead of  `next/router`, because both `next/router` and `next/link` depend directly on this nested path. It's also perfectly fine to mock both.

Here's a full working example:

```js
import router, { useRouter } from 'next/router';
import NextLink from 'next/link';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('next/dist/client/router', () => require('next-router-mock'));

describe('router', () => {
  it('supports the `push` and `replace` methods', () => {
    router.push('/foo?bar=baz');
    expect(router).toMatchObject({
      asPath: '/foo?bar=baz',
      pathname: '/foo',
      query: { bar: 'baz' },
    });
  });
  
  it('supports url object routes too', () => {
    router.push({
      pathname: '/foo/[id]',
      query: { id: '123', bar: 'baz' },
    });
    expect(router).toMatchObject({
      asPath: '/foo/123?bar=baz',
      pathname: '/foo/[id]',
      query: { bar: 'baz' },
    });
  });

  it('next/link can be tested too', () => {
    render(<NextLink href="/example?foo=bar">Example Link</NextLink>);
    fireEvent.click(screen.getByText('Example Link'));
    expect(router).toMatchObject({
      asPath: '/example?foo=bar',
      pathname: '/example',
      query: { foo: 'bar' },
    });
  });
});
```

[comment]: <> (# `next-router-mock/async`)
# Sync vs Async

By default, `next-router-mock` handles route changes synchronously.  This is convenient for testing, and works for most use-cases.  
However, Next normally handles route changes asynchronously, and in certain cases you might actually rely on that behavior.  If that's the case, you can use `next-router-mock/async`.  Tests will need to account for the async behavior too; for example:

```jsx
  it('next/link can be tested too', async () => {
    render(<NextLink href="/example?foo=bar">Example Link</NextLink>);
    fireEvent.click(screen.getByText('Example Link'));
    await waitFor(() => {
      expect(router).toMatchObject({
        asPath: '/example?foo=bar',
        pathname: '/example',
        query: { foo: 'bar' },
      });
    });
  });
```


# Supported Features

- `useRouter()`
- `router.push(url, as, options)`
- `router.replace(url, as, options)`
- `router.pathname`
- `router.asPath`
- `router.query`
- `router.locale`
- `router.locales`
- `router.prefetch(url)` (does nothing)
- Works with `next/link` (see Jest notes)
- `router.events` supports:
  - `routeChangeStart(url, { shallow })`
  - `routeChangeComplete(url, { shallow })`

## Not yet supported:

PRs welcome!

- `router.isReady`
- `router.route`
- `router.basePath`
- `router.isFallback`
- `router.back()`
- `router.beforePopState(cb)`
- `router.reload()`
- `router.events` not yet supported: 
  - `routeChangeError`
  - `beforeHistoryChange`
  - `hashChangeStart`
  - `hashChangeComplete`

