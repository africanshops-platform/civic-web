import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

// ─── raw API layer ────────────────────────────────────────────────────────────
const api = {
  getCampaigns:        (params) => AuthApi().get('/civic/tax/campaigns', { params }),
  getCampaignDetail:   (id)     => AuthApi().get(`/civic/tax/campaigns/${id}`),
  getMyContributions:  (params) => AuthApi().get('/civic/tax/contributions/mine', { params }),
  getContribReceipt:   (id)     => AuthApi().get(`/civic/tax/contributions/${id}`),
  getLgaProjects:      (params) => AuthApi().get('/civic/tax/projects', { params }),
  contribute:          (data)   => AuthApi().post(`/civic/tax/campaigns/${data.campaignId}/contribute`, data),
  getMyObligations:    (params) => AuthApi().get('/civic/tax/obligations/mine', { params }),
  payObligation:       (data)   => AuthApi().post('/civic/tax/obligations/pay', data),
  getObligationHistory:(params) => AuthApi().get('/civic/tax/obligations/history', { params }),
  getMySplitSummary:   ()       => AuthApi().get('/civic/tax/my-split-summary'),
  updateCivicSplit:    (data)   => AuthApi().put('/auth-user/civic/profile', data),
};

// ─── helpers ─────────────────────────────────────────────────────────────────
const toNaira = (kobo) => Number(kobo) / 100;
const toKobo  = (naira) => Math.round(Number(naira) * 100);

function buildParams(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v != null && v !== '')
  );
}

// Always send page/limit as integers (never filtered out, never NaN/float)
function paginate(page, limit) {
  return { page: Math.max(1, parseInt(page, 10) || 1), limit: Math.max(1, parseInt(limit, 10) || 20) };
}

function extractPagination(d, page, limit) {
  const total      = d?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}

// ─── hooks ────────────────────────────────────────────────────────────────────

export function useCampaigns(filters = {}) {
  const { category, status, stateId, lgaId, search, page = 1, limit = 20 } = filters;
  const { page: p, limit: l } = paginate(page, limit);
  const params = { ...buildParams({ lga: lgaId, state: stateId, status, category }), page: p, limit: l };

  return useQuery(
    ['civictax-campaigns', filters],
    () => api.getCampaigns(params),
    {
      select: (res) => {
        const d = res.data;
        let campaigns = d.data ?? d.campaigns ?? [];
        if (search) {
          const q = search.toLowerCase();
          campaigns = campaigns.filter(
            (c) => c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
          );
        }
        return { data: { campaigns, pagination: extractPagination(d, p, l), stats: null } };
      },
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000,
      onError: (err) => toast.error(err?.response?.data?.message ?? 'Failed to load campaigns.'),
    }
  );
}

export function useCampaignDetail(campaignId) {
  return useQuery(
    ['civictax-campaign', campaignId],
    () => api.getCampaignDetail(campaignId),
    {
      enabled: Boolean(campaignId),
      select: (res) => ({ data: { campaign: res.data } }),
      staleTime: 3 * 60 * 1000,
    }
  );
}

export function useMyContributions(page = 1, limit = 20) {
  const { page: p, limit: l } = paginate(page, limit);
  return useQuery(
    ['civictax-my-contributions', p, l],
    () => api.getMyContributions({ page: p, limit: l }),
    {
      select: (res) => {
        const d = res.data;
        return {
          data: {
            contributions: (d.data ?? []).map((c) => ({ ...c, amountNaira: toNaira(c.amountKobo) })),
            stats:      { total: d.total ?? 0 },
            pagination: extractPagination(d, p, l),
          },
        };
      },
      keepPreviousData: true,
      staleTime: 60 * 1000,
    }
  );
}

export function useContributionReceipt(transactionId) {
  return useQuery(
    ['civictax-receipt', transactionId],
    () => api.getContribReceipt(transactionId),
    {
      enabled: Boolean(transactionId),
      select: (res) => ({ data: { receipt: res.data } }),
      staleTime: 10 * 60 * 1000,
    }
  );
}

