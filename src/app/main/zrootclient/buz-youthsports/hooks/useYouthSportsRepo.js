import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';
import { YOUTH_STATS, mockMentors, mockPrograms } from '../mock';

// Browse/detail (programs, tournaments, spotlights) are wired to the real
// `youth-sports-service` gateway routes. Enroll/register-team/mentors/my-programs
// are still mock pending a later slice — kept separate rather than one global flag
// so wiring one doesn't silently break the others.
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

// ─── raw API layer ────────────────────────────────────────────────────────────
const api = {
  getPrograms:      (params) => AuthApi().get('/youth/programs', { params }),
  getProgramDetail: (id)     => AuthApi().get(`/youth/programs/${id}`),
  getTournaments:   (params) => AuthApi().get('/youth/tournaments', { params }),
  getSpotlights:    (params) => AuthApi().get('/youth/spotlights', { params }),
};

function buildParams(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v != null && v !== '')
  );
}

// ─── normalizers ──────────────────────────────────────────────────────────────
// The mock data invented several UI-only fields (fee, rating, skills, ageRange,
// venue...) the real Prisma schema never had. These map the real YouthProgram/
// SportsTournament/TalentSpotlight fields onto what the screens already render,
// mirroring useSecurityRepo.js's normalizeIncident pattern.

const CATEGORY_MAP = {
  SPORTS: 'sports', VOCATIONAL: 'vocational', ENTREPRENEURSHIP: 'entrepreneurship',
  ARTS: 'arts', TECH: 'technology', OTHER: 'vocational',
};

function formatDuration(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const days = Math.round((new Date(endDate) - new Date(startDate)) / 86400000);
  if (days <= 0) return null;
  if (days < 14) return `${days} day${days === 1 ? '' : 's'}`;
  if (days < 60) return `${Math.round(days / 7)} weeks`;
  return `${Math.round(days / 30)} months`;
}

function normalizeProgram(p) {
  return {
    ...p,
    category: CATEGORY_MAP[p.category] ?? (p.category || '').toLowerCase(),
    status: (p.status ?? '').toLowerCase(),
    slots: p.maxSlots,
    location: { address: [p.lga, p.state].filter(Boolean).join(', ') },
    duration: formatDuration(p.startDate, p.endDate),
  };
}

function normalizeTournament(t) {
  return {
    ...t,
    title: t.name,
    venue: [t.lga, t.state].filter(Boolean).join(', '),
    teamsRegistered: t.currentTeams,
    status: (t.status ?? '').toLowerCase(),
  };
}

function normalizeSpotlight(s) {
  return {
    ...s,
    name: s.displayName,
    discipline: s.sport,
    jurisdiction: { lga: s.lga, state: s.state },
    verified: s.isVerified,
  };
}

export function useYouthStats() {
  return useQuery(
    ['youth-stats'],
    async () => {
      await delay(300);
      return { data: { stats: YOUTH_STATS } };
    },
    { staleTime: 10 * 60 * 1000 }
  );
}

export function usePrograms(filters = {}) {
  const { sport, ageGroup, lga, page = 1, limit = 20 } = filters;
  const params = buildParams({ sport, ageGroup, lga, page, limit });

  return useQuery(
    ['youth-programs', filters],
    () => api.getPrograms(params),
    {
      select: (res) => {
        const d = res.data;
        return { data: { programs: (d.data ?? []).map(normalizeProgram), total: d.total ?? 0 } };
      },
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000,
    }
  );
}

export function useProgramDetail(programId) {
  return useQuery(
    ['youth-program', programId],
    () => api.getProgramDetail(programId),
    {
      enabled: Boolean(programId),
      select: (res) => ({ data: { program: normalizeProgram(res.data) } }),
      staleTime: 3 * 60 * 1000,
    }
  );
}

export function useTalents(filters = {}) {
  const { sport, page = 1, limit = 20 } = filters;
  const params = buildParams({ sport, page, limit });

  return useQuery(
    ['youth-talents', filters],
    () => api.getSpotlights(params),
    {
      select: (res) => {
        const d = res.data;
        return { data: { talents: (d.data ?? []).map(normalizeSpotlight), total: d.total ?? 0 } };
      },
      keepPreviousData: true,
      staleTime: 3 * 60 * 1000,
    }
  );
}

export function useTournaments(filters = {}) {
  const { status, sport, lga, page = 1, limit = 20 } = filters;
  const params = buildParams({ status, sport, lga, page, limit });

  return useQuery(
    ['youth-tournaments', filters],
    () => api.getTournaments(params),
    {
      select: (res) => {
        const d = res.data;
        return { data: { tournaments: (d.data ?? []).map(normalizeTournament), total: d.total ?? 0 } };
      },
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000,
    }
  );
}

// Mentors, my-programs, enroll, and team-registration are still mock —
// wiring them needs KYC-guard-aware error handling and (for mentors) a product
// redesign from a directory to a request-only form, deferred to a later slice.
export function useMentors(filters = {}) {
  return useQuery(
    ['youth-mentors', filters],
    async () => {
      await delay(500);
      const filtered = mockMentors.filter((m) => {
        if (filters.category && m.category !== filters.category) return false;
        return true;
      });
      return { data: { mentors: filtered } };
    },
    { keepPreviousData: true, staleTime: 5 * 60 * 1000 }
  );
}

export function useMyPrograms() {
  return useQuery(
    ['youth-my-programs'],
    async () => {
      await delay(500);
      return {
        data: {
          enrolled: [{ ...mockPrograms[0], progress: 65, nextSession: '2026-06-10T09:00:00Z' }],
          completed: [],
          saved: [mockPrograms[1]],
        },
      };
    },
    { staleTime: 2 * 60 * 1000 }
  );
}

export function useEnrollInProgram() {
  const queryClient = useQueryClient();
  return useMutation(
    async (payload) => {
      await delay(1200);
      return { data: { success: true, message: 'Enrolled successfully! Check your email for details.', programId: payload.programId } };
    },
    {
      onSuccess: (data) => {
        if (data?.data?.success) {
          toast.success(data.data.message);
          queryClient.invalidateQueries(['youth-programs']);
          queryClient.invalidateQueries(['youth-my-programs']);
        }
      },
      onError: () => toast.error('Could not enroll. Please try again.'),
    }
  );
}

export function useRegisterForTournament() {
  const queryClient = useQueryClient();
  return useMutation(
    async (_payload) => {
      await delay(1200);
      return {
        data: {
          success: true,
          registrationCode: `TRN-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000 + 100000)}`,
          message: 'Registration successful! Confirmation sent to your email.',
        },
      };
    },
    {
      onSuccess: (data) => {
        if (data?.data?.success) toast.success(data.data.message);
        queryClient.invalidateQueries(['youth-tournaments']);
      },
      onError: () => toast.error('Registration failed. Please try again.'),
    }
  );
}
