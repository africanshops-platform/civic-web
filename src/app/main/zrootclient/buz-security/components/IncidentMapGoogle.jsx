import { memo, useState, useCallback, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { SEVERITY_CONFIG, INCIDENT_CATEGORIES, STATUS_CONFIG } from '../mock';

const NIGERIA_CENTER = { lat: 9.082, lng: 8.6753 };
// Google provides DEMO_MAP_ID for development — replace with your real Map ID in production
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

/*
 * FitBoundsToIncidents — inside <Map> so useMap() works.
 * Adjusts camera to show all plotted markers whenever the visible set changes.
 * Uses incident IDs as a stable key to avoid re-fitting on every render.
 */
function FitBoundsToIncidents({ incidents, defaultCenter, defaultZoom }) {
  const map = useMap();
  const incidentKey = incidents.map((i) => i.id).sort().join(',');

  useEffect(() => {
    if (!map) return;
    if (!incidents.length) {
      map.setCenter(defaultCenter);
      map.setZoom(defaultZoom);
      return;
    }
    if (incidents.length === 1) {
      map.panTo({ lat: incidents[0].location.lat, lng: incidents[0].location.lng });
      map.setZoom(13);
      return;
    }
    const bounds = new window.google.maps.LatLngBounds();
    incidents.forEach((i) => bounds.extend({ lat: i.location.lat, lng: i.location.lng }));
    map.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
  // incidentKey is the stable dep — incidents array ref changes every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, incidentKey]);

  return null;
}

function SeverityDot({ sev, isSelected, status }) {
  const size = isSelected ? sev.size * 2 + 8 : sev.size * 2;
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: sev.color,
      opacity: status === 'resolved' ? 0.4 : 0.9,
      border: `2px solid ${isSelected ? '#ea580c' : 'rgba(255,255,255,0.7)'}`,
      boxShadow: isSelected
        ? `0 0 0 4px ${sev.color}55, 0 2px 8px rgba(0,0,0,0.4)`
        : '0 1px 5px rgba(0,0,0,0.35)',
      cursor: 'pointer',
      transition: 'all 0.18s',
    }} />
  );
}

function IncidentMapGoogle({
  incidents = [],
  center = NIGERIA_CENTER,
  zoom = 6,
  dark = false,
  onIncidentClick,
  publicView = false,
  height = 480,
}) {
  const [selectedId, setSelectedId] = useState(null);

  const handleMarkerClick = useCallback((incident) => {
    setSelectedId(incident.id);
    onIncidentClick?.(incident);
  }, [onIncidentClick]);

  const visibleIncidents = (publicView
    ? incidents.filter((i) => i.severity === 'low' || i.severity === 'medium')
    : incidents
  ).filter((i) => i.location?.lat != null && i.location?.lng != null);

  const selectedIncident = visibleIncidents.find((i) => i.id === selectedId) ?? null;

  // Accept both [lat, lng] array (Leaflet style) and {lat, lng} object
  const mapCenter = Array.isArray(center)
    ? { lat: center[0], lng: center[1] }
    : center;

  const wrapStyle = height === '100%'
    ? { position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden' }
    : { height, width: '100%', borderRadius: 16, overflow: 'hidden', position: 'relative' };

  return (
    <div style={wrapStyle}>
      <APIProvider apiKey={import.meta.env.VITE_MAP_KEY}>
        <Map
          defaultCenter={mapCenter}
          defaultZoom={zoom}
          mapId={MAP_ID}
          colorScheme={dark ? 'DARK' : 'LIGHT'}
          style={{ width: '100%', height: '100%' }}
          gestureHandling="greedy"
          disableDefaultUI={false}
          onClick={() => setSelectedId(null)}
        >
          <FitBoundsToIncidents
            incidents={visibleIncidents}
            defaultCenter={mapCenter}
            defaultZoom={zoom}
          />

          {visibleIncidents.map((incident) => {
            const sev = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.low;
            return (
              <AdvancedMarker
                key={incident.id}
                position={{ lat: incident.location.lat, lng: incident.location.lng }}
                onClick={() => handleMarkerClick(incident)}
                zIndex={selectedId === incident.id ? 10 : 1}
              >
                <SeverityDot sev={sev} isSelected={selectedId === incident.id} status={incident.status} />
              </AdvancedMarker>
            );
          })}

          {selectedIncident && (() => {
            const sev = SEVERITY_CONFIG[selectedIncident.severity] || SEVERITY_CONFIG.low;
            const catInfo = INCIDENT_CATEGORIES.find((c) => c.id === selectedIncident.category);
            const statusInfo = STATUS_CONFIG[selectedIncident.status] || STATUS_CONFIG.reported;
            return (
              <InfoWindow
                position={{ lat: selectedIncident.location.lat, lng: selectedIncident.location.lng }}
                onCloseClick={() => setSelectedId(null)}
                pixelOffset={[0, -(sev.size + 6)]}
                maxWidth={280}
              >
                <div style={{ fontFamily: 'inherit', padding: '4px 0', minWidth: 200 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '1.1rem' }}>{catInfo?.icon || '⚠️'}</span>
                    <span style={{
                      backgroundColor: statusInfo.bg, color: statusInfo.color,
                      fontWeight: 700, fontSize: '0.72rem', padding: '2px 10px', borderRadius: 999,
                    }}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1f2937', marginBottom: 4 }}>
                    {catInfo?.label || selectedIncident.category}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 6, lineHeight: 1.5 }}>
                    📍 {selectedIncident.location.address}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 8 }}>
                    {selectedIncident.reportedAt
                      ? new Date(selectedIncident.reportedAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                    {' · '}
                    <span style={{ color: sev.color, fontWeight: 700 }}>{sev.label} severity</span>
                  </div>
                  {(selectedIncident.description ?? '') && (
                    <div style={{ fontSize: '0.78rem', color: '#4b5563', lineHeight: 1.5, borderTop: '1px solid #f3f4f6', paddingTop: 8 }}>
                      {(selectedIncident.description ?? '').slice(0, 120)}
                      {(selectedIncident.description ?? '').length > 120 ? '...' : ''}
                    </div>
                  )}
                  {publicView && (
                    <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 8, backgroundColor: '#fff7ed', fontSize: '0.72rem', color: '#ea580c', fontWeight: 600 }}>
                      🔒 Sign in to view full details or report a nearby incident
                    </div>
                  )}
                </div>
              </InfoWindow>
            );
          })()}
        </Map>

        {/* Severity legend — same style as Leaflet version */}
        <div style={{
          position: 'absolute', bottom: 28, left: 12, zIndex: 1000,
          background: dark ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)', borderRadius: 12, padding: '10px 14px',
          border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: dark ? 'rgba(255,255,255,0.5)' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Severity
          </div>
          {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: cfg.size, height: cfg.size, borderRadius: '50%', backgroundColor: cfg.color, flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.4)' }} />
              <span style={{ fontSize: '0.72rem', color: dark ? 'rgba(255,255,255,0.8)' : '#374151', fontWeight: 600 }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </APIProvider>
    </div>
  );
}

export default memo(IncidentMapGoogle);
