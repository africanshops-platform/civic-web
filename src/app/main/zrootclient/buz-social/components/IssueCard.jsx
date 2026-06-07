import { memo } from 'react';
import { motion } from 'framer-motion';
import { Button, Avatar, Typography, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { ThumbUp, ChatBubbleOutline, Visibility, LocationOn, ArrowForward } from '@mui/icons-material';
import StatusBadge from './StatusBadge';
import { ISSUE_CATEGORIES } from '../mock';

const F = {
  title: 'clamp(1.44rem, 2.4vw, 1.96rem)',
  body:  'clamp(1.3rem,  2vw,   1.64rem)',
  meta:  'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:   'clamp(1.3rem,  2vw,   1.56rem)',
};

function IssueCard({ issue, index = 0, onUpvote }) {
  if (!issue) return null;

  const catInfo = ISSUE_CATEGORIES.find((c) => c.id === issue.category) || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      data-testid="issue-card"
      style={{
        borderRadius: 'clamp(14px, 2vw, 20px)',
        border: '1.5px solid #e5e7eb',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: 'clamp(16px, 2.4vw, 24px)',
        background: 'white',
        width: '100%',
      }}
    >
      {/* ── Row 1: Category icon + title + status badges ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(10px, 1.4vw, 14px)', marginBottom: 'clamp(10px, 1.4vw, 14px)' }}>
        <div
          style={{ width: 'clamp(40px, 5.5vw, 52px)', height: 'clamp(40px, 5.5vw, 52px)', background: catInfo.bgColor || '#f3f4f6', fontSize: 'clamp(1.3rem, 2vw, 1.6rem)', borderRadius: 'clamp(10px, 1.4vw, 14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          {catInfo.icon || '📌'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, color: '#111827', fontSize: F.title, lineHeight: 1.35, mb: 0.4 }}>
            {issue.title}
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280', fontSize: F.meta }}>
            <LocationOn sx={{ fontSize: 'clamp(14px, 1.8vw, 18px)' }} />
            <span>{issue.jurisdiction.lga}, {issue.jurisdiction.state}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, alignItems: 'flex-end' }}>
          <StatusBadge status={issue.status} />
          <StatusBadge priority={issue.priority} />
        </div>
      </div>

      {/* ── Row 2: Description excerpt ── */}
      <Typography
        sx={{
          color: '#4b5563', fontSize: F.body, lineHeight: 1.75, mb: 2,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}
      >
        {issue.description}
      </Typography>

      {issue.assignedTo && (
        <Typography sx={{ fontSize: F.meta, color: '#6b7280', mb: 1.5 }}>
          Assigned to:{' '}
          <strong style={{ color: '#374151' }}>{issue.assignedTo.name}</strong>
        </Typography>
      )}

      {/* ── Row 3: Engagement stats + CTA ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'clamp(8px, 1.2vw, 12px)', marginBottom: 'clamp(10px, 1.4vw, 14px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px, 2vw, 20px)' }}>
          <button
            onClick={() => onUpvote?.(issue.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: F.meta, fontWeight: 700, padding: 0 }}
          >
            <ThumbUp sx={{ fontSize: 'clamp(14px, 1.8vw, 18px)', color: catInfo.color || '#059669' }} />
            <span>{issue.upvotes.toLocaleString()}</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: F.meta }}>
            <ChatBubbleOutline sx={{ fontSize: 'clamp(14px, 1.8vw, 18px)' }} />
            <span>{issue.commentsCount}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: F.meta }}>
            <Visibility sx={{ fontSize: 'clamp(14px, 1.8vw, 18px)' }} />
            <span>{issue.views.toLocaleString()}</span>
          </div>
        </div>

        <Button
          component={Link}
          to={`/community/issues/${issue.id}`}
          variant="contained"
          size="small"
          endIcon={<ArrowForward sx={{ fontSize: 'clamp(14px, 1.8vw, 18px)' }} />}
          sx={{
            background: catInfo.color || '#059669',
            color: 'white', fontWeight: 700, textTransform: 'none',
            fontSize: F.btn,
            px: 'clamp(10px, 1.8vw, 18px)',
            py: 'clamp(6px, 1vw, 10px)',
            borderRadius: '10px',
            '&:hover': { filter: 'brightness(0.88)' },
          }}
        >
          View Issue
        </Button>
      </div>

      {/* ── Row 4: Reporter + date footer ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar sx={{ width: 'clamp(22px, 2.8vw, 28px)', height: 'clamp(22px, 2.8vw, 28px)', fontSize: F.meta, bgcolor: catInfo.color || '#6b7280' }}>
            {issue.reportedBy.name.charAt(0)}
          </Avatar>
          <Typography sx={{ fontSize: F.meta, color: '#6b7280' }}>
            Reported by{' '}
            <strong style={{ color: '#374151' }}>{issue.reportedBy.name}</strong>
          </Typography>
        </div>
        <Typography sx={{ fontSize: F.meta, color: '#9ca3af' }}>
          {new Date(issue.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Typography>
      </div>
    </motion.div>
  );
}

export default memo(IssueCard);
