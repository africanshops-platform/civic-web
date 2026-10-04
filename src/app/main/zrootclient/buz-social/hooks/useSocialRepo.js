import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';
import { mockLeaders, mockProjects, PROJECT_STATS } from '../mock';

// Community issues, votes and comments are REAL (civic-19). Leaders, projects and the engagement summary are still mock.
const USE_MOCK = true;
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

// ─── real API + normalizers ──────────────────────────────────────────────────────────────────────────

const api = {
  listIssues:   (params) => AuthApi().get('/community/issues', { params }),
  getIssue:     (id)     => AuthApi().get(`/community/issues/${id}`),
  getThread:    (id)     => AuthApi().get(`/community/issues/${id}/comments`),
  myVote:       (id)     => AuthApi().get(`/community/issues/${id}/my-vote`),
  createIssue:  (body)   => AuthApi().post('/community/issues', body),
  upvote:       (id)     => AuthApi().post(`/community/issues/${id}/upvote`),
  downvote:     (id)     => AuthApi().post(`/community/issues/${id}/downvote`),
  addComment:   (body)   => AuthApi().post('/community/comments', body),
};

// UI category ids <-> backend IssueCategory
const CATEGORY_TO_API = {
  infrastructure: 'INFRASTRUCTURE', security: 'SECURITY', healthcare: 'HEALTH', environment: 'ENVIRONMENT',
  utilities: 'INFRASTRUCTURE', education: 'EDUCATION', transportation: 'INFRASTRUCTURE', governance: 'GOVERNANCE', other: 'OTHER',
};
const CATEGORY_FROM_API = {
  INFRASTRUCTURE: 'infrastructure', SECURITY: 'security', HEALTH: 'healthcare', ENVIRONMENT: 'environment',
  EDUCATION: 'education', GOVERNANCE: 'governance', OTHER: 'other',
};
const slug = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, '-');

/** A real issue as the existing feed/detail components expect it, plus the vote-pipeline fields. */
export function normalizeIssue(i, votePolicy) {
  const up = i.upvoteCount ?? 0;
  const down = i.downvoteCount ?? 0;
  const cast = up + down;
  const policy = votePolicy || { supportThreshold: 0.6 };
  return {
    id: i.id,
    title: i.title,
    description: i.description ?? '',
    category: CATEGORY_FROM_API[i.category] ?? 'other',
    status: String(i.status || 'OPEN').toLowerCase(),
    priority: null,
    jurisdiction: { country: i.country, state: i.state, lga: i.lga, lgaId: slug(i.lga), stateId: slug(i.state) },
    location: { address: `${i.lga}, ${i.state}` },
    reportedBy: { name: 'Community member', verified: true },
    assignedTo: null,
    upvotes: up,
    downvotes: down,
    commentsCount: i._count?.comments ?? i.comments?.length ?? 0,
    views: 0,
    images: i.mediaUrls ?? [],
    tags: [CATEGORY_FROM_API[i.category] ?? 'other'],
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
    resolvedAt: null,
    // vote pipeline (civic-19/20)
    votesCast: cast,
    supportPercent: cast ? Math.round((up / cast) * 100) : 0,
    votePolicy: policy,
    // the LGA's registered civic users the 60% was measured against, frozen when the issue was presented
    thresholdRegisteredUsers: i.thresholdRegisteredUsers ?? null,
    declineReason: i.declineReason ?? null,
    campaignId: i.campaignId ?? null,
    votingClosed: String(i.status || 'OPEN').toUpperCase() !== 'OPEN',
  };
}

function normalizeComment(c) {
  return {
    id: c.id,
    issueId: c.issueId,
    author: { name: 'Community member' },
    body: c.content,
    upvotes: 0,
    isOfficial: false,
    createdAt: c.createdAt,
    replies: (c.replies ?? []).map(normalizeComment),
  };
}

const errText = (e, fallback) => e?.response?.data?.message || fallback;

function issueStats(items) {
  const by = (st) => items.filter((i) => i.status === st).length;
  const resolved = by('resolved') + by('converted');
  return {
    totalIssues: items.length,
    openIssues: by('open'),
    inProgressIssues: by('in_progress') + by('pending_review') + by('converting'),
    resolvedIssues: resolved,
    resolutionRate: items.length ? Math.round((resolved / items.length) * 1000) / 10 : 0,
    avgResolutionDays: 0,
  };
}

