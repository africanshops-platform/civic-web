import { memo } from 'react';
import { Skeleton } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { motion } from 'framer-motion';

const F = {
  meta:    'clamp(1.2rem, 1.8vw, 1.5rem)',
  sectionH:'clamp(2rem,   4vw,   3.4rem)',
};

function CivicStatCard({ icon: Icon, label, value, subtitle, trend, trendValue, accent = false, isLoading = false }) {
  if (isLoading) {
    return (
      <div style={{ borderRadius: 16, padding: 'clamp(14px, 2vw, 20px)', background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #ffedd5' }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ backgroundColor: 'rgba(234,88,12,0.1)', mb: 1 }} />
        <Skeleton variant="text" width="60%" height={20} sx={{ backgroundColor: 'rgba(234,88,12,0.08)' }} />
        <Skeleton variant="text" width="40%" height={36} sx={{ backgroundColor: 'rgba(234,88,12,0.12)' }} />
        <Skeleton variant="text" width="70%" height={16} sx={{ backgroundColor: 'rgba(234,88,12,0.07)' }} />
      </div>
    );
  }

  const isPositive = trend === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(234,88,12,0.18)' }}
      style={{
        borderRadius: 16,
        padding: 'clamp(14px, 2vw, 20px)',
        cursor: 'default',
        ...(accent
          ? { background: 'linear-gradient(135deg, #f97316 0%, #ea580c 60%, #c2410c 100%)', boxShadow: '0 8px 24px rgba(234,88,12,0.3)' }
          : { background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #ffedd5' }
        ),
      }}
    >
      {/* Icon + trend row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'clamp(10px, 1.4vw, 14px)' }}>
        <div style={{ width: 'clamp(36px, 4.8vw, 44px)', height: 'clamp(36px, 4.8vw, 44px)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', ...(accent ? { background: 'rgba(255,255,255,0.25)' } : { background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '1px solid #fdba74' }) }}>
          {Icon && <Icon style={{ color: accent ? 'white' : '#ea580c', fontSize: 'clamp(18px, 2.4vw, 24px)' }} />}
        </div>

        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 'clamp(3px,0.5vw,5px) clamp(8px,1.2vw,10px)', borderRadius: 999, fontSize: F.meta, fontWeight: 700, ...(isPositive ? { backgroundColor: accent ? 'rgba(255,255,255,0.2)' : '#dcfce7', color: accent ? 'white' : '#166534' } : { backgroundColor: accent ? 'rgba(255,255,255,0.2)' : '#fee2e2', color: accent ? 'white' : '#991b1b' }) }}>
            {isPositive
              ? <TrendingUp style={{ fontSize: 'clamp(13px, 1.6vw, 16px)' }} />
              : <TrendingDown style={{ fontSize: 'clamp(13px, 1.6vw, 16px)' }} />}
            {trendValue}
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{ fontSize: F.meta, fontWeight: 600, color: accent ? 'rgba(255,255,255,0.85)' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </div>

      {/* Value */}
      <div style={{ fontSize: F.sectionH, fontWeight: 900, color: accent ? 'white' : '#1f2937', lineHeight: 1.1, marginBottom: subtitle ? 4 : 0 }}>
        {value}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div style={{ fontSize: F.meta, color: accent ? 'rgba(255,255,255,0.75)' : '#9ca3af' }}>
          {subtitle}
        </div>
      )}
    </motion.div>
  );
}

export default memo(CivicStatCard);
