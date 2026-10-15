import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Chip } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { useHealthAlerts } from '../../hooks/useHealthcareRepo';
import { ALERT_SEVERITY, EMERGENCY_NUMBER } from '../../constants';

const F = {
  sectionHead: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  body: 'clamp(1.5rem,  2.2vw, 1.9rem)',
  small: 'clamp(1.3rem,  1.8vw, 1.56rem)',
  icon: 'clamp(22px,    2.6vw, 30px)',
};

/** Live alerts from the facilities in the area, and the national emergency number. Nothing here is a made-up figure. */
function HealthcareSidebarRight() {
  const { data } = useHealthAlerts({ limit: 3 });
  const alerts = data?.data?.data ?? [];

  return (
    <div style={{ padding: 'clamp(16px, 2vw, 24px)', display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 2.4vw, 26px)' }}>
      {alerts.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, color: '#111827', fontSize: F.sectionHead, marginBottom: 14 }}>
            <Warning sx={{ fontSize: F.icon, color: '#dc2626' }} /> Active alerts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {alerts.map((a) => {
              const s = ALERT_SEVERITY[a.severity] ?? ALERT_SEVERITY.INFO;
              return (
                <Link key={a.id} to="/healthcare/alerts" style={{ textDecoration: 'none', padding: 'clamp(12px, 1.6vw, 18px)', borderRadius: 14, background: s.bg, border: `1px solid ${s.border}` }}>
                  <div style={{ fontWeight: 700, fontSize: F.body, color: s.color, marginBottom: 6, lineHeight: 1.35 }}>{a.title}</div>
                  <Chip label={s.label} size="small" sx={{ height: 28, fontSize: F.small, fontWeight: 800, background: s.chipBg, color: 'white' }} />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontWeight: 800, color: '#111827', fontSize: F.sectionHead, marginBottom: 14 }}>In an emergency</div>
        <a href={`tel:${EMERGENCY_NUMBER}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 12, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', textDecoration: 'none' }}>
          <span style={{ fontSize: F.body }}>🚑</span>
          <div>
            <div style={{ fontSize: F.small, color: '#6b7280', fontWeight: 600 }}>National emergency number</div>
            <div style={{ fontSize: F.body, color: '#dc2626', fontWeight: 800 }}>{EMERGENCY_NUMBER}</div>
          </div>
        </a>
        <p style={{ margin: '12px 0 0', fontSize: F.small, color: '#6b7280', lineHeight: 1.6 }}>Do not wait for an appointment if someone is in danger. Call, or go to the nearest facility.</p>
      </div>
    </div>
  );
}

export default memo(HealthcareSidebarRight);
