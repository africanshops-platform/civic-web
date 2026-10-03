import { memo, useMemo } from 'react';
import { Forum, CheckCircle, TrendingUp, Group } from '@mui/icons-material';
import { CivicStatCard, ActivityFeedItem } from '../../../civic-shared';
import { useIssues } from '../../hooks/useSocialRepo';
import { useCampaigns } from '../../../buz-civictax/hooks/useCivicTaxRepo';

const F = {
  meta:    'clamp(1.2rem, 1.8vw, 1.5rem)',
  subH:    'clamp(1.4rem, 2.2vw, 1.8rem)',
  sectionH:'clamp(2rem,   4vw,   3.4rem)',
};

const ZERO_STATS = { openIssues: 0, inProgressIssues: 0, resolvedIssues: 0, resolutionRate: 0 };

function timeAgo(date) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.round(mins / 60)} hr ago`;
  return `${Math.round(mins / 1440)} d ago`;
}

function CommunityFeedSidebarRight() {
  // Real figures from the same (cached) queries the feed and campaign pages use.
  const { data: issueData } = useIssues({});
  const { data: campaignData } = useCampaigns({ limit: 50 });
  const s = issueData?.data?.stats ?? ZERO_STATS;
  const issues = useMemo(() => issueData?.data?.issues ?? [], [issueData]);
  const projects = useMemo(() => (campaignData?.data?.campaigns ?? []).filter((c) => c.project), [campaignData]);
  const raised = projects.reduce((n, c) => n + (c.raisedAmount || 0), 0);
  const target = projects.reduce((n, c) => n + (c.targetAmount || 0), 0);
  const naira = (v) => `₦${Number(v).toLocaleString()}`;
  const activity = useMemo(() => [...issues]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)
    .map((i) => ({
      id: i.id,
      title: i.status === 'converted' ? `Now a funded project: ${i.title}` : `Issue: ${i.title}`,
      subtitle: timeAgo(i.createdAt),
      category: 'default',
    })), [issues]);

  return (
    <div style={{ padding: 'clamp(14px, 2vw, 20px)', display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.4vw, 22px)' }}>

      {/* ── Community Stats ── */}
      <div>
        <div style={{ fontWeight: 800, color: '#111827', marginBottom: 12, fontSize: F.subH }}>
          Community Stats
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <CivicStatCard icon={Forum}       value={s.openIssues}           label="Open Issues"      />
          <CivicStatCard icon={TrendingUp}  value={s.inProgressIssues}     label="In Progress"      />
          <CivicStatCard icon={CheckCircle} value={s.resolvedIssues}       label="Resolved"         />
          <CivicStatCard icon={Group}       value={`${s.resolutionRate}%`} label="Resolution Rate"  />
        </div>
      </div>

      {/* ── Projects Active ── */}
      <div>
        <div style={{ fontWeight: 800, color: '#111827', marginBottom: 10, fontSize: F.subH }}>
          Projects Active
        </div>
        <div style={{
          padding: 'clamp(12px, 1.8vw, 18px)',
          borderRadius: 14,
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #bbf7d0',
        }}>
          <div style={{ fontWeight: 900, color: '#166534', fontSize: F.sectionH, lineHeight: 1.1, marginBottom: 4 }}>
            {projects.length}
          </div>
          <div style={{ fontSize: F.meta, color: '#16a34a', fontWeight: 600 }}>
            funded projects
          </div>
          <div style={{ fontSize: F.meta, color: '#6b7280', marginTop: 4 }}>
            {naira(raised)} raised of {naira(target)} target
          </div>
        </div>
      </div>

      {/* ── Live Activity ── */}
      <div>
        <div style={{ fontWeight: 800, color: '#111827', marginBottom: 10, fontSize: F.subH }}>
          Live Activity
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {activity.length === 0 && <div style={{ fontSize: F.meta, color: '#9ca3af' }}>No activity yet.</div>}
          {activity.map((item, i) => (
            <ActivityFeedItem
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              category={item.category}
              index={i}
            />
          ))}
        </div>
      </div>

    </div>
  );
}

export default memo(CommunityFeedSidebarRight);
