import { memo } from 'react';
import { IconButton, Button, Chip } from '@mui/material';
import { Menu, LocalHospital, Warning } from '@mui/icons-material';
import { Link } from 'react-router-dom';

function HealthcareHeader({ leftSidebarToggle, rightSidebarToggle, title, subtitle, hasAlerts }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 72, width: '100%', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <IconButton onClick={leftSidebarToggle} size="medium"><Menu sx={{ fontSize: 28 }} /></IconButton>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #16a34a 0%, #0f766e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <LocalHospital sx={{ color: 'white', fontSize: 26 }} />
        </div>
        <div>
          <div style={{ fontWeight: 800, color: '#111827', fontSize: 'clamp(1.9rem, 3.2vw, 2.2rem)', lineHeight: 1.2 }}>
            {title || 'Primary Healthcare'}
          </div>
          {subtitle && <div style={{ fontSize: 'clamp(1.52rem, 2.4vw, 1.8rem)', color: '#6b7280', lineHeight: 1 }}>{subtitle}</div>}
        </div>
        {hasAlerts && (
          <Chip
            label="ALERT"
            size="small"
            icon={<Warning sx={{ fontSize: '1.5rem !important' }} />}
            sx={{ background: '#dc2626', color: 'white', fontWeight: 800, fontSize: '1.36rem', height: 36 }}
          />
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Button
          component={Link} to="/healthcare/alerts"
          size="medium" startIcon={<Warning sx={{ fontSize: 28 }} />}
          sx={{ background: 'linear-gradient(135deg, #16a34a 0%, #0f766e 100%)', color: 'white', fontWeight: 700, borderRadius: '10px', textTransform: 'none', fontSize: '1.64rem', px: 2.5, py: 1, '&:hover': { filter: 'brightness(0.92)' } }}
        >
          Health Alerts
        </Button>
        <IconButton onClick={rightSidebarToggle} size="medium"><Menu sx={{ fontSize: 28 }} /></IconButton>
      </div>
    </div>
  );
}

export default memo(HealthcareHeader);