export function useLgaProjects(filters = {}) {
  const { stateId, lgaId, status, page = 1, limit = 20 } = filters;
  const { page: p, limit: l } = paginate(page, limit);
  const params = { ...buildParams({ lga: lgaId, state: stateId, status }), page: p, limit: l };

  return useQuery(
    ['civictax-lga-projects', filters],
    () => api.getLgaProjects(params),
    {
      select: (res) => {
        const d = res.data;
        return {
          data: {
            projects:   d.data ?? d.projects ?? [],
            pagination: extractPagination(d, p, l),
          },
        };
      },
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000,
    }
  );
}

export function useContributeToCampaign() {
  const queryClient = useQueryClient();
  return useMutation(
    (payload) =>
      api.contribute({
        campaignId:      payload.campaignId,
        amountKobo:      toKobo(payload.amount),
        idempotencyKey:  crypto.randomUUID(),
        note:            payload.note ?? undefined,
      }),
    {
      onSuccess: (res) => {
        toast.success(res.data?.message ?? 'Contribution successful! Thank you for making a difference.');
        queryClient.invalidateQueries(['civictax-campaigns']);
        queryClient.invalidateQueries(['civictax-my-contributions']);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message ?? 'Contribution failed. Please try again.');
      },
    }
  );
}

// ─── Obligations ─────────────────────────────────────────────────────────────

const OBL_STATUS_MAP = {
  OVERDUE:        'overdue',
  UNPAID:         'due_soon',
  PARTIALLY_PAID: 'due_soon',
  PAID:           'paid',
  WAIVED:         'paid',
};

function normalizeObligation(obl) {
  const amountKobo  = Number(obl.amountKobo ?? 0);
  const paidKobo    = Number(obl.paidKobo ?? 0);
  const remainingKobo = Math.max(0, amountKobo - paidKobo);

  return {
    ...obl,
    // UI-friendly fields
    uiStatus:       OBL_STATUS_MAP[obl.status] ?? 'upcoming',
    amountNaira:    toNaira(amountKobo),
    paidNaira:      toNaira(paidKobo),
    remainingNaira: toNaira(remainingKobo),
    remainingKobo,
  };
}

export function useMyObligations(page = 1, limit = 20) {
  const { page: p, limit: l } = paginate(page, limit);
  return useQuery(
    ['civictax-my-obligations', p, l],
    () => api.getMyObligations({ page: p, limit: l }),
    {
      select: (res) => {
        const d = res.data;
        return {
          data: {
            obligations: (d.data ?? []).map(normalizeObligation),
            pagination:  extractPagination(d, p, l),
          },
        };
      },
      keepPreviousData: true,
      staleTime: 60 * 1000,
    }
  );
}

export function usePayObligation() {
  const queryClient = useQueryClient();
  return useMutation(
    ({ obligationId, remainingKobo }) =>
      api.payObligation({
        obligationId,
        amountKobo:     remainingKobo,
        idempotencyKey: crypto.randomUUID(),
      }),
    {
      onSuccess: () => {
        toast.success('Tax payment successful!');
        queryClient.invalidateQueries(['civictax-my-obligations']);
        queryClient.invalidateQueries(['civictax-obligation-history']);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message ?? 'Payment failed. Please try again.');
      },
    }
  );
}

export function useObligationHistory(page = 1, limit = 20) {
  const { page: p, limit: l } = paginate(page, limit);
  return useQuery(
    ['civictax-obligation-history', p, l],
    () => api.getObligationHistory({ page: p, limit: l }),
    {
      select: (res) => {
        const d = res.data;
        return {
          data: { history: d.data ?? [], pagination: extractPagination(d, p, l) },
        };
      },
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000,
    }
  );
}

// ─── My LGA split (home-origin / dwelling) ────────────────────────────────────

export function useMySplitSummary() {
  return useQuery(
    ['civictax-my-split-summary'],
    () => api.getMySplitSummary(),
    {
      select: (res) => ({ data: res.data }),
      staleTime: 60 * 1000,
    }
  );
}

export function useUpdateCivicSplit() {
  const queryClient = useQueryClient();
  return useMutation(
    (payload) => api.updateCivicSplit(payload),
    {
      onSuccess: () => {
        toast.success('Your civic-tax split has been updated.');
        queryClient.invalidateQueries(['civictax-my-split-summary']);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message ?? 'Could not update your split. Please try again.');
      },
    }
  );
}
