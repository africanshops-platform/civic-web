import { memo, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { nearestLocation } from '../hooks/electionArea';

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
 *
 * `inMyArea` is true / false for a signed-in citizen whose area is known, and null otherwise. "Nearest to me" asks the browser
 * for the position once, only to measure the distance on this screen; it is never stored or sent anywhere.
 */
function VotingLocationsMap({ locations = [], onlineOnly = false, inMyArea = null }) {
  const [nearest, setNearest] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');

  const findNearest = () => {
    if (!navigator.geolocation) { setLocateError('Your browser cannot share your location.'); return; }
    setLocating(true);
    setLocateError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setNearest(nearestLocation(locations, { latitude: pos.coords.latitude, longitude: pos.coords.longitude })); setLocating(false); },
      () => { setLocateError('We could not get your location. You can still pick a place from the list.'); setLocating(false); },
      { timeout: 10000 },
    );
  };

  // The nearest location is listed first.
  const ordered = useMemo(() => {
    if (!nearest) return locations;
    return [nearest.location, ...locations.filter((l) => l.id !== nearest.location.id)];
  }, [locations, nearest]);

  if (!locations.length) {
    return (
      <div style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6 }}>
        {onlineOnly ? 'This community vote is held online, so there are no voting locations to visit.' : 'No voting locations have been added for this community vote yet.'}
      </div>
    );
  }
  const isNearest = (l) => nearest?.location.id === l.id;
  return (
    <div>
      {inMyArea !== null && (
        <div style={{ marginBottom: 10, fontSize: '0.85rem', fontWeight: 700, color: inMyArea ? '#047857' : '#92400e' }}>
          {inMyArea ? 'This vote is in your area.' : 'This vote is outside your area, so you cannot vote in it. You can still see where it is held.'}
        </div>
      )}
      <div style={{ height: 260, borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <MapContainer center={NIGERIA_CENTER} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri" />
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}" />
          <FitToLocations locations={locations} />
          {locations.map((l) => (
            <CircleMarker key={l.id} center={[l.latitude, l.longitude]} radius={isNearest(l) ? 15 : 11}
              pathOptions={isNearest(l) ? { color: '#b45309', fillColor: '#f59e0b', fillOpacity: 0.8, weight: 3 } : { color: '#1d4ed8', fillColor: '#3b82f6', fillOpacity: 0.55, weight: 2 }}>
              <Popup>
                <strong>{l.name}</strong>
                {isNearest(l) && <div style={{ fontSize: 12, color: '#b45309', fontWeight: 700 }}>Nearest to you, {nearest.km.toFixed(1)} km</div>}
                {l.address && <div style={{ fontSize: 12, color: '#6b7280' }}>{l.address}</div>}
                {(l.opensAt || l.closesAt) && <div style={{ fontSize: 12 }}>{time(l.opensAt) ?? ''}{l.opensAt && l.closesAt ? ' to ' : ''}{time(l.closesAt) ?? ''}</div>}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" onClick={findNearest} disabled={locating}
          style={{ border: '1px solid #1d4ed8', color: '#1d4ed8', background: 'white', borderRadius: 12, padding: '6px 14px', fontWeight: 700, cursor: 'pointer' }}>
          {locating ? 'Finding...' : 'Find the one nearest to me'}
        </button>
        {locateError && <span style={{ fontSize: 12, color: '#b91c1c' }}>{locateError}</span>}
      </div>
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ordered.map((l) => (
          <div key={`row-${l.id}`} style={{ fontSize: '0.88rem', color: '#374151', padding: isNearest(l) ? '8px 10px' : 0, borderRadius: 10, background: isNearest(l) ? '#fffbeb' : 'transparent', border: isNearest(l) ? '1px solid #fcd34d' : 'none' }}>
            {isNearest(l) && <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309' }}>NEAREST TO YOU · {nearest.km.toFixed(1)} km</div>}
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
