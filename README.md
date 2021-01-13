# `next-router-mock`
An implementation of the Next.js Router that keeps the state of the "URL" in memory (does not read or write to the address bar).  Useful in tests and in Storybook.
Inspired by [`react-router > MemoryRouter`](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/MemoryRouter.md). 

# API

`next-router-mock` is a drop-in replacement for `next/router`. It exports both a default (singleton) router and the `useRouter` hook.

Install via NPM: `npm install --save-dev next-router-mock`

### Jest
```js
import router, { useRouter } from 'next/router';

jest.mock('next/router', () => require('next-router-mock'));

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
});
```
### Storybook
{TODO}

# Features

Currently supported features:

- `useRouter()`
- `router.push(url)`
- `router.replace(url)`
- `router.pathname`
- `router.asPath`
- `router.query`

## Not yet supported:
- `router.isReady`
- `router.route`
- `router.basePath`
- `router.isFallback`
- `router.back()`
- `router.beforePopState(cb)`
- `router.prefetch(url)`
- `router.reload()`
