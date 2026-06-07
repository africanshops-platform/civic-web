import { memo } from 'react';
import { Divider, LinearProgress } from '@mui/material';
import { EmojiEvents, TrendingUp, People, Bolt } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { CivicStatCard, ActivityFeedItem } from '../../../civic-shared';
import { CAMPAIGN_STATS, CAMPAIGN_CATEGORIES, mockCampaigns } from '../../mock';

const F = {
  meta:    'clamp(1.2rem, 1.8vw, 1.5rem)',
  body:    'clamp(1.3rem, 2vw,   1.64rem)',
  subH:    'clamp(1.4rem, 2.2vw, 1.8rem)',
  sectionH:'clamp(2rem,   4vw,   3.4rem)',
};

const recentActivity = mockCampaigns
  .filter((c) => c.status === 'active')
  .slice(0, 4)
  .map((c) => ({
    id: c.id,
    title: `${c.contributorsCount} contributors supporting`,
    subtitle: c.title,
    category: c.category,
    amount: c.raisedAmount,
    timestamp: c.createdAt,
  }));

function CampaignsBrowseSidebarRight({ stats }) {
  const s = stats || CAMPAIGN_STATS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 'clamp(14px, 2vw, 20px)', overflowY: 'auto', gap: 'clamp(14px, 2vw, 20px)', background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 100%)' }}>

      {/* ── Civic Impact banner ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ borderRadius: 16, padding: 'clamp(14px, 2vw, 20px)', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 60%, #c2410c 100%)', boxShadow: '0 8px 24px rgba(234,88,12,0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <EmojiEvents style={{ color: '#fde047', fontSize: 'clamp(18px, 2.2vw, 24px)' }} />
          <div style={{ fontWeight: 800, color: 'white', fontSize: F.subH }}>Civic Impact</div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: F.meta, lineHeight: 1.6, marginBottom: 14 }}>
          Every contribution builds a safer, healthier, and more prosperous Nigeria — one LGA at a time.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ textAlign: 'center', padding: 'clamp(8px,1.2vw,12px)', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div style={{ fontWeight: 900, color: 'white', fontSize: F.sectionH }}>{s.totalContributors.toLocaleString()}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: F.meta }}>Contributors</div>
          </div>
          <div style={{ textAlign: 'center', padding: 'clamp(8px,1.2vw,12px)', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div style={{ fontWeight: 900, color: 'white', fontSize: F.sectionH }}>₦{(s.totalRaised / 1000000).toFixed(1)}M</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: F.meta }}>Total Raised</div>
          </div>
        </div>
      </motion.div>

      {/* ── Quick stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <CivicStatCard icon={Bolt}        label="Active"    value={s.activeCampaigns}    subtitle="campaigns"   />
        <CivicStatCard icon={EmojiEvents} label="Completed" value={s.completedCampaigns} subtitle="goals reached" />
      </div>

      {/* ── Platform Progress ── */}
      <div style={{ borderRadius: 16, padding: 'clamp(14px, 2vw, 18px)', background: 'white', border: '1px solid #ffedd5', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ fontWeight: 700, fontSize: F.subH, color: '#1f2937', marginBottom: 'clamp(12px, 1.6vw, 18px)' }}>
          Platform Progress
        </div>
        {CAMPAIGN_CATEGORIES.map((cat) => {
          const catCampaigns = mockCampaigns.filter((c) => c.category === cat.id);
          if (!catCampaigns.length) return null;
          const totalRaised = catCampaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
          const totalTarget = catCampaigns.reduce((sum, c) => sum + c.targetAmount, 0);
          const pct = Math.round((totalRaised / totalTarget) * 100);
          return (
            <div key={cat.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: F.meta, fontWeight: 600, color: '#374151' }}>{cat.icon} {cat.label}</span>
                <span style={{ fontSize: F.meta, fontWeight: 700, color: cat.color }}>{pct}%</span>
              </div>
              <LinearProgress variant="determinate" value={pct}
                sx={{ height: 6, borderRadius: 3, backgroundColor: '#ffedd5', '& .MuiLinearProgress-bar': { borderRadius: 3, backgroundColor: cat.color } }} />
            </div>
          );
        })}
      </div>

      <Divider sx={{ borderColor: '#ffedd5' }} />

      {/* ── Recent Activity ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'clamp(10px, 1.4vw, 14px)' }}>
          <TrendingUp style={{ color: '#ea580c', fontSize: 'clamp(16px, 2vw, 20px)' }} />
          <div style={{ fontWeight: 700, fontSize: F.subH, color: '#1f2937' }}>Recent Activity</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recentActivity.map((item, i) => (
            <ActivityFeedItem key={item.id} category={item.category} title={item.title} subtitle={item.subtitle} amount={item.amount} timestamp={item.timestamp} index={i} />
          ))}
        </div>
      </div>

      {/* ── Invite Banner ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ borderRadius: 16, padding: 'clamp(14px, 2vw, 20px)', textAlign: 'center', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '1px solid #fdba74' }}>
        <People style={{ color: '#ea580c', fontSize: 'clamp(24px, 3.5vw, 32px)', marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
        <div style={{ fontWeight: 700, fontSize: F.body, color: '#1f2937', marginBottom: 4 }}>Bring Your Community</div>
        <div style={{ fontSize: F.meta, color: '#6b7280' }}>Share these campaigns and multiply the impact.</div>
      </motion.div>
    </div>
  );
}

export default memo(CampaignsBrowseSidebarRight);
