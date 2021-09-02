# `next-router-mock`

An implementation of the Next.js Router that keeps the state of the "URL" in memory (does not read or write to the
address bar). Useful in tests and in Storybook. Inspired
by [`react-router > MemoryRouter`](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/MemoryRouter.md)
.

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

> Note: it's better to mock `next/dist/client/router` instead of  `next/router`, because both `next/router` and `next/link` depend directly on this nested path.  It's also perfectly fine to mock both.

Here's a full working example:

```js
import router, { useRouter } from 'next/router';

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

# Features

Currently supported features:

- `useRouter()`
- `router.push(url)`
- `router.replace(url)`
- `router.pathname`
- `router.asPath`
- `router.query`
- `router.locale`
- `router.locales`
- `router.prefetch(url)` (does nothing)
- Works with `next/link` (see Jest notes)

## Not yet supported:

PRs welcome!

- `router.isReady`
- `router.route`
- `router.basePath`
- `router.isFallback`
- `router.back()`
- `router.beforePopState(cb)`
- `router.reload()`
