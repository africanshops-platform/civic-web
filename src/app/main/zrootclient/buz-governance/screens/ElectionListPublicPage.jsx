import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button, Chip, TextField, InputAdornment } from '@mui/material';
import { Link } from 'react-router-dom';
import { Search, HowToVote, BarChart, ArrowForward, CalendarToday, CheckCircle, People } from '@mui/icons-material';
import useCivicWebAuth from 'src/app/hooks/useCivicWebAuth';
import { useElections } from '../hooks/useGovernanceRepo';
import { ELECTION_TYPES, ELECTION_STATS } from '../mock';
import { CivicLoadingSkeleton, CivicEmptyState } from '../../civic-shared';

const F = {
  pageTitle:  'clamp(2.8rem, 4.5vw, 4rem)',
  subTitle:   'clamp(1.5rem, 2.2vw, 1.9rem)',
  cardTitle:  'clamp(1.44rem, 2.2vw, 1.9rem)',
  body:       'clamp(1.3rem, 1.8vw, 1.64rem)',
  small:      'clamp(1.2rem, 1.6vw, 1.44rem)',
  statValue:  'clamp(1.6rem, 2.6vw, 2.2rem)',
  statLabel:  'clamp(1.2rem, 1.6vw, 1.44rem)',
  chipH:      36,
  input:      'clamp(1.3rem, 1.8vw, 1.64rem)',
};

