import { memo, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const LGA_COORDS = {
  'eti-osa': [6.4300, 3.5440],
  'ikeja': [6.5958, 3.3397],
  'agege': [6.6166, 3.3197],
  'lagos-island': [6.4531, 3.3958],
  'alimosho': [6.6059, 3.2571],
  'surulere': [6.4969, 3.3536],
};

function getLeadingColor(lgaData) {
  const partyColors = {
    APC: '#16a34a',
    PDP: '#dc2626',
    LP: '#d97706',
    NNPP: '#7c3aed',
    APGA: '#0f766e',
  };
  return partyColors[lgaData?.leadingParty] || '#6b7280';
}

function JurisdictionResultsMap({ lgaBreakdown = [], center = [6.5244, 3.3792], zoom = 10, isLoading }) {
  const markers = useMemo(() => {
    return lgaBreakdown.map((lga) => ({
      ...lga,
      coords: LGA_COORDS[lga.lgaId] || center,
      color: getLeadingColor(lga),
      radius: 18 + Math.min(lga.wardsCollated * 1.2, 24),
    }));
  }, [lgaBreakdown, center]);

  if (isLoading) {
    return (
      <div
        data-testid="jurisdiction-map-skeleton"
        style={{ height: 340, borderRadius: 16, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 600 }}>Loading map...</span>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', height: 340, border: '1px solid #e5e7eb' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((lga) => (
          <CircleMarker
            key={lga.lgaId}
            center={lga.coords}
            radius={lga.radius}
            pathOptions={{
              fillColor: lga.color,
              fillOpacity: 0.75,
              color: 'white',
              weight: 2,
            }}
          >
            <Tooltip permanent direction="center" className="leaflet-label" offset={[0, 0]}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'white' }}>{lga.leadingParty}</span>
            </Tooltip>
            <Popup>
              <div style={{ minWidth: 160 }}>
                <strong style={{ fontSize: '0.92rem' }}>{lga.lgaName}</strong>
                <div style={{ fontSize: '0.8rem', color: '#374151', marginTop: 4 }}>
                  Leading: <strong style={{ color: lga.color }}>{lga.leadingCandidate}</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 2 }}>
                  {lga.wardsCollated} / {lga.wardsTotal} wards collated
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default memo(JurisdictionResultsMap);
