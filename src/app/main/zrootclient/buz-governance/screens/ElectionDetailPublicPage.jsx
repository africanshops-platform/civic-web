import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Chip } from '@mui/material';
import { ArrowBack, HowToVote, LocationOn, FiberManualRecord } from '@mui/icons-material';
import { useElectionDetail, useElectionCollation } from '../hooks/useGovernanceRepo';
import LiveCollationBoard from '../components/LiveCollationBoard';
import CandidateCard from '../components/CandidateCard';
import JurisdictionResultsMap from '../components/JurisdictionResultsMap';
import { CivicLoadingSkeleton } from '../../civic-shared';

export default function ElectionDetailPublicPage() {
  const { electionId } = useParams();
  const { data: elecData, isLoading: elecLoading } = useElectionDetail(electionId);
  const { data: collData, isLoading: collLoading } = useElectionCollation(electionId);

  const election = useMemo(() => elecData?.data?.election, [elecData]);
  const candidates = useMemo(() => elecData?.data?.candidates || [], [elecData]);
  const collation = useMemo(() => collData?.data, [collData]);

  if (elecLoading) return <div style={{ padding: 32 }}><CivicLoadingSkeleton /></div>;
  if (!election) return <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>Election not found. <Link to="/governance/elections">Go back</Link></div>;

  const isLive = election.status === 'ongoing';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(20px, 4vw, 48px)' }}>
      <Button component={Link} to="/governance/elections" startIcon={<ArrowBack />}
        sx={{ color: '#6b7280', textTransform: 'none', fontWeight: 600, mb: 2, px: 0 }}>
        All Elections
      </Button>

      {/* Election header */}
      <div style={{ borderRadius: 24, padding: 'clamp(20px, 4vw, 32px)', background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)', border: '1px solid #c7d2fe', marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <h1 style={{ margin: 0, fontWeight: 900, color: '#1e1b4b', fontSize: 'clamp(1.3rem, 3vw, 2rem)', lineHeight: 1.2 }}>
            {election.title}
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            {isLive && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiberManualRecord sx={{ color: '#ef4444', fontSize: 14 }} /><span style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.88rem' }}>LIVE</span></div>}
            <Chip label={election.status.toUpperCase()} size="small"
              sx={{ background: isLive ? '#fef2f2' : '#f0fdf4', color: isLive ? '#dc2626' : '#16a34a', fontWeight: 800 }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: '0.88rem', marginBottom: 16 }}>
          <LocationOn sx={{ fontSize: 16 }} />
          {election.jurisdiction.state}{election.jurisdiction.lga ? ` · ${election.jurisdiction.lga}` : ''}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Registered Voters', value: (election.totalRegisteredVoters / 1_000_000).toFixed(1) + 'M' },
            { label: 'Votes Cast', value: election.totalVotesCast.toLocaleString() },
            { label: 'Turnout', value: `${election.turnoutPercentage}%` },
            { label: 'Wards Collated', value: `${election.wardsCollated}/${election.wardsTotal}` },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center', background: 'white', borderRadius: 12, padding: '10px 8px', border: '1px solid #c7d2fe' }}>
              <div style={{ fontWeight: 900, color: '#1e1b4b', fontSize: '1rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{s.label}</div>
            </div>
          ))}
        </div>
        {election.status !== 'completed' && (
          <Button component={Link} to="/sign-in" variant="contained" startIcon={<HowToVote />}
            sx={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)', color: 'white', fontWeight: 800, borderRadius: '14px', textTransform: 'none', px: 4, py: 1.5, '&:hover': { filter: 'brightness(0.92)', transform: 'translateY(-2px)' } }}>
            Sign In to Cast Your Vote
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: 24, marginBottom: 24 }}>
        {/* Live results board */}
        <div style={{ borderRadius: 20, padding: 'clamp(18px, 3vw, 28px)', background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 800, color: '#111827', fontSize: '1rem' }}>
            {isLive ? 'Live Results' : 'Final Results'}
          </h3>
          <LiveCollationBoard collation={collation} isLoading={collLoading} />
        </div>

        {/* Map */}
        <div style={{ borderRadius: 20, padding: 'clamp(18px, 3vw, 28px)', background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 800, color: '#111827', fontSize: '1rem' }}>LGA Breakdown Map</h3>
          <JurisdictionResultsMap lgaBreakdown={collation?.lgaBreakdown || []} isLoading={collLoading} />
        </div>
      </div>

      {/* Candidate profiles */}
      {candidates.length > 0 && (
        <div style={{ borderRadius: 20, padding: 'clamp(18px, 3vw, 28px)', background: 'white', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 800, color: '#111827', fontSize: '1rem' }}>Candidates</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 14 }}>
            {candidates.map((c, i) => <CandidateCard key={c.id} candidate={c} rank={i} />)}
          </div>
        </div>
      )}
    </motion.div>
  );
}
