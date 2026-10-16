import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

// Everything here is real (civic-8 G1): elections, candidates, ward collation, audit trail, petitions and polls come from
// the governance service through the gateway. Where the service has no data for a figure (registered voters, turnout
// percentage, a citizen's voting history) the screens show nothing rather than invent it.

const api = {
  listElections: (params) => AuthApi().get('/governance/elections', { params }),
  getElection:   (id)     => AuthApi().get(`/governance/elections/${id}`),
  getCollation:  (id)     => AuthApi().get(`/governance/elections/${id}/collation`),
  getAudit:      (id)     => AuthApi().get(`/governance/elections/${id}/audit`),
  eligibility:   (id)     => AuthApi().get(`/governance/elections/${id}/eligibility`),
  locations:     (id)     => AuthApi().get(`/governance/elections/${id}/locations`),
  listPetitions: (params) => AuthApi().get('/governance/petitions', { params }),
  getPetition:   (id)     => AuthApi().get(`/governance/petitions/${id}`),
  signPetition:  (body)   => AuthApi().post('/governance/petitions/sign', body),
  castVote:      (body)   => AuthApi().post('/governance/vote', body),
  submitWard:    (body)   => AuthApi().post('/governance/admin/collation', body),
};

const errText = (e, fallback) => e?.response?.data?.message || fallback;
const slug = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, '-');

const STATUS_TO_UI = {
  DRAFT: 'upcoming', NOMINATIONS_OPEN: 'upcoming', VOTING_OPEN: 'ongoing', COLLATING: 'ongoing', CLOSED: 'completed', CANCELLED: 'cancelled',
};

/** A real election as the election screens read it. */
export function normalizeElection(e) {
  const approved = (e.candidates ?? []).filter((c) => c.isApproved !== false);
  return {
    id: e.id,
    title: e.title,
    description: e.description ?? '',
    level: e.level,
    type: e.level,
    rawStatus: e.status,
    status: STATUS_TO_UI[e.status] ?? 'upcoming',
    jurisdiction: { country: e.country, state: e.state, stateId: slug(e.state), lga: e.lga ?? null, lgaId: slug(e.lga), ward: e.ward ?? null },
    electionDate: e.electionDate,
    nominationDeadline: e.nominationDeadline,
    closedAt: e.closedAt ?? null,
    isOnlineVotingEnabled: Boolean(e.isOnlineVotingEnabled),
    // Citizens who voted online (one per person; the ballot itself is secret). The service has no registered-voter count.
    votersParticipated: e._count?.voterParticipations ?? 0,
    candidatesCount: approved.length,
    wardsReported: e.wardCollations?.length ?? null,
    candidates: approved.map((c, i) => ({ id: c.id, name: c.name, party: c.party ?? null, manifesto: c.manifesto ?? '', photoUrl: c.photoUrl ?? null, index: i })),
    createdAt: e.createdAt,
  };
}

function electionStats(items) {
  const by = (st) => items.filter((i) => i.status === st).length;
  return {
    totalElections: items.length,
    ongoingElections: by('ongoing'),
    upcomingElections: by('upcoming'),
    completedElections: by('completed'),
    totalVotersParticipated: items.reduce((n, i) => n + (i.votersParticipated || 0), 0),
  };
}

export function useElections(filters = {}) {
  return useQuery(
    ['governance-elections', filters.level ?? filters.type ?? ''],
    () => api.listElections({ limit: 50, ...((filters.level || filters.type) ? { level: filters.level || filters.type } : {}) }),
    {
      select: (res) => {
        let elections = (res.data.items ?? []).map(normalizeElection);
        if (filters.status) elections = elections.filter((e) => e.status === filters.status);
        if (filters.stateId) elections = elections.filter((e) => e.jurisdiction.stateId === filters.stateId);
        if (filters.lgaId) elections = elections.filter((e) => e.jurisdiction.lgaId === filters.lgaId);
        if (filters.search) {
          const q = filters.search.toLowerCase();
          elections = elections.filter((e) => e.title.toLowerCase().includes(q));
        }
        return { data: { elections, stats: electionStats(elections) } };
      },
      keepPreviousData: true,
      staleTime: 60 * 1000,
    },
  );
}

