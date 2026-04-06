import { render, waitFor } from '@testing-library/react';
import App from '../pages/App/App';

beforeEach(() => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve(null) }));
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('App', () => {
  test('page renders', async () => {
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container).toBeTruthy();
    });
  });
});
