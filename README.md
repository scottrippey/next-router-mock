
# `next-router-mock`

An implementation of the Next.js Router that keeps the state of the "URL" in memory (does not read or write to the
address bar).  Useful in **tests** and **Storybook**. 
Inspired by [`react-router > MemoryRouter`](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/MemoryRouter.md).

Tested with NextJS v13, v12, v11, and v10.

Install via NPM: `npm install --save-dev next-router-mock`


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Usage with Jest](#usage-with-jest)
    - [Jest Configuration](#jest-configuration)
    - [Jest Example](#jest-example)
- [Usage with Storybook](#usage-with-storybook)
    - [Storybook Configuration](#storybook-configuration)
    - [Storybook Example](#storybook-example)
- [Compatibility with `next/link`](#compatibility-with-nextlink)
    - [Example: `next/link` with React Testing Library](#example-nextlink-with-react-testing-library)
    - [Example: `next/link` with Enzyme](#example-nextlink-with-enzyme)
    - [Example: `next/link` with Storybook](#example-nextlink-with-storybook)
- [Dynamic Routes](#dynamic-routes)
- [Sync vs Async](#sync-vs-async)
- [Supported Features](#supported-features)
  - [Not yet supported](#not-yet-supported)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Usage with Jest

### Jest Configuration
For unit tests, the `next-router-mock` module can be used as a drop-in replacement for `next/router`:

```js
jest.mock('next/router', () => require('next-router-mock'));
```

You can do this once per spec file, or you can [do this globally using `setupFilesAfterEnv`](https://jestjs.io/docs/configuration/#setupfilesafterenv-array).

### Jest Example

In your tests, use the router from `next-router-mock` to set the current URL and to make assertions.

```jsx
import { useRouter } from 'next/router';
import { render, screen, fireEvent } from '@testing-library/react';
import mockRouter from 'next-router-mock';

jest.mock('next/router', () => jest.requireActual('next-router-mock'))

const ExampleComponent = ({ href = '' }) => {
  const router = useRouter();
  return (
    <button onClick={() => router.push(href)}>
      The current route is: "{router.asPath}"
    </button>
  );
}

describe('next-router-mock', () => {
  it('mocks the useRouter hook', () => {
    // Set the initial url:
    mockRouter.push("/initial-path");
    
    // Render the component:
    render(<ExampleComponent href="/foo?bar=baz" />);
    expect(screen.getByRole('button')).toHaveText(
      'The current route is: "/initial-path"'
    );

    // Click the button:
    fireEvent.click(screen.getByRole('button'));
    
    // Ensure the router was updated:
    expect(mockRouter).toMatchObject({ 
      asPath: "/foo?bar=baz",
      pathname: "/foo",
      query: { bar: "baz" },
    });
  });
});
```


# Usage with Storybook

### Storybook Configuration
Globally enable `next-router-mock` by adding the following webpack alias to your Storybook configuration.

In `.storybook/main.js` add:
```js
module.exports = {
  webpackFinal: async (config, { configType }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "next/router": "next-router-mock",
    };
    return config;
  },
};
```

This ensures that all your components that use `useRouter` will work in Storybook.  If you also need to test `next/link`, please see the section [Example: **`next/link` with Storybook**](#example-nextlink-with-storybook).

### Storybook Example

In your individual stories, you might want to mock the current URL (eg. for testing an "ActiveLink" component), or you might want to log `push/replace` actions.  You can do this by wrapping your stories with the `<MemoryRouterProvider>` component.  

```jsx
// ActiveLink.story.jsx
import { action } from '@storybook/addon-actions';
import { MemoryRouterProvider } 
  from 'next-router-mock/MemoryRouterProvider/next-13';
import { ActiveLink } from './active-link';

export const ExampleStory = () => (
  <MemoryRouterProvider url="/active" onPush={action("router.push")}>
    <ActiveLink href="/example">Not Active</ActiveLink>
    <ActiveLink href="/active">Active</ActiveLink>
  </MemoryRouterProvider>
);
```

> Be sure to import from **a matching Next.js version**: 
> ```
> import { MemoryRouterProvider } 
>   from 'next-router-mock/MemoryRouterProvider/next-13.5';
> ```
> Choose from `next-13.5`, `next-13`, `next-12`, or `next-11`.

The `MemoryRouterProvider` has the following optional properties:

- `url` (`string` or `object`) sets the current route's URL
- `async` enables async mode, if necessary (see "Sync vs Async" for details)
- Events:
  - `onPush(url, { shallow })`
  - `onReplace(url, { shallow })`
  - `onRouteChangeStart(url, { shallow })`
  - `onRouteChangeComplete(url, { shallow })`


# Compatibility with `next/link`

To use `next-router-mock` with `next/link`, you must use a `<MemoryRouterProvider>` to wrap the test component.

### Example: `next/link` with React Testing Library

When rendering, simply supply the option `{ wrapper: MemoryRouterProvider }`

```jsx
import { render } from '@testing-library/react';
import NextLink from 'next/link';

import mockRouter from 'next-router-mock';
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider';

it('NextLink can be rendered', () => {
  render(
    <NextLink href="/example">Example Link</NextLink>, 
    { wrapper: MemoryRouterProvider }
  );
  fireEvent.click(screen.getByText('Example Link'));
  expect(mockRouter.asPath).toEqual('/example')
});
```

### Example: `next/link` with Enzyme

When rendering, simply supply the option `{ wrapperComponent: MemoryRouterProvider }`

```jsx
import { shallow } from 'enzyme';
import NextLink from 'next/link';

import mockRouter from 'next-router-mock';
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider';

it('NextLink can be rendered', () => {
  const wrapper = shallow(
    <NextLink href="/example">Example Link</NextLink>, 
    { wrapperComponent: MemoryRouterProvider }
  );
  
  wrapper.find('a').simulate('click');
  
  expect(mockRouter.asPath).to.equal('/example')
});
```

### Example: `next/link` with Storybook

In Storybook, you must wrap your component with the `<MemoryRouterProvider>` component (with optional `url` set).

```jsx
// example.story.jsx
import NextLink from 'next/link';
import { action } from '@storybook/addon-actions';

import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider/next-13.5';

export const ExampleStory = () => (
  <MemoryRouterProvider url="/initial">
    <NextLink href="/example">Example Link</NextLink>
  </MemoryRouterProvider>
);
```

This can be done inline (as above).  
It can also be implemented as a `decorator`, which can be per-Story, per-Component, or Global (see [Storybook Decorators Documentation](https://storybook.js.org/docs/react/writing-stories/decorators) for details).  
Global example:

```
// .storybook/preview.js
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider';

export const decorators = [
  (Story) => <MemoryRouterProvider><Story /></MemoryRouterProvider>
]; 
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
- `router.route`
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

