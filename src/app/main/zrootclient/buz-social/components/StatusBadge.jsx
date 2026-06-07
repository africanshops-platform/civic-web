import { memo } from 'react';
import { Chip } from '@mui/material';

const F = {
  meta: 'clamp(1.2rem, 1.8vw, 1.5rem)',
  body: 'clamp(1.3rem, 2vw,   1.64rem)',
};

const STATUS_MAP = {
  open:        { label: 'Open',        bg: '#eff6ff', color: '#1d4ed8' },
  in_progress: { label: 'In Progress', bg: '#fffbeb', color: '#d97706' },
  resolved:    { label: 'Resolved',    bg: '#f0fdf4', color: '#16a34a' },
  closed:      { label: 'Closed',      bg: '#f9fafb', color: '#6b7280' },
  completed:   { label: 'Completed',   bg: '#f0fdf4', color: '#16a34a' },
};

const PRIORITY_MAP = {
  low:      { label: 'Low',      bg: '#f9fafb', color: '#6b7280' },
  medium:   { label: 'Medium',   bg: '#fffbeb', color: '#d97706' },
  high:     { label: 'High',     bg: '#fff1f2', color: '#be123c' },
  critical: { label: 'Critical', bg: '#fdf2f8', color: '#9d174d' },
};

function StatusBadge({ status, priority, size = 'small', sx = {} }) {
  if (priority) {
    const p = PRIORITY_MAP[priority] || PRIORITY_MAP.medium;
    return (
      <Chip
        data-testid={`priority-badge-${priority}`}
        label={p.label}
        size={size}
        sx={{ background: p.bg, color: p.color, fontWeight: 800, border: `1px solid ${p.color}33`, fontSize: size === 'small' ? F.meta : F.body, ...sx }}
      />
    );
  }
  const s = STATUS_MAP[status] || STATUS_MAP.open;
  return (
    <Chip
      data-testid={`status-badge-${status}`}
      label={s.label}
      size={size}
      sx={{ background: s.bg, color: s.color, fontWeight: 800, border: `1px solid ${s.color}33`, fontSize: size === 'small' ? F.meta : F.body, ...sx }}
    />
  );
}

export default memo(StatusBadge);
