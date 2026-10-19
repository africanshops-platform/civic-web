import { memo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { levelInfo } from '../constants';

const NIGERIA_CENTER = [9.082, 8.6753];
const hasPoint = (s) => s.latitude != null && s.longitude != null;

function Fit({ points }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      if (points.length === 1) map.setView(points[0], 14);
      else if (points.length > 1) map.fitBounds(points, { padding: [28, 28], maxZoom: 15 });
    }, 100);
    return () => clearTimeout(t);
  }, [map, points]);
  return null;
}

/** Schools at the coordinates they registered. A school with no coordinates is not drawn (it is still in the list). `origin` is where a distance search started. */
function SchoolMap({ schools = [], origin = null, height = 300 }) {
  const drawn = schools.filter(hasPoint);
  const points = drawn.map((s) => [s.latitude, s.longitude]);
  if (origin) points.push([origin.lat, origin.lng]);
  const missing = schools.length - drawn.length;
  if (!drawn.length) return <div style={{ color: '#6b7280', fontSize: '1.5rem', lineHeight: 1.6 }}>No school here has a map location yet.</div>;

  return (
    <div>
      <div style={{ height, borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <MapContainer center={NIGERIA_CENTER} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri" />
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}" />
          <Fit points={points} />
          {origin && <CircleMarker center={[origin.lat, origin.lng]} radius={9} pathOptions={{ color: '#b45309', fillColor: '#f59e0b', fillOpacity: 0.7, weight: 2 }}><Popup>You are here</Popup></CircleMarker>}
          {drawn.map((s) => (
            <CircleMarker key={s.id} center={[s.latitude, s.longitude]} radius={10} pathOptions={{ color: '#4338ca', fillColor: '#6366f1', fillOpacity: 0.6, weight: 2 }}>
              <Popup>
                <strong>{s.name}</strong>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{levelInfo(s.level).label}{s.distanceKm != null ? ` · ${s.distanceKm} km` : ''}</div>
                <Link to={`/education/school/${s.id}`}>View</Link>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: '1.4rem', color: '#374151' }}>
        {origin && <span><span style={{ color: '#f59e0b' }}>●</span> You</span>}
        <span><span style={{ color: '#6366f1' }}>●</span> Schools</span>
      </div>
      {missing > 0 && <div style={{ marginTop: 6, fontSize: '1.3rem', color: '#9ca3af' }}>{missing} {missing === 1 ? 'school has' : 'schools have'} no map location and {missing === 1 ? 'is' : 'are'} only in the list.</div>}
    </div>
  );
}

export default memo(SchoolMap);
