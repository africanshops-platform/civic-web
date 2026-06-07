import { memo } from 'react';
import { motion } from 'framer-motion';
import { Button, Chip, LinearProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { ArrowForward, HowToVote, Campaign } from '@mui/icons-material';
import { CivicEmptyState, CivicLoadingSkeleton } from '../../../civic-shared';
import { ELECTION_TYPES } from '../../mock';

/* ── Civic responsive font tokens ── */
const F = {
  sectionHead: 'clamp(2.6rem,  4vw,   3.4rem)',
  subHead:     'clamp(1.5rem,  2.2vw, 1.9rem)',
  cardTitle:   'clamp(1.44rem, 2.2vw, 1.9rem)',
  body:        'clamp(1.3rem,  1.8vw, 1.64rem)',
  small:       'clamp(1.2rem,  1.6vw, 1.44rem)',
  statValue:   'clamp(1.6rem,  2.6vw, 2.2rem)',
  statLabel:   'clamp(1.1rem,  1.5vw, 1.36rem)',
  btn:         'clamp(1.3rem,  1.8vw, 1.6rem)',
  icon:        'clamp(1.8rem,  2.6vw, 2.4rem)',
  chipH:       36,
};

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
});

function ElectionCard({ election, index }) {
  const typeInfo = ELECTION_TYPES.find((t) => t.id === election.type) || {};
  const statusColors = {
    ongoing:   { bg: '#fef2f2', color: '#dc2626', label: 'LIVE'      },
    upcoming:  { bg: '#eff6ff', color: '#1d4ed8', label: 'UPCOMING'  },
    completed: { bg: '#f0fdf4', color: '#16a34a', label: 'COMPLETED' },
  };
  const statusStyle = statusColors[election.status] || statusColors.upcoming;

  return (
    <motion.div
      {...inView(index * 0.07)}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        borderRadius: 20,
        padding: 'clamp(18px, 2.4vw, 28px)',
        background: 'white',
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      }}
    >
      {/* Row 1: icon + title + status chip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.4vw, 16px)', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: F.icon, flexShrink: 0 }}>{typeInfo.icon || '🗳️'}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, color: '#111827', fontSize: F.cardTitle, lineHeight: 1.3 }}>
              {election.title}
            </div>
            <div style={{ fontSize: F.small, color: '#9ca3af', marginTop: 4 }}>
              {election.jurisdiction.state}
              {election.jurisdiction.lga ? ` · ${election.jurisdiction.lga}` : ''}
            </div>
          </div>
        </div>
        <Chip
          label={statusStyle.label}
          sx={{
            height: F.chipH,
            fontSize: F.small,
            background: statusStyle.bg,
            color: statusStyle.color,
            fontWeight: 800,
            flexShrink: 0,
          }}
        />
      </div>

      {/* Row 2: stats grid — stretches full card width */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'clamp(8px, 1.2vw, 14px)',
        marginBottom: 'clamp(14px, 1.8vw, 20px)',
      }}>
        {[
          { label: 'Registered', value: (election.totalRegisteredVoters / 1_000_000).toFixed(1) + 'M' },
          { label: 'Turnout',    value: `${election.turnoutPercentage}%` },
          { label: 'Wards',      value: `${election.wardsCollated}/${election.wardsTotal}` },
          { label: 'Candidates', value: election.candidatesCount },
        ].map((s) => (
          <div key={s.label} style={{
            textAlign: 'center',
            background: '#f9fafb',
            borderRadius: 12,
            padding: 'clamp(10px, 1.4vw, 16px) 4px',
          }}>
            <div style={{ fontWeight: 900, color: '#111827', fontSize: F.statValue }}>{s.value}</div>
            <div style={{ fontSize: F.statLabel, color: '#9ca3af', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Row 3: live progress bar */}
      {election.status === 'ongoing' && election.wardsTotal > 0 && (
        <div style={{ marginBottom: 'clamp(12px, 1.6vw, 18px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: F.small, color: '#6b7280', fontWeight: 600 }}>Wards collated</span>
            <span style={{ fontSize: F.small, fontWeight: 700, color: '#dc2626' }}>
              {Math.round((election.wardsCollated / election.wardsTotal) * 100)}%
            </span>
          </div>
          <LinearProgress
            variant="determinate"
            value={Math.round((election.wardsCollated / election.wardsTotal) * 100)}
            sx={{
              height: 8, borderRadius: 4,
              background: '#fee2e2',
              '& .MuiLinearProgress-bar': { background: '#dc2626', borderRadius: 4 },
            }}
          />
        </div>
      )}

      {/* Row 4: action buttons */}
      <div style={{ display: 'flex', gap: 'clamp(8px, 1.2vw, 14px)', flexWrap: 'wrap' }}>
        {election.status === 'ongoing' && (
          <Button
            component={Link} to={`/governance/elections/${election.id}/live`}
            size="medium" variant="contained" endIcon={<ArrowForward />}
            sx={{ background: '#dc2626', color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: F.btn }}
          >
            View Live Results
          </Button>
        )}
        {election.status !== 'completed' && (
          <Button
            component={Link} to={`/governance/elections/${election.id}/vote`}
            size="medium" variant="outlined" startIcon={<HowToVote />}
            sx={{ borderColor: '#1d4ed8', color: '#1d4ed8', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: F.btn }}
          >
            Cast Vote
          </Button>
        )}
        {election.status === 'completed' && (
          <Button
            component={Link} to={`/governance/elections/${election.id}/live`}
            size="medium" variant="outlined" endIcon={<ArrowForward />}
            sx={{ borderColor: '#16a34a', color: '#16a34a', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: F.btn }}
          >
            Final Results
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function GovernanceDashboardContent({ elections, isLoading, isError }) {
  if (isLoading) {
    return (
      <div style={{ padding: 'clamp(20px, 3vw, 40px)' }}>
        <CivicLoadingSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: 'clamp(20px, 3vw, 40px)' }}>
        <CivicEmptyState
          icon={<Campaign sx={{ fontSize: 64, color: '#d1d5db' }} />}
          title="Could not load elections"
          description="There was a problem loading election data. Please try again."
        />
      </div>
    );
  }

  if (!elections?.length) {
    return (
      <div style={{ padding: 'clamp(20px, 3vw, 40px)' }}>
        <CivicEmptyState
          icon={<HowToVote sx={{ fontSize: 64, color: '#d1d5db' }} />}
          title="No elections found"
          description="No elections match your current filters. Try adjusting the filter settings."
        />
      </div>
    );
  }

  return (
    <div style={{
      /* Cards fill 100% of the space the flex-auto wrapper gives them */
      width: '100%',
      boxSizing: 'border-box',
      padding: 'clamp(16px, 2.5vw, 32px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(12px, 1.6vw, 20px)',
    }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 900, color: '#111827', fontSize: F.sectionHead, lineHeight: 1.2 }}>
            Elections
          </div>
          <div style={{ fontSize: F.subHead, color: '#6b7280', marginTop: 6 }}>
            {elections.length} election{elections.length !== 1 ? 's' : ''} found
          </div>
        </div>
        <Button
          component={Link} to="/governance/participate"
          size="medium" variant="outlined" startIcon={<Campaign />}
          sx={{ borderColor: '#7c3aed', color: '#7c3aed', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: F.btn }}
        >
          Petitions & Participation
        </Button>
      </div>

      {/* Cards — each card is width: 100% of the container */}
      {elections.map((e, i) => <ElectionCard key={e.id} election={e} index={i} />)}
    </div>
  );
}

export default memo(GovernanceDashboardContent);
