import { memo, useState } from 'react';
import { Button, Divider, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { FilterList, Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { JurisdictionSelector } from '../../../civic-shared';
import { INCIDENT_CATEGORIES, SEVERITY_CONFIG } from '../../mock';

const F = {
  meta: 'clamp(1.2rem, 1.8vw, 1.5rem)',
  body: 'clamp(1.3rem, 2vw,   1.64rem)',
  btn:  'clamp(1.3rem, 2vw,   1.56rem)',
  subH: 'clamp(1.4rem, 2.2vw, 1.8rem)',
};

// values match soc-service's real IncidentStatus enum (lowercase here for
// local highlight-matching; useIncidents uppercases before calling the API)
const STATUS_OPTIONS = [
  { value: '',             label: 'All'          },
  { value: 'reported',     label: 'Reported'     },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'assigned',     label: 'Assigned'     },
  { value: 'in_response',  label: 'In Response'  },
  { value: 'resolved',     label: 'Resolved'     },
  { value: 'closed',       label: 'Closed'       },
];

const NAV_LINKS = [
  { label: 'SOC Dashboard',  path: '/security/soc/dashboard',   icon: '🛡️' },
  { label: 'My Reports',     path: '/security/my-reports',      icon: '📋' },
  { label: 'Report Incident',path: '/security/report-incident', icon: '🚨' },
];

function SocDashboardSidebarLeft({ onFilterChange }) {
  const location = useLocation();
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [status,   setStatus]   = useState('');

  const handleApply = () => onFilterChange?.({ category, severity, status });
  const handleReset = () => { setCategory(''); setSeverity(''); setStatus(''); onFilterChange?.({}); };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      padding: 'clamp(14px, 2vw, 20px)', overflowY: 'auto',
      background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)',
    }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'clamp(14px, 2vw, 22px)' }}>
        <div style={{ width: 'clamp(32px, 4vw, 40px)', height: 'clamp(32px, 4vw, 40px)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#dc2626,#991b1b)' }}>
          <FilterList style={{ color: 'white', fontSize: 'clamp(16px, 2vw, 20px)' }} />
        </div>
        <div style={{ fontWeight: 800, fontSize: F.subH, color: 'white' }}>Filter Incidents</div>
      </div>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2.5 }} />

      {/* ── Category ── */}
      <div style={{ marginBottom: 'clamp(14px, 2vw, 22px)' }}>
        <div style={{ fontWeight: 700, fontSize: F.meta, color: 'rgba(255,255,255,0.45)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
          Category
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <button onClick={() => setCategory('')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: 'clamp(8px, 1.2vw, 12px) clamp(10px, 1.4vw, 14px)',
              borderRadius: 10, cursor: 'pointer', width: '100%', textAlign: 'left',
              backgroundColor: !category ? 'rgba(220,38,38,0.18)' : 'transparent',
              border: `1.5px solid ${!category ? '#dc2626' : 'transparent'}`,
              color: !category ? '#f87171' : 'rgba(255,255,255,0.7)',
              fontWeight: !category ? 700 : 500, fontSize: F.body,
            }}>
            🌍 All Categories
          </button>
          {INCIDENT_CATEGORIES.map((cat) => (
            <motion.button key={cat.id} whileTap={{ scale: 0.98 }}
              onClick={() => setCategory(cat.id === category ? '' : cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: 'clamp(8px, 1.2vw, 12px) clamp(10px, 1.4vw, 14px)',
                borderRadius: 10, cursor: 'pointer', width: '100%', textAlign: 'left',
                backgroundColor: category === cat.id ? `${cat.color}20` : 'transparent',
                border: `1.5px solid ${category === cat.id ? cat.color : 'transparent'}`,
                color: category === cat.id ? cat.color : 'rgba(255,255,255,0.7)',
                fontWeight: category === cat.id ? 700 : 500, fontSize: F.body,
              }}>
              <span style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.5rem)' }}>{cat.icon}</span>
              {cat.label}
            </motion.button>
          ))}
        </div>
      </div>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2.5 }} />

      {/* ── Severity ── */}
      <div style={{ marginBottom: 'clamp(14px, 2vw, 22px)' }}>
        <div style={{ fontWeight: 700, fontSize: F.meta, color: 'rgba(255,255,255,0.45)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
          Severity
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[{ value: '', label: 'All Severities', color: 'rgba(255,255,255,0.6)', dot: null },
            ...Object.entries(SEVERITY_CONFIG).map(([k, v]) => ({ value: k, label: v.label, color: v.color, dot: v.color }))
          ].map((opt) => (
            <button key={opt.value} onClick={() => setSeverity(opt.value === severity ? '' : opt.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: 'clamp(8px, 1.2vw, 12px) clamp(10px, 1.4vw, 14px)',
                borderRadius: 10, cursor: 'pointer', textAlign: 'left', width: '100%',
                backgroundColor: severity === opt.value ? `${opt.color}20` : 'transparent',
                border: `1.5px solid ${severity === opt.value ? opt.color : 'transparent'}`,
              }}>
              {opt.dot && <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: opt.dot, flexShrink: 0 }} />}
              <span style={{ fontSize: F.body, fontWeight: severity === opt.value ? 700 : 500, color: severity === opt.value ? opt.color : 'rgba(255,255,255,0.7)' }}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2.5 }} />

      {/* ── Status ── */}
      <div style={{ marginBottom: 'clamp(16px, 2.4vw, 26px)' }}>
        <div style={{ fontWeight: 700, fontSize: F.meta, color: 'rgba(255,255,255,0.45)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
          Status
        </div>
        <ToggleButtonGroup value={status} exclusive onChange={(_, v) => setStatus(v ?? '')} orientation="vertical"
          sx={{ width: '100%', gap: 0.5 }}>
          {STATUS_OPTIONS.map((opt) => (
            <ToggleButton key={opt.value} value={opt.value}
              style={{ fontSize: F.body }}
              sx={{
                width: '100%', justifyContent: 'flex-start',
                borderRadius: '10px !important', border: '1.5px solid rgba(255,255,255,0.08) !important',
                textTransform: 'none', fontWeight: 600, py: 1.2,
                color: 'rgba(255,255,255,0.65)',
                '&.Mui-selected': { backgroundColor: 'rgba(220,38,38,0.18)', color: '#f87171', borderColor: '#dc2626 !important' },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
                '& .MuiToggleButton-root': { fontSize: F.body },
              }}>
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2.5 }} />

      {/* ── Quick navigation ── */}
      <div style={{ marginBottom: 'clamp(14px, 2vw, 20px)' }}>
        <div style={{ fontWeight: 700, fontSize: F.meta, color: 'rgba(255,255,255,0.45)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
          Quick Nav
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.4vw, 14px)',
                  padding: 'clamp(9px, 1.3vw, 13px) clamp(12px, 1.6vw, 16px)',
                  borderRadius: 10, textDecoration: 'none',
                  fontSize: F.body, fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? 'rgba(220,38,38,0.18)' : 'transparent',
                  border: `1.5px solid ${isActive ? '#dc2626' : 'transparent'}`,
                  color: isActive ? '#f87171' : 'rgba(255,255,255,0.7)',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}
              >
                <span style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.5rem)', lineHeight: 1 }}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
        <Button fullWidth variant="contained" onClick={handleApply}
          style={{ fontSize: F.btn }}
          sx={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)', color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', py: 1.5, '&:hover': { background: 'linear-gradient(135deg,#b91c1c,#7f1d1d)' } }}>
          Apply Filters
        </Button>
        <Button fullWidth variant="outlined" startIcon={<Refresh style={{ fontSize: 'clamp(16px, 2vw, 20px)' }} />} onClick={handleReset}
          style={{ fontSize: F.btn }}
          sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', fontWeight: 600, borderRadius: '12px', textTransform: 'none', py: 1.25, '&:hover': { borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.04)' } }}>
          Clear All
        </Button>
      </div>
    </div>
  );
}

export default memo(SocDashboardSidebarLeft);
