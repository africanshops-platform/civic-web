import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

// Citizen-facing staff-position pipeline (Feature A, 2026-09-12) — mirrors
// the real, already-live audition hooks in useFloodlightsRepo.js's own
// useAuditions/useAuditionDetail/useMyAuditionApplications/useApplyToAudition
// method-for-method. Kept in its own file (not merged into that one) purely
// to avoid a large diff on an already-real file; same backend shape
// (ClubStaffPosition/ClubStaffApplication), same lifecycle.
const api = {
  getStaffPositions:              (params) => AuthApi().get('/youth/staff-positions', { params }),
  getStaffPositionDetail:         (id)     => AuthApi().get(`/youth/staff-positions/${id}`),
  getMyStaffPositionApplications: ()       => AuthApi().get('/youth/staff-positions/applications/mine'),
  applyToStaffPosition:           (data)   => AuthApi().post('/youth/staff-positions/apply', data),
};

function buildParams(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null && v !== ''));
}

export function useStaffPositions(filters = {}) {
  return useQuery(
    ['youth-staffpositions', filters],
    () => api.getStaffPositions(buildParams(filters)),
    { select: (res) => res.data, staleTime: 60 * 1000 }
  );
}

export function useStaffPositionDetail(id) {
  return useQuery(
    ['youth-staffposition', id],
    () => api.getStaffPositionDetail(id),
    { enabled: Boolean(id), select: (res) => res.data, staleTime: 60 * 1000 }
  );
}

export function useMyStaffPositionApplications() {
  return useQuery(
    ['youth-staffposition-applications-mine'],
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
        queryClient.invalidateQueries(['youth-staffposition-applications-mine']);
      },
      onError: (err) => toast.error(err?.response?.data?.message ?? 'Could not submit your application. Please try again.'),
    }
  );
}

// Mirrors the StaffDesignations values the backend accepts for
// ClubStaffPosition.role (see apps/auth-service/prisma/schema.prisma).
export const STAFF_ROLES = [
  { value: 'COACH', label: 'Coach' },
  { value: 'ASSISTANT_COACH', label: 'Assistant Coach' },
  { value: 'TEAM_MANAGER', label: 'Team Manager' },
  { value: 'PHYSIO', label: 'Physiotherapist' },
];
