import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

// ─── raw API layer ────────────────────────────────────────────────────────────
const api = {
  getPublicIncidents: (params) => AuthApi().get('/soc/incidents/public', { params }),
  getMyReports:       (params) => AuthApi().get('/soc/incidents/mine', { params }),
  getIncidentDetail:  (id)     => AuthApi().get(`/soc/incidents/${id}`),
  getActiveAlerts:    (params) => AuthApi().get('/soc/alerts/active', { params }),
  reportIncident:     (data)   => AuthApi().post('/soc/incidents/report', data),
};

function buildParams(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v != null && v !== '')
  );
}

function paginate(page, limit) {
  return { page: Math.max(1, parseInt(page, 10) || 1), limit: Math.max(1, parseInt(limit, 10) || 20) };
}

function extractPagination(d, page, limit) {
  const total      = d?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}

function normalizeIncident(i) {
  return {
    ...i,
    severity:    (i.severity ?? '').toLowerCase(),
    status:      (i.status   ?? '').toLowerCase(),
    category:    (i.category ?? '').toLowerCase(),
    description: i.description ?? '',
    reportedAt:  i.reportedAt ?? i.createdAt ?? null,
    location: {
      lat:     i.latitude  ?? i.location?.lat,
      lng:     i.longitude ?? i.location?.lng,
      address: i.locationAddress ?? i.location?.address ?? '',
      lga:     i.jurisdiction?.lga   ?? i.location?.lga   ?? '',
      state:   i.jurisdiction?.state ?? i.location?.state ?? '',
    },
  };
}

// ─── hooks ────────────────────────────────────────────────────────────────────

export function useIncidents(filters = {}) {
  const { severity, category, status, stateId, lgaId, page = 1, limit = 20 } = filters;
  const { page: p, limit: l } = paginate(page, limit);
  const params = { ...buildParams({ lga: lgaId, state: stateId, severity, category, status }), page: p, limit: l };

  return useQuery(
    ['security-incidents', filters],
    () => api.getPublicIncidents(params),
    {
      select: (res) => {
        const d = res.data;
        return {
          data: {
            incidents:  (d.data ?? []).map(normalizeIncident),
            stats:      { total: d.total ?? 0 },
            pagination: extractPagination(d, p, l),
          },
        };
      },
      keepPreviousData: true,
      staleTime: 30 * 1000,
      refetchInterval: 30 * 1000,
    }
  );
}

export function useIncidentDetail(incidentId) {
  return useQuery(
    ['security-incident', incidentId],
    () => api.getIncidentDetail(incidentId),
    {
      enabled: Boolean(incidentId),
      // normalizeIncident lowercases severity/status/category and nests
      // location the same way the list/mine hooks do, keeping this page
      // consistent with IncidentCard's expectations. `actions` passes
      // through unnormalized (real fields: action/note/performedBy/
      // createdAt) since it's only consumed here, not by IncidentCard.
      select: (res) => ({ data: { incident: normalizeIncident(res.data) } }),
      staleTime: 20 * 1000,
    }
  );
}

export function useMyReports(page = 1, limit = 20) {
  const { page: p, limit: l } = paginate(page, limit);
  return useQuery(
    ['security-my-reports', p, l],
    () => api.getMyReports({ page: p, limit: l }),
    {
      select: (res) => {
        const d = res.data;
        return {
          data: {
            reports:    (d.data ?? []).map(normalizeIncident),
            pagination: extractPagination(d, p, l),
          },
        };
      },
      keepPreviousData: true,
      staleTime: 60 * 1000,
    }
  );
}

export function useSocAlerts(lga, state) {
  const params = buildParams({ lga, state });

  return useQuery(
    ['security-alerts', lga, state],
    () => api.getActiveAlerts(params),
    {
      select: (res) => res.data?.data ?? [],
      staleTime: 60 * 1000,
      refetchInterval: 60 * 1000,
      enabled: Boolean(lga),
    }
  );
}

export function useReportIncident() {
  const queryClient = useQueryClient();
  return useMutation(
    (payload) =>
      api.reportIncident({
        title:           payload.title || `${payload.category} incident`,
        description:     payload.description ?? '',
        category:        payload.category,
        locationAddress: payload.locationAddress,
        coordinates:     payload.coordinates ?? undefined,
        jurisdiction:    payload.jurisdiction,
      }),
    {
      onSuccess: (res) => {
        toast.success(res.data?.message ?? 'Incident report submitted. Our team has been notified.');
        queryClient.invalidateQueries(['security-incidents']);
        queryClient.invalidateQueries(['security-my-reports']);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message ?? 'Failed to submit report. Please try again.');
      },
    }
  );
}

export function useUpdateIncidentStatus() {
  const queryClient = useQueryClient();
  return useMutation(
    ({ incidentId, status, note }) =>
      AuthApi().put('/soc/admin/incidents/resolve', { incidentId, resolution: note }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['security-incidents']);
        toast.success('Incident status updated.');
      },
    }
  );
}
