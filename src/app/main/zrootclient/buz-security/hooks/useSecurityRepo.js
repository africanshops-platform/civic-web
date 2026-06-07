import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { mockIncidents, SECURITY_STATS, mockOfficers } from '../mock';

const USE_MOCK = true;
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

function applyFilters(items, filters = {}) {
  return items.filter((item) => {
    if (filters.severity && item.severity !== filters.severity) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.stateId && item.location?.state !== filters.stateId) return false;
    if (filters.lgaId && item.location?.lga !== filters.lgaId) return false;
    return true;
  });
}

export function useIncidents(filters = {}) {
  return useQuery(
    ['security-incidents', filters],
    async () => {
      if (USE_MOCK) {
        await delay(650);
        const filtered = applyFilters(mockIncidents, filters);
        return { data: { incidents: filtered, stats: SECURITY_STATS } };
      }
    },
    { keepPreviousData: true, staleTime: 30 * 1000, refetchInterval: 30 * 1000 }
  );
}

export function useIncidentDetail(incidentId) {
  return useQuery(
    ['security-incident', incidentId],
    async () => {
      if (USE_MOCK) {
        await delay(400);
        const incident = mockIncidents.find((i) => i.id === incidentId) || mockIncidents[0];
        return { data: { incident } };
      }
    },
    { enabled: Boolean(incidentId), staleTime: 20 * 1000 }
  );
}

export function useMyReports() {
  return useQuery(
    ['security-my-reports'],
    async () => {
      if (USE_MOCK) {
        await delay(500);
        return { data: { reports: mockIncidents.slice(0, 3) } };
      }
    },
    { staleTime: 60 * 1000 }
  );
}

export function useOfficers() {
  return useQuery(
    ['security-officers'],
    async () => {
      if (USE_MOCK) {
        await delay(400);
        return { data: { officers: mockOfficers } };
      }
    },
    { staleTime: 60 * 1000 }
  );
}

export function useReportIncident() {
  const queryClient = useQueryClient();
  return useMutation(
    async (payload) => {
      if (USE_MOCK) {
        await delay(1500);
        return {
          data: {
            success: true,
            reportId: `inc_${Date.now().toString().slice(-5)}`,
            message: 'Incident report submitted. Our team has been notified.',
          },
        };
      }
    },
    {
      onSuccess: (data) => {
        if (data?.data?.success) {
          toast.success(data.data.message);
          queryClient.invalidateQueries(['security-incidents']);
          queryClient.invalidateQueries(['security-my-reports']);
        }
      },
      onError: () => toast.error('Failed to submit report. Please try again.'),
    }
  );
}

export function useUpdateIncidentStatus() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ incidentId, status, note }) => {
      if (USE_MOCK) {
        await delay(800);
        return { data: { success: true } };
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['security-incidents']);
        toast.success('Incident status updated.');
      },
    }
  );
}
