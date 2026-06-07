import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chip, Button } from '@mui/material';
import { ArrowBack, LocationOn, HowToVote } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import GovernanceHeader from './shared-components/GovernanceHeader';
import GovernanceSidebarLeft from './shared-components/GovernanceSidebarLeft';
import GovernanceSidebarRight from './shared-components/GovernanceSidebarRight';
import { useElectionDetail, useCastVote } from '../hooks/useGovernanceRepo';
import VotingBallot from '../components/VotingBallot';
import { CivicLoadingSkeleton } from '../../civic-shared';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1, borderStyle: 'solid', borderColor: theme.palette.divider,
  },
  '& .FusePageSimple-sidebarLeft':  { width: 300, minWidth: 300, [theme.breakpoints.down('lg')]: { width: '85vw', minWidth: 260 } },
  '& .FusePageSimple-sidebarRight': { width: 300, minWidth: 300, [theme.breakpoints.down('lg')]: { width: '85vw', minWidth: 260 } },
  '& .FusePageSimple-content':      { display: 'flex', flexDirection: 'column', flex: '1 1 0%', overflowX: 'hidden' },
}));

/* ── Civic font tokens ── */
const F = {
  pageTitle:  'clamp(2.8rem, 4.5vw, 4rem)',
  subTitle:   'clamp(1.5rem, 2.2vw, 1.9rem)',
  cardTitle:  'clamp(1.44rem, 2.2vw, 1.96rem)',
  body:       'clamp(1.3rem,  1.8vw, 1.64rem)',
  small:      'clamp(1.2rem,  1.6vw, 1.44rem)',
  statValue:  'clamp(1.6rem,  2.6vw, 2.2rem)',
  statLabel:  'clamp(1.1rem,  1.5vw, 1.36rem)',
  chipH:      36,
  icon:       'clamp(22px, 2.8vw, 30px)',
};

function ActiveVotingPortalPage() {
  const { electionId } = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen]   = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = useElectionDetail(electionId);
  const { mutate: castVote, isLoading: isSubmitting } = useCastVote();

  const election   = useMemo(() => data?.data?.election,        [data]);
  const candidates = useMemo(() => data?.data?.candidates || [], [data]);

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <GovernanceHeader
      leftSidebarToggle={handleLeftToggle}
      rightSidebarToggle={handleRightToggle}
      title="Voting Portal"
      subtitle="Digital Governance · Cast Your Vote"
      activeElection={election?.status === 'ongoing'}
    />
  ), [handleLeftToggle, handleRightToggle, election?.status]);

  const leftSidebar  = useMemo(() => <GovernanceSidebarLeft />, []);
  const rightSidebar = useMemo(() => <GovernanceSidebarRight />, []);

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex-auto" style={{ minHeight: '100%', background: 'linear-gradient(180deg,#f9fafb 0%,#eff6ff 100%)', padding: 'clamp(20px,3vw,40px)' }}>
          <CivicLoadingSkeleton />
        </div>
      );
    }

    if (isError || !election) {
      return (
        <div className="flex-auto" style={{ minHeight: '100%', background: 'linear-gradient(180deg,#f9fafb 0%,#eff6ff 100%)', padding: 'clamp(20px,3vw,40px)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
          <p style={{ fontSize: F.subTitle, color: '#6b7280' }}>
            Could not load election. <Link to="/governance/dashboard" style={{ color: '#1d4ed8', fontWeight: 700 }}>Return to dashboard</Link>
          </p>
        </div>
      );
    }

    const statusColors = { ongoing: '#dc2626', upcoming: '#1d4ed8', completed: '#16a34a' };
    const accent = statusColors[election.status] || '#1d4ed8';

    return (
      <div className="flex-auto" style={{ minHeight: '100%', background: 'linear-gradient(180deg,#f9fafb 0%,#eff6ff 100%)', overflowX: 'hidden' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: 'clamp(20px, 3vw, 40px)', maxWidth: 900, margin: '0 auto' }}>

          {/* ── Back ── */}
          <Button component={Link} to="/governance/dashboard" startIcon={<ArrowBack sx={{ fontSize: F.icon }} />}
            sx={{ color: '#6b7280', textTransform: 'none', fontWeight: 600, mb: 2.5, px: 0, fontSize: F.body }}>
            Back to Governance
          </Button>

          {/* ── Election info card ── */}
          <div style={{
            borderRadius: 24,
            padding: 'clamp(20px, 3vw, 32px)',
            background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
            border: '1px solid #c7d2fe',
            marginBottom: 'clamp(20px, 2.8vw, 32px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <HowToVote sx={{ fontSize: 'clamp(32px, 4vw, 44px)', color: accent }} />
                <h1 style={{ margin: 0, fontWeight: 900, color: '#1e1b4b', fontSize: F.pageTitle, lineHeight: 1.2 }}>
                  {election.title}
                </h1>
              </div>
              <Chip
                label={election.status.toUpperCase()}
                sx={{ height: F.chipH, fontSize: F.body, background: accent + '20', color: accent, fontWeight: 800, border: `1px solid ${accent}44` }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: F.body, marginBottom: 18 }}>
              <LocationOn sx={{ fontSize: F.icon }} />
              {election.jurisdiction.state}{election.jurisdiction.lga ? ` · ${election.jurisdiction.lga}` : ''}
            </div>

            {/* ── Stats grid — full width ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: 'clamp(8px, 1.2vw, 14px)' }}>
              {[
                { label: 'Registered Voters', value: (election.totalRegisteredVoters / 1_000_000).toFixed(1) + 'M' },
                { label: 'Votes Cast',        value: election.totalVotesCast.toLocaleString()                      },
                { label: 'Turnout',           value: `${election.turnoutPercentage}%`                             },
                { label: 'Candidates',        value: election.candidatesCount                                      },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center', background: 'white', borderRadius: 14, padding: 'clamp(12px, 1.6vw, 18px) 4px', border: '1px solid #c7d2fe' }}>
                  <div style={{ fontWeight: 900, color: '#1e1b4b', fontSize: F.statValue }}>{s.value}</div>
                  <div style={{ fontSize: F.statLabel, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Voting ballot ── */}
          <div style={{ borderRadius: 22, padding: 'clamp(18px, 2.5vw, 32px)', background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 800, color: '#111827', fontSize: F.cardTitle, marginBottom: 'clamp(14px, 1.8vw, 20px)' }}>
              Cast Your Vote
            </div>
            <VotingBallot
              election={election}
              candidates={candidates}
              onSubmit={castVote}
              isSubmitting={isSubmitting}
            />
          </div>
        </motion.div>
      </div>
    );
  }, [election, candidates, isLoading, isError, isSubmitting, castVote, electionId]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen}  leftSidebarOnClose={handleLeftClose}  leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActivePage = memo(ActiveVotingPortalPage);
export default function VotingPortalPage() { return <MemoizedActivePage />; }
