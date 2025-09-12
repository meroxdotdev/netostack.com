import '@testing-library/jest-dom/vitest';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// MSW server for mocking API calls
export const server = setupServer(
  // Default handlers
  http.post('/api/internal/diagnostics/dns', () => {
    return HttpResponse.json({ mock: true });
  }),
  http.post('/api/internal/diagnostics/rdap', () => {
    return HttpResponse.json({ mock: true });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());