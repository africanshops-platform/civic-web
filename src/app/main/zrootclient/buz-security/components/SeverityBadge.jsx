import { memo } from 'react';
import { motion } from 'framer-motion';
import { SEVERITY_CONFIG } from '../mock';

const SIZES = {
  sm: { font: 'clamp(1.1rem, 1.6vw, 1.3rem)',  px: 10, py: 3,  dot: 8  },
  md: { font: 'clamp(1.2rem, 1.8vw, 1.5rem)',  px: 12, py: 4,  dot: 10 },
  lg: { font: 'clamp(1.3rem, 2vw,   1.64rem)', px: 16, py: 5,  dot: 12 },
};

function SeverityBadge({ severity, size = 'md', pulse = false }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.low;
  const s   = SIZES[size] || SIZES.md;
  const doPulse = pulse && (severity === 'critical' || severity === 'high');

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      backgroundColor: cfg.bg, borderRadius: 999,
      padding: `${s.py}px ${s.px}px`,
      border: `1.5px solid ${cfg.ring || cfg.color}55`,
    }}>
      <div style={{ position: 'relative', width: s.dot, height: s.dot, flexShrink: 0 }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: cfg.color }} />
        {doPulse && (
          <motion.div
            animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: cfg.color }}
          />
        )}
      </div>
      <span style={{ fontSize: s.font, fontWeight: 700, color: cfg.color, whiteSpace: 'nowrap' }}>
        {cfg.label}
      </span>
    </div>
  );
}

export default memo(SeverityBadge);
