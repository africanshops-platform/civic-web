import { memo } from 'react';
import { Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';

const ILLUSTRATIONS = {
  campaigns: (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="70" r="60" stroke="#fdba74" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
      <circle cx="70" cy="70" r="45" fill="#fff7ed" />
      <rect x="45" y="52" width="50" height="36" rx="6" fill="#fdba74" opacity="0.5" />
      <rect x="52" y="59" width="20" height="4" rx="2" fill="#ea580c" opacity="0.7" />
      <rect x="52" y="67" width="36" height="3" rx="1.5" fill="#f97316" opacity="0.4" />
      <rect x="52" y="74" width="28" height="3" rx="1.5" fill="#f97316" opacity="0.4" />
      <circle cx="95" cy="50" r="14" fill="#ea580c" opacity="0.15" />
      <path d="M89 50 L93 54 L101 46" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  ),
  contributions: (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="70" r="60" stroke="#fdba74" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
      <circle cx="70" cy="70" r="45" fill="#fff7ed" />
      <rect x="42" y="55" width="56" height="38" rx="8" fill="#fdba74" opacity="0.4" />
      <rect x="42" y="63" width="56" height="8" fill="#f97316" opacity="0.3" />
      <circle cx="55" cy="75" r="4" fill="#ea580c" opacity="0.5" />
      <rect x="63" y="72" width="24" height="3" rx="1.5" fill="#ea580c" opacity="0.4" />
      <rect x="63" y="78" width="16" height="3" rx="1.5" fill="#ea580c" opacity="0.3" />
      <path d="M96 46 C96 42 102 42 102 46 C102 48 99 50 99 50 C99 50 96 48 96 46Z" fill="#ea580c" opacity="0.5" />
    </svg>
  ),
  projects: (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="70" r="60" stroke="#fdba74" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
      <circle cx="70" cy="70" r="45" fill="#fff7ed" />
      <rect x="44" y="48" width="52" height="52" rx="8" fill="#fdba74" opacity="0.3" />
      <rect x="50" y="58" width="40" height="4" rx="2" fill="#ea580c" opacity="0.6" />
      <rect x="50" y="66" width="30" height="3" rx="1.5" fill="#f97316" opacity="0.4" />
      <rect x="50" y="74" width="35" height="3" rx="1.5" fill="#f97316" opacity="0.3" />
      <rect x="50" y="82" width="20" height="3" rx="1.5" fill="#f97316" opacity="0.25" />
      <circle cx="89" cy="89" r="10" fill="#ea580c" opacity="0.15" />
      <path d="M85 89 L88 92 L93 86" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  ),
  default: (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="70" r="60" stroke="#fdba74" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
      <circle cx="70" cy="70" r="45" fill="#fff7ed" />
      <path d="M70 48 L80 60 H60 L70 48Z" fill="#ea580c" opacity="0.3" />
      <rect x="55" y="60" width="30" height="24" rx="3" fill="#fdba74" opacity="0.5" />
      <rect x="61" y="67" width="8" height="10" rx="1" fill="#ea580c" opacity="0.4" />
      <rect x="71" y="67" width="8" height="10" rx="1" fill="#ea580c" opacity="0.4" />
    </svg>
  ),
};

function CivicEmptyState({ type = 'default', title, description, ctaLabel, onCta, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
      className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}
      style={{ background: 'linear-gradient(180deg, #fafaf9 0%, #fff7ed 100%)' }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.45 }}
        className="mb-6"
      >
        {ILLUSTRATIONS[type] || ILLUSTRATIONS.default}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: '#1f2937', mb: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          {title || 'Nothing here yet'}
        </Typography>
        <Typography
          sx={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 360, mb: onCta ? 3 : 0 }}
        >
          {description || 'Check back soon or adjust your filters.'}
        </Typography>
      </motion.div>

      {onCta && ctaLabel && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Button
            onClick={onCta}
            variant="contained"
            size="medium"
            sx={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: 'white',
              fontWeight: 700,
              borderRadius: '12px',
              textTransform: 'none',
              px: 4,
              py: 1.5,
              boxShadow: '0 6px 18px rgba(234,88,12,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', transform: 'translateY(-1px)' },
            }}
          >
            {ctaLabel}
          </Button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 mt-6"
      >
        <div className="h-0.5 w-10 bg-gradient-to-r from-transparent to-orange-200 rounded-full" />
        <div className="w-1.5 h-1.5 rounded-full bg-orange-300" />
        <div className="h-0.5 w-10 bg-gradient-to-l from-transparent to-orange-200 rounded-full" />
      </motion.div>
    </motion.div>
  );
}

export default memo(CivicEmptyState);
