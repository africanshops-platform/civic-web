import { memo } from 'react';
import { motion } from 'framer-motion';

const F = {
  body: 'clamp(1.3rem, 2vw,   1.64rem)',
  meta: 'clamp(1.2rem, 1.8vw, 1.5rem)',
};

const CATEGORY_COLORS = {
  security:       { bg: '#fee2e2', color: '#dc2626' },
  agriculture:    { bg: '#dcfce7', color: '#16a34a' },
  infrastructure: { bg: '#dbeafe', color: '#2563eb' },
  health:         { bg: '#ede9fe', color: '#7c3aed' },
  education:      { bg: '#fef3c7', color: '#d97706' },
  environment:    { bg: '#d1fae5', color: '#059669' },
  contribution:   { bg: '#fff7ed', color: '#ea580c' },
  default:        { bg: '#f3f4f6', color: '#6b7280' },
};

function ActivityFeedItem({ icon: Icon, category = 'default', title, subtitle, amount, timestamp, index = 0 }) {
  const colorSet = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
  const timeLabel = timestamp
    ? new Date(timestamp).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(10px, 1.4vw, 14px)', padding: 'clamp(8px, 1.2vw, 12px)', borderRadius: 12 }}
      className="hover:bg-orange-50/60 transition-colors duration-200 group"
    >
      {/* ── Category avatar ── */}
      <div style={{
        width: 'clamp(32px, 4vw, 40px)', height: 'clamp(32px, 4vw, 40px)',
        borderRadius: '50%',
        backgroundColor: colorSet.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {Icon ? (
          <Icon style={{ color: colorSet.color, fontSize: 'clamp(14px, 1.8vw, 18px)' }} />
        ) : (
          <span style={{ color: colorSet.color, fontSize: 'clamp(12px, 1.6vw, 16px)' }}>◆</span>
        )}
      </div>

      {/* ── Text content ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: F.body,
          fontWeight: 600,
          color: '#1f2937',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {title}
        </div>

        {subtitle && (
          <div style={{ fontSize: F.meta, color: '#6b7280', marginTop: 3, lineHeight: 1.3 }}>
            {subtitle}
          </div>
        )}

        {(amount || timeLabel) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            {amount && (
              <div style={{ fontSize: F.meta, fontWeight: 700, color: '#ea580c' }}>
                ₦{Number(amount).toLocaleString()}
              </div>
            )}
            {timeLabel && (
              <div style={{ fontSize: F.meta, color: '#9ca3af' }}>{timeLabel}</div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default memo(ActivityFeedItem);
