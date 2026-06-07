import { memo } from 'react';
import { motion } from 'framer-motion';

const F = {
  body: 'clamp(1.3rem, 2vw,   1.64rem)',
  meta: 'clamp(1.2rem, 1.8vw, 1.5rem)',
};

const ACTION_CONFIG = {
  reported:               { label: 'Incident Reported',        icon: '📱' },
  acknowledged:           { label: 'Acknowledged by Officer',  icon: '✅' },
  responding:             { label: 'Officer Responding',       icon: '🚔' },
  on_scene:               { label: 'Officer On Scene',         icon: '🚨' },
  resolved:               { label: 'Incident Resolved',        icon: '✔️' },
  false_alarm_confirmed:  { label: 'False Alarm Confirmed',    icon: '❌' },
  patrol_dispatched:      { label: 'Patrol Dispatched',        icon: '🚗' },
  fire_service_dispatched:{ label: 'Fire Service Dispatched',  icon: '🚒' },
  alert_issued:           { label: 'Security Alert Issued',    icon: '⚠️' },
};

function IncidentTimeline({ timeline = [], compact = false }) {
  if (!timeline.length) return null;

  const iconSize = compact ? 'clamp(26px, 3.2vw, 32px)' : 'clamp(32px, 4vw, 40px)';
  const iconLeft = compact ? 13 : 17;

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: iconLeft, top: 4, bottom: 4, width: 2, backgroundColor: '#ffedd5', zIndex: 0 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {timeline.map((event, i) => {
          const cfg     = ACTION_CONFIG[event.action] || { label: event.action, icon: '•' };
          const dateStr = new Date(event.timestamp).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
          const timeStr = new Date(event.timestamp).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{ display: 'flex', gap: compact ? 12 : 16, alignItems: 'flex-start', paddingBottom: compact ? 12 : 20, position: 'relative' }}
            >
              <div style={{
                width: iconSize, height: iconSize,
                borderRadius: '50%', flexShrink: 0, zIndex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#fff7ed', border: '2px solid #fdba74',
                fontSize: compact ? F.meta : F.body,
              }}>
                {cfg.icon}
              </div>

              <div style={{ flex: 1, paddingTop: compact ? 3 : 5 }}>
                <div style={{ fontSize: compact ? F.meta : F.body, fontWeight: 700, color: '#1f2937', lineHeight: 1.3 }}>
                  {cfg.label}
                </div>
                <div style={{ fontSize: F.meta, color: '#9ca3af', marginTop: 4 }}>
                  {dateStr} · {timeStr}
                  {event.by && event.by !== 'citizen' && (
                    <span style={{ marginLeft: 6, color: '#6b7280' }}>by {event.by}</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(IncidentTimeline);
