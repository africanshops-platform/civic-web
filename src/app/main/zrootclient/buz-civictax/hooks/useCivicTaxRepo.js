import { useQuery, useMutation, useQueryClient } from 'react-query';
import { mockCampaigns, CAMPAIGN_STATS, mockContributions, mockMyContributionStats, mockLgaProjects } from '../mock';
import { toast } from 'react-toastify';

const USE_MOCK = true;

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

function applyFilters(items, filters = {}) {
  return items.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.stateId && item.jurisdiction?.stateId !== filters.stateId) return false;
    if (filters.lgaId && item.jurisdiction?.lgaId !== filters.lgaId) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!item.title.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function useCampaigns(filters = {}) {
  return useQuery(
    ['civictax-campaigns', filters],
    async () => {
      if (USE_MOCK) {
        await delay(700);
        const filtered = applyFilters(mockCampaigns, filters);
        return {
          data: {
            campaigns: filtered,
            pagination: { total: filtered.length, page: 1, limit: 10 },
            stats: CAMPAIGN_STATS,
          },
        };
      }
    },
    { keepPreviousData: true, staleTime: 2 * 60 * 1000 }
  );
}

export function useCampaignDetail(campaignId) {
  return useQuery(
    ['civictax-campaign', campaignId],
    async () => {
      if (USE_MOCK) {
        await delay(450);
        const campaign = mockCampaigns.find((c) => c.id === campaignId) || mockCampaigns[0];
        return { data: { campaign } };
      }
    },
    { enabled: Boolean(campaignId), staleTime: 3 * 60 * 1000 }
  );
}

export function useMyContributions() {
  return useQuery(
    ['civictax-my-contributions'],
    async () => {
      if (USE_MOCK) {
        await delay(550);
        return { data: { contributions: mockContributions, stats: mockMyContributionStats } };
      }
    },
    { staleTime: 60 * 1000 }
  );
}

export function useLgaProjects(filters = {}) {
  return useQuery(
    ['civictax-lga-projects', filters],
    async () => {
      if (USE_MOCK) {
        await delay(600);
        const filtered = mockLgaProjects.filter((p) => {
          if (filters.campaignId && p.campaignId !== filters.campaignId) return false;
          if (filters.status && p.status !== filters.status) return false;
          return true;
        });
        return { data: { projects: filtered } };
      }
    },
    { keepPreviousData: true, staleTime: 2 * 60 * 1000 }
  );
}

export function useContributeToCampaign() {
  const queryClient = useQueryClient();
  return useMutation(
    async (payload) => {
      if (USE_MOCK) {
        await delay(1400);
        return {
          data: {
            success: true,
            transactionId: `TXN-2026-${Date.now().toString().slice(-6)}`,
            message: 'Contribution successful! Thank you for making a difference.',
            amount: payload.amount,
            campaignId: payload.campaignId,
          },
        };
      }
    },
    {
      onSuccess: (data) => {
        if (data?.data?.success) {
          toast.success(data.data.message || 'Contribution successful!');
          queryClient.invalidateQueries(['civictax-campaigns']);
          queryClient.invalidateQueries(['civictax-my-contributions']);
        }
      },
      onError: () => {
        toast.error('Contribution failed. Please try again.');
      },
    }
  );
}

export function useContributionReceipt(transactionId) {
  return useQuery(
    ['civictax-receipt', transactionId],
    async () => {
      if (USE_MOCK) {
        await delay(400);
        const contribution = mockContributions.find((c) => c.transactionId === transactionId) || mockContributions[0];
        return { data: { receipt: { ...contribution, transactionId: transactionId || contribution.transactionId } } };
      }
    },
    { enabled: Boolean(transactionId), staleTime: 10 * 60 * 1000 }
  );
}
