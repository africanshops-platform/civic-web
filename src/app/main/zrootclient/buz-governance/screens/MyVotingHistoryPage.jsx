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
      title="My Voting History" subtitle="Community votes · Your participation"
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
            Your votes are secret.
          </p>
        </div>

        {isLoading && <CivicLoadingSkeleton />}
        {isError   && <CivicEmptyState title="Could not load voting history" description="Please try again." />}

        <CivicEmptyState
          icon={<HowToVote sx={{ fontSize: 64, color: '#d1d5db' }} />}
          title="Your voting history is private"
          description="To keep every ballot secret, the platform keeps only a one-way proof that you voted, never a list of the votes you cast. You will see a confirmation each time you vote."
        >
          <Button component={Link} to="/governance/elections" variant="contained"
            sx={{ mt: 2, background: '#1d4ed8', color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: F.body }}>
            Browse Community Votes
          </Button>
        </CivicEmptyState>
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
