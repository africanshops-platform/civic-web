import { memo } from 'react';
import { Skeleton, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

function CivicLoadingSkeleton({ message = 'Loading...', cardCount = 4, variant = 'grid' }) {
  return (
    <div
      className="flex-auto p-6 sm:p-10"
      style={{
        background: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #fef3e2 100%)',
        minHeight: '60vh',
      }}
    >
      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl p-5 bg-white shadow-sm border border-orange-50">
            <Skeleton variant="circular" width={36} height={36} sx={{ backgroundColor: 'rgba(234,88,12,0.1)', mb: 1 }} />
            <Skeleton width="55%" height={16} sx={{ backgroundColor: 'rgba(234,88,12,0.08)', borderRadius: 2 }} />
            <Skeleton width="40%" height={32} sx={{ backgroundColor: 'rgba(234,88,12,0.12)', borderRadius: 2, mt: 0.5 }} />
          </div>
        ))}
      </div>

      {/* Main content skeleton with centered loader */}
      <div
        className="relative rounded-3xl overflow-hidden mb-6 p-6"
        style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
      >
        {/* Centered logo loader */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, repeat: Infinity, repeatType: 'reverse', repeatDelay: 0.6 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="relative">
              <CircularProgress size={110} thickness={3} sx={{ color: '#ea580c', position: 'absolute', top: -15, left: -15 }} />
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
              >
                <img
                  src="/assets/images/logo/logo.svg"
                  alt="AfricanShops"
                  className="w-12 h-12"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div style="color:white;font-size:1.5rem;font-weight:900">AS</div>';
                  }}
                />
              </div>
            </div>
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#ea580c', textAlign: 'center' }}>{message}</Typography>
            </motion.div>
          </motion.div>
        </div>

        {/* Faded card skeletons */}
        <div className={`grid ${variant === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6 opacity-25`}>
          {Array.from({ length: cardCount }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm">
              <Skeleton variant="rectangular" height={180} sx={{ backgroundColor: 'rgba(234,88,12,0.1)' }} />
              <div className="p-5 space-y-3">
                <Skeleton width="65%" height={20} sx={{ backgroundColor: 'rgba(234,88,12,0.08)', borderRadius: 2 }} />
                <Skeleton width="90%" height={28} sx={{ backgroundColor: 'rgba(234,88,12,0.1)', borderRadius: 2 }} />
                <Skeleton width="75%" height={16} sx={{ backgroundColor: 'rgba(234,88,12,0.07)', borderRadius: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={8} sx={{ backgroundColor: 'rgba(234,88,12,0.12)', borderRadius: 4, mt: 1 }} />
                <div className="flex justify-between pt-2">
                  <Skeleton width="35%" height={24} sx={{ backgroundColor: 'rgba(234,88,12,0.1)', borderRadius: 2 }} />
                  <Skeleton width="30%" height={24} sx={{ backgroundColor: 'rgba(234,88,12,0.08)', borderRadius: 2 }} />
                </div>
                <Skeleton variant="rectangular" width="100%" height={40} sx={{ backgroundColor: 'rgba(234,88,12,0.12)', borderRadius: 10, mt: 1 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(CivicLoadingSkeleton);
