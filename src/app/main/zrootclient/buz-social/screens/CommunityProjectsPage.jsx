import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Chip, TextField, InputAdornment, Typography } from '@mui/material';
import { Search, Construction, CheckCircle, TrendingUp } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useCommunityProjects } from '../hooks/useSocialRepo';
import CommunityHeader from './shared-components/CommunityHeader';
import CommunityFeedSidebarLeft from './shared-components/CommunityFeedSidebarLeft';
import CommunityFeedSidebarRight from './shared-components/CommunityFeedSidebarRight';
import CommunityProjectCard from '../components/CommunityProjectCard';
import { CivicLoadingSkeleton, CivicEmptyState, CivicStatCard } from '../../civic-shared';
import { PROJECT_STATS } from '../mock';

const F = {
  body:    'clamp(1.3rem,  2vw,   1.64rem)',
  meta:    'clamp(1.2rem,  1.8vw, 1.5rem)',
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

function ActiveCommunityProjectsPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('');

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = useCommunityProjects({ status: activeStatus });
  const projects = useMemo(() => {
    const all = data?.data?.projects || [];
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }, [data, search]);

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <CommunityHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Community Projects" subtitle="Government and community-funded projects tracked in real time" />
  ), [handleLeftToggle, handleRightToggle]);

  const content = useMemo(() => (
    <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#f0fdf4 100%)', minHeight: '100%' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ marginBottom: 'clamp(18px, 2.5vw, 28px)' }}>
          <Typography sx={{ fontWeight: 900, color: '#111827', fontSize: F.sectionH, mb: 1 }}>Community Projects</Typography>
          <Typography sx={{ color: '#4b5563', fontSize: F.body, lineHeight: 1.7 }}>Ongoing and completed projects across your area — tracked in real time.</Typography>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 'clamp(16px, 2vw, 24px)' }}>
          <CivicStatCard icon={Construction} value={PROJECT_STATS.inProgressProjects} label="In Progress" />
          <CivicStatCard icon={CheckCircle} value={PROJECT_STATS.completedProjects} label="Completed" />
          <CivicStatCard icon={TrendingUp} value={`₦${(PROJECT_STATS.totalBudget / 1_000_000_000).toFixed(1)}B`} label="Total Budget" />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 'clamp(14px, 2vw, 22px)' }}>
          <TextField size="small" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#9ca3af' }} /></InputAdornment> }}
            sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: F.body } }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[{ value: '', label: 'All Projects' }, { value: 'in_progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }].map((s) => (
              <Chip key={s.value} label={s.label} onClick={() => setActiveStatus(s.value)} clickable
                sx={{ fontWeight: 700, fontSize: F.meta, background: activeStatus === s.value ? '#059669' : '#f3f4f6', color: activeStatus === s.value ? 'white' : '#374151' }} />
            ))}
          </div>
        </div>
        {isLoading && <CivicLoadingSkeleton />}
        {isError && <CivicEmptyState title="Could not load projects" description="Please try again." />}
        {!isLoading && !isError && !projects.length && <CivicEmptyState title="No projects found" description="No projects match your filters." />}
        {!isLoading && !isError && !!projects.length && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.8vw, 20px)' }}>
            {projects.map((p, i) => <CommunityProjectCard key={p.id} project={p} index={i} />)}
          </div>
        )}
      </motion.div>
    </div>
  ), [projects, isLoading, isError, search, activeStatus]);

  const leftSidebar = useMemo(() => <CommunityFeedSidebarLeft />, []);
  const rightSidebar = useMemo(() => <CommunityFeedSidebarRight />, []);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveCommunityProjectsPage = memo(ActiveCommunityProjectsPage);
export default function CommunityProjectsPage() { return <MemoizedActiveCommunityProjectsPage />; }
