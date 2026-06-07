import { memo } from 'react';
import { motion } from 'framer-motion';
import { LinearProgress, Button, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { ArrowForward, Construction, CheckCircle } from '@mui/icons-material';
import StatusBadge from './StatusBadge';

const F = {
  title: 'clamp(1.44rem, 2.4vw, 1.96rem)',
  body:  'clamp(1.3rem,  2vw,   1.64rem)',
  meta:  'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:   'clamp(1.3rem,  2vw,   1.56rem)',
  subH:  'clamp(1.4rem,  2.2vw, 1.8rem)',
};

function CommunityProjectCard({ project, index = 0 }) {
  if (!project) return null;

  const budgetUsedPct = Math.round((project.spent / project.budget) * 100);
  const milestonesCompleted = project.milestones.filter((m) => m.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      data-testid="project-card"
      style={{ borderRadius: 'clamp(14px, 2vw, 20px)', padding: 'clamp(16px, 2.4vw, 24px)', background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 'clamp(8px, 1.2vw, 12px)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, color: '#111827', fontSize: F.title, lineHeight: 1.3, marginBottom: 4 }}>
            {project.title}
          </div>
          <div style={{ fontSize: F.meta, color: '#9ca3af' }}>
            {project.jurisdiction.lga}, {project.jurisdiction.state} · {project.contractor}
          </div>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <p style={{ margin: '0 0 clamp(10px, 1.6vw, 14px)', color: '#6b7280', fontSize: F.body, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {project.description}
      </p>

      <div style={{ marginBottom: 'clamp(10px, 1.4vw, 14px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: F.meta, color: '#374151', fontWeight: 600 }}>Completion</span>
          <span style={{ fontSize: F.meta, fontWeight: 900, color: project.status === 'completed' ? '#16a34a' : '#d97706' }}>
            {project.completionPercentage}%
          </span>
        </div>
        <LinearProgress
          variant="determinate"
          value={project.completionPercentage}
          sx={{
            height: 8, borderRadius: 4,
            backgroundColor: '#e5e7eb',
            '& .MuiLinearProgress-bar': {
              backgroundColor: project.status === 'completed' ? '#16a34a' : '#d97706',
              borderRadius: 4,
            },
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 'clamp(10px, 1.4vw, 14px)' }}>
        {[
          { label: 'Budget', value: `₦${(project.budget / 1_000_000).toFixed(1)}M` },
          { label: 'Spent', value: `₦${(project.spent / 1_000_000).toFixed(1)}M` },
          { label: 'Milestones', value: `${milestonesCompleted}/${project.milestones.length}` },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center', background: '#f9fafb', borderRadius: 10, padding: 'clamp(6px, 1vw, 10px) 4px' }}>
            <div style={{ fontWeight: 800, color: '#111827', fontSize: F.body }}>{s.value}</div>
            <div style={{ fontSize: F.meta, color: '#9ca3af' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {project.relatedIssueId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 'clamp(6px, 1vw, 10px) clamp(10px, 1.4vw, 14px)', background: '#eff6ff', borderRadius: 10, marginBottom: 'clamp(10px, 1.4vw, 14px)', border: '1px solid #c7d2fe' }}>
          <Construction sx={{ fontSize: 'clamp(14px, 1.8vw, 18px)', color: '#1d4ed8' }} />
          <span style={{ fontSize: F.meta, color: '#1d4ed8', fontWeight: 600 }}>
            Addressing: {project.issueTitle}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: F.meta }}>
          <CheckCircle sx={{ fontSize: 'clamp(13px, 1.6vw, 17px)', color: '#16a34a' }} />
          {project.watchersCount.toLocaleString()} watching
        </div>
        <Button
          component={Link} to={`/community/projects/${project.id}`}
          size="small" endIcon={<ArrowForward sx={{ fontSize: 'clamp(14px, 1.8vw, 18px)' }} />}
          sx={{ color: '#1d4ed8', fontWeight: 700, textTransform: 'none', fontSize: F.btn, px: 1.5, borderRadius: '8px', '&:hover': { background: '#eff6ff' } }}
        >
          View Project
        </Button>
      </div>
    </motion.div>
  );
}

export default memo(CommunityProjectCard);