export function useElectionDetail(electionId) {
  return useQuery(['governance-election', electionId], () => api.getElection(electionId), {
    enabled: Boolean(electionId),
    select: (res) => {
      const election = normalizeElection(res.data);
      return { data: { election, candidates: election.candidates, wards: res.data.wardCollations ?? [] } };
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Results: ward-collated votes plus the online tally, which is published when voting closes (online ballots are secret
 * until then). Each candidate carries both parts and the total.
 */
export function useElectionCollation(electionId) {
  return useQuery(['governance-collation', electionId], () => api.getCollation(electionId), {
    enabled: Boolean(electionId),
    select: (res) => {
      const d = res.data;
      const votesOf = (c) => (c.physicalVotes || 0) + (c.onlineVotes || 0);
      const total = (d.candidates ?? []).reduce((n, c) => n + votesOf(c), 0);
      const online = d.onlineTally ?? { status: 'AFTER_CLOSE' };
      return {
        data: {
          electionId: d.electionId,
          status: d.status,
          summary: {
            wardsReported: d.wardsReported ?? 0,
            onlineVoters: d.onlineVoters ?? 0,
            totalVotesCounted: total,
            // 'AFTER_CLOSE' while voting is open, 'PENDING' if closed but not yet published, 'PUBLISHED' once counted.
            onlineTallyStatus: online.status,
            onlineValid: online.valid ?? 0,
            onlineRejected: online.rejected ?? 0,
            onlineMismatch: Boolean(online.mismatch),
            onlineDigest: online.digest ?? null,
            onlineMinimum: online.minimumVoters ?? null,
          },
          candidates: (d.candidates ?? []).map((c, i) => ({
            candidateId: c.id,
            name: c.name,
            party: c.party ?? null,
            index: i,
            wardVotes: c.physicalVotes ?? 0,
            onlineVotes: c.onlineVotes ?? null,
            totalVotes: votesOf(c),
            percentage: total ? Math.round((votesOf(c) / total) * 1000) / 10 : 0,
          })),
        },
      };
    },
    refetchInterval: 15000,
    staleTime: 0,
  });
}

/** The election's tamper-evident audit trail (counts and events only; no voter or choice is ever recorded). */
export function useElectionAudit(electionId) {
  return useQuery(['governance-audit', electionId], () => api.getAudit(electionId), {
    enabled: Boolean(electionId),
    select: (res) => res.data,
    staleTime: 30 * 1000,
  });
}

/** Where this community vote is conducted: real, admin-created locations with their own coordinates. Public. */
export function useElectionLocations(electionId) {
  return useQuery(['governance-locations', electionId], () => api.locations(electionId), {
    enabled: Boolean(electionId),
    select: (res) => res.data?.items ?? [],
    staleTime: 60 * 1000,
  });
}

/** May the signed-in citizen vote in this election, and if not, every reason why (age, area, profile). */
export function useVoterEligibility(electionId) {
  return useQuery(['governance-eligibility', electionId], () => api.eligibility(electionId), {
    enabled: Boolean(electionId),
    select: (res) => res.data,
    retry: false,
    staleTime: 30 * 1000,
  });
}

export function normalizePetition(p) {
  const status = String(p.status ?? 'OPEN').toLowerCase();
  return {
    id: p.id,
    title: p.title,
    description: p.body ?? '',
    status,
    targetAuthority: p.targetAuthority,
    targetSignatures: p.signatureThreshold,
    currentSignatures: p._count?.signatures ?? 0,
    jurisdiction: { country: p.country, state: p.state, lga: p.lga },
    deadline: p.deadline ?? null,
    deliveredAt: p.deliveredAt ?? null,
    createdAt: p.createdAt,
  };
}

export function usePetitions(filters = {}) {
  return useQuery(['governance-petitions', filters.status ?? ''], () => api.listPetitions({ limit: 50, ...(filters.status ? { status: String(filters.status).toUpperCase() } : {}) }), {
    select: (res) => {
      const petitions = (res.data.items ?? []).map(normalizePetition);
      return {
        data: {
          petitions,
          stats: {
            totalPetitions: petitions.length,
            openPetitions: petitions.filter((p) => p.status === 'open').length,
            deliveredPetitions: petitions.filter((p) => p.status === 'delivered' || p.status === 'threshold_met').length,
            totalSignatures: petitions.reduce((n, p) => n + p.currentSignatures, 0),
          },
        },
      };
    },
    keepPreviousData: true,
    staleTime: 60 * 1000,
  });
}

export function usePetitionDetail(petitionId) {
  return useQuery(['governance-petition', petitionId], () => api.getPetition(petitionId), {
    enabled: Boolean(petitionId),
    select: (res) => ({ data: { petition: normalizePetition(res.data) } }),
    staleTime: 30 * 1000,
  });
}

/** The service keeps only a one-way proof that a citizen voted (never which election history to list), so there is no history to show. */
export function useMyVotingHistory() {
  return useMemo(() => ({ data: { data: { votes: [], totalVoted: 0, unavailable: true } }, isLoading: false, isError: false }), []);
}

export function useCastVote() {
  const queryClient = useQueryClient();
  return useMutation((payload) => api.castVote({ electionId: payload.electionId, candidateId: payload.candidateId }).then((res) => ({ ...res, electionId: payload.electionId })), {
    onSuccess: (res) => {
      toast.success(res?.data?.message || 'Your vote has been recorded. Thank you for taking part.');
      queryClient.invalidateQueries(['governance-election', res.electionId]);
      queryClient.invalidateQueries(['governance-collation', res.electionId]);
    },
    onError: (e) => toast.error(errText(e, 'Could not record your vote. Please try again.')),
  });
}

export function useSignPetition() {
  const queryClient = useQueryClient();
  return useMutation((payload) => api.signPetition({ petitionId: payload.petitionId }).then((res) => ({ ...res, petitionId: payload.petitionId })), {
    onSuccess: (res) => {
      toast.success('Your signature has been added to the petition.');
      queryClient.invalidateQueries(['governance-petitions']);
      queryClient.invalidateQueries(['governance-petition', res.petitionId]);
    },
    onError: (e) => toast.error(errText(e, 'Could not sign the petition.')),
  });
}

/** Ward result entry is for election officers (admin accounts); a citizen account is refused by the service. */
export function useSubmitCollationEntry() {
  const queryClient = useQueryClient();
  return useMutation((payload) => api.submitWard(payload), {
    onSuccess: () => {
      toast.success('Ward result recorded.');
      queryClient.invalidateQueries(['governance-collation']);
      queryClient.invalidateQueries(['governance-election']);
    },
    onError: (e) => toast.error(errText(e, 'Could not record the ward result.')),
  });
}
