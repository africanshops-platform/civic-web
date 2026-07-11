import { useState, useEffect, useCallback } from 'react';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

// Backend uses either `payload` or `data` depending on the route
function unwrap(r) {
  return r.data?.payload ?? r.data?.data ?? r.data;
}

function makeHook(fetcher) {
  return function useHook(...args) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetch = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetcher(...args);
        setData(result);
      } catch (err) {
        setError(err?.response?.data?.message ?? err?.message ?? 'Request failed');
      } finally {
        setIsLoading(false);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [args.map(JSON.stringify).join()]);

    useEffect(() => { fetch(); }, [fetch]);
    return { data, isLoading, error, refetch: fetch };
  };
}

export const useMyAccount = makeHook(() =>
  AuthApi().get('/fintech-accounts/user/account/my-account').then(r => unwrap(r) ?? null)
);

export const useBalance = makeHook((currency = 'NGN') =>
  AuthApi().get(`/fintech-accounts/user/balance?currency=${currency}`).then(r => unwrap(r))
);

export const useStatement = makeHook((params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return AuthApi().get(`/fintech-accounts/user/statement${q ? `?${q}` : ''}`).then(r => unwrap(r));
});

export const useTransactionHistory = makeHook((params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return AuthApi().get(`/fintech-accounts/user/transaction/history${q ? `?${q}` : ''}`).then(r => unwrap(r));
});

export const useSavingsBalance = makeHook((accountNumber) =>
  accountNumber
    ? AuthApi().get(`/fintech-accounts/user/account/${accountNumber}/savings/balance`).then(r => unwrap(r))
    : Promise.resolve(null)
);

export const useWallets = makeHook((accountNumber) =>
  accountNumber
    ? AuthApi().get(`/fintech-accounts/user/account/${accountNumber}/wallets`).then(r => unwrap(r))
    : Promise.resolve(null)
);

export const useKycStatus = makeHook(() =>
  AuthApi().get('/auth-user/kyc/status').then(r => unwrap(r))
);

export const useBeneficiaries = makeHook((accountNumber) =>
  accountNumber
    ? AuthApi().get(`/fintech-accounts/user/beneficiary/list/${accountNumber}`).then(r => unwrap(r) ?? [])
    : Promise.resolve([])
);

// Public, unauthenticated Paystack passthrough routes (no guard on the gateway) —
// same ones already used by the shop-dashboard's LinkBankAccountDialog.
export const useBanksList = makeHook(() =>
  AuthApi().get('/fintech-accounts/paystack-api/banks/list?country=nigeria&perPage=100').then(r => unwrap(r) ?? [])
);

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateFintechAccount() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/user/account/create', payload);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Account creation failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useTransfer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/user/transaction/transfer', payload);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Transfer failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useResolveAccountNumber() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async ({ accountNumber, bankCode }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/paystack-api/verify-account-number', {
        account_number: accountNumber,
        bank_code: bankCode,
      });
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Could not resolve account. Check the number and bank.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useAddBeneficiary() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/user/beneficiary/add', payload);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Could not add beneficiary';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useDeleteBeneficiary() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (beneficiaryId, accountNumber) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().delete(`/fintech-accounts/user/beneficiary/${beneficiaryId}/delete?accountNumber=${accountNumber}`);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Could not remove beneficiary';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useWithdrawalInitiate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/user/withdrawal/initiate', payload);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Withdrawal initiation failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useWithdrawalConfirm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/user/withdrawal/confirm', payload);
      return unwrap(res);
    } catch (err) {
      const status = err?.response?.status;
      let msg = err?.response?.data?.message ?? 'Confirmation failed';
      if (status === 410) msg = 'OTP expired. Please start a new withdrawal.';
      if (status === 429) msg = 'Too many attempts. Withdrawal cancelled.';
      setError(msg);
      throw Object.assign(new Error(msg), { status });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useOpenSavings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (accountNumber) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post(`/fintech-accounts/user/account/${accountNumber}/savings/open`);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Failed to open savings account';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useOpenWallet() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (accountNumber, currency) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post(`/fintech-accounts/user/account/${accountNumber}/wallets/open`, { currency });
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Failed to open wallet';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export function useCrossCurrencyTransfer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi().post('/fintech-accounts/user/transaction/cross-currency-transfer', payload);
      return unwrap(res);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Transfer failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

export const CURRENCIES = ['NGN', 'GHS', 'KES', 'ZAR', 'UGX', 'TZS', 'XOF', 'XAF', 'EGP', 'MAD'];

export const CURRENCY_SYMBOLS = {
  NGN: '₦', GHS: '₵', KES: 'KSh', ZAR: 'R',
  UGX: 'USh', TZS: 'TSh', XOF: 'CFA', XAF: 'FCFA',
  EGP: 'E£', MAD: 'MAD',
};

export function formatKobo(kobo, currency = 'NGN') {
  if (kobo == null) return '—';
  const amount = parseFloat(kobo) / 100;
  return `${CURRENCY_SYMBOLS[currency] ?? currency} ${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNaira(naira, currency = 'NGN') {
  if (naira == null) return '—';
  const amount = parseFloat(naira);
  return `${CURRENCY_SYMBOLS[currency] ?? currency} ${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
