import { memo } from 'react';
import { motion } from 'framer-motion';
import { Chip } from '@mui/material';
import { BarChart, HowToVote, Campaign, CheckCircle } from '@mui/icons-material';
import { ELECTION_STATS, PETITION_STATS } from '../../mock';

const F = {
  sectionHead: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  statValue:   'clamp(2rem,    3.2vw, 2.8rem)',
  statLabel:   'clamp(1.3rem,  1.8vw, 1.64rem)',
  body:        'clamp(1.5rem,  2.2vw, 1.9rem)',
  small:       'clamp(1.3rem,  1.8vw, 1.56rem)',
  icon:        'clamp(22px,    2.6vw, 28px)',
};

const ACTIVITY = [
  { id: 1, text: 'Lagos Gov results: 187/245 wards collated', time: '2 min ago',  dot: '#1d4ed8' },
  { id: 2, text: '342 new signatures on the Lekki-Epe petition', time: '15 min ago', dot: '#7c3aed' },
  { id: 3, text: 'Eti-Osa LGA collation completed — APC wins', time: '3 hrs ago',  dot: '#16a34a' },
  { id: 4, text: 'Ikeja By-Election: nominations close in 3 days', time: '1 day ago', dot: '#d97706' },
];

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
  const elStats = stats || ELECTION_STATS;
  const liveElections = elections?.filter((e) => e.status === 'ongoing') ?? [];

  return (
    <div style={{ padding: 'clamp(16px, 2vw, 24px)', display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 2.4vw, 26px)' }}>

      {/* ── Platform Stats ── */}
      <div>
        <div style={{ fontWeight: 800, color: '#111827', fontSize: F.sectionHead, marginBottom: 'clamp(10px, 1.4vw, 16px)' }}>
          Platform Stats
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(8px, 1.2vw, 12px)' }}>
          <StatCard Icon={BarChart}     value={elStats.totalElections}                       label="Elections" />
          <StatCard Icon={HowToVote}    value={elStats.ongoingElections}                      label="Live Now"   accent="#ef4444" />
          <StatCard Icon={Campaign}     value={PETITION_STATS?.activePetitions || 24}         label="Petitions"  accent="#7c3aed" />
          <StatCard Icon={CheckCircle}  value={`${elStats.averageTurnout}%`}                  label="Avg. Turnout" accent="#16a34a" />
        </div>
      </div>

      {/* ── Live Elections ── */}
      {liveElections.length > 0 && (
        <div>
          <div style={{ fontWeight: 800, color: '#111827', fontSize: F.sectionHead, marginBottom: 'clamp(10px, 1.4vw, 14px)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
            Live Elections
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
                <span style={{ fontSize: F.small, color: '#6b7280' }}>{e.wardsCollated}/{e.wardsTotal} wards</span>
                <Chip label="LIVE" size="small" sx={{ background: '#ef4444', color: 'white', fontWeight: 800, fontSize: F.small, height: 28 }} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Activity Feed ── */}
      <div>
        <div style={{ fontWeight: 800, color: '#111827', fontSize: F.sectionHead, marginBottom: 'clamp(10px, 1.4vw, 14px)' }}>
          Activity
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.2vw, 12px)' }}>
          {ACTIVITY.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: 'clamp(8px, 1.2vw, 12px)', alignItems: 'flex-start' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.dot, flexShrink: 0, marginTop: 'clamp(4px, 0.6vw, 6px)' }} />
              <div>
                <div style={{ fontSize: F.body, color: '#374151', fontWeight: 600, lineHeight: 1.4 }}>{item.text}</div>
                <div style={{ fontSize: F.small, color: '#9ca3af', marginTop: 2 }}>{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default memo(GovernanceSidebarRight);
