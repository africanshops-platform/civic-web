import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Button, CircularProgress, TextField } from '@mui/material';
import { Shield, Send, ArrowBack, MyLocation, CheckCircle, LocationOn, Edit } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useReportIncident } from '../hooks/useSecurityRepo';
import SecurityHeader from './shared-components/SecurityHeader';
import SocDashboardSidebarLeft from './shared-components/SocDashboardSidebarLeft';
import SocDashboardSidebarRight from './shared-components/SocDashboardSidebarRight';

/* ── constants ─────────────────────────────────────────────────────────────── */
const NIGERIA_CENTER = [9.082, 8.6753];

const F = {
  body:     'clamp(1.3rem,  2vw,   1.64rem)',
  meta:     'clamp(1.2rem,  1.8vw, 1.5rem)',
  btn:      'clamp(1.3rem,  2vw,   1.56rem)',
  sectionH: 'clamp(2rem,    4vw,   3.4rem)',
  subH:     'clamp(1.4rem,  2.2vw, 1.8rem)',
};

const INPUT_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    '& fieldset':             { borderColor: 'rgba(255,255,255,0.18)' },
    '&:hover fieldset':       { borderColor: '#dc2626' },
    '&.Mui-focused fieldset': { borderColor: '#dc2626' },
  },
  '& .MuiInputBase-input, & .MuiInputBase-inputMultiline': { color: 'white', fontSize: F.body },
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.55)', fontSize: F.body,
    '&.Mui-focused': { color: '#f87171' },
  },
};

const Root = styled(FusePageSimpleWithMargin)(() => ({
  '& .FusePageSimple-header':  { backgroundColor: '#0f172a', borderBottomWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.08)' },
  '& .FusePageSimple-sidebar': { backgroundColor: '#0f172a' },
  '& .FusePageSimple-content': { backgroundColor: '#0f172a' },
}));

const REPORT_CATEGORIES = [
  { id: 'THEFT',             label: 'Theft / Robbery',   icon: '🔫', color: '#dc2626', bg: '#450a0a' },
  { id: 'ASSAULT',           label: 'Assault',           icon: '🥊', color: '#f87171', bg: '#3f0a0a' },
  { id: 'FIRE',              label: 'Fire Outbreak',     icon: '🔥', color: '#f97316', bg: '#1c0f00' },
  { id: 'FLOOD',             label: 'Flood',             icon: '🌊', color: '#38bdf8', bg: '#082032' },
  { id: 'ACCIDENT',          label: 'Road Accident',     icon: '🚗', color: '#60a5fa', bg: '#0a1a3a' },
  { id: 'MEDICAL_EMERGENCY', label: 'Medical Emergency', icon: '🚑', color: '#34d399', bg: '#002016' },
  { id: 'CIVIL_UNREST',      label: 'Civil Unrest',      icon: '📢', color: '#fbbf24', bg: '#1c1000' },
  { id: 'OTHER',             label: 'Other',             icon: '⚠️', color: '#9ca3af', bg: '#1a1a1a' },
];

/* ── Custom pin icon (avoids Vite broken default-icon paths) ─────────────── */
const PIN_ICON = L.divIcon({
  className: '',
  html: `<div style="
    width:22px;height:22px;
    background:linear-gradient(135deg,#dc2626,#991b1b);
    border:3px solid white;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    box-shadow:0 4px 14px rgba(220,38,38,0.65);
  "></div>`,
  iconSize:   [22, 22],
  iconAnchor: [11, 22],
});

/* ── GPS accuracy source label ───────────────────────────────────────────── */
function deriveSource(accuracy) {
  if (accuracy <= 10)   return 'gps / fine';
  if (accuracy <= 50)   return 'gps assisted';
  if (accuracy <= 300)  return 'wifi / cell';
  if (accuracy <= 2000) return 'wifi / coarse';
  return 'ip / very coarse';
}

/* ── Nominatim reverse geocoding (free, OpenStreetMap) ───────────────────── */
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address || {};
    return {
      displayName: data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      state: addr.state || addr.region || '',
      lga:   addr.county || addr.city_district || addr.city || addr.town || addr.village || addr.suburb || '',
    };
  } catch {
    return { displayName: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, state: '', lga: '' };
  }
}

