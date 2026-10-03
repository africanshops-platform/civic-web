import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

// ─── raw API layer ────────────────────────────────────────────────────────────
const api = {
  getCampaigns:        (params) => AuthApi().get('/civic/subscriptions/campaigns', { params }),
  getCampaignDetail:   (id)     => AuthApi().get(`/civic/subscriptions/campaigns/${id}`),
  getMyContributions:  (params) => AuthApi().get('/civic/subscriptions/contributions/mine', { params }),
  getContribReceipt:   (id)     => AuthApi().get(`/civic/subscriptions/contributions/${id}`),
  getLgaProjects:      (params) => AuthApi().get('/civic/subscriptions/projects', { params }),
  getProjectFunding:   (campaignId) => AuthApi().get(`/civic/subscriptions/campaigns/${campaignId}/funding`),
  contribute:          (data)   => AuthApi().post(`/civic/subscriptions/campaigns/${data.campaignId}/contribute`, data),
  getMyObligations:    (params) => AuthApi().get('/civic/subscriptions/obligations/mine', { params }),
  payObligation:       (data)   => AuthApi().post('/civic/subscriptions/obligations/pay', data),
  payObligations:      (data)   => AuthApi().post('/civic/subscriptions/obligations/pay-many', data),
  getObligationHistory:(params) => AuthApi().get('/civic/subscriptions/obligations/history', { params }),
  getMySplitSummary:   ()       => AuthApi().get('/civic/subscriptions/my-split-summary'),
  updateCivicSplit:    (data)   => AuthApi().put('/auth-user/civic/profile', data),
  getCheckoutReadiness:()       => AuthApi().get('/checkout-readiness/civic-subscriptions'),
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

/** The API sends kobo amounts, a flat jurisdiction and an uppercase status; the screens read naira, a nested jurisdiction and a lowercase status. */
export function normalizeCampaign(c) {
  if (!c) return c;
  const kobo = (v) => (v == null ? 0 : Number(v) / 100);
  return {
    ...c,
    raisedAmount: c.raisedAmount ?? kobo(c.raisedAmountKobo),
    targetAmount: c.targetAmount ?? kobo(c.targetAmountKobo),
    contributorsCount: c.contributorsCount ?? c._count?.contributions ?? 0,
    status: typeof c.status === 'string' ? c.status.toLowerCase() : c.status,
    jurisdiction: c.jurisdiction ?? { country: c.country, state: c.state, lga: c.lga, ward: c.ward },
  };
}

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
        let campaigns = (d.data ?? d.campaigns ?? []).map(normalizeCampaign);
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
      select: (res) => ({ data: { campaign: normalizeCampaign(res.data) } }),
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
      select: (res) => {
        const r = res.data || {};
        return {
          data: {
            receipt: {
              ...r,
              transactionId: r.transactionId ?? r.id,
              amount: r.amount ?? (r.amountKobo == null ? 0 : Number(r.amountKobo) / 100),
              campaignTitle: r.campaignTitle ?? r.campaign?.title,
              campaignCategory: r.campaignCategory ?? r.campaign?.category,
              jurisdiction: r.jurisdiction ?? { lga: r.campaign?.lga, state: r.campaign?.state },
              message: r.message ?? r.note,
            },
          },
        };
      },
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

/**
 * Pre-flight check: are civictax-service + fintech-service up? Call right
 * before enabling "Contribute"/"Pay Now" on a campaign contribution or
 * subscription obligation payment — the gateway caches its answer for
 * ~10s, so a short refetch interval here still mostly hits cache.
 */
export function useCivicSubscriptionsReadiness(enabled = true) {
  return useQuery(['civictax-checkout-readiness'], () => api.getCheckoutReadiness(), {
    enabled,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 5000,
    select: (res) => res?.data,
  });
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
        queryClient.invalidateQueries(['civictax-campaign']);
        queryClient.invalidateQueries(['civictax-project-funding']);
        queryClient.invalidateQueries(['civictax-lga-projects']);
        queryClient.invalidateQueries(['civictax-my-contributions']);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message ?? 'Contribution failed. Please try again.');
      },
    }
  );
}

