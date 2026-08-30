import { useQuery } from 'react-query';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

// v2 pages reuse every already-real hook from the v1 module untouched —
// re-exported here so v2 screens have one import surface.
export {
  useYouthStats, usePrograms, useProgramDetail, useTalents,
  useTournaments, useTournamentDetail, useRequestMentorship,
  useEnrollInTournament, useMyTournamentEnrollments,
} from './useYouthSportsRepo';

// ─── Newly-real endpoints (League/Player-roster/match-stats, shipped to
// `test` 2026-08-15/16 — see league.controller.ts, youthsports-client.
// controller.ts) that the v1 module never wired up. ──────────────────────
const api = {
  getLeagues:       (params) => AuthApi().get('/youth/leagues', { params }),
  getLeagueDetail:  (id)     => AuthApi().get(`/youth/leagues/${id}`),
  getPlayers:       (clubMerchantId) => AuthApi().get('/youth/players', { params: { clubMerchantId } }),
  getMatchStats:    (matchId) => AuthApi().get(`/youth/matches/${matchId}/stats`),
  getMerchantPreview: (id) => AuthApi().get(`/auth-merchant/get-merchant/${id}/preview`),
};

export function useLeagues(filters = {}) {
  return useQuery(
    ['youth-leagues', filters],
    () => api.getLeagues(filters),
    {
      select: (res) => ({ data: { leagues: res.data?.data ?? [], total: res.data?.total ?? 0 } }),
      staleTime: 2 * 60 * 1000,
    }
  );
}

export function useLeagueDetail(leagueId) {
  return useQuery(
    ['youth-league', leagueId],
    () => api.getLeagueDetail(leagueId),
    {
      enabled: Boolean(leagueId),
      select: (res) => ({ data: { league: res.data } }),
      staleTime: 60 * 1000,
    }
  );
}

// clubMerchantId is a real TournamentTeam's managerId, so a team card can
// always resolve a roster this way even without a separate Club entity.
export function usePlayers(clubMerchantId) {
  return useQuery(
    ['youth-players', clubMerchantId],
    () => api.getPlayers(clubMerchantId),
    {
      enabled: Boolean(clubMerchantId),
      select: (res) => ({ data: { players: res.data?.data ?? res.data ?? [] } }),
      staleTime: 60 * 1000,
    }
  );
}

// TournamentTeam.teamName is a generic placeholder assigned at season-start
// snapshot time ("Club e914b9" etc), NOT the club's real registered name —
// the real name lives on the merchant account (`shopname`), keyed by
// TournamentTeam.managerId. Resolve it via the same public, no-auth
// merchant-preview endpoint the marketplace uses for shop pages.
export function useMerchantPreview(merchantId) {
  return useQuery(
    ['merchant-preview', merchantId],
    () => api.getMerchantPreview(merchantId),
    {
      enabled: Boolean(merchantId),
      select: (res) => res.data?.merchant,
      staleTime: 10 * 60 * 1000,
      retry: false,
    }
  );
}

export function useTeamName(managerId, fallback) {
  const { data } = useMerchantPreview(managerId);
  return data?.shopname || fallback || 'TBD';
}

// Fouls/cards only — the schema has never tracked goals/assists per player
// (team-level score only), so screens must not fabricate those fields.
export function useMatchStats(matchId) {
  return useQuery(
    ['youth-match-stats', matchId],
    () => api.getMatchStats(matchId),
    {
      enabled: Boolean(matchId),
      select: (res) => ({ data: res.data }),
      staleTime: 60 * 1000,
    }
  );
}
