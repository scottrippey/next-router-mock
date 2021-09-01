import React from 'react';
import NextLink from 'next/link';
import { fireEvent, render, screen } from '@testing-library/react';

import MockRouter from './router';

jest.mock('next/dist/client/router', () => require('./router'));

describe('next/link', () => {
  it('should render a link', () => {
    render(<NextLink href="/example">Example Link</NextLink>);
    fireEvent.click(screen.getByText('Example Link'));
    expect(MockRouter.asPath).toEqual('/example');
  });
});