export function useIssues(filters = {}) {
  return useQuery(
    ['social-issues', filters],
    () => api.listIssues({
      limit: 50,
      ...(filters.category ? { category: CATEGORY_TO_API[filters.category] } : {}),
      ...(filters.status ? { status: String(filters.status).toUpperCase() } : {}),
    }),
    {
      select: (res) => {
        const d = res.data;
        let issues = (d.items ?? []).map((i) => normalizeIssue(i, d.votePolicy));
        if (filters.lgaId) issues = issues.filter((i) => i.jurisdiction.lgaId === filters.lgaId);
        if (filters.search) {
          const q = filters.search.toLowerCase();
          issues = issues.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
        }
        return { data: { issues, stats: issueStats(issues) } };
      },
      keepPreviousData: true,
      staleTime: 60 * 1000,
    }
  );
}

export function useIssueDetail(issueId) {
  return useQuery(
    ['social-issue', issueId],
    async () => {
      const [issueRes, threadRes] = await Promise.all([api.getIssue(issueId), api.getThread(issueId).catch(() => ({ data: {} }))]);
      const issue = normalizeIssue(issueRes.data, issueRes.data.votePolicy);
      const thread = threadRes.data?.thread ?? issueRes.data.comments ?? [];
      return { data: { issue, comments: thread.map(normalizeComment) } };
    },
    { enabled: Boolean(issueId), staleTime: 30 * 1000 }
  );
}

/** The signed-in citizen's own vote on an issue ('UP' | 'DOWN' | null). Quietly null when signed out. */
export function useMyVote(issueId) {
  return useQuery(['social-my-vote', issueId], () => api.myVote(issueId), {
    enabled: Boolean(issueId),
    select: (res) => res.data?.voteType ?? null,
    retry: false,
    staleTime: 30 * 1000,
  });
}

/** Issues the vote carried to the geo admin and that became a funded project, or were resolved. */
export function useResolvedIssues() {
  return useQuery(
    ['social-issues-resolved'],
    () => Promise.all([api.listIssues({ limit: 50, status: 'RESOLVED' }), api.listIssues({ limit: 50, status: 'CONVERTED' })]),
    {
      select: ([a, b]) => {
        const issues = [...(a.data.items ?? []), ...(b.data.items ?? [])].map((i) => normalizeIssue(i, a.data.votePolicy));
        return { data: { issues, stats: issueStats(issues) } };
      },
      staleTime: 2 * 60 * 1000,
    }
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
    (payload) => api.createIssue({
      title: payload.title.trim(),
      description: payload.description.trim(),
      category: CATEGORY_TO_API[payload.category] ?? 'OTHER',
      // The issue is about one of the citizen's own LGAs: the gateway reads it from their civic profile.
      locationBasis: payload.locationBasis === 'HOME_ORIGIN' ? 'HOME_ORIGIN' : 'DWELLING',
    }),
    {
      onSuccess: () => {
        toast.success('Issue reported. Citizens of your LGA can now vote on it.');
        queryClient.invalidateQueries(['social-issues']);
      },
      onError: (e) => toast.error(errText(e, 'Could not submit issue. Please try again.')),
    }
  );
}

function useVote(kind) {
  const queryClient = useQueryClient();
  return useMutation(
    (issueId) => (kind === 'UP' ? api.upvote(issueId) : api.downvote(issueId)).then((res) => ({ ...res.data, issueId })),
    {
      onSuccess: (data) => {
        if (data?.thresholdReached) toast.success('Your vote carried it. This issue now goes to your LGA coordinator for a decision.');
        queryClient.invalidateQueries(['social-issues']);
        queryClient.invalidateQueries(['social-issue', data?.issueId]);
        queryClient.invalidateQueries(['social-my-vote', data?.issueId]);
      },
      onError: (e) => toast.error(errText(e, 'Could not record your vote.')),
    }
  );
}

export const useUpvoteIssue = () => useVote('UP');
export const useDownvoteIssue = () => useVote('DOWN');

export function usePostComment() {
  const queryClient = useQueryClient();
  return useMutation(
    (payload) => api.addComment({ issueId: payload.issueId, content: payload.body }).then(() => ({ issueId: payload.issueId })),
    {
      onSuccess: (data) => {
        toast.success('Comment posted.');
        queryClient.invalidateQueries(['social-issue', data.issueId]);
      },
      onError: (e) => toast.error(errText(e, 'Could not post comment.')),
    }
  );
}
