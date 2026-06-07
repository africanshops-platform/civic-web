import { memo } from 'react';
import { Button } from '@mui/material';
import { LocationOn, AccessTime, ArrowForward, Person } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SeverityBadge from './SeverityBadge';
import { INCIDENT_CATEGORIES, STATUS_CONFIG } from '../mock';

const F = {
  title: 'clamp(1.44rem, 2.4vw, 1.96rem)',
  body:  'clamp(1.3rem,  2vw,   1.64rem)',
  meta:  'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:   'clamp(1.3rem,  2vw,   1.56rem)',
};

function IncidentCard({ incident, index = 0, compact = false, onSelect }) {
  const navigate = useNavigate();
  if (!incident) return null;

  const catInfo    = INCIDENT_CATEGORIES.find((c) => c.id === incident.category);
  const statusInfo = STATUS_CONFIG[incident.status] || STATUS_CONFIG.active;

  const timeAgo = (() => {
    const diff = Math.floor((new Date() - new Date(incident.reportedAt)) / 60000);
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
  })();

  /* ── COMPACT variant (right-sidebar triage queue) ── */
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.06, duration: 0.3 }}
        onClick={() => onSelect?.(incident)}
        style={{
          display: 'flex', gap: 'clamp(10px, 1.4vw, 14px)', alignItems: 'flex-start',
          padding: 'clamp(10px, 1.4vw, 14px)', borderRadius: 14, cursor: 'pointer',
          backgroundColor: 'transparent', border: '1px solid transparent',
          transition: 'all 0.2s',
        }}
        whileHover={{ backgroundColor: 'rgba(234,88,12,0.08)', borderColor: 'rgba(234,88,12,0.3)' }}
      >
        <div style={{
          width: 'clamp(36px, 5vw, 46px)', height: 'clamp(36px, 5vw, 46px)',
          borderRadius: 12, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: catInfo?.bg || '#f3f4f6', fontSize: 'clamp(1.2rem, 1.8vw, 1.5rem)',
        }}>
          {catInfo?.icon || '⚠️'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: F.body, color: 'white', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {catInfo?.label} · {incident.location.lga}
          </div>
          <div style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.5)' }}>{timeAgo}</div>
        </div>
        <SeverityBadge severity={incident.severity} size="sm" pulse />
      </motion.div>
    );
  }

  /* ── FULL variant ── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.38 }}
      data-testid="incident-card"
      style={{ backgroundColor: 'white', borderRadius: 'clamp(14px, 2vw, 20px)', overflow: 'hidden', border: '1px solid #f3f4f6', boxShadow: '0 2px 14px rgba(0,0,0,0.07)' }}
    >
      <div style={{ height: 5, width: '100%', backgroundColor: catInfo?.color || '#6b7280' }} />

      <div style={{ padding: 'clamp(16px, 2.4vw, 28px)' }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'clamp(10px, 1.4vw, 16px)', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.4vw, 14px)' }}>
            <div style={{
              width: 'clamp(42px, 5.5vw, 54px)', height: 'clamp(42px, 5.5vw, 54px)',
              borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: catInfo?.bg || '#f3f4f6',
              fontSize: 'clamp(1.3rem, 2vw, 1.6rem)', flexShrink: 0,
            }}>
              {catInfo?.icon || '⚠️'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: F.title, color: '#1f2937', lineHeight: 1.3 }}>
                {catInfo?.label || incident.category}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                <LocationOn style={{ fontSize: 'clamp(14px, 1.8vw, 18px)', color: '#ea580c' }} />
                <span style={{ fontSize: F.meta, color: '#6b7280' }}>{incident.location.address}</span>
              </div>
            </div>
          </div>
          <SeverityBadge severity={incident.severity} size="md" pulse />
        </div>

        {/* Description */}
        <div style={{
          fontSize: F.body, color: '#4b5563', lineHeight: 1.7,
          marginBottom: 'clamp(14px, 2vw, 22px)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {incident.description}
        </div>

        {/* Meta + actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 1.8vw, 18px)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <AccessTime style={{ fontSize: 'clamp(14px, 1.8vw, 18px)', color: '#9ca3af' }} />
              <span style={{ fontSize: F.meta, color: '#9ca3af' }}>{timeAgo}</span>
            </div>
            {incident.reportedBy?.name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Person style={{ fontSize: 'clamp(14px, 1.8vw, 18px)', color: '#9ca3af' }} />
                <span style={{ fontSize: F.meta, color: '#9ca3af' }}>{incident.reportedBy.name}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              backgroundColor: statusInfo.bg, color: statusInfo.color,
              fontWeight: 700, fontSize: F.meta,
              padding: 'clamp(3px, 0.5vw, 5px) clamp(10px, 1.6vw, 14px)', borderRadius: 999,
            }}>
              {statusInfo.label}
            </span>
            <Button
              size="small"
              endIcon={<ArrowForward style={{ fontSize: 'clamp(14px, 1.8vw, 18px)' }} />}
              onClick={() => onSelect ? onSelect(incident) : navigate(`/security/reports/${incident.id}/view`)}
              style={{ fontSize: F.btn }}
              sx={{ color: '#ea580c', fontWeight: 700, textTransform: 'none', borderRadius: '10px', px: 1.5, '&:hover': { backgroundColor: '#fff7ed' } }}
            >
              Details
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(IncidentCard);
