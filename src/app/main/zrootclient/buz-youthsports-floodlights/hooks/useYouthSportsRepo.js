import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';
import { YOUTH_STATS } from '../mock';

// Browse/detail (programs, tournaments, spotlights), mentorship-request, and
// (as of 2026-09-09) enroll/my-programs/register-team are all wired to the
// real `youth-sports-service` gateway routes — see civic-mobile's
// useYouthSports.ts/youthSports.api.ts for the proven endpoint shapes this
// mirrors.
const delay = (ms = 600) => new Promise((resolve) => { setTimeout(resolve, ms); });

// ─── raw API layer ────────────────────────────────────────────────────────────
const api = {
  getPrograms:        (params) => AuthApi().get('/youth/programs', { params }),
  getProgramDetail:   (id)     => AuthApi().get(`/youth/programs/${id}`),
  getMyPrograms:      (params) => AuthApi().get('/youth/programs/mine', { params }),
  enrollInProgram:    (data)   => AuthApi().post('/youth/programs/enroll', data),
  getTournaments:     (params) => AuthApi().get('/youth/tournaments', { params }),
  getTournamentDetail: (id)    => AuthApi().get(`/youth/tournaments/${id}`),
  registerTeam:       (data)   => AuthApi().post('/youth/tournaments/register-team', data),
  getSpotlights:      (params) => AuthApi().get('/youth/spotlights', { params }),
  requestMentorship:  (data)   => AuthApi().post('/youth/mentorship/request', data),
  // Phase 7 of the club-recruitment pipeline (2026-08-30) — the
  // participationMode: SINGLE direct-enrollment endpoint.
  enrollInTournament:       (data)   => AuthApi().post('/youth/tournaments/enroll', data),
  getMyTournamentEnrollments: (params) => AuthApi().get('/youth/tournaments/mine', { params }),
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

// ProgramEnrollment from the real backend is flat ({id, programId, userId,
// guardianId, enrolledAt, isActive, program}) — no progress/nextSession/
// completed/saved bucketing exists server-side, so the previous mock's
// {enrolled, completed, saved} shape was UI-only fiction. Any future
// consumer of useMyPrograms works off this real shape instead.
function normalizeEnrollment(e) {
  return { ...e, program: e.program ? normalizeProgram(e.program) : e.program };
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

export function useTournamentDetail(tournamentId) {
  return useQuery(
    ['youth-tournament', tournamentId],
    () => api.getTournamentDetail(tournamentId),
    {
      enabled: Boolean(tournamentId),
      // teams[]/matches[] field names already match what BracketTree/
      // StandingsTable need (teamName, points, homeScore, isCompleted...) —
      // only the top-level tournament fields need normalizeTournament.
      select: (res) => ({ data: { tournament: normalizeTournament(res.data) } }),
      staleTime: 60 * 1000,
    }
  );
}

// No browse/list-mentors endpoint exists on the backend — only a request-only
// route. KYC verification is enforced by KycGuard at the route level (see
// youthsportsPagesConfig.jsx's kycProtect wrapper), not re-checked here.
export function useRequestMentorship() {
  return useMutation(
    (payload) => api.requestMentorship(payload),
    {
      onSuccess: () => toast.success('Mentorship request submitted! A coordinator will reach out once a match is found.'),
      onError: (err) => toast.error(err?.response?.data?.message ?? 'Could not submit your request. Please try again.'),
    }
  );
}

export function useMyPrograms(filters = {}) {
  const { page = 1, limit = 20 } = filters;
  return useQuery(
    ['youth-my-programs', filters],
    () => api.getMyPrograms({ page, limit }),
    {
      select: (res) => {
        const d = res.data;
        return { data: { enrollments: (d.data ?? []).map(normalizeEnrollment), total: d.total ?? 0 } };
      },
      staleTime: 2 * 60 * 1000,
    }
  );
}

export function useEnrollInProgram() {
  const queryClient = useQueryClient();
  return useMutation(
    (payload) => api.enrollInProgram(payload),
    {
      onSuccess: (res, payload) => {
        toast.success('Enrolled successfully! Check your email for details.');
        queryClient.invalidateQueries(['youth-programs']);
        queryClient.invalidateQueries(['youth-program', payload.programId]);
        queryClient.invalidateQueries(['youth-my-programs']);
      },
      onError: (err) => toast.error(err?.response?.data?.message ?? 'Could not enroll. Please try again.'),
    }
  );
}

// Real endpoint — direct individual enrollment for a participationMode:
// SINGLE tournament (Phase 7, 2026-08-30). TEAM-mode tournaments reject this
// with a 409 server-side; the screen only renders the button for SINGLE.
export function useEnrollInTournament() {
  const queryClient = useQueryClient();
  return useMutation(
    (payload) => api.enrollInTournament(payload),
    {
      onSuccess: () => {
        toast.success('You are enrolled! Good luck.');
        queryClient.invalidateQueries(['youth-tournament']);
        queryClient.invalidateQueries(['youth-tournament-my-enrollments']);
      },
      onError: (err) => toast.error(err?.response?.data?.message ?? 'Could not enroll. Please try again.'),
    }
  );
}

export function useMyTournamentEnrollments(filters = {}) {
  const { page = 1, limit = 20 } = filters;
  return useQuery(
    ['youth-tournament-my-enrollments', filters],
    () => api.getMyTournamentEnrollments({ page, limit }),
    { select: (res) => ({ data: res.data }), staleTime: 60 * 1000 }
  );
}

// Real endpoint (matches civic-mobile's registerTeam/RegisterTeamDto shape:
// {tournamentId, teamName, playerIds, coachId?}). No citizen-facing
// TEAM-mode registration UI exists on TournamentDetailScreen yet — see that
// screen's own EnrollPanel comment, which explicitly calls this "a separate,
// not-yet-built slice" distinct from the SINGLE-mode enroll button. Wiring
// the hook to the real API here means that UI has a working mutation to
// call whenever it's built, without needing another mock-removal pass.
export function useRegisterForTournament() {
  const queryClient = useQueryClient();
  return useMutation(
    (payload) => api.registerTeam(payload),
    {
      onSuccess: (res, payload) => {
        toast.success('Registration successful! Confirmation sent to your email.');
        queryClient.invalidateQueries(['youth-tournaments']);
        queryClient.invalidateQueries(['youth-tournament', payload.tournamentId]);
      },
      onError: (err) => toast.error(err?.response?.data?.message ?? 'Registration failed. Please try again.'),
    }
  );
}
