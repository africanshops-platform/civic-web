import { memo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const NIGERIA_CENTER = [9.082, 8.6753];

function FitToLocations({ locations }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      if (locations.length === 1) map.setView([locations[0].latitude, locations[0].longitude], 14);
      else if (locations.length > 1) map.fitBounds(locations.map((l) => [l.latitude, l.longitude]), { padding: [28, 28], maxZoom: 15 });
    }, 100);
    return () => clearTimeout(t);
  }, [map, locations]);
  return null;
}

const time = (v) => (v ? new Date(v).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' }) : null);

/**
 * Where a community vote is conducted: one marker per voting location the election's admins created, at the coordinates
 * they entered. Every location is also listed under the map, so the map is never the only way to find one.
 */
function VotingLocationsMap({ locations = [], onlineOnly = false }) {
  if (!locations.length) {
    return (
      <div style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6 }}>
        {onlineOnly ? 'This community vote is held online, so there are no voting locations to visit.' : 'No voting locations have been added for this community vote yet.'}
      </div>
    );
  }
  return (
    <div>
      <div style={{ height: 260, borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <MapContainer center={NIGERIA_CENTER} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri" />
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}" />
          <FitToLocations locations={locations} />
          {locations.map((l) => (
            <CircleMarker key={l.id} center={[l.latitude, l.longitude]} radius={11} pathOptions={{ color: '#1d4ed8', fillColor: '#3b82f6', fillOpacity: 0.55, weight: 2 }}>
              <Popup>
                <strong>{l.name}</strong>
                {l.address && <div style={{ fontSize: 12, color: '#6b7280' }}>{l.address}</div>}
                {(l.opensAt || l.closesAt) && <div style={{ fontSize: 12 }}>{time(l.opensAt) ?? ''}{l.opensAt && l.closesAt ? ' to ' : ''}{time(l.closesAt) ?? ''}</div>}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {locations.map((l) => (
          <div key={`row-${l.id}`} style={{ fontSize: '0.88rem', color: '#374151' }}>
            <strong>{l.name}</strong>{l.ward ? ` · ${l.ward}` : ''}
            {l.address && <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{l.address}</div>}
            {(l.opensAt || l.closesAt) && <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>Open {time(l.opensAt) ?? ''}{l.opensAt && l.closesAt ? ' to ' : ''}{time(l.closesAt) ?? ''}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(VotingLocationsMap);
