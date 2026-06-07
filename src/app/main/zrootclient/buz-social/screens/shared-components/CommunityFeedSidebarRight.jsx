import { memo } from 'react';
import { Forum, CheckCircle, TrendingUp, Group } from '@mui/icons-material';
import { CivicStatCard, ActivityFeedItem } from '../../../civic-shared';
import { ISSUE_STATS, PROJECT_STATS } from '../../mock';

const F = {
  meta:    'clamp(1.2rem, 1.8vw, 1.5rem)',
  subH:    'clamp(1.4rem, 2.2vw, 1.8rem)',
  sectionH:'clamp(2rem,   4vw,   3.4rem)',
};

const ACTIVITY = [
  { id: 1, title: 'New issue: Flooded road in Surulere Ward 5',       subtitle: '4 min ago',  category: 'infrastructure' },
  { id: 2, title: 'Official response on Opebi streetlights issue',    subtitle: '32 min ago', category: 'security'       },
  { id: 3, title: 'Agege Market lighting project — 100% complete',    subtitle: '2 hrs ago',  category: 'environment'    },
  { id: 4, title: '142 upvotes on Lekki drainage issue today',        subtitle: '5 hrs ago',  category: 'default'        },
];

function CommunityFeedSidebarRight({ stats }) {
  const s = stats || ISSUE_STATS;

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
            {PROJECT_STATS.inProgressProjects}
          </div>
          <div style={{ fontSize: F.meta, color: '#16a34a', fontWeight: 600 }}>
            projects in progress
          </div>
          <div style={{ fontSize: F.meta, color: '#6b7280', marginTop: 4 }}>
            ₦{(PROJECT_STATS.totalSpent / 1_000_000_000).toFixed(1)}B spent of ₦{(PROJECT_STATS.totalBudget / 1_000_000_000).toFixed(1)}B budget
          </div>
        </div>
      </div>

      {/* ── Live Activity ── */}
      <div>
        <div style={{ fontWeight: 800, color: '#111827', marginBottom: 10, fontSize: F.subH }}>
          Live Activity
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {ACTIVITY.map((item, i) => (
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
