import { memo } from 'react';
import { IconButton, Button, Chip } from '@mui/material';
import { Menu, Add, AccountBalanceWallet } from '@mui/icons-material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const F = {
  meta: 'clamp(1.2rem, 1.8vw, 1.5rem)',
  btn:  'clamp(1.3rem, 2vw,   1.56rem)',
  subH: 'clamp(1.4rem, 2.2vw, 1.8rem)',
};

function CivicTaxHeader({ leftSidebarToggle, rightSidebarToggle, title, subtitle, showContributeBtn = false }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: 'clamp(12px, 1.8vw, 18px) clamp(14px, 2vw, 22px)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

        {/* Left: toggle + logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.2vw, 14px)' }}>
          {leftSidebarToggle && (
            <IconButton onClick={leftSidebarToggle} size="small"
              sx={{ backgroundColor: '#fff7ed', border: '1px solid #fdba74', '&:hover': { backgroundColor: '#ffedd5' } }}>
              <FuseSvgIcon fontSize="small" sx={{ color: '#ea580c' }}>heroicons-outline:menu</FuseSvgIcon>
            </IconButton>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.2vw, 12px)' }}>
            <div style={{ width: 'clamp(30px, 4vw, 38px)', height: 'clamp(30px, 4vw, 38px)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', flexShrink: 0 }}>
              <AccountBalanceWallet style={{ color: 'white', fontSize: 'clamp(14px, 1.8vw, 18px)' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontWeight: 900, fontSize: F.subH, color: '#1f2937', lineHeight: 1.2 }}>
                  {title || 'Civic Tax'}
                </div>
                <Chip label="BETA" size="small"
                  style={{ fontSize: F.meta }}
                  sx={{ backgroundColor: '#fff7ed', color: '#ea580c', fontWeight: 800, height: 'clamp(20px, 2.6vw, 26px)', border: '1px solid #fdba74', '& .MuiChip-label': { fontSize: F.meta } }} />
              </div>
              {subtitle && (
                <div style={{ fontSize: F.meta, color: '#9ca3af', marginTop: 2 }}>{subtitle}</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: CTA + toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showContributeBtn && (
            <Button size="small" startIcon={<Add style={{ fontSize: 'clamp(14px, 1.8vw, 18px)' }} />}
              onClick={() => navigate('/civictax/campaigns')}
              style={{ fontSize: F.btn }}
              sx={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', fontWeight: 700, borderRadius: '10px', textTransform: 'none', px: 'clamp(10px, 1.6vw, 16px)', py: 'clamp(5px, 0.8vw, 8px)', boxShadow: '0 4px 12px rgba(234,88,12,0.3)', display: { xs: 'none', sm: 'flex' }, '&:hover': { background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' } }}>
              Contribute
            </Button>
          )}
          {rightSidebarToggle && (
            <IconButton onClick={rightSidebarToggle} size="small"
              sx={{ backgroundColor: '#fff7ed', border: '1px solid #fdba74', '&:hover': { backgroundColor: '#ffedd5' } }}>
              <FuseSvgIcon fontSize="small" sx={{ color: '#ea580c' }}>heroicons-outline:chart-bar</FuseSvgIcon>
            </IconButton>
          )}
        </div>
      </div>

      {/* Orange accent line */}
      <div style={{ marginTop: 12, height: 2, borderRadius: 2, background: 'linear-gradient(90deg, #f97316, #ea580c, transparent)' }} />
    </motion.div>
  );
}

export default memo(CivicTaxHeader);
