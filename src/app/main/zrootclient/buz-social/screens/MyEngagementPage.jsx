import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Button, Chip, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Paid, AddCircleOutline } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useMyEngagement } from '../hooks/useSocialRepo';
import CommunityHeader from './shared-components/CommunityHeader';
import CommunityFeedSidebarLeft from './shared-components/CommunityFeedSidebarLeft';
import CommunityFeedSidebarRight from './shared-components/CommunityFeedSidebarRight';
import { CivicLoadingSkeleton, CivicEmptyState, CivicStatCard } from '../../civic-shared';

const F = {
  body:    'clamp(1.3rem,  2vw,   1.64rem)',
  meta:    'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:     'clamp(1.3rem,  2vw,   1.56rem)',
  sectionH:'clamp(2rem,    4vw,   3.4rem)',
  subH:    'clamp(1.4rem,  2.2vw, 1.8rem)',
};

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

function ActiveMyEngagementPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = useMyEngagement();
  const engagement = useMemo(() => data?.data, [data]);

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <CommunityHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="My Engagement" subtitle="Track your community activity" />
  ), [handleLeftToggle, handleRightToggle]);

  const content = useMemo(() => (
    <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#f0fdf4 100%)', minHeight: '100%' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ marginBottom: 'clamp(18px, 2.5vw, 28px)' }}>
          <Typography sx={{ fontWeight: 900, color: '#111827', fontSize: F.sectionH, mb: 1 }}>My Engagement</Typography>
          <Typography sx={{ color: '#4b5563', fontSize: F.body, lineHeight: 1.7 }}>What you have put into funded community projects.</Typography>
        </div>
        {isLoading && <CivicLoadingSkeleton />}
        {isError && <CivicEmptyState title="Could not load your engagement" description="Please try again." />}
        {!isLoading && !isError && engagement && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 'clamp(18px, 2.5vw, 28px)' }}>
              <CivicStatCard icon={Paid} value={engagement.contributionsMade} label="Contributions Made" />
            </div>
            <div style={{ borderRadius: 'clamp(14px, 2vw, 20px)', padding: 'clamp(18px, 2.8vw, 28px)', background: 'white', border: '1.5px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: 'clamp(16px, 2vw, 22px)' }}>
              <Typography sx={{ fontWeight: 800, color: '#111827', mb: 2, fontSize: F.subH }}>Recent Contributions</Typography>
              {engagement.recent.length === 0 ? (
                <Typography sx={{ textAlign: 'center', color: '#9ca3af', py: 3, fontSize: F.body }}>No contributions yet. Browse the funded projects and back one.</Typography>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {engagement.recent.map((c, i) => (
                    <motion.div key={c.id ?? i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.6vw, 16px)', padding: 'clamp(12px, 1.8vw, 16px) clamp(14px, 2vw, 20px)', borderRadius: 14, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: F.body }}>{c.campaignTitle || 'Community project'}</Typography>
                        <Typography sx={{ fontSize: F.meta, color: '#9ca3af', mt: 0.3 }}>
                          {new Date(c.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Typography>
                      </div>
                      <Chip label={`₦${Number(c.amountNaira || 0).toLocaleString('en-NG')}`} size="small" sx={{ background: '#f0fdf4', color: '#059669', fontWeight: 700, fontSize: F.meta }} />
                    </motion.div>
                  ))}
                </div>
              )}
              <Button component={Link} to="/civictax/my-contributions" sx={{ mt: 2, textTransform: 'none', fontWeight: 700, color: '#059669', fontSize: F.btn }}>All my contributions</Button>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Button component={Link} to="/community/create-issue" variant="contained" startIcon={<AddCircleOutline sx={{ fontSize: 'clamp(18px, 2.2vw, 22px)' }} />}
                sx={{ background: 'linear-gradient(135deg,#059669 0%,#0f766e 100%)', color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: F.btn, px: 'clamp(12px, 2vw, 20px)', py: 'clamp(8px, 1.2vw, 12px)' }}>
                Report an Issue
              </Button>
              <Button component={Link} to="/community/my-feed" variant="outlined"
                sx={{ borderColor: '#059669', color: '#059669', fontWeight: 700, borderRadius: '12px', textTransform: 'none', fontSize: F.btn, px: 'clamp(12px, 2vw, 20px)', py: 'clamp(8px, 1.2vw, 12px)' }}>
                Browse Feed
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  ), [engagement, isLoading, isError]);

  const leftSidebar = useMemo(() => <CommunityFeedSidebarLeft />, []);
  const rightSidebar = useMemo(() => <CommunityFeedSidebarRight />, []);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveMyEngagementPage = memo(ActiveMyEngagementPage);
export default function MyEngagementPage() { return <MemoizedActiveMyEngagementPage />; }
