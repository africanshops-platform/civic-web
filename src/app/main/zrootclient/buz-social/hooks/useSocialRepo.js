import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';
import useCivicWebAuth from 'src/app/hooks/useCivicWebAuth';
import { useMemo } from 'react';
import { useCampaigns, useCampaignDetail, useMyContributions } from '../../buz-civictax/hooks/useCivicTaxRepo';

// Everything here is real: issues, votes and comments (civic-19), and projects and the engagement summary, which come
// from the funded campaigns and contributions in civictax-service (an approved issue becomes a campaign with a project).

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
  // user-generated-content safety (civic-75 F2)
  terms:        ()       => AuthApi().get('/community/terms'),
  acceptTerms:  (version) => AuthApi().post('/community/terms/accept', { version }),
  myBlocks:     ()       => AuthApi().get('/community/blocks/mine'),
  block:        (body)   => AuthApi().post('/community/blocks', body),
  unblock:      (key)    => AuthApi().delete(`/community/blocks/${key}`),
  report:       (body)   => AuthApi().post('/community/reports', body),
  issueMap:     ()       => AuthApi().get('/community/issues/map'),
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
    authorKey: i.authorKey ?? null,
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
    authorKey: c.authorKey ?? null,
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
  const blocked = useBlockedKeys();
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
        let issues = (d.items ?? []).map((i) => normalizeIssue(i, d.votePolicy)).filter((i) => !blocked.has(i.authorKey));
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
  const blocked = useBlockedKeys();
  return useQuery(
    ['social-issue', issueId],
    async () => {
      const [issueRes, threadRes] = await Promise.all([api.getIssue(issueId), api.getThread(issueId).catch(() => ({ data: {} }))]);
      const issue = normalizeIssue(issueRes.data, issueRes.data.votePolicy);
      const thread = threadRes.data?.thread ?? issueRes.data.comments ?? [];
      return { data: { issue, comments: thread.map(normalizeComment) } };
    },
    {
      enabled: Boolean(issueId),
      staleTime: 30 * 1000,
      // Comments (and replies) by authors the citizen blocked stay out of their view.
      select: (res) => ({
        data: {
          ...res.data,
          comments: res.data.comments
            .filter((c) => !blocked.has(c.authorKey))
            .map((c) => ({ ...c, replies: (c.replies ?? []).filter((r) => !blocked.has(r.authorKey)) })),
        },
      }),
    }
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

const lower = (v) => String(v ?? '').toLowerCase();

/** A funded project as the project cards expect it, from a campaign that carries a project. Money comes from the campaign. */
export function projectFromCampaign(c) {
  const p = c?.project;
  if (!p) return null;
  const ms = p.milestones ?? [];
  const done = ms.filter((m) => lower(m.status) === 'completed').length;
  const released = ms.some((m) => m.amountDisbursedKobo != null)
    ? ms.reduce((n, m) => n + Number(m.amountDisbursedKobo || 0), 0) / 100
    : null;
  return {
    id: c.id, // the route id is the campaign id, so the detail page reads one campaign
    title: c.title,
    description: p.description || c.description || '',
    status: lower(p.status || 'PLANNED'),
    jurisdiction: { country: c.country, state: c.state, lga: c.lga, lgaId: slug(c.lga), stateId: slug(c.state) },
    budget: c.targetAmount,
    raised: c.raisedAmount,
    released,
    milestonesDone: done,
    milestonesTotal: ms.length,
    completionPercentage: ms.length ? Math.round((done / ms.length) * 100) : 0,
    milestones: ms.map((m) => ({
      id: m.id,
      title: m.title,
      completed: lower(m.status) === 'completed',
      status: lower(m.status),
      date: m.completedAt || m.dueDate || null,
      note: m.note ?? null,
    })),
    relatedIssueId: c.sourceIssueId ?? null,
    startDate: p.startDate ?? null,
    endDate: p.endDate ?? null,
  };
}

/** Funded projects across the platform, newest first. Figures are sums of what the campaigns actually hold. */
export function useCommunityProjects(filters = {}) {
  const query = useCampaigns({ limit: 50 });
  const data = useMemo(() => {
    const all = (query.data?.data?.campaigns ?? []).map(projectFromCampaign).filter(Boolean);
    const projects = filters.status ? all.filter((p) => p.status === filters.status) : all;
    return {
      data: {
        projects,
        stats: {
          inProgressProjects: all.filter((p) => p.status === 'in_progress').length,
          completedProjects: all.filter((p) => p.status === 'completed').length,
          totalBudget: all.reduce((n, p) => n + (p.budget || 0), 0),
          totalRaised: all.reduce((n, p) => n + (p.raised || 0), 0),
        },
      },
    };
  }, [query.data, filters.status]);
  return { ...query, data: query.data ? data : undefined };
}

export function useProjectDetail(campaignId) {
  const query = useCampaignDetail(campaignId);
  const project = useMemo(() => projectFromCampaign(query.data?.data?.campaign), [query.data]);
  const issueId = project?.relatedIssueId;
  const issue = useQuery(['social-issue-title', issueId], () => api.getIssue(issueId), {
    enabled: Boolean(issueId),
    select: (res) => res.data?.title ?? null,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return {
    ...query,
    data: project ? { data: { project: { ...project, issueTitle: issue.data ?? null } } } : undefined,
    isError: query.isError || (query.isSuccess && !project),
  };
}

/** What the signed-in citizen has put into funded projects. Reports, votes and comments are not summarised here yet:
 *  the community service has no per-citizen activity endpoint, so nothing is invented in their place. */
export function useMyEngagement() {
  const query = useMyContributions(1, 10);
  const data = useMemo(() => ({
    data: {
      contributionsMade: query.data?.data?.stats?.total ?? 0,
      recent: query.data?.data?.contributions ?? [],
    },
  }), [query.data]);
  return { ...query, data: query.data ? data : undefined };
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

// ─── forum rules, report and block (civic-75 F2) ─────────────────────────────────────────────────────

/** Has the signed-in citizen accepted the current forum rules? Undefined while loading or when signed out. */
export function useForumTerms() {
  const { isAuthenticated } = useCivicWebAuth();
  return useQuery(['social-terms'], () => api.terms(), {
    enabled: Boolean(isAuthenticated),
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useAcceptForumTerms() {
  const queryClient = useQueryClient();
  return useMutation((version) => api.acceptTerms(version), {
    onSuccess: () => queryClient.invalidateQueries(['social-terms']),
    onError: (e) => toast.error(errText(e, 'Could not record your acceptance. Please try again.')),
  });
}

const NO_BLOCKS = new Set();

/** Opaque keys of the authors the signed-in citizen blocked. The client never sees who they are. */
export function useBlockedKeys() {
  const { isAuthenticated } = useCivicWebAuth();
  const { data } = useQuery(['social-blocks'], () => api.myBlocks(), {
    enabled: Boolean(isAuthenticated),
    select: (res) => res.data?.items ?? [],
    staleTime: 60 * 1000,
    retry: false,
  });
  return useMemo(() => (data?.length ? new Set(data.map((b) => b.authorKey)) : NO_BLOCKS), [data]);
}

export function useBlockAuthor() {
  const queryClient = useQueryClient();
  return useMutation((payload) => api.block(payload), {
    onSuccess: () => {
      toast.success('Blocked. You will no longer see their posts or comments.');
      queryClient.invalidateQueries(['social-blocks']);
    },
    onError: (e) => toast.error(errText(e, 'Could not block this author.')),
  });
}

export function useUnblockAuthor() {
  const queryClient = useQueryClient();
  return useMutation((key) => api.unblock(key), { onSuccess: () => queryClient.invalidateQueries(['social-blocks']) });
}

export function useReportContent() {
  return useMutation((payload) => api.report(payload), {
    onSuccess: (res) => toast.success(res?.data?.alreadyReported ? 'You already reported this. Our moderators will review it.' : 'Thank you. Your report was sent to the moderators of this area.'),
    onError: (e) => toast.error(errText(e, 'Could not send your report.')),
  });
}

/** Issues grouped by LGA with real centre points, for the map beside the forum. Public. */
export function useIssueMap() {
  return useQuery(['social-issue-map'], () => api.issueMap(), {
    select: (res) => res.data,
    staleTime: 2 * 60 * 1000,
  });
}
