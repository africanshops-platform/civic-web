import { memo } from 'react';
import { Divider } from '@mui/material';
import { Shield, Warning, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import IncidentCard from '../../components/IncidentCard';
import { SECURITY_STATS } from '../../mock';

const F = {
  meta:    'clamp(1.2rem, 1.8vw, 1.5rem)',
  body:    'clamp(1.3rem, 2vw,   1.64rem)',
  subH:    'clamp(1.4rem, 2.2vw, 1.8rem)',
  sectionH:'clamp(2rem,   4vw,   3.4rem)',
};

function SocDashboardSidebarRight({ incidents = [], stats }) {
  const s = stats || SECURITY_STATS;

  const criticalActive = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved');
  const activeQueue    = incidents
    .filter((i) => i.status === 'active' || i.status === 'responding')
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)' }}>

      {/* ── Critical alert banner ── */}
      {criticalActive.length > 0 && (
        <motion.div
          animate={{ opacity: [1, 0.65, 1] }} transition={{ duration: 2.2, repeat: Infinity }}
          style={{ margin: 'clamp(12px, 1.6vw, 16px)', padding: 'clamp(12px, 1.6vw, 16px)', borderRadius: 14, background: 'rgba(220,38,38,0.18)', border: '1.5px solid rgba(220,38,38,0.5)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Warning style={{ color: '#f87171', fontSize: 'clamp(18px, 2.2vw, 22px)' }} />
            <div style={{ fontWeight: 800, color: '#f87171', fontSize: F.subH }}>
              {criticalActive.length} CRITICAL INCIDENT{criticalActive.length > 1 ? 'S' : ''} ACTIVE
            </div>
          </div>
          {criticalActive.map((i) => (
            <div key={i.id} style={{ fontSize: F.body, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              • {i.location.address}
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Quick stats grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 'clamp(12px, 1.6vw, 16px) clamp(12px, 1.6vw, 16px) 0' }}>
        {[
          { label: 'Active',         value: s.activeIncidents,     accent: true  },
          { label: 'Responding',     value: s.respondingIncidents, accent: false },
          { label: 'Resolved Today', value: s.resolvedToday,       accent: false },
          { label: 'Avg Response',   value: s.avgResponseTime,     accent: false },
        ].map((item) => (
          <div key={item.label} style={{
            padding: 'clamp(12px, 1.6vw, 16px)',
            borderRadius: 14,
            backgroundColor: item.accent ? 'rgba(220,38,38,0.18)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${item.accent ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.08)'}`,
          }}>
            <div style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ fontSize: F.sectionH, fontWeight: 900, color: item.accent ? '#f87171' : 'white', lineHeight: 1 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2.5, mx: 2 }} />

      {/* ── Triage queue ── */}
      <div style={{ padding: '0 clamp(12px, 1.6vw, 16px)', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'clamp(10px, 1.4vw, 16px)' }}>
          <Shield style={{ color: '#ea580c', fontSize: 'clamp(18px, 2.2vw, 22px)' }} />
          <div style={{ fontWeight: 700, fontSize: F.subH, color: 'white' }}>Triage Queue</div>
          {activeQueue.length > 0 && (
            <span style={{ backgroundColor: '#dc2626', color: 'white', borderRadius: 999, fontSize: F.meta, fontWeight: 800, padding: 'clamp(2px, 0.4vw, 4px) clamp(8px, 1.2vw, 12px)', marginLeft: 'auto' }}>
              {activeQueue.length}
            </span>
          )}
        </div>

        {activeQueue.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'clamp(20px, 3vw, 32px) 16px' }}>
            <CheckCircle style={{ color: '#16a34a', fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: F.body }}>
              All clear — no active incidents
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activeQueue.map((incident, i) => (
              <IncidentCard key={incident.id} incident={incident} index={i} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(SocDashboardSidebarRight);
