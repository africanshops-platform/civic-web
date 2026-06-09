import { useState, useMemo } from 'react';
import { Typography, Button, Chip, Fab } from '@mui/material';
import { Shield, Add } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from "app/store/hooks";
// import Logo from "app/theme-layouts/shared-components/Logo";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { Link } from 'react-router-dom';
import IncidentMap from '../components/IncidentMap';
import IncidentCard from '../components/IncidentCard';
import { mockIncidents, INCIDENT_CATEGORIES, SECURITY_STATS } from '../mock';

const NIGERIA_CENTER = [9.082, 8.6753];

// ─── Responsive font helpers ─────────────────────────────────────────────────
const F = {
  pageTitle:   'clamp(1.5rem, 3.5vw, 2.6rem)',
  subtitle:    'clamp(1rem,   1.8vw, 1.35rem)',
  filterBtn:   'clamp(0.95rem,1.5vw, 1.1rem)',
  statNum:     'clamp(2rem,   4vw,   3.2rem)',
  statLabel:   'clamp(0.78rem,1.3vw, 0.95rem)',
  panelTitle:  'clamp(1.3rem, 2.5vw, 1.8rem)',
  panelBody:   'clamp(0.98rem,1.6vw, 1.2rem)',
  btnPrimary:  'clamp(1rem,   1.7vw, 1.15rem)',
  disclaimer:  'clamp(0.88rem,1.3vw, 1rem)',
  badgeLabel:  'clamp(0.8rem, 1.2vw, 0.92rem)',
};

