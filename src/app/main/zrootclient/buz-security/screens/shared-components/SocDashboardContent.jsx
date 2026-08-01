import { memo, useState, useCallback } from 'react';
import { Chip } from '@mui/material';
import { List, Map } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { CivicLoadingSkeleton, ClienttErrorPage } from '../../../civic-shared';
import IncidentMap from '../../components/IncidentMap';
import IncidentCard from '../../components/IncidentCard';
import { SECURITY_STATS } from '../../mock';

const F = {
  body:    'clamp(1.3rem,  2vw,   1.64rem)',
  meta:    'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:     'clamp(1.3rem,  2vw,   1.56rem)',
  subH:    'clamp(1.4rem,  2.2vw, 1.8rem)',
  sectionH:'clamp(2rem,    4vw,   3.4rem)',
};

const NIGERIA_CENTER = [9.082, 8.6753];


function SocDashboardContent({ incidents, isLoading, isError, stats }) {
  const [view, setView]                         = useState('map');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const s = stats || SECURITY_STATS;

  const handleSelectIncident = useCallback((i) => setSelectedIncident(i), []);
  const handleCloseDrawer    = useCallback(() => setSelectedIncident(null), []);

  if (isLoading) return <div style={{ background: '#0f172a', flex: 1 }}><CivicLoadingSkeleton message="Loading security operations data..." cardCount={3} /></div>;
  if (isError) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#0f172a' }}>
        <ClienttErrorPage message="Error loading security data." />
      </motion.div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', minHeight: '100vh', background: '#0f172a', color: 'white', overflow: 'hidden' }}>

      {/* ── Ops stats bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'clamp(10px, 1.6vw, 16px) clamp(16px, 2.4vw, 28px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 'clamp(16px, 3vw, 28px)', flexWrap: 'wrap' }}>
          {[
            { label: 'Total',      value: s.totalReported,       color: 'rgba(255,255,255,0.85)' },
            { label: 'Active',     value: s.activeIncidents,     color: '#f87171' },
            { label: 'Responding', value: s.respondingIncidents, color: '#fbbf24' },
            { label: 'Resolved',   value: s.resolvedToday,       color: '#4ade80' },
            { label: 'Critical',   value: s.criticalCount,       color: '#ef4444' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 900, color: item.color, lineHeight: 1 }}>{item.value}</span>
              <span style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.4)' }}>View:</span>
          <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            {[{ v: 'map', Icon: Map, label: 'Map' }, { v: 'list', Icon: List, label: 'List' }].map(({ v, Icon, label }) => (
              <button key={v} onClick={() => setView(v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: 'clamp(6px, 1vw, 10px) clamp(12px, 1.8vw, 18px)',
                  border: 'none', cursor: 'pointer', fontSize: F.btn, fontWeight: 700,
                  backgroundColor: view === v ? '#ea580c' : 'transparent',
                  color: view === v ? 'white' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s',
                }}>
                <Icon style={{ fontSize: 'clamp(16px, 2vw, 20px)' }} /> {label}
              </button>
            ))}
          </div>
          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Chip label="● LIVE" size="small"
              style={{ fontSize: F.meta }}
              sx={{ backgroundColor: 'rgba(22,163,74,0.2)', color: '#4ade80', fontWeight: 800, border: '1px solid rgba(22,163,74,0.4)', height: 'clamp(22px, 2.8vw, 30px)', '& .MuiChip-label': { fontSize: F.meta } }} />
          </motion.div>
        </div>
      </div>

      {/* ── Main view ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 500 }}>
        <AnimatePresence mode="wait">
          {view === 'map' ? (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0 }}>
              <IncidentMap incidents={incidents || []} center={NIGERIA_CENTER} zoom={6} dark height="100%" onIncidentClick={handleSelectIncident} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, padding: 'clamp(16px, 2.4vw, 28px)', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,380px),1fr))', gap: 'clamp(14px, 2vw, 22px)', alignContent: 'start' }}>
              {(incidents || []).map((incident, i) => (
                <IncidentCard key={incident.id} incident={incident} index={i} onSelect={handleSelectIncident} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Incident detail drawer */}
        <AnimatePresence>
          {selectedIncident && (
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'absolute', top: 0, right: 0, bottom: 0,
                width: 'min(420px, 100%)',
                background: '#1e293b', borderLeft: '1px solid rgba(255,255,255,0.1)',
                zIndex: 1000, overflowY: 'auto', padding: 'clamp(18px, 2.8vw, 28px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(14px, 2vw, 22px)' }}>
                <div style={{ fontWeight: 800, color: 'white', fontSize: F.subH }}>Incident Details</div>
                <button onClick={handleCloseDrawer}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 'clamp(1.3rem, 2vw, 1.6rem)', lineHeight: 1 }}>✕</button>
              </div>
              <IncidentCard incident={selectedIncident} index={0} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default memo(SocDashboardContent);
