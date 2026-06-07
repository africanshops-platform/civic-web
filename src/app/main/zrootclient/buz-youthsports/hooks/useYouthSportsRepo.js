import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { mockPrograms, YOUTH_STATS, mockTalents, mockTournaments, mockMentors } from '../mock';

const USE_MOCK = true;
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

function applyProgramFilters(items, filters = {}) {
  return items.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.lgaId && item.jurisdiction?.lgaId !== filters.lgaId) return false;
    if (filters.isFree && !item.isFree) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!item.title.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function useYouthStats() {
  return useQuery(
    ['youth-stats'],
    async () => {
      if (USE_MOCK) {
        await delay(300);
        return { data: { stats: YOUTH_STATS } };
      }
    },
    { staleTime: 10 * 60 * 1000 }
  );
}

export function usePrograms(filters = {}) {
  return useQuery(
    ['youth-programs', filters],
    async () => {
      if (USE_MOCK) {
        await delay(700);
        const filtered = applyProgramFilters(mockPrograms, filters);
        return { data: { programs: filtered, stats: YOUTH_STATS } };
      }
    },
    { keepPreviousData: true, staleTime: 2 * 60 * 1000 }
  );
}

export function useProgramDetail(programId) {
  return useQuery(
    ['youth-program', programId],
    async () => {
      if (USE_MOCK) {
        await delay(400);
        const program = mockPrograms.find((p) => p.id === programId) || mockPrograms[0];
        return { data: { program } };
      }
    },
    { enabled: Boolean(programId), staleTime: 3 * 60 * 1000 }
  );
}

export function useTalents(filters = {}) {
  return useQuery(
    ['youth-talents', filters],
    async () => {
      if (USE_MOCK) {
        await delay(600);
        const filtered = mockTalents.filter((t) => {
          if (filters.category && t.category !== filters.category) return false;
          return true;
        });
        return { data: { talents: filtered } };
      }
    },
    { keepPreviousData: true, staleTime: 3 * 60 * 1000 }
  );
}

export function useTournaments(filters = {}) {
  return useQuery(
    ['youth-tournaments', filters],
    async () => {
      if (USE_MOCK) {
        await delay(650);
        const filtered = mockTournaments.filter((t) => {
          if (filters.status && t.status !== filters.status) return false;
          if (filters.category && t.category !== filters.category) return false;
          return true;
        });
        return { data: { tournaments: filtered } };
      }
    },
    { keepPreviousData: true, staleTime: 2 * 60 * 1000 }
  );
}

export function useTournamentDetail(tournamentId) {
  return useQuery(
    ['youth-tournament', tournamentId],
    async () => {
      if (USE_MOCK) {
        await delay(400);
        const tournament = mockTournaments.find((t) => t.id === tournamentId) || mockTournaments[0];
        return { data: { tournament } };
      }
    },
    { enabled: Boolean(tournamentId), staleTime: 3 * 60 * 1000 }
  );
}

export function useMentors(filters = {}) {
  return useQuery(
    ['youth-mentors', filters],
    async () => {
      if (USE_MOCK) {
        await delay(500);
        const filtered = mockMentors.filter((m) => {
          if (filters.category && m.category !== filters.category) return false;
          return true;
        });
        return { data: { mentors: filtered } };
      }
    },
    { keepPreviousData: true, staleTime: 5 * 60 * 1000 }
  );
}

export function useMyPrograms() {
  return useQuery(
    ['youth-my-programs'],
    async () => {
      if (USE_MOCK) {
        await delay(500);
        return {
          data: {
            enrolled: [{ ...mockPrograms[0], progress: 65, nextSession: '2026-06-10T09:00:00Z' }],
            completed: [],
            saved: [mockPrograms[1]],
          },
        };
      }
    },
    { staleTime: 2 * 60 * 1000 }
  );
}

export function useEnrollInProgram() {
  const queryClient = useQueryClient();
  return useMutation(
    async (payload) => {
      if (USE_MOCK) {
        await delay(1200);
        return { data: { success: true, message: 'Enrolled successfully! Check your email for details.', programId: payload.programId } };
      }
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
    async (payload) => {
      if (USE_MOCK) {
        await delay(1200);
        return {
          data: {
            success: true,
            registrationCode: `TRN-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000 + 100000)}`,
            message: 'Registration successful! Confirmation sent to your email.',
          },
        };
      }
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
