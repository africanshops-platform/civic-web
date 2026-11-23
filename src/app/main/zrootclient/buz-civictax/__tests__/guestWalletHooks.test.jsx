import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

const mockGet = jest.fn(() => Promise.resolve({ data: { availableBalance: 500000 } }));
jest.mock('app/configs/data/client/RepositoryAuthClient', () => ({ AuthApi: () => ({ get: mockGet, post: jest.fn() }) }));
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

import { useMyCivicWallet, useSpendingBalance } from '../hooks/useCivicTaxRepo';

const wrapper = ({ children }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe('wallet hooks on a public page', () => {
  beforeEach(() => {
    mockGet.mockClear();
    localStorage.clear();
  });

  it('a guest sends no authenticated call (a 401 would reset the session and reload the page)', async () => {
    renderHook(() => ({ w: useMyCivicWallet(), s: useSpendingBalance() }), { wrapper });
    await new Promise((r) => setTimeout(r, 50));
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('a signed-in citizen still gets the wallet and the spending balance', async () => {
    localStorage.setItem('jwt_access_token', 'token');
    const { result } = renderHook(() => ({ w: useMyCivicWallet(), s: useSpendingBalance() }), { wrapper });
    await waitFor(() => expect(result.current.s.data).toBeDefined());
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});
