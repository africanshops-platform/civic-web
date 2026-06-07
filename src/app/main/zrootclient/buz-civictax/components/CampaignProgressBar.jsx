import { memo, useEffect, useRef, useState } from 'react';
import { LinearProgress } from '@mui/material';
import { motion, useInView } from 'framer-motion';

const F = {
  meta:    'clamp(1.2rem, 1.8vw, 1.5rem)',
  subH:    'clamp(1.4rem, 2.2vw, 1.8rem)',
  sectionH:'clamp(2rem,   4vw,   3.4rem)',
};

function CampaignProgressBar({ raised, target, compact = false }) {
  const percentage = Math.min(Math.round((raised / target) * 100), 100);
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step  = percentage / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= percentage) { setDisplayPercentage(percentage); clearInterval(timer); return; }
      setDisplayPercentage(Math.round(start));
    }, 20);
    return () => clearInterval(timer);
  }, [isInView, percentage]);

  const colorByPercentage =
    percentage >= 100 ? '#16a34a' :
    percentage >= 75  ? '#2563eb' :
    percentage >= 40  ? '#ea580c' : '#f97316';

  /* ── Compact variant (used inside CampaignCard) ── */
  if (compact) {
    return (
      <div ref={ref} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: F.meta, color: '#6b7280', fontWeight: 600 }}>
            ₦{Number(raised).toLocaleString()} raised
          </span>
          <span style={{ fontSize: F.meta, fontWeight: 700, color: colorByPercentage }}>
            {displayPercentage}%
          </span>
        </div>
        <LinearProgress
          variant="determinate"
          value={displayPercentage}
          sx={{
            height: 7, borderRadius: 4, backgroundColor: '#ffedd5',
            '& .MuiLinearProgress-bar': { borderRadius: 4, background: `linear-gradient(90deg, #f97316 0%, ${colorByPercentage} 100%)` },
          }}
        />
      </div>
    );
  }

  /* ── Full variant (used in detail page) ── */
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: F.subH, fontWeight: 900, color: '#ea580c' }}>
            ₦{Number(raised).toLocaleString()}
          </div>
          <div style={{ fontSize: F.meta, color: '#9ca3af' }}>
            raised of ₦{Number(target).toLocaleString()}
          </div>
        </div>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
        >
          <div style={{ fontSize: F.sectionH, fontWeight: 900, color: colorByPercentage, lineHeight: 1 }}>
            {displayPercentage}%
          </div>
          <div style={{ fontSize: F.meta, color: '#9ca3af' }}>funded</div>
        </motion.div>
      </div>

      <div style={{ position: 'relative', height: 14, borderRadius: 999, overflow: 'hidden', backgroundColor: '#ffedd5' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isInView ? `${displayPercentage}%` : '0%' }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
          style={{ position: 'absolute', inset: '0 auto 0 0', borderRadius: 999, background: `linear-gradient(90deg, #f97316 0%, ${colorByPercentage} 100%)` }}
        />
      </div>
    </div>
  );
}

export default memo(CampaignProgressBar);
