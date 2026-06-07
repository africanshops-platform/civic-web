import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Button, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { HowToVote, CheckCircle, ArrowForward, BarChart } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import GovernanceHeader from './shared-components/GovernanceHeader';
import GovernanceSidebarLeft from './shared-components/GovernanceSidebarLeft';
import GovernanceSidebarRight from './shared-components/GovernanceSidebarRight';
import { useMyVotingHistory } from '../hooks/useGovernanceRepo';
import { CivicLoadingSkeleton, CivicEmptyState } from '../../civic-shared';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1, borderStyle: 'solid', borderColor: theme.palette.divider,
  },
  '& .FusePageSimple-sidebarLeft':  { width: 300, minWidth: 300, [theme.breakpoints.down('lg')]: { width: '85vw', minWidth: 260 } },
  '& .FusePageSimple-sidebarRight': { width: 300, minWidth: 300, [theme.breakpoints.down('lg')]: { width: '85vw', minWidth: 260 } },
  '& .FusePageSimple-content':      { display: 'flex', flexDirection: 'column', flex: '1 1 0%', overflowX: 'hidden' },
}));

const F = {
  pageTitle: 'clamp(2.8rem, 4.5vw, 4rem)',
  subTitle:  'clamp(1.5rem, 2.2vw, 1.9rem)',
  cardTitle: 'clamp(1.44rem, 2.2vw, 1.96rem)',
  body:      'clamp(1.3rem, 1.8vw, 1.64rem)',
  small:     'clamp(1.2rem, 1.6vw, 1.44rem)',
  chipH:     36,
};

function ActiveMyVotingHistoryPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen]   = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = useMyVotingHistory();
  const history = useMemo(() => data?.data, [data]);

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <GovernanceHeader
      leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="My Voting History" subtitle="Digital Governance · Your Participation Record"
    />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar  = useMemo(() => <GovernanceSidebarLeft />, []);
  const rightSidebar = useMemo(() => <GovernanceSidebarRight />, []);

  const content = useMemo(() => (
    <div className="flex-auto" style={{ minHeight: '100%', background: 'linear-gradient(180deg, #f9fafb 0%, #eff6ff 100%)', overflowX: 'hidden' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ padding: 'clamp(20px, 3vw, 40px)' }}>

        <div style={{ marginBottom: 'clamp(20px, 2.8vw, 32px)' }}>
          <h1 style={{ margin: '0 0 8px', fontWeight: 900, color: '#111827', fontSize: F.pageTitle }}>
            My Voting History
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: F.subTitle }}>
            A secure record of every election you have participated in.
          </p>
        </div>

        {isLoading && <CivicLoadingSkeleton />}
        {isError   && <CivicEmptyState title="Could not load voting history" description="Please try again." />}

        {!isLoading && !isError && history && (
          <>
            {/* Stat strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 'clamp(10px, 1.4vw, 16px)', marginBottom: 'clamp(20px, 2.8vw, 32px)' }}>
              {[
                { Icon: CheckCircle, value: history.totalVoted,        label: 'Elections Voted',  accent: '#16a34a' },
                { Icon: HowToVote,   value: history.electionsEligible, label: 'Eligible For',     accent: '#1d4ed8' },
                { Icon: BarChart,    value: `${Math.round((history.totalVoted / history.electionsEligible) * 100)}%`, label: 'Participation Rate', accent: '#7c3aed' },
              ].map(({ Icon, value, label, accent }) => (
                <div key={label} style={{ padding: 'clamp(14px, 1.8vw, 20px)', borderRadius: 16, background: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon sx={{ fontSize: 'clamp(28px, 3.5vw, 36px)', color: accent }} />
                  <div>
                    <div style={{ fontWeight: 900, fontSize: F.cardTitle, color: accent, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: F.body, color: '#6b7280', fontWeight: 600, marginTop: 4 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {history.votes.length === 0 ? (
              <CivicEmptyState
                icon={<HowToVote sx={{ fontSize: 64, color: '#d1d5db' }} />}
                title="No votes recorded yet"
                description="You have not cast a vote in any election yet."
              >
                <Button component={Link} to="/governance/dashboard" variant="contained"
                  sx={{ mt: 2, background: '#1d4ed8', color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: F.body }}>
                  Browse Elections
                </Button>
              </CivicEmptyState>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.6vw, 18px)' }}>
                {history.votes.map((v, i) => (
                  <motion.div
                    key={v.electionId}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      borderRadius: 20, padding: 'clamp(16px, 2.2vw, 24px)',
                      background: 'white', border: '1px solid #e5e7eb',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.4vw, 16px)' }}>
                      <div style={{ width: 'clamp(44px, 5.5vw, 56px)', height: 'clamp(44px, 5.5vw, 56px)', borderRadius: 14, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle sx={{ color: '#16a34a', fontSize: 'clamp(24px, 3vw, 30px)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#111827', fontSize: F.cardTitle, marginBottom: 4 }}>
                          {v.electionTitle}
                        </div>
                        <div style={{ fontSize: F.body, color: '#9ca3af' }}>
                          Voted: {new Date(v.votedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: F.body, color: '#6b7280', fontFamily: 'monospace' }}>
                          Receipt: {v.receiptCode}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Chip label="VOTED" sx={{ height: F.chipH, fontSize: F.body, background: '#f0fdf4', color: '#16a34a', fontWeight: 800 }} />
                      <Button
                        component={Link} to={`/governance/elections/${v.electionId}/live`}
                        size="medium" endIcon={<ArrowForward />}
                        sx={{ color: '#1d4ed8', fontWeight: 700, textTransform: 'none', fontSize: F.body }}
                      >
                        Results
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  ), [history, isLoading, isError]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen}  leftSidebarOnClose={handleLeftClose}  leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActivePage = memo(ActiveMyVotingHistoryPage);
export default function MyVotingHistoryPage() { return <MemoizedActivePage />; }
