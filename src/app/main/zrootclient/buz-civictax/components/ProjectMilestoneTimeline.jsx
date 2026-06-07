import { memo } from 'react';
import { Chip } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, PlayCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';

const F = {
  body: 'clamp(1.3rem, 2vw,   1.64rem)',
  meta: 'clamp(1.2rem, 1.8vw, 1.5rem)',
  subH: 'clamp(1.4rem, 2.2vw, 1.8rem)',
};

const STATUS_CONFIG = {
  completed:   { Icon: CheckCircle,         color: '#16a34a', bg: '#dcfce7', label: 'Done'        },
  in_progress: { Icon: PlayCircle,          color: '#ea580c', bg: '#fff7ed', label: 'In Progress' },
  upcoming:    { Icon: RadioButtonUnchecked, color: '#9ca3af', bg: '#f9fafb', label: 'Upcoming'   },
};

function MilestoneItem({ milestone, index, isLast }) {
  const config        = STATUS_CONFIG[milestone.status] || STATUS_CONFIG.upcoming;
  const { Icon, color, bg } = config;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      style={{ display: 'flex', gap: 'clamp(10px, 1.4vw, 14px)', position: 'relative' }}
    >
      {/* Icon + connector */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width:  'clamp(28px, 3.8vw, 36px)',
          height: 'clamp(28px, 3.8vw, 36px)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: bg, border: `2px solid ${color}`, position: 'relative', zIndex: 1,
        }}>
          <Icon style={{ color, fontSize: 'clamp(14px, 1.8vw, 18px)' }} />
        </div>
        {!isLast && (
          <div style={{ width: 2, flex: 1, minHeight: 16, backgroundColor: '#ffedd5', marginTop: 2 }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: 'clamp(12px, 1.8vw, 20px)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{
            fontSize: F.body,
            fontWeight: milestone.status === 'in_progress' ? 700 : 600,
            color: milestone.status === 'upcoming' ? '#9ca3af' : '#1f2937',
            lineHeight: 1.4,
          }}>
            {milestone.title}
          </div>
          <Chip label={config.label} size="small"
            style={{ fontSize: F.meta }}
            sx={{ backgroundColor: bg, color, fontWeight: 700, height: 'clamp(20px, 2.6vw, 26px)', flexShrink: 0, '& .MuiChip-label': { fontSize: F.meta } }} />
        </div>

        {milestone.date && (
          <div style={{ fontSize: F.meta, color: '#9ca3af', marginTop: 3 }}>
            {new Date(milestone.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}

        {milestone.evidence && (
          <div style={{ fontSize: F.meta, color: '#2563eb', marginTop: 4, cursor: 'pointer', fontWeight: 600 }}>
            📎 {milestone.evidence}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ProjectMilestoneTimeline({ milestones = [], projectTitle, compact = false }) {
  if (!milestones.length) return null;
  const completed = milestones.filter((m) => m.status === 'completed').length;

  return (
    <div style={{ width: '100%' }}>
      {!compact && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(12px, 1.8vw, 18px)' }}>
          <div style={{ fontWeight: 700, fontSize: F.subH, color: '#1f2937' }}>
            {projectTitle || 'Project Milestones'}
          </div>
          <div style={{ fontSize: F.meta, color: '#6b7280', fontWeight: 600 }}>
            {completed}/{milestones.length} done
          </div>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        {milestones.map((milestone, i) => (
          <MilestoneItem
            key={milestone.id}
            milestone={milestone}
            index={i}
            isLast={i === milestones.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(ProjectMilestoneTimeline);
