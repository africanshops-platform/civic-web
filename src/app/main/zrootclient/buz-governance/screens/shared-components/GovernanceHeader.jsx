import { memo } from 'react';
import { IconButton, Button, Chip } from '@mui/material';
import { Menu, HowToVote, BarChart } from '@mui/icons-material';
import { Link } from 'react-router-dom';

function GovernanceHeader({ leftSidebarToggle, rightSidebarToggle, title, subtitle, activeElection }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 clamp(12px, 2vw, 24px)', height: 72, width: '100%', gap: 12,
    }}>
      {/* ── Left: toggle + brand + title ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.4vw, 16px)', minWidth: 0, flex: 1 }}>
        <IconButton onClick={leftSidebarToggle} size="medium">
          <Menu sx={{ fontSize: 'clamp(24px, 3vw, 32px)' }} />
        </IconButton>

        <div style={{
          width: 'clamp(36px, 4.5vw, 48px)', height: 'clamp(36px, 4.5vw, 48px)',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <HowToVote sx={{ color: 'white', fontSize: 'clamp(20px, 2.6vw, 28px)' }} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{
            fontWeight: 800, color: '#111827', lineHeight: 1.2,
            fontSize: 'clamp(1.64rem, 2.8vw, 2.2rem)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {title || 'Digital Governance'}
          </div>
          {subtitle && (
            <div style={{
              color: '#6b7280', lineHeight: 1.1,
              fontSize: 'clamp(1.3rem, 2vw, 1.64rem)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {subtitle}
            </div>
          )}
        </div>

        {activeElection && (
          <Chip
            label="LIVE"
            size="small"
            sx={{
              background: '#ef4444', color: 'white', fontWeight: 800,
              fontSize: 'clamp(1.2rem, 1.8vw, 1.4rem)',
              height: 32, flexShrink: 0,
              animation: 'pulse 2s infinite',
            }}
          />
        )}
      </div>

      {/* ── Right: Live Results + toggle ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1vw, 12px)', flexShrink: 0 }}>
        <Button
          component={Link}
          to="/governance/elections/elec_001/live"
          size="medium"
          startIcon={<BarChart sx={{ fontSize: 'clamp(20px, 2.4vw, 28px)' }} />}
          sx={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
            color: 'white', fontWeight: 700, borderRadius: '10px', textTransform: 'none',
            fontSize: 'clamp(1.3rem, 2vw, 1.76rem)',
            px: 'clamp(10px, 1.4vw, 20px)',
            py: 'clamp(6px, 0.8vw, 10px)',
            '&:hover': { filter: 'brightness(0.92)' },
          }}
        >
          Live Results
        </Button>
        <IconButton onClick={rightSidebarToggle} size="medium">
          <Menu sx={{ fontSize: 'clamp(24px, 3vw, 32px)' }} />
        </IconButton>
      </div>
    </div>
  );
}

export default memo(GovernanceHeader);
