import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Button, Chip, LinearProgress } from '@mui/material';
import { Build, CheckCircle, PlayCircle, Schedule } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useLgaProjects } from '../hooks/useCivicTaxRepo';
import CivicTaxHeader from './shared-components/CivicTaxHeader';
import CampaignsBrowseSidebarLeft from './shared-components/CampaignsBrowseSidebarLeft';
import CampaignsBrowseSidebarRight from './shared-components/CampaignsBrowseSidebarRight';
import ProjectMilestoneTimeline from '../components/ProjectMilestoneTimeline';
import { CivicLoadingSkeleton, CivicEmptyState } from '../../civic-shared';

const F = {
  body:    'clamp(1.3rem,  2vw,   1.64rem)',
  meta:    'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:     'clamp(1.3rem,  2vw,   1.56rem)',
  sectionH:'clamp(2rem,    4vw,   3.4rem)',
  subH:    'clamp(1.4rem,  2.2vw, 1.8rem)',
};

const Root = styled(FusePageSimpleWithMargin)(() => ({
  '& .FusePageSimple-header': { backgroundColor: 'white', borderBottomWidth: 1, borderStyle: 'solid', borderColor: '#ffedd5' },
}));

const STATUS_CONFIG = {
  in_progress: { icon: PlayCircle,  color: '#ea580c', bg: '#fff7ed',  label: 'In Progress' },
  completed:   { icon: CheckCircle, color: '#16a34a', bg: '#dcfce7',  label: 'Completed'   },
  upcoming:    { icon: Schedule,    color: '#6b7280', bg: '#f9fafb',  label: 'Upcoming'    },
};

