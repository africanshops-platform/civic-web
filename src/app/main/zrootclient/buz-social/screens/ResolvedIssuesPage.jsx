import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowForward, TrendingDown } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useResolvedIssues } from '../hooks/useSocialRepo';
import CommunityHeader from './shared-components/CommunityHeader';
import CommunityFeedSidebarLeft from './shared-components/CommunityFeedSidebarLeft';
import CommunityFeedSidebarRight from './shared-components/CommunityFeedSidebarRight';
import IssueCard from '../components/IssueCard';
import { CivicLoadingSkeleton, CivicEmptyState, CivicStatCard } from '../../civic-shared';

const F = {
  body:    'clamp(1.3rem,  2vw,   1.64rem)',
  btn:     'clamp(1.3rem,  2vw,   1.56rem)',
  sectionH:'clamp(2rem,    4vw,   3.4rem)',
};

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

function ActiveResolvedIssuesPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = useResolvedIssues();
  const issues = useMemo(() => data?.data?.issues || [], [data]);
  const stats = useMemo(() => data?.data?.stats, [data]);

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <CommunityHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Resolved Issues" subtitle="Issues successfully closed by authorities" />
  ), [handleLeftToggle, handleRightToggle]);

  const content = useMemo(() => (
    <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#f0fdf4 100%)', minHeight: '100%' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ marginBottom: 'clamp(18px, 2.5vw, 28px)' }}>
          <Typography sx={{ fontWeight: 900, color: '#111827', fontSize: F.sectionH, mb: 1 }}>Resolved Issues</Typography>
          <Typography sx={{ color: '#4b5563', fontSize: F.body, lineHeight: 1.7 }}>Community issues that have been successfully resolved. Proof that reporting works.</Typography>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 'clamp(18px, 2.5vw, 28px)' }}>
          <CivicStatCard icon={CheckCircle} value={stats?.resolvedIssues || issues.length} label="Resolved" />
          <CivicStatCard icon={TrendingDown} value={`${stats?.resolutionRate || 15}%`} label="Resolution Rate" />
          <CivicStatCard icon={CheckCircle} value={`${stats?.avgResolutionDays || 24} days`} label="Avg. Resolution" />
        </div>
        {isLoading && <CivicLoadingSkeleton />}
        {isError && <CivicEmptyState title="Could not load resolved issues" description="Please try again." />}
        {!isLoading && !isError && !issues.length && <CivicEmptyState title="No resolved issues yet" description="Resolved issues will appear here once authorities have acted on community reports." />}
        {!isLoading && !isError && !!issues.length && (
          <div className="w-full flex flex-col gap-4">
            {issues.map((issue, i) => <IssueCard key={issue.id} issue={issue} index={i} />)}
          </div>
        )}
        <div style={{ marginTop: 'clamp(20px, 3vw, 36px)', textAlign: 'center' }}>
          <Button component={Link} to="/community/my-feed" variant="outlined" endIcon={<ArrowForward sx={{ fontSize: 'clamp(16px, 2vw, 20px)' }} />}
            sx={{ borderColor: '#059669', color: '#059669', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: F.btn, px: 'clamp(12px, 2vw, 20px)', py: 'clamp(8px, 1.2vw, 12px)' }}>
            Back to Active Issues
          </Button>
        </div>
      </motion.div>
    </div>
  ), [issues, isLoading, isError, stats]);

  const leftSidebar = useMemo(() => <CommunityFeedSidebarLeft />, []);
  const rightSidebar = useMemo(() => <CommunityFeedSidebarRight />, []);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveResolvedIssuesPage = memo(ActiveResolvedIssuesPage);
export default function ResolvedIssuesPage() { return <MemoizedActiveResolvedIssuesPage />; }
