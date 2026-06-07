import { memo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Typography, Chip, Button } from '@mui/material';
import { SEVERITY_CONFIG, INCIDENT_CATEGORIES, STATUS_CONFIG } from '../mock';

const NIGERIA_CENTER = [9.082, 8.6753];
const TILES = {
  standard: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' },
  dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' },
};

function PulseLayer({ incidents }) {
  return incidents
    .filter((i) => i.severity === 'critical' && i.status !== 'resolved')
    .map((i) => (
      <CircleMarker
        key={`pulse-${i.id}`}
        center={[i.location.lat, i.location.lng]}
        radius={20}
        pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.12, weight: 1.5, dashArray: '4 4' }}
      />
    ));
}

function IncidentMap({
  incidents = [],
  center = NIGERIA_CENTER,
  zoom = 6,
  dark = false,
  onIncidentClick,
  publicView = false,
  height = 480,
}) {
  const [selectedId, setSelectedId] = useState(null);

  const handleClick = useCallback((incident) => {
    setSelectedId(incident.id);
    onIncidentClick?.(incident);
  }, [onIncidentClick]);

  const visibleIncidents = publicView
    ? incidents.filter((i) => i.severity === 'low' || i.severity === 'medium')
    : incidents;

  const tile = dark ? TILES.dark : TILES.standard;

  return (
    <div style={{ height, width: '100%', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer url={tile.url} attribution={tile.attribution} />

        {/* Pulse rings for critical */}
        <PulseLayer incidents={visibleIncidents} />

        {visibleIncidents.map((incident) => {
          const sev = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.low;
          const isSelected = selectedId === incident.id;
          const catInfo = INCIDENT_CATEGORIES.find((c) => c.id === incident.category);
          const statusInfo = STATUS_CONFIG[incident.status] || STATUS_CONFIG.active;

          return (
            <CircleMarker
              key={incident.id}
              center={[incident.location.lat, incident.location.lng]}
              radius={isSelected ? sev.size + 4 : sev.size}
              pathOptions={{
                color: isSelected ? '#ea580c' : sev.color,
                fillColor: sev.color,
                fillOpacity: incident.status === 'resolved' ? 0.4 : 0.88,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{ click: () => handleClick(incident) }}
            >
              <Popup maxWidth={280} minWidth={220}>
                <div style={{ fontFamily: 'inherit', padding: '4px 0' }}>
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
                    {catInfo?.label || incident.category}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 6, lineHeight: 1.5 }}>
                    📍 {incident.location.address}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 8 }}>
                    {new Date(incident.reportedAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                    {' · '}
                    <span style={{ color: sev.color, fontWeight: 700 }}>
                      {sev.label} severity
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#4b5563', lineHeight: 1.5, borderTop: '1px solid #f3f4f6', paddingTop: 8 }}>
                    {incident.description.slice(0, 120)}{incident.description.length > 120 ? '...' : ''}
                  </div>
                  {publicView && (
                    <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 8, backgroundColor: '#fff7ed', fontSize: '0.72rem', color: '#ea580c', fontWeight: 600 }}>
                      🔒 Sign in to view full details or report a nearby incident
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend overlay */}
      <div style={{
        position: 'absolute', bottom: 20, left: 12, zIndex: 1000,
        background: dark ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        borderRadius: 12, padding: '10px 14px',
        border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
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
    </div>
  );
}

export default memo(IncidentMap);