function ProjectCard({ project, index }) {
  const [expanded, setExpanded] = useState(false);
  const config     = STATUS_CONFIG[project.status] || STATUS_CONFIG.upcoming;
  const StatusIcon = config.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.4 }}
      style={{ background: 'white', borderRadius: 24, overflow: 'hidden', border: '1px solid #ffedd5', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ height: 4, width: '100%', background: 'linear-gradient(90deg, #f97316, #ea580c)' }} />
      <div style={{ padding: 'clamp(16px, 2.4vw, 22px)' }}>

        {/* Status + campaign */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'clamp(10px, 1.4vw, 14px)' }}>
          <Chip icon={<StatusIcon style={{ fontSize: 'clamp(14px, 1.8vw, 18px)', color: config.color }} />}
            label={config.label} size="small"
            style={{ fontSize: F.meta }}
            sx={{ backgroundColor: config.bg, color: config.color, fontWeight: 700, border: `1px solid ${config.color}33`, '& .MuiChip-label': { fontSize: F.meta } }} />
          <div style={{ fontSize: F.meta, color: '#9ca3af', textAlign: 'right', maxWidth: '50%', lineHeight: 1.3 }}>{project.campaignTitle}</div>
        </div>

        {/* Title */}
        <div style={{ fontWeight: 800, fontSize: F.subH, color: '#1f2937', marginBottom: 4, lineHeight: 1.35 }}>{project.title}</div>

        {/* Location */}
        <div style={{ fontSize: F.meta, color: '#6b7280', marginBottom: 'clamp(14px, 2vw, 20px)' }}>📍 {project.lga}, {project.state}</div>

        {/* Progress */}
        <div style={{ marginBottom: 'clamp(14px, 2vw, 18px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: F.meta, color: '#6b7280', fontWeight: 600 }}>Project Progress</span>
            <span style={{ fontSize: F.meta, fontWeight: 800, color: project.completionPercentage === 100 ? '#16a34a' : '#ea580c' }}>{project.completionPercentage}%</span>
          </div>
          <LinearProgress variant="determinate" value={project.completionPercentage}
            sx={{ height: 8, borderRadius: 4, backgroundColor: '#ffedd5', '& .MuiLinearProgress-bar': { borderRadius: 4, background: project.completionPercentage === 100 ? 'linear-gradient(90deg, #16a34a, #15803d)' : 'linear-gradient(90deg, #f97316, #ea580c)' } }} />
        </div>

        {/* Budget grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 'clamp(12px, 1.6vw, 18px)' }}>
          {[
            { label: 'Budget',    value: `₦${(project.budget / 1000000).toFixed(1)}M` },
            { label: 'Spent',     value: `₦${(project.spent / 1000000).toFixed(1)}M` },
            { label: 'Remaining', value: `₦${((project.budget - project.spent) / 1000000).toFixed(1)}M` },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center', padding: 'clamp(8px, 1.2vw, 12px)', borderRadius: 12, background: '#fff7ed' }}>
              <div style={{ fontSize: F.meta, color: '#9ca3af', fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: F.body, fontWeight: 800, color: '#ea580c' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Contractor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'clamp(12px, 1.6vw, 18px)', padding: 'clamp(10px, 1.4vw, 14px)', borderRadius: 12, background: '#fff7ed' }}>
          <Build style={{ color: '#ea580c', fontSize: 'clamp(16px, 2vw, 20px)' }} />
          <span style={{ fontSize: F.body, color: '#374151', fontWeight: 600 }}>
            {project.contractor}
            {project.contractorVerified && <span style={{ color: '#2563eb', marginLeft: 4 }}>✓ Verified</span>}
          </span>
        </div>

        {/* Latest update */}
        {project.updates?.[0] && (
          <div style={{ padding: 'clamp(10px, 1.4vw, 14px)', borderRadius: 12, background: '#eff6ff', border: '1px solid #c7d2fe', marginBottom: 'clamp(12px, 1.6vw, 18px)' }}>
            <div style={{ fontSize: F.meta, color: '#2563eb', fontWeight: 700, marginBottom: 4 }}>LATEST UPDATE</div>
            <div style={{ fontSize: F.body, color: '#374151', lineHeight: 1.5 }}>{project.updates[0].text}</div>
            <div style={{ fontSize: F.meta, color: '#9ca3af', marginTop: 4 }}>
              {new Date(project.updates[0].date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} · {project.updates[0].by}
            </div>
          </div>
        )}

        {/* Milestones */}
        {project.milestones?.length > 0 && (
          <>
            <Button fullWidth variant="text" onClick={() => setExpanded((v) => !v)}
              style={{ fontSize: F.btn }}
              sx={{ color: '#ea580c', fontWeight: 700, textTransform: 'none', borderRadius: '10px', '&:hover': { backgroundColor: '#fff7ed' } }}>
              {expanded ? 'Hide' : 'Show'} Milestones ({project.milestones.length})
            </Button>
            {expanded && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #ffedd5' }}>
                <ProjectMilestoneTimeline milestones={project.milestones} projectTitle={project.title} />
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

function ActiveLgaProjectTrackerPage() {
  const navigate  = useNavigate();
  const isMobile  = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen,  setLeftSidebarOpen]  = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { data, isLoading } = useLgaProjects();
  const projects = useMemo(() => data?.data?.projects || [], [data]);

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v)  => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false),  []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <CivicTaxHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="LGA Project Tracker" subtitle="Every project. Full transparency. Real-time milestones." showContributeBtn />
  ), [handleLeftToggle, handleRightToggle]);

  const content = useMemo(() => {
    if (isLoading) return <div className="flex-auto p-6 sm:p-8"><CivicLoadingSkeleton message="Loading project tracker..." cardCount={3} variant="list" /></div>;

    return (
      <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg, #fafaf9 0%, #fff7ed 100%)', minHeight: '100%' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'clamp(16px, 2.4vw, 24px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={{ width: 'clamp(32px, 4.5vw, 42px)', height: 'clamp(32px, 4.5vw, 42px)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', flexShrink: 0 }}>
              <Build style={{ color: 'white', fontSize: 'clamp(16px, 2vw, 20px)' }} />
            </div>
            <div style={{ fontWeight: 900, fontSize: F.sectionH, color: '#1f2937' }}>LGA Project Tracker</div>
          </div>
          <div style={{ color: '#6b7280', fontSize: F.body, marginLeft: 'clamp(44px, 6.5vw, 54px)' }}>Every project. Full transparency. Real-time milestones.</div>
        </motion.div>

        {/* Status chips */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'clamp(16px, 2.4vw, 24px)' }}>
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const count = projects.filter((p) => p.status === status).length;
            return (
              <Chip key={status} label={`${config.label}: ${count}`} size="small"
                style={{ fontSize: F.meta }}
                sx={{ backgroundColor: config.bg, color: config.color, fontWeight: 700, border: `1px solid ${config.color}44`, '& .MuiChip-label': { fontSize: F.meta } }} />
            );
          })}
        </motion.div>

        {projects.length === 0 ? (
          <CivicEmptyState type="projects" title="No projects yet"
            description="Projects will appear here as campaigns reach their funding targets."
            ctaLabel="Browse Campaigns" onCta={() => navigate('/civictax/campaigns')} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 22px)' }}>
            {projects.map((project, i) => <ProjectCard key={project.id} project={project} index={i} />)}
          </div>
        )}
      </div>
    );
  }, [projects, isLoading, navigate]);

  const leftSidebar  = useMemo(() => <CampaignsBrowseSidebarLeft />, []);
  const rightSidebar = useMemo(() => <CampaignsBrowseSidebarRight />, []);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen}   leftSidebarOnClose={handleLeftClose}   leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActiveLgaProjectTrackerPage = memo(ActiveLgaProjectTrackerPage);
export default function LgaProjectTrackerPage() { return <MemoizedActiveLgaProjectTrackerPage />; }
