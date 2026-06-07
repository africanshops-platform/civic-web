import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Avatar, Button, Chip, Rating, Typography } from '@mui/material';
import { Email, Phone } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useLeaders } from '../hooks/useSocialRepo';
import CommunityHeader from './shared-components/CommunityHeader';
import CommunityFeedSidebarLeft from './shared-components/CommunityFeedSidebarLeft';
import CommunityFeedSidebarRight from './shared-components/CommunityFeedSidebarRight';
import { CivicLoadingSkeleton, CivicEmptyState } from '../../civic-shared';

const F = {
  title:   'clamp(1.44rem, 2.4vw, 1.96rem)',
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

function LeaderCard({ leader, index }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{ borderRadius: 'clamp(14px, 2vw, 20px)', padding: 'clamp(18px, 2.8vw, 28px)', background: 'white', border: '1.5px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(12px, 1.8vw, 18px)', marginBottom: 'clamp(12px, 1.8vw, 18px)' }}>
        <Avatar sx={{ width: 'clamp(48px, 6vw, 60px)', height: 'clamp(48px, 6vw, 60px)', bgcolor: '#059669', fontSize: F.title, fontWeight: 900, flexShrink: 0 }}>
          {leader.name.charAt(0)}
        </Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, color: '#111827', fontSize: F.title, mb: 0.3 }}>{leader.name}</Typography>
          <Typography sx={{ fontSize: F.body, color: '#4b5563', mb: 0.8 }}>{leader.title} · {leader.jurisdiction.lga}, {leader.jurisdiction.state}</Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {leader.party && <Chip label={leader.party} size="small" sx={{ background: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: F.meta, height: 'clamp(20px, 2.6vw, 26px)' }} />}
            <Rating value={leader.rating} readOnly precision={0.1} size="small" />
            <Typography sx={{ fontSize: F.meta, color: '#6b7280' }}>({leader.rating}/5)</Typography>
          </div>
        </div>
      </div>
      <Typography sx={{ color: '#4b5563', fontSize: F.body, lineHeight: 1.75, mb: 2 }}>{leader.bio}</Typography>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 'clamp(12px, 1.8vw, 18px)' }}>
        {[{ label: 'Assigned', value: leader.issuesAssigned }, { label: 'Resolved', value: leader.issuesResolved }, { label: 'Rate', value: `${leader.resolutionRate}%` }].map((s) => (
          <div key={s.label} style={{ textAlign: 'center', background: '#f9fafb', borderRadius: 12, padding: 'clamp(10px, 1.4vw, 14px) 8px', border: '1px solid #e5e7eb' }}>
            <Typography sx={{ fontWeight: 900, color: '#111827', fontSize: F.subH }}>{s.value}</Typography>
            <Typography sx={{ fontSize: F.meta, color: '#6b7280', mt: 0.3 }}>{s.label}</Typography>
          </div>
        ))}
      </div>
      <div style={{ padding: 'clamp(8px, 1.2vw, 12px) 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', marginBottom: 'clamp(12px, 1.6vw, 16px)' }}>
        <Typography sx={{ fontSize: F.body, color: '#166534', fontWeight: 600 }}>Avg. response: <strong>{leader.avgResponseDays} days</strong></Typography>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {leader.contactEmail && <Button size="small" startIcon={<Email sx={{ fontSize: 'clamp(14px, 1.8vw, 18px)' }} />} href={`mailto:${leader.contactEmail}`} sx={{ color: '#1d4ed8', fontWeight: 700, borderRadius: '10px', textTransform: 'none', fontSize: F.btn, border: '1.5px solid #c7d2fe', background: '#eff6ff', px: 1.8 }}>Email</Button>}
        {leader.contactPhone && <Button size="small" startIcon={<Phone sx={{ fontSize: 'clamp(14px, 1.8vw, 18px)' }} />} href={`tel:${leader.contactPhone}`} sx={{ color: '#059669', fontWeight: 700, borderRadius: '10px', textTransform: 'none', fontSize: F.btn, border: '1.5px solid #bbf7d0', background: '#f0fdf4', px: 1.8 }}>Call</Button>}
      </div>
    </motion.div>
  );
}

function ActiveLocalLeadersPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = useLeaders();
  const leaders = useMemo(() => data?.data?.leaders || [], [data]);

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <CommunityHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Local Leaders" subtitle="Elected officials and government officers in your area" />
  ), [handleLeftToggle, handleRightToggle]);

  const content = useMemo(() => (
    <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#f0fdf4 100%)', minHeight: '100%' }}>
      <div style={{ marginBottom: 'clamp(18px, 2.5vw, 28px)' }}>
        <Typography sx={{ fontWeight: 900, color: '#111827', fontSize: F.sectionH, mb: 1 }}>Local Leaders</Typography>
        <Typography sx={{ color: '#4b5563', fontSize: F.body, lineHeight: 1.7 }}>Know your elected officials. See their issue resolution records and contact them directly.</Typography>
      </div>
      {isLoading && <CivicLoadingSkeleton />}
      {isError && <CivicEmptyState title="Could not load leaders" description="Please try again." />}
      {!isLoading && !isError && !leaders.length && <CivicEmptyState title="No leaders found" description="No leaders available for this area." />}
      {!isLoading && !isError && !!leaders.length && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,440px),1fr))', gap: 'clamp(14px, 2vw, 22px)' }}>
          {leaders.map((l, i) => <LeaderCard key={l.id} leader={l} index={i} />)}
        </div>
      )}
    </div>
  ), [leaders, isLoading, isError]);

  const leftSidebar = useMemo(() => <CommunityFeedSidebarLeft />, []);
  const rightSidebar = useMemo(() => <CommunityFeedSidebarRight />, []);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveLocalLeadersPage = memo(ActiveLocalLeadersPage);
export default function LocalLeadersPage() { return <MemoizedActiveLocalLeadersPage />; }
