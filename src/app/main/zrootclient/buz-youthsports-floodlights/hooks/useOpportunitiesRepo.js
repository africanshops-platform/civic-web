import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

// Citizen-facing "Opportunities" (auditions + staff positions) — the two
// club-recruitment pipelines. Both share an identical DRAFT->PENDING_
// APPROVAL->APPROVED lifecycle and browse->detail->apply->mine shape on the
// backend (see ClubAudition/ClubPlayerApplication and ClubStaffPosition/
// ClubStaffApplication in youthsports-service), so one hooks file covers
// both rather than duplicating the query/mutation boilerplate twice.
const api = {
  getAuditions:            (params) => AuthApi().get('/youth/auditions', { params }),
  getAuditionDetail:       (id)     => AuthApi().get(`/youth/auditions/${id}`),
  getMyAuditionApplications: ()     => AuthApi().get('/youth/auditions/applications/mine'),
  applyToAudition:         (data)   => AuthApi().post('/youth/auditions/apply', data),

  getStaffPositions:       (params) => AuthApi().get('/youth/staff-positions', { params }),
  getStaffPositionDetail:  (id)     => AuthApi().get(`/youth/staff-positions/${id}`),
  getMyStaffPositionApplications: () => AuthApi().get('/youth/staff-positions/applications/mine'),
  applyToStaffPosition:    (data)   => AuthApi().post('/youth/staff-positions/apply', data),
};

function buildParams(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null && v !== ''));
}

// ─── Auditions ──────────────────────────────────────────────────────────────

export function useAuditions(filters = {}) {
  return useQuery(
    ['youth-opp-auditions', filters],
    () => api.getAuditions(buildParams(filters)),
    { select: (res) => res.data, staleTime: 60 * 1000 }
  );
}

export function useAuditionDetail(id) {
  return useQuery(
    ['youth-opp-audition', id],
    () => api.getAuditionDetail(id),
    { enabled: Boolean(id), select: (res) => res.data, staleTime: 60 * 1000 }
  );
}

export function useMyAuditionApplications() {
  return useQuery(
    ['youth-opp-audition-applications-mine'],
    () => api.getMyAuditionApplications(),
    { select: (res) => res.data ?? [], staleTime: 30 * 1000, retry: false }
  );
}

export function useApplyToAudition() {
  const queryClient = useQueryClient();
  return useMutation(
    (payload) => api.applyToAudition(payload),
    {
      onSuccess: () => {
        toast.success("Application submitted! The club's coordinator will review it.");
        queryClient.invalidateQueries(['youth-opp-audition-applications-mine']);
      },
      onError: (err) => toast.error(err?.response?.data?.message ?? 'Could not submit your application. Please try again.'),
    }
  );
}

// ─── Staff positions ────────────────────────────────────────────────────────

export function useStaffPositions(filters = {}) {
  return useQuery(
    ['youth-opp-staffpositions', filters],
    () => api.getStaffPositions(buildParams(filters)),
    { select: (res) => res.data, staleTime: 60 * 1000 }
  );
}

export function useStaffPositionDetail(id) {
  return useQuery(
    ['youth-opp-staffposition', id],
    () => api.getStaffPositionDetail(id),
    { enabled: Boolean(id), select: (res) => res.data, staleTime: 60 * 1000 }
  );
}

export function useMyStaffPositionApplications() {
  return useQuery(
    ['youth-opp-staffposition-applications-mine'],
    () => api.getMyStaffPositionApplications(),
    { select: (res) => res.data ?? [], staleTime: 30 * 1000, retry: false }
  );
}

export function useApplyToStaffPosition() {
  const queryClient = useQueryClient();
  return useMutation(
    (payload) => api.applyToStaffPosition(payload),
    {
      onSuccess: () => {
        toast.success("Application submitted! The club's coordinator will review it.");
        queryClient.invalidateQueries(['youth-opp-staffposition-applications-mine']);
      },
      onError: (err) => toast.error(err?.response?.data?.message ?? 'Could not submit your application. Please try again.'),
    }
  );
}

// STAFF_ROLES mirrors the StaffDesignations values the backend accepts for
// ClubStaffPosition.role (see apps/auth-service/prisma/schema.prisma).
export const STAFF_ROLES = [
  { value: 'COACH', label: 'Coach' },
  { value: 'ASSISTANT_COACH', label: 'Assistant Coach' },
  { value: 'TEAM_MANAGER', label: 'Team Manager' },
  { value: 'PHYSIO', label: 'Physiotherapist' },
];
