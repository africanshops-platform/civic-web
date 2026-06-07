import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Button, LinearProgress, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { ArrowBack, CheckCircle, RadioButtonUnchecked, Construction } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useProjectDetail } from '../hooks/useSocialRepo';
import CommunityHeader from './shared-components/CommunityHeader';
import CommunityFeedSidebarLeft from './shared-components/CommunityFeedSidebarLeft';
import CommunityFeedSidebarRight from './shared-components/CommunityFeedSidebarRight';
import StatusBadge from '../components/StatusBadge';
import { CivicLoadingSkeleton } from '../../civic-shared';

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

function ActiveProjectDetailPage() {
  const { projectId } = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading, isError } = useProjectDetail(projectId);
  const project = useMemo(() => data?.data?.project, [data]);

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <CommunityHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title={project?.title || 'Project Detail'} subtitle="Milestones · Budget · Progress" />
  ), [handleLeftToggle, handleRightToggle, project?.title]);

  const content = useMemo(() => {
    if (isLoading) return <div className="flex-auto p-6 sm:p-8"><CivicLoadingSkeleton /></div>;
    if (isError || !project) return (
      <div className="flex-auto p-6 sm:p-8" style={{ textAlign: 'center', color: '#6b7280', paddingTop: 40, fontSize: F.body }}>
        Project not found. <Link to="/community/projects">Go back</Link>
      </div>
    );
    const budgetUsedPct = Math.round((project.spent / project.budget) * 100);
    const completedMilestones = project.milestones.filter((m) => m.completed).length;
    return (
      <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#f0fdf4 100%)', minHeight: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Button component={Link} to="/community/projects" startIcon={<ArrowBack sx={{ fontSize: 'clamp(16px, 2vw, 20px)' }} />}
            sx={{ color: '#6b7280', textTransform: 'none', fontWeight: 600, mb: 2.5, px: 0, fontSize: F.body }}>
            Back to Projects
          </Button>

          {/* Header card */}
          <div style={{ borderRadius: 'clamp(16px, 2.4vw, 24px)', padding: 'clamp(18px, 3.2vw, 32px)', background: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)', border: '2px solid #bbf7d0', marginBottom: 'clamp(16px, 2.4vw, 24px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Construction sx={{ color: '#059669', fontSize: 'clamp(24px, 3.5vw, 36px)' }} />
                <Typography sx={{ fontWeight: 900, color: '#14532d', fontSize: F.sectionH, lineHeight: 1.25 }}>{project.title}</Typography>
              </div>
              <StatusBadge status={project.status} size="medium" />
            </div>
            <Typography sx={{ fontSize: F.body, color: '#166534', mb: 2.5, fontWeight: 600 }}>
              {project.jurisdiction.lga}, {project.jurisdiction.state} · Contractor: {project.contractor}
            </Typography>
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Typography sx={{ fontWeight: 700, color: '#14532d', fontSize: F.subH }}>Overall Completion</Typography>
                <Typography sx={{ fontWeight: 900, color: '#059669', fontSize: F.sectionH }}>{project.completionPercentage}%</Typography>
              </div>
              <LinearProgress variant="determinate" value={project.completionPercentage}
                sx={{ height: 14, borderRadius: 7, backgroundColor: '#bbf7d044', '& .MuiLinearProgress-bar': { backgroundColor: '#059669', borderRadius: 7 } }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12 }}>
              {[{ label: 'Total Budget', value: `₦${(project.budget / 1_000_000).toFixed(1)}M` }, { label: 'Amount Spent', value: `₦${(project.spent / 1_000_000).toFixed(1)}M` }, { label: 'Budget Used', value: `${budgetUsedPct}%` }, { label: 'Watching', value: project.watchersCount.toLocaleString() }].map((s) => (
                <div key={s.label} style={{ textAlign: 'center', background: 'white', borderRadius: 14, padding: 'clamp(12px, 1.6vw, 18px) 10px', border: '1.5px solid #bbf7d0' }}>
                  <Typography sx={{ fontWeight: 900, color: '#14532d', fontSize: F.subH }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: F.meta, color: '#6b7280', mt: 0.3 }}>{s.label}</Typography>
                </div>
              ))}
            </div>
          </div>

          {/* Content grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,480px),1fr))', gap: 'clamp(14px, 2.2vw, 24px)' }}>
            <div style={{ borderRadius: 'clamp(14px, 2vw, 20px)', padding: 'clamp(18px, 2.8vw, 28px)', background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <Typography sx={{ fontWeight: 800, color: '#111827', mb: 1.5, fontSize: F.subH }}>About This Project</Typography>
              <Typography sx={{ color: '#374151', lineHeight: 1.9, fontSize: F.body, mb: project.relatedIssueId ? 2 : 0 }}>{project.description}</Typography>
              {project.relatedIssueId && (
                <div style={{ padding: 'clamp(10px, 1.4vw, 14px) 16px', background: '#eff6ff', borderRadius: 12, border: '1.5px solid #c7d2fe' }}>
                  <Typography sx={{ fontSize: F.meta, color: '#1d4ed8', fontWeight: 800, mb: 0.5 }}>Addressing Community Issue:</Typography>
                  <Link to={`/community/issues/${project.relatedIssueId}`} style={{ color: '#1d4ed8', fontWeight: 700, fontSize: F.body, textDecoration: 'none' }}>{project.issueTitle}</Link>
                </div>
              )}
            </div>
            <div style={{ borderRadius: 'clamp(14px, 2vw, 20px)', padding: 'clamp(18px, 2.8vw, 28px)', background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <Typography sx={{ fontWeight: 800, color: '#111827', mb: 2, fontSize: F.subH }}>Milestones ({completedMilestones}/{project.milestones.length})</Typography>
              {project.milestones.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    {m.completed ? <CheckCircle sx={{ color: '#059669', fontSize: 'clamp(20px, 2.8vw, 26px)' }} /> : <RadioButtonUnchecked sx={{ color: '#d1d5db', fontSize: 'clamp(20px, 2.8vw, 26px)' }} />}
                    {i < project.milestones.length - 1 && <div style={{ width: 2, height: 28, background: m.completed ? '#bbf7d0' : '#e5e7eb', margin: '3px 0' }} />}
                  </div>
                  <div style={{ paddingBottom: 20 }}>
                    <Typography sx={{ fontWeight: 700, color: m.completed ? '#111827' : '#9ca3af', fontSize: F.body }}>{m.title}</Typography>
                    {m.date && <Typography sx={{ fontSize: F.meta, color: '#9ca3af', mt: 0.3 }}>{m.completed ? 'Completed: ' : 'Expected: '}{new Date(m.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</Typography>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }, [project, isLoading, isError]);

  const leftSidebar = useMemo(() => <CommunityFeedSidebarLeft />, []);
  const rightSidebar = useMemo(() => <CommunityFeedSidebarRight />, []);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveProjectDetailPage = memo(ActiveProjectDetailPage);
export default function ProjectDetailPage() { return <MemoizedActiveProjectDetailPage />; }
