import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import {
  mockElections, ELECTION_STATS,
  mockCandidates,
  mockCollationResults,
  mockPetitions, PETITION_STATS,
} from '../mock';

const USE_MOCK = true;
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

function applyElectionFilters(items, filters = {}) {
  return items.filter((item) => {
    if (filters.type && item.type !== filters.type) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.stateId && item.jurisdiction?.stateId !== filters.stateId) return false;
    if (filters.lgaId && item.jurisdiction?.lgaId !== filters.lgaId) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!item.title.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function useElections(filters = {}) {
  return useQuery(
    ['governance-elections', filters],
    async () => {
      if (USE_MOCK) {
        await delay(700);
        const filtered = applyElectionFilters(mockElections, filters);
        return { data: { elections: filtered, stats: ELECTION_STATS } };
      }
    },
    { keepPreviousData: true, staleTime: 2 * 60 * 1000 }
  );
}

export function useElectionDetail(electionId) {
  return useQuery(
    ['governance-election', electionId],
    async () => {
      if (USE_MOCK) {
        await delay(450);
        const election = mockElections.find((e) => e.id === electionId) || mockElections[0];
        const candidates = mockCandidates.filter((c) => c.electionId === electionId);
        return { data: { election, candidates } };
      }
    },
    { enabled: Boolean(electionId), staleTime: 3 * 60 * 1000 }
  );
}

export function useElectionCollation(electionId) {
  return useQuery(
    ['governance-collation', electionId],
    async () => {
      if (USE_MOCK) {
        await delay(500);
        const result = mockCollationResults.find((r) => r.electionId === electionId) || mockCollationResults[0];
        const live = {
          ...result,
          candidates: result.candidates.map((c) => ({
            ...c,
            totalVotes: c.totalVotes + Math.floor(Math.random() * 120),
          })),
        };
        return { data: live };
      }
    },
    {
      enabled: Boolean(electionId),
      refetchInterval: USE_MOCK ? 5000 : 10000,
      staleTime: 0,
    }
  );
}

export function usePetitions(filters = {}) {
  return useQuery(
    ['governance-petitions', filters],
    async () => {
      if (USE_MOCK) {
        await delay(600);
        const filtered = mockPetitions.filter((p) => {
          if (filters.status && p.status !== filters.status) return false;
          if (filters.category && p.category !== filters.category) return false;
          return true;
        });
        return { data: { petitions: filtered, stats: PETITION_STATS } };
      }
    },
    { keepPreviousData: true, staleTime: 2 * 60 * 1000 }
  );
}

export function usePetitionDetail(petitionId) {
  return useQuery(
    ['governance-petition', petitionId],
    async () => {
      if (USE_MOCK) {
        await delay(400);
        const petition = mockPetitions.find((p) => p.id === petitionId) || mockPetitions[0];
        return { data: { petition } };
      }
    },
    { enabled: Boolean(petitionId), staleTime: 3 * 60 * 1000 }
  );
}

export function useMyVotingHistory() {
  return useQuery(
    ['governance-my-votes'],
    async () => {
      if (USE_MOCK) {
        await delay(500);
        return {
          data: {
            votes: [
              { electionId: 'elec_002', electionTitle: 'Eti-Osa LGA Chairmanship Election 2026', votedAt: '2026-09-20T10:24:00Z', receiptCode: 'VRC-2026-844721' },
            ],
            totalVoted: 1,
            electionsEligible: 3,
          },
        };
      }
    },
    { staleTime: 5 * 60 * 1000 }
  );
}

export function useCastVote() {
  const queryClient = useQueryClient();
  return useMutation(
    async (payload) => {
      if (USE_MOCK) {
        await delay(1600);
        return {
          data: {
            success: true,
            receiptCode: `VRC-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000 + 100000)}`,
            message: 'Your vote has been recorded securely. Thank you for participating.',
            electionId: payload.electionId,
            candidateId: payload.candidateId,
          },
        };
      }
    },
    {
      onSuccess: (data) => {
        if (data?.data?.success) {
          toast.success(data.data.message || 'Vote cast successfully!');
          queryClient.invalidateQueries(['governance-my-votes']);
          queryClient.invalidateQueries(['governance-election', data.data.electionId]);
        }
      },
      onError: () => {
        toast.error('Could not cast vote. Please try again.');
      },
    }
  );
}

export function useSignPetition() {
  const queryClient = useQueryClient();
  return useMutation(
    async (payload) => {
      if (USE_MOCK) {
        await delay(900);
        return { data: { success: true, message: 'Your signature has been added to the petition.', petitionId: payload.petitionId } };
      }
    },
    {
      onSuccess: (data) => {
        if (data?.data?.success) {
          toast.success(data.data.message || 'Petition signed!');
          queryClient.invalidateQueries(['governance-petitions']);
          queryClient.invalidateQueries(['governance-petition', data.data.petitionId]);
        }
      },
      onError: () => {
        toast.error('Could not sign petition. Please try again.');
      },
    }
  );
}

export function useSubmitCollationEntry() {
  const queryClient = useQueryClient();
  return useMutation(
    async (payload) => {
      if (USE_MOCK) {
        await delay(1200);
        return { data: { success: true, message: `Ward "${payload.wardName}" collation recorded.` } };
      }
    },
    {
      onSuccess: (data) => {
        if (data?.data?.success) {
          toast.success(data.data.message || 'Collation entry saved.');
          queryClient.invalidateQueries(['governance-collation']);
        }
      },
      onError: () => {
        toast.error('Collation entry failed. Please try again.');
      },
    }
  );
}