// ─── Obligations ─────────────────────────────────────────────────────────────

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** The month a bill is FOR ("2026-12"), from the generator's key or, for older manual bills, its due date. */
function monthKeyOfObligation(obl) {
  if (obl.generatedForMonth) return obl.generatedForMonth;
  const d = new Date(obl.dueDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function normalizeObligation(obl) {
  const amountKobo  = Number(obl.amountKobo ?? 0);
  const paidKobo    = Number(obl.paidKobo ?? 0);
  const remainingKobo = Math.max(0, amountKobo - paidKobo);

  // Month-mapped subscriptions: a bill is overdue / due now / upcoming by the MONTH it is for, not by a status flag.
  const monthKey = monthKeyOfObligation(obl);
  const [y, m] = monthKey.split('-').map(Number);
  const now = new Date();
  const monthDelta = y * 12 + (m - 1) - (now.getFullYear() * 12 + now.getMonth());
  const settled = obl.status === 'PAID' || obl.status === 'WAIVED';
  let uiStatus = 'paid';
  if (!settled) {
    if (monthDelta < 0) uiStatus = 'overdue';
    else if (monthDelta === 0) uiStatus = 'due_soon';
    else uiStatus = 'upcoming';
  }
  const heldPrepaid = (obl.payments ?? []).some((pay) => pay.holdStatus === 'HELD');

  return {
    ...obl,
    // UI-friendly fields
    uiStatus,
    monthKey,
    monthLabel: `${MONTH_NAMES[m - 1]} ${y}`,
    isFutureMonth: monthDelta > 0,
    heldPrepaid,
    amountNaira:    toNaira(amountKobo),
    paidNaira:      toNaira(paidKobo),
    remainingNaira: toNaira(remainingKobo),
    remainingKobo,
    // civic-17: where the money actually went — [{ label: 'HOME_ORIGIN'|'DWELLING', lga, state, amountNaira }] from the
    // payment(s)' recorded split. Empty for unpaid rows and for payments made before splits were recorded.
    paidSplits: (obl.payments ?? [])
      .flatMap((pay) => (Array.isArray(pay.splitBreakdown) ? pay.splitBreakdown : []))
      .map((sp) => ({
        label: sp.label,
        lga: sp.jurisdiction?.lga,
        state: sp.jurisdiction?.state,
        amountNaira: toNaira(Number(sp.amountKobo ?? 0)),
      })),
  };
}

export function useMyObligations(page = 1, limit = 50) {
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

/** Pay several months at once (e.g. the rest of the year). Future months are held and released in their month. */
export function usePayObligations() {
  const queryClient = useQueryClient();
  return useMutation(
    (obligationIds) => api.payObligations({ obligationIds, idempotencyKey: crypto.randomUUID() }),
    {
      onSuccess: (res) => {
        const d = res.data ?? {};
        if (d.complete) toast.success(`${d.paid?.length ?? 0} month${d.paid?.length === 1 ? '' : 's'} paid.`);
        else toast.warn(`${d.paid?.length ?? 0} paid, then stopped: ${d.message ?? 'a payment failed'}`);
        queryClient.invalidateQueries(['civictax-my-obligations']);
        queryClient.invalidateQueries(['civictax-obligation-history']);
      },
      onError: (err) => toast.error(err?.response?.data?.message ?? 'Payment failed. Please try again.'),
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


/**
 * civic-26: raised / disbursed / remaining for a project's campaign, from the ledger custody wallet (totals only).
 * `hasWallet: false` means the campaign predates per-project custody — callers should show nothing rather than zeros.
 */
export function useProjectFunding(campaignId) {
  return useQuery(['civictax-project-funding', campaignId], () => api.getProjectFunding(campaignId), {
    enabled: Boolean(campaignId),
    select: (res) => res.data,
    staleTime: 60 * 1000,
    retry: false,
  });
}
