import { memo } from 'react';
import { motion } from 'framer-motion';
import { Chip } from '@mui/material';
import { BarChart, HowToVote, Campaign, CheckCircle } from '@mui/icons-material';

const F = {
  sectionHead: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  statValue:   'clamp(2rem,    3.2vw, 2.8rem)',
  statLabel:   'clamp(1.3rem,  1.8vw, 1.64rem)',
  body:        'clamp(1.5rem,  2.2vw, 1.9rem)',
  small:       'clamp(1.3rem,  1.8vw, 1.56rem)',
  icon:        'clamp(22px,    2.6vw, 28px)',
};

function StatCard({ Icon, value, label, accent }) {
  return (
    <div style={{
      padding: 'clamp(12px, 1.6vw, 18px)', borderRadius: 14,
      background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
      border: '1px solid #c7d2fe',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <Icon sx={{ fontSize: F.icon, color: accent || '#1d4ed8' }} />
      <div style={{ fontWeight: 900, fontSize: F.statValue, color: accent || '#1d4ed8', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: F.statLabel, color: '#6b7280', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function GovernanceSidebarRight({ stats, elections }) {
  const elStats = stats || { totalElections: 0, ongoingElections: 0, completedElections: 0, totalVotersParticipated: 0 };
  const liveElections = elections?.filter((e) => e.status === 'ongoing') ?? [];

  return (
    <div style={{ padding: 'clamp(16px, 2vw, 24px)', display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 2.4vw, 26px)' }}>

      {/* ── At a glance ── */}
      <div>
        <div style={{ fontWeight: 800, color: '#111827', fontSize: F.sectionHead, marginBottom: 'clamp(10px, 1.4vw, 16px)' }}>
          Platform Stats
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(8px, 1.2vw, 12px)' }}>
          <StatCard Icon={BarChart}     value={elStats.totalElections}                        label="Community Votes" />
          <StatCard Icon={HowToVote}    value={elStats.ongoingElections}                      label="Open Now"   accent="#ef4444" />
          <StatCard Icon={CheckCircle}  value={elStats.completedElections}                    label="Closed" accent="#16a34a" />
          <StatCard Icon={Campaign}     value={(elStats.totalVotersParticipated ?? 0).toLocaleString()} label="Voted Online" accent="#7c3aed" />
        </div>
      </div>

      {/* ── Live Elections ── */}
      {liveElections.length > 0 && (
        <div>
          <div style={{ fontWeight: 800, color: '#111827', fontSize: F.sectionHead, marginBottom: 'clamp(10px, 1.4vw, 14px)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
            Open Now
          </div>
          {liveElections.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                padding: 'clamp(12px, 1.6vw, 16px)',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
                border: '1px solid #c7d2fe', marginBottom: 8,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: F.body, color: '#1e1b4b', marginBottom: 6, lineHeight: 1.3 }}>
                {e.title}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: F.small, color: '#6b7280' }}>{e.votersParticipated.toLocaleString()} voted online</span>
                <Chip label="OPEN" size="small" sx={{ background: '#ef4444', color: 'white', fontWeight: 800, fontSize: F.small, height: 28 }} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}

export default memo(GovernanceSidebarRight);
