import { memo } from 'react';
import { Chip } from '@mui/material';
import { Warning, AccessTime } from '@mui/icons-material';
import { mockHealthAlerts } from '../../mock';

const F = {
  sectionHead: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  statValue:   'clamp(2rem,    3.2vw, 2.8rem)',
  statEmoji:   'clamp(2rem,    2.8vw, 2.6rem)',
  statLabel:   'clamp(1.3rem,  1.8vw, 1.64rem)',
  body:        'clamp(1.5rem,  2.2vw, 1.9rem)',
  small:       'clamp(1.3rem,  1.8vw, 1.56rem)',
  icon:        'clamp(22px,    2.6vw, 30px)',
};

function StatCard({ emoji, value, label, accent }) {
  return (
    <div style={{
      padding: 'clamp(14px, 1.8vw, 20px) clamp(16px, 2vw, 22px)',
      borderRadius: 16, background: '#f0fdf4', border: '1px solid #bbf7d0',
      display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.4vw, 16px)',
    }}>
      <div style={{ fontSize: F.statEmoji, lineHeight: 1 }}>{emoji}</div>
      <div>
        <div style={{ fontWeight: 900, fontSize: F.statValue, color: accent || '#16a34a', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: F.statLabel, color: '#6b7280', fontWeight: 600, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

function HealthcareSidebarRight({ stats }) {
  const activeAlerts = mockHealthAlerts.filter((a) => a.active).slice(0, 3);

  return (
    <div style={{ padding: 'clamp(16px, 2vw, 24px)', display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 2.4vw, 26px)' }}>

      {/* ── Quick Stats ── */}
      <div>
        <div style={{ fontWeight: 800, color: '#111827', fontSize: F.sectionHead, marginBottom: 'clamp(10px, 1.4vw, 16px)' }}>
          Quick Stats
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.2vw, 14px)' }}>
          <StatCard emoji="🏥" value={stats?.totalFacilities ?? 284}            label="Total Facilities" />
          <StatCard emoji="✅" value={stats?.openNow ?? 217}                    label="Open Now"          accent="#0f766e" />
          <StatCard emoji="⏱️" value={`${stats?.avgWaitMinutes ?? 38}min`}      label="Avg Wait Time"     accent="#d97706" />
          <StatCard emoji="💳" value={stats?.nhisAccepted ?? 198}               label="NHIS Accepted" />
        </div>
      </div>

      {/* ── Active Alerts ── */}
      {activeAlerts.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, color: '#111827', fontSize: F.sectionHead, marginBottom: 'clamp(10px, 1.4vw, 16px)' }}>
            <Warning sx={{ fontSize: F.icon, color: '#dc2626' }} /> Active Alerts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.2vw, 12px)' }}>
            {activeAlerts.map((alert) => (
              <div key={alert.id} style={{
                padding: 'clamp(12px, 1.6vw, 18px)',
                borderRadius: 14,
                background: alert.severity === 'critical' ? '#fff1f2' : '#fffbeb',
                border: `1px solid ${alert.severity === 'critical' ? '#fecdd3' : '#fde68a'}`,
              }}>
                <div style={{ fontWeight: 700, fontSize: F.body, color: alert.severity === 'critical' ? '#be123c' : '#b45309', marginBottom: 6, lineHeight: 1.35 }}>
                  {alert.title}
                </div>
                <Chip
                  label={alert.severity.toUpperCase()}
                  size="small"
                  sx={{ height: 28, fontSize: F.small, fontWeight: 800, background: alert.severity === 'critical' ? '#dc2626' : '#d97706', color: 'white' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Emergency Contacts ── */}
      <div>
        <div style={{ fontWeight: 800, color: '#111827', fontSize: F.sectionHead, marginBottom: 'clamp(10px, 1.4vw, 16px)' }}>
          Emergency Contacts
        </div>
        {[
          { label: 'LASAMBUS Ambulance', number: '767',           icon: '🚑' },
          { label: 'Lagos Health Line',  number: '0800-HEALTH',   icon: '📞' },
          { label: 'NCDC Hotline',       number: '0800-970-0010', icon: '🦠' },
        ].map((c) => (
          <div key={c.label} style={{
            display: 'flex', alignItems: 'center',
            gap: 'clamp(8px, 1.2vw, 14px)',
            padding: 'clamp(8px, 1.2vw, 12px)',
            marginBottom: 8, borderRadius: 12,
            background: '#f9fafb', border: '1px solid #e5e7eb',
          }}>
            <span style={{ fontSize: F.body }}>{c.icon}</span>
            <div>
              <div style={{ fontSize: F.small, color: '#6b7280', fontWeight: 600 }}>{c.label}</div>
              <div style={{ fontSize: F.body, color: '#16a34a', fontWeight: 800 }}>{c.number}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Find Open Now ── */}
      <div style={{
        padding: 'clamp(14px, 1.8vw, 20px)',
        borderRadius: 16,
        background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)',
        border: '1px solid #86efac',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <AccessTime sx={{ fontSize: F.icon, color: '#16a34a' }} />
          <span style={{ fontWeight: 800, fontSize: F.body, color: '#166534' }}>Find Open Now</span>
        </div>
        <p style={{ margin: 0, fontSize: F.small, color: '#15803d', lineHeight: 1.65 }}>
          Use the search filters on the left to find facilities currently open near you.
        </p>
      </div>

    </div>
  );
}

export default memo(HealthcareSidebarRight);
