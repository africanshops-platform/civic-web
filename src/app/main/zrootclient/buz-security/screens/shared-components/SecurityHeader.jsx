import { memo } from 'react';
import { IconButton, Button, Chip } from '@mui/material';
import { Shield, Add, Warning } from '@mui/icons-material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SECURITY_STATS } from '../../mock';

const F = {
  meta: 'clamp(1.2rem, 1.8vw, 1.5rem)',
  btn:  'clamp(1.3rem, 2vw,   1.56rem)',
  subH: 'clamp(1.4rem, 2.2vw, 1.8rem)',
};

function SecurityHeader({ leftSidebarToggle, rightSidebarToggle, title, subtitle, showReportBtn = false }) {
  const navigate = useNavigate();
  const hasCritical = SECURITY_STATS.criticalCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: 'clamp(12px, 1.8vw, 18px) clamp(14px, 2vw, 22px)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

        {/* Left: menu + logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.4vw, 16px)' }}>
          {leftSidebarToggle && (
            <IconButton onClick={leftSidebarToggle} size="small"
              sx={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
              <FuseSvgIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>heroicons-outline:menu</FuseSvgIcon>
            </IconButton>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.2vw, 12px)' }}>
            <div style={{
              width: 'clamp(32px, 4vw, 42px)', height: 'clamp(32px, 4vw, 42px)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg,#dc2626,#991b1b)', flexShrink: 0,
            }}>
              <Shield style={{ color: 'white', fontSize: 'clamp(16px, 2.2vw, 22px)' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ fontWeight: 900, fontSize: F.subH, color: 'white', lineHeight: 1.2 }}>
                  {title || 'Security Monitor'}
                </div>
                {hasCritical && (
                  <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
                    <Chip
                      icon={<Warning style={{ fontSize: 'clamp(12px, 1.6vw, 16px)', color: '#f87171' }} />}
                      label={`${SECURITY_STATS.criticalCount} CRITICAL`}
                      size="small"
                      style={{ fontSize: F.meta }}
                      sx={{ backgroundColor: 'rgba(220,38,38,0.25)', color: '#f87171', fontWeight: 800, height: 'clamp(22px, 2.8vw, 30px)', border: '1px solid rgba(220,38,38,0.5)', '& .MuiChip-label': { fontSize: F.meta } }}
                    />
                  </motion.div>
                )}
              </div>
              {subtitle && (
                <div style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{subtitle}</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {showReportBtn && (
            <Button size="small" startIcon={<Add style={{ fontSize: 'clamp(16px, 2vw, 20px)' }} />}
              onClick={() => navigate('/security/report-incident')}
              style={{ fontSize: F.btn }}
              sx={{
                background: 'linear-gradient(135deg,#dc2626,#991b1b)',
                color: 'white', fontWeight: 700, borderRadius: '10px',
                textTransform: 'none',
                px: 'clamp(10px, 1.8vw, 18px)', py: 'clamp(6px, 1vw, 10px)',
                display: { xs: 'none', sm: 'flex' },
                boxShadow: '0 4px 14px rgba(220,38,38,0.4)',
                '&:hover': { background: 'linear-gradient(135deg,#b91c1c,#7f1d1d)' },
              }}>
              Report Incident
            </Button>
          )}
          {rightSidebarToggle && (
            <IconButton onClick={rightSidebarToggle} size="small"
              sx={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
              <FuseSvgIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>heroicons-outline:collection</FuseSvgIcon>
            </IconButton>
          )}
        </div>
      </div>

      {/* Accent line */}
      <div style={{ marginTop: 12, height: 2, borderRadius: 2, background: 'linear-gradient(90deg,#dc2626,#ea580c,transparent)' }} />
    </motion.div>
  );
}

export default memo(SecurityHeader);