export default function SecurityMapPublicPage() {
   const user = useAppSelector(selectUser);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeFilter,     setActiveFilter]     = useState('');

  const publicIncidents = useMemo(
    () => mockIncidents.filter((i) => i.severity !== 'critical' && i.status !== 'resolved'),
    []
  );
  const filtered = activeFilter
    ? publicIncidents.filter((i) => i.category === activeFilter)
    : publicIncidents;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '100%',
      height: 'calc(100vh - 64px)', backgroundColor: '#0f172a',
      overflow: 'hidden', position: 'relative',
    }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'clamp(12px,2vw,20px) clamp(16px,3vw,32px)',
        background: 'rgba(15,23,42,0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 10, flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px,2vw,18px)' }}>
          <div style={{
            width: 'clamp(40px,5vw,52px)', height: 'clamp(40px,5vw,52px)',
            borderRadius: 'clamp(10px,1.5vw,14px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg,#dc2626,#991b1b)', flexShrink: 0,
            boxShadow: '0 6px 18px rgba(220,38,38,0.45)',
          }}>
            <Shield sx={{ color: 'white', fontSize: 'clamp(1.3rem,2.5vw,1.75rem)' }} />
          </div>
          <div>
            <Typography sx={{ fontWeight: 900, color: 'white', fontSize: F.pageTitle, lineHeight: 1.2 }}>
              Community Security Map
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: F.subtitle, mt: 0.3 }}>
              {filtered.length} active incidents · Nigeria
            </Typography>
          </div>
          <motion.div animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 2.2, repeat: Infinity }}>
            <Chip label="● LIVE" size="small"
              sx={{ backgroundColor: 'rgba(22,163,74,0.2)', color: '#4ade80', fontWeight: 800, fontSize: F.badgeLabel, border: '1px solid rgba(22,163,74,0.4)', height: 28 }} />
          </motion.div>
        </div>

        <Button component={Link} to="/sign-in" variant="contained"
          sx={{
            background: 'linear-gradient(135deg,#dc2626,#991b1b)',
            color: 'white', fontWeight: 700, borderRadius: '14px',
            textTransform: 'none', fontSize: F.btnPrimary,
            px: { xs: 2.5, sm: 3.5 }, py: { xs: 1.2, sm: 1.4 },
            boxShadow: '0 6px 18px rgba(220,38,38,0.38)',
            '&:hover': { background: 'linear-gradient(135deg,#b91c1c,#7f1d1d)', transform: 'translateY(-1px)' },
          }}>
          Sign In for Full Access
        </Button>
      </div>

      {/* ── Category filter strip ── */}
      <div style={{
        padding: 'clamp(8px,1.5vw,14px) clamp(16px,3vw,32px)',
        background: 'rgba(15,23,42,0.96)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', gap: 'clamp(8px,1.5vw,14px)',
        overflowX: 'auto', zIndex: 9,
        scrollbarWidth: 'none',
      }}>
        {/* "All" pill */}
        <button onClick={() => setActiveFilter('')} style={{
          padding: 'clamp(6px,1.2vw,10px) clamp(14px,2.5vw,22px)', borderRadius: 999,
          border: `2px solid ${!activeFilter ? '#ea580c' : 'rgba(255,255,255,0.15)'}`,
          backgroundColor: !activeFilter ? 'rgba(234,88,12,0.2)' : 'transparent',
          color: !activeFilter ? '#ea580c' : 'rgba(255,255,255,0.65)',
          fontWeight: 700, fontSize: F.filterBtn, cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
          All
        </button>

        {INCIDENT_CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setActiveFilter(cat.id === activeFilter ? '' : cat.id)} style={{
            padding: 'clamp(6px,1.2vw,10px) clamp(14px,2.5vw,22px)', borderRadius: 999,
            border: `2px solid ${activeFilter === cat.id ? cat.color : 'rgba(255,255,255,0.15)'}`,
            backgroundColor: activeFilter === cat.id ? `${cat.color}22` : 'transparent',
            color: activeFilter === cat.id ? cat.color : 'rgba(255,255,255,0.65)',
            fontWeight: 700, fontSize: F.filterBtn, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            <span style={{ marginRight: 6 }}>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Map ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <IncidentMap
          incidents={filtered}
          center={NIGERIA_CENTER}
          zoom={6}
          dark
          height="100%"
          publicView
          onIncidentClick={setSelectedIncident}
        />

        {/* Stats overlay — top-left */}
        <div style={{ position: 'absolute', top: 'clamp(12px,2vw,20px)', left: 'clamp(12px,2vw,20px)', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Active',       value: SECURITY_STATS.activeIncidents, color: '#f87171', bg: 'rgba(220,38,38,0.88)' },
            { label: 'Avg Response', value: SECURITY_STATS.avgResponseTime, color: 'white',   bg: 'rgba(15,23,42,0.9)'  },
          ].map((item) => (
            <div key={item.label} style={{
              padding: 'clamp(10px,1.8vw,16px) clamp(14px,2.5vw,22px)',
              borderRadius: 'clamp(10px,1.5vw,14px)',
              background: item.bg, backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 4px 18px rgba(0,0,0,0.3)',
            }}>
              <div style={{ fontSize: F.statNum, fontWeight: 900, color: item.color, lineHeight: 1 }}>{item.value}</div>
              <div style={{ fontSize: F.statLabel, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Report FAB */}
        <div style={{ position: 'absolute', bottom: 'clamp(20px,3vw,32px)', right: 'clamp(20px,3vw,32px)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
            <Fab component={Link} to="/sign-in" size="large"
              sx={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)', color: 'white', width: 'clamp(52px,6vw,68px)', height: 'clamp(52px,6vw,68px)', boxShadow: '0 10px 28px rgba(220,38,38,0.55)', '&:hover': { background: 'linear-gradient(135deg,#b91c1c,#7f1d1d)' } }}>
              <Add sx={{ fontSize: 'clamp(1.5rem,2.5vw,2rem)' }} />
            </Fab>
          </motion.div>
          <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: F.statLabel, fontWeight: 700, letterSpacing: '0.1em' }}>REPORT</span>
        </div>

        {/* Incident detail slide-in panel */}
        <AnimatePresence>
          {selectedIncident && (
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              style={{
                position: 'absolute', top: 0, right: 0, bottom: 0,
                width: 'clamp(300px,38vw,440px)',
                background: '#1e293b',
                borderLeft: '1px solid rgba(255,255,255,0.1)',
                zIndex: 1001, overflowY: 'auto',
                padding: 'clamp(18px,2.5vw,28px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(16px,2vw,24px)' }}>
                <Typography sx={{ fontWeight: 900, color: 'white', fontSize: F.panelTitle }}>Incident</Typography>
                <button onClick={() => setSelectedIncident(null)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 'clamp(1.4rem,2.5vw,1.8rem)', lineHeight: 1, padding: 4 }}>
                  ✕
                </button>
              </div>

              <IncidentCard incident={selectedIncident} />

              {/* Sign-in nudge */}



              <div style={{
                marginTop: 'clamp(16px,2vw,24px)',
                padding: 'clamp(14px,2vw,20px)',
                borderRadius: 'clamp(12px,1.5vw,16px)',
                background: 'rgba(234,88,12,0.12)',
                border: '1px solid rgba(234,88,12,0.3)',
              }}>
                {user?.email ? (
                 <Button component={Link} to="/security/soc/dashboard" fullWidth variant="contained"
                      sx={{
                        mt: 2, background: 'linear-gradient(135deg,#dc2626,#991b1b)',
                        color: 'white', fontWeight: 700, borderRadius: '12px',
                        textTransform: 'none', fontSize: F.btnPrimary,
                        py: { xs: 1.3, sm: 1.5 },
                      }}>
                      SOC Dashboard
                    </Button>
                ) : (
                  <div>
                    <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: F.panelBody, lineHeight: 1.7 }}>
                      Sign in to see the full response timeline, assigned officers, and to report nearby incidents.
                    </Typography>
                    <Button component={Link} to="/sign-in" fullWidth variant="contained"
                      sx={{
                        mt: 2, background: 'linear-gradient(135deg,#dc2626,#991b1b)',
                        color: 'white', fontWeight: 700, borderRadius: '12px',
                        textTransform: 'none', fontSize: F.btnPrimary,
                        py: { xs: 1.3, sm: 1.5 },
                      }}>
                      Sign In
                    </Button>
                  </div>
                )}
                
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Disclaimer footer */}
      <div style={{
        padding: 'clamp(8px,1.5vw,12px) clamp(16px,3vw,32px)',
        background: 'rgba(15,23,42,0.98)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <Typography sx={{ fontSize: F.disclaimer, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
          ⚠️ Critical incidents are hidden from the public map. Sign in for full SOC access.
          Emergency:{' '}
          <strong style={{ color: 'rgba(255,255,255,0.55)' }}>112</strong>
          {' '}/{' '}
          <strong style={{ color: 'rgba(255,255,255,0.55)' }}>199</strong>
        </Typography>
      </div>
    </div>
  );
}
