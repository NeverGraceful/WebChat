import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
// import ResizeObserver from 'resize-observer-polyfill';
// global.ResizeObserver = ResizeObserver;
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './../src/components/router';

const mock = new MockAdapter(axios);

describe('App component', () => {
    const queryClient = new QueryClient();
  
    beforeEach(() => {
      render(
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      );
    });
  
    test('renders without crashing', () => {
        // No need to render App here, as it's already rendered in beforeEach
        // Test logic goes here
    });

});

