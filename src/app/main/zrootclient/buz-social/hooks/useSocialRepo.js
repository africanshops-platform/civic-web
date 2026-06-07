import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { mockIssues, ISSUE_STATS, mockComments, mockLeaders, mockProjects, PROJECT_STATS } from '../mock';

const USE_MOCK = true;
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

function applyIssueFilters(items, filters = {}) {
  return items.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.priority && item.priority !== filters.priority) return false;
    if (filters.lgaId && item.jurisdiction?.lgaId !== filters.lgaId) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!item.title.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function useIssues(filters = {}) {
  return useQuery(
    ['social-issues', filters],
    async () => {
      if (USE_MOCK) {
        await delay(700);
        const filtered = applyIssueFilters(mockIssues, filters);
        return { data: { issues: filtered, stats: ISSUE_STATS } };
      }
    },
    { keepPreviousData: true, staleTime: 2 * 60 * 1000 }
  );
}

export function useIssueDetail(issueId) {
  return useQuery(
    ['social-issue', issueId],
    async () => {
      if (USE_MOCK) {
        await delay(450);
        const issue = mockIssues.find((i) => i.id === issueId) || mockIssues[0];
        const comments = mockComments.filter((c) => c.issueId === issueId);
        return { data: { issue, comments } };
      }
    },
    { enabled: Boolean(issueId), staleTime: 2 * 60 * 1000 }
  );
}

export function useResolvedIssues() {
  return useQuery(
    ['social-issues-resolved'],
    async () => {
      if (USE_MOCK) {
        await delay(600);
        const resolved = mockIssues.filter((i) => i.status === 'resolved');
        return { data: { issues: resolved, stats: ISSUE_STATS } };
      }
    },
    { staleTime: 3 * 60 * 1000 }
  );
}

export function useLeaders(filters = {}) {
  return useQuery(
    ['social-leaders', filters],
    async () => {
      if (USE_MOCK) {
        await delay(500);
        const filtered = mockLeaders.filter((l) => {
          if (filters.lgaId && l.jurisdiction?.lga?.toLowerCase().replace(' ', '-') !== filters.lgaId) return false;
          return true;
        });
        return { data: { leaders: filtered } };
      }
    },
    { keepPreviousData: true, staleTime: 5 * 60 * 1000 }
  );
}

export function useCommunityProjects(filters = {}) {
  return useQuery(
    ['social-projects', filters],
    async () => {
      if (USE_MOCK) {
        await delay(650);
        const filtered = mockProjects.filter((p) => {
          if (filters.status && p.status !== filters.status) return false;
          if (filters.category && p.category !== filters.category) return false;
          return true;
        });
        return { data: { projects: filtered, stats: PROJECT_STATS } };
      }
    },
    { keepPreviousData: true, staleTime: 2 * 60 * 1000 }
  );
}

export function useProjectDetail(projectId) {
  return useQuery(
    ['social-project', projectId],
    async () => {
      if (USE_MOCK) {
        await delay(400);
        const project = mockProjects.find((p) => p.id === projectId) || mockProjects[0];
        return { data: { project } };
      }
    },
    { enabled: Boolean(projectId), staleTime: 3 * 60 * 1000 }
  );
}

export function useMyEngagement() {
  return useQuery(
    ['social-my-engagement'],
    async () => {
      if (USE_MOCK) {
        await delay(500);
        return {
          data: {
            issuesReported: 3,
            issuesUpvoted: 14,
            commentsPosted: 7,
            projectsWatched: 5,
            recentActivity: [
              { type: 'issue_reported', title: 'Admiralty Way flooding', date: '2026-05-18T09:24:00Z' },
              { type: 'comment_posted', title: 'Commented on Opebi streetlights issue', date: '2026-05-16T11:00:00Z' },
              { type: 'issue_upvoted', title: 'Upvoted: Agege refuse dump issue', date: '2026-05-10T14:00:00Z' },
            ],
          },
        };
      }
    },
    { staleTime: 2 * 60 * 1000 }
  );
}

export function useReportIssue() {
  const queryClient = useQueryClient();
  return useMutation(
    async (payload) => {
      if (USE_MOCK) {
        await delay(1400);
        return {
          data: {
            success: true,
            issueId: `issue_${Date.now()}`,
            message: 'Issue reported successfully. Your community will see it shortly.',
          },
        };
      }
    },
    {
      onSuccess: (data) => {
        if (data?.data?.success) {
          toast.success(data.data.message || 'Issue reported!');
          queryClient.invalidateQueries(['social-issues']);
          queryClient.invalidateQueries(['social-my-engagement']);
        }
      },
      onError: () => toast.error('Could not submit issue. Please try again.'),
    }
  );
}

export function useUpvoteIssue() {
  const queryClient = useQueryClient();
  return useMutation(
    async (issueId) => {
      if (USE_MOCK) {
        await delay(300);
        return { data: { success: true, issueId } };
      }
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['social-issues']);
        queryClient.invalidateQueries(['social-issue', data?.data?.issueId]);
      },
    }
  );
}

export function usePostComment() {
  const queryClient = useQueryClient();
  return useMutation(
    async (payload) => {
      if (USE_MOCK) {
        await delay(800);
        return { data: { success: true, issueId: payload.issueId, message: 'Comment posted.' } };
      }
    },
    {
      onSuccess: (data) => {
        if (data?.data?.success) {
          toast.success('Comment posted.');
          queryClient.invalidateQueries(['social-issue', data.data.issueId]);
        }
      },
      onError: () => toast.error('Could not post comment.'),
    }
  );
}
