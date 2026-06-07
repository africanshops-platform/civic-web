import { memo } from 'react';
import { IconButton, Button } from '@mui/material';
import { Menu, Forum, AddCircleOutline } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const F = {
  meta: 'clamp(1.2rem, 1.8vw, 1.5rem)',
  btn:  'clamp(1.3rem, 2vw,   1.56rem)',
  subH: 'clamp(1.4rem, 2.2vw, 1.8rem)',
};

function CommunityHeader({ leftSidebarToggle, rightSidebarToggle, title, subtitle }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 clamp(12px, 1.8vw, 20px)',
      height: 'clamp(56px, 7vw, 72px)',
      width: '100%', gap: 12,
    }}>

      {/* ── Left: menu + logo + title ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.2vw, 14px)', minWidth: 0 }}>
        <IconButton onClick={leftSidebarToggle} size="small">
          <Menu style={{ fontSize: 'clamp(18px, 2.4vw, 24px)' }} />
        </IconButton>
        <div style={{
          width: 'clamp(32px, 4vw, 42px)', height: 'clamp(32px, 4vw, 42px)',
          borderRadius: 10,
          background: 'linear-gradient(135deg, #059669 0%, #0f766e 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Forum style={{ color: 'white', fontSize: 'clamp(16px, 2.2vw, 22px)' }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, color: '#111827', fontSize: F.subH, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title || 'Community Feed'}
          </div>
          {subtitle && (
            <div style={{ fontSize: F.meta, color: '#6b7280', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: CTA + menu ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Button
          component={Link}
          to="/community/create-issue"
          size="small"
          startIcon={<AddCircleOutline style={{ fontSize: 'clamp(16px, 2vw, 20px)' }} />}
          style={{ fontSize: F.btn }}
          sx={{
            background: 'linear-gradient(135deg, #059669 0%, #0f766e 100%)',
            color: 'white', fontWeight: 700, borderRadius: '10px',
            textTransform: 'none',
            px: 'clamp(10px, 1.6vw, 16px)', py: 'clamp(6px, 0.9vw, 10px)',
            '&:hover': { filter: 'brightness(0.92)' },
          }}
        >
          Report Issue
        </Button>
        <IconButton onClick={rightSidebarToggle} size="small">
          <Menu style={{ fontSize: 'clamp(18px, 2.4vw, 24px)' }} />
        </IconButton>
      </div>

    </div>
  );
}

export default memo(CommunityHeader);
