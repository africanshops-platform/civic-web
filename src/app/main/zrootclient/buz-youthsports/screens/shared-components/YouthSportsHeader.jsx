import { memo } from 'react';
import { IconButton, Button } from '@mui/material';
import { Menu, EmojiEvents, AddCircleOutline } from '@mui/icons-material';
import { Link } from 'react-router-dom';

function YouthSportsHeader({ leftSidebarToggle, rightSidebarToggle, title, subtitle }) {
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
          background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <EmojiEvents sx={{ color: 'white', fontSize: 'clamp(20px, 2.6vw, 28px)' }} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{
            fontWeight: 800, color: '#111827', lineHeight: 1.2,
            fontSize: 'clamp(1.64rem, 2.8vw, 2.2rem)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {title || 'Youth & Sports'}
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
      </div>

      {/* ── Right: CTA button + toggle ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1vw, 12px)', flexShrink: 0 }}>
        <Button
          component={Link} to="/youth/programs"
          size="medium"
          startIcon={<AddCircleOutline sx={{ fontSize: 'clamp(20px, 2.4vw, 28px)' }} />}
          sx={{
            background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
            color: 'white', fontWeight: 700, borderRadius: '10px',
            textTransform: 'none',
            fontSize: 'clamp(1.3rem, 2vw, 1.76rem)',
            px: 'clamp(10px, 1.4vw, 20px)',
            py: 'clamp(6px, 0.8vw, 10px)',
            '&:hover': { filter: 'brightness(0.92)' },
          }}
        >
          Find a Programme
        </Button>
        <IconButton onClick={rightSidebarToggle} size="medium">
          <Menu sx={{ fontSize: 'clamp(24px, 3vw, 32px)' }} />
        </IconButton>
      </div>
    </div>
  );
}

export default memo(YouthSportsHeader);
