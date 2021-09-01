import React from 'react';
import NextLink from 'next/link';
import { fireEvent, render, screen } from '@testing-library/react';

import MockRouter from './router';

jest.mock('next/dist/client/router', () => require('./router'));

describe('next/link', () => {
  describe('clicking a link will mock navigate', () => {
    it('to a href', () => {
      render(<NextLink href="/example?foo=bar">Example Link</NextLink>);
      fireEvent.click(screen.getByText('Example Link'));
      expect(MockRouter).toMatchObject({
        asPath: '/example?foo=bar',
        pathname: '/example',
        query: { foo: 'bar' },
      });
    });

    it('to a URL object', () => {
      render(<NextLink href={{ pathname: '/example', query: { foo: 'bar' } }}>Example Link</NextLink>);
      fireEvent.click(screen.getByText('Example Link'));
      expect(MockRouter).toMatchObject({
        asPath: '/example?foo=bar',
        pathname: '/example',
        query: { foo: 'bar' },
      });
    });
  });
});