function ElectionCard({ election, index }) {
  const { isAuthenticated } = useCivicWebAuth();
  const typeInfo = ELECTION_TYPES.find((t) => t.id === election.type) || {};
  const statusMap = {
    ongoing:   { label: 'LIVE',      bg: '#fef2f2', color: '#dc2626' },
    upcoming:  { label: 'UPCOMING',  bg: '#eff6ff', color: '#1d4ed8' },
    completed: { label: 'COMPLETED', bg: '#f0fdf4', color: '#16a34a' },
  };
  const status = statusMap[election.status] || statusMap.upcoming;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
      style={{ borderRadius: 22, padding: 'clamp(16px, 2.2vw, 24px)', background: 'white', border: '1px solid #e5e7eb' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.4vw, 16px)' }}>
          <span style={{ fontSize: 'clamp(2rem, 3vw, 2.6rem)' }}>{typeInfo.icon || '🗳️'}</span>
          <div>
            <div style={{ fontWeight: 800, color: '#111827', fontSize: F.cardTitle, lineHeight: 1.3 }}>{election.title}</div>
            <div style={{ fontSize: F.small, color: '#9ca3af', marginTop: 4 }}>
              {election.jurisdiction.state}{election.jurisdiction.lga ? ` · ${election.jurisdiction.lga}` : ''}
            </div>
          </div>
        </div>
        <Chip label={status.label} sx={{ height: F.chipH, fontSize: F.small, background: status.bg, color: status.color, fontWeight: 800 }} />
      </div>

      {/* Mini stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 100px), 1fr))', gap: 'clamp(6px, 1vw, 10px)', marginBottom: 'clamp(12px, 1.6vw, 18px)' }}>
        {[
          { label: 'Registered', value: (election.totalRegisteredVoters / 1_000_000).toFixed(1) + 'M' },
          { label: 'Turnout',    value: `${election.turnoutPercentage}%` },
          { label: 'Candidates', value: election.candidatesCount },
          { label: 'Wards',      value: `${election.wardsCollated}/${election.wardsTotal}` },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center', background: '#f9fafb', borderRadius: 12, padding: 'clamp(8px, 1.2vw, 12px) 4px' }}>
            <div style={{ fontWeight: 800, color: '#111827', fontSize: F.statValue }}>{s.value}</div>
            <div style={{ fontSize: F.statLabel, color: '#9ca3af' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button component={Link} to={`/governance/elections/${election.id}/live`}
          size="medium" variant={election.status === 'ongoing' ? 'contained' : 'outlined'} endIcon={<ArrowForward />}
          sx={election.status === 'ongoing'
            ? { background: '#dc2626', color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: F.body }
            : { borderColor: '#1d4ed8', color: '#1d4ed8', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: F.body }
          }>
          {election.status === 'ongoing' ? 'Live Results' : 'View Results'}
        </Button>
        {election.status !== 'completed' && (
          <Button component={Link} to={isAuthenticated ? `/governance/elections/${election.id}/vote` : '/sign-in'} size="medium" variant="outlined" startIcon={<HowToVote />}
            sx={{ borderColor: '#d1d5db', color: '#374151', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: F.body }}>
            {isAuthenticated ? 'Vote Now' : 'Sign In to Vote'}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function ElectionListPublicPage() {
  const [search, setSearch]       = useState('');
  const [activeType, setActiveType] = useState('');
  const { data, isLoading, isError } = useElections({ type: activeType });

  const elections = useMemo(() => {
    const all = data?.data?.elections || [];
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter((e) => e.title.toLowerCase().includes(q));
  }, [data, search]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(20px, 4vw, 48px)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
        <h1 style={{ margin: '0 0 10px', fontWeight: 900, color: '#111827', fontSize: F.pageTitle }}>Elections</h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: F.subTitle }}>
          Browse live, upcoming, and past elections across Nigeria.
        </p>
      </motion.div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 'clamp(10px, 1.4vw, 16px)', marginBottom: 'clamp(20px, 2.8vw, 28px)' }}>
        {[
          { Icon: BarChart,      value: ELECTION_STATS.ongoingElections,                                   label: 'Live Now',    accent: '#dc2626' },
          { Icon: CalendarToday, value: ELECTION_STATS.upcomingElections,                                  label: 'Upcoming',    accent: '#1d4ed8' },
          { Icon: CheckCircle,   value: ELECTION_STATS.completedElections,                                 label: 'Completed',   accent: '#16a34a' },
          { Icon: People,        value: (ELECTION_STATS.totalVotersRegistered / 1_000_000).toFixed(1) + 'M', label: 'Voters Reg.', accent: '#7c3aed' },
        ].map(({ Icon, value, label, accent }) => (
          <div key={label} style={{ padding: 'clamp(12px, 1.6vw, 18px)', borderRadius: 16, background: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon sx={{ fontSize: 'clamp(26px, 3.2vw, 34px)', color: accent }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: F.statValue, color: accent, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: F.statLabel, color: '#6b7280', fontWeight: 600, marginTop: 3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(8px, 1.2vw, 14px)', marginBottom: 'clamp(16px, 2vw, 24px)' }}>
        <TextField size="small" placeholder="Search elections..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 'clamp(20px, 2.4vw, 26px)', color: '#9ca3af' }} /></InputAdornment>, style: { fontSize: F.input } }}
          sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: F.input } }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Chip label="All" onClick={() => setActiveType('')} clickable
            sx={{ height: F.chipH, fontSize: F.small, fontWeight: 700, background: !activeType ? '#1d4ed8' : '#f3f4f6', color: !activeType ? 'white' : '#374151' }} />
          {ELECTION_TYPES.map((t) => (
            <Chip key={t.id} label={t.label} onClick={() => setActiveType(t.id)} clickable
              icon={<span style={{ fontSize: F.small }}>{t.icon}</span>}
              sx={{ height: F.chipH, fontSize: F.small, fontWeight: 700, background: activeType === t.id ? t.color : t.bgColor, color: activeType === t.id ? 'white' : t.color }} />
          ))}
        </div>
      </div>

      {isLoading && <CivicLoadingSkeleton />}
      {isError   && <CivicEmptyState title="Could not load elections" description="Please try again." />}
      {!isLoading && !isError && !elections.length && (
        <CivicEmptyState icon={<HowToVote sx={{ fontSize: 64, color: '#d1d5db' }} />}
          title="No elections found" description="Try a different filter." />
      )}
      {!isLoading && !isError && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.6vw, 18px)' }}>
          {elections.map((e, i) => <ElectionCard key={e.id} election={e} index={i} />)}
        </div>
      )}
    </div>
  );
}