/* ── MapResizer — forces Leaflet to recalculate tile layout after mount ──── */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 120);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

/* ── MapPanner — pans/zooms without remounting the map ──────────────────── */
function MapPanner({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (map && coords) map.setView([coords.lat, coords.lng], 16);
  }, [map, coords]);
  return null;
}

/* ── MapClickHandler — captures click coordinates ────────────────────────── */
function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) { onPick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

/* ── LocationPickerMap — stable, never re-mounts on form state changes ───── */
const LocationPickerMap = memo(function LocationPickerMap({ pinCoords, onPick }) {
  return (
    <MapContainer
      center={NIGERIA_CENTER}
      zoom={6}
      style={{ height: 'clamp(260px, 38vw, 400px)', width: '100%' }}
      scrollWheelZoom
    >
      <MapResizer />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <MapClickHandler onPick={onPick} />
      <MapPanner coords={pinCoords} />
      {pinCoords && (
        <Marker
          position={[pinCoords.lat, pinCoords.lng]}
          icon={PIN_ICON}
          draggable
          eventHandlers={{
            dragend(e) {
              const { lat, lng } = e.target.getLatLng();
              onPick(lat, lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
});

/* ── Main page ──────────────────────────────────────────────────────────── */
function ActiveReportIncidentPage() {
  const navigate  = useNavigate();
  const isMobile  = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen,  setLeftSidebarOpen]  = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const { mutate: submitReport, isLoading, isSuccess } = useReportIncident();

  /* form state */
  const [category,    setCategory]    = useState('');
  const [description, setDescription] = useState('');
  const [pinCoords,   setPinCoords]   = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [stateVal,    setStateVal]    = useState('');
  const [lgaVal,      setLgaVal]      = useState('');
  const [geoLoading,  setGeoLoading]  = useState(false);
  const [geoError,    setGeoError]    = useState('');
  const [geoAccuracy, setGeoAccuracy] = useState(null); // metres from GPS; null = map pick
  const [geoSource,   setGeoSource]   = useState('');

  /* validation */
  const [catError, setCatError] = useState('');
  const [locError, setLocError] = useState('');
  const [jxError,  setJxError]  = useState('');

  /* Shared geocode-and-apply: call Nominatim, then update all location state */
  const applyGeocode = useCallback(async (lat, lng) => {
    setGeoLoading(true);
    setLocError('');
    setJxError('');
    const geo = await reverseGeocode(lat, lng);
    setPinCoords({ lat, lng });
    setDisplayName(geo.displayName);
    setStateVal(geo.state);
    setLgaVal(geo.lga);
    setGeoLoading(false);
  }, []);

  /* Map tap / marker drag — clears GPS accuracy (no accuracy data for manual picks) */
  const handleMapPick = useCallback((lat, lng) => {
    setGeoAccuracy(null);
    setGeoSource('');
    applyGeocode(lat, lng);
  }, [applyGeocode]);

  /* GPS button */
  const handleBrowserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported. Tap the map to pin your location.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const acc = pos.coords.accuracy;
        setGeoAccuracy(acc);
        setGeoSource(deriveSource(acc));
        applyGeocode(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setGeoLoading(false);
        setGeoError('Could not detect GPS location. Please tap the map to pin your location.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [applyGeocode]);

  const handleSubmit = useCallback(() => {
    let valid = true;
    if (!category)  { setCatError('Please select the type of incident');             valid = false; }
    if (!pinCoords) { setLocError('Please pin your location on the map or use GPS'); valid = false; }
    if (pinCoords && !stateVal.trim()) { setJxError('State is required — fill it in below the map'); valid = false; }
    if (pinCoords && !lgaVal.trim())   { setJxError('LGA is required — fill it in below the map');   valid = false; }
    if (!valid) return;

    submitReport(
      {
        category,
        description,
        locationAddress: displayName || `${pinCoords.lat.toFixed(5)}, ${pinCoords.lng.toFixed(5)}`,
        coordinates:     `${pinCoords.lat},${pinCoords.lng}`,
        jurisdiction: {
          country: 'NG',
          state:   stateVal.trim(),
          lga:     lgaVal.trim(),
        },
      },
      { onSuccess: () => setTimeout(() => navigate('/security/my-reports'), 2200) }
    );
  }, [category, description, pinCoords, displayName, stateVal, lgaVal, submitReport, navigate]);

  const handleLeftToggle  = useCallback(() => setLeftSidebarOpen((v)  => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose   = useCallback(() => setLeftSidebarOpen(false),  []);
  const handleRightClose  = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <SecurityHeader
      leftSidebarToggle={handleLeftToggle}
      rightSidebarToggle={handleRightToggle}
      title="Report Incident"
      subtitle="Help keep your community safe"
      showReportBtn={false}
    />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar  = useMemo(() => <SocDashboardSidebarLeft />,  []);
  const rightSidebar = useMemo(() => <SocDashboardSidebarRight />, []);

  /* ── success screen ─────────────────────────────────────────────────────── */
  if (isSuccess) {
    return (
      <Root header={header} content={(
        <div className="flex-auto" style={{ background: '#0f172a', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(24px,4vw,52px)' }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', maxWidth: 480 }}>
            <motion.div animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 0.65 }}>
              <div style={{ width: 'clamp(80px,12vw,100px)', height: 'clamp(80px,12vw,100px)', borderRadius: '50%', background: 'linear-gradient(135deg,#dc2626,#991b1b)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto clamp(22px,3vw,34px)', boxShadow: '0 16px 40px rgba(220,38,38,0.45)' }}>
                <CheckCircle style={{ color: 'white', fontSize: 'clamp(2.2rem,4.5vw,3.2rem)' }} />
              </div>
            </motion.div>
            <div style={{ fontWeight: 900, fontSize: F.sectionH, color: 'white', marginBottom: 16, lineHeight: 1.1 }}>Report Submitted</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: F.body, lineHeight: 1.8 }}>
              Our security team has been notified. Stay safe and move to a secure location.
            </div>
          </motion.div>
        </div>
      )}
        leftSidebarOpen={leftSidebarOpen}   leftSidebarOnClose={handleLeftClose}   leftSidebarContent={leftSidebar}
        rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
        scroll="content" />
    );
  }

  /* ── main form ──────────────────────────────────────────────────────────── */
  return (
    <Root
      header={header}
      content={(
        <div className="flex-auto" style={{ background: '#0f172a', minHeight: '100%', padding: 'clamp(20px,4vw,48px)', overflowY: 'auto' }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>

            {/* Back */}
            <Button startIcon={<ArrowBack style={{ fontSize: 'clamp(16px,2vw,20px)' }} />} onClick={() => navigate(-1)}
              style={{ fontSize: F.body }}
              sx={{ color: 'rgba(255,255,255,0.52)', mb: 2.5, textTransform: 'none', '&:hover': { color: 'white' } }}>
              Back
            </Button>

            {/* Page header */}
            <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px,2vw,18px)', marginBottom: 'clamp(20px,3vw,32px)' }}>
              <div style={{ width: 'clamp(48px,7vw,66px)', height: 'clamp(48px,7vw,66px)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#dc2626,#991b1b)', boxShadow: '0 12px 32px rgba(220,38,38,0.44)', flexShrink: 0 }}>
                <Shield style={{ color: 'white', fontSize: 'clamp(1.6rem,3.2vw,2.2rem)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: F.sectionH, color: 'white', lineHeight: 1.1 }}>Report Incident</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: F.body, marginTop: 4 }}>Fast. Anonymous. Help is notified immediately.</div>
              </div>
            </motion.div>

            {/* Emergency banner */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              style={{ marginBottom: 'clamp(20px,3vw,30px)', padding: 'clamp(12px,1.8vw,18px)', borderRadius: 16, background: 'rgba(220,38,38,0.15)', border: '1.5px solid rgba(220,38,38,0.35)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 'clamp(1.4rem,2.5vw,2rem)', flexShrink: 0 }}>🚨</span>
              <div style={{ fontSize: F.body, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65 }}>
                <strong style={{ color: '#f87171' }}>If life is in immediate danger, call 112 or 199 first.</strong>{' '}
                Only submit this report once you are in a safe location.
              </div>
            </motion.div>

            {/* ── SECTION 1: Incident type ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={{ background: 'rgba(255,255,255,0.045)', borderRadius: 'clamp(16px,2vw,22px)', padding: 'clamp(18px,3vw,30px)', border: '1px solid rgba(255,255,255,0.09)', marginBottom: 'clamp(18px,2.5vw,26px)' }}>
              <div style={{ fontWeight: 800, fontSize: F.subH, color: 'white', marginBottom: 'clamp(12px,1.8vw,20px)' }}>
                What is happening? <span style={{ color: '#f87171', fontSize: F.meta }}>*</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(100px,12vw,130px), 1fr))', gap: 'clamp(8px,1.2vw,12px)' }}>
                {REPORT_CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => { setCategory(cat.id); setCatError(''); }}
                    style={{
                      padding: 'clamp(12px,1.8vw,18px) clamp(8px,1.2vw,12px)', borderRadius: 14,
                      border: `2px solid ${category === cat.id ? cat.color : 'rgba(255,255,255,0.1)'}`,
                      backgroundColor: category === cat.id ? cat.bg : 'rgba(255,255,255,0.03)',
                      color: category === cat.id ? cat.color : 'rgba(255,255,255,0.68)',
                      cursor: 'pointer', fontWeight: 700, fontSize: F.body,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(6px,0.8vw,10px)',
                      transition: 'all 0.18s',
                      transform: category === cat.id ? 'scale(1.04)' : 'scale(1)',
                      boxShadow: category === cat.id ? `0 4px 18px ${cat.color}44` : 'none',
                    }}>
                    <span style={{ fontSize: 'clamp(1.6rem,2.6vw,2.2rem)', lineHeight: 1 }}>{cat.icon}</span>
                    <span style={{ textAlign: 'center', lineHeight: 1.2, fontSize: 'clamp(1rem,1.5vw,1.3rem)' }}>{cat.label}</span>
                  </button>
                ))}
              </div>
              {catError && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ color: '#f87171', fontSize: F.meta, marginTop: 10, fontWeight: 600 }}>
                  ⚠ {catError}
                </motion.div>
              )}
            </motion.div>

            {/* ── SECTION 2: Location ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
              style={{ background: 'rgba(255,255,255,0.045)', borderRadius: 'clamp(16px,2vw,22px)', padding: 'clamp(18px,3vw,30px)', border: '1px solid rgba(255,255,255,0.09)', marginBottom: 'clamp(18px,2.5vw,26px)' }}>
              <div style={{ fontWeight: 800, fontSize: F.subH, color: 'white', marginBottom: 'clamp(10px,1.6vw,18px)' }}>
                Where is this? <span style={{ color: '#f87171', fontSize: F.meta }}>*</span>
              </div>

              {/* GPS button */}
              <Button variant="contained"
                startIcon={geoLoading
                  ? <CircularProgress size={18} color="inherit" />
                  : <MyLocation style={{ fontSize: 'clamp(16px,2vw,20px)' }} />}
                disabled={geoLoading}
                onClick={handleBrowserLocation}
                fullWidth
                sx={{
                  mb: 'clamp(12px,1.8vw,18px)',
                  background: pinCoords ? 'rgba(34,197,94,0.2)' : 'rgba(220,38,38,0.2)',
                  color: pinCoords ? '#4ade80' : 'rgba(255,255,255,0.88)',
                  fontWeight: 700, borderRadius: '14px', textTransform: 'none', fontSize: F.btn,
                  border: `1.5px solid ${pinCoords ? 'rgba(74,222,128,0.4)' : 'rgba(220,38,38,0.3)'}`,
                  py: 1.5,
                  '&:hover': { background: 'rgba(220,38,38,0.3)', color: 'white' },
                  '&:disabled': { color: 'rgba(255,255,255,0.4)' },
                }}>
                {geoLoading
                  ? 'Detecting location & resolving address…'
                  : pinCoords
                    ? '✓ Location pinned — tap map or drag marker to adjust'
                    : 'Use My Location (GPS)'}
              </Button>

              {geoError && (
                <div style={{ fontSize: F.meta, color: '#fbbf24', marginBottom: 12, lineHeight: 1.5, padding: 'clamp(8px,1.2vw,12px)', background: 'rgba(251,191,36,0.1)', borderRadius: 10, border: '1px solid rgba(251,191,36,0.3)' }}>
                  📍 {geoError}
                </div>
              )}

              {/* GPS accuracy detail panel */}
              <AnimatePresence>
                {geoAccuracy !== null && !geoLoading && (
                  <motion.div
                    key="accuracy-panel"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    style={{
                      marginBottom: 'clamp(10px,1.4vw,14px)',
                      borderRadius: 12,
                      background: 'rgba(0,0,0,0.4)',
                      border: `1.5px solid ${geoAccuracy > 1000 ? 'rgba(248,113,113,0.4)' : geoAccuracy > 100 ? 'rgba(251,191,36,0.35)' : 'rgba(74,222,128,0.35)'}`,
                      overflow: 'hidden',
                    }}>
                    {/* header bar */}
                    <div style={{
                      padding: 'clamp(6px,0.9vw,9px) clamp(12px,1.8vw,16px)',
                      background: 'rgba(255,255,255,0.04)',
                      borderBottom: '1px solid rgba(255,255,255,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                        GPS Fix
                      </span>
                      <span style={{
                        fontSize: 'clamp(1rem,1.4vw,1.2rem)',
                        fontWeight: 700,
                        padding: '2px 10px',
                        borderRadius: 20,
                        background: geoAccuracy > 1000 ? 'rgba(248,113,113,0.18)' : geoAccuracy > 100 ? 'rgba(251,191,36,0.18)' : 'rgba(74,222,128,0.18)',
                        color: geoAccuracy > 1000 ? '#f87171' : geoAccuracy > 100 ? '#fbbf24' : '#4ade80',
                        letterSpacing: '0.04em',
                      }}>
                        {geoAccuracy > 1000 ? '● poor' : geoAccuracy > 100 ? '● fair' : '● good'}
                      </span>
                    </div>

                    {/* data rows */}
                    <div style={{ padding: 'clamp(8px,1.2vw,12px) clamp(12px,1.8vw,16px)' }}>
                      {[
                        { label: 'latitude',  value: pinCoords ? pinCoords.lat.toFixed(6) : '—' },
                        { label: 'longitude', value: pinCoords ? pinCoords.lng.toFixed(6) : '—' },
                        { label: 'accuracy',  value: `±${Math.round(geoAccuracy)} m`, accent: true },
                        { label: 'source',    value: geoSource },
                      ].map(({ label, value, accent }, i, arr) => (
                        <div key={label} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: 'clamp(4px,0.6vw,6px) 0',
                          borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                        }}>
                          <span style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                            {label}
                          </span>
                          <span style={{
                            fontSize: F.meta, fontFamily: 'monospace', fontWeight: 700,
                            color: accent
                              ? (geoAccuracy > 1000 ? '#f87171' : geoAccuracy > 100 ? '#fbbf24' : '#4ade80')
                              : 'rgba(255,255,255,0.78)',
                          }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* warning when accuracy too low */}
                    {geoAccuracy > 1000 && (
                      <div style={{
                        margin: '0 clamp(12px,1.8vw,16px) clamp(10px,1.4vw,12px)',
                        padding: 'clamp(8px,1.1vw,11px) clamp(10px,1.4vw,13px)',
                        borderRadius: 10,
                        background: 'rgba(248,113,113,0.1)',
                        border: '1px solid rgba(248,113,113,0.3)',
                        fontSize: F.meta, color: '#f87171', lineHeight: 1.55,
                      }}>
                        ⚠ GPS accuracy is too low (±{Math.round(geoAccuracy)} m). Move to an open area and retry, or tap the map to pin the location manually.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>
                Or tap anywhere on the map to drop a pin at the exact location:
              </div>

              {/* Leaflet map */}
              <div style={{ borderRadius: 16, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.1)' }}>
                <LocationPickerMap pinCoords={pinCoords} onPick={handleMapPick} />
              </div>

              {/* Resolved address */}
              <AnimatePresence>
                {(geoLoading || displayName) && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginTop: 12, padding: 'clamp(10px,1.4vw,14px)', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    {geoLoading
                      ? <><CircularProgress size={16} sx={{ color: '#f87171', mt: '2px', flexShrink: 0 }} /><span style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.6)' }}>Resolving address…</span></>
                      : <><LocationOn style={{ color: '#f87171', fontSize: 'clamp(16px,2vw,20px)', flexShrink: 0, mt: '1px' }} /><span style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.82)', lineHeight: 1.55 }}>{displayName}</span></>
                    }
                  </motion.div>
                )}
              </AnimatePresence>

              {locError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ color: '#f87171', fontSize: F.meta, marginTop: 8, fontWeight: 600 }}>
                  ⚠ {locError}
                </motion.div>
              )}

              {/* ── State & LGA — auto-filled from Nominatim, editable ── */}
              <AnimatePresence>
                {pinCoords && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginTop: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Edit style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(14px,1.8vw,17px)' }} />
                      <span style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.5)' }}>
                        State &amp; LGA auto-filled — correct if needed:
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <TextField
                        label="State *"
                        value={stateVal}
                        onChange={(e) => { setStateVal(e.target.value); setJxError(''); }}
                        placeholder="e.g. Lagos State"
                        sx={INPUT_SX}
                        size="small"
                      />
                      <TextField
                        label="LGA *"
                        value={lgaVal}
                        onChange={(e) => { setLgaVal(e.target.value); setJxError(''); }}
                        placeholder="e.g. Eti-Osa"
                        sx={INPUT_SX}
                        size="small"
                      />
                    </div>
                    {jxError && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ color: '#f87171', fontSize: F.meta, marginTop: 8, fontWeight: 600 }}>
                        ⚠ {jxError}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── SECTION 3: Notes ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ background: 'rgba(255,255,255,0.045)', borderRadius: 'clamp(16px,2vw,22px)', padding: 'clamp(18px,3vw,30px)', border: '1px solid rgba(255,255,255,0.09)', marginBottom: 'clamp(18px,2.5vw,26px)' }}>
              <div style={{ fontWeight: 800, fontSize: F.subH, color: 'white', marginBottom: 'clamp(10px,1.6vw,18px)' }}>
                Additional details{' '}
                <span style={{ fontSize: F.meta, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>(optional)</span>
              </div>
              <TextField
                fullWidth multiline rows={3}
                placeholder="E.g. number of people involved, suspect description, vehicle colour..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={INPUT_SX}
                inputProps={{ maxLength: 300 }}
              />
              <div style={{ textAlign: 'right', fontSize: F.meta, color: 'rgba(255,255,255,0.28)', marginTop: 6 }}>
                {description.length} / 300
              </div>
            </motion.div>

            {/* ── Submit ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
              <Button fullWidth variant="contained" size="large"
                disabled={isLoading || (geoAccuracy !== null && geoAccuracy > 1000)}
                onClick={handleSubmit}
                endIcon={isLoading ? <CircularProgress size={22} color="inherit" /> : <Send style={{ fontSize: 'clamp(16px,2vw,20px)' }} />}
                sx={{
                  background: 'linear-gradient(135deg,#dc2626,#991b1b)', color: 'white',
                  fontWeight: 900, borderRadius: '16px', textTransform: 'none',
                  py: 'clamp(14px,2vw,18px)', fontSize: F.btn,
                  boxShadow: '0 10px 32px rgba(220,38,38,0.5)',
                  '&:hover': { background: 'linear-gradient(135deg,#b91c1c,#7f1d1d)', transform: 'translateY(-2px)', boxShadow: '0 14px 40px rgba(220,38,38,0.6)' },
                  '&:disabled': { background: '#374151', color: '#6b7280', boxShadow: 'none' },
                  transition: 'all 0.2s',
                }}>
                {isLoading ? 'Submitting report…' : '🚨 Report Incident Now'}
              </Button>
              <div style={{ textAlign: 'center', fontSize: F.meta, color: 'rgba(255,255,255,0.3)', marginTop: 12 }}>
                Your identity is not shared publicly. Required: type + location + state + LGA.
              </div>
            </motion.div>

          </div>
        </div>
      )}
      leftSidebarOpen={leftSidebarOpen}   leftSidebarOnClose={handleLeftClose}   leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content"
    />
  );
}

const MemoizedPage = memo(ActiveReportIncidentPage);
export default function ReportIncidentPage() { return <MemoizedPage />; }
